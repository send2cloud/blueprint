import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Palette, GitBranch, Columns3, FileText, Trash2, Share2, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Artifact, ToolType } from '@/lib/storage';

interface ArtifactCardProps {
  artifact: Artifact;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

const TOOL_ICONS: Record<ToolType, React.ComponentType<{ className?: string }>> = {
  canvas: Palette,
  diagram: GitBranch,
  board: Columns3,
  notes: FileText,
};

const TYPE_LABELS: Record<ToolType, string> = {
  canvas: 'canvas',
  diagram: 'diagram',
  board: 'board',
  notes: 'note',
};

export function ArtifactCard({ artifact, onDelete, onToggleFavorite }: ArtifactCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const Icon = TOOL_ICONS[artifact.type];

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
        description: `Share this link to show your ${TYPE_LABELS[artifact.type]}.`,
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(artifact.id);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 p-2 rounded-md bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground truncate">
                  {artifact.name}
                </h3>
                {artifact.favorite && (
                  <Star className="h-3 w-3 text-warning fill-warning flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(artifact.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleToggleFavorite}
              >
                <Star className={`h-4 w-4 ${artifact.favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
