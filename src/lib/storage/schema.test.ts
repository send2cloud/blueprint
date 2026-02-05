import { describe, it, expect } from "vitest";
import { normalizeArtifact, CURRENT_SCHEMA_VERSION } from "@/lib/storage/schema";

describe("normalizeArtifact", () => {
  it("returns null for invalid tool types", () => {
    const result = normalizeArtifact({
      id: "1",
      type: "unknown" as any,
      name: "Bad",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      favorite: false,
      pinned: false,
      schemaVersion: 1,
    });
    expect(result).toBeNull();
  });

  it("fills defaults for missing fields", () => {
    const result = normalizeArtifact({
      id: "abc",
      type: "notes",
      name: "",
    });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Untitled");
    expect(result?.favorite).toBe(false);
    expect(result?.pinned).toBe(false);
    expect(result?.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
  });
});
