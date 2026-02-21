
# Dual Build Architecture — SPA + Library Bundle

## Status: ✅ Implemented

## Problem
Blueprint needs to serve two use cases:
1. **Standalone SPA** — Published via Lovable as its own site
2. **Embedded Library** — Ingested into other React projects as a pre-built JS bundle

A single `vite.config.ts` with `build.lib` broke the SPA pipeline (no `index.html` in production).

## Solution: Two Independent Vite Configs

| Build | Config File | Command | Output | Use Case |
|-------|-------------|---------|--------|----------|
| **SPA** | `vite.config.ts` | `npm run build` | `dist/` | Lovable publish, standalone dev |
| **Library** | `vite.config.lib.ts` | `npm run build:lib` | `dist-lib/` | Embedding in other projects |

### Key Files

- `vite.config.ts` — Standard SPA build (unchanged, no `build.lib`)
- `vite.config.lib.ts` — Library build with React externalized
- `src/lib-entry.ts` — Clean entry point for library consumers (exports `App` + types)
- `scripts/install.sh` — Updated to reference `dist-lib/` for embed mode

### How Embedding Works

Host projects import the pre-built bundle:
```tsx
import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
import './blueprint/dist-lib/style.css';

<Route path="/blueprint/*" element={<BlueprintApp basename="/blueprint" />} />
```

No dependency merging, no Vite dedupe in host, no shadcn setup. The library bundle is self-contained (minus React/ReactDOM/react-router-dom which the host provides).

### Documentation Updated
- `README.md` — Added "Dual Build Architecture" section
- `INSTALL.md` — Updated all import paths to `dist-lib/`, added build table
- `LLM_INSTALL.md` — Simplified to "use the pre-built bundle" approach
