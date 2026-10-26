import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { loadDbConfig, saveDbConfig, clearDbConfig } from './dbConfig';

describe("dbConfig", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubEnv('VITE_INSTANTDB_APP_ID', '');
    vi.stubEnv('VITE_BLUEPRINT_BACKEND', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it("saves and loads cloudflare config", () => {
    saveDbConfig({ provider: "cloudflare", url: "https://x.workers.dev", key: "k" });
    expect(loadDbConfig()).toEqual({ provider: "cloudflare", url: "https://x.workers.dev", key: "k", source: 'localStorage' });
  });

  it("ignores invalid saved config", () => {
    saveDbConfig({ provider: "supabase" });
    expect(loadDbConfig()).toBeNull();
  });

  it("env InstantDB App ID wins over saved config", () => {
    vi.stubEnv('VITE_INSTANTDB_APP_ID', 'app_env');
    saveDbConfig({ provider: "local" });
    expect(loadDbConfig()?.provider).toBe('instantdb');
  });

  it("clears config", () => {
    saveDbConfig({ provider: "local" });
    clearDbConfig();
    expect(loadDbConfig()).toBeNull();
  });
});
