import { useNavigate } from 'react-router-dom';
import { Plus, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtifactCard } from './ArtifactCard';
import { Artifact, ToolType } from '@/lib/storage';

interface ArtifactGalleryProps {
  type: ToolType;
  title: string;
  icon: LucideIcon;
  artifacts: Artifact[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const EMPTY_MESSAGES: Record<ToolType, { title: string; description: string }> = {
  draw: {
    title: 'No drawings yet',
    description: 'Create your first drawing to get started.',
  },
  flow: {
    title: 'No flow diagrams yet',
    description: 'Create your first flow diagram to visualize processes.',
  },
  mindmap: {
    title: 'No mind maps yet',
    description: 'Create your first mind map to organize ideas.',
  },
  kanban: {
    title: 'No boards yet',
    description: 'Create your first board to track tasks.',
  },
  whiteboard: {
    title: 'No whiteboards yet',
    description: 'Create your first whiteboard for brainstorming.',
  },
};

const NEW_BUTTON_TEXT: Record<ToolType, string> = {
  draw: 'New Drawing',
  flow: 'New Flow',
  mindmap: 'New Mind Map',
  kanban: 'New Board',
  whiteboard: 'New Whiteboard',
};

export function ArtifactGallery({
  type,
  title,
  icon: Icon,
  artifacts,
  loading,
  onDelete,
}: ArtifactGalleryProps) {
  const navigate = useNavigate();
  const emptyMessage = EMPTY_MESSAGES[type];

  const handleNew = () => {
    navigate(`/${type}/new`);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <span className="text-sm text-muted-foreground">
            ({artifacts.length})
          </span>
        </div>
        <Button onClick={handleNew} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          {NEW_BUTTON_TEXT[type]}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">
              {emptyMessage.title}
            </h2>
            <p className="text-muted-foreground mb-4">
              {emptyMessage.description}
            </p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-1" />
              {NEW_BUTTON_TEXT[type]}
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
