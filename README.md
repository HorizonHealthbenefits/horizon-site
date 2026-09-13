# horizon-site

Public marketing site for Horizon Health Benefits. Separate from the
internal agent CRM (`horizon-crm`) — this repo is public-facing only,
no login, no client data.

Home page only, for now. Built multi-page-ready (shared header/nav)
so About/Services/Contact can be added as their own `.html` files
later without restructuring.

## Stack

Plain HTML/CSS/vanilla JS — no framework, no build step, no npm
dependencies for the frontend. One Vercel Node serverless function
(`api/request-call.js`) handles the "Request a Call" form; it uses
the platform's built-in `fetch`, so it has no dependencies either —
no `package.json`/`npm install` needed anywhere in this repo.

## Run locally

```
python3 -m http.server 8000
```
then open `http://localhost:8000`. Note: the "Request a Call" form
won't actually send email when run this way — `/api/*` only works
under `vercel dev` or once deployed, since it's a serverless
function, not a static file.

To test the form end-to-end locally: `vercel dev` (requires the
Vercel CLI and the env vars below set locally, e.g. in `.env.local`).

## Deploy

Push to `main` → Vercel auto-deploys (once the repo is connected to
a Vercel project, same as `horizon-crm`).

**Required environment variables** (Vercel Project Settings →
Environment Variables):

- `RESEND_API_KEY` — from your Resend account.
- `OWNER_EMAIL` — where "Request a Call" submissions get sent.
  **Must be the address verified on the Resend account** — the
  sandbox sender (`onboarding@resend.dev`) only delivers to one
  verified recipient until a custom sending domain is verified in
  Resend. (Same constraint `horizon-crm`'s `lead-notify` function
  already lives with.)

## Known gaps (see `docs/superpowers/specs/2026-09-13-homepage-design.md`)

- John Marinello's headshot + NPN — Team section has a placeholder
  until provided.
- Hero/trust-section photography — currently a brand-colored graphic
  treatment; real stock photo candidates were sourced from Pexels but
  not yet downloaded (needs sign-off before adding actual image
  files).
