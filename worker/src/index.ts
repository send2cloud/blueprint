/**
 * Blueprint backend on Cloudflare Workers + D1.
 * Implements the REST record API used by Blueprint's Cloudflare/Custom backends:
 *   GET    /records/:kind        GET /records/:kind/:id
 *   PUT    /records/:kind/:id    DELETE /records/:kind/:id
 * Writes require `Authorization: Bearer <WRITE_KEY>` (anti-bot).
 */
export interface Env {
  DB: D1Database;
  WRITE_KEY: string;
  /** Comma-separated extra allowed origins (host app domains). */
  ALLOWED_ORIGINS?: string;
}

const KINDS = new Set(['settings', 'projects', 'artifacts', 'events']);

function allowedOrigin(origin: string | null, env: Env): string | null {
  if (!origin) return null;
  const extra = (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (extra.includes(origin)) return origin;
  try {
    const host = new URL(origin).hostname;
    if (host === 'localhost' || host.endsWith('.lovable.app') || host.endsWith('.lovableproject.com') || host.endsWith('.workers.dev')) return origin;
  } catch { /* ignore */ }
  return null;
}

function cors(origin: string | null): HeadersInit {
  return origin
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        Vary: 'Origin',
      }
    : {};
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = allowedOrigin(req.headers.get('Origin'), env);
    const h = cors(origin);
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...h, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });

    const [, root, kind, rawId] = new URL(req.url).pathname.split('/');
    if (root !== 'records' || !KINDS.has(kind)) return json({ error: 'not found' }, 404);
    const id = rawId ? decodeURIComponent(rawId) : undefined;

    if (req.method !== 'GET') {
      if (req.headers.get('Authorization') !== `Bearer ${env.WRITE_KEY}`) return json({ error: 'unauthorized' }, 401);
    }

    if (req.method === 'GET' && !id) {
      const { results } = await env.DB.prepare('SELECT data FROM records WHERE kind = ?').bind(kind).all<{ data: string }>();
      return json(results.map((r) => JSON.parse(r.data)));
    }
    if (!id) return json({ error: 'id required' }, 400);

    if (req.method === 'GET') {
      const row = await env.DB.prepare('SELECT data FROM records WHERE kind = ? AND id = ?').bind(kind, id).first<{ data: string }>();
      return row ? json(JSON.parse(row.data)) : json({ error: 'not found' }, 404);
    }
    if (req.method === 'PUT') {
      const body = await req.text();
      if (body.length > 5_000_000) return json({ error: 'too large' }, 413);
      JSON.parse(body); // reject invalid JSON
      await env.DB.prepare(
        'INSERT INTO records (kind, id, data, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(kind, id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at',
      ).bind(kind, id, body, new Date().toISOString()).run();
      return json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM records WHERE kind = ? AND id = ?').bind(kind, id).run();
      return json({ ok: true });
    }
    return json({ error: 'method not allowed' }, 405);
  },
};
