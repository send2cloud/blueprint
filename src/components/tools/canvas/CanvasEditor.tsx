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
} from 'tldraw';
import { useTheme } from 'next-themes';
import { ArtifactEmbedShapeUtil } from './ArtifactEmbedShape';
import { ArtifactPickerDialog } from './ArtifactPickerDialog';
import { CanvasHelpDialog } from './CanvasHelpDialog';
import type { Artifact } from '@/lib/storage/types';

// Custom shape utils array (must be stable reference)
const customShapeUtils = [ArtifactEmbedShapeUtil];

interface CanvasEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
  currentArtifactId?: string;
}

// We need to lift state for the picker/help dialogs through a context
// since tldraw's toolbar component doesn't have direct access to our state
interface ToolbarActionsContext {
  openPicker: () => void;
  openHelp: () => void;
}

let toolbarActions: ToolbarActionsContext = {
  openPicker: () => {},
  openHelp: () => {},
};

// Custom toolbar that includes our embed + help buttons
function CustomToolbar() {
  return (
    <DefaultToolbar>
      <TldrawUiMenuItem
        id="embed-artifact"
        icon="link"
        label="Embed Artifact"
        onSelect={() => toolbarActions.openPicker()}
      />
      <TldrawUiMenuItem
        id="help"
        icon="question-mark"
        label="Help"
        onSelect={() => toolbarActions.openHelp()}
      />
      <DefaultToolbarContent />
    </DefaultToolbar>
  );
}

const components: TLComponents = {
  Toolbar: CustomToolbar,
};

export function CanvasEditor({ initialData, onSave, currentArtifactId }: CanvasEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Editor | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Expose actions to the toolbar component
  toolbarActions = {
    openPicker: () => setPickerOpen(true),
    openHelp: () => setHelpOpen(true),
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
