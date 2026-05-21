# Branch and Root Consulting — Website

Static marketing site for **branchandrootconsulting.com**. Plain HTML, CSS, and
JS — no build step, no framework, no dependencies. Drop the files on any static
host (GoHighLevel, Cloudflare Pages, Netlify, Vercel, S3) and it runs.

---

## File map

```
Website/
├── index.html              # Home (funnel)
├── services.html           # Three services
├── packages.html           # Foundation vs Full Engine tiers
├── about.html              # Team + philosophy
├── faq.html                # Accordion of 10 Q&A
├── contact.html            # Lead form + direct contact
├── thank-you.html          # Post-submit landing — pixel/conversion lives here
├── 404.html                # Not Found
├── assets/
│   ├── css/tokens.css      # Brand variables + @font-face declarations
│   ├── css/site.css        # All component + page styles
│   ├── js/site.js          # Nav toggle, smooth scroll, FAQ accordion, form validation
│   ├── img/logo-badge.jpg  # Primary logo (used in nav, footer, About teaser)
│   ├── img/og-image.jpg    # Social share preview (1200×1200 from logo)
│   ├── img/favicon-32.png
│   ├── img/favicon-16.png
│   ├── img/apple-touch-icon.png
│   └── fonts/              # Self-hosted Fraunces + Source Sans 3
└── README.md               # This file
```

---

## Preview locally

Open `index.html` in any modern browser. Everything works from `file://` —
no server required.

For a more accurate test (form posts, relative paths), run a one-liner server:

```bash
cd "/Users/russgohl/Branch and Root/Code Projects/Website"
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Deploy to GoHighLevel

The simplest path: upload every file as-is to GHL's site/file hosting, then
point `branchandrootconsulting.com` DNS at the GHL site.

**Steps inside GHL:**

1. Sites → Websites → New Website → start blank.
2. Use the **Custom Code / Import** option if available, or copy each page's
   HTML into a GHL custom-HTML block.
3. Upload `assets/` directory wholesale to GHL's media library — keep the
   folder structure intact so relative paths (`assets/css/site.css`,
   `assets/img/logo-badge.jpg`) still resolve.
4. Set `index.html` as the homepage.
5. Configure DNS for `branchandrootconsulting.com` per GHL's domain-connection
   instructions.

> **Alternative:** if GHL feels restrictive, host on Cloudflare Pages or Netlify
> for free (drag-and-drop the whole folder) and just point the DNS at them.
> Both give you HTTPS automatically.

---

## Things to swap before launch

These were left as deliberate placeholders during the build. Each is a small,
contained edit.

### 1. Contact form destination — `contact.html`

Current form has `action="#"` and routes to `thank-you.html` via JS for demo
purposes. To wire it up:

```html
<!-- Line ~70 of contact.html — change action attribute -->
<form class="contact-form" id="lead-form"
      action="https://YOUR-GHL-FORM-ENDPOINT-HERE"
      method="POST" novalidate>
```

If using a GHL form widget instead, replace the entire `<form>…</form>` block
with the GHL embed code. Keep the surrounding `<aside class="contact-details">`
panel intact.

### 2. Booking calendar — every "Book Your Free Consultation" button

Today, every CTA points to `contact.html`. To add an actual calendar:

- **Option A — embed inside Contact page.** Add the GHL calendar iframe at the
  top of `contact.html`'s form section.
- **Option B — global modal.** Add the iframe inside a `<dialog>` in each page
  and change the CTAs from `href="contact.html"` to a button that opens it.
  Tell me if you want this and I'll wire it up.

### 3. Conversion tracking — `thank-you.html`

There's an HTML comment near the top of `<head>`:

```html
<!-- ===== CONVERSION TRACKING =====
     Drop your conversion / pixel snippet here once you have one.
-->
```

Paste your Meta Pixel `Lead` event, Google Ads conversion tag, or GHL pixel
fire there. Fires once per successful submission.

### 4. Testimonials — `index.html`

Hidden as an HTML comment block (search for `TESTIMONIALS — HIDDEN ON LAUNCH`).
When real client quotes exist, uncomment the block and replace the example card
markup. Per copy guide: lead with specific numbers, timelines, and city names —
generic praise underperforms.

### 5. Team photos — `about.html`

Each team member currently shows a forest-green monogram circle (RS, MS, RJ,
MJ). To swap in real headshots:

```html
<!-- Replace this -->
<div class="monogram" aria-hidden="true">RS</div>

<!-- With this -->
<img class="monogram" src="assets/img/team/russ-sr.jpg" alt="Russ Sr." width="110" height="110" />
```

Square crop at ~400×400px works best. Drop the files into `assets/img/team/`.

### 6. Phone number

Intentionally omitted. To add: edit the `<aside class="contact-details">` block
in `contact.html` and the footer `<p>` block in every page.

---

## Editing copy

The site is plain HTML — open any page in a text editor and edit.

Brand voice rules (from `BRANCH.md` §9): authoritative + warm, direct, no
buzzword agency-speak, no flowery metaphor. South OC city names should appear
at least 3 times per page (Mission Viejo, Rancho Santa Margarita, Ladera Ranch,
Aliso Viejo, San Clemente).

### Editing the nav or footer

The nav and footer markup is **identical across all 8 pages**. If you change
one, change all of them. Suggested workflow: edit the block in `index.html`,
then copy-paste over the matching block in each other page.

---

## Brand tokens

All colors, type sizes, and spacing live in `assets/css/tokens.css`. Change
them once and the whole site updates. The locked palette (from `BRANCH.md`):

| Token            | Hex       | Role                              |
| ---------------- | --------- | --------------------------------- |
| `--forest`       | `#1B4332` | Primary (buttons, headlines)      |
| `--moss`         | `#2D6A4F` | Highlight (eyebrows, hover state) |
| `--cream`        | `#F7F5F0` | Page background                   |
| `--slate`        | `#4A5568` | Secondary text                    |

Type: `Fraunces` (display serif) + `Source Sans 3` (body sans), both
self-hosted as variable `woff2` in `assets/fonts/`. No Google Fonts request.

---

## Browser support

Designed for modern evergreen browsers (last 2 versions of Chrome, Safari,
Firefox, Edge). Uses CSS custom properties, `clamp()`, CSS grid, and ES
modules — all supported in browsers from ~2020 onward. No IE11.

---

## Accessibility

- Semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Skip-to-content link on every page
- All interactive elements ≥ 44×44px tap target
- `aria-expanded` / `aria-controls` on FAQ buttons and mobile nav
- `:focus-visible` outlines on every interactive element
- Color contrast: forest-on-cream and cream-on-forest both ≥ 7:1
- `prefers-reduced-motion` honored

---

## Performance

- Self-hosted fonts (no third-party request)
- `font-display: swap` and `<link rel="preload">` on both font files
- Logo loaded eagerly at small sizes; About-teaser image is `loading="lazy"`
- No JavaScript dependencies — `site.js` is < 3 KB
- Inline SVG icons (no icon font)
