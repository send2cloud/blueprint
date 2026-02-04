import { FileText } from 'lucide-react';
import { ToolHeader } from '@/components/layout/ToolHeader';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';

export default function NotesGallery() {
  return (
    <div className="flex flex-col h-full">
      <ToolHeader title="Notes" icon={FileText} />
      <ArtifactGallery
        type="notes"
        newPath="/notes/new"
        emptyTitle="No notes yet"
        emptyDescription="Create your first note to capture ideas, write documents, and track to-dos with a rich block editor."
        newButtonLabel="New Note"
      />
    </div>
  );
}
