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

## Install Blueprint Into Another Project

Blueprint is designed to be embedded into any React/Vite project. See **[INSTALL.md](./INSTALL.md)** for detailed instructions.

### Quick Start

**Option 1: One-liner with degit**
```bash
npx degit YOUR_USERNAME/blueprint blueprint && cd blueprint && npm install
```

**Option 2: AI Assistant Prompt**
```
Install Blueprint from https://github.com/YOUR_USERNAME/blueprint into /blueprint folder.
Install deps: tldraw @xyflow/react @blocknote/react @blocknote/mantine @blocknote/core @hello-pangea/dnd react-big-calendar @instantdb/react
Add ProseMirror dedupe to vite.config.ts, mount at /blueprint/* route.
```

**Option 3: Copy Script**
```bash
node blueprint/scripts/copy-to-project.js /path/to/your/project
```

### Mount in Your App

```tsx
import { lazy, Suspense } from 'react';
const BlueprintApp = lazy(() => import('./blueprint/src/App'));

<Route path="/blueprint/*" element={
  <Suspense fallback={<div>Loading...</div>}>
    <BlueprintApp />
  </Suspense>
} />
```

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

- **Build:** Vite + TypeScript
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

### BlockNote crashes with "Duplicate use of selection JSON ID"
Add the ProseMirror dedupe config to your `vite.config.ts` (see Step 3).

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
