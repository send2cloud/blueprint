import { init } from '@instantdb/react';
import { StorageAdapter, BlueprintSettings, Artifact, ToolType, ALL_TOOLS, CalendarEventRecord } from './types';
import { normalizeArtifact, CURRENT_SCHEMA_VERSION } from './schema';

const TABLE_SETTINGS = 'blueprint_settings';
const TABLE_CALENDAR_EVENTS = 'blueprint_calendar_events';

// Specialized tables for each tool type
const TABLES: Record<ToolType, string> = {
  notes: 'blueprint_notes',
  diagram: 'blueprint_diagrams',
  canvas: 'blueprint_canvases',
  board: 'blueprint_boards',
  calendar: 'blueprint_calendar_events', // Not used via artifact methods
};

type InstantOutbox = {
  artifacts: Record<string, Artifact>;
  settings?: BlueprintSettings;
  calendarEvents: Record<string, CalendarEventRecord>;
  calendarDeletes: string[];
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

  private getTableName(type: ToolType): string {
    return TABLES[type] || 'blueprint_notes'; // Fallback to notes instead of legacy
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

    if (
      artifactEntries.length === 0 &&
      !outbox.settings &&
      calendarUpserts.length === 0 &&
      calendarDeletes.length === 0
    ) {
      return;
    }

    const remaining: InstantOutbox = { artifacts: {}, calendarEvents: {}, calendarDeletes: [] };

    for (const artifact of artifactEntries) {
      try {
        const table = this.getTableName(artifact.type);
        const tx = (this.db.tx as any)[table][artifact.id].update(artifact);
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

    for (const event of calendarUpserts) {
      try {
        const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][event.id].update(event);
        await this.db.transact(tx);
      } catch {
        remaining.calendarEvents[event.id] = event;
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
      const row = resp.data?.[TABLE_SETTINGS]?.[0] as { enabledTools?: ToolType[]; seededNoteCreated?: boolean } | undefined;
      if (row?.enabledTools && Array.isArray(row.enabledTools)) {
        const settings: BlueprintSettings = {
          enabledTools: row.enabledTools.filter((t) => ALL_TOOLS.includes(t)),
          seededNoteCreated: row.seededNoteCreated,
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

  async getArtifact(id: string): Promise<Artifact | null> {
    // Optimization: Since we don't know the type, we check the cache first
    const cache = this.loadCache<Artifact[]>('artifacts') ?? [];
    const cachedItem = cache.find((item) => item.id === id);

    // If found in cache, we know the type and can query the specific table
    if (cachedItem) {
      try {
        const table = this.getTableName(cachedItem.type);
        const resp = await this.db.queryOnce({
          [table]: { $: { where: { id } } },
        });
        const row = resp.data?.[table]?.[0] as Artifact | undefined;
        if (row) return normalizeArtifact(row);
      } catch (e) {
        console.error('Failed to load artifact from specialized table:', e);
      }
      return normalizeArtifact(cachedItem);
    }

    // If not in cache, we return null because we only support specialized tables now
    return null;
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

      const table = this.getTableName(artifactToSave.type);
      const tx = (this.db.tx as any)[table][artifactToSave.id].update(artifactToSave);
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
    const cached = this.loadCache<Artifact[]>('artifacts') ?? [];
    const item = cached.find(i => i.id === id);

    if (item) {
      try {
        const table = this.getTableName(item.type);
        const tx = (this.db.tx as any)[table][id].delete();
        await this.db.transact(tx);
      } catch (e) {
        console.error('Failed to delete artifact from InstantDB:', e);
      }
    }

    this.saveCache('artifacts', cached.filter((item) => item.id !== id));
  }

  async listArtifacts(type?: ToolType): Promise<Artifact[]> {
    try {
      let rows: Artifact[] = [];

      if (type) {
        // Query specific table
        const table = this.getTableName(type);
        const resp = await this.db.queryOnce({ [table]: {} });
        rows = (resp.data?.[table] ?? []) as Artifact[];
      } else {
        // Global gallery: Query all relevant tables
        const query = {
          blueprint_notes: {},
          blueprint_diagrams: {},
          blueprint_canvases: {},
          blueprint_boards: {},
        };
        const resp = await this.db.queryOnce(query as any);
        rows = [
          ...(resp.data?.blueprint_notes ?? []),
          ...(resp.data?.blueprint_diagrams ?? []),
          ...(resp.data?.blueprint_canvases ?? []),
          ...(resp.data?.blueprint_boards ?? []),
        ] as Artifact[];
      }

      const normalized = rows
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row));

      const sorted = normalized.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      // Update global cache for favorites/tags lookups
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
      const filtered = type ? cache.filter((row) => row.type === type) : cache;
      return filtered
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async listFavorites(): Promise<Artifact[]> {
    try {
      const all = await this.listArtifacts();
      return all.filter(a => a.favorite);
    } catch (e) {
      console.error('Failed to list favorites from InstantDB:', e);
      const cache = (this.loadCache<Artifact[]>('artifacts') ?? []).filter((row) => row.favorite);
      return cache
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  async listByTag(tag: string): Promise<Artifact[]> {
    try {
      const all = await this.listArtifacts();
      return all.filter((artifact) => artifact.tags?.includes(tag));
    } catch (e) {
      console.error('Failed to list by tag from InstantDB:', e);
      return [];
    }
  }

  // Calendar events
  async listCalendarEvents(): Promise<CalendarEventRecord[]> {
    const cached = this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];

    try {
      console.log('Blueprint: Fetching calendar events from InstantDB...');
      const resp = await this.db.queryOnce({
        [TABLE_CALENDAR_EVENTS]: {},
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
        merged.set(pending.id, pending);
      }

      const result = Array.from(merged.values());

      // SAFETY: If the DB is empty but we have local cache, and we suspect 
      // the DB might be in a restricted state (no rows ever received), 
      // preserve the cache.
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
}
