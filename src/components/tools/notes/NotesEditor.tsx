import { useEffect, useMemo, useRef } from 'react';
import { BlockNoteEditor, PartialBlock } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

interface NotesEditorProps {
  initialData?: unknown;
  onSave: (data: unknown) => void;
}

export function NotesEditor({ initialData, onSave }: NotesEditorProps) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  // Create editor only once with stable initial content
  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      initialContent: initialData as PartialBlock[] | undefined,
    });
  }, []); // Empty deps - only create once

  // Handle content changes
  useEffect(() => {
    const handleChange = () => {
      const content = editor.document;
      onSaveRef.current(content);
    };

    const unsubscribe = editor.onChange(handleChange);
    
    return () => {
      unsubscribe();
    };
  }, [editor]);

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <BlockNoteView 
          editor={editor} 
          theme="light"
          className="min-h-[500px]"
        />
      </div>
    </div>
  );
}
