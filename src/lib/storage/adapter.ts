import type { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorage';
import { loadDbConfig, type DbConfig, type DbProvider } from './dbConfig';
import { RecordStoreAdapter } from './recordStore';
import { RestStore } from './restStore';
import { lazyAdapter } from './lazyAdapter';

export type AdapterType = DbProvider | 'host';

let currentAdapter: StorageAdapter = new LocalStorageAdapter();
let currentAdapterType: AdapterType = 'local';

export function setStorageAdapter(adapter: StorageAdapter, type: AdapterType): void {
  currentAdapter = adapter;
  currentAdapterType = type;
}

export function getStorageAdapter(): StorageAdapter {
  return currentAdapter;
}

export function getStorageAdapterType(): AdapterType {
  return currentAdapterType;
}

/** Builds the adapter for a config. Heavy SDKs load only when chosen. */
export function createAdapter(config: DbConfig): StorageAdapter {
  switch (config.provider) {
    case 'cloudflare':
      return new RecordStoreAdapter(
        new RestStore(config.url!, config.key ? { Authorization: `Bearer ${config.key}` } : {}),
      );
    case 'rest':
      return new RecordStoreAdapter(new RestStore(config.url!, config.headers ?? {}));
    case 'supabase':
      return lazyAdapter(async () => {
        const [{ createClient }, { SupabaseStore }] = await Promise.all([
          import('@supabase/supabase-js'),
          import('./supabaseStore'),
        ]);
        return new RecordStoreAdapter(new SupabaseStore(createClient(config.supabaseUrl!, config.supabaseKey!)));
      });
    case 'instantdb':
      return lazyAdapter(async () => {
        const { InstantDbAdapter } = await import('./instantDb');
        return new InstantDbAdapter(config.instantAppId!);
      });
    default:
      return new LocalStorageAdapter();
  }
}

export function initializeStorageAdapter(): StorageAdapter {
  if (currentAdapterType === 'host') return currentAdapter;
  const config = loadDbConfig();
  setStorageAdapter(config ? createAdapter(config) : new LocalStorageAdapter(), config?.provider ?? 'local');
  return currentAdapter;
}
