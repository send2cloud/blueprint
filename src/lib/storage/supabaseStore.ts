import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecordKind, RecordStore } from './recordStore';

/**
 * Supabase record store. Uses one table (see docs: SUPABASE_SQL):
 *   blueprint_records(kind text, id text, data jsonb, updated_at timestamptz, primary key(kind,id))
 */
export const SUPABASE_SQL = `create table if not exists public.blueprint_records (
  kind text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (kind, id)
);
alter table public.blueprint_records enable row level security;
-- Open access for a trusted team. Tighten with auth rules before going public.
create policy "blueprint open" on public.blueprint_records for all using (true) with check (true);
grant select, insert, update, delete on public.blueprint_records to anon, authenticated;`;

const TABLE = 'blueprint_records';

export class SupabaseStore implements RecordStore {
  constructor(private client: SupabaseClient) {}

  async list<T>(kind: RecordKind): Promise<T[]> {
    const { data, error } = await this.client.from(TABLE).select('data').eq('kind', kind);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { data: T }) => r.data);
  }

  async get<T>(kind: RecordKind, id: string): Promise<T | null> {
    const { data, error } = await this.client.from(TABLE).select('data').eq('kind', kind).eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.data as T) ?? null;
  }

  async put<T extends { id: string }>(kind: RecordKind, record: T): Promise<void> {
    const { error } = await this.client
      .from(TABLE)
      .upsert({ kind, id: record.id, data: record, updated_at: new Date().toISOString() });
    if (error) throw new Error(error.message);
  }

  async remove(kind: RecordKind, id: string): Promise<void> {
    const { error } = await this.client.from(TABLE).delete().eq('kind', kind).eq('id', id);
    if (error) throw new Error(error.message);
  }
}
