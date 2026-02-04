
# Simplify Tools + Add Favorites System

## What You're Asking For

1. **Consolidate duplicate tools**: Flow and Mind Map both use React Flow. Draw and Whiteboard both use tldraw. Instead of separate tool types, let users create artifacts with one tool and optionally **favorite** them as a specific concept (like "Mind Map" or "Whiteboard").

2. **Tool-based approach**: 
   - Canvas Tool (tldraw) → Can create drawings, whiteboards, sketches, stickies
   - Diagram Tool (React Flow) → Can create flows, mind maps, system diagrams
   - Board Tool (Kanban) → Task tracking, roadmaps

3. **Favorites system**: Any artifact can be favorited. Favorites appear in the sidebar as a dedicated section, showing all favorited items across all tools.

---

## New Architecture

### Simplified Tools (3 instead of 5)

| Tool | Package | Creates |
|------|---------|---------|
| **Canvas** | tldraw | Drawings, whiteboards, sketches |
| **Diagram** | @xyflow/react | Flows, mind maps, system diagrams |
| **Board** | @hello-pangea/dnd | Kanban boards, task lists |

### Updated Type System

```typescript
// Simplified tool types
export type ToolType = 'canvas' | 'diagram' | 'board';

// Artifact now has optional favorite flag
export interface Artifact {
  id: string;
  type: ToolType;
  name: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;  // NEW: Can be favorited
}
```

### Routes

```text
/canvas           → Gallery of canvas artifacts
/canvas/new       → New canvas (tldraw)
/canvas/:id       → Edit specific canvas

/diagram          → Gallery of diagram artifacts  
/diagram/new      → New diagram (React Flow)
/diagram/:id      → Edit specific diagram

/board            → Gallery of boards
/board/new        → New board (Kanban)
/board/:id        → Edit specific board

/favorites        → All favorited artifacts across tools
```

---

## Implementation Steps

### Step 1: Update Storage Types

Update `src/lib/storage/types.ts`:
- Change `ToolType` from 5 types to 3: `'canvas' | 'diagram' | 'board'`
- Add `favorite: boolean` to `Artifact` interface
- Update `ALL_TOOLS` array

### Step 2: Update LocalStorage Adapter

Update `src/lib/storage/localStorage.ts`:
- Handle the new `favorite` field
- Add method to list all favorites: `listFavorites(): Promise<Artifact[]>`

### Step 3: Remove Duplicate Components

**Delete these (merged into unified components):**
- `src/components/tools/mindmap/` folder (merge into diagram)
- `src/components/tools/whiteboard/` folder (merge into canvas)
- `src/components/tools/draw/` folder (renamed to canvas)
- `src/pages/DrawPage.tsx`, `src/pages/DrawGallery.tsx`
- `src/pages/MindMapPage.tsx`, `src/pages/MindMapGallery.tsx`
- `src/pages/WhiteboardPage.tsx`, `src/pages/WhiteboardGallery.tsx`

### Step 4: Create Unified Tool Components

**Canvas Tool** (`src/components/tools/canvas/CanvasEditor.tsx`):
- Uses tldraw
- Replaces both DrawingCanvas and StickyWhiteboard
- Same component, one tool

**Diagram Tool** (`src/components/tools/diagram/DiagramEditor.tsx`):
- Uses React Flow
- Combines FlowEditor capabilities
- Can be used for flows OR mind maps (user names it accordingly)
- Keep the "Add Node" button for any diagram type

**Board Tool** (keep existing `kanban/KanbanBoard.tsx`):
- Rename folder from `kanban` to `board` for consistency

### Step 5: Create New Pages

**Canvas Pages:**
- `src/pages/CanvasGallery.tsx` - List all canvas artifacts
- `src/pages/CanvasPage.tsx` - Edit canvas

**Diagram Pages:**
- `src/pages/DiagramGallery.tsx` - List all diagram artifacts
- `src/pages/DiagramPage.tsx` - Edit diagram

**Board Pages:**
- `src/pages/BoardGallery.tsx` - List all board artifacts
- `src/pages/BoardPage.tsx` - Edit board

**Favorites Page:**
- `src/pages/FavoritesPage.tsx` - List all favorited artifacts

### Step 6: Update Artifact Card with Favorite Toggle

Update `src/components/gallery/ArtifactCard.tsx`:
- Add star/heart icon button to toggle favorite
- Show filled star if favorited
- On click, call storage to toggle favorite

