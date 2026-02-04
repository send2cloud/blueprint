import { useParams, useNavigate } from 'react-router-dom';
import { Image, Loader2, ExternalLink, Play, Pause, Download } from 'lucide-react';
import { useState, useRef } from 'react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { Button } from '@/components/ui/button';
import { useArtifact } from '@/hooks/useArtifact';

interface GalleryItemData {
  itemType: 'media' | 'bookmark';
  mediaType?: 'image' | 'audio' | 'file';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  dataUrl?: string;
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
  duration?: number;
}

export default function GalleryItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { artifact, loading, saving, rename, toggleFavorite } = useArtifact('gallery', id);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Item not found
      </div>
    );
  }

  const data = artifact.data as GalleryItemData | null;

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (data?.dataUrl) {
      const link = document.createElement('a');
      link.href = data.dataUrl;
      link.download = data.fileName || artifact.name;
      link.click();
    }
  };

  const handleOpenBookmark = () => {
    if (data?.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderContent = () => {
    if (!data) return null;

    if (data.itemType === 'bookmark') {
      return (
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <div className="flex items-start gap-4">
              {data.favicon && (
                <img 
                  src={data.favicon} 
                  alt="" 
                  className="h-12 w-12 rounded-lg object-cover"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">{data.title}</h2>
                <p className="text-sm text-muted-foreground">{data.url}</p>
              </div>
            </div>
            
            {data.description && (
              <p className="text-foreground">{data.description}</p>
            )}
            
            <Button onClick={handleOpenBookmark} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Open Link
            </Button>
          </div>
        </div>
      );
    }

    if (data.mediaType === 'image' && data.dataUrl) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <img 
            src={data.dataUrl} 
            alt={artifact.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (data.mediaType === 'audio' && data.dataUrl) {
      return (
        <div className="max-w-md mx-auto p-6">
          <div className="bg-card rounded-lg border border-border p-8 space-y-6 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-16 w-16 rounded-full"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground">{artifact.name}</h2>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(data.fileSize)}
              </p>
            </div>
            
            <audio
              ref={audioRef}
              src={data.dataUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      );
    }

    // Generic file
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="bg-card rounded-lg border border-border p-8 space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-foreground">{data.fileName || artifact.name}</h2>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(data.fileSize)}
            </p>
          </div>
          
          {data.dataUrl && (
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        title="Gallery"
        icon={Image}
        artifactId={artifact.id}
        artifactName={artifact.name}
        artifactType={artifact.type}
        artifactFavorite={artifact.favorite}
        saving={saving}
        onRename={rename}
        onToggleFavorite={toggleFavorite}
      />
      {renderContent()}
    </div>
  );
}
