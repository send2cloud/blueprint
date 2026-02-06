import 'tldraw/tldraw.css';
import { useCallback, useRef } from 'react';
import { Tldraw, Editor, TLStoreSnapshot } from 'tldraw';
import { useTheme } from 'next-themes';

interface CanvasEditorProps {
  initialData?: unknown;
  onSave?: (data: unknown) => void;
}

export function CanvasEditor({ initialData, onSave }: CanvasEditorProps) {
  const { resolvedTheme } = useTheme();
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
      <Tldraw
        onMount={handleMount}
        inferDarkMode={resolvedTheme === 'dark'}
      />
    </div>
  );
}
