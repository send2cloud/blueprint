# Blueprint — Creative Idea Room

Blueprint is a personal, project-local toolbox for capturing the spark behind a project and everything that follows: notes, sketches, flows, tasks, and artifacts. It is meant to travel with each repo as a detachable "idea room" you can return to months later and immediately understand why the project exists and where it stands.

## Features

| Tool | Description | Library |
|------|-------------|---------|
| **Whiteboard** | Freeform sketches & visual notes | tldraw |
| **Flow** | Diagrams, mind maps, system flows | @xyflow/react |
| **Tasks** | Kanban boards with Trello-style cards | @hello-pangea/dnd |
| **Docs** | Rich text documents & notes | BlockNote |
| **Calendar** | Unified scheduling view (global, not per-artifact) | react-big-calendar |

Plus: Tags, Favorites, deep-linking, and a gallery view for each artifact type.

---

## Build Architecture

Blueprint supports two build targets:

| Build | Command | Output | Use Case |
|-------|---------|--------|----------|
| **Default** | `npm run build` | `dist/` | Standalone site, `npm run dev`, direct publishing |
| **Library** | `npm run build:lib` | `dist-lib/` | Embedded inside another React project |

### Default Build

The default `vite build` produces a standard `index.html` + JS/CSS bundle in `dist/`. This is what Lovable's publish pipeline uses. Blueprint runs as its own full site with its own URL.

### Library Build

`npm run build:lib` uses a separate `vite.config.lib.ts` to produce:
- `dist-lib/blueprint.es.js` — ES module with React/ReactDOM externalized
- `dist-lib/style.css` — All styles bundled

The host project provides React and ReactDOM, preventing duplicate instances and `useRef` crashes.

```tsx
// Host project usage (library build)
import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
import './blueprint/dist-lib/style.css';

<Route path="/blueprint/*" element={
  <BlueprintApp
    basename="/blueprint"
    adapter={myAdapter}          // optional, overrides Settings
    liveConnectors={[            // optional, sidebar "Live" section
      { id: 'map', label: 'Sitemap', url: '/admin/map', target: 'top', badge: 'live', badgeVariant: 'success' },
    ]}
  />
} />
```

- Pass `user={{ id, name, email }}` to use the host's signed-in user; Blueprint then skips its own PIN and setup.
- Supports React 18 and 19.
- Theme colours use `--bp-*` variables, so they don't overwrite the host's `--primary`, `--background`, etc.

---

## First-run setup

A brand-new standalone install shows a short wizard: backend → team PIN → workspace name and colour. Existing installs skip it and keep PIN 5555 until changed in Settings → Access.

## Storage Configuration

Pick a backend in **Settings → Backend**, bake one in at build time, or pass your own from the host app.

| Backend | Setup |
|---------|-------|
| Browser only | Nothing. Data stays in this browser. |
| Cloudflare | Deploy `worker/` (Worker + D1). See `worker/README.md`. |
| Supabase | Run the setup script (Settings → Copy setup script) once, then paste project URL + publishable key. |
| InstantDB | App ID (hosted or self-hosted). |
| Custom | Any backend serving the REST record API below. |

**Priority:** host `adapter` prop → build env vars → Settings → Browser only.

```bash
# Build env (applies to Preview + Published)
VITE_BLUEPRINT_BACKEND=cloudflare            # local | cloudflare | supabase | instantdb | rest
VITE_BLUEPRINT_BACKEND_URL=https://blueprint-backend.you.workers.dev
VITE_BLUEPRINT_BACKEND_KEY=...               # Cloudflare write key
VITE_BLUEPRINT_SUPABASE_URL=...              # Supabase
VITE_BLUEPRINT_SUPABASE_KEY=...
VITE_INSTANTDB_APP_ID=...                    # InstantDB (also implies backend=instantdb)
```

Supabase and InstantDB SDKs load only when that backend is picked.

### REST record API (Cloudflare / Custom)

```
GET    /records/:kind          -> T[]
GET    /records/:kind/:id      -> T | 404
PUT    /records/:kind/:id      body: T
DELETE /records/:kind/:id
kind = settings | projects | artifacts | events
```

### Bring your own backend

Implement four calls (`RecordStore`) and wrap it:

