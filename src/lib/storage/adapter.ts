import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorage';
import { loadDbConfig } from './dbConfig';
import { InstantDbAdapter } from './instantDb';

let currentAdapter: StorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(adapter: StorageAdapter): void {
  currentAdapter = adapter;
}

export function getStorageAdapter(): StorageAdapter {
  return currentAdapter;
}

/**
 * Returns the InstantDB App ID to use, checking in order:
 * 1. Environment variable VITE_INSTANT_APP_ID (set via Lovable secrets)
 * 2. User-configured value from Settings (stored in localStorage)
 * 
 * When the app is copied to another project, the env var won't exist,
 * so it falls back to requiring manual configuration in Settings.
 */
export function getInstantAppId(): string | null {
  // Check env var first (for standalone published app)
  const envAppId = import.meta.env.VITE_INSTANT_APP_ID;
  if (envAppId && typeof envAppId === 'string' && envAppId.trim()) {
    return envAppId.trim();
  }
  
  // Fall back to localStorage config (for embedded installations)
  const config = loadDbConfig();
  if (config?.provider === 'instantdb' && config.instantAppId) {
    return config.instantAppId;
  }
  
  return null;
}

export function initializeStorageAdapter(): StorageAdapter {
  const instantAppId = getInstantAppId();
  
  if (instantAppId) {
    setStorageAdapter(new InstantDbAdapter(instantAppId));
  } else {
    setStorageAdapter(new LocalStorageAdapter());
  }
  return currentAdapter;
}
