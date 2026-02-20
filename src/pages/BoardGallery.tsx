import { ToolHeader } from '../components/layout/ToolHeader';
import { ArtifactGallery } from '../components/gallery/ArtifactGallery';
import { TOOL_CONFIG } from '../lib/toolConfig';

const tool = TOOL_CONFIG.board;

export default function BoardGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title={tool.title} icon={tool.icon} />
      <div className="flex-1 overflow-auto">
        <ArtifactGallery 
          type="board" 
          newPath="/board/new"
          emptyTitle={`No ${tool.typeLabel}s yet`}
          emptyDescription="Create your first kanban board or task tracker"
          newButtonLabel={`New ${tool.title}`}
        />
      </div>
    </div>
  );
}
