import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Share2, Star, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Artifact } from '@/lib/storage';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { ArtifactPreview, getPreviewHeight } from './ArtifactPreview';

interface ArtifactCardProps {
  artifact: Artifact;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onTogglePinned?: (id: string) => void;
}

export function ArtifactCard({ artifact, onDelete, onToggleFavorite, onTogglePinned }: ArtifactCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const toolConfig = TOOL_CONFIG[artifact.type];
  const Icon = toolConfig.icon;
  const previewHeight = getPreviewHeight(artifact);

  const handleClick = () => {
    navigate(`/${artifact.type}/${artifact.id}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/${artifact.type}/${artifact.id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: `Share this link to show your ${toolConfig.typeLabel}.`,
      });
    } catch {
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(artifact.id);
  };

  const handleTogglePinned = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePinned?.(artifact.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(artifact.id);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 overflow-hidden"
      onClick={handleClick}
    >
      {/* Preview thumbnail */}
      <div className={`relative ${previewHeight} overflow-hidden`}>
        <ArtifactPreview artifact={artifact} />
        
        {/* Hover actions overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {onTogglePinned && (
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9"
              onClick={handleTogglePinned}
            >
              <Pin className={`h-4 w-4 ${artifact.pinned ? 'text-foreground' : 'text-muted-foreground'}`} />
            </Button>
          )}
          {onToggleFavorite && (
            <Button
              variant="secondary"
              size="icon"
              className="h-9 w-9"
              onClick={handleToggleFavorite}
            >
              <Star className={`h-4 w-4 ${artifact.favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
            </Button>
          )}
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Favorite indicator */}
        {artifact.favorite && (
          <div className="absolute top-2 right-2">
            <Star className="h-4 w-4 text-primary fill-primary drop-shadow" />
          </div>
        )}
        {artifact.pinned && (
          <div className="absolute top-2 left-2">
            <Pin className="h-4 w-4 text-foreground drop-shadow" />
          </div>
        )}
      </div>
      
      {/* Card info */}
      <div className="p-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex-shrink-0 p-1.5 rounded bg-muted">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-foreground truncate">
              {artifact.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(artifact.updatedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
