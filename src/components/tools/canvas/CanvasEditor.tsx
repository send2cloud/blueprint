import 'tldraw/tldraw.css';
import { useCallback, useRef, useState } from 'react';
import { Tldraw, Editor, TLStoreSnapshot } from 'tldraw';
import { useTheme } from 'next-themes';
import { ArtifactEmbedShapeUtil } from './ArtifactEmbedShape';
import { ArtifactPickerDialog } from './ArtifactPickerDialog';
import type { Artifact } from '@/lib/storage/types';

// Custom shape utils array (must be stable reference)
const customShapeUtils = [ArtifactEmbedShapeUtil];

interface CanvasEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
  currentArtifactId?: string; // To exclude self from picker
}

export function CanvasEditor({ initialData, onSave, currentArtifactId }: CanvasEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Editor | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    // Load initial data if available
    if (initialData) {
      try {
        editor.store.loadSnapshot(initialData as TLStoreSnapshot);
      } catch (err) {
        console.error('Failed to load snapshot:', err);
      }
    }

    // Listen for changes and save
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

    // Get center of viewport
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

      {/* Embed button overlay */}
      <button
        onClick={() => setPickerOpen(true)}
        className="absolute bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg shadow-lg hover:bg-accent transition-colors text-sm font-medium"
      >
        <span className="text-base">📎</span>
        Embed Artifact
      </button>

      <ArtifactPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleInsertArtifact}
        excludeId={currentArtifactId}
      />
    </div>
  );
}
