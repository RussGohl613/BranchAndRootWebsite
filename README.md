# Branch and Root Consulting — Website

Static marketing site for **branchandrootconsulting.com**. Plain HTML, CSS, and
JS — no build step, no framework, no dependencies. Hosted on Vercel.

The business is an Orange County, CA lead generation and customer reactivation
agency serving local service businesses (HVAC, plumbing, electrical, landscaping).

---

## File structure

```
Website/
├── index.html                  # Home
├── services.html               # Three integrated service systems
├── bundles.html                # Packaged pricing tiers
├── about.html                  # Team + philosophy
├── faq.html                    # FAQ accordion (10 Q&As)
├── contact.html                # Lead form + direct contact
├── book.html                   # Book a free 30-min discovery call
├── privacy-policy.html
├── terms-of-service.html
├── thank-you.html              # Post-submit conversion page
├── 404.html
├── sitemap-page.html           # Human-readable sitemap page (/sitemap-page)
├── dan-audit.html              # Internal tool — blocked in robots.txt, not in sitemap
├── dan-questions.html          # Internal tool — blocked in robots.txt, not in sitemap
├── mission-auto-pitch.html     # Internal tool — blocked in robots.txt, not in sitemap
├── vercel.json                 # cleanUrls, trailingSlash:false, redirects
├── sitemap.xml                 # 47 URLs
├── robots.txt                  # AI crawler allowlist + internal-page disallows
├── llms.txt                    # AI reading guide
├── api/
│   ├── lead.js                 # Serverless: proxies form submits to GHL v2 API
│   └── admin.js                # Serverless: GHL health-check + admin ops (secret-gated)
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Design tokens (colors, type scale, font-face)
│   │   ├── site.css            # Global component + page styles
│   │   └── blog.css            # Blog-only styles
│   ├── js/
│   │   ├── site.js             # Nav toggle, FAQ accordion, smooth scroll
│   │   └── lead-form.js        # Form validation + API submission
│   ├── fonts/                  # Self-hosted Fraunces + Source Sans 3 variable woff2
│   └── img/
│       ├── logo-badge.png      # Primary logo (nav, footer)
│       ├── logo-badge.jpg      # JPG variant
│       ├── og-image.jpg        # Social share preview (1200×1200)
│       ├── favicon-32.png
│       ├── favicon-16.png
│       ├── favicon.ico
│       ├── icon-512.png
│       ├── apple-touch-icon.png
│       ├── revenue-leak-checklist.pdf   # Lead magnet PDF
│       └── team/               # Team headshot directory
├── blog/
│   ├── index.html              # Blog hub — 7 categories, 40 post cards
│   └── {slug}/index.html       # One directory per post (40 posts)
├── .templates/
│   └── blog-post.html          # Master post template with {{TOKEN}} placeholders
└── .claude/
    └── launch.json             # Dev server config (python3 -m http.server 4173)
```

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
| `blog/index.html` | `/blog` |
| `blog/{slug}/index.html` | `/blog/{slug}` |

Two permanent redirects are configured:

- `/packages` → `/bundles`
- `/packages.html` → `/bundles`

**Hard convention:** every internal link, canonical tag, and sitemap entry must
use the clean URL (no `.html` extension, no trailing slash). This applies to
all root pages, the blog hub, every post, and the master template. Deviating
breaks canonical deduplication.

---

## Page inventory

**Core pages** (in nav order): Services · Bundles · About · FAQ · Blog · Contact.
Nav CTA: "Book a Free Consultation" → `/contact`.

**Support pages**: `privacy-policy`, `terms-of-service`, `thank-you`, `404`, `book`.

**Internal tool pages** (`dan-audit`, `dan-questions`, `mission-auto-pitch`): not
linked in nav or footer, disallowed in `robots.txt`, absent from `sitemap.xml`.

**Blog**: hub at `/blog` + 40 posts at `/blog/{slug}`.

---

## Blog system

### Architecture

- Hub: `blog/index.html` — 7 categories with post cards (Hiring Decisions · Costs & Compensation · Finding & Vetting Talent · Lead Gen Fundamentals · Tools & Tactics · Performance & Metrics · Industry & Strategy).
- Posts: each lives at `blog/{slug}/index.html` (40 posts total).
- Styles: `assets/css/blog.css` loaded in addition to the global sheets.
- Master template: `.templates/blog-post.html` — contains the full page structure; only the 5 token values change between posts.

### How to add a post

1. Copy `.templates/blog-post.html` to `blog/new-slug/index.html`.
2. Replace the five tokens throughout the file:
   - `{{TITLE}}` — post title (used in `<title>`, `og:title`, JSON-LD, breadcrumb)
   - `{{DESCRIPTION}}` — 150-char meta description
   - `{{SLUG}}` — URL slug (must match the directory name)
   - `{{BODY}}` — article body (600–900 words; open with `<p class="post-lede">` for
     the intro; use `<p class="post-note"><em>…</em></p>` for asides)
   - `{{RELATED_LINKS}}` — 2–3 `<li><a href="/blog/other-slug">Other Title</a></li>` items
3. Remove the instructional comment block at the top of the file.
4. Add a post card (`<article class="post-card">`) to `blog/index.html` under the
   correct category section.
