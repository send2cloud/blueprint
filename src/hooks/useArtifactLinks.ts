import { useMemo } from 'react';
import { useAllArtifacts } from './useArtifacts';
import { 
  findOutgoingLinks, 
  findBacklinks, 
  buildRelationshipGraph,
  type ArtifactRelationship 
} from '@/lib/artifactLinks';
import type { Artifact } from '@/lib/storage/types';

/**
 * Hook to get links and backlinks for a specific artifact
 */
export function useArtifactLinks(artifactId: string | undefined) {
  const { artifacts } = useAllArtifacts();
  
  return useMemo(() => {
    if (!artifactId) {
      return { outgoingLinks: [], backlinks: [], artifact: null };
    }
    
    const artifact = artifacts.find((a) => a.id === artifactId);
    if (!artifact) {
      return { outgoingLinks: [], backlinks: [], artifact: null };
    }
    
    return {
      outgoingLinks: findOutgoingLinks(artifact, artifacts),
      backlinks: findBacklinks(artifact, artifacts),
      artifact,
    };
  }, [artifactId, artifacts]);
}

/**
 * Hook to get the full relationship graph of all artifacts
 */
export function useRelationshipGraph(): {
  nodes: { id: string; name: string; type: string }[];
  edges: ArtifactRelationship[];
  loading: boolean;
} {
  const { artifacts, loading } = useAllArtifacts();
  
  const graph = useMemo(() => {
    return buildRelationshipGraph(artifacts);
  }, [artifacts]);
  
  return { ...graph, loading };
}

/**
 * Find artifact by name (for resolving wiki links)
 */
export function useArtifactByName(name: string): Artifact | null {
  const { artifacts } = useAllArtifacts();
  
  return useMemo(() => {
    if (!name) return null;
    return artifacts.find((a) => a.name.toLowerCase() === name.toLowerCase()) || null;
  }, [name, artifacts]);
}
