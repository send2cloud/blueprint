import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Link2 } from 'lucide-react';
import { useArtifactLinks } from '@/hooks/useArtifactLinks';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { formatRelative } from '@/lib/formatters';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BacklinksPanelProps {
  artifactId: string;
}

export function BacklinksPanel({ artifactId }: BacklinksPanelProps) {
  const { outgoingLinks, backlinks } = useArtifactLinks(artifactId);
  const [isOpen, setIsOpen] = useState(true);

  const totalLinks = outgoingLinks.length + backlinks.length;
  
  if (totalLinks === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-t border-border">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between px-4 py-2 h-auto rounded-none"
        >
          <div className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4" />
            <span>Links</span>
            <span className="text-muted-foreground">({totalLinks})</span>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-3 space-y-3">
        {/* Outgoing Links */}
        {outgoingLinks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ArrowRight className="h-3 w-3" />
              <span>Links to ({outgoingLinks.length})</span>
            </div>
            <div className="space-y-1">
              {outgoingLinks.map((artifact) => {
                const tool = TOOL_CONFIG[artifact.type];
                const Icon = tool.icon;
                return (
                  <Link
                    key={artifact.id}
                    to={`${tool.path}/${artifact.id}`}
                    className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{artifact.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ArrowLeft className="h-3 w-3" />
              <span>Linked from ({backlinks.length})</span>
            </div>
            <div className="space-y-1">
              {backlinks.map((artifact) => {
                const tool = TOOL_CONFIG[artifact.type];
                const Icon = tool.icon;
                return (
                  <Link
                    key={artifact.id}
                    to={`${tool.path}/${artifact.id}`}
                    className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{artifact.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelative(artifact.updatedAt)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
