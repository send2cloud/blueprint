import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Share2, Star, FileText, GitBranch, Columns3, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Artifact } from '@/lib/storage';
import { TOOL_CONFIG } from '@/lib/toolConfig';

interface ArtifactCardProps {
  artifact: Artifact;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

// Generate a preview based on artifact type and data
function ArtifactPreview({ artifact }: { artifact: Artifact }) {
  const data = artifact.data as Record<string, unknown> | undefined;
  
  // Whiteboard - show placeholder with brush strokes
  if (artifact.type === 'canvas') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
        <Palette className="h-12 w-12 text-muted-foreground/30" />
      </div>
    );
  }
  
  // Flow - show node count and simplified graph
  if (artifact.type === 'diagram') {
    const nodes = (data?.nodes as Array<unknown>) || [];
    const edges = (data?.edges as Array<unknown>) || [];
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex flex-col items-center justify-center gap-2">
        <GitBranch className="h-10 w-10 text-muted-foreground/30" />
        {(nodes.length > 0 || edges.length > 0) && (
          <span className="text-xs text-muted-foreground">
            {nodes.length} nodes · {edges.length} edges
          </span>
        )}
      </div>
    );
  }
  
  // Tasks - show column/task summary
  if (artifact.type === 'board') {
    const columns = (data?.columns as Array<{ id: string; title: string; taskIds: string[] }>) || [];
    const tasks = (data?.tasks as Record<string, unknown>) || {};
    const taskCount = Object.keys(tasks).length;
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex flex-col items-center justify-center gap-2">
        <Columns3 className="h-10 w-10 text-muted-foreground/30" />
        {(columns.length > 0 || taskCount > 0) && (
          <span className="text-xs text-muted-foreground">
            {columns.length} columns · {taskCount} tasks
          </span>
        )}
      </div>
    );
  }
  
  // Docs - show text excerpt
  if (artifact.type === 'notes') {
    // BlockNote stores content as array of blocks
    const blocks = data as unknown as Array<{ content?: Array<{ text?: string }> }> | undefined;
    let excerpt = '';
    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        if (block.content && Array.isArray(block.content)) {
          for (const item of block.content) {
            if (item.text) {
              excerpt += item.text + ' ';
              if (excerpt.length > 150) break;
            }
          }
        }
        if (excerpt.length > 150) break;
      }
    }
    
    if (excerpt.trim()) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted p-4 overflow-hidden">
          <p className="text-xs text-muted-foreground line-clamp-6 leading-relaxed">
            {excerpt.trim()}
          </p>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
        <FileText className="h-10 w-10 text-muted-foreground/30" />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <div className="h-8 w-8 rounded bg-muted-foreground/10" />
    </div>
  );
}

// Calculate preview height based on content
function getPreviewHeight(artifact: Artifact): string {
  const data = artifact.data as Record<string, unknown> | undefined;
  
  if (artifact.type === 'notes') {
    const blocks = data as unknown as Array<{ content?: Array<{ text?: string }> }> | undefined;
    if (Array.isArray(blocks) && blocks.length > 3) {
      return 'h-48';
    }
    return 'h-36';
  }
  
  if (artifact.type === 'diagram') {
    const nodes = (data?.nodes as Array<unknown>) || [];
    if (nodes.length > 5) return 'h-44';
    return 'h-36';
  }
  
  if (artifact.type === 'board') {
    const tasks = (data?.tasks as Record<string, unknown>) || {};
    if (Object.keys(tasks).length > 5) return 'h-44';
    return 'h-36';
  }
  
  // Canvas/Whiteboard - standard size
  return 'h-40';
}

export function ArtifactCard({ artifact, onDelete, onToggleFavorite }: ArtifactCardProps) {
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
