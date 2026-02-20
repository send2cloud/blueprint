# Installing Blueprint

Blueprint can be installed into any React/Vite project using one of these methods:

---

## Method 1: Quick Install (Recommended)

If you're using an AI assistant (like Lovable or Cursor), give it this prompt:

```text
Install Blueprint using: 
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"

Then follow instructions to:
2. Install these dependencies: tldraw @xyflow/react @blocknote/react @blocknote/mantine @blocknote/core @hello-pangea/dnd react-big-calendar @instantdb/react date-fns lucide-react uuid @types/uuid next-themes sonner vaul cmdk @tanstack/react-query
3. Add ProseMirror dedupe to vite.config.ts
4. Mount <BlueprintApp /> at /blueprint/* route
```

---

## Method 2: Using the Install Script (One Command)

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
```

This automates the entire process of cloning Blueprint without git history into a `blueprint` folder and installing dependencies.

---

## Method 3: Using degit (Manual)

```bash
npx degit send2cloud/blueprint blueprint
cd blueprint && npm install
npm run dev
```

This clones Blueprint without git history into a `blueprint` folder.

---

## Method 4: Git Clone

```bash
git clone https://github.com/send2cloud/blueprint.git blueprint
cd blueprint
rm -rf .git  # Remove Blueprint's git history
npm install
npm run dev
```

---

## Method 5: Copy Script (From Blueprint Repo)

If you already have Blueprint cloned locally:

```bash
node blueprint/scripts/copy-to-project.js /path/to/your/project
```

---

## Post-Install Setup

### 1. Install Dependencies

In your host project root:

```bash
npm install tldraw @xyflow/react @blocknote/react @blocknote/mantine @blocknote/core @hello-pangea/dnd react-big-calendar @instantdb/react date-fns lucide-react uuid @types/uuid next-themes sonner vaul cmdk @tanstack/react-query react-router-dom
```

### 2. Configure Vite

Add ProseMirror deduplication to prevent BlockNote crashes:

```ts
// vite.config.ts
export default defineConfig({
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
  },
});
```

### 3. Mount Blueprint Routes

```tsx
// In your main App.tsx or router
import { lazy, Suspense } from 'react';

const BlueprintApp = lazy(() => import('./blueprint/src/App'));

function App() {
  return (
    <Routes>
      {/* Your existing routes */}
      <Route path="/blueprint/*" element={
        <Suspense fallback={<div>Loading Blueprint...</div>}>
          <BlueprintApp />
        </Suspense>
      } />
    </Routes>
  );
}
```

### 4. Configure Storage (Optional)

For cloud persistence, set the InstantDB App ID:

```bash
# .env
VITE_INSTANTDB_APP_ID=your-app-id-here
```

Or configure via Blueprint's Settings page after launching.

---

## Running Standalone

Blueprint can also run independently:

```bash
cd blueprint
npm run dev
# Opens at your local dev server URL (e.g. http://localhost:5173) or Cloud Preview IDE
```

---

## Troubleshooting

### BlockNote crashes with "Duplicate use of selection JSON ID"
Add the ProseMirror dedupe config to vite.config.ts (see Step 2).

### Module not found errors
Ensure all dependencies are installed in your host project's node_modules.

### Styles not loading
Import Blueprint's CSS in your main entry point:
```ts
import './blueprint/src/index.css';
```
