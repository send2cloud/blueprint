# Fresh Cloudflare installation and isolated embedding

## Result

- Create an empty Cloudflare database and put Blueprint’s storage service online in the same team account.
- Switch this standalone app from InstantDB to that database. Do not copy the empty whiteboards.
- Keep the website hosted on Lovable; Cloudflare runs only its storage service.
- Isolate the embedded library’s appearance, including themes, menus, dialogs, and editor styles, from the surrounding app.

```text
Standalone Blueprint → PIN → Fresh idea room
                                │
                         Cloudflare storage

Other app
┌──────────────────────────────────────┐
│ Other app’s appearance and sign-in    │
│  ┌────────────────────────────────┐  │
│  │ Blueprint: its own appearance  │  │
│  │ Uses that app’s chosen storage │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

## Cloudflare launch and fresh start

1. Check the existing team account for the named resources before creating anything: Worker `blueprint-backend`, D1 database `blueprint`, binding `DB`. Reuse only resources confirmed to belong to this app; do not overwrite an unrelated deployment.
2. Apply the existing record-table schema to an empty database. Deploy the backend separately from the Lovable website.
3. Replace the current public-read/browser-write-key design with server-verified PIN access for this standalone installation. Protect both reads and writes; never publish an administrative write key or PIN hash in the website bundle. Keep generic REST and host-provided storage integrations available for other installations.
4. Configure the initial server PIN securely before exposing record access. Keep the existing 90-day remember choice, backed by an expiring server-verifiable session rather than a browser-only “granted” flag. Confirm actual cross-site session behavior in the preview and published site.
5. Make Cloudflare the deterministic standalone default without changing embedded hosts’ backend choices. The fresh workspace uses the setup screen for identity and preferences.
6. Leave the old InstantDB database untouched and unused. Switching to an empty database achieves the requested fresh start without deleting unrelated resources or requiring a data transfer.

**Costs and approval:** Provisioning these named resources can incur Cloudflare usage charges. The account already has Workers Paid ($5/month); requests, CPU, D1 reads/writes, and storage above included allowances cost extra. Approving this plan confirms creation/deployment of these resources in the existing team account; no Cloudflare security settings or unrelated resources will be changed.

## Style isolation

- Add an isolated embedding boundary for the library, with its stylesheet loaded inside a Shadow DOM root.
- Keep Blueprint’s theme on its own root rather than changing the host page’s light/dark class.
- Provide a local destination for popup menus, dialogs, tooltips, and editor overlays. Audit third-party portals rather than assuming the boundary handles them automatically.
- Fix the missing library Tailwind configuration and ensure the library includes Blueprint’s own styles as well as editor styles.
- Preserve the separate standalone and library build paths; standalone appearance and navigation remain unchanged.

## Verification and documentation

- Add focused tests for protected storage access, session expiry, and backend precedence. Run existing affected tests.
- Verify fresh setup, PIN unlock, saving a real project and whiteboard, and reading them after refresh against the deployed service.
- Verify embedded menus and editors remain usable while the surrounding app’s styles and theme remain unchanged; check desktop and narrow screens.
- Update README, both installation guides, Worker documentation, architecture rules, and the task list with the actual deployed configuration and embedding instructions.
- Publishing this Lovable website is a separate explicit action; do not claim the existing published website switched before it is republished.

## Technical details

- Retain `RecordStore` / `RecordStoreAdapter`; add Cloudflare-specific session handling in the integration layer and portable access rules in `src/core`.
- Use Wrangler with existing server-side Cloudflare credentials. No account tokens, Plunk credentials, or administrative backend keys enter frontend configuration.
- Keep auth state separate from public workspace identity; setup must not allow unauthenticated visitors to claim an installation.
- Preserve InstantDB support for other hosts; remove only this installation’s default selection.
- Plunk email/admin accounts are not included: “all three” refers to database provisioning, backend deployment, and the fresh backend switch, plus style isolation.