5. Add a `<url>` entry to `sitemap.xml` using the clean URL
   (`https://branchandrootconsulting.com/blog/{slug}`).

The template's `<head>` and JSON-LD blocks are fixed — do not restructure them.
Each post gets three JSON-LD blocks automatically: `BlogPosting`, `BreadcrumbList`,
and `WebPage` with `SpeakableSpecification`.

---

## SEO and AI visibility

### Sitemap

`sitemap.xml` contains 47 URLs covering all public pages and all 40 blog posts.
Internal tool pages (`dan-audit`, `dan-questions`, `mission-auto-pitch`),
`thank-you`, and `/.templates/` are excluded.

### robots.txt

All crawlers allowed by default (`User-agent: * / Allow: /`) with specific
disallows for internal pages. Major AI crawlers are additionally listed
explicitly with `Allow: /`:

GPTBot · OAI-SearchBot · ClaudeBot · Claude-SearchBot · PerplexityBot ·
Google-Extended · Applebot-Extended · Amazonbot · CCBot

### llms.txt

`llms.txt` at the root provides a structured reading guide for AI assistants:
a one-paragraph description of the business, links to all core pages with
one-line descriptions, a link to the blog, and contact information.

### JSON-LD structured data

Every page carries structured data in `<script type="application/ld+json">` blocks:

| Page | Schema type(s) |
|------|----------------|
| `index` | `LocalBusiness` + `ProfessionalService`; `OfferCatalog` (3 services); `WebSite` |
| `services` | Three `Service` entries with `Offer` + `PriceSpecification` |
| `bundles` | `OfferCatalog` with bundle `Offer` entries |
| `about` | `AboutPage` with `Organization` + 3 `Person` team members |
| `faq` | `FAQPage` with all 10 `Question`/`Answer` pairs |
| `contact` | `ContactPage` |
| `blog` (hub) | `CollectionPage` + `BreadcrumbList` |
| Every blog post | `BlogPosting` + `BreadcrumbList` + `WebPage` with `SpeakableSpecification` |

### Canonical tags

`<link rel="canonical">` is present on all 6 core pages, the blog hub, and
every blog post. All canonical URLs use the clean form (no `.html`).

---

## Analytics

GTM container **GTM-N6MLQZFR** and GA4 property **G-D3746FRPDV** are loaded in
the `<head>` of every page (including blog hub and all 40 post pages, and the
master template). The GTM noscript iframe is in every `<body>` immediately after
the opening tag.

Conversion events fire from `thank-you.html` on successful form submission.

---

## API — Vercel serverless functions

**`api/lead.js`** — receives form POSTs from the site, validates required fields
(`email`, `source`), and creates or updates a GHL contact via the GHL v2 API
(`/contacts/`). Handles duplicates by tagging the existing record. Requires
`GHL_PIT_TOKEN` and optionally `GHL_LOCATION_ID` as Vercel env vars.

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

Any static file server works. The `.claude/launch.json` config runs:

```bash
python3 -m http.server 4173
# visit http://localhost:4173
```

**Note:** opening pages via `file://` will not work correctly for blog posts or
any page that references absolute asset paths (`/assets/…`). Always use a
local server.

---

## Conventions for future edits

### Clean URLs — no exceptions

All internal links, canonical tags, and sitemap entries use the clean URL form.
Never write `href="services.html"` or `href="/services/"`. Always `href="/services"`.
This applies in HTML, in `sitemap.xml`, and in any new code files.

### Nav and footer are duplicated per page

There is no shared templating layer. The nav and footer markup is copied
verbatim into every root page, the blog hub (`blog/index.html`), all 40 post
pages, and the master template (`.templates/blog-post.html`).

**When you change nav or footer, update every copy:**
- All 14 root `.html` files
- `blog/index.html`
- All 40 `blog/{slug}/index.html` files
- `.templates/blog-post.html`

Suggested workflow: edit `index.html` first, then copy-paste the changed block
into each other file.

Nav order: Services · Bundles · About · FAQ · Blog · Contact + "Book a Free
Consultation" CTA.

Footer legal row: Privacy Policy · Terms of Service · Sitemap (links to
`/privacy-policy`, `/terms-of-service`, `/sitemap-page`). The Sitemap link
points to the human-readable sitemap page; the XML sitemap for crawlers remains
at `/sitemap.xml`.

### JS files

`site.js` handles nav toggle, FAQ accordion, and smooth scroll. `lead-form.js`
handles form validation and submission to `api/lead`. Both are loaded with
`defer` at the bottom of `<body>`.

---

## Accessibility

- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`) on every page
- Skip-to-content link on every page
- `aria-expanded` / `aria-controls` on FAQ buttons and mobile nav
- `:focus-visible` outlines on every interactive element
- `prefers-reduced-motion` honored
- Color contrast: forest-on-cream and cream-on-forest both ≥ 7:1

---

## Browser support

Modern evergreen browsers (last 2 Chrome, Safari, Firefox, Edge versions).
Uses CSS custom properties, `clamp()`, CSS grid, and `defer` scripts — all
baseline since ~2020. No IE11 support.
