import { init } from '@instantdb/react';
import { StorageAdapter, BlueprintSettings, Artifact, ToolType, ALL_TOOLS, CalendarEventRecord, Project } from './types';
import { normalizeArtifact, normalizeProject, CURRENT_SCHEMA_VERSION } from './schema';

// Single table for all artifacts - simpler queries, no type routing needed
const TABLE_ARTIFACTS = 'blueprint_artifacts';
const TABLE_SETTINGS = 'blueprint_settings';
const TABLE_CALENDAR_EVENTS = 'blueprint_calendar_events';
const TABLE_PROJECTS = 'blueprint_projects';
const SETTINGS_ID = '00000000-0000-4000-8000-000000000001'; // Singleton UUID for settings
const LEGACY_SETTINGS_ID = 'default'; // Old non-UUID settings ID to migrate from
const LEGACY_DEFAULT_PROJECT_ID = 'default'; // Old non-UUID project ID
const DEFAULT_PROJECT_ID = '00000000-0000-4000-8000-000000000000'; // New UUID project ID

// Legacy tables from the split-table architecture (to be cleaned up)
const LEGACY_TABLES = ['blueprint_notes', 'blueprint_diagrams', 'blueprint_canvases', 'blueprint_boards'];

type InstantOutbox = {
  artifacts: Record<string, Artifact>;
  settings?: BlueprintSettings;
  calendarEvents: Record<string, CalendarEventRecord>;
  calendarDeletes: string[];
  projects: Record<string, Project>;
  projectDeletes: string[];
};

export class InstantDbAdapter implements StorageAdapter {
  private db: ReturnType<typeof init>;
  private appId: string;
  private cacheKeyPrefix: string;

  constructor(appId: string) {
    this.db = init({ appId });
    this.appId = appId;
    this.cacheKeyPrefix = `blueprint:instant:${appId}`;
    this.flushOutbox();
  }

  private cacheKey(suffix: string) {
    return `${this.cacheKeyPrefix}:${suffix}`;
  }

  private loadCache<T>(suffix: string): T | null {
    try {
      const raw = localStorage.getItem(this.cacheKey(suffix));
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  private saveCache<T>(suffix: string, value: T): void {
    try {
      localStorage.setItem(this.cacheKey(suffix), JSON.stringify(value));
    } catch {
      // ignore cache errors
    }
  }

  private loadOutbox(): InstantOutbox {
    const raw = this.loadCache<Partial<InstantOutbox>>('outbox');
    return {
      artifacts: raw?.artifacts ?? {},
      settings: raw?.settings,
      calendarEvents: raw?.calendarEvents ?? {},
      calendarDeletes: raw?.calendarDeletes ?? [],
      projects: raw?.projects ?? {},
      projectDeletes: raw?.projectDeletes ?? [],
    };
  }

  private saveOutbox(outbox: InstantOutbox) {
    this.saveCache('outbox', outbox);
  }

  private async flushOutbox() {
    const outbox = this.loadOutbox();
    const artifactEntries = Object.values(outbox.artifacts ?? {});
    const calendarUpserts = Object.values(outbox.calendarEvents ?? {});
    const calendarDeletes = outbox.calendarDeletes ?? [];
    const projectUpserts = Object.values(outbox.projects ?? {});
    const projectDeletes = outbox.projectDeletes ?? [];

    if (
      artifactEntries.length === 0 &&
      !outbox.settings &&
      calendarUpserts.length === 0 &&
      calendarDeletes.length === 0 &&
      projectUpserts.length === 0 &&
      projectDeletes.length === 0
    ) {
      return;
    }

    const remaining: InstantOutbox = { artifacts: {}, calendarEvents: {}, calendarDeletes: [], projects: {}, projectDeletes: [] };

    for (const artifact of artifactEntries) {
      try {
        const tx = (this.db.tx as any)[TABLE_ARTIFACTS][artifact.id].update(artifact);
        await this.db.transact(tx);
      } catch {
        remaining.artifacts[artifact.id] = artifact;
      }
    }

    if (outbox.settings) {
      try {
        const tx = (this.db.tx as any)[TABLE_SETTINGS][SETTINGS_ID].update(outbox.settings);
        await this.db.transact(tx);
      } catch {
        remaining.settings = outbox.settings;
      }
    }

    for (const id of calendarDeletes) {
      try {
        const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][id].delete();
        await this.db.transact(tx);
      } catch {
        remaining.calendarDeletes.push(id);
      }
    }

    for (const id of projectDeletes) {
      try {
        const tx = (this.db.tx as any)[TABLE_PROJECTS][id].delete();
        await this.db.transact(tx);
      } catch {
        remaining.projectDeletes.push(id);
      }
    }

    for (const event of calendarUpserts) {
      try {
        const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][event.id].update(event);
        await this.db.transact(tx);
      } catch {
        remaining.calendarEvents[event.id] = event;
      }
    }

    for (const project of projectUpserts) {
      try {
        const tx = (this.db.tx as any)[TABLE_PROJECTS][project.id].update(project);
        await this.db.transact(tx);
      } catch {
        remaining.projects[project.id] = project;
      }
    }

    this.saveOutbox(remaining);
  }

