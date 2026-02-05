import { describe, it, expect } from "vitest";
import { ensureSeedNote } from "@/lib/seed";
import type { StorageAdapter, Artifact, BlueprintSettings } from "@/lib/storage/types";
import { CURRENT_SCHEMA_VERSION } from "@/lib/storage/schema";

function createMemoryStorage(): StorageAdapter & {
  artifacts: Artifact[];
  settings: BlueprintSettings;
} {
  return {
    artifacts: [],
    settings: { enabledTools: ["canvas", "diagram", "board", "notes", "calendar"] },
    async getSettings() {
      return this.settings;
    },
    async saveSettings(settings) {
      this.settings = settings;
    },
    async getArtifact(id) {
      return this.artifacts.find((a) => a.id === id) ?? null;
    },
    async saveArtifact(artifact) {
      const next = this.artifacts.filter((a) => a.id !== artifact.id);
      next.push(artifact);
      this.artifacts = next;
    },
    async deleteArtifact(id) {
      this.artifacts = this.artifacts.filter((a) => a.id !== id);
    },
    async listArtifacts(type) {
      return type ? this.artifacts.filter((a) => a.type === type) : this.artifacts;
    },
    async listFavorites() {
      return this.artifacts.filter((a) => a.favorite);
    },
    async listByTag(tag) {
      return this.artifacts.filter((a) => a.tags?.includes(tag));
    },
  };
}

describe("ensureSeedNote", () => {
  it("creates a seed note once", async () => {
    const storage = createMemoryStorage();
    await ensureSeedNote(storage);

    const notes = await storage.listArtifacts("notes");
    expect(notes).toHaveLength(1);
    expect(notes[0].name).toBe("Project Spark");
    expect(notes[0].schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(storage.settings.seededNoteCreated).toBe(true);

    await ensureSeedNote(storage);
    const notesAfter = await storage.listArtifacts("notes");
    expect(notesAfter).toHaveLength(1);
  });
});
