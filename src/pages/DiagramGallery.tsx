import { GitBranch } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';

export default function DiagramGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Diagram" icon={GitBranch} />
      <div className="flex-1 overflow-auto">
        <ArtifactGallery 
          type="diagram" 
          newPath="/diagram/new"
          emptyTitle="No diagrams yet"
          emptyDescription="Create your first flow, mind map, or system diagram"
          newButtonLabel="New Diagram"
        />
      </div>
    </div>
  );
}
