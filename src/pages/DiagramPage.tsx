import { useParams } from 'react-router-dom';
import { EditorPageWrapper } from '@/components/layout/EditorPageWrapper';
import { DiagramEditor } from '@/components/tools/diagram/DiagramEditor';
import { useArtifact } from '@/hooks/useArtifact';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.diagram;

export default function DiagramPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite, updateTags } = useArtifact('diagram', id || 'new');

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
      <DiagramEditor initialData={artifact?.data} onSave={save} />
    </EditorPageWrapper>
  );
}
