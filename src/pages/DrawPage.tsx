import { useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { DrawingCanvas } from '@/components/tools/draw/DrawingCanvas';
import { useArtifact } from '@/hooks/useArtifact';

export default function DrawPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, saving, save, rename } = useArtifact('draw', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Draw" icon={Pencil} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader 
        title="Draw" 
        icon={Pencil}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="draw"
        saving={saving}
        onRename={rename}
      />
      <div className="flex-1">
        <DrawingCanvas 
          key={artifact?.id}
          initialData={artifact?.data} 
          onSave={save} 
        />
      </div>
    </div>
  );
}
