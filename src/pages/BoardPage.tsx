import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { BoardEditor } from '@/components/tools/board/BoardEditor';
import { useArtifact } from '@/hooks/useArtifact';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.board;

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, error, saving, save, rename, toggleFavorite } = useArtifact('board', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title={tool.title} icon={tool.icon} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title={tool.title} icon={tool.icon} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        title={tool.title}
        icon={tool.icon}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="board"
        artifactFavorite={artifact?.favorite}
        saving={saving}
        onRename={rename}
        onToggleFavorite={toggleFavorite}
      />
      <div className="flex-1">
        <BoardEditor
          initialData={artifact?.data}
          onSave={save}
        />
      </div>
    </div>
  );
}
