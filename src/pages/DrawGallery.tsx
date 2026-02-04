import { Pencil } from 'lucide-react';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { useArtifactList } from '@/hooks/useArtifact';

export default function DrawGallery() {
  const { artifacts, loading, deleteArtifact } = useArtifactList('draw');

  return (
    <ArtifactGallery
      type="draw"
      title="Drawings"
      icon={Pencil}
      artifacts={artifacts}
      loading={loading}
      onDelete={deleteArtifact}
    />
  );
}
