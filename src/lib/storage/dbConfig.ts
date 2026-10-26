/**
 * Which backend Blueprint stores data in.
 * - local:      this browser only
 * - cloudflare: bundled Cloudflare Worker + D1 (worker/)
 * - supabase:   one table in the host's Supabase project
 * - instantdb:  InstantDB (hosted or self-hosted)
 * - rest:       any backend implementing the REST record API
 */
export type DbProvider = 'local' | 'cloudflare' | 'supabase' | 'instantdb' | 'rest';

export const DB_PROVIDERS: DbProvider[] = ['local', 'cloudflare', 'supabase', 'instantdb', 'rest'];

export interface DbConfig {
  provider: DbProvider;
  /** cloudflare / rest base URL */
  url?: string;
  /** cloudflare write key (sent as Authorization: Bearer) */
  key?: string;
  /** rest extra headers */
  headers?: Record<string, string>;
  supabaseUrl?: string;
  supabaseKey?: string;
  instantAppId?: string;
  source?: 'env' | 'localStorage';
}

const DB_CONFIG_KEY = 'blueprint:db-config';

function env(name: string): string | undefined {
  try {
    const v = (import.meta.env as Record<string, string | undefined>)[name];
    return v && v.trim() ? v.trim() : undefined;
  } catch {
    return undefined;
  }
}

/** Build-time config baked into published builds. */
export function loadEnvConfig(): DbConfig | null {
  const provider = env('VITE_BLUEPRINT_BACKEND') as DbProvider | undefined;
  const instantAppId = env('VITE_INSTANTDB_APP_ID');
  const resolved: DbProvider | undefined = provider ?? (instantAppId ? 'instantdb' : undefined);
  if (!resolved || !DB_PROVIDERS.includes(resolved)) return null;
  const cfg: DbConfig = {
    provider: resolved,
    url: env('VITE_BLUEPRINT_BACKEND_URL'),
    key: env('VITE_BLUEPRINT_BACKEND_KEY'),
    supabaseUrl: env('VITE_BLUEPRINT_SUPABASE_URL'),
    supabaseKey: env('VITE_BLUEPRINT_SUPABASE_KEY'),
    instantAppId,
    source: 'env',
  };
  return validateDbConfig(cfg) ? null : cfg;
}

/** Returns an error message, or null if the config is usable. */
export function validateDbConfig(c: DbConfig): string | null {
  switch (c.provider) {
    case 'local':
      return null;
    case 'cloudflare':
    case 'rest':
      return c.url && /^https?:\/\//.test(c.url) ? null : 'A valid https URL is required';
    case 'supabase':
      if (!c.supabaseUrl || !/^https?:\/\//.test(c.supabaseUrl)) return 'Supabase project URL is required';
      return c.supabaseKey ? null : 'Supabase publishable key is required';
    case 'instantdb':
      return c.instantAppId ? null : 'InstantDB App ID is required';
    default:
      return 'Unknown backend';
  }
}

export function loadDbConfig(): DbConfig | null {
  const fromEnv = loadEnvConfig();
  if (fromEnv) return fromEnv;
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DB_CONFIG_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DbConfig;
    if (!DB_PROVIDERS.includes(parsed.provider) || validateDbConfig(parsed)) return null;
    return { ...parsed, source: 'localStorage' };
  } catch {
    return null;
  }
}

export function isEnvConfig(): boolean {
  return loadEnvConfig() !== null;
}

export function saveDbConfig(config: DbConfig): void {
  if (typeof localStorage === 'undefined') return;
  const { source: _s, ...rest } = config;
  localStorage.setItem(DB_CONFIG_KEY, JSON.stringify(rest));
}

export function clearDbConfig(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(DB_CONFIG_KEY);
}
