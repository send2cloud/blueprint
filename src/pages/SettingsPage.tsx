import { Settings, Database, Eye, EyeOff, Upload, X, Palette } from 'lucide-react';
import { ToolHeader } from '../components/layout/ToolHeader';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useBlueprintState, useBlueprintActions } from '../contexts/BlueprintContext';
import { ALL_TOOLS, initializeStorageAdapter, loadDbConfig, saveDbConfig, isEnvConfig } from '../lib/storage';
import { normalizeArtifact, CURRENT_SCHEMA_VERSION } from '../lib/storage/schema';
import { TOOL_CONFIG } from '../lib/toolConfig';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from '../hooks/use-toast';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkBlueprintUpdates } from '../lib/updateChecker';
import { ArrowUpCircle } from 'lucide-react';
import { getProjectColor, PRESET_COLORS, getFgForHsl } from '../lib/projectColors';
import { useNavigate } from 'react-router-dom';
import { useBasePath } from '../lib/basePath';

const dbConfigSchema = z.object({
  provider: z.enum(['local', 'instantdb']),
  instantAppId: z.string().optional(),
}).refine((data) => {
  if (data.provider === 'instantdb') {
    return !!data.instantAppId && data.instantAppId.trim().length > 0;
  }
  return true;
}, {
  message: "Instant App ID is required for InstantDB provider",
  path: ["instantAppId"],
});

type DbConfigForm = z.infer<typeof dbConfigSchema>;

