import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useArtifactList } from "@/hooks/useArtifactList";
import { setStorageAdapter } from "@/lib/storage";
import type { StorageAdapter, Artifact } from "@/lib/storage/types";

function createStorage(artifacts: Artifact[]): StorageAdapter {
  return {
    async getSettings() {
      return { enabledTools: ["canvas", "diagram", "board", "notes", "calendar"] };
    },
    async saveSettings() {},
    async getArtifact(id) {
      return artifacts.find((a) => a.id === id) ?? null;
    },
    async saveArtifact() {},
    async deleteArtifact() {},
    async listArtifacts() {
      return artifacts;
    },
    async listFavorites() {
      return artifacts.filter((a) => a.favorite);
    },
    async listByTag(tag) {
      return artifacts.filter((a) => a.tags?.includes(tag));
    },
    async listCalendarEvents() {
      return [];
    },
    async saveCalendarEvent() {},
    async deleteCalendarEvent() {},
  };
}

describe("useArtifactList", () => {
  it("sorts pinned artifacts first", async () => {
    const artifacts: Artifact[] = [
      {
        id: "1",
        type: "notes",
        name: "A",
        data: null,
        createdAt: new Date().toISOString(),
        updatedAt: "2020-01-01T00:00:00.000Z",
        favorite: false,
        pinned: false,
        schemaVersion: 1,
      },
      {
        id: "2",
        type: "notes",
        name: "B",
        data: null,
        createdAt: new Date().toISOString(),
        updatedAt: "2020-01-02T00:00:00.000Z",
        favorite: false,
        pinned: true,
        schemaVersion: 1,
      },
    ];

    setStorageAdapter(createStorage(artifacts));
    const { result } = renderHook(() => useArtifactList("notes"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.artifacts[0].id).toBe("2");
  });
});
