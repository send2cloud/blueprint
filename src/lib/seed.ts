import { StorageAdapter, Artifact } from './storage/types';
import { CURRENT_SCHEMA_VERSION } from './storage/schema';

const SEED_NOTE_ID = 'blueprint-seed-note';

function createSeedNoteData() {
  return [
    {
      type: 'heading',
      props: { level: 1 },
      content: [{ type: 'text', text: 'Project Spark' }],
      children: [],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Why does this project exist? What was the spark?' },
      ],
      children: [],
    },
    {
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Current Status' }],
      children: [],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'What is true today?' }],
      children: [],
    },
    {
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Artifacts' }],
      children: [],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Links to key diagrams, sketches, and notes.' }],
      children: [],
    },
    {
      type: 'heading',
      props: { level: 2 },
      content: [{ type: 'text', text: 'Open Questions' }],
      children: [],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'What are we unsure about?' }],
      children: [],
    },
  ];
}

export async function ensureSeedNote(storage: StorageAdapter): Promise<void> {
  const settings = await storage.getSettings();
  if (settings.seededNoteCreated) return;

  const existing = await storage.listArtifacts('notes');
  if (existing.length > 0) {
    await storage.saveSettings({ ...settings, seededNoteCreated: true });
    return;
  }

  const now = new Date().toISOString();
  const seedArtifact: Artifact = {
    id: SEED_NOTE_ID,
    type: 'notes',
    name: 'Project Spark',
    data: createSeedNoteData(),
    createdAt: now,
    updatedAt: now,
    favorite: false,
    pinned: true,
    schemaVersion: CURRENT_SCHEMA_VERSION,
  };

  await storage.saveArtifact(seedArtifact);
  await storage.saveSettings({ ...settings, seededNoteCreated: true });
}
