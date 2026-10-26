# First-Run Setup Wizard

## Two ways Blueprint runs

```text
Embedded in a host app (Killbill, Firstshow)     Standalone (this app)
  Host app                                         Blueprint
   |- its database  <- Blueprint adds its own       |- its own backend (wizard picks)
   |                   tables beside the host's     |- its own admin / PIN
   |- its logins    <- Blueprint uses the host's
                       signed-in user
```

- **Embedded:** Blueprint borrows the host's backend. It gets its own tables (all `blueprint_*`), so it never touches the host's data. It uses whoever is signed in to the host. The host passes this in once (`adapter` + `user`), and no wizard is shown.
- **Standalone:** there's no host to borrow from, so the wizard below sets it all up.
- Embedded hosts on Supabase or Cloudflare use the matching built-in option, pointed at the host's own project.

## Your question: where does the backend choice live?
Yes, the backend serves the whole app. But the app has to know *where* the backend is before it can read anything from it, so the address can't be stored in the backend itself. That leaves two places for it:

```text
Option A (recommended for published apps)
  Build setting  ->  every visitor, every device uses the same backend

Option B (quick try / self-install)
  Wizard saves it in this browser  ->  only this device knows it
```

The wizard does both. Once it connects, it shows a "Make this permanent" step listing the build settings to add, and I can add them for you. Everything else (PIN, admin, project identity) is saved **inside the backend**, so every device sees the same setup.

## Flow

```text
Launch
  |
  Is a backend known? --no--> [1 Backend] pick + test connection
  |                                  |
  Is setup done in backend? --no--> [2 Admin] name + email + password
  |                                  |
  |                               [3 Access] team PIN on/off + PIN
  |                                  |
  |                               [4 Workspace] name, colour, logo
  |                                  |
  |                               [5 Done] "make permanent" settings
  v
App (sign in or PIN as configured)
```

## Steps
1. **Backend**: same five choices as Settings, plus a "Test connection" button. You can't move on until the test passes.
2. **Admin**: create the first admin account (Cloudflare backend only, see below).
3. **Access**: replace the fixed 5555 with your own PIN, stored hashed, or turn the PIN off. Bot protection stays.
4. **Workspace**: first project name, colour and logo (replaces the auto-made "Idearoom").
5. **Done**: summary, plus the build settings to make the setup permanent.

The wizard shows only when setup isn't done. After that, Settings can change everything.

## Concern: admin + email login
Sign-in has to happen on the backend, and each backend handles accounts differently. Doing it properly for all five would mean five sign-in systems. Recommendation:
- **Cloudflare**: real accounts (admin + invited members), login, password reset and invite emails, built into our Worker. Email goes through Plunk.
- **Supabase**: use Supabase's own sign-in later (phase 2).
- **Browser / InstantDB / Custom**: PIN only, no accounts.

Phase 1 = wizard + PIN + workspace + Cloudflare accounts. It needs the Cloudflare token (still pending) and a Plunk API key.

## Technical details
- New `src/core/setup.ts`: pure setup-state machine (steps, validation, "is setup complete") with `{ success, data, error }` results.
- Setup record stored as `kind: 'settings'` fields: `setupComplete`, `pinHash`, `pinEnabled`. PIN is checked with a hash compare (WebCrypto SHA-256 + salt).
- `RecordStore` gains an optional `ping()` for "Test connection".
- Worker: `users` + `sessions` + `invites` tables, PBKDF2 (100k) password hashing, HttpOnly Secure SameSite=None session cookie, `/auth/*` routes, Plunk for emails. Writes require a session or the write key.
- The PinGate reads its settings from the backend; it falls back to the current behaviour when setup isn't done.
- Tests: setup state transitions, PIN hash check, wizard gating.
