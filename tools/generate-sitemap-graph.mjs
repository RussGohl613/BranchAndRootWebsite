#!/usr/bin/env node
/* ==========================================================================
   Branch and Root Consulting — Sitemap graph generator
   Regenerates the precomputed SVG inside sitemap-page.html.

   Layout: a SEEDED force-directed (spring-electrical) simulation, run here
   at build time and baked into static coordinates. Home and Guides are two
   connected hubs; each of the 7 category clusters and the Home cluster repel
   one another so they spread organically across the whole canvas (no more
   left-side crowding). Related-article links ("Related Articles" on every
   post) are emitted as faint dashed curves — the idea-level connections a
   plain file graph can't show. After the simulation settles, the whole
   layout is fit-to-viewBox so it always fills the frame evenly, and labels
   are placed radially OUTWARD from each node's cluster so titles splay into
   open space instead of stacking.

   The simulation is deterministic: a fixed PRNG seed means re-running
   produces byte-identical output (stable git diffs). Tweak FORCE/SEED to
   reshape the layout.

   Run:  node tools/generate-sitemap-graph.mjs
   Then commit the updated sitemap-page.html. Draft posts (noindex) are
   intentionally excluded — update PUBLISHED data below when posts launch.
   ========================================================================== */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = join(ROOT, 'sitemap-page.html');

/* ---- Data ------------------------------------------------------------- */

const CATEGORIES = [
  { id: 'cat-perf',     name: 'Performance & Metrics' },
  { id: 'cat-costs',    name: 'Costs & Compensation' },
  { id: 'cat-tools',    name: 'Tools & Tactics' },
  { id: 'cat-leadfund', name: 'Lead Gen Fundamentals' },
  { id: 'cat-hiring',   name: 'Hiring Decisions' },
  { id: 'cat-finding',  name: 'Finding & Vetting Talent' },
  { id: 'cat-industry', name: 'Industry & Strategy' },
];

const POSTS = [
  // cat-hiring
  ['cat-hiring', 'hire-lead-gen-agency-vs-sales-team', "Should I Hire a Lead Gen Agency or a Sales Team Member?"],
  ['cat-hiring', 'what-to-look-for-in-lead-generation-expert', "What to Look for When Hiring a Lead Generation Expert"],
  ['cat-hiring', 'is-a-lead-gen-agency-right-for-my-company', "How Do I Know If a Lead Generation Agency Is Right for My Company?"],
  ['cat-hiring', 'fractional-lead-generation-specialist', "Should I Hire a Fractional Lead Generation Specialist?"],
  ['cat-hiring', 'part-time-lead-generation-hire', "Can I Hire a Lead Generation Person Part-Time?"],
  ['cat-hiring', 'lead-gen-remote-vs-in-office', "Lead Generation Hiring: Remote vs. In-Office?"],
  ['cat-hiring', 'lead-generation-as-a-career', "Is Lead Generation a Good Career Path?"],
  ['cat-hiring', 'experience-level-for-lead-gen-hire', "How Much Experience Should a Lead Gen Hire Have?"],
  ['cat-hiring', 'should-lead-gen-hire-also-do-sales', "Should My Lead Gen Hire Also Do Sales?"],
  // cat-costs
  ['cat-costs', 'cost-to-hire-lead-generation-specialist', "How Much Does It Cost to Hire a Lead Generation Specialist?"],
  ['cat-costs', 'lead-generation-salary-guide', "Lead Generation Salary: What Should I Pay?"],
  ['cat-costs', 'commission-pay-for-lead-generation', "Should I Offer Commission-Based Pay for Lead Generation?"],
  // cat-finding
  ['cat-finding', 'lead-generation-problem-vs-sales-problem', "Do I Have a Lead Generation Problem or a Sales Problem?"],
  ['cat-finding', 'find-qualified-lead-generation-professionals', "How to Find Qualified Lead Generation Professionals"],
  ['cat-finding', 'questions-to-ask-when-hiring-lead-gen', "What Questions Should I Ask When Hiring a Lead Gen Specialist?"],
  ['cat-finding', 'how-to-qualify-leads-best-practices', "How to Qualify Leads: Best Practices for Your Business"],
  ['cat-finding', 'red-flags-when-hiring-lead-gen-specialist', "Red Flags to Avoid When Hiring a Lead Generation Specialist"],
  ['cat-finding', 'job-description-for-lead-generation-role', "How to Write a Job Description for a Lead Generation Role"],
  // cat-leadfund
  ['cat-leadfund', 'qualified-lead-vs-unqualified-lead', "What Makes a Qualified Lead vs. an Unqualified Lead?"],
  ['cat-leadfund', 'lead-generation-vs-sales', "Lead Generation vs. Sales: What's the Difference?"],
  ['cat-leadfund', 'lead-generation-vs-lead-qualification', "What's the Difference Between Lead Generation and Lead Qualification?"],
  ['cat-leadfund', 'what-does-lead-gen-specialist-do-daily', "What Does a Lead Generation Specialist Actually Do Day-to-Day?"],
  ['cat-leadfund', 'best-way-to-contact-leads', "What's the Best Way to Contact Leads?"],
  // cat-tools
  ['cat-tools', 'linkedin-sales-navigator-for-lead-generation', "How to Use LinkedIn Sales Navigator for Lead Generation"],
  ['cat-tools', 'attract-inbound-leads-vs-outbound-hiring', "How to Attract Inbound Leads Instead of Hiring for Outbound"],
  ['cat-tools', 'tools-professional-lead-generators-use', "What Tools Do Professional Lead Generators Use?"],
  ['cat-tools', 'how-to-find-leads-on-linkedin', "How to Find Leads Using LinkedIn for Your Sales Team"],
  // cat-perf
  ['cat-perf', 'how-long-to-see-results-from-lead-gen-hire', "How Long Does It Take to See Results From a Lead Generation Hire?"],
  ['cat-perf', 'how-many-leads-is-your-business-losing', "How Many Leads Does Your Business Lose per Month?"],
  // cat-industry
  ['cat-industry', 'lead-generation-for-b2b-hiring-guide', "Lead Generation for B2B: What's Different About Hiring?"],
  ['cat-industry', 'industries-that-benefit-from-lead-generators', "What Industries Benefit Most From Hiring Lead Generators?"],
  ['cat-industry', 'lead-gen-agency-vs-freelancer', "Lead Generation Agency vs. Freelancer: Which Is Better?"],
  ['cat-industry', 'how-to-train-lead-generation-hire', "How to Train a New Lead Generation Hire"],
  ['cat-industry', 'how-to-qualify-b2b-leads', "How to Qualify B2B Leads Effectively"],
  ['cat-industry', 'lead-generation-for-startups', "Lead Generation for Startups: How to Start?"],
];

