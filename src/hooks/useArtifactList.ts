import { useState, useEffect, useCallback } from 'react';
import { getStorageAdapter, Artifact, ToolType, CURRENT_SCHEMA_VERSION } from '../lib/storage';
import { sortArtifacts } from '../lib/artifactUtils';
import { useBlueprint } from '../contexts/BlueprintContext';

/**
 * Hook for listing and managing artifacts of a specific type
 */
export function useArtifactList(type: ToolType) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storage = getStorageAdapter();
  const { currentProjectId } = useBlueprint();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await storage.listArtifacts(type, currentProjectId || undefined);
      setArtifacts(sortArtifacts(list));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [storage, type, currentProjectId]);

  const deleteArtifact = useCallback(async (id: string) => {
    await storage.deleteArtifact(id);
    setArtifacts((prev) => prev.filter((a) => a.id !== id));
  }, [storage]);

  const toggleFavorite = useCallback(async (id: string) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (artifact) {
      const updated: Artifact = {
        ...artifact,
        favorite: !artifact.favorite,
        updatedAt: new Date().toISOString(),
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      };
      await storage.saveArtifact(updated);
      setArtifacts((prev) => sortArtifacts(prev.map((a) => (a.id === id ? updated : a))));
    }
  }, [artifacts, storage]);

  const togglePinned = useCallback(async (id: string) => {
    const artifact = artifacts.find((a) => a.id === id);
    if (artifact) {
      const updated: Artifact = {
        ...artifact,
        pinned: !artifact.pinned,
        updatedAt: new Date().toISOString(),
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      };
      await storage.saveArtifact(updated);
      setArtifacts((prev) => sortArtifacts(prev.map((a) => (a.id === id ? updated : a))));
    }
  }, [artifacts, storage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { artifacts, loading, error, refresh, deleteArtifact, toggleFavorite, togglePinned };
}