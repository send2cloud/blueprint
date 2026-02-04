import { Brain } from 'lucide-react';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { useArtifactList } from '@/hooks/useArtifact';

export default function MindMapGallery() {
  const { artifacts, loading, deleteArtifact } = useArtifactList('mindmap');

  return (
    <ArtifactGallery
      type="mindmap"
      title="Mind Maps"
      icon={Brain}
      artifacts={artifacts}
      loading={loading}
      onDelete={deleteArtifact}
    />
  );
}
