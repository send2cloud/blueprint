

# Blueprint Creator Suite - Complete Implementation Plan

## Overview

We're building a **portable Idea Room** - an embeddable creative suite with five tools (Draw, Flow, Mind Map, Kanban, Whiteboard), a Settings page for toggling tool visibility, and an **adapter-based storage system** that defaults to localStorage but can be swapped for any host project's database.

---

## Architecture Summary

```text
src/
  lib/
    storage/
      types.ts              # StorageAdapter interface + types
      adapter.ts            # Adapter registry + current adapter
      localStorage.ts       # Default localStorage implementation
      index.ts              # Public exports
  contexts/
    BlueprintContext.tsx    # Global state: enabled tools, storage adapter
  components/
    layout/
      AppLayout.tsx         # Main layout wrapper
      AppSidebar.tsx        # Tool navigation (filtered by settings)
      ToolHeader.tsx        # Consistent header for each tool
    tools/
      draw/DrawingCanvas.tsx
      flow/FlowEditor.tsx
      mindmap/MindMapEditor.tsx + MindMapNode.tsx
      kanban/KanbanBoard.tsx + KanbanColumn.tsx + KanbanCard.tsx
      whiteboard/StickyWhiteboard.tsx
  pages/
    Index.tsx               # Dashboard
    DrawPage.tsx
    FlowPage.tsx
    MindMapPage.tsx
    KanbanPage.tsx
    WhiteboardPage.tsx
    SettingsPage.tsx        # Toggle tools on/off
```

---

## Step 1: Install Dependencies

Add to `package.json`:
- `tldraw` - Drawing canvas and whiteboard
- `@xyflow/react` - Flow diagrams and mind maps
- `@hello-pangea/dnd` - Kanban drag-and-drop
- `uuid` - Generate artifact IDs

---

## Step 2: Create Storage Adapter System

This is the key to making the suite embeddable. We define an interface that any storage backend can implement.

### Storage Types (`src/lib/storage/types.ts`)

```typescript
export type ToolType = 'draw' | 'flow' | 'mindmap' | 'kanban' | 'whiteboard';

export interface BlueprintSettings {
  enabledTools: ToolType[];
}

export interface Artifact {
  id: string;
  type: ToolType;
  name: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface StorageAdapter {
  // Settings
  getSettings(): Promise<BlueprintSettings>;
  saveSettings(settings: BlueprintSettings): Promise<void>;
  
  // Artifacts (flows, drawings, etc.)
  getArtifact(id: string): Promise<Artifact | null>;
  saveArtifact(artifact: Artifact): Promise<void>;
  deleteArtifact(id: string): Promise<void>;
  listArtifacts(type?: ToolType): Promise<Artifact[]>;
}
```

### LocalStorage Implementation (`src/lib/storage/localStorage.ts`)

Default implementation using localStorage:
- Settings stored under `blueprint:settings`
- Artifacts stored under `blueprint:artifact:{id}`
- Full implementation of all StorageAdapter methods

### Adapter Registry (`src/lib/storage/adapter.ts`)

```typescript
let currentAdapter: StorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(adapter: StorageAdapter) {
  currentAdapter = adapter;
}

export function getStorageAdapter(): StorageAdapter {
  return currentAdapter;
}
```

This allows host projects to call `setStorageAdapter(mySupabaseAdapter)` to plug in their own persistence.

---

## Step 3: Create Blueprint Context

A React context that provides:
- Current enabled tools (from settings)
- Methods to toggle tools
- Access to storage adapter

```typescript
interface BlueprintContextValue {
  enabledTools: ToolType[];
  toggleTool: (tool: ToolType) => void;
  isToolEnabled: (tool: ToolType) => boolean;
  storage: StorageAdapter;
  loading: boolean;
}
```

The context loads settings on mount and saves when tools are toggled.

---

## Step 4: Create Layout Components

### AppLayout.tsx
- Uses shadcn SidebarProvider
- Renders AppSidebar + main content area
- Wraps children in BlueprintProvider

### AppSidebar.tsx
- Navigation links for each enabled tool
- Uses `isToolEnabled()` from context to filter
- Icons: Pencil (Draw), GitBranch (Flow), Brain (Mind Map), Columns (Kanban), StickyNote (Whiteboard), Settings (Settings)
- Active route highlighting
- Collapsible with toggle button

### ToolHeader.tsx
- Reusable header for each tool page
- Shows icon + tool name
- Placeholder "Share" button (for future deep linking)

---

## Step 5: Create Dashboard (Index.tsx)

