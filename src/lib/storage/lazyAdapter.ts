import type { StorageAdapter } from './types';

/**
 * Wraps an adapter that must be loaded asynchronously (heavy SDKs like
 * Supabase / InstantDB) so the SDK is only downloaded when that backend is picked.
 */
export function lazyAdapter(load: () => Promise<StorageAdapter>): StorageAdapter {
  let p: Promise<StorageAdapter> | null = null;
  const get = () => (p ??= load());
  return new Proxy({} as StorageAdapter, {
    get(_t, prop: string) {
      return (...args: unknown[]) =>
        get().then((a) => (a as any)[prop](...args));
    },
  });
}
