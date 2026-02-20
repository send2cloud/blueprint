import { useCallback, useEffect, useState } from 'react';
import { getStorageAdapter, Artifact, CURRENT_SCHEMA_VERSION } from '../lib/storage';
import { sortArtifacts } from '../lib/artifactUtils';

/**
 * Hook for listing all artifacts across all tool types
 */
export function useAllArtifacts() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storage = getStorageAdapter();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await storage.listArtifacts();
      setArtifacts(sortArtifacts(list));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteArtifact = useCallback(async (id: string) => {
    await storage.deleteArtifact(id);
    setArtifacts((prev) => prev.filter((a) => a.id !== id));
  }, [storage]);

  const toggleFavorite = useCallback(async (id: string) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (!artifact) return;
    
    const updated: Artifact = {
      ...artifact,
      favorite: !artifact.favorite,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };
    
    await storage.saveArtifact(updated);
    setArtifacts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, [artifacts, storage]);

  const togglePinned = useCallback(async (id: string) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (!artifact) return;
    
    const updated: Artifact = {
      ...artifact,
      pinned: !artifact.pinned,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };
    
    await storage.saveArtifact(updated);
    setArtifacts((prev) => sortArtifacts(prev.map((a) => (a.id === id ? updated : a))));
  }, [artifacts, storage]);

  const updateTags = useCallback(async (id: string, tags: string[]) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (!artifact) return;
    
    const updated: Artifact = {
      ...artifact,
      tags: tags.length > 0 ? tags : undefined,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };
    
    await storage.saveArtifact(updated);
    setArtifacts((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }, [artifacts, storage]);

  return { artifacts, loading, error, refresh, deleteArtifact, toggleFavorite, togglePinned, updateTags };
}
