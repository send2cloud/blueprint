import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { TOOL_LIST } from '@/lib/toolConfig';

const Index = () => {
  const navigate = useNavigate();
  const { isToolEnabled, loading } = useBlueprint();

  const visibleTools = loading ? TOOL_LIST : TOOL_LIST.filter((t) => isToolEnabled(t.type));

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
                key={tool.type}
                className="cursor-pointer transition-all hover:shadow-md hover:border-ring"
                onClick={() => navigate(tool.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded text-muted-foreground">
                      {tool.shortcut}
                    </kbd>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">N</kbd> new • 
            <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded ml-2">G</kbd> gallery
          </p>
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
