import { StorageAdapter, BlueprintSettings, Artifact, ToolType, ALL_TOOLS } from './types';
import { normalizeArtifact, CURRENT_SCHEMA_VERSION } from './schema';

const SETTINGS_KEY = 'blueprint:settings';
const ARTIFACT_PREFIX = 'blueprint:artifact:';
const ARTIFACT_INDEX_KEY = 'blueprint:artifacts';

export class LocalStorageAdapter implements StorageAdapter {
  async getSettings(): Promise<BlueprintSettings> {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BlueprintSettings;
        return {
          enabledTools: Array.isArray(parsed.enabledTools) ? parsed.enabledTools : [...ALL_TOOLS],
          seededNoteCreated: parsed.seededNoteCreated,
        };
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
        const parsed = JSON.parse(stored) as Partial<Artifact>;
        return normalizeArtifact(parsed);
      }
    } catch (e) {
      console.error('Failed to load artifact:', e);
    }
    return null;
  }

  async saveArtifact(artifact: Artifact): Promise<void> {
    try {
      // Ensure favorite field exists
      const normalized = normalizeArtifact({
        ...artifact,
        favorite: artifact.favorite ?? false,
        pinned: artifact.pinned ?? false,
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      });
      if (!normalized) return;
      localStorage.setItem(ARTIFACT_PREFIX + normalized.id, JSON.stringify(normalized));
      // Update index
      const index = await this.getArtifactIndex();
      if (!index.includes(normalized.id)) {
        index.push(normalized.id);
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
            const normalized = normalizeArtifact(artifact);
            if (normalized) artifacts.push(normalized);
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

  async listFavorites(): Promise<Artifact[]> {
    try {
      const index = await this.getArtifactIndex();
      const favorites: Artifact[] = [];
      
      for (const id of index) {
        const artifact = await this.getArtifact(id);
        if (artifact && artifact.favorite) {
          const normalized = normalizeArtifact(artifact);
          if (normalized) favorites.push(normalized);
        }
      }
      
      return favorites.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (e) {
      console.error('Failed to list favorites:', e);
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
