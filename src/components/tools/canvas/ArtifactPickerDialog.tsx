import { useState, useMemo } from 'react';
import { Search, FileText, LayoutGrid, GitBranch, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAllArtifacts } from '@/hooks/useArtifacts';
import type { Artifact, ToolType } from '@/lib/storage/types';

const TOOL_ICONS: Record<ToolType, React.ElementType> = {
  notes: FileText,
  board: LayoutGrid,
  diagram: GitBranch,
  canvas: Pencil,
  calendar: FileText, // Not used but needed for type
};

const TOOL_COLORS: Record<ToolType, string> = {
  notes: 'hsl(199, 89%, 48%)',
  board: 'hsl(142, 76%, 36%)',
  diagram: 'hsl(262, 83%, 58%)',
  canvas: 'hsl(25, 95%, 53%)',
  calendar: 'hsl(0, 84%, 60%)',
};

interface ArtifactPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (artifact: Artifact) => void;
  excludeId?: string;
}

export function ArtifactPickerDialog({
  open,
  onOpenChange,
  onSelect,
  excludeId,
}: ArtifactPickerDialogProps) {
  const [search, setSearch] = useState('');
  const { artifacts } = useAllArtifacts();

  const filteredArtifacts = useMemo(() => {
    return artifacts
      .filter((a) => a.id !== excludeId)
      .filter((a) => 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase())
      )
      .slice(0, 20); // Limit results
  }, [artifacts, excludeId, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Embed Artifact</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search artifacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <ScrollArea className="h-64">
          <div className="space-y-1">
            {filteredArtifacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No artifacts found
              </p>
            ) : (
              filteredArtifacts.map((artifact) => {
                const Icon = TOOL_ICONS[artifact.type];
                const color = TOOL_COLORS[artifact.type];

                return (
                  <button
                    key={artifact.id}
                    onClick={() => onSelect(artifact)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className="rounded-md p-1.5"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{artifact.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {artifact.type}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
