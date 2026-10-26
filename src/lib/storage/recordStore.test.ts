import { describe, it, expect } from 'vitest';
import { RecordStoreAdapter, type RecordStore, type RecordKind } from './recordStore';
import { validateDbConfig } from './dbConfig';

function memoryStore(): RecordStore {
  const m = new Map<string, any>();
  return {
    async list(kind: RecordKind) { return [...m].filter(([k]) => k.startsWith(kind + ':')).map(([, v]) => v); },
    async get(kind, id) { return m.get(`${kind}:${id}`) ?? null; },
    async put(kind, r) { m.set(`${kind}:${r.id}`, r); },
    async remove(kind, id) { m.delete(`${kind}:${id}`); },
  };
}

const art = (id: string, extra: object = {}) => ({
  id, type: 'notes' as const, name: id, data: {}, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  favorite: false, pinned: false, schemaVersion: 1, projectId: 'p1', ...extra,
});

describe('RecordStoreAdapter', () => {
  it('filters artifacts by project, favorite and tag', async () => {
    const a = new RecordStoreAdapter(memoryStore());
    await a.saveArtifact(art('a', { favorite: true, tags: ['x'] }));
    await a.saveArtifact(art('b', { projectId: 'p2' }));
    expect((await a.listArtifacts(undefined, 'p1')).map((x) => x.id)).toEqual(['a']);
    expect((await a.listFavorites()).map((x) => x.id)).toEqual(['a']);
    expect((await a.listByTag('x')).map((x) => x.id)).toEqual(['a']);
  });

  it('round-trips settings', async () => {
    const a = new RecordStoreAdapter(memoryStore());
    await a.saveSettings({ enabledTools: ['notes'] });
    expect((await a.getSettings()).enabledTools).toEqual(['notes']);
  });
});

describe('validateDbConfig', () => {
  it('requires a URL for Cloudflare', () => {
    expect(validateDbConfig({ provider: 'cloudflare' })).not.toBeNull();
    expect(validateDbConfig({ provider: 'cloudflare', url: 'https://x.workers.dev' })).toBeNull();
  });
  it('requires URL and key for Supabase', () => {
    expect(validateDbConfig({ provider: 'supabase', supabaseUrl: 'https://x.supabase.co' })).not.toBeNull();
  });
});
