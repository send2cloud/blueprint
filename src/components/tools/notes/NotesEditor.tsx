import { useEffect, useMemo } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import '@blocknote/shadcn/style.css';

interface NotesEditorProps {
  initialContent?: unknown;
  onChange?: (content: unknown) => void;
}

export function NotesEditor({ initialContent, onChange }: NotesEditorProps) {
  const editor = useCreateBlockNote({
    initialContent: initialContent as any,
  });

  useEffect(() => {
    if (!onChange) return;

    const handleChange = () => {
      onChange(editor.document);
    };

    editor.onChange(handleChange);
  }, [editor, onChange]);

  return (
    <div className="flex-1 overflow-auto">
      <BlockNoteView 
        editor={editor} 
        theme="light"
        className="min-h-full"
      />
    </div>
  );
}
