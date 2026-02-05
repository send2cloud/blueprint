import { useParams } from 'react-router-dom';
import { EditorPageWrapper } from '@/components/layout/EditorPageWrapper';
import { BoardEditor } from '@/components/tools/board/BoardEditor';
import { useArtifact } from '@/hooks/useArtifact';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.board;

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite, updateTags } = useArtifact('board', id || 'new');

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
      onUpdateTags={updateTags}
    >
      <BoardEditor initialData={artifact?.data} onSave={save} />
    </EditorPageWrapper>
  );
}
