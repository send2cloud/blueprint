import { init } from '@instantdb/react';
import { StorageAdapter, BlueprintSettings, Artifact, ToolType, ALL_TOOLS, CalendarEventRecord } from './types';
import { normalizeArtifact, CURRENT_SCHEMA_VERSION } from './schema';

const SETTINGS_ID = 'settings';
const TABLE_SETTINGS = 'blueprint_settings';
const TABLE_ARTIFACTS = 'blueprint_artifacts';
const TABLE_CALENDAR_EVENTS = 'blueprint_calendar_events';

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
    try {
      const resp = await this.db.queryOnce({
        [TABLE_ARTIFACTS]: {
          $: { where: { id } },
        },
      });
      const row = resp.data?.[TABLE_ARTIFACTS]?.[0] as Artifact | undefined;
      if (row) {
        const normalized = normalizeArtifact(row);
        if (normalized) return normalized;
      }
    } catch (e) {
      console.error('Failed to load artifact from InstantDB:', e);
    }
    const cache = this.loadCache<Artifact[]>('artifacts') ?? [];
    return cache.find((item) => item.id === id) ?? null;
  }

  async saveArtifact(artifact: Artifact): Promise<void> {
    try {
      const artifactWithFavorite = normalizeArtifact({
        ...artifact,
        favorite: artifact.favorite ?? false,
        pinned: artifact.pinned ?? false,
        schemaVersion: artifact.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      });
      if (!artifactWithFavorite) return;
      const tx = (this.db.tx as any)[TABLE_ARTIFACTS][artifactWithFavorite.id].update(artifactWithFavorite);
      await this.db.transact(tx);
      const cached = this.loadCache<Artifact[]>('artifacts') ?? [];
      const next = cached.filter((item) => item.id !== artifactWithFavorite.id);
      next.unshift(artifactWithFavorite);
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
      const cached = this.loadCache<Artifact[]>('artifacts') ?? [];
      this.saveCache('artifacts', cached.filter((item) => item.id !== id));
    } catch (e) {
      console.error('Failed to delete artifact from InstantDB:', e);
    }
  }

  async listArtifacts(type?: ToolType): Promise<Artifact[]> {
    try {
      const resp = await this.db.queryOnce({
        [TABLE_ARTIFACTS]: {},
      });
      const rows = (resp.data?.[TABLE_ARTIFACTS] ?? []) as Artifact[];
      const normalized = rows
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row));
      const filtered = type ? normalized.filter((row) => row.type === type) : normalized;
      const sorted = filtered.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      this.saveCache('artifacts', sorted);
      return sorted
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
      const resp = await this.db.queryOnce({
        [TABLE_ARTIFACTS]: {
          $: { where: { favorite: true } },
        },
      });
      const rows = (resp.data?.[TABLE_ARTIFACTS] ?? []) as Artifact[];
      const normalized = rows
        .map((row) => normalizeArtifact(row))
        .filter((row): row is Artifact => Boolean(row));
      return normalized.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
    try {
      const resp = await this.db.queryOnce({
        [TABLE_CALENDAR_EVENTS]: {},
      });
      const rows = (resp.data?.[TABLE_CALENDAR_EVENTS] ?? []) as CalendarEventRecord[];
      this.saveCache('calendar_events', rows);
      return rows;
    } catch (e) {
      console.error('Failed to list calendar events from InstantDB:', e);
      return this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];
    }
  }

  async saveCalendarEvent(event: CalendarEventRecord): Promise<void> {
    try {
      const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][event.id].update(event);
      await this.db.transact(tx);
      const cached = this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];
      const next = cached.filter((e) => e.id !== event.id);
      next.push(event);
      this.saveCache('calendar_events', next);
    } catch (e) {
      console.error('Failed to save calendar event to InstantDB:', e);
    }
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    try {
      const tx = (this.db.tx as any)[TABLE_CALENDAR_EVENTS][id].delete();
      await this.db.transact(tx);
      const cached = this.loadCache<CalendarEventRecord[]>('calendar_events') ?? [];
      this.saveCache('calendar_events', cached.filter((e) => e.id !== id));
    } catch (e) {
      console.error('Failed to delete calendar event from InstantDB:', e);
    }
  }
}
