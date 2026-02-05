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

export function initializeStorageAdapter(): StorageAdapter {
  const config = loadDbConfig();
  if (config?.provider === 'instantdb' && config.instantAppId) {
    setStorageAdapter(new InstantDbAdapter(config.instantAppId));
  } else {
    setStorageAdapter(new LocalStorageAdapter());
  }
  return currentAdapter;
}
