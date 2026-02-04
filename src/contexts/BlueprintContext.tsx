import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ToolType, ALL_TOOLS, StorageAdapter, getStorageAdapter } from '@/lib/storage';

interface BlueprintContextValue {
  enabledTools: ToolType[];
  toggleTool: (tool: ToolType) => void;
  isToolEnabled: (tool: ToolType) => boolean;
  storage: StorageAdapter;
  loading: boolean;
}

const BlueprintContext = createContext<BlueprintContextValue | null>(null);

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const [enabledTools, setEnabledTools] = useState<ToolType[]>([...ALL_TOOLS]);
  const [loading, setLoading] = useState(true);
  const storage = useMemo(() => getStorageAdapter(), []);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await storage.getSettings();
        setEnabledTools(settings.enabledTools);
      } catch (e) {
        console.error('Failed to load blueprint settings:', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [storage]);

  const toggleTool = useCallback(async (tool: ToolType) => {
    setEnabledTools(prev => {
      const newTools = prev.includes(tool)
        ? prev.filter(t => t !== tool)
        : [...prev, tool];
      
      // Persist to storage
      storage.saveSettings({ enabledTools: newTools }).catch(e => {
        console.error('Failed to save settings:', e);
      });
      
      return newTools;
    });
  }, [storage]);

  const isToolEnabled = useCallback((tool: ToolType) => {
    return enabledTools.includes(tool);
  }, [enabledTools]);

  const value = useMemo(() => ({
    enabledTools,
    toggleTool,
    isToolEnabled,
    storage,
    loading,
  }), [enabledTools, toggleTool, isToolEnabled, storage, loading]);

  return (
    <BlueprintContext.Provider value={value}>
      {children}
    </BlueprintContext.Provider>
  );
}

export function useBlueprint() {
  const context = useContext(BlueprintContext);
  if (!context) {
    throw new Error('useBlueprint must be used within a BlueprintProvider');
  }
  return context;
}
