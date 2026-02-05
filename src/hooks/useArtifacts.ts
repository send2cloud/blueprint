import { useCallback, useEffect, useState } from 'react';
import { getStorageAdapter, Artifact } from '@/lib/storage';

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
      list.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      setArtifacts(list);
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
