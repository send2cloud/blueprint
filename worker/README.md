# Blueprint Cloudflare backend

Worker + D1 that stores Blueprint data. One Worker per host project.

```bash
cd worker
npx wrangler d1 create blueprint            # paste database_id into wrangler.toml
npx wrangler d1 migrations apply blueprint --remote
npx wrangler secret put WRITE_KEY           # any long random string
npx wrangler deploy
```

In Blueprint → Settings → Backend: pick **Cloudflare**, paste the Worker URL and write key.
Or bake it into the build:

```
VITE_BLUEPRINT_BACKEND=cloudflare
VITE_BLUEPRINT_BACKEND_URL=https://blueprint-backend.<you>.workers.dev
VITE_BLUEPRINT_BACKEND_KEY=<WRITE_KEY>
```

Note: the write key ships to browsers, so it stops casual bots, not a determined user.
Allow extra host domains with the `ALLOWED_ORIGINS` var.
