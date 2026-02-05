import { useCallback, useEffect, useState } from 'react';
import { getStorageAdapter, Artifact } from '@/lib/storage';
import { sortArtifacts } from '@/lib/artifactUtils';

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

  return { artifacts, loading, error, refresh };
}
