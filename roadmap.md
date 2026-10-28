# Roadmap

- [x] Backend picker: Browser / Cloudflare / Supabase / InstantDB / Custom REST + host adapter
- [x] Cloudflare Worker + D1 code
- [ ] Provision a fresh Cloudflare D1 database and deploy the backend Worker (credentials available; confirm named resources and usage costs)
- [ ] Switch the standalone app to the fresh database; do not migrate the empty InstantDB data
- [ ] Retire old data only after a verified fresh installation; no deletion required to switch backends
- [x] CSS vars renamed to --bp-*
- [x] Live Connectors sidebar shelf
- [x] React 19: drag-and-drop lib v18, peer range 18–19
- [x] Docs update
- [ ] Full style isolation, including popups, editor styles, and local dark mode
- [x] Setup wizard: backend, PIN, workspace (skipped for host apps that pass a user)
- [x] Access card in Settings (change/turn off PIN)
- [ ] Admin + email accounts on Cloudflare Worker (blocked: Cloudflare token + Plunk API key)
