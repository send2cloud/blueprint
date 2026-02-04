import { Columns3 } from 'lucide-react';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { useArtifactList } from '@/hooks/useArtifact';

export default function KanbanGallery() {
  const { artifacts, loading, deleteArtifact } = useArtifactList('kanban');

  return (
    <ArtifactGallery
      type="kanban"
      title="Kanban Boards"
      icon={Columns3}
      artifacts={artifacts}
      loading={loading}
      onDelete={deleteArtifact}
    />
  );
}
