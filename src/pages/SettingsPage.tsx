import { Settings, Database } from 'lucide-react';
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
import { ALL_TOOLS, initializeStorageAdapter, loadDbConfig, saveDbConfig, getStorageAdapter } from '@/lib/storage';
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
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const config = loadDbConfig();
    if (config?.provider === 'instantdb') {
      setProvider('instantdb');
      setInstantAppId(config.instantAppId ?? '');
    } else if (config?.provider === 'local') {
      setProvider('local');
    }
  }, []);

  const isSaveDisabled = useMemo(() => {
    if (provider === 'local') return false;
    return instantAppId.trim().length === 0;
  }, [provider, instantAppId]);

  const handleSave = () => {
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

      saveDbConfig({ provider: 'instantdb', instantAppId: trimmed });
      initializeStorageAdapter();

      toast({
        title: 'Connected to InstantDB',
        description: 'Blueprint will now store artifacts in your project database.',
      });
    }

    // Reload to ensure all screens use the new adapter.
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

  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Settings" icon={Settings} />
      <div className="flex-1 p-6 max-w-2xl">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                <Database className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Database Connection</h2>
                <p className="text-sm text-muted-foreground">
                  Store Blueprint artifacts inside your project database. This keeps everything traveling with the repo.
                </p>
              </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    provider === 'instantdb' && instantAppId.trim().length > 0
                      ? 'bg-emerald-500'
                      : 'bg-muted-foreground/40'
                  }`}
                />
                <span className="text-muted-foreground">
                  {provider === 'instantdb' && instantAppId.trim().length > 0 ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr]">
              <div className="space-y-1">
                <Label htmlFor="db-provider" className="text-sm">Provider</Label>
                <Select value={provider} onValueChange={(value) => setProvider(value as 'local' | 'instantdb')}>
                  <SelectTrigger id="db-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="instantdb">InstantDB (recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={`space-y-1 ${provider === 'local' ? 'opacity-60' : ''}`}>
                <Label htmlFor="instant-app-id" className="text-sm">Instant App ID</Label>
                <Input
                  id="instant-app-id"
                  placeholder="app_..."
                  value={instantAppId}
                  onChange={(e) => setInstantAppId(e.target.value)}
                  disabled={provider === 'local'}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                {provider === 'instantdb' ? (
                  <>
                    Blueprint uses dedicated namespaces like <span className="font-mono">blueprint_artifacts</span> to
                    keep your personal data separate from public app data.
                  </>
                ) : (
                  <>Blueprint will store artifacts in this browser only.</>
                )}
              </p>
              <Button onClick={handleSave} disabled={isSaveDisabled}>
                Save
              </Button>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Backup & Restore</h3>
              <p className="text-xs text-muted-foreground">
                Export all artifacts to a JSON file or import a backup.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleExport}>
                Export JSON
              </Button>
              <Button variant="outline" onClick={handleImportClick}>
                Import JSON
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

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Tool Visibility</h2>
            <p className="text-sm text-muted-foreground">
              Toggle which tools appear in the sidebar. Disabled tools are hidden but your data is preserved.
            </p>
          </div>

          <div className="space-y-4">
            {ALL_TOOLS.map((tool) => {
              const config = TOOL_CONFIG[tool];
              const Icon = config.icon;
              const isEnabled = enabledTools.includes(tool);

              return (
                <div
                  key={tool}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={tool} className="text-sm font-medium text-foreground cursor-pointer">
                          {config.title}
                        </Label>
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded text-muted-foreground">
                          {config.shortcut}
                        </kbd>
                      </div>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <Switch
                    id={tool}
                    checked={isEnabled}
                    onCheckedChange={() => toggleTool(tool)}
                    disabled={loading}
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-2">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">W</kbd>
                <span>Whiteboard</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">F</kbd>
                <span>Flow</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">T</kbd>
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">D</kbd>
                <span>Docs</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">S</kbd>
                <span>Favorites</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">\</kbd>
                <span>Toggle theme</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">N</kbd>
                <span>New (in context)</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">G</kbd>
                <span>Gallery (in context)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
