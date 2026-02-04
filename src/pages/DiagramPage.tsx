import { useParams } from 'react-router-dom';
import { GitBranch, Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { DiagramEditor } from '@/components/tools/diagram/DiagramEditor';
import { useArtifact } from '@/hooks/useArtifact';

export default function DiagramPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite } = useArtifact('diagram', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Diagram" icon={GitBranch} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Diagram" icon={GitBranch} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        title="Diagram"
        icon={GitBranch}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="diagram"
        artifactFavorite={artifact?.favorite}
        saving={saving}
        onRename={rename}
        onToggleFavorite={toggleFavorite}
      />
      <div className="flex-1">
        <DiagramEditor
          initialData={artifact?.data}
          onSave={save}
        />
      </div>
    </div>
  );
}
