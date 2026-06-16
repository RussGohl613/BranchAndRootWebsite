# Branch and Root Consulting — Website

Static marketing site for **branchandrootconsulting.com**. Plain HTML, CSS, and
JS — no build step, no framework, no dependencies. Hosted on Vercel.

Branch & Root is a **local, family-run Orange County** team (two families, four
people — Russ Sr./Jr. and Matthew Sr./Jr.) that rebuilds the *revenue
infrastructure* under local service businesses: recovering dormant revenue from
customers a business has already earned, and capturing and converting every new
lead — positioned deliberately against remote, out-of-area agencies ("local, not
remote"). The site sells three integrated service systems and a set of packaged
bundles, and runs a 40-post SEO guides library aimed at owners researching
whether and how to hire lead-generation help.

This repo also contains a separate **private lead-preview subdomain**
(`leads.branchandrootconsulting.com`) and a **CCPA/CPRA privacy-compliance**
layer — both documented below.

---

## File structure

```
Website/
├── index.html                  # Home
├── services.html               # Three integrated service systems
├── bundles.html                # Packaged pricing tiers ($697 / $1,497 / $1,997 mo)
├── about.html                  # Team (two families, four people) + philosophy
├── faq.html                    # FAQ accordion (11 Q&As)
├── contact.html                # Lead form + direct contact
├── book.html                   # Book a free 30-min discovery call
├── privacy-policy.html         # Full CPRA-aligned policy
├── your-privacy-choices.html   # CA opt-out page + privacy-request (DSR) form
├── terms-of-service.html
├── thank-you.html              # Post-submit conversion page (consent-gated pixels)
├── 404.html
├── sitemap-page.html           # Human-readable sitemap (/sitemap-page) — interactive graph
├── dan-audit.html              # Internal tool — standalone, robots-blocked, not in sitemap
├── dan-questions.html          # Internal tool — standalone, robots-blocked, not in sitemap
├── mission-auto-pitch.html     # Internal tool — standalone, robots-blocked, not in sitemap
├── vercel.json                 # cleanUrls, trailingSlash:false, redirects, leads host-rewrite
├── sitemap.xml                 # 48 URLs
├── robots.txt                  # AI crawler allowlist + internal/leads/thank-you disallows
├── llms.txt                    # AI reading guide
├── api/
│   ├── lead.js                 # Serverless: proxies form submits to GHL v2 API
│   └── admin.js                # Serverless: GHL health-check + admin ops (secret-gated)
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens (colors, type scale, font-face)
│   │   ├── site.css            # Global component + page styles
│   │   └── guides.css          # Guides-only styles
│   ├── js/
│   │   ├── site.js             # Nav toggle, FAQ accordion, smooth scroll
│   │   ├── lead-form.js        # Form validation + API submission
│   │   ├── privacy-consent.js  # Consent engine: GPC, opt-out, Consent Mode v2, notice banner
│   │   └── sitemap-graph.js    # Interactive graph on sitemap-page.html
│   ├── fonts/                  # Self-hosted Fraunces + Source Sans 3 variable woff2
│   └── img/
│       ├── logo-badge.png      # Primary logo (nav, footer)
│       ├── logo-badge.jpg      # JPG variant
│       ├── og-image.jpg        # Social share preview (1200×1200)
│       ├── favicon-32.png / favicon-16.png / favicon.ico
│       ├── icon-512.png / apple-touch-icon.png
│       ├── revenue-leak-checklist.pdf   # Lead magnet PDF
│       └── team/               # Team headshot directory
├── guides/
│   ├── index.html              # Guides hub — featured posts + compact index; links to /guides/all-guides
│   ├── all-guides/index.html   # Full category-organized index of all posts at /guides/all-guides
│   └── {slug}/index.html       # One directory per post (40 posts)
├── compliance/                 # CCPA/CPRA implementation notes (repo-only, not deployed)
│   ├── README.md               # What was built + out-of-repo action items + maintenance checklist
│   ├── ccpa-gap-analysis.md    # Applicability audit + gap analysis
│   └── dsr-workflow.md         # How to handle consumer privacy requests
├── leads/                      # Private prospect-preview subdomain (own Vercel project — see below)
├── .templates/
│   └── blog-post.html          # Master post template with {{TOKEN}} placeholders
└── .claude/
    └── launch.json             # Dev server config (python3 -m http.server 4173)
```

**Repo-only / internal artifacts** (not part of the deployed site): the audit
PDFs and `AUDIT-FIX-PROMPT*.md`, `CLAUDE_DESIGN_PROMPT.md`,
`DESIGN_DECISIONS.md`, council report/transcript files, and `graphify-out/`.
`.vercelignore` keeps `*.md`, `.templates/`, `.claude/`, `.obsidian/`, and
`graphify-out/` out of Vercel deploys.

---

## URL architecture

`vercel.json` sets `cleanUrls: true` and `trailingSlash: false`. Every page
serves at its extension-free URL:

| File | Served at |
|------|-----------|
| `index.html` | `/` |
| `services.html` | `/services` |
| `bundles.html` | `/bundles` |
| `about.html` | `/about` |
| `faq.html` | `/faq` |
| `contact.html` | `/contact` |
| `book.html` | `/book` |
| `your-privacy-choices.html` | `/your-privacy-choices` |
| `guides/index.html` | `/guides` |
| `guides/{slug}/index.html` | `/guides/{slug}` |

Permanent redirects are configured:

- `/packages` → `/bundles`
- `/packages.html` → `/bundles`
- `/blog` → `/guides` and `/blog/:path*` → `/guides/:path*` (the guides section was renamed from `/blog` to `/guides`; old links still resolve)

The root `vercel.json` also carries a host-based rewrite mapping
`leads.branchandrootconsulting.com/*` → `/leads/*`. This dates from when the
leads subdomain was served by the main project; the leads previews are now
deployed as a **standalone Vercel project rooted at `leads/`** (see
[Leads subdomain](#leads-subdomain)).

**Hard convention:** every internal link, canonical tag, and sitemap entry must
use the clean URL (no `.html` extension, no trailing slash). This applies to
all root pages, the guides hub, every post, and the master template. Deviating
breaks canonical deduplication.

---

## Page inventory

**Core pages** (in nav order): Services · Bundles · About · FAQ · Guides · Contact.
Nav CTA: "Book a Free Consultation" → `/contact`.

**Support pages**: `privacy-policy`, `terms-of-service`, `your-privacy-choices`,
`thank-you`, `404`, `book`.

**Internal tool pages** (`dan-audit`, `dan-questions`, `mission-auto-pitch`):
standalone documents — not linked in nav or footer, no shared nav/footer/consent
boilerplate, disallowed in `robots.txt`, absent from `sitemap.xml`.

**Guides**: hub at `/guides` + 40 posts at `/guides/{slug}`.

**Leads subdomain**: private preview portal at `leads.branchandrootconsulting.com`
— noindexed and crawler-blocked (see [Leads subdomain](#leads-subdomain)).

---

## Guides system

### Architecture

- Hub: `guides/index.html` — features the top posts and a compact index; links to `/guides/all-guides` for the complete category-organized library.
- Full library: `guides/all-guides/index.html` — every published guide organized across categories, served at `/guides/all-guides`.
- Posts: each lives at `guides/{slug}/index.html` (40 posts total). Topic cluster: hiring and managing lead-generation help (agency vs. in-house, cost/salary, qualifying leads, metrics/ROI).
- Styles: `assets/css/guides.css` loaded in addition to the global sheets.
- Master template: `.templates/blog-post.html` — contains the full page structure; only the token values change between posts.

### How to add a post

1. Copy `.templates/blog-post.html` to `guides/new-slug/index.html`.
2. Replace the tokens throughout the file:
   - `{{TITLE}}` — post title (used in `<title>`, `og:title`, JSON-LD, breadcrumb)
   - `{{DESCRIPTION}}` — 150-char meta description
   - `{{SLUG}}` — URL slug (must match the directory name)
   - `{{BODY}}` — article body (600–900 words; open with `<p class="post-lede">` for
     the intro; use `<p class="post-note"><em>…</em></p>` for asides)
   - `{{RELATED_LINKS}}` — 2–3 `<li><a href="/guides/other-slug">Other Title</a></li>` items
3. Remove the instructional comment block at the top of the file.
4. Add a post card (`<article class="post-card">`) to `guides/index.html` (and the
   `/guides/all-guides` index) under the correct category section.
5. Add a `<url>` entry to `sitemap.xml` using the clean URL
   (`https://branchandrootconsulting.com/guides/{slug}`).

The template inherits the same per-page boilerplate as every other page (see
[Conventions](#conventions-for-future-edits)): Consent Mode v2 default block,
GTM, `privacy-consent.js`, nav, and footer. Its `<head>` and JSON-LD blocks are
fixed — do not restructure them. Each post gets three JSON-LD blocks: `BlogPosting`,
`BreadcrumbList`, and `WebPage` with `SpeakableSpecification`.

---

## SEO and AI visibility

### Sitemap

`sitemap.xml` contains **48 URLs** covering the public pages and guide posts.
Internal tool pages (`dan-audit`, `dan-questions`, `mission-auto-pitch`),
`thank-you`, `/.templates/`, and the entire `leads/` subdomain are excluded.

### robots.txt

All crawlers allowed by default (`User-agent: * / Allow: /`) with disallows for
`/dan-audit`, `/dan-questions`, `/mission-auto-pitch`, `/thank-you`,
`/graphify-out/`, `/.templates/`, and **`/leads/`**. Major AI crawlers are
additionally listed explicitly with `Allow: /`:

GPTBot · OAI-SearchBot · ClaudeBot · Claude-SearchBot · PerplexityBot ·
Google-Extended · Applebot-Extended · Amazonbot · CCBot

### llms.txt

`llms.txt` at the root provides a structured reading guide for AI assistants:
a one-paragraph description of the business, links to all core pages with
one-line descriptions, a link to the guides, and contact information.

### JSON-LD structured data

Every page carries structured data in `<script type="application/ld+json">` blocks:

| Page | Schema type(s) |
|------|----------------|
| `index` | `LocalBusiness` + `ProfessionalService`; `OfferCatalog` (3 services); `WebSite` |
| `services` | Three `Service` entries with `Offer` + `PriceSpecification` |
| `bundles` | `OfferCatalog` with bundle `Offer` entries |
| `about` | `AboutPage` with `Organization` + **4** `Person` team members |
| `faq` | `FAQPage` with all **11** `Question`/`Answer` pairs |
| `contact` | `ContactPage` |
| `guides` (hub) | `CollectionPage` + `BreadcrumbList` |
| Every guide post | `BlogPosting` + `BreadcrumbList` + `WebPage` with `SpeakableSpecification` |

### Canonical tags

`<link rel="canonical">` is present on all core pages, the guides hub, and
every guide post. All canonical URLs use the clean form (no `.html`).

---

## Analytics

GTM container **GTM-N6MLQZFR** and GA4 property **G-D3746FRPDV** are loaded in
the `<head>` of every main-site page (root pages, guides hub, all 40 posts, and
the master template). The GTM noscript iframe is in every `<body>` immediately
after the opening tag.

Every page also carries an inline **Google Consent Mode v2 default** block placed
*before* GTM, and loads `privacy-consent.js` (see [Privacy & consent](#privacy--consent-ccpacpra)).
Conversion events fire from `thank-you.html` on successful form submission and
are consent-gated.

> **Known cleanup item:** GA4 can currently load via both an inline
> `gtag('config', …)` and the GTM container. Pick one (recommended: GA4 in GTM
> only) — tracked in [`compliance/README.md`](compliance/README.md).

---

## Privacy & consent (CCPA/CPRA)

A conservative, good-practice privacy layer. Per
[`compliance/ccpa-gap-analysis.md`](compliance/ccpa-gap-analysis.md), Branch &
Root is **not currently a covered "business"** under the CCPA/CPRA — this is
built ahead of need and makes the dormant ad pixels safe before they're switched
on.

**In the repo:**

- **`your-privacy-choices.html`** — the CA opt-out destination: a toggle to opt
  out of ad-related "sharing," a live status line (including GPC state), and a
  privacy-request (DSR) form. Linked from every footer with the California
  opt-out icon ("Your Privacy Choices").
- **`assets/js/privacy-consent.js`** — the consent engine. Detects GPC
  (`navigator.globalPrivacyControl`), stores opt-out state in `localStorage`
  (`br_privacy_optout`, `br_notice_dismissed`), pushes `gtag('consent','update', …)`
  on change, fires a `br_consent_update` dataLayer event, and renders a
  non-blocking notice banner. Exposes **`window.BRPrivacy`** with
  `canTrackAds()`.
- **`privacy-policy.html`** — full CPRA rewrite (statutory PI categories,
  sources, purposes, third parties, retention, all consumer rights incl.
  Correct & Limit-SPI, GPC, minors-under-16, 45+45-day request timeline). "Last
  updated" 2026-06-14; review annually.
- **`thank-you.html`** — the dormant Meta Pixel loader and Meta/Google-Ads
  conversion events are gated behind `BRPrivacy.canTrackAds()`, so they stay
  silent for opted-out / GPC visitors even after pixel IDs are filled in.
- **`compliance/`** — gap analysis, DSR workflow, and an implementation README
  with the **out-of-repo action items** (GA4 Signals/ads-personalization off,
  GTM consent settings, vendor DPAs, `privacy@` alias, GHL DSR routing).

**How it works:** a synchronous in-`<head>` block calls `gtag('consent','default', …)`
before GTM, denying `ad_storage` / `ad_user_data` / `ad_personalization` when the
visitor has opted out *or* GPC is on (first-party `analytics_storage` stays
granted). `privacy-consent.js` then reconciles state on load and on every choice
change. The consent default block + `privacy-consent.js` are present on all
**56 main-site pages**.

See [`compliance/README.md`](compliance/README.md) for the full build notes and
the action items that must be completed in the Google/Meta/vendor UIs.

---

## Leads subdomain

`leads/` is a **private prospect-preview portal** served at
`leads.branchandrootconsulting.com`. It is deployed as **its own Vercel project**
with the project root set to `leads/`, so its pages are **fully self-contained**
(inline CSS, no `/assets` references, no shared boilerplate from the main site).

```
leads/
├── index.html            # Portal home — index of preview "rounds"
├── round-1/
│   ├── index.html        # Round 01 index — 10 previews × 4 links each
│   └── {company}/
│       ├── index.html         # Prospect-facing demo landing page
│       ├── audit.html         # Internal brand-audit report (login-gated)
│       ├── mini-audit.html    # Lead-facing digital-health scorecard (print-friendly, public)
│       ├── mini-audit.md      # Markdown source of the mini-audit (gitignored)
│       └── questionnaire.html # Discovery questionnaire — submits to Formspree (public)
├── 404.html              # Branded 404 (served natively)
├── robots.txt            # Disallow: / — the whole subdomain is unlisted
├── vercel.json           # cleanUrls, trailingSlash:false
└── .claude/              # Dev-only (gitignored): launch.json + preview-serve.js (clean-URL server :4178)
```

The subdomain is **unlisted and noindexed**: `leads/robots.txt` blocks all
crawlers, the root site's `robots.txt` disallows `/leads/`, and it is excluded
from `sitemap.xml`. Round 01 contains 10 personalized previews for Orange County
service businesses. Each prospect gets **four self-contained pages**: a
public-facing **demo** landing page, an internal **brand audit**, a lead-facing
**mini-audit** scorecard, and a **discovery questionnaire**.

- **Page switcher** — a floating bottom-right control (collapsed to an up-arrow,
  expands on hover/tap) links the four pages on every page type.
- **Return to Portal** — a back-arrow pill (label expands on hover) on the demo
  (footer, blended) and audit only; the mini-audit and questionnaire intentionally
  omit it. All internal/portal links are **root-relative** so they resolve in both
  local preview and production.
- **Questionnaire** — posts to a shared Formspree form ("Round-01 Lead
  Questionnaires", notifications → rmgohl@branchandrootconsulting.com), tagged with
  a hidden `business` field, and auto-populated with factual data from that
  prospect's audit. Light + dark themed; every field marked required or optional;
  a question counts complete only when its boxes hold real (non-whitespace) data.
- **Access** — Cloudflare Access gates the whole subdomain behind login **except**
  the mini-audit and questionnaire paths, which are public (Access *Bypass*) so a
  lead owner can open theirs via a direct link with no login. The Bypass app uses
  wildcard paths (`*/mini-audit*`, `*/questionnaire*`) so every future round works
  under the one app — no new Access app per round. Setup steps live in the
  internal `cloudflare-lead-access-public-guide.html`.

> **Note:** these previews are demonstration/spec work and use placeholder or
> client-specific content — they are independent of the main marketing site's
> copy and brand tokens.

---

## API — Vercel serverless functions

**`api/lead.js`** — receives form POSTs from the site, validates required fields
(`email`, `source`), and creates or updates a GHL contact via the GHL v2 API
(`/contacts/`). Handles duplicates by tagging the existing record. Requires
`GHL_PIT_TOKEN` and optionally `GHL_LOCATION_ID` as Vercel env vars. The
`your-privacy-choices` DSR form reuses this endpoint via its existing
`tags`/`customFields` pass-through (tagged `privacy-request`).

**`api/admin.js`** — secret-gated GHL operations endpoint (`?secret=` query param
or `X-Admin-Secret` header matching `ADMIN_SECRET` env var). Supports ops:
`health`, `workflows`, `custom-fields`, `pipelines`, `calendars`, `contact`,
`delete-contact`, `test-lead`. Used for setup verification and round-trip
testing without needing the GHL token locally.

---

## Brand tokens

All colors, type sizes, and spacing live in `assets/css/tokens.css`.

| Token | Hex | Role |
|-------|-----|------|
| `--forest` | `#1B4332` | Primary (buttons, headlines) |
| `--moss` | `#2D6A4F` | Highlight (eyebrows, hover state) |
| `--cream` | `#F7F5F0` | Page background |
| `--slate` | `#4A5568` | Secondary text |

Typography: `Fraunces` (display serif) + `Source Sans 3` (body sans), both
self-hosted as variable `woff2` in `assets/fonts/`. No Google Fonts request.
Both fonts are `<link rel="preload">`-ed in every page head.

---

## Local development

Any static file server works for the main site (`.claude/launch.json` runs it on
port 4173). The **leads** subdomain relies on Vercel clean URLs (extensionless
`/round-1/<slug>/mini-audit`), so it needs a clean-URL-aware server:
`leads/.claude/preview-serve.js` (a tiny Node static server) serves it on port
4178 — plain `python3 -m http.server` will 404 those links.

```bash
# main site
python3 -m http.server 4173          # → http://localhost:4173

# leads subdomain (clean URLs; from the leads/ directory)
node .claude/preview-serve.js 4178   # → http://localhost:4178
```

**Note:** opening pages via `file://` will not work correctly for guide posts or
any page that references absolute asset paths (`/assets/…`). Always use a
local server. (The leads pages are self-contained and tolerate `file://`, but a
server is still recommended for clean-URL routing.)

---

## Conventions for future edits

### Clean URLs — no exceptions

All internal links, canonical tags, and sitemap entries use the clean URL form.
Never write `href="services.html"` or `href="/services/"`. Always `href="/services"`.
This applies in HTML, in `sitemap.xml`, and in any new code files.

### Nav, footer, and head boilerplate are duplicated per page

There is no shared templating layer. The nav, footer, Consent Mode v2 default
block, GTM tags, and `privacy-consent.js` include are copied verbatim into every
main-site page.

**When you change any of that shared boilerplate, update every copy** — all
**56 main-site pages**:

- 13 root `.html` pages: `index`, `services`, `bundles`, `about`, `faq`,
  `contact`, `book`, `privacy-policy`, `terms-of-service`, `your-privacy-choices`,
  `thank-you`, `sitemap-page`, `404`
- `guides/index.html` and `guides/all-guides/index.html`
- All 40 `guides/{slug}/index.html` files
- `.templates/blog-post.html`

(The standalone internal tool pages and the `leads/` subdomain do **not** share
this boilerplate — don't edit them as part of a nav/footer change.)

Suggested workflow: edit `index.html` first, then copy-paste the changed block
into each other file.

Nav order: Services · Bundles · About · FAQ · Guides · Contact + "Book a Free
Consultation" CTA.

Footer legal row: Privacy Policy · Terms of Service · Your Privacy Choices ·
Sitemap (links to `/privacy-policy`, `/terms-of-service`,
`/your-privacy-choices`, `/sitemap-page`). The Sitemap link points to the
human-readable sitemap page; the XML sitemap for crawlers remains at
`/sitemap.xml`.

### JS files

`site.js` handles nav toggle, FAQ accordion, and smooth scroll. `lead-form.js`
handles form validation and submission to `api/lead`. `privacy-consent.js`
handles consent/opt-out. `sitemap-graph.js` powers the interactive graph on
`sitemap-page.html`. All are loaded with `defer` at the bottom of `<body>`
(the inline Consent Mode default is the exception — it must run synchronously in
the head before GTM).

---

## Accessibility

- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) on every page
- Skip-to-content link on every page
- `aria-expanded` / `aria-controls` on FAQ buttons and mobile nav
- `:focus-visible` outlines on every interactive element
- `prefers-reduced-motion` honored
- Color contrast meets WCAG AA across the site (forest-on-cream and
  cream-on-forest both ≥ 7:1)
- The privacy notice banner is non-blocking with symmetric, unbiased choices
  (no pre-checked boxes, no opt-in wall)

---

## Browser support

Modern evergreen browsers (last 2 Chrome, Safari, Firefox, Edge versions).
Uses CSS custom properties, `clamp()`, CSS grid, and `defer` scripts — all
baseline since ~2020. No IE11 support.
