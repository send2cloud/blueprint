

# Simplify Mode Terminology

Remove the Solo/Multi-Project toggle and cross-references so each context only talks about what it actually is.

## What Changes

### 1. App.tsx - Remove Solo/isSolo logic
- Remove `isSolo` variable and `basename` prop
- Always show landing page at `/` (this is always the standalone app)
- Remove Solo-related comments
- Simplify `AppRoutes` to not take `isSolo` prop

### 2. Settings Page - Remove Project Mode section
- Remove the entire "Project Mode" card (the Solo/Multi select dropdown) since this Lovable project is always multi-project
- Remove `handleModeChange` function
- The mode will always be `'multi'`

### 3. Storage types - Remove mode field
- Remove `mode?: 'solo' | 'multi'` from `BlueprintSettings` interface (or keep it but stop exposing it in UI)
- Actually, keep the type for backward compatibility with stored data, but default to `'multi'` everywhere and remove the UI toggle

### 4. lib-entry.ts - Remove Multi-Project references from comments
- Update comments to only describe what this file does (library entry point) without referencing "Multi-Project"

### 5. Documentation files - Strip cross-references
- **LLM_INSTALL.md**: Remove "Multi-Project" column from the build table, remove references to standalone mode. This doc is purely about embedding.
- **INSTALL.md**: Remove "Multi-Project" references from the embedding instructions. Keep standalone instructions but label them simply as "Running Blueprint standalone" without the "Multi-Project" label.
- **README.md**: Same treatment - simplify dual-build table to just describe "default build" vs "library build"
- **.lovable/plan.md**: Update terminology

### 6. Test files
- Update mocks in `ShareButton.test.tsx`, `SettingsPage.test.tsx`, `AppSidebar.test.tsx` that reference `mode: 'solo'`

### 7. BlueprintContext.tsx
- Remove solo-mode comment, simplify the fallback logic

### 8. scripts/install.sh
- Remove "Solo" terminology, just say "embedding" or "library mode"

## Technical Details

- The `mode` field stays in `BlueprintSettings` type for data compatibility but defaults to `'multi'` and the UI toggle is removed
- The `basename` prop on `App` stays for the library build (it's still needed there), but comments are simplified
- `isSolo` logic in App.tsx is removed since this build always shows the landing page

