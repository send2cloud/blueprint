import 'tldraw/tldraw.css';
import { useEffect, useCallback, useRef } from 'react';
import { Tldraw, Editor, TLStoreSnapshot } from 'tldraw';

interface DrawingCanvasProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

export function DrawingCanvas({ initialData, onSave }: DrawingCanvasProps) {
  const editorRef = useRef<Editor | null>(null);

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

  return (
    <div className="w-full h-full">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
