import { StorageAdapter } from './types';
import { LocalStorageAdapter } from './localStorage';

let currentAdapter: StorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(adapter: StorageAdapter): void {
  currentAdapter = adapter;
}

export function getStorageAdapter(): StorageAdapter {
  return currentAdapter;
}
