import { useMemo } from 'react';
import { useAllArtifacts } from '@/hooks/useArtifacts';
import type { Artifact } from '@/lib/storage/types';

/**
 * Find an artifact by name (case-insensitive).
 * Used for resolving [[artifact name]] references.
 */
export function useArtifactByName(name: string): Artifact | null {
  const { artifacts } = useAllArtifacts();

  return useMemo(() => {
    if (!name) return null;
    const normalized = name.toLowerCase().trim();
    return artifacts.find((a) => a.name.toLowerCase() === normalized) || null;
  }, [artifacts, name]);
}

/**
 * Find an artifact by ID.
 */
export function useArtifactById(id: string): Artifact | null {
  const { artifacts } = useAllArtifacts();

  return useMemo(() => {
    if (!id) return null;
    return artifacts.find((a) => a.id === id) || null;
  }, [artifacts, id]);
}
