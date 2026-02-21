import { StorageAdapter, BlueprintSettings, Artifact, ToolType, ALL_TOOLS, CalendarEventRecord, Project } from './types';
import { normalizeArtifact, normalizeProject, CURRENT_SCHEMA_VERSION } from './schema';

const SETTINGS_KEY = 'blueprint:settings';
const ARTIFACT_PREFIX = 'blueprint:artifact:';
const ARTIFACT_INDEX_KEY = 'blueprint:artifacts';
const CALENDAR_EVENTS_KEY = 'blueprint:calendar:events';
const PROJECT_PREFIX = 'blueprint:project:';
const PROJECT_INDEX_KEY = 'blueprint:projects';

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

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const index = await this.getProjectIndex();
      const projects: Project[] = [];
      for (const id of index) {
        const stored = localStorage.getItem(PROJECT_PREFIX + id);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<Project>;
          const normalized = normalizeProject(parsed);
          if (normalized) projects.push(normalized);
        }
      }
      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error('Failed to load projects:', e);
      return [];
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const normalized = normalizeProject(project);
      if (!normalized) return;
      localStorage.setItem(PROJECT_PREFIX + normalized.id, JSON.stringify(normalized));
      const index = await this.getProjectIndex();
      if (!index.includes(normalized.id)) {
        index.push(normalized.id);
        localStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(index));
      }
    } catch (e) {
      console.error('Failed to save project:', e);
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      localStorage.removeItem(PROJECT_PREFIX + id);
      const index = await this.getProjectIndex();
      const newIndex = index.filter(i => i !== id);
      localStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(newIndex));

      // Also cleanup artifacts and calendar events for this project (optional, or rely on cascades elsewhere)
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
  }

  private async getProjectIndex(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(PROJECT_INDEX_KEY);
      if (stored) return JSON.parse(stored) as string[];
    } catch (e) {
      console.error('Failed to load project index:', e);
    }
    return [];
  }

  // Artifacts
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

  async listArtifacts(type?: ToolType, projectId?: string): Promise<Artifact[]> {
    try {
      const index = await this.getArtifactIndex();
      const artifacts: Artifact[] = [];

      for (const id of index) {
        const artifact = await this.getArtifact(id);
        if (artifact) {
          if ((!type || artifact.type === type) && (!projectId || artifact.projectId === projectId)) {
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

  async listFavorites(projectId?: string): Promise<Artifact[]> {
    try {
      const index = await this.getArtifactIndex();
      const favorites: Artifact[] = [];

      for (const id of index) {
        const artifact = await this.getArtifact(id);
        if (artifact && artifact.favorite && (!projectId || artifact.projectId === projectId)) {
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

  async listByTag(tag: string, projectId?: string): Promise<Artifact[]> {
    try {
      const index = await this.getArtifactIndex();
      const tagged: Artifact[] = [];

      for (const id of index) {
        const artifact = await this.getArtifact(id);
        if (artifact && artifact.tags?.includes(tag) && (!projectId || artifact.projectId === projectId)) {
          const normalized = normalizeArtifact(artifact);
          if (normalized) tagged.push(normalized);
        }
      }

      return tagged.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (e) {
      console.error('Failed to list by tag:', e);
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

  // Calendar events
  async listCalendarEvents(projectId?: string): Promise<CalendarEventRecord[]> {
    try {
      const stored = localStorage.getItem(CALENDAR_EVENTS_KEY);
      if (stored) {
        const events = JSON.parse(stored) as CalendarEventRecord[];
        return projectId ? events.filter(e => e.projectId === projectId) : events;
      }
    } catch (e) {
      console.error('Failed to load calendar events:', e);
    }
    return [];
  }

  async saveCalendarEvent(event: CalendarEventRecord): Promise<void> {
    try {
      const events = await this.listCalendarEvents();
      const index = events.findIndex((e) => e.id === event.id);
      if (index >= 0) {
        events[index] = event;
      } else {
        events.push(event);
      }
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save calendar event:', e);
    }
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    try {
      const events = await this.listCalendarEvents();
      const filtered = events.filter((e) => e.id !== id);
      localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete calendar event:', e);
    }
  }
}
