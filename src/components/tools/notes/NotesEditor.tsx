import { useEffect, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { useTheme } from 'next-themes';
import { PartialBlock } from '@blocknote/core';
import '@blocknote/mantine/style.css';

interface NotesEditorProps {
  initialData?: unknown;
  onSave: (data: unknown) => void;
}

export function NotesEditor({ initialData, onSave }: NotesEditorProps) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const { resolvedTheme } = useTheme();

  // Use the official React hook for proper lifecycle management
  const editor = useCreateBlockNote({
    initialContent: initialData as PartialBlock[] | undefined,
  });

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
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          className="min-h-[500px]"
        />
      </div>
    </div>
  );
}
