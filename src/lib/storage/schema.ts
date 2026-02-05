import { Artifact, ToolType, ALL_TOOLS } from './types';

export const CURRENT_SCHEMA_VERSION = 1;

function isValidToolType(value: unknown): value is ToolType {
  return typeof value === 'string' && (ALL_TOOLS as string[]).includes(value);
}

function safeIsoDate(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const time = Date.parse(value);
  return Number.isNaN(time) ? fallback : new Date(time).toISOString();
}

export function normalizeArtifact(raw: Partial<Artifact> | null | undefined): Artifact | null {
  if (!raw || typeof raw !== 'object') return null;
  if (!raw.id || typeof raw.id !== 'string') return null;
  if (!isValidToolType(raw.type)) return null;

  const now = new Date().toISOString();
  const createdAt = safeIsoDate(raw.createdAt, now);
  const updatedAt = safeIsoDate(raw.updatedAt, createdAt);

  const normalized: Artifact = {
    id: raw.id,
    type: raw.type,
    name: typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name : 'Untitled',
    data: raw.data ?? null,
    createdAt,
    updatedAt,
    favorite: Boolean(raw.favorite),
    pinned: Boolean(raw.pinned),
    schemaVersion:
      typeof raw.schemaVersion === 'number' && raw.schemaVersion > 0
        ? raw.schemaVersion
        : CURRENT_SCHEMA_VERSION,
  };

  return migrateArtifact(normalized);
}

function migrateArtifact(artifact: Artifact): Artifact {
  let current = { ...artifact };
  if (!current.schemaVersion || current.schemaVersion < 1) {
    current = { ...current, schemaVersion: 1 };
  }

  if (current.pinned === undefined) {
    current = { ...current, pinned: false };
  }

  if (current.schemaVersion > CURRENT_SCHEMA_VERSION) {
    current.schemaVersion = CURRENT_SCHEMA_VERSION;
  }

  return current;
}
