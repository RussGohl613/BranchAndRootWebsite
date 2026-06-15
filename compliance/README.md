# Privacy Compliance — Implementation Notes & Action Items

**Last updated:** June 14, 2026

This folder documents the CCPA/CPRA work done on the site. Start with [`ccpa-gap-analysis.md`](./ccpa-gap-analysis.md) (audit + applicability) and [`dsr-workflow.md`](./dsr-workflow.md) (how to handle consumer requests).

> Reminder: per the gap analysis, Branch & Root is **not currently a covered "business"** under the CCPA/CPRA. This is a conservative, good-practice implementation — and it makes the dormant ad pixels safe before they're switched on.

---

## 1. What was built (in this repo)

**New files**
- `your-privacy-choices.html` — the opt-out destination page: a toggle to opt out of ad-related "sharing," a live status line (incl. the GPC-honored state), and a privacy-request (DSR) form.
- `assets/js/privacy-consent.js` — the consent engine: GPC detection, opt-out state in `localStorage`, Google Consent Mode v2 **update** calls, and the non-blocking notice banner. Exposes `window.BRPrivacy`.
- `compliance/` — these documents.

**Changed**
- `privacy-policy.html` — full CPRA rewrite (statutory PI categories, sources, purposes, third parties, retention, all consumer rights incl. Correct & Limit-SPI, "sale/sharing" disclosure, GPC, minors-under-16, 45+45-day request timeline, annual review). "Last updated" bumped to 2026-06-14.
- **All 55 main-site pages** (root + `guides/` + `.templates/blog-post.html`) — an inline **Consent Mode v2 default** block was inserted at the top of `<head>` (before GTM), the `privacy-consent.js` script tag was added, and a **"Your Privacy Choices"** link (with the California opt-out icon) was added to the footer.
- `thank-you.html` — the dormant Meta Pixel loader and the Meta/Google-Ads conversion events are now gated behind opt-out/GPC (`BRPrivacy.canTrackAds()`), so they stay silent for opted-out visitors **even after** the pixel IDs are filled in.
- `contact.html`, `index.html` — notice-at-collection extended on the forms; link to Your Privacy Choices.
- `sitemap.xml`, `sitemap-page.html` — added the new page.
- **10 `leads/round-1/*/index.html`** — a privacy notice was staged next to each form **but left commented out (dormant)**; uncomment it when each site goes live alongside the Formspree action.

`api/lead.js` was intentionally **not** changed — the DSR form reuses its existing `tags`/`customFields` pass-through.

---

## 2. How the consent system works (for future devs)

1. **Default (synchronous, in `<head>`):** before GTM loads, an inline block calls `gtag('consent','default', …)`. It denies `ad_storage`/`ad_user_data`/`ad_personalization` if the visitor has opted out *or* GPC is on; `analytics_storage` stays `granted` (first-party analytics isn't the CCPA target).
2. **Update (deferred, `privacy-consent.js`):** reconciles state on load and pushes `gtag('consent','update', …)` whenever the visitor changes their choice. Also pushes a `br_consent_update` dataLayer event (`br_opt_out: 0|1`) for any GTM-side gating.
3. **GPC** (`navigator.globalPrivacyControl === true`) forces opt-out and cannot be overridden from the page.
4. **Banner** is a non-blocking notice (not an opt-in wall): symmetric "Opt out of sharing" / "OK" buttons, no pre-checked boxes, dismissal remembered.
5. **Pixels** in `thank-you.html` check `BRPrivacy.canTrackAds()` (with a GPC/localStorage fallback) before firing.

`localStorage` keys: `br_privacy_optout` (`'1'` out / `'0'` in / unset) and `br_notice_dismissed`.

---

## 3. Action items you must do OUTSIDE the code (Google/Meta/vendor UIs)

These can't be done in the repo and are needed to keep the compliance story true:

- [ ] **GA4 — stay a "service provider."** In Google Analytics admin: turn **Google Signals OFF**, turn **ads-personalization OFF** (or set "Include in ad personalization = No"), and confirm Google's **Data Processing Terms** are accepted. This keeps GA4 from being a "share." (Gap item #7.)
- [ ] **Resolve the GA4 double-load.** GA4 currently can load via both the inline `gtag('config','G-D3746FRPDV')` and the GTM container. Pick one — recommended: keep GA4 **only in GTM** and delete the inline `gtag('config', …)` line site-wide (keep the inline consent-default + `gtag('js', …)`). Then GTM-Preview to confirm exactly one `page_view` per load.
- [ ] **Before turning on Meta Pixel / Google Ads:** in GTM, set those tags' **Consent Settings** to require `ad_storage` (and `ad_user_data` for Ads). The in-code gate already protects the `thank-you.html` pixels; this covers any GTM-managed tags too.
- [ ] **(Optional) Mirror Consent Mode default in GTM** via a "Consent Initialization – All Pages" tag, as belt-and-suspenders.
- [ ] **Confirm vendor data-processing terms / DPAs:** GoHighLevel (CRM) and, before the leads sites launch, Formspree.
- [ ] **(Recommended) Create `privacy@branchandrootconsulting.com`** and forward to the main inbox; then swap it into `privacy-policy.html`, `your-privacy-choices.html`, and `dsr-workflow.md` in place of `sales@`.
- [ ] **GoHighLevel:** add a notification/workflow on the `privacy-request` tag so DSRs don't sit in the sales pipeline.

---

## 4. Maintenance checklist

- [ ] **Review the Privacy Policy at least every 12 months** (CPRA requirement) and bump the "Last updated" date when anything changes. Next review due: **June 2026 + 12 months**.
- [ ] **When you activate any ad pixel,** re-test the opt-out + GPC gating (see the verification steps in the project plan) before going live.
- [ ] **Keep DSR records for 24 months** (see `dsr-workflow.md`).
- [ ] **Re-check applicability** if revenue grows toward $25M, or if you start buying/selling/sharing data at volume.
- [ ] **Leads sites:** when one goes live, uncomment its privacy notice, point the form at Formspree, and settle the controller/processor question with the client.
