import { Settings, Database, Eye, EyeOff } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { ALL_TOOLS, initializeStorageAdapter, loadDbConfig, saveDbConfig, getStorageAdapter, isEnvConfig } from '@/lib/storage';
import { normalizeArtifact, CURRENT_SCHEMA_VERSION } from '@/lib/storage/schema';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { enabledTools, toggleTool, loading } = useBlueprint();
  const storage = useMemo(() => getStorageAdapter(), []);
  const [provider, setProvider] = useState<'local' | 'instantdb'>('local');
  const [instantAppId, setInstantAppId] = useState('');
  const [showFullId, setShowFullId] = useState(false);
  const [savedId, setSavedId] = useState('');
  const [isFromEnv, setIsFromEnv] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const envConfigured = isEnvConfig();
    setIsFromEnv(envConfigured);
    
    const config = loadDbConfig();
    if (config?.provider === 'instantdb') {
      setProvider('instantdb');
      const id = config.instantAppId ?? '';
      setInstantAppId(id);
      setSavedId(id);
    } else if (config?.provider === 'local') {
      setProvider('local');
    }
  }, []);

  const isSaveDisabled = useMemo(() => {
    if (provider === 'local') return false;
    return instantAppId.trim().length === 0;
  }, [provider, instantAppId]);

  const handleSave = () => {
    const isNewId = provider === 'instantdb' && instantAppId.trim() !== savedId;

    if (provider === 'local') {
      saveDbConfig({ provider: 'local' });
      initializeStorageAdapter();
      toast({
        title: 'Using Local Storage',
        description: 'Blueprint will store artifacts in this browser only.',
      });
    } else {
      const trimmed = instantAppId.trim();
      if (!trimmed) {
        toast({
          title: 'Instant App ID required',
          description: 'Paste the Instant App ID from your host project.',
          variant: 'destructive',
        });
        return;
      }

      // If ID changed, clear old caches to prevent data leaking
      if (isNewId && savedId) {
        try {
          const prefix = `blueprint:instant:${savedId}`;
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith(prefix)) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.error('Failed to clear old caches:', e);
        }
      }

      saveDbConfig({ provider: 'instantdb', instantAppId: trimmed });
      initializeStorageAdapter();

      toast({
        title: isNewId ? 'Database Switched' : 'Connected to InstantDB',
        description: isNewId
          ? 'Switched to a new project. Caches cleared and loading new data.'
          : 'Blueprint will now store artifacts in your project database.',
      });
    }

    // Reload to ensure all screens use the new adapter and fresh data.
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleExport = async () => {
    try {
      const [artifacts, settings] = await Promise.all([
        storage.listArtifacts(),
        storage.getSettings(),
      ]);
      const payload = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        artifacts,
        settings,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'blueprint-data.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Exported Blueprint data' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unable to export data.',
        variant: 'destructive',
      });
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as {
        artifacts?: unknown[];
        settings?: { enabledTools?: string[]; seededNoteCreated?: boolean };
      };

      const artifacts = Array.isArray(parsed.artifacts) ? parsed.artifacts : [];
      let importedCount = 0;
      for (const raw of artifacts) {
        const normalized = normalizeArtifact(raw as any);
        if (normalized) {
          await storage.saveArtifact(normalized);
          importedCount += 1;
        }
      }

      if (parsed.settings?.enabledTools) {
        await storage.saveSettings({
          enabledTools: parsed.settings.enabledTools.filter((tool) =>
            ALL_TOOLS.includes(tool as any),
          ) as any,
          seededNoteCreated: parsed.settings.seededNoteCreated,
        });
      }

      toast({
        title: 'Import complete',
        description: `Imported ${importedCount} artifacts.`,
      });
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unable to import data.',
        variant: 'destructive',
      });
    } finally {
      event.target.value = '';
    }
  };

  const displayId = useMemo(() => {
    if (showFullId || !instantAppId) return instantAppId;
    if (instantAppId.length <= 4) return '****';
    return `••••••••-••••-••••-••••-••••${instantAppId.slice(-4)}`;
  }, [instantAppId, showFullId]);

  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Settings" icon={Settings} />
      <div className="flex-1 p-6 max-w-2xl px-4 sm:px-6">
        <div className="space-y-6 pb-12">
          <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Database Connection</h2>
                  <p className="text-sm text-muted-foreground">
                    Store Blueprint artifacts inside your project database.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium self-start sm:self-center bg-muted/50 px-2 py-1 rounded-full">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${provider === 'instantdb' && instantAppId.trim().length > 0
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-muted-foreground/40'
                    }`}
                />
                <span className="text-muted-foreground uppercase tracking-wider">
                  {provider === 'instantdb' && instantAppId.trim().length > 0 ? 'Live Output' : 'Local Only'}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[200px_1fr] mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="db-provider" className="text-xs font-bold uppercase text-muted-foreground">Store Mode</Label>
                <Select value={provider} onValueChange={(value) => setProvider(value as 'local' | 'instantdb')}>
                  <SelectTrigger id="db-provider" className="h-10">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="instantdb">InstantDB (Sync)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`space-y-1.5 transition-opacity ${provider === 'local' ? 'opacity-40 grayscale' : ''}`}>
                <Label htmlFor="instant-app-id" className="text-xs font-bold uppercase text-muted-foreground">Instant App ID</Label>
                <div className="relative group">
                  <Input
                    id="instant-app-id"
                    placeholder="app_..."
                    value={showFullId ? instantAppId : displayId}
                    onChange={(e) => setInstantAppId(e.target.value)}
                    onFocus={() => setShowFullId(true)}
                    onBlur={() => setShowFullId(false)}
                    disabled={provider === 'local'}
                    className="h-10 pr-10 font-mono text-sm tracking-tight"
                  />
                  {provider === 'instantdb' && (
                    <button
                      type="button"
                      onClick={() => setShowFullId(!showFullId)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showFullId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border/50">
              <p className="text-[11px] leading-relaxed text-muted-foreground max-w-[70%] italic">
                {isFromEnv ? (
                  <>
                    <span className="font-semibold text-primary">Environment config active.</span> App ID is set via <span className="font-mono">VITE_INSTANTDB_APP_ID</span> and applies to all published builds.
                  </>
                ) : provider === 'instantdb' ? (
                  <>
                    Blueprint uses isolated namespaces (<span className="font-mono text-primary">blueprint_artifacts</span>) to prevent collisions with your main app schema.
                  </>
                ) : (
                  <>Artifacts are scoped to your browser session and won't sync across machines.</>
                )}
              </p>
              <Button 
                onClick={handleSave} 
                disabled={isSaveDisabled || isFromEnv} 
                className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all px-8"
              >
                {isFromEnv ? 'Configured via Env' : 'Save & Connect'}
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Backup & Portability</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Move your artifacts between projects or keep a local copy.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={handleExport} className="bg-background">
                Download Backup (.json)
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportClick} className="bg-background">
                Restore Project
              </Button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>

          <div className="pt-2">
            <h2 className="text-lg font-semibold text-foreground mb-1">Active Modules</h2>
            <p className="text-sm text-muted-foreground">
              Customize your workspace by toggling available toolkits.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {ALL_TOOLS.map((tool) => {
              const config = TOOL_CONFIG[tool];
              const Icon = config.icon;
              const isEnabled = enabledTools.includes(tool);

              return (
                <div
                  key={tool}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${isEnabled
                      ? 'border-primary/20 bg-primary/[0.02] shadow-sm'
                      : 'border-border bg-card opacity-70'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-5 w-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={tool} className="text-sm font-bold text-foreground cursor-pointer">
                          {config.title}
                        </Label>
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded text-muted-foreground border border-border/50">
                          {config.shortcut}
                        </kbd>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{config.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={tool}
                    checked={isEnabled}
                    onCheckedChange={() => toggleTool(tool)}
                    disabled={loading}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-border/60">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Command Center</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-4 gap-x-6 text-[12px] text-muted-foreground">
              {[
                { k: 'W', v: 'Whiteboard' },
                { k: 'F', v: 'Flow' },
                { k: 'T', v: 'Tasks' },
                { k: 'D', v: 'Docs' },
                { k: 'S', v: 'Favorites' },
                { k: '\\', v: 'Dark Mode' },
                { k: 'N', v: 'New Item' },
                { k: 'G', v: 'Gallery' },
              ].map(item => (
                <div key={item.k} className="flex items-center gap-2.5">
                  <kbd className="flex h-6 w-6 items-center justify-center rounded border border-border bg-muted font-mono text-[10px] shadow-sm">
                    {item.k}
                  </kbd>
                  <span className="font-medium">{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
