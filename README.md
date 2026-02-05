# Blueprint — Creative Idea Room

Blueprint is a personal, project‑local toolbox for capturing the spark behind a project and everything that follows: notes, sketches, flows, tasks, and artifacts. It is meant to travel with each repo as a detachable "idea room" you can return to months later and immediately understand why the project exists and where it stands.

## Features

| Tool | Description | Library |
|------|-------------|---------|
| **Whiteboard** | Freeform sketches & visual notes | tldraw |
| **Flow** | Diagrams, mind maps, system flows | @xyflow/react |
| **Tasks** | Kanban boards with Trello-style cards | @hello-pangea/dnd |
| **Docs** | Rich text documents & notes | BlockNote |
| **Calendar** | Unified scheduling view | react-big-calendar |

Plus: Tags, Favorites, deep-linking, and a gallery view for each artifact type.

---

## Install Blueprint Into Another Project

Blueprint is designed to be embedded into any React/Vite project as a companion workspace. Use your preferred AI coding assistant to copy the files.

### Step 1: Copy the Files

Give your AI assistant this prompt:

```
Go to https://github.com/send2cloud/blueprint and copy the entire codebase 
into a folder called `/blueprint` in my project. 

Specifically:
1. Copy all files from the `src/` directory into `/blueprint/src/`
2. Copy `index.html` to `/blueprint/index.html`
3. Copy `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` to `/blueprint/`
4. Copy the `public/` folder to `/blueprint/public/`

Do not merge with my existing app. Keep Blueprint as a standalone folder.
```

### Step 2: Install Dependencies

Ask your AI assistant to add these dependencies to your project:

```
Add these dependencies to my project:
- tldraw
- @xyflow/react
- @blocknote/react @blocknote/mantine @blocknote/core
- @hello-pangea/dnd
- react-big-calendar
- @instantdb/react
- date-fns
- lucide-react
- uuid
- react-router-dom
- @tanstack/react-query
- next-themes
- sonner
- vaul
- cmdk
```

Also add the shadcn/ui components if not already present.

### Step 3: Configure Vite (Important!)

BlockNote uses ProseMirror internally. To prevent duplicate module crashes, add this to your `vite.config.ts`:

```ts
resolve: {
  dedupe: [
    "@tiptap/pm",
    "prosemirror-state",
    "prosemirror-view",
    "prosemirror-model",
    "prosemirror-transform",
    "prosemirror-commands",
    "prosemirror-history",
    "prosemirror-keymap",
    "prosemirror-inputrules",
    "prosemirror-schema-list",
    "prosemirror-gapcursor",
    "prosemirror-dropcursor",
  ],
}
```

### Step 4: Mount Blueprint Routes

There are two ways to access Blueprint:

**Option A: Run as standalone app**

Navigate to the `/blueprint` folder and run:
```bash
npm install && npm run dev
```

Blueprint will be available at `http://localhost:8080`.

**Option B: Embed into your app's routes**

Add Blueprint routes to your main app's router:

```tsx
// In your app's main router
import { lazy } from 'react';

const BlueprintApp = lazy(() => import('./blueprint/src/App'));

// Add a catch-all route
<Route path="/blueprint/*" element={<BlueprintApp />} />
```

Note: You may need to adjust Blueprint's internal routing to use a base path.

---

## Storage Configuration

Blueprint stores artifacts in one of two modes:

### Local Storage (default)
- Zero config, works immediately
- Data stays in the browser only
- ⚠️ Data won't sync across devices or environments

### InstantDB (recommended)
- Data persists in the cloud
- Travels with the project
- Uses dedicated namespaces (`blueprint_artifacts`, `blueprint_settings`) to stay separate from your app's data

**To connect InstantDB:**
1. Open Blueprint
2. Go to **Settings → Database Connection**
3. Select **InstantDB**
4. Paste your project's **Instant App ID**
5. Click **Save**

When connected, the "Using local storage" banner disappears.

---

## File Structure Reference

```
blueprint/
├── src/
│   ├── components/
│   │   ├── tools/           # Editor components for each tool
│   │   │   ├── board/       # Kanban board
│   │   │   ├── calendar/    # Calendar view
│   │   │   ├── canvas/      # Whiteboard (tldraw)
│   │   │   ├── diagram/     # Flow diagrams (React Flow)
│   │   │   └── notes/       # Rich text (BlockNote)
│   │   ├── gallery/         # Artifact gallery & cards
│   │   ├── layout/          # App shell, sidebar
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   ├── storage/         # Storage adapters (localStorage, InstantDB)
│   │   └── toolConfig.ts    # Tool definitions & metadata
│   ├── pages/               # Route pages
│   ├── hooks/               # React hooks for artifacts
│   └── contexts/            # Blueprint context provider
├── public/
├── index.html
└── vite.config.ts
```

---

## Customization

### Enable/Disable Tools

Go to **Settings → Enabled Tools** to toggle which tools appear in the sidebar.

### Add Custom Storage Adapter

Blueprint uses a `StorageAdapter` interface. To connect to your own database:

1. Create a new adapter in `src/lib/storage/` implementing `StorageAdapter`
2. Register it in `src/lib/storage/adapter.ts`
3. Add UI in Settings to select your adapter

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
}
```

---

## Tech Stack

- **Build:** Vite + TypeScript
- **UI:** React, Tailwind CSS, shadcn/ui
- **Whiteboard:** tldraw
- **Diagrams:** @xyflow/react
- **Rich Text:** BlockNote
- **Kanban:** @hello-pangea/dnd
- **Calendar:** react-big-calendar
- **Database:** InstantDB (optional)
- **Routing:** react-router-dom

---

## Troubleshooting

### BlockNote crashes with "Duplicate use of selection JSON ID"
Add the ProseMirror dedupe config to your `vite.config.ts` (see Step 3).

### Data not persisting between sessions
You're using localStorage, which is browser-specific. Connect to InstantDB for persistent storage.

### Styles conflicting with host app
Blueprint uses CSS custom properties. If conflicts occur, scope Blueprint's styles by wrapping in a container with its own CSS reset.

---

## Genesis & Intent

This project was created to keep the creator's mind clear by externalizing ideas into a structured space that lives alongside the code. It is not part of the product itself. It is a companion: a private workspace for planning, reflection, and reference.

Blueprint does **not** integrate with the host app's business logic. It only needs to live next to it, store its own data, and remain portable with the repo.
