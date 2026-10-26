import { useState } from 'react';
import { Database, Copy } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../../hooks/use-toast';
import {
  loadDbConfig, saveDbConfig, validateDbConfig, getStorageAdapterType, createAdapter,
  type DbConfig, type DbProvider,
} from '../../lib/storage';
import { SUPABASE_SQL } from '../../lib/storage/supabaseStore';

const LABELS: Record<DbProvider, string> = {
  local: 'Browser only',
  cloudflare: 'Cloudflare',
  supabase: 'Supabase',
  instantdb: 'InstantDB',
  rest: 'Custom',
};

const HINTS: Record<DbProvider, string> = {
  local: "Saved in this browser. Won't sync.",
  cloudflare: 'Your Blueprint Worker + D1. See worker/README.',
  supabase: 'Run the setup script once in your Supabase SQL editor.',
  instantdb: 'Hosted or self-hosted InstantDB.',
  rest: 'Any backend serving /records/:kind/:id.',
};

function Field({ id, label, value, onChange, placeholder, secret }: {
  id: string; label: string; value?: string; onChange: (v: string) => void; placeholder?: string; secret?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-bold uppercase text-muted-foreground">{label}</Label>
      <Input id={id} type={secret ? 'password' : 'text'} value={value ?? ''} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className="h-10" autoComplete="off" />
    </div>
  );
}

export function BackendSettings() {
  const initial = loadDbConfig() ?? { provider: 'local' as DbProvider };
  const [cfg, setCfg] = useState<DbConfig>(initial);
  const [headersText, setHeadersText] = useState(JSON.stringify(initial.headers ?? {}));
  const fromHost = getStorageAdapterType() === 'host';
  const fromEnv = initial.source === 'env';
  const locked = fromHost || fromEnv;
  const set = (patch: Partial<DbConfig>) => setCfg((c) => ({ ...c, ...patch }));

  let headers: Record<string, string> | undefined;
  let headersError: string | null = null;
  if (cfg.provider === 'rest') {
    try { headers = JSON.parse(headersText || '{}'); } catch { headersError = 'Headers must be JSON'; }
  }
  const error = headersError ?? validateDbConfig(cfg);

  const [testing, setTesting] = useState(false);
  const save = async () => {
    const next = { ...cfg, headers };
    if (next.provider !== 'local') {
      setTesting(true);
      try {
        await Promise.race([
          createAdapter(next).getProjects(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('Timed out')), 10_000)),
        ]);
      } catch (e) {
        setTesting(false);
        toast({ title: "Couldn't connect", description: e instanceof Error ? e.message : String(e), variant: 'destructive' });
        return;
      }
    }
    saveDbConfig(next);
    toast({ title: `Backend: ${LABELS[cfg.provider]}`, description: 'Reloading…' });
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10"><Database className="h-5 w-5 text-primary" /></div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Backend</h2>
          <p className="text-sm text-muted-foreground">
            {fromHost ? 'Provided by host app.' : fromEnv ? `${LABELS[cfg.provider]} — set at build time.` : HINTS[cfg.provider]}
          </p>
        </div>
      </div>

      {!locked && (
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="db-provider" className="text-xs font-bold uppercase text-muted-foreground">Store in</Label>
            <Select value={cfg.provider} onValueChange={(v) => set({ provider: v as DbProvider })}>
              <SelectTrigger id="db-provider" className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LABELS) as DbProvider[]).map((p) => (
                  <SelectItem key={p} value={p}>{LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(cfg.provider === 'cloudflare' || cfg.provider === 'rest') && (
            <Field id="db-url" label="Worker URL" value={cfg.url} onChange={(url) => set({ url })}
              placeholder="https://blueprint.yourname.workers.dev" />
          )}
          {cfg.provider === 'cloudflare' && (
            <Field id="db-key" label="Write key" secret value={cfg.key} onChange={(key) => set({ key })} />
          )}
          {cfg.provider === 'rest' && (
            <Field id="db-headers" label='Headers (JSON)' value={headersText} onChange={setHeadersText}
              placeholder='{"Authorization":"Bearer …"}' />
          )}
          {cfg.provider === 'supabase' && (
            <>
              <Field id="sb-url" label="Project URL" value={cfg.supabaseUrl} onChange={(supabaseUrl) => set({ supabaseUrl })}
                placeholder="https://xyz.supabase.co" />
              <Field id="sb-key" label="Publishable key" value={cfg.supabaseKey} onChange={(supabaseKey) => set({ supabaseKey })} />
              <Button variant="outline" size="sm" className="w-fit"
                onClick={() => { navigator.clipboard.writeText(SUPABASE_SQL); toast({ title: 'Setup script copied' }); }}>
                <Copy className="h-3.5 w-3.5 mr-2" />Copy setup script
              </Button>
            </>
          )}
          {cfg.provider === 'instantdb' && (
            <Field id="instant-app-id" label="App ID" value={cfg.instantAppId} onChange={(instantAppId) => set({ instantAppId })} />
          )}

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
            <p className="text-xs text-destructive">{error ?? ''}</p>
            <Button onClick={save} disabled={!!error || testing} className="px-8">{testing ? 'Testing…' : 'Save & Connect'}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
