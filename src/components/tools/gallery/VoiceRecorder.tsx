import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = (Date.now() - startTimeRef.current) / 1000;
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        onRecordingComplete(blob, duration);
        setIsProcessing(false);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);

      // Update timer every second
      timerRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Processing recording...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      {isRecording ? (
        <>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
            <Button
              variant="destructive"
              size="lg"
              className="h-16 w-16 rounded-full relative"
              onClick={stopRecording}
            >
              <Square className="h-6 w-6" />
            </Button>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono text-foreground">{formatTime(recordingTime)}</p>
            <p className="text-sm text-muted-foreground">Recording... Click to stop</p>
          </div>
        </>
      ) : (
        <>
          <Button
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full"
            onClick={startRecording}
          >
            <Mic className="h-6 w-6" />
          </Button>
          <p className="text-sm text-muted-foreground">Click to start recording</p>
        </>
      )}
    </div>
  );
}
