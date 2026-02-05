import { useParams } from 'react-router-dom';
import { EditorPageWrapper } from '@/components/layout/EditorPageWrapper';
import { NotesEditor } from '@/components/tools/notes/NotesEditor';
import { useArtifact } from '@/hooks/useArtifact';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.notes;

export default function NotesPage() {
  const { id } = useParams();
  const { artifact, loading, error, save, rename, toggleFavorite, saving } = useArtifact('notes', id);

  return (
    <EditorPageWrapper
      title={tool.title}
      icon={tool.icon}
      artifact={artifact}
      loading={loading}
      error={error}
      saving={saving}
      onRename={rename}
      onToggleFavorite={toggleFavorite}
    >
      <NotesEditor initialData={artifact?.data} onSave={save} />
    </EditorPageWrapper>
  );
}
