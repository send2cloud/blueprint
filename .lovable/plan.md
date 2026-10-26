# Killbill Feedback: D1 Storage, Style Isolation, Live Connectors, React 19

Yes — D1 + Worker goes behind the existing storage adapter. Hosts can plug in their own.

```text
Blueprint screens
      |
  Storage plug  (one shape, swappable)
   |         |            |          |          |
 Browser  Cloudflare   Supabase   InstantDB   Custom
          (default)               (self-host)  (any URL)
```

## 1. Replace InstantDB with Cloudflare D1 + Worker
- Formalize one storage contract (settings, projects, artifacts, events) returning `{ success, data, error }`.
- Adapters: Browser (local), REST (any URL), D1 Worker (default, built on REST).
- Deploy a Blueprint Worker + D1 from here. Each host gets its own Worker/DB (same idea as old per-host App IDs).
- Settings: "Backend" picker, fields change per choice:
  - Browser only (no setup)
  - Cloudflare Worker (URL + key) — default for this app
  - Supabase (project URL + publishable key; ships a ready table script)
  - InstantDB (App ID; works with self-hosted InstantDB since it's open source)
  - Custom REST (URL + headers)
- Hosts can also pass their own adapter in code — Settings then shows "Provided by host" and hides the picker.
- Heavy SDKs (Supabase, InstantDB) load only when that backend is picked.
- Export current InstantDB data (just yours) and import into D1, then remove InstantDB code and package.
- Write-protection: simple shared key header so bots can't write.

## 2. Style isolation
- All Blueprint styles scoped under `.blueprint-root`; colour variables renamed `--bp-*`.
- Dark/light toggle only affects Blueprint's root, never the host page.

## 3. Live Connectors shelf
- New sidebar section "Live" below the tools, fed by an optional `liveConnectors` list (label, icon, URL, open mode, badge).
- Open modes: same tab, new tab, or break out of iframe.
- Standalone app: empty by default, hidden when empty.

## 4. React 19 support
- Swap `@hello-pangea/dnd` v16 for a React 19 compatible version; widen library peer range to React 18–19.
- Re-test boards drag and drop.

## 5. Docs
- Update README, INSTALL, LLM_INSTALL: new storage setup, Worker deploy, connectors, style scoping.

## Technical details
- Contract lives in `src/lib/storage/types.ts`; components keep using the existing context only.
- Worker: `worker/` with wrangler.toml, D1 migration, JSON routes, CORS allowlist for lovable/localhost/host domains. No Durable Object yet (no realtime needed now).
- CSS: Tailwind `important: '.blueprint-root'` + variable rename in index.css/tailwind config.
- Tests: adapter contract tests run against Browser and REST (mocked fetch).
- Not in scope: lazy loading, embed guide (skipped this round).
