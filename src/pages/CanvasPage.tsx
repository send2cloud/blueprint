import { useParams } from 'react-router-dom';
import { EditorPageWrapper } from '@/components/layout/EditorPageWrapper';
import { CanvasEditor } from '@/components/tools/canvas/CanvasEditor';
import { useArtifact } from '@/hooks/useArtifact';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.canvas;

export default function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite, updateTags } = useArtifact('canvas', id || 'new');

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
      <CanvasEditor initialData={artifact?.data} onSave={save} currentArtifactId={artifact?.id} />
    </EditorPageWrapper>
  );
}
