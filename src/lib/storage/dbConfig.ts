export type DbProvider = 'local' | 'instantdb';

export interface DbConfig {
  provider: DbProvider;
  instantAppId?: string;
  source?: 'env' | 'localStorage';
}

const DB_CONFIG_KEY = 'blueprint:db-config';

/**
 * Check for build-time environment variable first.
 * This allows the App ID to be baked into published builds.
 */
function getEnvAppId(): string | null {
  try {
    const envId = import.meta.env.VITE_INSTANTDB_APP_ID;
    if (envId && typeof envId === 'string' && envId.trim().length > 0) {
      return envId.trim();
    }
  } catch {
    // Environment not available
  }
  return null;
}

export function loadDbConfig(): DbConfig | null {
  // Priority 1: Environment variable (baked into build)
  const envAppId = getEnvAppId();
  if (envAppId) {
    return { provider: 'instantdb', instantAppId: envAppId, source: 'env' };
  }

  // Priority 2: localStorage (user-configured in Settings)
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DB_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DbConfig>;
    if (parsed.provider === 'local') {
      return { provider: 'local', source: 'localStorage' };
    }
    if (parsed.provider === 'instantdb') {
      if (!parsed.instantAppId || typeof parsed.instantAppId !== 'string') return null;
      return { provider: 'instantdb', instantAppId: parsed.instantAppId.trim(), source: 'localStorage' };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true if config is from environment variable (read-only)
 */
export function isEnvConfig(): boolean {
  return getEnvAppId() !== null;
}

export function saveDbConfig(config: DbConfig): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(config));
}

export function clearDbConfig(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DB_CONFIG_KEY);
}
