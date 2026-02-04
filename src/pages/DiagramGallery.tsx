import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.diagram;

export default function DiagramGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title={tool.title} icon={tool.icon} />
      <div className="flex-1 overflow-auto">
        <ArtifactGallery 
          type="diagram" 
          newPath="/diagram/new"
          emptyTitle={`No ${tool.typeLabel}s yet`}
          emptyDescription="Create your first flow chart, mind map, or system diagram"
          newButtonLabel={`New ${tool.title}`}
        />
      </div>
    </div>
  );
}
