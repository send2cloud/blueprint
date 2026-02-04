import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, GitBranch, Brain, Columns3, StickyNote, Trash2, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Artifact, ToolType } from '@/lib/storage';

interface ArtifactCardProps {
  artifact: Artifact;
  onDelete: (id: string) => void;
}

const TOOL_ICONS: Record<ToolType, React.ComponentType<{ className?: string }>> = {
  draw: Pencil,
  flow: GitBranch,
  mindmap: Brain,
  kanban: Columns3,
  whiteboard: StickyNote,
};

const TYPE_LABELS: Record<ToolType, string> = {
  draw: 'drawing',
  flow: 'flow diagram',
  mindmap: 'mind map',
  kanban: 'board',
  whiteboard: 'whiteboard',
};

export function ArtifactCard({ artifact, onDelete }: ArtifactCardProps) {
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
              <h3 className="font-medium text-foreground truncate">
                {artifact.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(artifact.updatedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
