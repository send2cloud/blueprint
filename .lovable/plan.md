

# Artifact Gallery System - Implementation Plan

## Overview

Transform the current tool pages into a **gallery-first workflow**:
1. Each tool page shows a gallery of saved artifacts
2. "New" button creates a fresh artifact and opens the editor
3. Click on an artifact card to open and edit it
4. Each artifact has a share/copy-link option
5. Auto-save as you work

---

## Current State

- Storage adapter system exists with full CRUD for artifacts (`saveArtifact`, `getArtifact`, `listArtifacts`, `deleteArtifact`)
- Tools currently have in-memory state only - no persistence
- No URL-based artifact routing (e.g., `/draw/:id`)
- No gallery views

---

## New Architecture

```text
Routes:
  /draw                   -> DrawGallery (list of drawings + "New" button)
  /draw/:id               -> DrawEditor (edit specific drawing)
  /draw/new               -> DrawEditor (new drawing, generates ID on save)
  
  /flow                   -> FlowGallery
  /flow/:id               -> FlowEditor
  /flow/new               -> FlowEditor (new)
  
  (same pattern for mindmap, kanban, whiteboard)

Components:
  src/components/gallery/
    ArtifactGallery.tsx     # Reusable gallery grid
    ArtifactCard.tsx        # Card with preview, name, actions
    NewArtifactButton.tsx   # "New" button component
    ShareButton.tsx         # Copy deep link to clipboard
```

---

## Implementation Steps

### Step 1: Create Gallery Components

**ArtifactCard.tsx**
- Displays artifact name, type icon, last updated timestamp
- Click to navigate to `/[tool]/:id`
- Hover shows action buttons (share, delete)
- Share button copies URL to clipboard with toast notification

**ArtifactGallery.tsx**
- Grid layout of ArtifactCard components
- "New" button at the top
- Empty state with prompt to create first artifact
- Sorted by last updated (most recent first)

**ShareButton.tsx**
- Copies current artifact URL to clipboard
- Shows toast: "Link copied! Share this to show your [drawing/flow/etc.]"

### Step 2: Create Shared Editor Wrapper Hook

**useArtifact.ts** - Custom hook for artifact management:
```typescript
function useArtifact(type: ToolType, id?: string) {
  // Load artifact by ID (or create new if id === 'new')
  // Provide save function that updates storage
  // Provide rename function
  // Auto-generate ID for new artifacts on first save
  // Return loading, error, artifact, save, rename
}
```

### Step 3: Update Draw Tool

**DrawGallery.tsx** (new page component):
- List all `type: 'draw'` artifacts from storage
- "New Drawing" button navigates to `/draw/new`
- Click artifact card navigates to `/draw/:id`

**DrawEditor.tsx** (updated):
- Receives artifact ID from URL params
- Uses `useArtifact('draw', id)` to load/save
- Integrates tldraw's persistence API:
  - `store.listen()` for changes
  - Save to storage adapter on change (debounced)
  - Load snapshot on mount
- Header shows artifact name (editable) + Share button

**Routing**:
- `/draw` -> DrawGallery
- `/draw/:id` -> DrawEditor
- `/draw/new` -> DrawEditor (creates new)

### Step 4: Update Flow Tool

**FlowGallery.tsx**:
- Same pattern as DrawGallery
- Shows flow diagram artifacts

**FlowEditor.tsx** (updated):
- Load nodes/edges from artifact.data
- Save nodes/edges to artifact.data on change
- Editable name in header
- Share button

### Step 5: Update Mind Map Tool

**MindMapGallery.tsx**:
- Gallery of mind maps

**MindMapEditor.tsx** (updated):
- Load/save nodes and edges
- Same pattern as Flow

### Step 6: Update Kanban Tool

**KanbanGallery.tsx**:
- Gallery of kanban boards

**KanbanEditor.tsx** (updated):
- Load/save columns and cards
- Same pattern

### Step 7: Update Whiteboard Tool

**WhiteboardGallery.tsx**:
- Gallery of whiteboards

**WhiteboardEditor.tsx** (updated):
- Same tldraw persistence as Draw
- Different default tool/zoom settings

### Step 8: Update Routing in App.tsx

