import { StorageAdapter, BlueprintSettings, Artifact, ToolType, ALL_TOOLS } from './types';

const SETTINGS_KEY = 'blueprint:settings';
const ARTIFACT_PREFIX = 'blueprint:artifact:';
const ARTIFACT_INDEX_KEY = 'blueprint:artifacts';

export class LocalStorageAdapter implements StorageAdapter {
  async getSettings(): Promise<BlueprintSettings> {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    // Default: all tools enabled
    return { enabledTools: [...ALL_TOOLS] };
  }

  async saveSettings(settings: BlueprintSettings): Promise<void> {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  async getArtifact(id: string): Promise<Artifact | null> {
    try {
      const stored = localStorage.getItem(ARTIFACT_PREFIX + id);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load artifact:', e);
    }
    return null;
  }

  async saveArtifact(artifact: Artifact): Promise<void> {
    try {
      localStorage.setItem(ARTIFACT_PREFIX + artifact.id, JSON.stringify(artifact));
      // Update index
      const index = await this.getArtifactIndex();
      if (!index.includes(artifact.id)) {
        index.push(artifact.id);
        localStorage.setItem(ARTIFACT_INDEX_KEY, JSON.stringify(index));
      }
    } catch (e) {
      console.error('Failed to save artifact:', e);
    }
  }

  async deleteArtifact(id: string): Promise<void> {
    try {
      localStorage.removeItem(ARTIFACT_PREFIX + id);
      // Update index
      const index = await this.getArtifactIndex();
      const newIndex = index.filter(i => i !== id);
      localStorage.setItem(ARTIFACT_INDEX_KEY, JSON.stringify(newIndex));
    } catch (e) {
      console.error('Failed to delete artifact:', e);
    }
  }

  async listArtifacts(type?: ToolType): Promise<Artifact[]> {
    try {
      const index = await this.getArtifactIndex();
      const artifacts: Artifact[] = [];
      
      for (const id of index) {
        const artifact = await this.getArtifact(id);
        if (artifact) {
          if (!type || artifact.type === type) {
            artifacts.push(artifact);
          }
        }
      }
      
      return artifacts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (e) {
      console.error('Failed to list artifacts:', e);
      return [];
    }
  }

  private async getArtifactIndex(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(ARTIFACT_INDEX_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load artifact index:', e);
    }
    return [];
  }
}
