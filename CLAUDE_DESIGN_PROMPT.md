# Claude Design Prompt — Branch & Root Consulting Redesign

Paste everything below the `---` line into Claude Design verbatim. Before
pasting, fill in the **[USER ADDS]** slot near the bottom with 2–4 reference
URLs you want to anchor toward (and optionally 1–2 to avoid).

---

**Project:** Redesign the UI for `branchandrootconsulting.com`, a
multi-generational South Orange County consulting agency for local service
businesses (HVAC, plumbing, dental, salons, landscapers). The current site
ships and works — I want a more premium, distinctive visual layer over the
same information architecture and copy.

**Repo:** <https://github.com/RussGohl613/BranchAndRootWebsite> — all current
HTML/CSS/JS lives there. The 6 main pages are Home, Services, Packages,
About, FAQ, Contact. There are also `thank-you.html` and `404.html`.

---

## Brand voice (one paragraph)

Authoritative without arrogance. Warm without softness. Premium without
pretension. The voice of a trusted advisor talking across a kitchen table —
not a marketer talking at a screen. South OC identity is woven in by name
(Mission Viejo, Rancho Santa Margarita, Ladera Ranch, Aliso Viejo, San
Clemente). The brand metaphor is in the name itself: **The Roots** are the
two fathers (operational depth, financial integrity, decades of business
experience). **The Branches** are the two sons (automation, growth,
modern infrastructure). Roots and branches — foundation and growth.

---

## Locked brand inputs (do not change)

- **Logo:** circular forest-green badge with cream tree-and-roots mark. The
  tree shows both a full leaf canopy above and a mirrored root system below,
  separated by a horizontal line. PNG with transparent ring is at
  `assets/img/logo-badge.png`.
- **Colors (from brand guide):**
  - Deep Forest Green `#1B4332` — primary
  - Moss Green `#2D6A4F` — highlight / accent
  - Soft Cream `#F7F5F0` — page background (light mode)
  - Warm Slate `#4A5568` — secondary text
- **Typography pairing:** display serif + humanist sans. Currently `Fraunces`
  + `Source Sans 3`. Open to swaps for a stronger editorial feel (e.g. a
  weightier serif). **Do NOT use Inter, Roboto, or system fonts** — the
  brand guide explicitly excludes those.
- **Light and dark mode** both required via `prefers-color-scheme`. Dark
  mode should feel like the same brand at night: deep-forest backgrounds,
  cream type, moss accents. Forest hero/CTA bands stay forest in both modes.

---

## Design mood — editorial / magazine

I want this site to read like an editorial spread, not a SaaS landing page.
Think:

- **Big, confident serif headlines** — type as a visual element, not just
  information. Generous tracking adjustments. Italic accents on key phrases.
- **Generous whitespace** — let sections breathe. No grid feels cramped.
- **Asymmetric layouts** — not everything centered. Lean into off-axis
  composition, hanging quote marks, drop caps, hanging numerals.
- **Typographic storytelling** — pull quotes, sectional eyebrows in
  small-caps, marginal annotations.
- **Photo-driven storytelling moments** — even when the photos aren't yet
  available (placeholders are fine), design as if real local SoCal photography
  will go there. Hint at where editorial photography belongs.

Canonical anchors for the mood:

- **aesop.com** — premium serif typography, generous space, restrained palette
- **archdigest.com** / **nytimes.com** — editorial hierarchy, drop caps,
  asymmetric compositions
- **apartamentomagazine.com** — warm intimacy, magazine-like sections

[USER ADDS] — additional inspiration URLs the user has sent me:

- _Paste 2–4 URLs here once Russ sends them_

---

## Explicitly avoid

- Generic agency-template look (centered hero, three feature cards, three
  testimonials, CTA banner — this is what the current site is, and we want
  to break from it)
- Bootstrap / Tailwind UI default components
- SaaS-flat dashboards (Stripe, Linear, Vercel-style hero with gradient glow)
- Corporate consulting (McKinsey-style stock-photo headers)
- Brutalist / experimental layouts that sacrifice readability for novelty —
  this is a trust-driven local-business site, not a portfolio

