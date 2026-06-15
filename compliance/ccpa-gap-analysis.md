# CCPA/CPRA Gap Analysis — Branch and Root Consulting

**Site:** branchandrootconsulting.com (plus the internal `leads.` preview subdomain)
**Prepared:** June 14, 2026
**Framework:** California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), and the CPPA regulations (Cal. Code Regs. tit. 11, §§ 7000–7304).

> **Plain-English bottom line.** Branch & Root is almost certainly **not legally required** to comply with the CCPA/CPRA yet (see applicability below). Everything in this engagement was done as **good practice and future-proofing** — it builds trust, and it makes the dormant advertising pixels safe *before* they are ever switched on. Nothing here is an admission that the law applies.

---

## 1. Applicability — does the CCPA/CPRA even apply?

A business is only subject to the CCPA/CPRA if it does business in California, decides why/how personal information is processed, **and** meets at least **one** of three thresholds (Cal. Civ. Code § 1798.140(d)):

| Threshold | Requirement | Branch & Root | Met? |
|---|---|---|---|
| Revenue | Annual gross revenue **> $25 million** (prior calendar year) | A solo Orange County consulting practice | **No** |
| Volume | Buys/sells/shares the personal information of **100,000+** CA consumers or households per year | Site traffic + leads are nowhere near 100,000 unique CA consumers/year | **No** |
| Data-sale revenue | Derives **50%+** of annual revenue from **selling or sharing** personal information | Revenue is from consulting services, not data | **No** |

**Conclusion: Not a covered "business" today.** Risk of an enforcement action is **low**. The conservative-compliant posture in this repo is recommended anyway because (a) thresholds change as a business grows; (b) the cost is small; (c) it signals trustworthiness to prospects; and (d) it neutralizes the one real exposure item — advertising pixels — in advance.

**Re-evaluate this conclusion if any of these happen:** revenue approaches $25M; you begin large-scale lead buying/selling; or you turn on advertising pixels at a scale that pushes "shared" consumers toward 100,000/year.

---

## 2. What personal information is collected, and how

| Mechanism | File(s) | Personal information | Destination |
|---|---|---|---|
| Lead-magnet form | `index.html` | name, email | `/api/lead.js` → GoHighLevel CRM |
| Discovery form | `contact.html` | name, email, phone, business type, message | `/api/lead.js` → GoHighLevel CRM |
| Booking calendar | `book.html` | name, email, phone, appointment time | GoHighLevel widget (iframe) |
| Analytics (all pages) | inline `<head>` | IP, device/browser, pages viewed, referrer | Google Analytics 4 (`G-D3746FRPDV`) via GTM (`GTM-N6MLQZFR`) |
| Ad pixels (**dormant**) | `thank-you.html` | conversion/page events | Meta Pixel + Google Ads — **inactive** (no IDs set) |
| Fonts / maps | various | IP (functional, to render content) | Google Fonts; Google Maps (leads pages) |
| Leads preview forms | `leads/round-1/*/index.html` | name, phone, message | **Inactive** (`action="#"`, awaiting Formspree) |

**No sensitive personal information** (CPRA § 1798.140(ae)) is collected — no SSN, driver's license, financial-account credentials, precise geolocation, health, biometric, racial/ethnic, or similar data. No payment data is stored.

**Third parties that receive or can access data:** GoHighLevel (CRM — service provider), Vercel (hosting — service provider), Google (Analytics service provider; Ads/Fonts/Maps), Meta (only if the pixel is activated).

---

## 3. The one real issue: "sale"/"sharing" via ad pixels

Under the CPRA, **"sharing"** means disclosing personal information for **cross-context behavioral advertising** — even with no money exchanged. The California Attorney General's **Sephora** settlement (2022) established that ordinary third-party ad/analytics cookies can count as a "sale"/"share," and that businesses must honor the **Global Privacy Control** (GPC).

- **Google Analytics 4** — treated as a **service provider** (analytics-only) and therefore *not* a sale/share, **provided** Google Signals and ads-personalization are OFF and Google's data-processing terms are accepted. → Configuration item, see README.
- **Meta Pixel / Google Ads** — currently **dormant**. When activated with default settings they would be a "share" (and arguably a "sale"). → Now wired to respect opt-out + GPC *before* they can fire.
- **Google Fonts / Maps** — passing an IP address to a CDN to render content is a **functional/service-provider** use, **low risk** under CCPA (this is a GDPR concern, not a CCPA violation).

