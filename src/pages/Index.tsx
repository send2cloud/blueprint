import { useNavigate } from 'react-router-dom';
import { Pencil, GitBranch, Brain, Columns3, StickyNote, Settings, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { ToolType } from '@/lib/storage';

const toolCards: Array<{
  tool: ToolType;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
}> = [
  {
    tool: 'draw',
    title: 'Draw',
    description: 'Freeform sketches, diagrams, and architecture drawings',
    icon: Pencil,
    path: '/draw',
  },
  {
    tool: 'flow',
    title: 'Flow',
    description: 'Node-based flow diagrams for processes and systems',
    icon: GitBranch,
    path: '/flow',
  },
  {
    tool: 'mindmap',
    title: 'Mind Map',
    description: 'Hierarchical brainstorming and idea exploration',
    icon: Brain,
    path: '/mindmap',
  },
  {
    tool: 'kanban',
    title: 'Kanban',
    description: 'Task boards to track ideas, progress, and completion',
    icon: Columns3,
    path: '/kanban',
  },
  {
    tool: 'whiteboard',
    title: 'Whiteboard',
    description: 'Infinite canvas with sticky notes for quick thoughts',
    icon: StickyNote,
    path: '/whiteboard',
  },
];

const Index = () => {
  const navigate = useNavigate();
  const { isToolEnabled, loading } = useBlueprint();

  const visibleTools = loading ? toolCards : toolCards.filter((t) => isToolEnabled(t.tool));

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Idea Room
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your project's creative memory. Capture the spark, map the vision, track the journey.
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.tool}
                className="cursor-pointer transition-all hover:shadow-md hover:border-ring"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Settings Link */}
        <div className="flex justify-center">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="gap-2">
            <Settings className="h-4 w-4" />
            Customize visible tools
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
