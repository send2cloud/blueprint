import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorage';
import { loadDbConfig } from './dbConfig';
import { InstantDbAdapter } from './instantDb';

let currentAdapter: StorageAdapter = new LocalStorageAdapter();
let currentAdapterType: 'localStorage' | 'instantdb' = 'localStorage';

export function setStorageAdapter(adapter: StorageAdapter, type: 'localStorage' | 'instantdb'): void {
  currentAdapter = adapter;
  currentAdapterType = type;
}

export function getStorageAdapter(): StorageAdapter {
  return currentAdapter;
}

/**
 * Returns the current storage adapter type for UI display
 */
export function getStorageAdapterType(): 'localStorage' | 'instantdb' {
  return currentAdapterType;
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
  console.log('[Storage] Checking VITE_INSTANT_APP_ID:', envAppId ? 'present' : 'missing');
  if (envAppId && typeof envAppId === 'string' && envAppId.trim()) {
    console.log('[Storage] Using env var InstantDB App ID');
    return envAppId.trim();
  }
  
  // Fall back to localStorage config (for embedded installations)
  const config = loadDbConfig();
  console.log('[Storage] Checking localStorage config:', config);
  if (config?.provider === 'instantdb' && config.instantAppId) {
    console.log('[Storage] Using localStorage InstantDB App ID');
    return config.instantAppId;
  }
  
  console.log('[Storage] No InstantDB App ID found, using localStorage');
  return null;
}

export function initializeStorageAdapter(): StorageAdapter {
  console.log('[Storage] Initializing storage adapter...');
  const instantAppId = getInstantAppId();
  
  if (instantAppId) {
    console.log('[Storage] Creating InstantDbAdapter');
    setStorageAdapter(new InstantDbAdapter(instantAppId), 'instantdb');
  } else {
    console.log('[Storage] Creating LocalStorageAdapter');
    setStorageAdapter(new LocalStorageAdapter(), 'localStorage');
  }
  console.log('[Storage] Adapter initialized:', currentAdapterType);
  return currentAdapter;
}
