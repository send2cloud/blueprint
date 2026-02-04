import { Columns3 } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';

export default function BoardGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Board" icon={Columns3} />
      <div className="flex-1 overflow-auto">
        <ArtifactGallery 
          type="board" 
          newPath="/board/new"
          emptyTitle="No boards yet"
          emptyDescription="Create your first kanban board or task tracker"
          newButtonLabel="New Board"
        />
      </div>
    </div>
  );
}
