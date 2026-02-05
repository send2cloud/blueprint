import { useCallback } from 'react';
import { getStorageAdapter, Artifact, CURRENT_SCHEMA_VERSION } from '@/lib/storage';

/**
 * Hook for managing tags on a single artifact
 */
export function useArtifactTags(
  artifact: Artifact | null,
  setArtifact: (artifact: Artifact) => void
) {
  const storage = getStorageAdapter();

  const updateTags = useCallback(async (tags: string[]) => {
    if (!artifact) return;

    const updatedArtifact: Artifact = {
      ...artifact,
      tags: tags.length > 0 ? tags : undefined,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };

    await storage.saveArtifact(updatedArtifact);
    setArtifact(updatedArtifact);
  }, [artifact, storage, setArtifact]);

  const addTag = useCallback(async (tag: string) => {
    if (!artifact) return;
    const currentTags = artifact.tags || [];
    if (!currentTags.includes(tag)) {
      await updateTags([...currentTags, tag]);
    }
  }, [artifact, updateTags]);

  const removeTag = useCallback(async (tag: string) => {
    if (!artifact) return;
    const currentTags = artifact.tags || [];
    await updateTags(currentTags.filter(t => t !== tag));
  }, [artifact, updateTags]);

  return {
    tags: artifact?.tags || [],
    updateTags,
    addTag,
    removeTag,
  };
}
