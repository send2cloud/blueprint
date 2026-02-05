import { useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtifactCard } from './ArtifactCard';
import { useArtifactList } from '@/hooks/useArtifactList';
import { ToolType } from '@/lib/storage';

interface ArtifactGalleryProps {
  type: ToolType;
  newPath: string;
  emptyTitle: string;
  emptyDescription: string;
  newButtonLabel: string;
}

export function ArtifactGallery({
  type,
  newPath,
  emptyTitle,
  emptyDescription,
  newButtonLabel,
}: ArtifactGalleryProps) {
  const navigate = useNavigate();
  const { artifacts, loading, deleteArtifact, toggleFavorite, togglePinned } = useArtifactList(type);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {artifacts.length} {artifacts.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={() => navigate(newPath)} className="gap-2">
          <Plus className="h-4 w-4" />
          {newButtonLabel}
        </Button>
      </div>

      {artifacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-medium text-foreground mb-1">{emptyTitle}</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {emptyDescription}
          </p>
          <Button onClick={() => navigate(newPath)} className="gap-2">
            <Plus className="h-4 w-4" />
            {newButtonLabel}
          </Button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {artifacts.map((artifact) => (
            <div key={artifact.id} className="break-inside-avoid">
              <ArtifactCard
                artifact={artifact}
                onDelete={deleteArtifact}
                onToggleFavorite={toggleFavorite}
                onTogglePinned={togglePinned}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
