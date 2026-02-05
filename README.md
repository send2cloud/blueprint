# Blueprint — Creative Idea Room

Blueprint is a personal, project‑local toolbox for capturing the spark behind a project and everything that follows: notes, sketches, flows, tasks, and artifacts. It is meant to travel with each repo as a detachable “idea room” you can return to months later and immediately understand why the project exists and where it stands.

## Genesis & Intent

This project was created to keep the creator’s mind clear by externalizing ideas into a structured space that lives alongside the code. It is not part of the product itself. It is a companion: a private workspace for planning, reflection, and reference.

## Scope

Blueprint provides:
- Whiteboard / canvas sketches
- Flow diagrams
- Task boards
- Notes / documents
- Artifact galleries with shareable deep links

Blueprint does **not** need to integrate with the host app’s business logic. It only needs to live next to it, store its own data, and remain portable with the repo.

## How It Works

Blueprint stores artifacts in one of two modes:

1. **Local Storage (default)**
   - Fastest to start.
   - Data stays in this browser only.

2. **InstantDB (recommended for real projects)**
   - Data is stored in the host project’s InstantDB app.
   - Uses dedicated namespaces like `blueprint_artifacts` so your personal data stays separate.
   - Travels with the project because it lives in that project’s DB.

## Connect to InstantDB

1. Open Blueprint.
2. Go to **Settings → Database Connection**.
3. Select **InstantDB**.
4. Paste the host project’s **Instant App ID**.
5. Click **Save**.

When connected, the “Using local storage” banner disappears and your artifacts sync to InstantDB.

## Install Blueprint Into a New Project (Lovable flow)

After creating the project in Lovable and syncing to GitHub, ask the LLM:

"Hey Lovable, go to this GitHub link (https://github.com/send2cloud/blueprint) and install that app into a folder called `/blueprint`. You can read the instructions in the README."

Then:
1. Open Blueprint.
2. Connect it to the project’s InstantDB App ID in **Settings → Database Connection**.

That’s it. Blueprint now travels with the project and stores its data in the project’s database.

## Tech Stack

- Vite
- React + TypeScript
- shadcn-ui + Tailwind
- React Flow, tldraw, BlockNote