[USER ADDS] — additional URLs the user explicitly wants to avoid:

- _Paste 1–2 URLs here if applicable_

---

## What I want from the redesign

1. **More distinctive hero treatments** — the current hero is a forest
   background with cream text. Functional but generic. I want something
   that says "this brand has a point of view." Consider: a textured /
   illustrated background using the tree-and-roots motif; an oversized
   number or quote; asymmetric type composition with the H1 spanning
   columns; a layered organic shape behind the H1; a marginal note or
   pull-quote running alongside.

2. **Stronger sense of "two generations working together"** — somewhere in
   the visual system, communicate the Roots/Branches duality. On the About
   page especially, the four team profiles should feel like a story, not a
   grid. Consider: a horizontal scroll-narrative; The Roots / The Branches
   shown in mirrored composition (canopy above, roots below, echoing the
   logo); typographic distinction between generations (Roots in heavier
   serif, Branches in lighter weight, or similar).

3. **More premium feel on the Packages page** — the current Foundation /
   Full Engine cards are clean but agency-template. I want them to feel
   like architectural specs or editorial spec sheets, not pricing tiles.
   Consider: a left-column "Foundation" / right-column "Full Engine"
   side-by-side spread; serif headlines with body copy set in editorial
   columns; pricing presented as typography (oversized numerals) rather
   than as a table cell.

4. **A signature element** that becomes recognizable — a custom underline,
   a recurring shape, a typography quirk, a section-divider pattern. One
   thing across the whole site that's just Branch & Root's. Examples that
   would work: a stylized horizontal line that nods to the canopy/root
   division in the logo; a custom drop-cap treatment used at the start of
   each section's body copy; a marginal "small-caps location stamp"
   (`— Mission Viejo, CA`) that recurs at the bottom of major sections.

---

## Constraints

- Must remain a **static HTML/CSS/JS site** (no React/Next/build step). The
  current site deploys by file upload into GoHighLevel.
- Must preserve the **exact copy** on every page — the wording is locked
  per the brand guide. Layout, hierarchy, and presentation are open.
- **Accessibility floor:** semantic HTML, ≥ 4.5:1 contrast on body text,
  ≥ 44×44px tap targets, focus rings, `prefers-reduced-motion` honored.
- **Performance:** target Lighthouse ≥ 95 on the homepage. No bloat libs.
- **South OC city names** (Mission Viejo, Rancho Santa Margarita, Ladera
  Ranch, Aliso Viejo, San Clemente) should appear at least 3× per page —
  they're part of the brand promise.

---

## What's in the repo right now (so you have a baseline)

- 8 HTML pages with full locked copy in place
- `assets/css/tokens.css` — design tokens (colors, type, spacing) with
  light + dark mode and a `--cream-fixed` token for always-forest sections
- `assets/css/site.css` — all component styles
- `assets/js/site.js` — mobile nav, smooth scroll, FAQ accordion, form
  validation in vanilla JS (~3 KB, loaded with `defer`)
- Self-hosted Fraunces + Source Sans 3 variable woff2 fonts
- Logo (transparent PNG + favicons + OG image)

---

## Deliverable I want back

A redesigned set of HTML + CSS files I can drop straight into the repo.
Keep the same file names so I can swap them in cleanly:

- `index.html`, `services.html`, `packages.html`, `about.html`, `faq.html`,
  `contact.html`, `thank-you.html`, `404.html`
- `assets/css/tokens.css` and `assets/css/site.css` (replace mine)
- Any new fonts: add to `assets/fonts/` (self-hosted woff2 only) and
  reference in tokens.css

Include a short **"Design Decisions"** note explaining:
- The signature element and where it appears
- Any new type, color, or spacing token additions
- The redesigned dark mode strategy
- Anything you'd recommend I commission (e.g. specific photography, an
  illustrated tree-and-roots SVG for the hero) to push it the last 10%
