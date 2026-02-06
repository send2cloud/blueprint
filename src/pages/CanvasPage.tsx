import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { EditorPageWrapper } from '@/components/layout/EditorPageWrapper';
import { CanvasEditor } from '@/components/tools/canvas/CanvasEditor';
import { CanvasHelpDialog } from '@/components/tools/canvas/CanvasHelpDialog';
import { Button } from '@/components/ui/button';
import { useArtifact } from '@/hooks/useArtifact';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.canvas;

export default function CanvasPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite, updateTags } = useArtifact('canvas', id || 'new');
  const [helpOpen, setHelpOpen] = useState(false);

  const headerActions = useMemo(() => (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={() => setHelpOpen(true)}
      title="Help"
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  ), []);

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
      headerActions={headerActions}
    >
      <CanvasEditor initialData={artifact?.data} onSave={save} currentArtifactId={artifact?.id} />
      <CanvasHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </EditorPageWrapper>
  );
}