  async getSettings(): Promise<BlueprintSettings> {
    try {
      const resp = await this.db.queryOnce({
        [TABLE_SETTINGS]: {
          $: { where: { id: SETTINGS_ID } },
        },
      });
      const row = resp.data?.[TABLE_SETTINGS]?.[0] as { enabledTools?: ToolType[]; seededNoteCreated?: boolean; mode?: 'solo' | 'multi' } | undefined;
      if (row?.enabledTools && Array.isArray(row.enabledTools)) {
        const settings: BlueprintSettings = {
          enabledTools: row.enabledTools.filter((t) => ALL_TOOLS.includes(t)),
          seededNoteCreated: row.seededNoteCreated,
          mode: row.mode,
        };
        this.saveCache('settings', settings);
        return settings;
      }
    } catch (e) {
      console.error('Failed to load settings from InstantDB:', e);
    }
    return this.loadCache<BlueprintSettings>('settings') ?? { enabledTools: [...ALL_TOOLS] };
  }

  async saveSettings(settings: BlueprintSettings): Promise<void> {
    try {
      const tx = (this.db.tx as any)[TABLE_SETTINGS][SETTINGS_ID].update({
        enabledTools: settings.enabledTools,
        seededNoteCreated: settings.seededNoteCreated ?? false,
        mode: settings.mode,
      });
      await this.db.transact(tx);
      this.saveCache('settings', settings);
    } catch (e) {
      console.error('Failed to save settings to InstantDB:', e);
      const outbox = this.loadOutbox();
      outbox.settings = settings;
      this.saveOutbox(outbox);
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const resp = await this.db.queryOnce({
        [TABLE_PROJECTS]: {},
      });
      const rows = (resp.data?.[TABLE_PROJECTS] ?? []) as Project[];
      console.log('Blueprint: loaded projects from InstantDB, count:', rows.length, rows.map(r => ({ id: r.id, name: r.name, slug: r.slug })));
      const normalized = rows
        .map(row => normalizeProject(row))
        .filter((row): row is Project => Boolean(row));

      const sorted = normalized.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      this.saveCache('projects', sorted);
      return sorted;
    } catch (e) {
      console.error('Blueprint: Failed to load projects from InstantDB:', e);
      const cache = this.loadCache<Project[]>('projects') ?? [];
      console.log('Blueprint: falling back to cached projects, count:', cache.length);
      return cache
        .map(row => normalizeProject(row))
        .filter((row): row is Project => Boolean(row))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const projectToSave = normalizeProject(project);
      if (!projectToSave) {
        console.warn('Blueprint: normalizeProject returned null, skipping save', project);
        return;
      }

      console.log('Blueprint: saving project to InstantDB', projectToSave.id, projectToSave.name);
      const tx = (this.db.tx as any)[TABLE_PROJECTS][projectToSave.id].update(projectToSave);
      await this.db.transact(tx);
      console.log('Blueprint: project saved successfully', projectToSave.id);

      const cached = this.loadCache<Project[]>('projects') ?? [];
      const next = cached.filter(p => p.id !== projectToSave.id);
      next.unshift(projectToSave);
      this.saveCache('projects', next);
    } catch (e) {
      console.error('Blueprint: Failed to save project to InstantDB:', e);
      const normalized = normalizeProject(project);
      if (normalized) {
        const outbox = this.loadOutbox();
        outbox.projects[normalized.id] = normalized;
        this.saveOutbox(outbox);
        console.warn('Blueprint: project queued in outbox for retry', normalized.id);
      }
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      const tx = (this.db.tx as any)[TABLE_PROJECTS][id].delete();
      await this.db.transact(tx);
    } catch (e) {
      console.error('Failed to delete project from InstantDB:', e);
    }
    const cached = this.loadCache<Project[]>('projects') ?? [];
    this.saveCache('projects', cached.filter(p => p.id !== id));
  }

  async getArtifact(id: string): Promise<Artifact | null> {
    try {
      const resp = await this.db.queryOnce({
        [TABLE_ARTIFACTS]: { $: { where: { id } } },
      });
      const row = resp.data?.[TABLE_ARTIFACTS]?.[0] as Artifact | undefined;
      if (row) return normalizeArtifact(row);
    } catch (e) {
      console.error('Failed to load artifact from InstantDB:', e);
    }

    // Fallback to cache
    const cache = this.loadCache<Artifact[]>('artifacts') ?? [];
    const cachedItem = cache.find((item) => item.id === id);
    return cachedItem ? normalizeArtifact(cachedItem) : null;
  }

