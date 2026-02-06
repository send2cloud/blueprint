import { Link2 } from 'lucide-react';
import { filterSuggestionItems, insertOrUpdateBlock } from '@blocknote/core';
import type { NotesEditorType } from './notesSchema';

/**
 * Slash menu items for the notes editor.
 */
export function getSlashMenuItems(editor: NotesEditorType) {
  const defaultItems = editor.dictionary.slashMenu;
  
  // Custom artifact embed item
  const embedItem = {
    title: 'Embed Artifact',
    subtext: 'Embed another artifact as a thumbnail',
    onItemClick: () => {
      insertOrUpdateBlock(editor, {
        type: 'artifact-embed',
        props: { artifactName: '' },
      });
    },
    aliases: ['embed', 'link', 'artifact', '[['],
    group: 'Media',
    icon: <Link2 className="h-4 w-4" />,
  };

  return [...Object.values(defaultItems), embedItem];
}

/**
 * Filter function for slash menu
 */
export function filterSlashMenuItems(editor: NotesEditorType, query: string) {
  return filterSuggestionItems(getSlashMenuItems(editor), query);
}
