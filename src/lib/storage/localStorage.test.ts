import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageAdapter } from './localStorage';
import type { Artifact } from './types';
import { CURRENT_SCHEMA_VERSION } from './schema';

const now = new Date().toISOString();

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: overrides.id ?? "a1",
    type: overrides.type ?? "notes",
    name: overrides.name ?? "Test",
    data: overrides.data ?? { hello: "world" },
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    favorite: overrides.favorite ?? false,
    pinned: overrides.pinned ?? false,
    schemaVersion: overrides.schemaVersion ?? CURRENT_SCHEMA_VERSION,
  };
}

describe("LocalStorageAdapter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads artifacts", async () => {
    const adapter = new LocalStorageAdapter();
    const artifact = makeArtifact({ id: "abc" });
    await adapter.saveArtifact(artifact);
    const loaded = await adapter.getArtifact("abc");
    expect(loaded?.id).toBe("abc");
    expect(loaded?.favorite).toBe(false);
  });

  it("lists artifacts by type", async () => {
    const adapter = new LocalStorageAdapter();
    await adapter.saveArtifact(makeArtifact({ id: "a1", type: "notes" }));
    await adapter.saveArtifact(makeArtifact({ id: "a2", type: "diagram" }));
    const notes = await adapter.listArtifacts("notes");
    expect(notes).toHaveLength(1);
    expect(notes[0].type).toBe("notes");
  });

  it("lists favorites", async () => {
    const adapter = new LocalStorageAdapter();
    await adapter.saveArtifact(makeArtifact({ id: "a1", favorite: true }));
    await adapter.saveArtifact(makeArtifact({ id: "a2", favorite: false }));
    const favorites = await adapter.listFavorites();
    expect(favorites).toHaveLength(1);
    expect(favorites[0].id).toBe("a1");
  });
});
