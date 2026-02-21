import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ToolType, ALL_TOOLS, StorageAdapter, getStorageAdapter, BlueprintSettings, Project } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

interface BlueprintState {
  enabledTools: ToolType[];
  loading: boolean;
  settings: BlueprintSettings;
  storage: StorageAdapter;
  projects: Project[];
  currentProjectId: string | null;
}

interface BlueprintActions {
  toggleTool: (tool: ToolType) => void;
  isToolEnabled: (tool: ToolType) => boolean;
  setCurrentProject: (id: string) => void;
  createProject: (name: string) => Promise<Project>;
}

const BlueprintStateContext = createContext<BlueprintState | null>(null);
const BlueprintActionsContext = createContext<BlueprintActions | null>(null);

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const [enabledTools, setEnabledTools] = useState<ToolType[]>([...ALL_TOOLS]);
  const [settings, setSettings] = useState<BlueprintSettings>({ enabledTools: [...ALL_TOOLS] });
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const storage = useMemo(() => getStorageAdapter(), []);

  // Load settings and projects on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const loadedSettings = await storage.getSettings();
        const validTools = loadedSettings.enabledTools.filter(t => ALL_TOOLS.includes(t));
        setEnabledTools(validTools.length > 0 ? validTools : [...ALL_TOOLS]);
        setSettings({
          ...loadedSettings,
          enabledTools: validTools.length > 0 ? validTools : [...ALL_TOOLS],
        });

        let loadedProjects = await storage.getProjects();
        if (loadedProjects.length === 0) {
          // Create default project migration
          const defaultProject: Project = {
            id: 'default',
            name: 'Default Project',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await storage.saveProject(defaultProject);
          loadedProjects = [defaultProject];
        }
        setProjects(loadedProjects);

        // Don't auto-set currentProjectId if it's going to be managed by URL router later,
        // but set a fallback for solo mode.
        if (loadedSettings.mode !== 'multi') {
          setCurrentProjectIdState(loadedProjects[0].id);
        }

      } catch (e) {
        console.error('Failed to load blueprint state:', e);
      } finally {
        setLoading(false);
      }
    };
    loadState();
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

  const setCurrentProject = useCallback((id: string) => {
    setCurrentProjectIdState(id);
  }, []);

  const createProject = useCallback(async (name: string): Promise<Project> => {
    const newProject: Project = {
      id: uuidv4().replace(/-/g, '').substring(0, 12),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await storage.saveProject(newProject);
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, [storage]);

  const stateValue = useMemo(() => ({
    enabledTools,
    loading,
    settings,
    storage,
    projects,
    currentProjectId
  }), [enabledTools, loading, settings, storage, projects, currentProjectId]);

  const actionsValue = useMemo(() => ({
    toggleTool,
    isToolEnabled,
    setCurrentProject,
    createProject
  }), [toggleTool, isToolEnabled, setCurrentProject, createProject]);

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

