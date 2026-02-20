import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  TLBaseShape,
  TLResizeInfo,
  resizeBox,
  T,
} from 'tldraw';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { useArtifactById } from '../../embeds/useArtifactByName';
import type { Artifact, ToolType } from '../../../lib/storage/types';
import type { BoardData } from '../board/types';
import { FileText, LayoutGrid, GitBranch, Pencil } from 'lucide-react';
import { getStorageAdapter } from '../../../lib/storage';

// Shape type definition
export type ArtifactEmbedShape = TLBaseShape<
  'artifact-embed',
  {
    w: number;
    h: number;
    artifactId: string;
    artifactName: string;
  }
>;

const TOOL_ICONS: Record<ToolType, React.ElementType> = {
  notes: FileText,
  board: LayoutGrid,
  diagram: GitBranch,
  canvas: Pencil,
  calendar: FileText,
};

const TOOL_COLORS: Record<ToolType, string> = {
  notes: 'hsl(199, 89%, 48%)',
  board: 'hsl(142, 76%, 36%)',
  diagram: 'hsl(262, 83%, 58%)',
  canvas: 'hsl(25, 95%, 53%)',
  calendar: 'hsl(0, 84%, 60%)',
};

function getPreview(artifact: Artifact): string | null {
  switch (artifact.type) {
    case 'notes': {
      const blocks = artifact.data as Array<{ type: string; content?: unknown }>;
      if (!Array.isArray(blocks)) return null;
      const textContent = blocks
        .slice(0, 2)
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
      return textContent.slice(0, 60) + (textContent.length > 60 ? '...' : '');
    }
    case 'board': {
      const data = artifact.data as BoardData | undefined;
      if (!data?.columns) return null;
      const totalCards = data.columns.reduce((sum, col) => sum + col.cards.length, 0);
      return `${data.columns.length} cols · ${totalCards} cards`;
    }
    case 'diagram': {
      const data = artifact.data as { nodes?: unknown[] } | undefined;
      return `${data?.nodes?.length || 0} nodes`;
    }
    case 'canvas': {
      const snapshot = artifact.data as { store?: Record<string, unknown> } | undefined;
      if (snapshot?.store) {
        const count = Object.keys(snapshot.store).filter((k) => k.startsWith('shape:')).length;
        return `${count} shapes`;
      }
      return null;
    }
    default:
      return null;
  }
}

// Shape component that renders inside tldraw
function ArtifactEmbedComponent({ shape }: { shape: ArtifactEmbedShape }) {
  const artifact = useArtifactById(shape.props.artifactId);

  if (!artifact) {
    return (
      <div
        className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
        style={{ width: shape.props.w, height: shape.props.h }}
      >
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs truncate">Missing: {shape.props.artifactName}</span>
      </div>
    );
  }

  const Icon = TOOL_ICONS[artifact.type];
  const color = TOOL_COLORS[artifact.type];
  const preview = getPreview(artifact);

  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border bg-card p-2.5 h-full cursor-pointer hover:bg-accent/30 transition-colors"
      style={{
        width: shape.props.w,
        borderLeftColor: color,
        borderLeftWidth: 3,
      }}
      title="Double-click to open, or right-click → Open"
    >
      <div
        className="rounded p-1.5 flex-shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm truncate">{artifact.name}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        </div>
        {preview && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{preview}</p>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-0.5 capitalize">
          {artifact.type}
        </p>
      </div>
    </div>
  );
}

// Helper to navigate to an artifact (used by both double-click and context menu)
export function navigateToArtifact(artifactId: string) {
  getStorageAdapter().getArtifact(artifactId).then((artifact) => {
    if (artifact) {
      window.location.assign(`/${artifact.type}/${artifact.id}`);
    }
  });
}

// ShapeUtil class for tldraw
export class ArtifactEmbedShapeUtil extends ShapeUtil<ArtifactEmbedShape> {
  static override type = 'artifact-embed' as const;

  static override props = {
    w: T.number,
    h: T.number,
    artifactId: T.string,
    artifactName: T.string,
  };

  getDefaultProps(): ArtifactEmbedShape['props'] {
    return {
      w: 240,
      h: 80,
      artifactId: '',
      artifactName: 'Untitled',
    };
  }

  getGeometry(shape: ArtifactEmbedShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override canResize = () => true;
  override isAspectRatioLocked = () => false;

  override onResize(shape: ArtifactEmbedShape, info: TLResizeInfo<ArtifactEmbedShape>) {
    return resizeBox(shape, info);
  }

  // Handle double-click at the ShapeUtil level to navigate
  override onDoubleClick = (shape: ArtifactEmbedShape) => {
    navigateToArtifact(shape.props.artifactId);
    return;
  };

  component(shape: ArtifactEmbedShape) {
    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          pointerEvents: 'all',
        }}
      >
        <ArtifactEmbedComponent shape={shape} />
      </HTMLContainer>
    );
  }

  indicator(shape: ArtifactEmbedShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
