import { describe, it, expect, beforeEach } from "vitest";
import { loadDbConfig, saveDbConfig, clearDbConfig } from "@/lib/storage/dbConfig";

describe("dbConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads local config", () => {
    saveDbConfig({ provider: "local" });
    expect(loadDbConfig()).toEqual({ provider: "local" });
  });

  it("saves and loads instantdb config", () => {
    saveDbConfig({ provider: "instantdb", instantAppId: "app_123" });
    expect(loadDbConfig()).toEqual({ provider: "instantdb", instantAppId: "app_123" });
  });

  it("clears config", () => {
    saveDbConfig({ provider: "local" });
    clearDbConfig();
    expect(loadDbConfig()).toBeNull();
  });
});
