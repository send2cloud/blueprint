import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { BackendSettings } from '../settings/BackendSettings';
import {
  setupSteps, validatePin, validateWorkspaceName, hashPin, slugify, type SetupStep,
} from '../../core/setup';
import { getStorageAdapter, loadDbConfig, type BlueprintSettings } from '../../lib/storage';

const TITLES: Record<SetupStep, string> = {
  backend: 'Where to save',
  access: 'Access',
  workspace: 'Workspace',
  done: 'Ready',
};

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / d + 2) * 60 : ((r - g) / d + 4) * 60;
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function SetupWizard({ backendLocked, onDone }: { backendLocked: boolean; onDone: () => void }) {
  const steps = setupSteps(backendLocked || loadDbConfig() !== null);
  const [i, setI] = useState(0);
  const step = steps[i];
  const next = () => setI((n) => Math.min(n + 1, steps.length - 1));

  const [pinOn, setPinOn] = useState(true);
  const [pin, setPin] = useState('');
  const [name, setName] = useState('Idearoom');
  const [color, setColor] = useState('#4ecdc4');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pinCheck = pinOn ? validatePin(pin) : null;
  const nameCheck = validateWorkspaceName(name);

  const finish = async () => {
    setBusy(true); setErr(null);
    try {
      const storage = getStorageAdapter();
      const current = await storage.getSettings();
      const access: Partial<BlueprintSettings> = pinOn ? { pinEnabled: true, ...(await hashPin(pin)) } : { pinEnabled: false };
      const now = new Date().toISOString();
      await storage.saveProject({
        id: crypto.randomUUID(), name: nameCheck.data!, slug: slugify(nameCheck.data!),
        color: hexToHsl(color), createdAt: now, updatedAt: now,
      });
      await storage.saveSettings({ ...current, ...access, setupComplete: true });
      next();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Setup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <ol className="flex gap-2">
          {steps.map((s, n) => (
            <li key={s} className={`flex-1 h-1 rounded-full ${n <= i ? 'bg-primary' : 'bg-muted'}`} aria-label={TITLES[s]} />
          ))}
        </ol>
        <h1 className="text-2xl font-semibold text-foreground">{TITLES[step]}</h1>

        {step === 'backend' && <BackendSettings />}

        {step === 'access' && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="pin-on">Team PIN</Label>
              <Switch id="pin-on" checked={pinOn} onCheckedChange={setPinOn} />
            </div>
            {pinOn && (
              <div className="space-y-1.5">
                <Input id="pin" inputMode="numeric" type="password" maxLength={8} value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="4–8 digits" className="h-11" />
                {pin && !pinCheck?.success && <p className="text-xs text-destructive">{pinCheck?.error}</p>}
              </div>
            )}
            {!pinOn && <p className="text-xs text-muted-foreground">Anyone with the link can open it.</p>}
            <Button className="w-full" disabled={pinOn && !pinCheck?.success} onClick={next}>Next</Button>
          </div>
        )}

        {step === 'workspace' && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Name</Label>
              <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
              <p className="text-xs text-muted-foreground">/{slugify(name)}</p>
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="size-10 rounded-md border border-border bg-transparent cursor-pointer" aria-label="Colour" />
              <span className="text-sm text-muted-foreground">Colour</span>
            </div>
            {err && <p className="text-xs text-destructive">{err}</p>}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setI(i - 1)}>Back</Button>
              <Button className="flex-1" disabled={!nameCheck.success || busy} onClick={finish}>
                {busy ? 'Saving…' : 'Create workspace'}
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <p className="flex items-center gap-2 text-foreground"><Check className="h-4 w-4 text-primary" />Setup saved.</p>
            {!backendLocked && loadDbConfig()?.provider !== 'local' && (
              <p className="text-xs text-muted-foreground">
                The backend choice is saved in this browser. To use it on every device, set the build settings in README → Storage Configuration.
              </p>
            )}
            <Button className="w-full" onClick={onDone}>Open {name.trim()}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
