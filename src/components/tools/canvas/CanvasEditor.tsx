import 'tldraw/tldraw.css';
import { useCallback, useRef, useState } from 'react';
import { Tldraw, Editor, TLStoreSnapshot } from 'tldraw';
import { useTheme } from 'next-themes';
import { Link2, HelpCircle } from 'lucide-react';
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

export function CanvasEditor({ initialData, onSave, currentArtifactId }: CanvasEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Editor | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

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
      />

      {/* Top-right toolbar */}
      <div className="absolute top-3 right-14 z-50 flex items-center gap-1">
        <button
          onClick={() => setHelpOpen(true)}
          className="p-2 bg-background/90 backdrop-blur border border-border rounded-lg shadow-sm hover:bg-accent transition-colors"
          title="Help & Tips"
        >
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => setPickerOpen(true)}
          className="p-2 bg-background/90 backdrop-blur border border-border rounded-lg shadow-sm hover:bg-accent transition-colors"
          title="Embed Artifact"
        >
          <Link2 className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

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
