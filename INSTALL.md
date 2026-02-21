# Installing Blueprint

Blueprint can be installed into any React/Vite project using one of these methods:

---

## Method 1: Quick Install (Recommended)

If you're using an AI assistant (like Lovable or Cursor), give it this prompt:

```text
Hey AI, install the Blueprint Idea Room into my project: 
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"

Once the script finishes:
1. Import `<BlueprintApp />` from `./blueprint/dist-lib/blueprint.es.js` and mount it at the `/blueprint/*` route.
2. Import the CSS file: `import './blueprint/dist-lib/style.css'`
```

---

## Method 2: Using the Install Script (One Command)

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/send2cloud/blueprint/main/scripts/install.sh)"
```

This downloads Blueprint without git history into a `blueprint` folder.

> **⚠️ IMPORTANT:** For Solo mode (embedding), do NOT run `npm install` inside the `blueprint` folder. The pre-built bundle at `dist-lib/` is ready to use — the host project provides React. Only run `npm install` if running in Multi-Project mode (standalone).

---

## Method 3: Using degit (Manual)

```bash
npx degit send2cloud/blueprint blueprint

# ONLY for Multi-Project mode (standalone, NOT embedding)
cd blueprint && npm install
npm run dev
```

---

## Method 4: Git Clone

```bash
git clone https://github.com/send2cloud/blueprint.git blueprint
cd blueprint
rm -rf .git  # Remove Blueprint's git history

# ONLY for Multi-Project mode (standalone, NOT embedding)
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

## Post-Install Setup (Solo Mode — Embedding)

### 1. Mount Blueprint Routes

```tsx
// In your main App.tsx or router
import BlueprintApp from './blueprint/dist-lib/blueprint.es.js';
import './blueprint/dist-lib/style.css';

function App() {
  return (
    <Routes>
      {/* Your existing routes */}
      <Route path="/blueprint/*" element={<BlueprintApp basename="/blueprint" />} />
    </Routes>
  );
}
```

The Solo bundle externalizes React, ReactDOM, and react-router-dom — your host project provides them, preventing duplicate instance crashes.

### 2. Configure Storage (Optional)

For cloud persistence, set the InstantDB App ID:

```bash
# .env
VITE_INSTANTDB_APP_ID=your-app-id-here
```

Or configure via Blueprint's Settings page after launching.

---

## Dual Build Architecture

Blueprint has two independent build configurations:

| Mode | Config File | Command | Output | Purpose |
|------|-------------|---------|--------|---------|
| **Multi-Project** | `vite.config.ts` | `npm run build` | `dist/` | Standalone site, Lovable publish |
| **Solo** | `vite.config.lib.ts` | `npm run build:lib` | `dist-lib/` | Embedded inside host React apps |

**Multi-Project** is the default and produces a standard `index.html` app. **Solo** produces an ES module (`blueprint.es.js`) with React externalized, plus a bundled `style.css`.

---

## Running Multi-Project (Standalone)

Blueprint can run independently as its own site:

```bash
cd blueprint
npm install
npm run dev
# Opens at your local dev server URL (e.g. http://localhost:5173) or Cloud Preview IDE
```
