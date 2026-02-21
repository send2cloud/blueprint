# Blueprint Installation Guide for LLMs

This guide helps AI assistants efficiently install Blueprint into a target project as an embedded library.

---

## Step 1: Run the Install Script

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
```

This downloads Blueprint into a `blueprint/` folder with a pre-built library bundle at `dist-lib/`.

---

## Step 2: Mount in Host App

Blueprint ships as a pre-built ES module. No host dependencies are needed — just import and mount:

```tsx
// In the host app's router
import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
import './blueprint/dist-lib/style.css';

<Route path="/blueprint/*" element={<BlueprintApp basename="/blueprint" />} />
```

React, ReactDOM, and react-router-dom are externalized — the host provides them.

---

## Step 3: Done!

That's it. No Vite dedupe config, no dependency merging, no shadcn setup needed in the host. The bundle is self-contained (minus React).

---

## Optional: Cloud Storage

For persistent storage across devices, set the InstantDB App ID in the host's environment:

```bash
VITE_INSTANTDB_APP_ID=your-app-id-here
```

Without this, Blueprint defaults to browser localStorage.

---

## Build Architecture

| Build | Config | Command | Output | Purpose |
|-------|--------|---------|--------|---------|
| **Default** | `vite.config.ts` | `npm run build` | `dist/` | Standalone app (Lovable publish) |
| **Library** | `vite.config.lib.ts` | `npm run build:lib` | `dist-lib/` | Embedded inside host projects |

The **Library** build (`dist-lib/blueprint.es.js` + `style.css`) is what host projects import. The **Default** build (`dist/`) is for running Blueprint as its own site.

---

## Advanced: Rebuilding the Library Bundle

If you need to modify Blueprint and rebuild the library bundle:

```bash
cd blueprint
npm install
npm run build:lib   # Produces dist-lib/blueprint.es.js + style.css
```

---

## LLM Optimization Tips

1. **Use the pre-built library bundle** — Don't copy source files into the host. Import from `dist-lib/` instead.
2. **No dependency merging** — The library bundle includes everything except React. No need to install Blueprint's dependencies in the host.
3. **No Vite dedupe** — ProseMirror deduplication is handled inside the library bundle.
4. **Basename prop** — Always pass `basename="/blueprint"` (or whatever mount path) so internal navigation works.
5. **Cloud IDEs** — In cloud IDEs like Lovable/Cursor/Codespaces, preview URLs dynamically replace localhost ports.