// "Related Articles" links between published posts (directed source order,
// deduped to undirected below). Extracted from each post's related-posts
// aside; draft posts (noindex) excluded.
const RELATED = [
  ['attract-inbound-leads-vs-outbound-hiring', 'tools-professional-lead-generators-use'],
  ['attract-inbound-leads-vs-outbound-hiring', 'how-to-find-leads-on-linkedin'],
  ['attract-inbound-leads-vs-outbound-hiring', 'how-many-leads-is-your-business-losing'],
  ['best-way-to-contact-leads', 'qualified-lead-vs-unqualified-lead'],
  ['best-way-to-contact-leads', 'what-does-lead-gen-specialist-do-daily'],
  ['best-way-to-contact-leads', 'how-many-leads-is-your-business-losing'],
  ['commission-pay-for-lead-generation', 'lead-generation-salary-guide'],
  ['commission-pay-for-lead-generation', 'cost-to-hire-lead-generation-specialist'],
  ['commission-pay-for-lead-generation', 'how-long-to-see-results-from-lead-gen-hire'],
  ['cost-to-hire-lead-generation-specialist', 'lead-generation-salary-guide'],
  ['cost-to-hire-lead-generation-specialist', 'hire-lead-gen-agency-vs-sales-team'],
  ['experience-level-for-lead-gen-hire', 'what-to-look-for-in-lead-generation-expert'],
  ['experience-level-for-lead-gen-hire', 'lead-generation-as-a-career'],
  ['experience-level-for-lead-gen-hire', 'questions-to-ask-when-hiring-lead-gen'],
  ['find-qualified-lead-generation-professionals', 'questions-to-ask-when-hiring-lead-gen'],
  ['find-qualified-lead-generation-professionals', 'red-flags-when-hiring-lead-gen-specialist'],
  ['find-qualified-lead-generation-professionals', 'what-to-look-for-in-lead-generation-expert'],
  ['fractional-lead-generation-specialist', 'hire-lead-gen-agency-vs-sales-team'],
  ['fractional-lead-generation-specialist', 'part-time-lead-generation-hire'],
  ['fractional-lead-generation-specialist', 'cost-to-hire-lead-generation-specialist'],
  ['hire-lead-gen-agency-vs-sales-team', 'is-a-lead-gen-agency-right-for-my-company'],
  ['how-long-to-see-results-from-lead-gen-hire', 'how-many-leads-is-your-business-losing'],
  ['how-long-to-see-results-from-lead-gen-hire', 'lead-generation-problem-vs-sales-problem'],
  ['how-long-to-see-results-from-lead-gen-hire', 'hire-lead-gen-agency-vs-sales-team'],
  ['how-many-leads-is-your-business-losing', 'how-to-qualify-leads-best-practices'],
  ['how-many-leads-is-your-business-losing', 'lead-generation-problem-vs-sales-problem'],
  ['how-to-find-leads-on-linkedin', 'linkedin-sales-navigator-for-lead-generation'],
  ['how-to-find-leads-on-linkedin', 'best-way-to-contact-leads'],
  ['how-to-qualify-b2b-leads', 'lead-generation-for-b2b-hiring-guide'],
  ['how-to-qualify-b2b-leads', 'how-to-qualify-leads-best-practices'],
  ['how-to-qualify-b2b-leads', 'lead-generation-vs-lead-qualification'],
  ['how-to-qualify-leads-best-practices', 'lead-generation-problem-vs-sales-problem'],
  ['how-to-qualify-leads-best-practices', 'questions-to-ask-when-hiring-lead-gen'],
  ['how-to-qualify-leads-best-practices', 'qualified-lead-vs-unqualified-lead'],
  ['how-to-train-lead-generation-hire', 'how-long-to-see-results-from-lead-gen-hire'],
  ['how-to-train-lead-generation-hire', 'what-does-lead-gen-specialist-do-daily'],
  ['how-to-train-lead-generation-hire', 'job-description-for-lead-generation-role'],
  ['industries-that-benefit-from-lead-generators', 'how-long-to-see-results-from-lead-gen-hire'],
  ['industries-that-benefit-from-lead-generators', 'lead-generation-for-b2b-hiring-guide'],
  ['industries-that-benefit-from-lead-generators', 'is-a-lead-gen-agency-right-for-my-company'],
  ['is-a-lead-gen-agency-right-for-my-company', 'lead-generation-problem-vs-sales-problem'],
  ['is-a-lead-gen-agency-right-for-my-company', 'how-many-leads-is-your-business-losing'],
  ['job-description-for-lead-generation-role', 'find-qualified-lead-generation-professionals'],
  ['job-description-for-lead-generation-role', 'questions-to-ask-when-hiring-lead-gen'],
  ['job-description-for-lead-generation-role', 'lead-generation-salary-guide'],
  ['lead-gen-agency-vs-freelancer', 'hire-lead-gen-agency-vs-sales-team'],
  ['lead-gen-agency-vs-freelancer', 'red-flags-when-hiring-lead-gen-specialist'],
  ['lead-gen-agency-vs-freelancer', 'is-a-lead-gen-agency-right-for-my-company'],
  ['lead-gen-remote-vs-in-office', 'fractional-lead-generation-specialist'],
  ['lead-gen-remote-vs-in-office', 'how-many-leads-is-your-business-losing'],
  ['lead-gen-remote-vs-in-office', 'what-to-look-for-in-lead-generation-expert'],
  ['lead-generation-as-a-career', 'lead-generation-salary-guide'],
  ['lead-generation-as-a-career', 'hire-lead-gen-agency-vs-sales-team'],
  ['lead-generation-for-b2b-hiring-guide', 'hire-lead-gen-agency-vs-sales-team'],
  ['lead-generation-for-b2b-hiring-guide', 'what-to-look-for-in-lead-generation-expert'],
  ['lead-generation-for-startups', 'hire-lead-gen-agency-vs-sales-team'],
  ['lead-generation-for-startups', 'lead-generation-problem-vs-sales-problem'],
  ['lead-generation-for-startups', 'how-long-to-see-results-from-lead-gen-hire'],
  ['lead-generation-problem-vs-sales-problem', 'find-qualified-lead-generation-professionals'],
  ['lead-generation-problem-vs-sales-problem', 'hire-lead-gen-agency-vs-sales-team'],
  ['lead-generation-salary-guide', 'experience-level-for-lead-gen-hire'],
  ['lead-generation-vs-lead-qualification', 'qualified-lead-vs-unqualified-lead'],
  ['lead-generation-vs-lead-qualification', 'lead-generation-vs-sales'],
  ['lead-generation-vs-lead-qualification', 'how-to-qualify-leads-best-practices'],
  ['lead-generation-vs-sales', 'what-does-lead-gen-specialist-do-daily'],
  ['lead-generation-vs-sales', 'lead-generation-problem-vs-sales-problem'],
  ['linkedin-sales-navigator-for-lead-generation', 'attract-inbound-leads-vs-outbound-hiring'],
  ['linkedin-sales-navigator-for-lead-generation', 'tools-professional-lead-generators-use'],
  ['part-time-lead-generation-hire', 'how-to-train-lead-generation-hire'],
  ['part-time-lead-generation-hire', 'hire-lead-gen-agency-vs-sales-team'],
  ['qualified-lead-vs-unqualified-lead', 'best-way-to-contact-leads'],
  ['questions-to-ask-when-hiring-lead-gen', 'red-flags-when-hiring-lead-gen-specialist'],
  ['questions-to-ask-when-hiring-lead-gen', 'experience-level-for-lead-gen-hire'],
  ['red-flags-when-hiring-lead-gen-specialist', 'what-to-look-for-in-lead-generation-expert'],
  ['what-to-look-for-in-lead-generation-expert', 'questions-to-ask-when-hiring-lead-gen'],
  ['should-lead-gen-hire-also-do-sales', 'lead-generation-vs-sales'],
  ['should-lead-gen-hire-also-do-sales', 'hire-lead-gen-agency-vs-sales-team'],
  ['should-lead-gen-hire-also-do-sales', 'lead-generation-problem-vs-sales-problem'],
  ['tools-professional-lead-generators-use', 'cost-to-hire-lead-generation-specialist'],
  ['what-does-lead-gen-specialist-do-daily', 'tools-professional-lead-generators-use'],
  ['what-percentage-of-leads-should-convert', 'how-many-leads-is-your-business-losing'], // draft source — dropped below
];

