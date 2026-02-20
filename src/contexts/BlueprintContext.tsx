import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ToolType, ALL_TOOLS, StorageAdapter, getStorageAdapter, BlueprintSettings } from '../lib/storage';

interface BlueprintState {
  enabledTools: ToolType[];
  loading: boolean;
  settings: BlueprintSettings;
  storage: StorageAdapter;
}

interface BlueprintActions {
  toggleTool: (tool: ToolType) => void;
  isToolEnabled: (tool: ToolType) => boolean;
}

const BlueprintStateContext = createContext<BlueprintState | null>(null);
const BlueprintActionsContext = createContext<BlueprintActions | null>(null);

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
        const validTools = loadedSettings.enabledTools.filter(t => ALL_TOOLS.includes(t));
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

      const nextSettings: BlueprintSettings = { ...settings, enabledTools: newTools };
      setSettings(nextSettings);
      storage.saveSettings(nextSettings).catch(e => {
        console.error('Failed to save settings:', e);
      });

      return newTools;
    });
  }, [storage, settings]);

  const isToolEnabled = useCallback((tool: ToolType) => {
    return enabledTools.includes(tool);
  }, [enabledTools]);

  const stateValue = useMemo(() => ({
    enabledTools,
    loading,
    settings,
    storage,
  }), [enabledTools, loading, settings, storage]);

  const actionsValue = useMemo(() => ({
    toggleTool,
    isToolEnabled,
  }), [toggleTool, isToolEnabled]);

  return (
    <BlueprintStateContext.Provider value={stateValue}>
      <BlueprintActionsContext.Provider value={actionsValue}>
        {children}
      </BlueprintActionsContext.Provider>
    </BlueprintStateContext.Provider>
  );
}

export function useBlueprint() {
  const state = useContext(BlueprintStateContext);
  const actions = useContext(BlueprintActionsContext);
  if (!state || !actions) {
    throw new Error('useBlueprint must be used within a BlueprintProvider');
  }
  return { ...state, ...actions };
}

/**
 * Access only actions (functions) to avoid re-renders when data changes.
 */
export function useBlueprintActions() {
  const context = useContext(BlueprintActionsContext);
  if (!context) throw new Error('useBlueprintActions must be used within a BlueprintProvider');
  return context;
}

/**
 * Access only state to avoid unnecessary dependencies.
 */
export function useBlueprintState() {
  const context = useContext(BlueprintStateContext);
  if (!context) throw new Error('useBlueprintState must be used within a BlueprintProvider');
  return context;
}

