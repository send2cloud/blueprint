import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactCard } from '@/components/gallery/ArtifactCard';
import { getStorageAdapter, Artifact, CURRENT_SCHEMA_VERSION } from '@/lib/storage';

export default function FavoritesPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const storage = getStorageAdapter();

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const favorites = await storage.listFavorites();
      const sorted = [...favorites].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setArtifacts(sorted);
    } catch (e) {
      console.error('Failed to load favorites:', e);
    } finally {
      setLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleDelete = useCallback(async (id: string) => {
    await storage.deleteArtifact(id);
    setArtifacts((prev) => prev.filter((a) => a.id !== id));
  }, [storage]);

  const handleToggleFavorite = useCallback(async (id: string) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (artifact) {
      const updated = {
        ...artifact,
        favorite: !artifact.favorite,
        updatedAt: new Date().toISOString(),
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      };
      await storage.saveArtifact(updated);
      // Remove from list since it's no longer a favorite
      setArtifacts((prev) => prev.filter((a) => a.id !== id));
    }
  }, [artifacts, storage]);

  const handleTogglePinned = useCallback(async (id: string) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (artifact) {
      const updated = {
        ...artifact,
        pinned: !artifact.pinned,
        updatedAt: new Date().toISOString(),
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      };
      await storage.saveArtifact(updated);
      setArtifacts((prev) => {
        const next = prev.map((a) => (a.id === id ? updated : a));
        next.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        return next;
      });
    }
  }, [artifacts, storage]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Favorites" icon={Star} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Favorites" icon={Star} />
      <div className="flex-1 p-6 overflow-auto">
        {artifacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No favorites yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Star your important artifacts to find them quickly here
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
                onTogglePinned={handleTogglePinned}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
