# Horizon Health Benefits — Public Marketing Site (Home Page)

Date: 2026-09-13
Status: Approved by user, building Home page only.

## Purpose

A public marketing site for Horizon Health Benefits, separate from the
internal agent CRM (`horizon-crm`). Three concrete uses:

1. Linked from Matthew Anderson's digital business card.
2. Attached to welcome emails.
3. Landing page for upcoming Meta ad campaigns.

The site is architected as a multi-page site (shared header/footer,
nav ready for future pages), but **only the Home page is being built
in this pass**. About/Services/Contact are structurally anticipated,
not implemented.

## Non-goals (this pass)

- No Calendly integration. User has zero Calendly event types
  configured and explicitly chose a simpler path instead (see below).
- No Medicare-specific marketing copy/CMS disclaimers — kept generic
  to avoid federally-regulated Medicare marketing language until
  that's deliberately scoped as its own piece of work.
- No About/Services/Contact page content.
- No CMS/admin for editing copy — static HTML, edited by hand or by
  Claude in a future session.

## Approach

Plain HTML/CSS/vanilla JS, matching `horizon-crm`'s existing
convention (no framework, no build step, no npm). One Vercel Node
serverless function (`/api/request-call`) for the contact form —
no database. New, separate Vercel project/repo (`horizon-site`),
own domain, intentionally decoupled from the CRM's Supabase backend.

## Page sections (Home)

1. **Header** — logo + "Horizon Health Benefits" wordmark, nav
   placeholder (links can 404 or be omitted until other pages exist),
   "Request a Call" button anchor-scrolling to the form.
2. **Hero** — headline + subhead in brand voice (clear, warm, no
   hype), primary CTA to the form.
3. **What We Help With** — general, product-agnostic overview of the
   coverage types the agency assists with. No single product pushed.
4. **Why Horizon** — trust section: "Contracted with 10+ carriers"
   stat, plus short points on professionalism/service. No invented
   testimonials/reviews.
5. **Meet the Team** — Matthew Anderson (photo, name, title, real
   content available now). John Marinello (placeholder pending his
   headshot + NPN from the user).
6. **Request a Call form** — Name, Phone, Email, Reason. Submits to
   `/api/request-call`, which emails the owner via Resend. No
   scheduling; the owner follows up manually with available times.
7. **Footer** — logo, licensing disclosure line, contact info, year.

## Form → email flow

- `POST /api/request-call` (Vercel Node serverless function, no
  external dependencies — uses global `fetch`, same runtime
  capability `horizon-crm`'s Edge Functions rely on).
- Validates required fields server-side, escapes all user input
  before interpolating into the email HTML (same pattern as
  `horizon-crm`'s `lead-notify` function).
- Sends via Resend's HTTP API directly (`https://api.resend.com/emails`),
  reusing the **same env var names** already used in `horizon-crm`
  (`RESEND_API_KEY`, `OWNER_EMAIL`) and the same sandbox sender
  (`onboarding@resend.dev`) for consistency — meaning, per Resend's
  sandbox restriction, delivery only works to the one recipient
  address verified on that Resend account until a custom sending
  domain is verified.
- No database write. If the email fails to send, the visitor sees an
  error and can retry — there is deliberately no persistence layer to
  avoid repeating the quoting platform's "backend piece never got set
  up" failure mode on a feature this simple.

## Known gaps blocking full completion

- **John Marinello's headshot + NPN** — needed to complete the Meet
  the Team section. Built with a clearly-marked placeholder until
  provided.
- **Stock photography** — candidates sourced from Pexels (free,
  no attribution required) for the hero and trust sections; needs
  explicit user sign-off before downloading (file download requires
  confirmation per operating rules). Built with a brand-colored
  placeholder treatment until approved.
- **Resend account/domain** — user must have (or create) a Resend
  account and supply `RESEND_API_KEY` / `OWNER_EMAIL` as Vercel
  environment variables at deploy time; Claude cannot create
  third-party accounts on the user's behalf.
