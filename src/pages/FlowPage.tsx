import { useParams } from 'react-router-dom';
import { GitBranch } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { FlowEditor } from '@/components/tools/flow/FlowEditor';
import { useArtifact } from '@/hooks/useArtifact';

export default function FlowPage() {
  const { id } = useParams<{ id: string }>();
  const { artifact, loading, saving, save, rename } = useArtifact('flow', id || 'new');

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <ToolHeader title="Flow" icon={GitBranch} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ToolHeader 
        title="Flow" 
        icon={GitBranch}
        artifactId={artifact?.id}
        artifactName={artifact?.name}
        artifactType="flow"
        saving={saving}
        onRename={rename}
      />
      <div className="flex-1">
        <FlowEditor 
          key={artifact?.id}
          initialData={artifact?.data} 
          onSave={save} 
        />
      </div>
    </div>
  );
}
