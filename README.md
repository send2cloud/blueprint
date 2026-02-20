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

## Quick Start & Installation

Because Blueprint is designed to live *inside* your existing project (without messy Git submodules), installation is handled via a single script that downloads the files into a `blueprint` folder.

### Scenario A: Installing via AI (Lovable, Cursor, etc.)
If you are using an AI coding assistant, simply copy and paste this prompt to the AI so it knows how to integrate Blueprint with your existing app:

```text
Hey AI, install the Blueprint Idea Room into my project: 
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"

Once the script finishes:
1. Import `<BlueprintApp />` from `./blueprint/dist/blueprint.es.js` and mount it at the `/blueprint/*` route.
2. Import the CSS file: `import './blueprint/dist/style.css'`
```

### Scenario B: Manual Fresh Install
If you want to install Blueprint yourself into a new or existing project, run this single command in your terminal from the root of your project:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
```
This script will automatically:
- Download the latest Blueprint template without any confusing Git history into a `blueprint` folder.

*(Note: It does **NOT** automatically run `npm install` inside the folder. If you are embedding Blueprint into a host app, you should install the dependencies in your HOST project's `package.json` to avoid duplicate React instances. Only run `npm install` inside the `blueprint` folder if running standalone!)*

*(Note: You will still need to manually mount the App via your router. See `INSTALL.md` for step-by-step guidance).*

### Scenario C: Updating an Existing Blueprint
Blueprint has a built-in update checker! If you are running an outdated version, you'll see a teal banner at the top of the **Settings** page letting you know a new version has been published to GitHub.

To update an existing project:
1. **Backup:** Export your settings/data from the Blueprint Settings page just in case!
2. **Delete Old:** Delete your project's local `blueprint` folder (`rm -rf blueprint`).
3. **Re-Install:** Run the install script again:
   ```bash
   bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
   ```
4. **Done:** Because you already configured Vite and your router previously, the new files will drop right into place and work immediately!

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
