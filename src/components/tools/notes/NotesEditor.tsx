import { useEffect, useRef, useState } from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { useTheme } from '@/contexts/ThemeContext';
import '@blocknote/mantine/style.css';

interface NotesEditorProps {
  initialData?: unknown;
  onSave: (data: unknown) => void;
}

export function NotesEditor({ initialData, onSave }: NotesEditorProps) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const { resolvedTheme } = useTheme();
  
  const [editor, setEditor] = useState<BlockNoteEditor | null>(null);
  const editorCreated = useRef(false);

  // Create editor only once - handle React Strict Mode double-mount
  useEffect(() => {
    if (editorCreated.current) return;
    editorCreated.current = true;

    const newEditor = BlockNoteEditor.create({
      initialContent: initialData as PartialBlock[] | undefined,
    });
    
    setEditor(newEditor);

    // No cleanup - BlockNote doesn't support proper cleanup
    // and re-creating causes the duplicate ID error
  }, []);

  // Handle content changes
  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      const content = editor.document;
      onSaveRef.current(content);
    };

    const unsubscribe = editor.onChange(handleChange);
    
    return () => {
      unsubscribe();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <BlockNoteView 
          editor={editor} 
          theme={resolvedTheme}
          className="min-h-[500px]"
        />
      </div>
    </div>
  );
}
