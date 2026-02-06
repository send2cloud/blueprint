import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  TLBaseShape,
  TLResizeInfo,
  resizeBox,
  T,
} from 'tldraw';
import { ArtifactThumbnail } from '@/components/embeds/ArtifactThumbnail';
import { useArtifactById } from '@/components/embeds/useArtifactByName';
import { AlertCircle } from 'lucide-react';

// Shape type definition
export type ArtifactEmbedShape = TLBaseShape<
  'artifact-embed',
  {
    w: number;
    h: number;
    artifactId: string;
    artifactName: string; // Fallback display name
  }
>;

// Shape component that renders inside tldraw
function ArtifactEmbedComponent({ shape }: { shape: ArtifactEmbedShape }) {
  const artifact = useArtifactById(shape.props.artifactId);

  if (!artifact) {
    return (
      <div
        className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive"
        style={{ width: shape.props.w, height: shape.props.h }}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs">Missing: {shape.props.artifactName}</span>
      </div>
    );
  }

  return (
    <div style={{ width: shape.props.w, minHeight: shape.props.h }}>
      <ArtifactThumbnail artifact={artifact} showLink={false} />
    </div>
  );
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
