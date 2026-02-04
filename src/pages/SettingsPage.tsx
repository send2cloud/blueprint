import { Settings } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { ALL_TOOLS } from '@/lib/storage';
import { TOOL_CONFIG } from '@/lib/toolConfig';

export default function SettingsPage() {
  const { enabledTools, toggleTool, loading } = useBlueprint();

  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Settings" icon={Settings} />
      <div className="flex-1 p-6 max-w-2xl">
        <div className="space-y-6">
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
