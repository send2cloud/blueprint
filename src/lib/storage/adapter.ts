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
 * Returns the InstantDB App ID from Settings (localStorage config).
 * This is the single source of truth - configure in Settings page.
 */
export function getInstantAppId(): string | null {
  const config = loadDbConfig();
  if (config?.provider === 'instantdb' && config.instantAppId) {
    return config.instantAppId;
  }
  return null;
}

export function initializeStorageAdapter(): StorageAdapter {
  const instantAppId = getInstantAppId();
  
  if (instantAppId) {
    setStorageAdapter(new InstantDbAdapter(instantAppId), 'instantdb');
  } else {
    setStorageAdapter(new LocalStorageAdapter(), 'localStorage');
  }
  return currentAdapter;
}
