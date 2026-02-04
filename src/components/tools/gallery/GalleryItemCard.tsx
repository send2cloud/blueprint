import { Link, Image, FileAudio, File, ExternalLink, Play, Star, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Artifact } from '@/lib/storage';

interface GalleryItemCardProps {
  artifact: Artifact;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

interface GalleryItemData {
  itemType: 'media' | 'bookmark';
  // Media fields
  mediaType?: 'image' | 'audio' | 'file';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  dataUrl?: string;
  thumbnail?: string;
  duration?: number;
  // Bookmark fields
  url?: string;
  title?: string;
  description?: string;
  favicon?: string;
}

export function GalleryItemCard({ artifact, onDelete, onToggleFavorite }: GalleryItemCardProps) {
  const data = artifact.data as GalleryItemData | null;
  
  if (!data) return null;

  const handleOpenBookmark = () => {
    if (data.itemType === 'bookmark' && data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (data.itemType === 'bookmark') {
      return (
        <div className="flex items-start gap-3 p-3">
          <div className="p-2 rounded-md bg-muted flex-shrink-0">
            {data.favicon ? (
              <img src={data.favicon} alt="" className="h-5 w-5" onError={(e) => e.currentTarget.style.display = 'none'} />
            ) : (
              <Link className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{data.title || artifact.name}</p>
            {data.url && (
              <p className="text-xs text-muted-foreground truncate">
                {new URL(data.url).hostname}
              </p>
            )}
            {data.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{data.description}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={handleOpenBookmark}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (data.mediaType === 'image' && data.dataUrl) {
      return (
        <div className="aspect-square overflow-hidden">
          <img 
            src={data.dataUrl} 
            alt={artifact.name} 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    if (data.mediaType === 'audio') {
      return (
        <div className="flex items-center gap-3 p-4">
          <div className="p-3 rounded-full bg-primary/10">
            <FileAudio className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{artifact.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDuration(data.duration)} {data.fileSize && `• ${formatFileSize(data.fileSize)}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Play className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    // Generic file
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="p-3 rounded-md bg-muted">
          <File className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{data.fileName || artifact.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(data.fileSize)}
          </p>
        </div>
      </div>
    );
  };

  const getIcon = () => {
    if (data.itemType === 'bookmark') return Link;
    if (data.mediaType === 'image') return Image;
    if (data.mediaType === 'audio') return FileAudio;
    return File;
  };

  const Icon = getIcon();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group relative">
      {/* Favorite and delete buttons overlay */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(artifact.id);
          }}
        >
          <Star className={`h-3.5 w-3.5 ${artifact.favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(artifact.id);
          }}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