---

## 4. Gap analysis (severity = actual risk for a non-covered small business)

| # | Area | Finding | Severity | Status after this engagement |
|---|------|---------|----------|------------------------------|
| 1 | Applicability | Under all three § 1798.140(d) thresholds. | Info | Documented (this file). |
| 2 | Ad pixels = "sharing" | Dormant Meta/Google Ads code in `thank-you.html` would be a "share" once live (Sephora). | High (preventive) | **Fixed** — gated behind opt-out + GPC + Consent Mode before activation. |
| 3 | GPC not honored | No Global Privacy Control handling (§ 7025). | Med (High once live) | **Fixed** — `privacy-consent.js` detects `navigator.globalPrivacyControl` and forces opt-out. |
| 4 | No opt-out link/page | No "Your Privacy Choices"/"Do Not Sell or Share" link (§ 1798.135). | Med (High once live) | **Fixed** — `your-privacy-choices.html` + footer link with CA opt-out icon on all pages. |
| 5 | Policy missing CPRA elements | Old policy lacked statutory category names, sources, third-party categories, retention, Right to Correct (§ 1798.106), Right to Limit SPI (§ 1798.121), "sharing" language, GPC, 45+45 timeline, annual review, minors-under-16 (§ 1798.120(c)). | Med | **Fixed** — full CPRA rewrite of `privacy-policy.html`. |
| 6 | No notice at collection | § 1798.100(b)/§ 7012 notice at the point of collection. | Low–Med | **Fixed** — `.form-consent` extended on the discovery + magnet forms; dormant notice staged on leads forms. |
| 7 | GA4 config & double-load | GA4 loads via both inline `gtag` and (possibly) GTM; ads-personalization may tip GA4 into "sharing." | Med | **Action item** (README) — keep GA4 in GTM only; confirm Google Signals OFF. |
| 8 | DSR process not operational | Old policy had a contradictory timeline ("45 days" vs "5 business days"); no intake form, verification, or record-keeping (§ 7101 = 24 months). | Med | **Fixed** — DSR form (reuses `/api/lead`), workflow doc, verification, 45(+45) timeline. |
| 9 | Service-provider terms | GHL (and Formspree when leads go live) process PI. | Low | **Action item** — confirm DPAs (README). |
| 10 | Jan 1, 2026 CPPA rules (ADMT / risk assessments / cybersecurity audits) | New CPPA regulations adopted 2025, phased 2026–2028. | Info / **N/A** | See § 5 — not applicable to Branch & Root today. |

---

## 5. January 1, 2026 CPPA regulations — flagged, and why they don't apply

In 2025 the California Privacy Protection Agency finalized new regulations covering **automated decision-making technology (ADMT)**, **risk assessments**, and **cybersecurity audits**, with compliance obligations phasing in across **2026–2028** (exact compliance dates vary by topic and by business size). These rules:

- Apply only to entities that are **covered "businesses"** under § 1798.140(d) — Branch & Root is not one (see § 1).
- **ADMT** rules govern automated technology used to make **"significant decisions"** about consumers (employment, lending, housing, healthcare, etc.). Branch & Root's CRM tagging / marketing automation is **not** ADMT making significant decisions — so even a covered business doing only this would not trigger the ADMT obligations.
- **Risk assessments** and **cybersecurity audits** are triggered by size/processing-risk thresholds Branch & Root does not meet.

**Result: no current obligations under the 2026 CPPA rules.** Monitor if the business grows or adopts AI tooling that makes consequential decisions about people.

---

## 6. Honest uncertainties

- **Applicability is a judgment call, not a certainty.** It rests on Branch & Root staying under the thresholds. The conservative build means you're covered either way.
- **GA4-as-service-provider depends on configuration** you control in Google's UI (Signals/ads-personalization OFF, data-processing terms accepted). Until confirmed, treat GA4 as a low-but-nonzero "sharing" risk. See README action items.
- **The leads subdomain** raises a separate "who is the controller?" question once those sites go live for real clients (is Branch & Root a service provider to each client, or the business?). Resolve before launch; the privacy notices there are staged but dormant.
