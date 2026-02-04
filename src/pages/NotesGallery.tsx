import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { TOOL_CONFIG } from '@/lib/toolConfig';

const tool = TOOL_CONFIG.notes;

export default function NotesGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title={tool.title} icon={tool.icon} />
      <div className="flex-1 overflow-auto">
        <ArtifactGallery
          type="notes"
          newPath="/notes/new"
          emptyTitle={`No ${tool.typeLabel}s yet`}
          emptyDescription="Create your first doc to capture ideas, write documentation, or draft content."
          newButtonLabel={`New ${tool.title}`}
        />
      </div>
    </div>
  );
}