export default function SettingsPage() {
  const { enabledTools, loading, storage, settings, projects, currentProjectId } = useBlueprintState();
  const { toggleTool, updateProject, getCurrentProject } = useBlueprintActions();
  const navigate = useNavigate();
  const basePath = useBasePath();

  const currentProject = getCurrentProject();
  const [projectName, setProjectName] = useState('');
  const [projectColor, setProjectColor] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const [projectLogo, setProjectLogo] = useState<string | undefined>(undefined);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentProject) {
      setProjectName(currentProject.name);
      setProjectColor(currentProject.color || '');
      setProjectLogo(currentProject.logo);
    }
  }, [currentProject?.id]);

  const handleLogoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
      toast({ title: 'Logo too large', description: 'Please use an image under 512KB.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProjectLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setProjectLogo(undefined);
  }, []);

  const handleSaveProjectSettings = useCallback(async () => {
    if (!currentProject) return;
    try {
      const updated = await updateProject(currentProject.id, {
        name: projectName.trim() || currentProject.name,
        color: projectColor || undefined,
        logo: projectLogo,
      });
      toast({ title: 'Project updated' });
      // If slug changed, navigate to new slug
      if (updated.slug !== currentProject.slug && settings.mode === 'multi') {
        navigate(`${basePath}/${updated.slug}/settings`, { replace: true });
      }
    } catch (err) {
      toast({ title: 'Failed to update project', variant: 'destructive' });
    }
  }, [currentProject, projectName, projectColor, projectLogo, updateProject, navigate, basePath, settings.mode]);

  const [showFullId, setShowFullId] = useState(false);
  const [savedId, setSavedId] = useState('');
  const [isFromEnv, setIsFromEnv] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [updateInfo, setUpdateInfo] = useState<{ hasUpdate: boolean, current: string, latest: string } | null>(null);

  useEffect(() => {
    checkBlueprintUpdates().then(info => {
      setUpdateInfo(info);
    }).catch(console.error);
  }, []);

  const { control, handleSubmit, watch, setValue, reset, formState: { isDirty, isValid } } = useForm<DbConfigForm>({
    resolver: zodResolver(dbConfigSchema),
    defaultValues: {
      provider: 'local',
      instantAppId: '',
    }
  });

  const provider = watch('provider');
  const instantAppId = watch('instantAppId') || '';

  useEffect(() => {
    const envConfigured = isEnvConfig();
    setIsFromEnv(envConfigured);

    const config = loadDbConfig();
    if (config) {
      reset({
        provider: config.provider,
        instantAppId: config.instantAppId ?? '',
      });
      setSavedId(config.instantAppId ?? '');
    }
  }, [reset]);

  const handleSave = (data: DbConfigForm) => {
    const isNewId = data.provider === 'instantdb' && data.instantAppId?.trim() !== savedId;

    if (data.provider === 'local') {
      saveDbConfig({ provider: 'local' });
      initializeStorageAdapter();
      toast({
        title: 'Using Local Storage',
        description: 'Blueprint will store artifacts in this browser only.',
      });
    } else {
      const trimmed = data.instantAppId?.trim() || '';

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

  const handleModeChange = async (newMode: 'solo' | 'multi') => {
    try {
      await storage.saveSettings({ ...settings, mode: newMode });
      toast({
        title: 'Project Mode Changed',
        description: `Blueprint is now running in ${newMode === 'multi' ? 'Workspace' : 'Standard'} mode.`,
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 600);
    } catch (e) {
      toast({ title: 'Failed to update mode', variant: 'destructive' });
    }
  };

  const handleExport = async () => {
    try {
      const [artifacts, settingsData] = await Promise.all([
        storage.listArtifacts(),
        storage.getSettings(),
      ]);
      const payload = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        artifacts,
        settings: settingsData,
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

          {updateInfo?.hasUpdate && (
            <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4 shadow-sm flex items-start gap-3">
              <ArrowUpCircle className="h-5 w-5 text-teal-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Blueprint Update Available!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  A new version of Blueprint is available ({updateInfo.latest}). You are currently running v{updateInfo.current}.
                </p>
                <div className="mt-3">
                  <a
                    href="https://github.com/send2cloud/blueprint"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-teal-500 text-primary-foreground hover:bg-teal-500/90 h-8 px-4"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>
            </div>
          )}

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
                <Controller
                  name="provider"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="db-provider" className="h-10">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local Storage</SelectItem>
                        <SelectItem value="instantdb">InstantDB (Sync)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className={`space-y-1.5 transition-opacity ${provider === 'local' ? 'opacity-40 grayscale' : ''}`}>
                <Label htmlFor="instant-app-id" className="text-xs font-bold uppercase text-muted-foreground">Instant App ID</Label>
                <div className="relative group">
                  <Controller
                    name="instantAppId"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="instant-app-id"
                        placeholder="app_..."
                        {...field}
                        value={showFullId ? field.value : displayId}
                        onFocus={() => setShowFullId(true)}
                        onBlur={() => setShowFullId(false)}
                        disabled={provider === 'local'}
                        className="h-10 pr-10 font-mono text-sm tracking-tight"
                      />
                    )}
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
                    Blueprint uses isolated namespaces (<span className="font-mono text-primary">blueprint_notes</span>) to prevent collisions with your main app schema.
                  </>
                ) : (
                  <>Artifacts are scoped to your browser session and won't sync across machines.</>
                )}
              </p>
              <Button
                onClick={handleSubmit(handleSave)}
                disabled={!isValid || isFromEnv || !isDirty}
                className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all px-8"
              >
                {isFromEnv ? 'Configured via Env' : 'Save & Connect'}
              </Button>
            </div>
          </div>

          {/* General App Settings */}
          <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Project Mode</h2>
                  <p className="text-sm text-muted-foreground">
                    Switch between Solo (one global workspace) and Workspace (multiple projects).
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-[200px_1fr] mt-2 border-t border-border/50 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-mode" className="text-xs font-bold uppercase text-muted-foreground">App Mode</Label>
                <Select value={settings?.mode || 'solo'} onValueChange={handleModeChange}>
                  <SelectTrigger id="app-mode" className="h-10">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Project</SelectItem>
                    <SelectItem value="multi">Workspace (Multi-Project)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center text-sm text-muted-foreground italic pl-2 border-l border-border/50">
                {settings?.mode === 'multi' ? (
                  <p>In Workspace mode, you can create multiple distinct projects. Data is isolated per project, and routing includes the project slug.</p>
                ) : (
                  <p>In Solo mode, Blueprint behaves as a single global environment. Best for embedded host apps or singular use cases.</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Settings */}
          {currentProject && (
            <div className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Project Identity</h2>
                  <p className="text-sm text-muted-foreground">
                    Name, logo, and color for <span className="font-medium text-foreground">{currentProject.name}</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 mt-2 border-t border-border/50 pt-4">
                {/* Project Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="project-name" className="text-xs font-bold uppercase text-muted-foreground">Project Name</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project name"
                    className="h-10"
                  />
                  {currentProject.slugAliases && currentProject.slugAliases.length > 0 && (
                    <p className="text-[11px] text-muted-foreground italic">
                      Previous slugs still work: {currentProject.slugAliases.map(s => `/${s}`).join(', ')}
                    </p>
                  )}
                </div>

                {/* Logo */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Logo</Label>
                  <div className="flex items-center gap-3">
                    {projectLogo ? (
                      <div className="relative group">
                        <img src={projectLogo} alt="Project logo" className="size-12 rounded-lg object-cover border border-border" />
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="size-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => logoInputRef.current?.click()}
                      >
                        <Upload className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                        {projectLogo ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG, SVG. Max 512KB.</p>
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Project Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => { setProjectColor(c.bg); setCustomColorInput(''); }}
                        className={`size-8 rounded-full border-2 transition-all ${projectColor === c.bg ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: `hsl(${c.bg})` }}
                        title={`Preset ${i + 1}`}
                      />
                    ))}
                    {/* Clear */}
                    <button
                      onClick={() => { setProjectColor(''); setCustomColorInput(''); }}
                      className={`size-8 rounded-full border-2 transition-all flex items-center justify-center ${!projectColor ? 'border-foreground scale-110' : 'border-border hover:scale-105'}`}
                      title="Auto (based on project ID)"
                    >
                      <X className="size-3 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="custom-color" className="text-[11px] text-muted-foreground whitespace-nowrap">Custom HSL:</Label>
                    <Input
                      id="custom-color"
                      value={customColorInput}
                      onChange={(e) => {
                        setCustomColorInput(e.target.value);
                        // Validate basic HSL format: "H S% L%"
                        const v = e.target.value.trim();
                        if (/^\d+\s+\d+%?\s+\d+%?$/.test(v)) {
                          const normalized = v.replace(/(\d+)\s+(\d+)%?\s+(\d+)%?/, '$1 $2% $3%');
                          setProjectColor(normalized);
                        }
                      }}
                      placeholder="e.g. 200 70% 50%"
                      className="h-8 text-xs font-mono max-w-48"
                    />
                    {projectColor && (
                      <div
                        className="size-8 rounded-md border border-border shrink-0"
                        style={{ backgroundColor: `hsl(${projectColor})` }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border/50">
                <Button onClick={handleSaveProjectSettings} className="px-6">
                  Save Project Settings
                </Button>
              </div>
            </div>
          )}

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