  async saveArtifact(artifact: Artifact): Promise<void> {
    try {
      const artifactToSave = normalizeArtifact({
        ...artifact,
        favorite: artifact.favorite ?? false,
        pinned: artifact.pinned ?? false,
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      });
      if (!artifactToSave) return;

      const tx = (this.db.tx as any)[TABLE_ARTIFACTS][artifactToSave.id].update(artifactToSave);
      await this.db.transact(tx);

      const cached = this.loadCache<Artifact[]>('artifacts') ?? [];
      const next = cached.filter((item) => item.id !== artifactToSave.id);
      next.unshift(artifactToSave);
      this.saveCache('artifacts', next);
    } catch (e) {
      console.error('Failed to save artifact to InstantDB:', e);
      const normalized = normalizeArtifact(artifact);
      if (normalized) {
        const outbox = this.loadOutbox();
        outbox.artifacts[normalized.id] = normalized;
        this.saveOutbox(outbox);
      }
    }
  }

  async deleteArtifact(id: string): Promise<void> {
    try {
      const tx = (this.db.tx as any)[TABLE_ARTIFACTS][id].delete();
      await this.db.transact(tx);
    } catch (e) {
      console.error('Failed to delete artifact from InstantDB:', e);
    }

    const cached = this.loadCache<Artifact[]>('artifacts') ?? [];
    this.saveCache('artifacts', cached.filter((item) => item.id !== id));
  }

  async listArtifacts(type?: ToolType, projectId?: string): Promise<Artifact[]> {
    try {
      const where: any = {};
      if (type) where.type = type;
      if (projectId) where.projectId = projectId;

      const resp = await this.db.queryOnce({
        [TABLE_ARTIFACTS]: Object.keys(where).length > 0 ? { $: { where } } : {},
      });
      const rows = (resp.data?.[TABLE_ARTIFACTS] ?? []) as Artifact[];

      const normalized = rows
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row));

      const sorted = normalized.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      // Update cache
      if (!type) {
        this.saveCache('artifacts', sorted);
      } else {
        const fullCache = this.loadCache<Artifact[]>('artifacts') ?? [];
        const filtered = fullCache.filter(a => a.type !== type);
        const merged = [...sorted, ...filtered].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
        this.saveCache('artifacts', merged);
      }

