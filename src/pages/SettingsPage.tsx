import { useEffect, useState } from 'react';
import { Settings, Sun, Moon, Monitor, Check, ArrowUpCircle } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ToolType, ALL_TOOLS } from '@/lib/storage';
import { APP_VERSION, getLatestVersion } from '@/lib/version';
import { Palette, GitBranch, Columns3, FileText, LucideIcon } from 'lucide-react';

const toolMeta: Record<ToolType, { label: string; icon: LucideIcon; description: string }> = {
  canvas: {
    label: 'Canvas',
    icon: Palette,
    description: 'Drawings, whiteboards, sketches, and visual notes',
  },
  diagram: {
    label: 'Diagram',
    icon: GitBranch,
    description: 'Flow charts, mind maps, and system diagrams',
  },
  board: {
    label: 'Board',
    icon: Columns3,
    description: 'Kanban boards and task trackers',
  },
  notes: {
    label: 'Notes',
    icon: FileText,
    description: 'Rich text documents, notes, and Notion-style content',
  },
};

type ThemeOption = 'light' | 'dark' | 'system';

const themeOptions: { value: ThemeOption; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export default function SettingsPage() {
  const { enabledTools, toggleTool, loading } = useBlueprint();
  const { theme, setTheme } = useTheme();
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    getLatestVersion().then(setLatestVersion);
  }, []);

  const isUpToDate = latestVersion === APP_VERSION;

  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Settings" icon={Settings} />
      <div className="flex-1 p-6 max-w-2xl overflow-auto">
        <div className="space-y-8">
          {/* Version Info */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Version</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Current version and update status
            </p>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">Current Version</span>
                  <Badge variant="secondary" className="font-mono">v{APP_VERSION}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Latest Available</span>
                  {latestVersion ? (
                    <Badge 
                      variant={isUpToDate ? 'outline' : 'default'} 
                      className="font-mono"
                    >
                      v{latestVersion}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Checking...</span>
                  )}
                </div>
              </div>
              {latestVersion && (
                <div className="flex items-center gap-2">
                  {isUpToDate ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Check className="h-4 w-4" />
                      <span>Up to date</span>
                    </div>
                  ) : (
                    <Button size="sm" className="gap-1">
                      <ArrowUpCircle className="h-4 w-4" />
                      Update
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Theme */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Appearance</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose how Idea Room looks to you
            </p>
            <div className="flex gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <Button
                    key={option.value}
                    variant={isSelected ? 'default' : 'outline'}
                    className="flex-1 gap-2"
                    onClick={() => setTheme(option.value)}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Tool Visibility */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Tool Visibility</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Toggle which tools appear in the sidebar. Disabled tools are hidden but your data is preserved.
            </p>

            <div className="space-y-4">
              {ALL_TOOLS.map((tool) => {
                const meta = toolMeta[tool];
                const Icon = meta.icon;
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
                        <Label htmlFor={tool} className="text-sm font-medium text-foreground cursor-pointer">
                          {meta.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
