# Cloudflare Access — branded login assets

Assets for branding the sign-in experience on `leads.branchandrootconsulting.com` (gated by Cloudflare Access).

| File | What it is |
|---|---|
| `login-page.html` | Self-contained branded sign-in page (Fraunces + Source Sans 3, brand palette, responsive, WCAG-AA). |
| `wordmark.svg` | Standalone "Branch & Root Consulting" wordmark for the Cloudflare logo field. |
| `README.md` | This file — how Cloudflare Access customization *actually* works + the config kit. |

---

## ⚠️ Read this first — how Cloudflare Access login customization really works

The brief assumed you upload a full HTML file and Cloudflare injects the login form into a `<div id="cf-identity">`. **That is not how Cloudflare Access works.** Verified against Cloudflare's docs (2026-06):

- **Native Access *login* page** (Zero Trust → **Settings → Custom Pages → Access login page → Manage**) only lets you set: **organization name, a logo (image), header text, footer text, and a background color.** No custom HTML, no `cf-identity` div, no `{{IDENTITY_FORM}}` token.
- **Custom *HTML*** is only accepted on Access **block pages** (pasted into the dashboard) — and only on **Pay-as-you-go / Enterprise** Zero Trust plans. Our Access setup is on the **free** plan, so the block-page-HTML route isn't available yet.

So `login-page.html` is **not** uploaded to the login page directly. It's still valuable in three ways:

1. **Design spec / source of truth** — pull the exact colors, logo, and copy from it to fill the native login fields (the "config kit" below).
2. **Hostable portal page** — deploy it on Vercel (e.g. a friendly landing page) whose "Sign in to continue" button points at `https://leads.branchandrootconsulting.com`, which triggers Cloudflare Access. The page is fully functional this way.
3. **Block page (if you upgrade)** — paste it as a custom Access block page on a paid plan.

The `<div id="cf-identity">` is kept in the file (exactly once, per the brief's checklist) with a graceful branded fallback inside, so the card looks complete in every scenario.

---

## Native login config kit — paste these into Cloudflare's customizer

Zero Trust → **Settings → Custom Pages → Access login page → Manage**:

| Field | Value |
|---|---|
| Organization name | `Branch & Root Consulting` |
| Logo | upload `wordmark.svg` (or a PNG export — see note) |
| Background color | `#1B4332` (Deep Forest Green) |
| Header text | `Team access to the leads portal.` |
| Footer text | `Grounded in strategy. Automated for growth. · branchandrootconsulting.com` |

**Logo note:** `wordmark.svg` uses forest/moss text on a transparent background — ideal for Cloudflare's light login box. If you set a *dark* background that the logo sits directly on, ask for a cream (light-on-dark) variant. For a pixel-perfect raster logo, open `login-page.html` in a browser (it loads Fraunces) and export/screenshot the wordmark as a PNG.

---

## Brand tokens (locked)

| Token | Hex |
|---|---|
| Deep Forest Green | `#1B4332` |
| Moss Green | `#2D6A4F` |
| Warm Slate Gray | `#4A5568` |
| Soft Cream | `#F7F5F0` |

Fonts: **Fraunces** (display serif) + **Source Sans 3** (label/body) — the site-wide brand pairing.

## Accessibility / quality

- Contrast: cream on forest ≈ **10.2:1**; slate on cream ≈ **6.9:1** — both pass WCAG 2.1 AA. No pure black or pure white.
- Responsive at 375 / 768 / 1280 px. Single 300 ms entrance animation, disabled under `prefers-reduced-motion`.
- No external resources except the Google Fonts `<link>`. File well under 50 KB.