const T1 = [
  { id: 'services', name: 'Services', href: '/services' },
  { id: 'bundles',  name: 'Bundles',  href: '/bundles' },
  { id: 'about',    name: 'About',    href: '/about' },
  { id: 'faq',      name: 'FAQ',      href: '/faq' },
  { id: 'book',     name: 'Book',     href: '/book' },
  { id: 'contact',  name: 'Contact',  href: '/contact' },
];
const LEGAL = [
  { id: 'privacy', name: 'Privacy Policy',   href: '/privacy-policy' },
  { id: 'terms',   name: 'Terms of Service', href: '/terms-of-service' },
];

/* ---- Layout / force constants ------------------------------------------ */

const VB = { w: 1400, h: 1040 };

const R_NODE = { home: 30, guides: 22, t1: 13, legal: 9, cat: 12, post: 7 };
const R_HIT  = { home: 38, guides: 30, t1: 23, legal: 17, cat: 22, post: 14 };
const MASS   = { home: 3.0, guides: 2.2, cat: 1.5, t1: 1.1, legal: 0.85, post: 1.0 };

// Spring rest lengths + stiffness per edge type. Relative values set the
// SHAPE; absolute scale is irrelevant (fit-to-viewBox rescales at the end).
const SPRING = {
  'home-guides': { L: 360, k: 0.055 },
  'home-t1':     { L: 122, k: 0.060 },
  'home-legal':  { L: 104, k: 0.060 },
  'guides-cat':  { L: 165, k: 0.055 },
  'cat-post':    { L: 74,  k: 0.075 },
  'xlink':       { L: 165, k: 0.011 },  // related-article pull — deliberately weak
};

