import { useParams } from 'react-router-dom';
import { Columns3 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { KanbanBoard } from '@/components/tools/kanban/KanbanBoard';
import { useArtifact } from '@/hooks/useArtifact';

export default function KanbanPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, saving, save, rename } = useArtifact('kanban', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Kanban" icon={Columns3} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader 
        title="Kanban" 
        icon={Columns3}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="kanban"
        saving={saving}
        onRename={rename}
      />
      <div className="flex-1">
        <KanbanBoard 
          key={artifact?.id}
          initialData={artifact?.data} 
          onSave={save} 
        />
      </div>
    </div>
  );
}
