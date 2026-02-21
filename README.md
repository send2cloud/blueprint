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

## Dual Build Architecture

Blueprint produces **two independent build outputs** so it can run as a standalone site *and* be embedded in other projects:

| Mode | Command | Output | Use Case |
|------|---------|--------|----------|
| **SPA** (default) | `npm run build` | `dist/` | Standalone app — Lovable publish, `npm run dev`, etc. |
| **Library** | `npm run build:lib` | `dist-lib/` | Embedding into another React project |

### SPA Mode (Multi-Project / Standalone)

The default `vite build` produces a standard `index.html` + JS/CSS bundle in `dist/`. This is what Lovable's publish pipeline uses. No special configuration needed.

### Library Mode (Embedded / Solo)

`npm run build:lib` uses a separate `vite.config.lib.ts` to produce:
- `dist-lib/blueprint.es.js` — ES module with React/ReactDOM externalized
- `dist-lib/style.css` — All styles bundled

The host project provides React and ReactDOM, preventing duplicate instances and `useRef` crashes.

```tsx
// Host project usage
import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
import './blueprint/dist-lib/style.css';

<Route path="/blueprint/*" element={<BlueprintApp basename="/blueprint" />} />
```

---

## Storage Configuration

Blueprint supports a **three-tier storage configuration model** to balance standalone deployment with project portability:

### Tier 1: Environment Variable (Recommended for Published Apps)
Set `VITE_INSTANTDB_APP_ID` in your build environment. This bakes the App ID into all builds, ensuring both Preview and Published domains use the same database automatically.

```bash
# .env or build environment
VITE_INSTANTDB_APP_ID=your-app-id-here
```

### Tier 2: UI Configuration (Settings Page)
If no environment variable is set, users can manually configure InstantDB via **Settings → Database Connection**. This is stored in localStorage and is domain-specific.

### Tier 3: Local Storage (Default)
When no InstantDB is configured, Blueprint falls back to browser-only localStorage. Data won't sync across devices or domains.

**Priority Order:** Environment Variable → localStorage Config → Local Storage fallback

---

## InstantDB Schema

Blueprint uses **isolated namespaces** to prevent collisions with your main app's data:

| Table | Purpose |
|-------|---------|
| `blueprint_artifacts` | All artifacts (notes, diagrams, canvases, boards) |
| `blueprint_calendar_events` | Calendar events (global, not per-artifact) |
| `blueprint_settings` | App settings (enabled tools, etc.) |

A single `blueprint_artifacts` table stores all artifact types, filtered by the `type` field. This simplifies cross-tool queries (favorites, tags, global gallery) and reduces adapter complexity.

### Persistence Architecture
The InstantDB adapter implements a **local outbox and optimistic caching system**:
- All writes are cached locally first for instant UI feedback
- Changes queue in an outbox for network resilience
- Failed transactions retry on next app load
- Calendar events use this pattern extensively for cross-session persistence

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

- **Build:** Vite + TypeScript (dual SPA + library config)
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
You're using localStorage, which is browser-specific. Set `VITE_INSTANTDB_APP_ID` for persistent cloud storage.

### Preview and Published domains have different data
This happens when using localStorage or UI-configured InstantDB (domain isolation). Set the App ID via environment variable to sync across all domains.

### Calendar events disappear on refresh
The outbox system should preserve events. Check console for "Blueprint:" prefixed logs to debug sync issues.

---

## Genesis & Intent

This project was created to keep the creator's mind clear by externalizing ideas into a structured space that lives alongside the code. It is not part of the product itself. It is a companion: a private workspace for planning, reflection, and reference.

Blueprint does **not** integrate with the host app's business logic. It only needs to live next to it, store its own data, and remain portable with the repo.