Transform into an "Idea Room" hub:
- Welcome message: "Your Project's Creative Memory"
- Grid of tool cards (only enabled tools shown)
- Each card: icon, name, description, click to navigate
- Quick access to Settings

---

## Step 6: Create Settings Page

Settings UI with:
- List of all tools with Switch toggles
- Toggle on/off updates context and persists via adapter
- Visual feedback when a tool is disabled
- Explanation that disabled tools are hidden from sidebar

---

## Step 7: Create Draw Page (tldraw)

- Import `tldraw/tldraw.css`
- Mount `<Tldraw />` component
- Full drawing capabilities
- Future: load/save via storage adapter

---

## Step 8: Create Flow Page (React Flow)

- Import `@xyflow/react/dist/style.css`
- ReactFlow canvas with:
  - Default, Input, Output node types
  - Add node button
  - Connect nodes by dragging
  - Delete with backspace
  - Controls (zoom, fit)
  - MiniMap
- In-memory state for now

---

## Step 9: Create Mind Map Page (React Flow)

Uses React Flow with custom styling for mind maps:

### MindMapNode.tsx
- Rounded, thought-bubble style
- Different background color (subtle blue/purple tint)
- Edit-in-place for text
- "+" button to add child node

### MindMapEditor.tsx
- Curved bezier edges
- Starts with a central "Main Idea" node
- Add children from any node
- Auto-layout option (future)

---

## Step 10: Create Kanban Page

### KanbanBoard.tsx
- Three columns: Ideas, In Progress, Done
- DragDropContext from @hello-pangea/dnd

### KanbanColumn.tsx
- Droppable area
- Column header with count
- "Add card" button

### KanbanCard.tsx
- Draggable card
- Title + optional description
- Delete button on hover

---

## Step 11: Create Whiteboard Page (tldraw)

- Same tldraw component as Draw
- Different initial state: zoom level, default tool = sticky note
- Different page title/context

---

## Step 12: Wire Up Routing

Update `App.tsx`:

```typescript
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<Index />} />
    <Route path="/draw" element={<DrawPage />} />
    <Route path="/flow" element={<FlowPage />} />
    <Route path="/mindmap" element={<MindMapPage />} />
    <Route path="/kanban" element={<KanbanPage />} />
    <Route path="/whiteboard" element={<WhiteboardPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## How Host Projects Will Use This

When this suite is embedded in another project:

```typescript
// In the host project's setup
import { setStorageAdapter } from '@/blueprint/lib/storage';
import { createSupabaseAdapter } from './mySupabaseAdapter';

// Plug in the host's database
setStorageAdapter(createSupabaseAdapter(supabaseClient));
```

Then all settings and artifacts automatically persist to the host's database instead of localStorage.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/lib/storage/types.ts` | TypeScript interfaces for storage |
| `src/lib/storage/localStorage.ts` | Default localStorage adapter |
| `src/lib/storage/adapter.ts` | Adapter registry |
| `src/lib/storage/index.ts` | Public exports |
| `src/contexts/BlueprintContext.tsx` | Global state provider |
| `src/components/layout/AppLayout.tsx` | Layout wrapper |
| `src/components/layout/AppSidebar.tsx` | Navigation sidebar |
| `src/components/layout/ToolHeader.tsx` | Tool page header |
| `src/components/tools/draw/DrawingCanvas.tsx` | tldraw wrapper |
| `src/components/tools/flow/FlowEditor.tsx` | React Flow wrapper |
| `src/components/tools/mindmap/MindMapEditor.tsx` | Mind map canvas |
| `src/components/tools/mindmap/MindMapNode.tsx` | Custom node |
| `src/components/tools/kanban/KanbanBoard.tsx` | Board container |
| `src/components/tools/kanban/KanbanColumn.tsx` | Column component |
| `src/components/tools/kanban/KanbanCard.tsx` | Card component |
| `src/components/tools/whiteboard/StickyWhiteboard.tsx` | Sticky canvas |
| `src/pages/Index.tsx` | Dashboard (update) |
| `src/pages/DrawPage.tsx` | Draw tool page |
| `src/pages/FlowPage.tsx` | Flow tool page |
| `src/pages/MindMapPage.tsx` | Mind map page |
| `src/pages/KanbanPage.tsx` | Kanban page |
| `src/pages/WhiteboardPage.tsx` | Whiteboard page |
| `src/pages/SettingsPage.tsx` | Settings page |
| `src/App.tsx` | Routing (update) |

---

## Visual Cohesion

All tools will share:
- Same neutral color palette from `index.css`
- Consistent ToolHeader component
- Inter/JetBrains Mono typography
- Sidebar always present for navigation
- Same hover/focus states
- Unified card styling for dashboard

