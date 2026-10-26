import type { RecordKind, RecordStore } from './recordStore';

/**
 * REST record store. Speaks a tiny JSON API that any backend can implement:
 *   GET    {base}/records/:kind          -> T[]
 *   GET    {base}/records/:kind/:id      -> T | 404
 *   PUT    {base}/records/:kind/:id      body: T
 *   DELETE {base}/records/:kind/:id
 * The bundled Cloudflare Worker (worker/) implements exactly this.
 */
export class RestStore implements RecordStore {
  private base: string;
  constructor(baseUrl: string, private headers: Record<string, string> = {}) {
    this.base = baseUrl.replace(/\/+$/, '');
  }

  private async req(path: string, init: RequestInit = {}): Promise<Response> {
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...this.headers, ...(init.headers ?? {}) },
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Blueprint backend ${init.method ?? 'GET'} ${path} failed: ${res.status}`);
    }
    return res;
  }

  async list<T>(kind: RecordKind): Promise<T[]> {
    const res = await this.req(`/records/${kind}`);
    return res.status === 404 ? [] : ((await res.json()) as T[]);
  }

  async get<T>(kind: RecordKind, id: string): Promise<T | null> {
    const res = await this.req(`/records/${kind}/${encodeURIComponent(id)}`);
    return res.status === 404 ? null : ((await res.json()) as T);
  }

  async put<T extends { id: string }>(kind: RecordKind, record: T): Promise<void> {
    await this.req(`/records/${kind}/${encodeURIComponent(record.id)}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  }

  async remove(kind: RecordKind, id: string): Promise<void> {
    await this.req(`/records/${kind}/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
