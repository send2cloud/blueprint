import { createReactBlockSpec } from '@blocknote/react';
import { defaultProps } from '@blocknote/core';
import { ArtifactThumbnail } from '@/components/embeds/ArtifactThumbnail';
import { useArtifactByName } from '@/components/embeds/useArtifactByName';
import { AlertCircle, Link2 } from 'lucide-react';

/**
 * Inline component that resolves and displays an artifact.
 */
function ArtifactEmbedContent({ name }: { name: string }) {
  const artifact = useArtifactByName(name);

  if (!artifact) {
    return (
      <div className="flex items-center gap-2 p-2 my-1 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
        <AlertCircle className="h-4 w-4" />
        <span>Artifact not found: "{name}"</span>
      </div>
    );
  }

  return (
    <div className="my-2">
      <ArtifactThumbnail artifact={artifact} />
    </div>
  );
}

/**
 * Custom BlockNote block for embedding artifacts.
 * Usage: Type /embed or use the slash menu
 */
export const ArtifactEmbedBlock = createReactBlockSpec(
  {
    type: 'artifact-embed',
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      artifactName: {
        default: '',
      },
    },
    content: 'none',
  },
  {
    render: (props) => {
      const name = props.block.props.artifactName;

      if (!name) {
        return (
          <div className="flex items-center gap-2 p-3 my-1 bg-muted border border-border rounded text-muted-foreground text-sm">
            <Link2 className="h-4 w-4" />
            <input
              type="text"
              placeholder="Enter artifact name..."
              className="flex-1 bg-transparent outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  props.editor.updateBlock(props.block, {
                    props: { artifactName: e.currentTarget.value },
                  });
                }
              }}
              onBlur={(e) => {
                if (e.currentTarget.value) {
                  props.editor.updateBlock(props.block, {
                    props: { artifactName: e.currentTarget.value },
                  });
                }
              }}
            />
          </div>
        );
      }

      return <ArtifactEmbedContent name={name} />;
    },
  }
);