```tsx
import BlueprintApp, { RecordStoreAdapter, type RecordStore } from './blueprint/dist-lib/blueprint.es.js';
const store: RecordStore = { list, get, put, remove };
<BlueprintApp adapter={new RecordStoreAdapter(store)} />
```

Or implement the full `StorageAdapter` interface directly.

---

## Quick Start & Installation

### Scenario A: Installing via AI (Lovable, Cursor, etc.)

Copy and paste this prompt to the AI:

```text
Hey AI, install the Blueprint Idea Room into my project: 
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"

Once the script finishes:
1. Import `<BlueprintApp />` from `./blueprint/dist-lib/blueprint.es.js` and mount it at the `/blueprint/*` route.
2. Import the CSS file: `import './blueprint/dist-lib/style.css'`
```

### Scenario B: Manual Fresh Install

Run this single command from the root of your project:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
```

This downloads Blueprint into a `blueprint` folder. The library bundle is pre-built at `dist-lib/`.

**Embedding:** Import `dist-lib/blueprint.es.js` and `dist-lib/style.css` into your host project. Do NOT run `npm install` inside the blueprint folder — the host provides React.

**Standalone:** Run `cd blueprint && npm install && npm run dev`.

### Scenario C: Updating an Existing Blueprint

1. **Backup:** Export your settings/data from the Blueprint Settings page.
2. **Delete Old:** `rm -rf blueprint`
3. **Re-Install:** Run the install script again.
4. **Done:** Your existing Vite and router config will work with the new files.

---

## Architecture Overview

### Component Structure
Tool-specific editors are wrapped in a generic `EditorPageWrapper` that centralizes:
- Loading states and error handling
- Tool headers with consistent navigation
- LLM payload integration for AI context sharing

### Data Management
- `useArtifact` → Single-item CRUD operations
- `useArtifactList` → Collection-level queries and filtering
- `useCalendarEvents` → Global calendar events (TanStack Query + optimistic updates)

### Storage Adapter Pattern
```ts
interface StorageAdapter {
  getSettings(): Promise<BlueprintSettings>;
  saveSettings(settings: BlueprintSettings): Promise<void>;
  getArtifact(id: string): Promise<Artifact | null>;
  saveArtifact(artifact: Artifact): Promise<void>;
  deleteArtifact(id: string): Promise<void>;
  listArtifacts(type?: ToolType): Promise<Artifact[]>;
  listFavorites(): Promise<Artifact[]>;
  listByTag(tag: string): Promise<Artifact[]>;
  listCalendarEvents(): Promise<CalendarEventRecord[]>;
  saveCalendarEvent(event: CalendarEventRecord): Promise<void>;
  deleteCalendarEvent(id: string): Promise<void>;
}
```

### Calendar as Cross-Tool Aggregator
The Calendar tool is architected to aggregate time-based data from the entire project:
- `sourceType: 'manual'` → User-created events
- `sourceType: 'task'` → Linked from Kanban due dates (future)
- `sourceType: 'doc'` → Linked from document mentions (future)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `W` | Whiteboard |
| `F` | Flow |
| `T` | Tasks |
| `D` | Docs |
| `C` | Calendar |
| `N` | New Item |
| `G` | Gallery View |
| `S` | Favorites |
| `\` | Toggle Dark Mode |

---

## Tech Stack

- **Build:** Vite + TypeScript (default + library configs)
- **UI:** React, Tailwind CSS, shadcn/ui
- **State:** TanStack Query (React Query)
- **Whiteboard:** tldraw
- **Diagrams:** @xyflow/react
- **Rich Text:** BlockNote
- **Kanban:** @hello-pangea/dnd
- **Calendar:** react-big-calendar
- **Database:** InstantDB (optional, recommended)
- **Routing:** react-router-dom

---

## Troubleshooting

### Data not persisting between sessions
You're on Browser only. Pick a cloud backend in Settings or set `VITE_BLUEPRINT_BACKEND`.

### Preview and Published domains have different data
Settings choices are saved per domain. Use build env vars to share one backend across all domains.

### Calendar events disappear on refresh
Check console for "Blueprint:" prefixed logs to debug sync issues.

---

## Genesis & Intent

This project was created to keep the creator's mind clear by externalizing ideas into a structured space that lives alongside the code. It is not part of the product itself. It is a companion: a private workspace for planning, reflection, and reference.

Blueprint does **not** integrate with the host app's business logic. It only needs to live next to it, store its own data, and remain portable with the repo.