const FORCE = {
  rep: 6600,        // Coulomb repulsion strength (× mass·mass / d²)
  // Elliptical gravity: weaker horizontally than vertically, so the cloud
  // settles into a WIDE shape that matches the 1400×1040 frame (otherwise the
  // graph is near-square and the fit leaves big empty margins left and right).
  gravityX: 0.0125,
  gravityY: 0.026,
  iters: 720,
  temp0: 105,       // initial max step (px) per iteration
  cool: 0.9905,     // geometric cooling factor
  seed: process.env.SG_SEED ? (Number(process.env.SG_SEED) >>> 0) : 777, // fixed PRNG seed → deterministic, byte-stable output (chosen to minimise label overlap)
};

const POST_LABEL_GAP = 13;   // px from article dot to label start
const POST_LABEL_MAX = 30;   // truncate article labels to this length

/* ---- Helpers ------------------------------------------------------------ */

const rad = (deg) => (deg * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const fx  = (n) => (Math.round(n * 10) / 10).toFixed(1);
const esc = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const truncate = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');

// mulberry32 — tiny seeded PRNG so the build is reproducible.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(FORCE.seed);
const jitter = (amp) => (rng() - 0.5) * 2 * amp;

/* ---- Build node + edge model ------------------------------------------- */

const nodes = [];   // { id, type, r, hit, mass, x, y }
const byId = {};
function addNode(id, type, x, y) {
  const n = { id, type, r: R_NODE[type], hit: R_HIT[type], mass: MASS[type], x, y };
  nodes.push(n);
  byId[id] = n;
  return n;
}

// Seed initial positions in a loose constellation: Home right, Guides left,
// categories ringed around Guides, posts fanned off their category, the Home
// pages ringed around Home. The simulation relaxes this into its final form;
// good seeding just avoids tangled local minima.
addNode('home', 'home', 360, 0);
addNode('guides', 'guides', -300, 0).label = 'Guides';

const counts = {};
for (const [cat] of POSTS) counts[cat] = (counts[cat] || 0) + 1;

CATEGORIES.forEach((c, i) => {
  const a = (i / CATEGORIES.length) * Math.PI * 2 + 0.6;
  addNode(c.id, 'cat',
    -300 + Math.cos(a) * 230 + jitter(30),
    Math.sin(a) * 230 + jitter(30)).label = c.name;
});

const perCatIndex = {};
const postMeta = [];   // { id, slug, title, cat }
for (const [cat, slug, title] of POSTS) {
  const c = byId[cat];
  const i = (perCatIndex[cat] = (perCatIndex[cat] ?? -1) + 1);
  const a = (i / counts[cat]) * Math.PI * 2 + cat.length; // varied start per cat
  const id = `post-${slug}`;
  const n = addNode(id, 'post',
    c.x + Math.cos(a) * 80 + jitter(24),
    c.y + Math.sin(a) * 80 + jitter(24));
  n.cat = cat;
  n.label = truncate(title, POST_LABEL_MAX);
  postMeta.push({ id, slug, title, cat });
}

const homeChildren = [...T1, ...LEGAL];
homeChildren.forEach((k, i) => {
  const a = (i / homeChildren.length) * Math.PI * 2;
  const type = (k.id === 'privacy' || k.id === 'terms') ? 'legal' : 't1';
  const n = addNode(k.id, type,
    360 + Math.cos(a) * 130 + jitter(24),
    Math.sin(a) * 130 + jitter(24));
  n.meta = k;
  n.label = k.name;
});

// Tree edges
const edges = [];   // { a, b, type } where type keys into SPRING
const treeEdge = (a, b, type) => edges.push({ a, b, type });
treeEdge('home', 'guides', 'home-guides');
for (const k of homeChildren) treeEdge('home', k.id, k.id === 'privacy' || k.id === 'terms' ? 'home-legal' : 'home-t1');
for (const c of CATEGORIES) treeEdge('guides', c.id, 'guides-cat');
for (const p of postMeta) treeEdge(p.cat, p.id, 'cat-post');

// Cross links (undirected, published only, dedup) — both drawn as curves and
// used as weak springs so related posts drift slightly toward one another.
const published = new Set(POSTS.map(([, slug]) => slug));
const seen = new Set();
const xlinks = [];
for (const [a, b] of RELATED) {
  if (!published.has(a) || !published.has(b)) continue;
  const key = [a, b].sort().join('|');
  if (seen.has(key)) continue;
  seen.add(key);
  xlinks.push([a, b]);
}
const xlinkEdges = xlinks.map(([a, b]) => ({ a: `post-${a}`, b: `post-${b}`, type: 'xlink' }));
const simEdges = [...edges, ...xlinkEdges];

/* ---- Force simulation --------------------------------------------------- */

let temp = FORCE.temp0;
for (let it = 0; it < FORCE.iters; it++) {
  const dx = new Map(nodes.map((n) => [n.id, 0]));
  const dy = new Map(nodes.map((n) => [n.id, 0]));

  // Repulsion — every pair (n is tiny, O(n²) is free and gives global spread)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      let vx = a.x - b.x, vy = a.y - b.y;
      let d2 = vx * vx + vy * vy;
      if (d2 < 0.01) { vx = jitter(1); vy = jitter(1); d2 = vx * vx + vy * vy + 0.01; }
      const d = Math.sqrt(d2);
      const f = (FORCE.rep * a.mass * b.mass) / d2;
      const ux = vx / d, uy = vy / d;
      dx.set(a.id, dx.get(a.id) + ux * f); dy.set(a.id, dy.get(a.id) + uy * f);
      dx.set(b.id, dx.get(b.id) - ux * f); dy.set(b.id, dy.get(b.id) - uy * f);
    }
  }

  // Spring attraction along edges
  for (const e of simEdges) {
    const a = byId[e.a], b = byId[e.b];
    const { L, k } = SPRING[e.type];
    let vx = a.x - b.x, vy = a.y - b.y;
    let d = Math.hypot(vx, vy) || 0.01;
    const f = (d - L) * k;
    const ux = vx / d, uy = vy / d;
    dx.set(a.id, dx.get(a.id) - ux * f); dy.set(a.id, dy.get(a.id) - uy * f);
    dx.set(b.id, dx.get(b.id) + ux * f); dy.set(b.id, dy.get(b.id) + uy * f);
  }

  // Elliptical gravity toward origin (weaker in X → wider layout)
  for (const n of nodes) {
    dx.set(n.id, dx.get(n.id) - n.x * FORCE.gravityX);
    dy.set(n.id, dy.get(n.id) - n.y * FORCE.gravityY);
  }

  // Integrate with a cooling step cap
  for (const n of nodes) {
    const ddx = dx.get(n.id), ddy = dy.get(n.id);
    const dl = Math.hypot(ddx, ddy);
    if (dl > 0) {
      const step = Math.min(dl, temp);
      n.x += (ddx / dl) * step;
      n.y += (ddy / dl) * step;
    }
  }
  temp *= FORCE.cool;
}

