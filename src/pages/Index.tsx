import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBlueprint } from '@/contexts/BlueprintContext';
import { TOOL_LIST } from '@/lib/toolConfig';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { useAllArtifacts } from '@/hooks/useArtifacts';
import type { Artifact } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';
import { formatRelative } from '@/lib/formatters';
import { getArtifactSearchText } from '@/lib/artifactUtils';

const Index = () => {
  const navigate = useNavigate();
  const { isToolEnabled, loading } = useBlueprint();
  const { artifacts } = useAllArtifacts();
  const [search, setSearch] = useState('');

  const visibleTools = loading ? TOOL_LIST : TOOL_LIST.filter((t) => isToolEnabled(t.type));
  const recentArtifacts = useMemo(() => artifacts.slice(0, 5), [artifacts]);

  const handleCopyLink = async (artifact: Artifact) => {
    const link = `${window.location.origin}${TOOL_CONFIG[artifact.type].path}/${artifact.id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: 'Link copied' });
    } catch {
      toast({ title: 'Copy failed', description: 'Unable to access clipboard.', variant: 'destructive' });
    }
  };

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return artifacts.filter((artifact) => getArtifactSearchText(artifact).includes(query));
  }, [artifacts, search]);

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

        {/* Search */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Search</h2>
          <Input
            placeholder="Search notes, flows, boards, and sketches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.trim().length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No matches yet.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.slice(0, 10).map((artifact) => (
                    <Link
                      key={artifact.id}
                      to={`${TOOL_CONFIG[artifact.type].path}/${artifact.id}`}
                      className="block rounded-lg border border-border bg-card p-3 transition hover:border-ring"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{artifact.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {TOOL_CONFIG[artifact.type].title} • Updated {formatRelative(artifact.updatedAt)}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">{artifact.type}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
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

        {/* Recent Activity */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
          <div className="space-y-2">
            {recentArtifacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No artifacts yet. Create your first one.</p>
            ) : (
              recentArtifacts.map((artifact) => (
                <div
                  key={artifact.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition hover:border-ring"
                >
                  <Link
                    to={`${TOOL_CONFIG[artifact.type].path}/${artifact.id}`}
                    className="flex-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{artifact.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {TOOL_CONFIG[artifact.type].title} • Updated {formatRelative(artifact.updatedAt)}
                      </p>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyLink(artifact)}
                    aria-label="Copy artifact link"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))
            )}
          </div>
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
