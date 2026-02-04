import { GitBranch } from 'lucide-react';
import { ArtifactGallery } from '@/components/gallery/ArtifactGallery';
import { useArtifactList } from '@/hooks/useArtifact';

export default function FlowGallery() {
  const { artifacts, loading, deleteArtifact } = useArtifactList('flow');

  return (
    <ArtifactGallery
      type="flow"
      title="Flow Diagrams"
      icon={GitBranch}
      artifacts={artifacts}
      loading={loading}
      onDelete={deleteArtifact}
    />
  );
}
