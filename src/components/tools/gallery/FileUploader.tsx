import { useState, useCallback } from 'react';
import { Upload, Image, FileAudio, File, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileUploaderProps {
  onUpload: (file: { 
    fileName: string; 
    fileSize: number; 
    mimeType: string; 
    dataUrl: string;
    mediaType: 'image' | 'audio' | 'file';
  }) => void;
  maxSizeMB?: number;
}

export function FileUploader({ onUpload, maxSizeMB = 2 }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMediaType = (mimeType: string): 'image' | 'audio' | 'file' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onUpload({
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          dataUrl,
          mediaType: getMediaType(selectedFile.type),
        });
        
        // Reset
        setSelectedFile(null);
        setPreview(null);
        setLoading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError('Failed to upload file');
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
  };

  const getFileIcon = () => {
    if (!selectedFile) return File;
    if (selectedFile.type.startsWith('image/')) return Image;
    if (selectedFile.type.startsWith('audio/')) return FileAudio;
    return File;
  };

  const FileIcon = getFileIcon();

  if (selectedFile) {
    return (
      <div className="p-4 space-y-4">
        <div className="relative border border-border rounded-lg p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={clearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {preview ? (
            <div className="aspect-video overflow-hidden rounded-md">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-md bg-muted">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button onClick={handleUpload} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Save to Gallery'
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm text-foreground mb-1">Drag and drop a file here</p>
        <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
        
        <Input
          type="file"
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" asChild>
            <span>Browse Files</span>
          </Button>
        </label>
        
        <p className="text-xs text-muted-foreground mt-4">
          Images, audio, and documents up to {maxSizeMB}MB
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}
    </div>
  );
}
