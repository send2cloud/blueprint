import { useEffect, useState, type ReactNode } from 'react';
import { getStorageAdapter, getStorageAdapterType, isEnvConfig, type BlueprintSettings } from '../../lib/storage';
import { needsSetup, pinRequired, verifyPin } from '../../core/setup';
import { useHost } from '../../contexts/HostContext';
import { PinGate, usePinGate } from '../PinGate';
import { SetupWizard } from './SetupWizard';

type State = { phase: 'loading' } | { phase: 'setup' } | { phase: 'ready'; settings: BlueprintSettings };

/** Decides between: host user (skip all), setup wizard, PIN screen, or the app. */
export function AccessGate({ children }: { children: ReactNode }) {
  const { user } = useHost();
  const { authenticated, authenticate } = usePinGate();
  const [state, setState] = useState<State>({ phase: 'loading' });

  const load = () => {
    const storage = getStorageAdapter();
    Promise.all([storage.getSettings(), storage.getProjects()])
      .then(([settings, projects]) =>
        setState(needsSetup(settings, projects.length) ? { phase: 'setup' } : { phase: 'ready', settings }))
      .catch(() => setState({ phase: 'ready', settings: { enabledTools: [] } }));
  };

  useEffect(() => { if (!user) load(); }, [user]);

  if (user) return <>{children}</>;
  if (state.phase === 'loading') {
    return <div className="min-h-[100dvh] flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (state.phase === 'setup') {
    const locked = getStorageAdapterType() === 'host' || isEnvConfig();
    return <SetupWizard backendLocked={locked} onDone={() => { authenticate(true); load(); }} />;
  }
  if (pinRequired(state.settings) && !authenticated) {
    return <PinGate onSuccess={authenticate} verify={(pin) => verifyPin(pin, state.settings)} />;
  }
  return <>{children}</>;
}