### Step 7: Update Tool Header with Favorite Toggle

Update `src/components/layout/ToolHeader.tsx`:
- Add favorite toggle button next to share
- Star icon that toggles artifact.favorite

### Step 8: Update Sidebar

Update `src/components/layout/AppSidebar.tsx`:
- Show only 3 tools: Canvas, Diagram, Board
- Add "Favorites" section with star icon
- Show count of favorites next to the link

### Step 9: Update Dashboard (Index.tsx)

Update `src/pages/Index.tsx`:
- Show 3 tool cards instead of 5
- Update descriptions
- Add quick link to favorites if any exist

### Step 10: Update Settings Page

Update `src/pages/SettingsPage.tsx`:
- Update to only show 3 tools
- Update descriptions for new unified tools

### Step 11: Update Routing

Update `src/App.tsx`:
```typescript
<Routes>
  <Route element={<AppLayout />}>
    <Route path="/" element={<Index />} />
    
    {/* Canvas (drawings, whiteboards) */}
    <Route path="/canvas" element={<CanvasGallery />} />
    <Route path="/canvas/new" element={<CanvasPage />} />
    <Route path="/canvas/:id" element={<CanvasPage />} />
    
    {/* Diagram (flows, mind maps) */}
    <Route path="/diagram" element={<DiagramGallery />} />
    <Route path="/diagram/new" element={<DiagramPage />} />
    <Route path="/diagram/:id" element={<DiagramPage />} />
    
    {/* Board (kanban) */}
    <Route path="/board" element={<BoardGallery />} />
    <Route path="/board/new" element={<BoardPage />} />
    <Route path="/board/:id" element={<BoardPage />} />
    
    {/* Favorites */}
    <Route path="/favorites" element={<FavoritesPage />} />
    
    <Route path="/settings" element={<SettingsPage />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Step 12: Update useArtifact Hook

Update `src/hooks/useArtifact.ts`:
- Add `toggleFavorite()` function
- Update default names for new tool types

---

## Files Summary

| Action | File |
|--------|------|
| **Update** | `src/lib/storage/types.ts` |
| **Update** | `src/lib/storage/localStorage.ts` |
| **Delete** | `src/components/tools/draw/` |
| **Delete** | `src/components/tools/whiteboard/` |
| **Delete** | `src/components/tools/mindmap/` |
| **Create** | `src/components/tools/canvas/CanvasEditor.tsx` |
| **Rename** | `src/components/tools/kanban/` → `src/components/tools/board/` |
| **Update** | `src/components/tools/flow/FlowEditor.tsx` → `DiagramEditor.tsx` |
| **Delete** | `src/pages/DrawPage.tsx`, `DrawGallery.tsx` |
| **Delete** | `src/pages/WhiteboardPage.tsx`, `WhiteboardGallery.tsx` |
| **Delete** | `src/pages/MindMapPage.tsx`, `MindMapGallery.tsx` |
| **Create** | `src/pages/CanvasGallery.tsx`, `CanvasPage.tsx` |
| **Create** | `src/pages/DiagramGallery.tsx`, `DiagramPage.tsx` |
| **Create** | `src/pages/BoardGallery.tsx`, `BoardPage.tsx` |
| **Create** | `src/pages/FavoritesPage.tsx` |
| **Update** | `src/components/gallery/ArtifactCard.tsx` |
| **Update** | `src/components/layout/ToolHeader.tsx` |
| **Update** | `src/components/layout/AppSidebar.tsx` |
| **Update** | `src/pages/Index.tsx` |
| **Update** | `src/pages/SettingsPage.tsx` |
| **Update** | `src/App.tsx` |
| **Update** | `src/hooks/useArtifact.ts` |
| **Update** | `src/contexts/BlueprintContext.tsx` |

---

## User Experience After Changes

1. **Sidebar shows**: Home, Canvas, Diagram, Board, Favorites, Settings
2. **Click "Canvas"** → See gallery of all canvas artifacts (drawings, whiteboards, etc.)
3. **Create new canvas** → Name it "Authentication Whiteboard" or "Logo Sketch"
4. **Click the star** → Artifact is now favorited
5. **Click "Favorites"** → See all starred artifacts across all tools
6. **The artifact type is what YOU name it** - the tool is just the technology