/* ---- Label geometry (shared by the fit and the emitter) ----------------- */

const unit = (vx, vy) => { const d = Math.hypot(vx, vy) || 1; return { x: vx / d, y: vy / d }; };
const anchorFor = (ux) => (ux > 0.34 ? 'start' : ux < -0.34 ? 'end' : 'middle');

// Per-type font size; glyph advance estimated generously so the content box
// never under-reserves the space a label occupies (coords are viewBox units).
const FS = { home: 11, guides: 11, t1: 11, legal: 9.5, cat: 11.5, post: 10 };
const labelGap = (n) =>
  n.type === 'guides' ? n.r + 13 :
  n.type === 'cat'    ? n.r + 11 :
  n.type === 'post'   ? POST_LABEL_GAP : n.r + 8;

// Final placement of a node's label + the extreme points its glyphs cover,
// computed from current positions and the graph centroid.
function labelGeom(n, centroid) {
  const fs = FS[n.type];
  const w = (n.label ? n.label.length : 0) * fs * 0.62 + 6;  // generous width
  const h = fs;
  if (n.type === 'home') {                                   // centred inside node
    return { P: { x: n.x, y: n.y }, anchor: 'middle', rot: 0, pts: [{ x: n.x, y: n.y }] };
  }
  if (n.type === 'post') {                                   // radial, outward from cluster
    const C = byId[n.cat];
    const u = unit(n.x - C.x, n.y - C.y);
    const gap = labelGap(n);
    const P = { x: n.x + u.x * gap, y: n.y + u.y * gap };
    const a = deg(Math.atan2(u.y, u.x));
    const flip = u.x < 0;
    const rot = flip ? a - 180 : a;
    const anchor = flip ? 'end' : 'start';
    const far = { x: n.x + u.x * (gap + w), y: n.y + u.y * (gap + w) };
    const perp = { x: -u.y, y: u.x };
    const pts = [P, far].flatMap((q) => [
      { x: q.x + perp.x * h / 2, y: q.y + perp.y * h / 2 },
      { x: q.x - perp.x * h / 2, y: q.y - perp.y * h / 2 },
    ]);
    return { P, anchor, rot, pts };
  }
  // guides / t1 / legal / cat — horizontal, set outward from the centroid
  const u = unit(n.x - centroid.x, n.y - centroid.y);
  const gap = labelGap(n);
  const P = { x: n.x + u.x * gap, y: n.y + u.y * gap };
  const anchor = anchorFor(u.x);
  const x1 = anchor === 'start' ? P.x : anchor === 'end' ? P.x - w : P.x - w / 2;
  const x2 = anchor === 'start' ? P.x + w : anchor === 'end' ? P.x : P.x + w / 2;
  const pts = [
    { x: x1, y: P.y - h / 2 }, { x: x2, y: P.y - h / 2 },
    { x: x1, y: P.y + h / 2 }, { x: x2, y: P.y + h / 2 },
  ];
  return { P, anchor, rot: 0, pts };
}

