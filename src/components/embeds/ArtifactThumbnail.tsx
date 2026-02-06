import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, LayoutGrid, GitBranch, Pencil, Calendar, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Artifact, ToolType } from '@/lib/storage/types';
import type { BoardData } from '@/components/tools/board/types';

const TOOL_ICONS: Record<ToolType, React.ElementType> = {
  notes: FileText,
  board: LayoutGrid,
  diagram: GitBranch,
  canvas: Pencil,
  calendar: Calendar,
};

const TOOL_COLORS: Record<ToolType, string> = {
  notes: 'hsl(199, 89%, 48%)',
  board: 'hsl(142, 76%, 36%)',
  diagram: 'hsl(262, 83%, 58%)',
  canvas: 'hsl(25, 95%, 53%)',
  calendar: 'hsl(0, 84%, 60%)',
};

interface ArtifactThumbnailProps {
  artifact: Artifact;
  className?: string;
  showLink?: boolean;
  compact?: boolean;
}

/**
 * Static thumbnail card for embedding artifacts in other tools.
 * Shows type icon, name, and a content preview.
 */
export function ArtifactThumbnail({ 
  artifact, 
  className,
  showLink = true,
  compact = false,
}: ArtifactThumbnailProps) {
  const Icon = TOOL_ICONS[artifact.type];
  const color = TOOL_COLORS[artifact.type];

  // Generate preview content based on artifact type
  const preview = useMemo(() => {
    switch (artifact.type) {
      case 'notes': {
        const blocks = artifact.data as Array<{ type: string; content?: unknown }>;
        if (!Array.isArray(blocks)) return null;
        // Extract text from first few blocks
        const textContent = blocks
          .slice(0, 3)
          .map((block) => {
            if (block.content && Array.isArray(block.content)) {
              return (block.content as Array<{ text?: string }>)
                .map((c) => c.text || '')
                .join('');
            }
            return '';
          })
          .filter(Boolean)
          .join(' ');
        return textContent.slice(0, 100) + (textContent.length > 100 ? '...' : '');
      }

      case 'board': {
        const data = artifact.data as BoardData | undefined;
        if (!data?.columns) return null;
        const totalCards = data.columns.reduce((sum, col) => sum + col.cards.length, 0);
        return `${data.columns.length} columns · ${totalCards} cards`;
      }

      case 'diagram': {
        const data = artifact.data as { nodes?: unknown[]; edges?: unknown[] } | undefined;
        const nodeCount = data?.nodes?.length || 0;
        const edgeCount = data?.edges?.length || 0;
        return `${nodeCount} nodes · ${edgeCount} connections`;
      }

      case 'canvas': {
        // tldraw snapshots have shape records
        const snapshot = artifact.data as { store?: Record<string, unknown> } | undefined;
        if (snapshot?.store) {
          const shapeCount = Object.keys(snapshot.store).filter((k) =>
            k.startsWith('shape:')
          ).length;
          return `${shapeCount} shapes`;
        }
        return 'Canvas';
      }

      default:
        return null;
    }
  }, [artifact]);

  const path = `/${artifact.type}/${artifact.id}`;

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors',
        showLink && 'hover:bg-accent/50 cursor-pointer',
        compact && 'p-2 gap-2',
        className
      )}
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <div
        className={cn('rounded-md p-1.5', compact && 'p-1')}
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className={cn('h-4 w-4', compact && 'h-3 w-3')} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn('font-medium truncate text-sm', compact && 'text-xs')}>
            {artifact.name}
          </span>
          {showLink && (
            <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        {preview && !compact && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{preview}</p>
        )}
        {!compact && (
          <p className="text-[10px] text-muted-foreground/60 mt-1 capitalize">
            {artifact.type}
          </p>
        )}
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link to={path} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
