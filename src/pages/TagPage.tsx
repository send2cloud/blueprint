import { useParams, useNavigate } from 'react-router-dom';
import { useAllArtifacts } from '../hooks/useArtifacts';
import { ArtifactCard } from '../components/gallery/ArtifactCard';
import { sortArtifacts } from '../lib/artifactUtils';
import { Button } from '../components/ui/button';
import { ChevronLeft, Tag } from 'lucide-react';

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const { artifacts, loading, deleteArtifact, toggleFavorite, togglePinned } = useAllArtifacts();
  
  const decodedTag = tag ? decodeURIComponent(tag) : '';
  
  const filteredArtifacts = artifacts.filter(
    artifact => artifact.tags?.includes(decodedTag)
  );
  const sorted = sortArtifacts(filteredArtifacts);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold text-foreground">{decodedTag}</h1>
            <span className="text-muted-foreground">
              ({sorted.length} {sorted.length === 1 ? 'item' : 'items'})
            </span>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No artifacts with this tag.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {sorted.map((artifact) => (
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
    </div>
  );
}
