import { useParams } from 'react-router-dom';
import { StickyNote } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { StickyWhiteboard } from '@/components/tools/whiteboard/StickyWhiteboard';
import { useArtifact } from '@/hooks/useArtifact';

export default function WhiteboardPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, saving, save, rename } = useArtifact('whiteboard', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Whiteboard" icon={StickyNote} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader 
        title="Whiteboard" 
        icon={StickyNote}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="whiteboard"
        saving={saving}
        onRename={rename}
      />
      <div className="flex-1">
        <StickyWhiteboard 
          key={artifact?.id}
          initialData={artifact?.data} 
          onSave={save} 
        />
      </div>
    </div>
  );
}
