import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getStorageAdapter, Artifact, ToolType } from '@/lib/storage';

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
  isNew: boolean;
}

const DEFAULT_NAMES: Record<ToolType, string> = {
  draw: 'Untitled Drawing',
  flow: 'Untitled Flow',
  mindmap: 'Untitled Mind Map',
  kanban: 'Untitled Board',
  whiteboard: 'Untitled Whiteboard',
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
    isNew,
  };
}

// Hook for listing artifacts
export function useArtifactList(type: ToolType) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storage = getStorageAdapter();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const list = await storage.listArtifacts(type);
      // Sort by updatedAt, most recent first
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setArtifacts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [storage, type]);

  const deleteArtifact = useCallback(async (id: string) => {
    await storage.deleteArtifact(id);
    setArtifacts((prev) => prev.filter((a) => a.id !== id));
  }, [storage]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { artifacts, loading, error, refresh, deleteArtifact };
}