```typescript
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<Index />} />
    
    {/* Draw */}
    <Route path="/draw" element={<DrawGallery />} />
    <Route path="/draw/new" element={<DrawEditor />} />
    <Route path="/draw/:id" element={<DrawEditor />} />
    
    {/* Flow */}
    <Route path="/flow" element={<FlowGallery />} />
    <Route path="/flow/new" element={<FlowEditor />} />
    <Route path="/flow/:id" element={<FlowEditor />} />
    
    {/* Mind Map */}
    <Route path="/mindmap" element={<MindMapGallery />} />
    <Route path="/mindmap/new" element={<MindMapEditor />} />
    <Route path="/mindmap/:id" element={<MindMapEditor />} />
    
    {/* Kanban */}
    <Route path="/kanban" element={<KanbanGallery />} />
    <Route path="/kanban/new" element={<KanbanEditor />} />
    <Route path="/kanban/:id" element={<KanbanEditor />} />
    
    {/* Whiteboard */}
    <Route path="/whiteboard" element={<WhiteboardGallery />} />
    <Route path="/whiteboard/new" element={<WhiteboardEditor />} />
    <Route path="/whiteboard/:id" element={<WhiteboardEditor />} />
    
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Step 9: Update Sidebar Navigation

Sidebar links go to gallery pages (`/draw`, `/flow`, etc.), not directly to editors.

---

## Deep Linking / Share Feature

When you click "Share" on an artifact:
1. Build URL: `{origin}/draw/{artifactId}` (or flow, mindmap, etc.)
2. Copy to clipboard
3. Show toast: "Link copied!"

When someone opens that URL:
1. Router matches `/draw/:id`
2. DrawEditor loads artifact by ID from storage
3. They see your exact drawing/flow/etc.

For now this works within the same browser (localStorage). Future: backend sync.

---

## Files to Create/Update

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useArtifact.ts` | Create | Artifact load/save logic |
| `src/components/gallery/ArtifactGallery.tsx` | Create | Reusable gallery grid |
| `src/components/gallery/ArtifactCard.tsx` | Create | Individual artifact card |
| `src/components/gallery/ShareButton.tsx` | Create | Copy link button |
| `src/pages/DrawGallery.tsx` | Create | Draw gallery page |
| `src/pages/FlowGallery.tsx` | Create | Flow gallery page |
| `src/pages/MindMapGallery.tsx` | Create | Mind map gallery page |
| `src/pages/KanbanGallery.tsx` | Create | Kanban gallery page |
| `src/pages/WhiteboardGallery.tsx` | Create | Whiteboard gallery page |
| `src/components/tools/draw/DrawingCanvas.tsx` | Update | Add persistence |
| `src/components/tools/flow/FlowEditor.tsx` | Update | Add persistence |
| `src/components/tools/mindmap/MindMapEditor.tsx` | Update | Add persistence |
| `src/components/tools/kanban/KanbanBoard.tsx` | Update | Add persistence |
| `src/components/tools/whiteboard/StickyWhiteboard.tsx` | Update | Add persistence |
| `src/pages/DrawPage.tsx` | Update | Handle :id param |
| `src/pages/FlowPage.tsx` | Update | Handle :id param |
| `src/pages/MindMapPage.tsx` | Update | Handle :id param |
| `src/pages/KanbanPage.tsx` | Update | Handle :id param |
| `src/pages/WhiteboardPage.tsx` | Update | Handle :id param |
| `src/components/layout/ToolHeader.tsx` | Update | Add editable name + share |
| `src/App.tsx` | Update | Add gallery routes |
| `src/components/layout/AppSidebar.tsx` | Update | Link to galleries |

---

## User Flow Example

1. Navigate to `/draw` (via sidebar)
2. See gallery: empty state with "Create your first drawing" message
3. Click "New Drawing" button
4. Redirected to `/draw/new`, tldraw editor opens
5. Start drawing - auto-saves to localStorage
6. Artifact gets ID, URL updates to `/draw/abc123`
7. Click "Share" - copies `https://your-app.com/draw/abc123`
8. Paste link anywhere to share
9. Click sidebar "Draw" again - see your drawing in the gallery
10. Click the card - opens `/draw/abc123` to continue editing

---

## Technical Details

### tldraw Persistence

tldraw provides a `store` that can be serialized:
```typescript
const store = editor.store;
const snapshot = store.getSnapshot();
// Save snapshot to artifact.data

// To restore:
store.loadSnapshot(artifact.data);
```

### React Flow Persistence

React Flow state is already in `nodes` and `edges` arrays - save directly:
```typescript
// Save
artifact.data = { nodes, edges };

// Restore
const { nodes, edges } = artifact.data;
```

### Auto-Save Strategy

- Debounce saves (e.g., 1 second after last change)
- Show "Saving..." indicator briefly
- Show "Saved" when complete
- This prevents excessive localStorage writes

