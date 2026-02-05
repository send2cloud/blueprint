import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ToolType, ALL_TOOLS, StorageAdapter, getStorageAdapter, BlueprintSettings } from '@/lib/storage';

interface BlueprintContextValue {
  enabledTools: ToolType[];
  toggleTool: (tool: ToolType) => void;
  isToolEnabled: (tool: ToolType) => boolean;
  storage: StorageAdapter;
  loading: boolean;
  settings: BlueprintSettings;
}

const BlueprintContext = createContext<BlueprintContextValue | null>(null);

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const [enabledTools, setEnabledTools] = useState<ToolType[]>([...ALL_TOOLS]);
  const [settings, setSettings] = useState<BlueprintSettings>({ enabledTools: [...ALL_TOOLS] });
  const [loading, setLoading] = useState(true);
  const storage = useMemo(() => getStorageAdapter(), []);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await storage.getSettings();
        // Filter out old tool types that no longer exist
        const validTools = loadedSettings.enabledTools.filter(t => ALL_TOOLS.includes(t));
        // If no valid tools, default to all tools
        setEnabledTools(validTools.length > 0 ? validTools : [...ALL_TOOLS]);
        setSettings({
          ...loadedSettings,
          enabledTools: validTools.length > 0 ? validTools : [...ALL_TOOLS],
        });
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
      setSettings(prevSettings => {
        const nextSettings: BlueprintSettings = { ...prevSettings, enabledTools: newTools };
        storage.saveSettings(nextSettings).catch(e => {
          console.error('Failed to save settings:', e);
        });
        return nextSettings;
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
    settings,
  }), [enabledTools, toggleTool, isToolEnabled, storage, loading, settings]);

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