      return sorted;
    } catch (e) {
      console.error('Failed to list artifacts from InstantDB:', e);
      const cache = this.loadCache<Artifact[]>('artifacts') ?? [];
      const filtered = cache.filter(row => {
        if (type && row.type !== type) return false;
        if (projectId && row.projectId !== projectId) return false;
        return true;
      });
      return filtered
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async listFavorites(projectId?: string): Promise<Artifact[]> {
    try {
      const where: any = { favorite: true };
      if (projectId) where.projectId = projectId;

      const resp = await this.db.queryOnce({
        [TABLE_ARTIFACTS]: { $: { where } },
      });
      const rows = (resp.data?.[TABLE_ARTIFACTS] ?? []) as Artifact[];
      return rows
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      console.error('Failed to list favorites from InstantDB:', e);
      const cache = (this.loadCache<Artifact[]>('artifacts') ?? []).filter((row) => row.favorite && (!projectId || row.projectId === projectId));
      return cache
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async listByTag(tag: string, projectId?: string): Promise<Artifact[]> {
    try {
      // InstantDB doesn't support array-contains queries well, so fetch all and filter
      const all = await this.listArtifacts(undefined, projectId);
      return all.filter((artifact) => artifact.tags?.includes(tag));
    } catch (e) {
      console.error('Failed to list by tag from InstantDB:', e);
      return [];
    }
  }

  // Calendar events
  async listCalendarEvents(projectId?: string): Promise<CalendarEventRecord[]> {
    const cachedRaw = this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];
    const cached = projectId ? cachedRaw.filter(e => e.projectId === projectId) : cachedRaw;

    try {
      console.log('Blueprint: Fetching calendar events from InstantDB...');
      const resp = await this.db.queryOnce({
        [TABLE_CALENDAR_EVENTS]: projectId ? { $: { where: { projectId } } } : {},
      });

      const rows = (resp.data?.[TABLE_CALENDAR_EVENTS] ?? []) as CalendarEventRecord[];
      console.log(`Blueprint: Received ${rows.length} events from database.`);

      const outbox = this.loadOutbox();
      const deleteSet = new Set(outbox.calendarDeletes ?? []);
      const merged = new Map<string, CalendarEventRecord>();

      // Start with server data
      for (const row of rows) {
        if (!deleteSet.has(row.id)) merged.set(row.id, row);
      }

      // Overlay outbox (unsynced changes)
      for (const pending of Object.values(outbox.calendarEvents ?? {})) {
        if (!projectId || pending.projectId === projectId) {
          merged.set(pending.id, pending);
        }
      }

      const result = Array.from(merged.values());

      // SAFETY: If the DB is empty but we have local cache, preserve it
      if (result.length === 0 && rows.length === 0 && cached.length > 0) {
        console.warn('Blueprint: Database returned 0 events, but local cache has data. Preserving local cache as fail-safe.');
        return cached;
      }

      this.saveCache('calendar_events', result);
      return result;
    } catch (e) {
      console.error('Blueprint: Failed to list calendar events from InstantDB:', e);
      return cached;
    }
  }

  async saveCalendarEvent(event: CalendarEventRecord): Promise<void> {
    console.log('Blueprint: Saving calendar event...', event.id);

    // Always update local cache first (Optimistic)
    const cached = this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];
    const next = cached.filter((e) => e.id !== event.id);
    next.push(event);
    this.saveCache('calendar_events', next);

    try {
      // 1. Put in outbox first so we don't lose it if transact fails
      const outbox = this.loadOutbox();
      this.saveOutbox({
        ...outbox,
        calendarEvents: { ...(outbox.calendarEvents ?? {}), [event.id]: event },
        calendarDeletes: (outbox.calendarDeletes ?? []).filter((id) => id !== event.id),
      });

      // 2. Transact to DB
      const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][event.id].update(event);
      await this.db.transact(tx);
      console.log('Blueprint: Calendar event transaction sent.');

      // 3. Only if successful, remove from outbox
      const afterOutbox = this.loadOutbox();
      const { [event.id]: _, ...rest } = afterOutbox.calendarEvents ?? {};
      this.saveOutbox({
        ...afterOutbox,
        calendarEvents: rest,
      });
    } catch (e) {
      console.error('Blueprint: Failed to sync calendar event to InstantDB:', e);
      // It stays in outbox because we didn't remove it
    }
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    console.log('Blueprint: Deleting calendar event...', id);
    // Optimistically remove from cache.
    const cached = this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];
    this.saveCache('calendar_events', cached.filter((e) => e.id !== id));

    try {
      // 1. Add to delete queue in outbox
      const outbox = this.loadOutbox();
      const deletes = outbox.calendarDeletes ?? [];
      this.saveOutbox({
        ...outbox,
        calendarEvents: Object.fromEntries(
          Object.entries(outbox.calendarEvents ?? {}).filter(([eventId]) => eventId !== id),
        ),
        calendarDeletes: deletes.includes(id) ? deletes : [...deletes, id],
      });

      // 2. Transact to DB
      const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][id].delete();
      await this.db.transact(tx);
      console.log('Blueprint: Delete transaction sent.');

      // 3. Remove from outbox on success
      const afterOutbox = this.loadOutbox();
      this.saveOutbox({
        ...afterOutbox,
        calendarDeletes: (afterOutbox.calendarDeletes ?? []).filter((existing) => existing !== id),
      });
    } catch (e) {
      console.error('Blueprint: Failed to sync delete to InstantDB:', e);
    }
  }

  /**
   * Clean up legacy split tables and optionally all data.
   * Returns count of deleted records.
   */
  async cleanupLegacyTables(includeCurrentData = false): Promise<{ deleted: number; tables: string[] }> {
    let deleted = 0;
    const cleanedTables: string[] = [];

    // Build query for all legacy tables
    const query: Record<string, object> = {};
    for (const table of LEGACY_TABLES) {
      query[table] = {};
    }
    if (includeCurrentData) {
      query[TABLE_ARTIFACTS] = {};
      query[TABLE_CALENDAR_EVENTS] = {};
    }

    try {
      const resp = await this.db.queryOnce(query as any);
      const data = resp.data as Record<string, { id: string }[]> | undefined;

      for (const table of Object.keys(query)) {
        const rows = data?.[table] ?? [];
        if (rows.length === 0) continue;

        for (const row of rows) {
          try {
            const tx = (this.db.tx as any)[table][row.id].delete();
            await this.db.transact(tx);
            deleted++;
          } catch (e) {
            console.error(`Failed to delete ${row.id} from ${table}:`, e);
          }
        }
        cleanedTables.push(table);
      }

      // Clear local caches
      if (includeCurrentData) {
        this.saveCache('artifacts', []);
        this.saveCache('calendar_events', []);
      }

      console.log(`Blueprint: Cleaned ${deleted} records from tables: ${cleanedTables.join(', ')}`);
    } catch (e) {
      console.error('Blueprint: Failed to cleanup legacy tables:', e);
    }

    return { deleted, tables: cleanedTables };
  }
}
