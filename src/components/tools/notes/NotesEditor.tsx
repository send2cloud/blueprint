import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useEffect, useMemo } from "react";

interface NotesEditorProps {
  initialContent?: unknown;
  onChange?: (content: unknown) => void;
}

export function NotesEditor({ initialContent, onChange }: NotesEditorProps) {
  // Parse initial content - BlockNote expects an array of blocks
  const parsedInitialContent = useMemo(() => {
    if (!initialContent) return undefined;
    if (Array.isArray(initialContent)) return initialContent;
    // Handle legacy tiptap format or other formats
    return undefined;
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: parsedInitialContent as any,
  });

  // Handle changes
  useEffect(() => {
    if (!onChange || !editor) return;

    // Use a debounced approach to avoid too many saves
    let timeout: NodeJS.Timeout;
    
    const handleChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        onChange(editor.document);
      }, 300);
    };

    // Subscribe to changes
    const unsubscribe = editor.onChange(handleChange);

    return () => {
      clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
    };
  }, [editor, onChange]);

  return (
    <div className="flex-1 overflow-auto bg-background">
      <BlockNoteView 
        editor={editor}
        theme="light"
        className="min-h-full"
      />
    </div>
  );
}
