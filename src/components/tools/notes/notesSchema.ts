import { BlockNoteSchema, defaultBlockSpecs } from '@blocknote/core';
import { ArtifactEmbedBlock } from './ArtifactEmbedBlock';

/**
 * Custom BlockNote schema with artifact embed support.
 */
export const notesSchema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    'artifact-embed': ArtifactEmbedBlock,
  },
});

export type NotesEditorType = typeof notesSchema.BlockNoteEditor;
