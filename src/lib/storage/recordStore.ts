import type { StorageAdapter, BlueprintSettings, Artifact, ToolType, CalendarEventRecord, Project } from './types';
import { ALL_TOOLS } from './types';
import { normalizeArtifact, normalizeProject } from './schema';

/**
 * Minimal document store every backend must provide.
 * Blueprint's full StorageAdapter is derived from these four calls, so a new
 * backend (Cloudflare D1, Supabase, any REST API) only implements this.
 */
export type RecordKind = 'settings' | 'projects' | 'artifacts' | 'events';

export interface RecordStore {
  list<T>(kind: RecordKind): Promise<T[]>;
  get<T>(kind: RecordKind, id: string): Promise<T | null>;
  put<T extends { id: string }>(kind: RecordKind, record: T): Promise<void>;
  remove(kind: RecordKind, id: string): Promise<void>;
}

const SETTINGS_ID = '00000000-0000-4000-8000-000000000001';
const DEFAULT_SETTINGS: BlueprintSettings = { enabledTools: [...ALL_TOOLS] };

/** Turns any RecordStore into a full Blueprint StorageAdapter. */
export class RecordStoreAdapter implements StorageAdapter {
  constructor(private store: RecordStore) {}

  async getSettings(): Promise<BlueprintSettings> {
    const s = await this.store.get<BlueprintSettings & { id: string }>('settings', SETTINGS_ID);
    if (!s) return { ...DEFAULT_SETTINGS };
    const { id: _id, ...rest } = s;
    return { ...DEFAULT_SETTINGS, ...rest };
  }

  saveSettings(settings: BlueprintSettings): Promise<void> {
    return this.store.put('settings', { ...settings, id: SETTINGS_ID });
  }

  async getProjects(): Promise<Project[]> {
    const rows = await this.store.list<Project>('projects');
    return rows.map((p) => normalizeProject(p as any)).filter(Boolean) as Project[];
  }

  saveProject(project: Project): Promise<void> {
    return this.store.put('projects', project);
  }

  deleteProject(id: string): Promise<void> {
    return this.store.remove('projects', id);
  }

  async getArtifact(id: string): Promise<Artifact | null> {
    const a = await this.store.get<Artifact>('artifacts', id);
    return a ? normalizeArtifact(a as any) : null;
  }

  saveArtifact(artifact: Artifact): Promise<void> {
    return this.store.put('artifacts', artifact);
  }

  deleteArtifact(id: string): Promise<void> {
    return this.store.remove('artifacts', id);
  }

  private async artifacts(projectId?: string): Promise<Artifact[]> {
    const rows = await this.store.list<Artifact>('artifacts');
    return rows
      .map((a) => normalizeArtifact(a as any))
      .filter((a): a is Artifact => !!a && (!projectId || a.projectId === projectId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async listArtifacts(type?: ToolType, projectId?: string): Promise<Artifact[]> {
    return (await this.artifacts(projectId)).filter((a) => !type || a.type === type);
  }

  async listFavorites(projectId?: string): Promise<Artifact[]> {
    return (await this.artifacts(projectId)).filter((a) => a.favorite);
  }

  async listByTag(tag: string, projectId?: string): Promise<Artifact[]> {
    return (await this.artifacts(projectId)).filter((a) => a.tags?.includes(tag));
  }

  async listCalendarEvents(projectId?: string): Promise<CalendarEventRecord[]> {
    const rows = await this.store.list<CalendarEventRecord>('events');
    return rows.filter((e) => !projectId || e.projectId === projectId);
  }

  saveCalendarEvent(event: CalendarEventRecord): Promise<void> {
    return this.store.put('events', event);
  }

  deleteCalendarEvent(id: string): Promise<void> {
    return this.store.remove('events', id);
  }
}
