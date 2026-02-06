import 'tldraw/tldraw.css';
import { useCallback, useRef, useState } from 'react';
import {
  Tldraw,
  Editor,
  TLStoreSnapshot,
  DefaultToolbar,
  DefaultToolbarContent,
  TLComponents,
  TldrawUiMenuItem,
  useEditor,
  DefaultContextMenu,
  DefaultContextMenuContent,
  TldrawUiMenuGroup,
} from 'tldraw';
import { useTheme } from 'next-themes';
import { ArtifactEmbedShapeUtil, navigateToArtifact } from './ArtifactEmbedShape';
import { ArtifactPickerDialog } from './ArtifactPickerDialog';
import type { Artifact } from '@/lib/storage/types';
import type { Artifact } from '@/lib/storage/types';

// Custom shape utils array (must be stable reference)
const customShapeUtils = [ArtifactEmbedShapeUtil];

interface CanvasEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
  currentArtifactId?: string;
}

// We need to lift state for the picker dialog through a context
// since tldraw's toolbar component doesn't have direct access to our state
interface ToolbarActionsContext {
  openPicker: () => void;
}

let toolbarActions: ToolbarActionsContext = {
  openPicker: () => {},
};

// Custom toolbar with embed button only (help is in the page header now)
function CustomToolbar() {
  return (
    <DefaultToolbar>
      <TldrawUiMenuItem
        id="embed-artifact"
        icon="link"
        label="Embed Artifact"
        onSelect={() => toolbarActions.openPicker()}
      />
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}

// Custom context menu with "Open" option for artifact embeds
function CustomContextMenu() {
  const editor = useEditor();

  // Check if the selection includes an artifact embed
  const selectedShapes = editor.getSelectedShapes();
  const artifactEmbed = selectedShapes.find(
    (s) => s.type === 'artifact-embed'
  ) as { props: { artifactId: string } } | undefined;

  return (
    <DefaultContextMenu>
      {artifactEmbed && (
        <TldrawUiMenuGroup id="artifact-actions">
          <TldrawUiMenuItem
            id="open-artifact"
            label="Open Artifact"
            icon="external-link"
            onSelect={() => {
              navigateToArtifact(artifactEmbed.props.artifactId);
            }}
          />
        </TldrawUiMenuGroup>
      )}
      <DefaultContextMenuContent />
    </DefaultContextMenu>
  );
}

const components: TLComponents = {
  Toolbar: CustomToolbar,
  ContextMenu: CustomContextMenu,
};

export function CanvasEditor({ initialData, onSave, currentArtifactId }: CanvasEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Editor | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Expose actions to the toolbar component
  toolbarActions = {
    openPicker: () => setPickerOpen(true),
  };

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    if (initialData) {
      try {
        editor.store.loadSnapshot(initialData as TLStoreSnapshot);
      } catch (err) {
        console.error('Failed to load snapshot:', err);
      }
    }

    const unsubscribe = editor.store.listen(() => {
      if (onSave) {
        const snapshot = editor.store.getSnapshot();
        onSave(snapshot);
      }
    }, { source: 'user', scope: 'document' });

    return () => {
      unsubscribe();
    };
  }, [initialData, onSave]);

  const handleInsertArtifact = useCallback((artifact: Artifact) => {
    const editor = editorRef.current;
    if (!editor) return;

    const viewportCenter = editor.getViewportScreenCenter();
    const pagePoint = editor.screenToPage(viewportCenter);

    editor.createShape({
      type: 'artifact-embed',
      x: pagePoint.x - 120,
      y: pagePoint.y - 40,
      props: {
        w: 260,
        h: 90,
        artifactId: artifact.id,
        artifactName: artifact.name,
      },
    });

    setPickerOpen(false);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Tldraw
        onMount={handleMount}
        inferDarkMode={resolvedTheme === 'dark'}
        shapeUtils={customShapeUtils}
        components={components}
      />

      <ArtifactPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleInsertArtifact}
        excludeId={currentArtifactId}
      />

      <CanvasHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
