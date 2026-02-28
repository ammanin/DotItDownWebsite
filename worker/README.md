# Contact form Worker (Cloudflare)

This Worker handles the site’s contact form and sends you an email using **Cloudflare Email Routing** only (no Formspree or other third parties).

## Prerequisites

1. **Domain on Cloudflare**  
   Add your domain in the Cloudflare dashboard.

2. **Email Routing**  
   - In the dashboard: **Email** → **Email Routing** → get started.  
   - Add and verify at least one **destination address** (e.g. your Gmail).  
   - The sender address must be on this domain (e.g. `noreply@yourdomain.com`).

## Configure

Edit `wrangler.toml`:

- **`destination_address`** (under `[[send_email]]`) and **`DESTINATION_EMAIL`** (under `[vars]`)  
  → The address where you want to receive contact form emails (must be a verified Email Routing destination).

- **`SENDER_EMAIL`** (under `[vars]`)  
  → An address on your domain, e.g. `noreply@yourdomain.com` (must be the domain where Email Routing is enabled).

## Deploy

From the `worker` folder:

```bash
npm install
npx wrangler deploy
```

Then in the Cloudflare dashboard: **Workers & Pages** → your Worker → **Settings** → **Triggers** → add a route, e.g.:

- **Route:** `yourdomain.com/api/contact`

So when someone submits the form on `https://yourdomain.com`, the request goes to `https://yourdomain.com/api/contact` and is handled by this Worker.

## Hosting the site

- **GitHub Pages:** Point your domain (via Cloudflare DNS) to GitHub Pages, and add the Worker route above so `yourdomain.com/api/contact` runs the Worker while the rest of the site is served by GitHub.
- **Cloudflare Pages:** Connect your GitHub repo to Cloudflare Pages and use the same Worker route; both site and Worker then live on Cloudflare.

## Local testing

```bash
npm run dev
```

The Worker will run locally. Sending email is simulated (e.g. `.eml` files written locally). Use the same route path (`/api/contact`) when testing the form.
