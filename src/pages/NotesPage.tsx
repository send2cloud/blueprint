import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { NotesEditor } from '@/components/tools/notes/NotesEditor';
import { useArtifact } from '@/hooks/useArtifact';
import { useCallback } from 'react';
import { TOOL_CONFIG } from '@/lib/toolConfig';
import { HiddenLlmPayload } from '@/components/llm/HiddenLlmPayload';

const tool = TOOL_CONFIG.notes;

export default function NotesPage() {
  const { id } = useParams();
  const { artifact, loading, error, save, rename, toggleFavorite, saving } = useArtifact('notes', id);

  const handleSave = useCallback((data: unknown) => {
    save(data);
  }, [save]);

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

  if (error || !artifact) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title={tool.title} icon={tool.icon} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-destructive">{error || 'Failed to load doc'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader
        title={tool.title}
        icon={tool.icon}
        artifactId={artifact.id}
        artifactName={artifact.name}
        artifactType={artifact.type}
        artifactFavorite={artifact.favorite}
        onRename={rename}
        onToggleFavorite={toggleFavorite}
        saving={saving}
      />
      <HiddenLlmPayload artifact={artifact} />
      <div className="flex-1 overflow-hidden">
        <NotesEditor
          initialData={artifact.data}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
