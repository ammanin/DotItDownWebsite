# Dot It Down website

Static site deployed via **Vercel** on push to GitHub. No build step — root `index.html` is the live site.

## Local preview

```bash
python3 -m http.server 8765
```

Open http://localhost:8765/

## Designs

| Path | Description |
|------|-------------|
| `/` (root) | **Current:** app design system + void/starry interactions |

## Contact form

`POST /api/contact` is handled by the Cloudflare Worker in `worker/` (not Vercel). Test on production when the route is configured.
