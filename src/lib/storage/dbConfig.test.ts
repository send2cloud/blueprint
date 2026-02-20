import { describe, it, expect, beforeEach } from "vitest";
import { loadDbConfig, saveDbConfig, clearDbConfig } from './dbConfig';

describe("dbConfig", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads local config", () => {
    saveDbConfig({ provider: "local" });
    expect(loadDbConfig()).toEqual({ provider: "local", source: 'localStorage' });
  });

  it("saves and loads instantdb config", () => {
    saveDbConfig({ provider: "instantdb", instantAppId: "app_123" });
    expect(loadDbConfig()).toEqual({ provider: "instantdb", instantAppId: "app_123", source: 'localStorage' });
  });

  it("clears config", () => {
    saveDbConfig({ provider: "local" });
    clearDbConfig();
    expect(loadDbConfig()).toBeNull();
  });
});
