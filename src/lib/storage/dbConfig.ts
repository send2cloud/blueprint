export type DbProvider = 'local' | 'instantdb';

export interface DbConfig {
  provider: DbProvider;
  instantAppId?: string;
}

const DB_CONFIG_KEY = 'blueprint:db-config';

export function loadDbConfig(): DbConfig | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DB_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DbConfig>;
    if (parsed.provider === 'local') {
      return { provider: 'local' };
    }
    if (parsed.provider === 'instantdb') {
      if (!parsed.instantAppId || typeof parsed.instantAppId !== 'string') return null;
      return { provider: 'instantdb', instantAppId: parsed.instantAppId.trim() };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDbConfig(config: DbConfig): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
}

export function clearDbConfig(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DB_CONFIG_KEY);
}
