# AGENTS

- Storage backends implement `RecordStore` (list/get/put/remove) and are wrapped by `RecordStoreAdapter`; only InstantDB keeps a bespoke adapter. Why: a new backend is four calls, not fifteen.
- Heavy backend SDKs (Supabase, InstantDB) are loaded via `lazyAdapter` dynamic import. Why: users of other backends never download them.
- Backend precedence: host `adapter` prop > build env vars > Settings > browser. Why: host apps and published builds must be deterministic.
- `worker/` is a standalone Cloudflare Worker + D1 implementing the REST record API; it is not built with the app. Why: one Worker per host project.
- Theme CSS variables are prefixed `--bp-*`. Why: embedding must not overwrite host theme variables.
- The SPA build (`vite.config.ts`) and library build (`vite.config.lib.ts`) stay separate. Why: library options break the SPA build.
- StorageAdapter methods throw on failure rather than returning `{ success, data, error }`. Why: existing hooks depend on it; migrate as a separate change.
- Pure business rules live in `src/core/` (no React/storage) and return `{ success, data, error }`. Why: testable and portable.
- Access flow is decided once in `AccessGate`: host `user` > setup wizard (new install only) > PIN > app. Why: one place owns gating.