const centroidOf = (ns) => ({
  x: ns.reduce((s, n) => s + n.x, 0) / ns.length,
  y: ns.reduce((s, n) => s + n.y, 0) / ns.length,
});

/* ---- Fit: pass 1 conservative, then fit the true content (nodes+labels) -- */

// Pass 1 — place nodes well inside the frame so the label box stays in-bounds.
{
  const xs = nodes.map((n) => n.x), ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const bw = maxX - minX || 1, bh = maxY - minY || 1;
  const availW = VB.w - 2 * 260, availH = VB.h - 2 * 260;
  const s = Math.min(availW / bw, availH / bh);
  const offX = 260 + (availW - bw * s) / 2;
  const offY = 260 + (availH - bh * s) / 2;
  for (const n of nodes) { n.x = offX + (n.x - minX) * s; n.y = offY + (n.y - minY) * s; }
}

// True content bounding box: node circles + estimated label boxes.
let centroid = centroidOf(nodes);
const content = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
const fold = (x, y) => {
  if (x < content.minX) content.minX = x; if (x > content.maxX) content.maxX = x;
  if (y < content.minY) content.minY = y; if (y > content.maxY) content.maxY = y;
};
for (const n of nodes) {
  fold(n.x - n.r, n.y - n.r); fold(n.x + n.r, n.y + n.r);
  for (const p of labelGeom(n, centroid).pts) fold(p.x, p.y);
}

