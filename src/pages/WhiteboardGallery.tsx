import { StickyNote } from 'lucide-react';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { useArtifactList } from '@/hooks/useArtifact';

export default function WhiteboardGallery() {
  const { artifacts, loading, deleteArtifact } = useArtifactList('whiteboard');

  return (
    <ArtifactGallery
      type="whiteboard"
      title="Whiteboards"
      icon={StickyNote}
      artifacts={artifacts}
      loading={loading}
      onDelete={deleteArtifact}
    />
  );
}
