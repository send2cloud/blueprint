import { useParams } from 'react-router-dom';
import { FileText, Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { NotesEditor } from '@/components/tools/notes/NotesEditor';
import { useArtifact } from '@/hooks/useArtifact';

export default function NotesPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, saving, save, rename, toggleFavorite } = useArtifact('notes', id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Note not found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        title="Notes"
        icon={FileText}
        artifactId={artifact.id}
        artifactName={artifact.name}
        artifactType={artifact.type}
        artifactFavorite={artifact.favorite}
        saving={saving}
        onRename={rename}
        onToggleFavorite={toggleFavorite}
      />
      <NotesEditor
        initialContent={artifact.data}
        onChange={save}
      />
    </div>
  );
}
