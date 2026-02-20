# Blueprint Installation Guide for LLMs

This guide helps AI assistants efficiently install Blueprint into a target project.

---

## Step 1: Fetch the Manifest

Read `blueprint-manifest.json` from this repo. It contains:
- All file paths organized by priority
- Dependencies to install
- Config snippets to add

---

## Step 2: Install Dependencies (One Command)

```bash
npm install tldraw @xyflow/react @blocknote/react @blocknote/mantine @blocknote/core @hello-pangea/dnd react-big-calendar @instantdb/react date-fns lucide-react uuid @types/uuid next-themes sonner vaul cmdk @tanstack/react-query react-router-dom zod @hookform/resolvers react-hook-form
```

Also ensure shadcn/ui is set up with these components: button, dialog, input, label, tabs, card, badge, dropdown-menu, popover, calendar, checkbox, textarea, select, scroll-area, separator, sheet, sidebar, toast, tooltip, toggle, command, context-menu, accordion, alert-dialog, avatar, collapsible, form, hover-card, menubar, navigation-menu, progress, radio-group, resizable, slider, switch, table, toggle-group.

---

## Step 3: Copy Files in Batches

### Batch 1: Core Infrastructure (fetch these first)
```
src/lib/storage/types.ts
src/lib/storage/schema.ts
src/lib/storage/adapter.ts
src/lib/storage/localStorage.ts
src/lib/storage/instantDb.ts
src/lib/storage/dbConfig.ts
src/lib/storage/index.ts
src/lib/toolConfig.ts
src/lib/utils.ts
src/lib/formatters.ts
src/lib/artifactUtils.ts
src/lib/artifactLinks.ts
src/contexts/BlueprintContext.tsx
```

### Batch 2: Hooks
```
src/hooks/useArtifact.ts
src/hooks/useArtifacts.ts
src/hooks/useArtifactList.ts
src/hooks/useArtifactTags.ts
src/hooks/useArtifactLinks.ts
src/hooks/useCalendarEvents.ts
src/hooks/useTaskEvents.ts
src/hooks/useKeyboardShortcuts.ts
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
```

### Batch 3: UI Components (copy entire src/components/ui/ folder)
All shadcn components - these are standard, may already exist in target.

### Batch 4: Layout & Shared Components
```
src/components/layout/AppLayout.tsx
src/components/layout/AppSidebar.tsx
src/components/layout/EditorPageWrapper.tsx
src/components/layout/ToolHeader.tsx
src/components/theme/ThemeProvider.tsx
src/components/theme/ThemeToggle.tsx
src/components/CommandPalette.tsx
src/components/NavLink.tsx
src/components/BacklinksPanel.tsx
src/components/sidebar/TagCloud.tsx
src/components/tags/TagInput.tsx
src/components/gallery/ArtifactCard.tsx
src/components/gallery/ArtifactGallery.tsx
src/components/gallery/ArtifactPreview.tsx
src/components/gallery/ShareButton.tsx
src/components/llm/HiddenLlmPayload.tsx
src/components/embeds/ArtifactThumbnail.tsx
src/components/embeds/useArtifactByName.ts
```

### Batch 5: Tool Editors
```
# Canvas (Whiteboard)
src/components/tools/canvas/CanvasEditor.tsx
src/components/tools/canvas/CanvasHelpDialog.tsx
src/components/tools/canvas/ArtifactEmbedShape.tsx
src/components/tools/canvas/ArtifactEmbedTool.tsx
src/components/tools/canvas/ArtifactPickerDialog.tsx

# Diagram (Flow)
src/components/tools/diagram/DiagramEditor.tsx
src/components/tools/diagram/DiagramHelpDialog.tsx

# Board (Tasks)
src/components/tools/board/BoardEditor.tsx
src/components/tools/board/BoardHelpDialog.tsx
src/components/tools/board/types.ts
src/components/tools/board/KanbanColumn.tsx
src/components/tools/board/KanbanCard.tsx
src/components/tools/board/CardDetailModal.tsx
src/components/tools/board/CardDescription.tsx
src/components/tools/board/CardLabels.tsx
src/components/tools/board/CardTodoList.tsx
src/components/tools/board/CardComments.tsx
src/components/tools/board/CardDueDate.tsx

# Notes (Docs)
src/components/tools/notes/NotesEditor.tsx

# Calendar
src/components/tools/calendar/CalendarEditor.tsx
src/components/tools/calendar/CalendarToolbar.tsx
src/components/tools/calendar/CalendarSettings.tsx
src/components/tools/calendar/EventModal.tsx
src/components/tools/calendar/YearlyView.tsx
src/components/tools/calendar/types.ts
src/components/tools/calendar/useCalendarConfig.ts
src/components/tools/calendar/useCalendarNavigation.ts
```

### Batch 6: Pages
```
src/pages/Index.tsx
src/pages/CanvasPage.tsx
src/pages/CanvasGallery.tsx
src/pages/DiagramPage.tsx
src/pages/DiagramGallery.tsx
src/pages/BoardPage.tsx
src/pages/BoardGallery.tsx
src/pages/NotesPage.tsx
src/pages/NotesGallery.tsx
src/pages/CalendarPage.tsx
src/pages/FavoritesPage.tsx
src/pages/TagPage.tsx
src/pages/RelationshipsPage.tsx
src/pages/SettingsPage.tsx
src/pages/HelpPage.tsx
src/pages/NotFound.tsx
```

### Batch 7: Entry Points & Config
```
src/App.tsx
src/App.css
src/main.tsx
src/index.css
src/vite-env.d.ts
index.html
vite.config.ts
tailwind.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
postcss.config.js
components.json
```

---

## Step 4: Add Vite Dedupe Config

Add to target's `vite.config.ts`:

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

---

## Step 5: Mount Routes

If embedding into an existing app:

```tsx
import { lazy, Suspense } from 'react';
const BlueprintApp = lazy(() => import('./blueprint/src/App'));

<Route path="/blueprint/*" element={
  <Suspense fallback={<div>Loading Blueprint...</div>}>
    <BlueprintApp />
  </Suspense>
} />
```

---

## LLM Optimization Tips

1. **Fetch files in parallel** - Use batch file reads, not sequential
2. **Skip UI components** - If target already has shadcn/ui, skip src/components/ui/
3. **Check for conflicts** - Don't overwrite existing tailwind.config.ts, merge instead
4. **Dependencies first** - Install npm packages before copying files to avoid import errors
5. **Prioritize core** - If interrupted, ensure Batch 1-2 complete first (app won't work without them)
6. **Cloud IDEs** - In cloud IDEs like Lovable/Cursor/Codespaces, preview URLs dynamically replace localhost ports. Ensure you're verifying URLs using the native preview window.
