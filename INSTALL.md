# Installing Blueprint

Blueprint can be installed into any React/Vite project using one of these methods:

---

## Method 1: Quick Install (Recommended)

If you're using an AI assistant (like Lovable or Cursor), give it this prompt:

```text
Hey AI, install the Blueprint Idea Room into my project: 
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"

Once the script finishes:
1. Find the ProseMirror dedupe config array listed in `blueprint/INSTALL.md` and inject it into my `vite.config.ts`
2. Import `<BlueprintApp />` from `./blueprint/src/App` and mount it at the `/blueprint/*` route.
```

---

## Method 2: Using the Install Script (One Command)

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
```

This automates the process of cloning Blueprint without git history into a `blueprint` folder.

> **⚠️ IMPORTANT:** The script does NOT run `npm install` automatically. If embedding into a host app, install dependencies in your HOST project's `package.json` to prevent fatal React `useRef` duplicate instance errors. 
> 
> *Only* run `npm install` inside the `blueprint` folder if you are running it as a standalone web app!

---

## Method 3: Using degit (Manual)

```bash
npx degit send2cloud/blueprint blueprint

# ONLY run these if using Standalone (NOT embedding)
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

# ONLY run these if using Standalone (NOT embedding)
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

### 1. Mount Blueprint Routes

```tsx
// In your main App.tsx or router
import { lazy, Suspense } from 'react';

const BlueprintApp = lazy(() => import('./blueprint/dist/blueprint.es.js'));
import './blueprint/dist/style.css'; // Don't forget the styles!

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

### 2. Configure Storage (Optional)

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
npm install
npm run dev
# Opens at your local dev server URL (e.g. http://localhost:5173) or Cloud Preview IDE
```
