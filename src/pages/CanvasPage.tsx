import { useParams } from 'react-router-dom';
import { Palette, Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { CanvasEditor } from '@/components/tools/canvas/CanvasEditor';
import { useArtifact } from '@/hooks/useArtifact';

export default function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite } = useArtifact('canvas', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Canvas" icon={Palette} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Canvas" icon={Palette} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        title="Canvas"
        icon={Palette}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="canvas"
        artifactFavorite={artifact?.favorite}
        saving={saving}
        onRename={rename}
        onToggleFavorite={toggleFavorite}
      />
      <div className="flex-1">
        <CanvasEditor
          initialData={artifact?.data}
          onSave={save}
        />
      </div>
    </div>
  );
}