// Pass 2 — expand that content box to fill the frame. Because pass 1 was
// conservative the scale here is >= 1, so labels (whose pixel reach is fixed,
// not scaled) only get relatively shorter — nothing can clip.
{
  const margin = 26;
  const bw = content.maxX - content.minX || 1, bh = content.maxY - content.minY || 1;
  const availW = VB.w - 2 * margin, availH = VB.h - 2 * margin;
  const s = Math.min(availW / bw, availH / bh);
  const offX = margin + (availW - bw * s) / 2;
  const offY = margin + (availH - bh * s) / 2;
  for (const n of nodes) { n.x = offX + (n.x - content.minX) * s; n.y = offY + (n.y - content.minY) * s; }
}
centroid = centroidOf(nodes);

// Final label geometry, keyed by node id — reused verbatim by the emitter.
const labelOf = {};
for (const n of nodes) labelOf[n.id] = labelGeom(n, centroid);

/* ---- Emit SVG ----------------------------------------------------------- */

const out = [];
out.push(`<svg id="site-graph" viewBox="0 0 ${VB.w} ${VB.h}"
               role="img"
               aria-labelledby="graph-title graph-desc">
            <title id="graph-title">Branch and Root Consulting &mdash; Site Map Graph</title>
            <desc id="graph-desc">Interactive force-directed network of all 52 pages. Home connects to the 6 main pages and 2 legal pages; the Guides hub anchors 7 category clusters that hold all 35 articles, spread organically across the canvas. Dashed curves link related articles. Hover or tap any node to highlight its connections. Click a category node to collapse its articles.</desc>

        <!-- Edges layer -->
        <g class="sg-edges" aria-hidden="true">`);

const edgeLine = (cls, from, to, a, b) =>
  `          <line class="sg-edge ${cls}" data-from="${from}" data-to="${to}" x1="${fx(a.x)}" y1="${fx(a.y)}" x2="${fx(b.x)}" y2="${fx(b.y)}"/>`;

// Tree edges: home spokes, category spokes, then article spokes.
out.push(edgeLine('sg-edge--t1', 'home', 'guides', byId.home, byId.guides));
for (const k of homeChildren) out.push(edgeLine('sg-edge--t1', 'home', k.id, byId.home, byId[k.id]));
for (const c of CATEGORIES) out.push(edgeLine('sg-edge--cat', 'guides', c.id, byId.guides, byId[c.id]));
for (const p of postMeta) out.push(edgeLine('sg-edge--post', p.cat, p.id, byId[p.cat], byId[p.id]));

// Related-article curves: quadratic, bowed toward the global centroid so they
// sweep through the quiet interior rather than across the outer labels.
for (const [a, b] of xlinks) {
  const A = byId[`post-${a}`], B = byId[`post-${b}`];
  const m = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  const c = { x: m.x + (centroid.x - m.x) * 0.22, y: m.y + (centroid.y - m.y) * 0.22 };
  out.push(`          <path class="sg-edge sg-edge--xlink" data-from="post-${a}" data-to="post-${b}" fill="none" d="M ${fx(A.x)} ${fx(A.y)} Q ${fx(c.x)} ${fx(c.y)} ${fx(B.x)} ${fx(B.y)}"/>`);
}

out.push(`        </g>

        <!-- Nodes layer -->
        <g class="sg-nodes" aria-label="Site pages">`);

function nodeOpen(cls, id, title, extra = '') {
  return `          <g class="sg-node ${cls}" data-id="${id}"${extra} role="group">
            <title>${title}</title>`;
}
const circle = (cls, p, r) => `            <circle class="${cls}" cx="${fx(p.x)}" cy="${fx(p.y)}" r="${r}"/>`;
const hit = (p, r) => `cx="${fx(p.x)}" cy="${fx(p.y)}" r="${r}" fill="transparent"`;

