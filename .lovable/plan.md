
# Dual Build Architecture — Solo + Multi-Project

## Status: ✅ Implemented

## Terminology
- **Multi-Project** = This Lovable standalone installation. Runs as its own published site. Default `npm run build` → `dist/`.
- **Solo** = Blueprint embedded inside another project as a library bundle. `npm run build:lib` → `dist-lib/`.

## Problem
Blueprint needs to serve two use cases:
1. **Multi-Project** — Published via Lovable as its own site
2. **Solo** — Embedded into other React projects as a pre-built JS bundle

A single `vite.config.ts` with `build.lib` broke the Multi-Project pipeline (no `index.html` in production).

## Solution: Two Independent Vite Configs

| Mode | Config File | Command | Output | Use Case |
|------|-------------|---------|--------|----------|
| **Multi-Project** | `vite.config.ts` | `npm run build` | `dist/` | Lovable publish, standalone dev |
| **Solo** | `vite.config.lib.ts` | `npm run build:lib` | `dist-lib/` | Embedded in other projects |

### Key Files

- `vite.config.ts` — Multi-Project build (standard SPA, no `build.lib`)
- `vite.config.lib.ts` — Solo build with React externalized
- `src/lib-entry.ts` — Clean entry point for Solo consumers (exports `App` + types)
- `scripts/install.sh` — Updated to reference `dist-lib/` for Solo mode

### How Solo Mode Works

Host projects import the pre-built bundle:
```tsx
import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
import './blueprint/dist-lib/style.css';

<Route path="/blueprint/*" element={<BlueprintApp basename="/blueprint" />} />
```

No dependency merging, no Vite dedupe in host, no shadcn setup. The Solo bundle is self-contained (minus React/ReactDOM/react-router-dom which the host provides).

### Documentation Updated
- `README.md` — Uses Solo / Multi-Project terminology throughout
- `INSTALL.md` — Updated all references and build table
- `LLM_INSTALL.md` — Simplified for Solo embedding workflow
