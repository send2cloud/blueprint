import { Palette } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';

export default function CanvasGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Canvas" icon={Palette} />
      <div className="flex-1 overflow-auto">
        <ArtifactGallery 
          type="canvas" 
          newPath="/canvas/new"
          emptyTitle="No canvases yet"
          emptyDescription="Create your first drawing, whiteboard, or sketch"
          newButtonLabel="New Canvas"
        />
      </div>
    </div>
  );
}
