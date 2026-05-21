# Design Decisions — Branch & Root Consulting Redesign

A short note explaining the visual layer of the redesign. All copy, IA, file
names, and JS behavior are preserved 1:1 with the existing repo — only the
presentation has changed.

## The signature element: **The Horizon**

A 1px hairline rule with a small filled forest-green dot at its center and a
14px vertical tick descending below the dot. It is a literal abstraction of
the canopy/root division line in the logo — the moment the tree splits into
"above" and "below."

You will find it:

- **Beneath every hero** — visually anchoring the H1
- **Above every page's location stamp** (e.g. `— Mission Viejo · RSM · Ladera Ranch · Aliso Viejo · San Clemente`), which now appears at the foot of every major section as a recurring South OC promise
- **Spanning the About page** as the actual horizon dividing **The Branches**
  (sons, lighter italic serif, above) from **The Roots** (fathers, heavier
  upright serif, below) — echoing the logo's structure
- **In the CTA banner** of every page, just above the city-list footnote
- **In dark mode** the dot becomes moss-light against a darker hairline

CSS class: `.horizon`. Use it wherever you want a Branch & Root mark.
The team-section variant is `.tree-divider` (full-bleed).

## Editorial layout primitives

| Class | What it does |
| --- | --- |
| `.eyebrow` | Small-caps section label with a 28px leading rule |
| `.annotation` | Tiny small-caps marginal label, used for "— A note from us" callouts and the South OC location stamp |
| `.pull-quote` | Hanging quote-mark editorial block |
| `.dropcap` | Apply to a body container; first paragraph gets a 5.4em Fraunces drop cap |
| `.gutter-numeral` | Oversized faded numeral (Fraunces 300) for hero/section gutters — used as `01`, `02`, `03` ghosts behind services and `&` behind the bridge |
| `.accent-italic` | Italic in moss-green for emphasis inside headings |

## Type

Stayed with **Fraunces** + **Source Sans 3** — both already self-hosted and
brand-approved. The change is *how* they're used:

- Display sizes scale up to `clamp(2.75rem, 1.6rem + 6vw, 7rem)` (was capped at 4.5rem).
- Body bumped to **17px / 1.65 line-height** for editorial breathing.
- Italic Fraunces is used as **emphasis on emotional words** in every H1 —
  *earned*, *response*, *honest*, *together*, *in person*. Each page has 2–4
  italic accents that drive the rhythm.
- Eyebrows lead with a hairline rule and are spaced at `0.22em`.

No new fonts are downloaded.

## Color

Brand palette is **locked**. Two additions only:

| Token | Value | Purpose |
| --- | --- | --- |
| `--paper` | `#EFEADB` | A duskier cream for cards/sidebars on the cream page background, so surfaces register without going stark white |
| `--ink-warm` | `#1F1B16` | Body text with slightly more warmth than pure ink |
| `--line-hair` | `#C9C0AA` | The Horizon's hairline color |

Dark mode is unchanged in strategy — deep forest backgrounds, cream type,
moss accents — but every editorial primitive has explicit dark-mode rules so
nothing reads weird at night. Forest hero/CTA/footer bands stay forest in both
modes (as before).

## Page-specific notes

- **Home hero** — Two-column asymmetric grid: H1 on the left (9 of 12 cols),
  marginal "A note from us" pull-quote on the right (3 of 12). The Horizon
  anchors the foot of the hero with the city stamp.
- **Services** — Each of the three services is a full editorial "spec block"
  with a giant ghosted gutter numeral (`01`, `02`, `03`) bleeding off the right
  edge. The right-hand sidebar is now a **Spec Sheet** card (typed in
  small-caps) with timeline/result/investment laid out like an architectural
  spec.
- **Packages** — The two packages sit **side-by-side** with a single vertical
  hairline between them (think magazine center gutter). Pricing is presented
  as oversized editorial numerals (`$2,500`, `$3,500`) at clamp scale up to
  5rem. No "card" container — it's a spread, not a pricing table.
- **About** — Replaced the four-card team grid with a vertical composition:
  Philosophy spread → **The Branches** (sons) above the horizon line in
  lighter italic serif → full-bleed Horizon divider → **The Roots** (fathers)
  below the horizon in heavier upright serif. The line itself is the page's
  signature moment.
- **FAQ** — Two-column grid for each Q (small-caps `Q.01` index on the left,
  question on the right). The toggle is a 32px circular `+` that rotates 45°
  and fills with forest on open.
- **Contact** — Form fields are now **underline-only** inputs with Fraunces
  display-weight values, paired on two columns. The form looks like a
  letterpress card, not a SaaS form.
- **404** — Massive `4` `0` `4` numeral where the digits are italic and the
  zero is upright — a small typographic joke that announces the brand voice
  even on a fallback page.

## What I'd commission to push it the last 10%

1. **A custom illustrated tree-and-roots SVG** for the home hero — a
   subtle, hand-drawn line illustration positioned behind the H1 (low
   opacity, off-axis right). It would make the hero unmistakably yours
   without ever asking for a stock photo. ~1 day from a freelance line
   illustrator with editorial sensibility.
2. **Real local photography** — 4–6 photos of the actual SoCal places the
   brand calls out: a porch in Ladera Ranch, the Mission Viejo lake, a
   neighborhood shop street in San Clemente. Treat them muted/warm in
   post. Drop one into the About page's Local Commitment section and one
   into the home About teaser (replacing the badge frame in the asymmetric
   half).
3. **Headshots of all four team members** — photographed warmly, square
   crop, available cropped to circles. They would replace the monogram
   tiles on the About page entirely and become the first piece of
   genuine evidence that "you can shake our hands in person."
4. **A single hand-drawn tree-of-divider SVG mark** that you could use in
   place of the CSS-drawn Horizon — same form, but with a hint of organic
   irregularity (like it was inked, not engineered). The CSS version is the
   default and shipping-ready; the SVG version would be a brand-elevation
   upgrade.

## Accessibility & performance

- Semantic HTML throughout (`<main>`, `<article>`, `<aside>`, `<nav>`,
  `<button>`).
- All body text ≥ 4.5:1 contrast against its background in both light and
  dark modes (verified against `--ink-warm` on `--cream` and `--ECE5D0` on
  `--0F1B14`).
- All tap targets ≥ 44×44 px (buttons are 48px min-height; FAQ toggle is
  32px but inside a full-width 60px+ click region).
- Focus rings use `outline: 2px solid var(--moss-light)` with offset.
- `prefers-reduced-motion` shuts down transitions.
- No JS libraries. No web font services. No analytics in source.
- Fonts preloaded; both files are the same variable woff2 already in the
  repo, so no new asset weight.
- CSS is one file (~28KB minified estimate) and so is JS (~5KB).
  Lighthouse ≥ 95 is comfortably reachable.

## What did NOT change

- File names: `index.html`, `services.html`, `packages.html`, `about.html`,
  `faq.html`, `contact.html`, `thank-you.html`, `404.html` — drop in as-is.
- Page copy — every word is preserved.
- Form `action="#"` placeholder routing to `thank-you.html` is preserved
  (swap to your GHL endpoint when ready).
- JS behavior: sticky header, mobile nav, FAQ accordion, form validation,
  active-nav highlighting. Same APIs, same selectors.
- Font files (`fraunces-variable.woff2`, `source-sans-3-variable.woff2`),
  logo PNGs, favicons, OG image — all reused.

— End of note.