// Home — label centred inside the node
{
  const H = byId.home;
  out.push(nodeOpen('sg-node--home', 'home', 'Home &mdash; Branch and Root Consulting'));
  out.push(circle('sg-circle', H, R_NODE.home));
  out.push(`            <a href="/" aria-label="Home &mdash; Branch and Root Consulting">
              <circle class="sg-hit" ${hit(H, R_HIT.home)}/>
            </a>
            <text class="sg-label sg-label--home" x="${fx(H.x)}" y="${fx(H.y)}" dominant-baseline="central" text-anchor="middle">Home</text>
          </g>`);
}

// Guides hub — label set outward from the centroid
{
  const G = byId.guides;
  const lg = labelOf.guides;
  out.push(nodeOpen('sg-node--t1 sg-node--guides', 'guides', 'Guides &mdash; Lead Generation Hiring Guide'));
  out.push(circle('sg-circle', G, R_NODE.guides));
  out.push(`            <a href="/guides" aria-label="Guides &mdash; Lead Generation Hiring Guide">
              <circle class="sg-hit" ${hit(G, R_HIT.guides)}/>
            </a>
            <text class="sg-label" x="${fx(lg.P.x)}" y="${fx(lg.P.y)}" dominant-baseline="central" text-anchor="${lg.anchor}">Guides</text>
          </g>`);
}

// Home children — horizontal labels set outward from the centroid
for (const k of homeChildren) {
  const legal = k.id === 'privacy' || k.id === 'terms';
  const cls = legal ? 'sg-node--legal' : 'sg-node--t1';
  const lblCls = legal ? 'sg-label sg-label--sm' : 'sg-label';
  const r = legal ? R_NODE.legal : R_NODE.t1;
  const rh = legal ? R_HIT.legal : R_HIT.t1;
  const N = byId[k.id];
  const lg = labelOf[k.id];
  out.push(nodeOpen(cls, k.id, esc(k.name)));
  out.push(circle('sg-circle', N, r));
  out.push(`            <a href="${k.href}" aria-label="${esc(k.name)}">
              <circle class="sg-hit" ${hit(N, rh)}/>
            </a>
            <text class="${lblCls}" x="${fx(lg.P.x)}" y="${fx(lg.P.y)}" dominant-baseline="central" text-anchor="${lg.anchor}">${esc(k.name)}</text>
          </g>`);
}

// Categories — toggle buttons, horizontal label set outward from the centroid
for (const c of CATEGORIES) {
  const N = byId[c.id];
  const lg = labelOf[c.id];
  out.push(nodeOpen('sg-node--cat', c.id, esc(c.name)));
  out.push(`            <g role="button" tabindex="0" aria-expanded="true" aria-label="Toggle ${esc(c.name)} articles">
${circle('sg-circle', N, R_NODE.cat)}
              <circle class="sg-hit" ${hit(N, R_HIT.cat)}/>
            </g>
            <text class="sg-label sg-label--cat" x="${fx(lg.P.x)}" y="${fx(lg.P.y)}" dominant-baseline="central" text-anchor="${lg.anchor}">${esc(c.name)}</text>
          </g>`);
}

// Articles — labels splay radially OUTWARD from their category cluster centre,
// rotated along that direction and flipped on the left half to stay readable.
for (const p of postMeta) {
  const N = byId[p.id];
  const lg = labelOf[p.id];
  const label = esc(truncate(p.title, POST_LABEL_MAX));
  out.push(nodeOpen('sg-node--post', p.id, esc(p.title), ` data-parent="${p.cat}"`));
  out.push(circle('sg-circle', N, R_NODE.post));
  out.push(`            <a href="/guides/${p.slug}" aria-label="${esc(p.title)}">
              <circle class="sg-hit" ${hit(N, R_HIT.post)}/>
            </a>
            <text class="sg-label sg-label--post" x="${fx(lg.P.x)}" y="${fx(lg.P.y)}" dominant-baseline="central" text-anchor="${lg.anchor}" transform="rotate(${fx(lg.rot)}, ${fx(lg.P.x)}, ${fx(lg.P.y)})">${label}</text>
          </g>`);
}

out.push(`        </g>

          </svg>`);

/* ---- Splice into sitemap-page.html -------------------------------------- */

const svg = out.join('\n');
const html = readFileSync(PAGE, 'utf8');
const re = /<svg id="site-graph"[\s\S]*?<\/svg>/;
if (!re.test(html)) {
  console.error('No <svg id="site-graph"> block found — nothing replaced.');
  process.exit(1);
}
writeFileSync(PAGE, html.replace(re, svg));
console.log(`Wrote ${postMeta.length} articles, ${CATEGORIES.length} categories, ${xlinks.length} related-article links into sitemap-page.html`);
