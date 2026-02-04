import { Settings } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { ToolType, ALL_TOOLS } from '@/lib/storage';
import { Pencil, GitBranch, Brain, Columns3, StickyNote, LucideIcon } from 'lucide-react';

const toolMeta: Record<ToolType, { label: string; icon: LucideIcon; description: string }> = {
  draw: {
    label: 'Draw',
    icon: Pencil,
    description: 'Freeform sketches, diagrams, and drawings',
  },
  flow: {
    label: 'Flow',
    icon: GitBranch,
    description: 'Node-based flow diagrams and charts',
  },
  mindmap: {
    label: 'Mind Map',
    icon: Brain,
    description: 'Hierarchical brainstorming and idea trees',
  },
  kanban: {
    label: 'Kanban',
    icon: Columns3,
    description: 'Task boards for tracking progress',
  },
  whiteboard: {
    label: 'Whiteboard',
    icon: StickyNote,
    description: 'Infinite canvas with sticky notes',
  },
};

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
  );
}
