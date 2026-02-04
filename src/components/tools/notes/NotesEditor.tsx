import { useEffect, useMemo } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';

interface NotesEditorProps {
  initialData?: unknown;
  onSave: (data: unknown) => void;
}

export function NotesEditor({ initialData, onSave }: NotesEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialData as any[] | undefined,
  });

  // Save on content change
  useEffect(() => {
    const handleChange = () => {
      const content = editor.document;
      onSave(content);
    };

    // Subscribe to changes
    const unsubscribe = editor.onChange(handleChange);
    
    return () => {
      unsubscribe();
    };
  }, [editor, onSave]);

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
