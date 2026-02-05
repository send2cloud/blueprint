import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getStorageAdapter, Artifact, ToolType, CURRENT_SCHEMA_VERSION } from '@/lib/storage';

/**
 * Hook for managing a single artifact (create, load, save, rename, toggle flags)
 */
interface UseArtifactOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseArtifactReturn {
  artifact: Artifact | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  save: (data: unknown) => Promise<void>;
  rename: (name: string) => Promise<void>;
  toggleFavorite: () => Promise<void>;
  togglePinned: () => Promise<void>;
  updateTags: (tags: string[]) => Promise<void>;
  isNew: boolean;
}

const DEFAULT_NAMES: Record<ToolType, string> = {
  canvas: 'Untitled Canvas',
  diagram: 'Untitled Diagram',
  board: 'Untitled Board',
  notes: 'Untitled Note',
   calendar: 'Untitled Calendar',
};

export function useArtifact(
  type: ToolType,
  id?: string,
  options: UseArtifactOptions = {}
): UseArtifactReturn {
  const { autoSave = true, autoSaveDelay = 1000 } = options;
  const navigate = useNavigate();
  const storage = getStorageAdapter();

  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isNew = id === 'new' || !id;
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<unknown>(null);

  // Load artifact on mount
  useEffect(() => {
    async function loadArtifact() {
      setLoading(true);
      setError(null);

      try {
        if (isNew) {
          // Create a new artifact in memory (not saved yet)
          const newArtifact: Artifact = {
            id: uuidv4(),
            type,
            name: DEFAULT_NAMES[type],
            data: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            favorite: false,
            schemaVersion: CURRENT_SCHEMA_VERSION,
            pinned: false,
          };
          setArtifact(newArtifact);
        } else if (id) {
          const loaded = await storage.getArtifact(id);
          if (loaded) {
            setArtifact(loaded);
          } else {
            setError('Artifact not found');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    loadArtifact();
  }, [id, type, isNew, storage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveImmediate = useCallback(async (data: unknown) => {
    if (!artifact) return;

    setSaving(true);
    try {
      const updatedArtifact: Artifact = {
        ...artifact,
        data,
        updatedAt: new Date().toISOString(),
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      };

      await storage.saveArtifact(updatedArtifact);
      setArtifact(updatedArtifact);

      // If this was a new artifact, update the URL
      if (isNew) {
        navigate(`/${type}/${updatedArtifact.id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }, [artifact, storage, isNew, type, navigate]);

  const save = useCallback(async (data: unknown) => {
    pendingDataRef.current = data;

    if (!autoSave) {
      await saveImmediate(data);
      return;
    }

    // Debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (pendingDataRef.current !== null) {
        await saveImmediate(pendingDataRef.current);
        pendingDataRef.current = null;
      }
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay, saveImmediate]);

  const rename = useCallback(async (name: string) => {
    if (!artifact) return;

    const updatedArtifact: Artifact = {
      ...artifact,
      name,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };

    await storage.saveArtifact(updatedArtifact);
    setArtifact(updatedArtifact);
  }, [artifact, storage]);

  const toggleFavorite = useCallback(async () => {
    if (!artifact) return;

    const updatedArtifact: Artifact = {
      ...artifact,
      favorite: !artifact.favorite,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };

    await storage.saveArtifact(updatedArtifact);
    setArtifact(updatedArtifact);
  }, [artifact, storage]);

  const togglePinned = useCallback(async () => {
    if (!artifact) return;

    const updatedArtifact: Artifact = {
      ...artifact,
      pinned: !artifact.pinned,
      updatedAt: new Date().toISOString(),
      schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };

    await storage.saveArtifact(updatedArtifact);
    setArtifact(updatedArtifact);
  }, [artifact, storage]);

  return {
    artifact,
    loading,
    error,
    saving,
    save,
    rename,
    toggleFavorite,
    togglePinned,
    isNew,
  };
}
