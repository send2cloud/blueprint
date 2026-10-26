import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { toast } from '../../hooks/use-toast';
import { getStorageAdapter, type BlueprintSettings } from '../../lib/storage';
import { hashPin, pinRequired, validatePin } from '../../core/setup';
import { useHost } from '../../contexts/HostContext';

export function AccessSettings() {
  const { user } = useHost();
  const [settings, setSettings] = useState<BlueprintSettings | null>(null);
  const [pinOn, setPinOn] = useState(true);
  const [pin, setPin] = useState('');

  useEffect(() => {
    getStorageAdapter().getSettings().then((s) => { setSettings(s); setPinOn(pinRequired(s)); });
  }, []);

  if (user || !settings) return null;
  const check = validatePin(pin);
  const canSave = pinOn ? check.success : pinRequired(settings);

  const save = async () => {
    const next: BlueprintSettings = pinOn
      ? { ...settings, pinEnabled: true, ...(await hashPin(pin)) }
      : { ...settings, pinEnabled: false };
    await getStorageAdapter().saveSettings(next);
    setSettings(next); setPin('');
    toast({ title: pinOn ? 'PIN updated' : 'PIN turned off' });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-foreground">Access</h2>
          <p className="text-sm text-muted-foreground">Team PIN for everyone opening this app.</p>
        </div>
        <Switch checked={pinOn} onCheckedChange={setPinOn} aria-label="Team PIN" />
      </div>
      <div className="flex items-end gap-3">
        {pinOn && (
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="new-pin" className="text-xs font-bold uppercase text-muted-foreground">New PIN</Label>
            <Input id="new-pin" type="password" inputMode="numeric" maxLength={8} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="4–8 digits" className="h-10" />
          </div>
        )}
        <Button onClick={save} disabled={!canSave} className={pinOn ? '' : 'ml-auto'}>Save</Button>
      </div>
    </div>
  );
}
