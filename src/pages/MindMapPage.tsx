import { useParams } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { MindMapEditor } from '@/components/tools/mindmap/MindMapEditor';
import { useArtifact } from '@/hooks/useArtifact';

export default function MindMapPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, saving, save, rename } = useArtifact('mindmap', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Mind Map" icon={Brain} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader 
        title="Mind Map" 
        icon={Brain}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="mindmap"
        saving={saving}
        onRename={rename}
      />
      <div className="flex-1">
        <MindMapEditor 
          key={artifact?.id}
          initialData={artifact?.data} 
          onSave={save} 
        />
      </div>
    </div>
  );
}
