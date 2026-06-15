# Diagnosis — Squarespace "couldn't reach the email address" error

**Date:** 2026-06-14
**Address:** rmgohl@branchandrootconsulting.com
**Squarespace error observed:** *"There was a problem with your email address — We couldn't reach the email address rmgohl@branchandrootconsulting.com."*

## What I found (live evidence)

```
$ dig +short MX branchandrootconsulting.com
1  aspmx.l.google.com.
5  alt1.aspmx.l.google.com.
5  alt2.aspmx.l.google.com.
10 alt3.aspmx.l.google.com.
10 alt4.aspmx.l.google.com.          # ✅ correct Google Workspace MX, correct priorities

$ dig +short TXT branchandrootconsulting.com
"google-site-verification=sDWAGpktl9wOrWGUw3abryNvkHMjxcujwKeG-J9xuTk"
                                     # ⚠️ this is the ONLY apex TXT — no v=spf1 record present

$ dig +short TXT _dmarc.branchandrootconsulting.com
"v=DMARC1; p=none; rua=mailto:dmarc-reports@branchandrootconsulting.com"   # ✅ present

$ dig +short TXT google._domainkey.branchandrootconsulting.com
"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A…"                       # ✅ valid DKIM key
```

## Diagnosis

Mail **delivery is healthy.** MX points correctly to Google Workspace, DKIM is published, and DMARC exists — so inbound mail to `rmgohl@branchandrootconsulting.com` is being delivered to the Google Workspace mailbox. The DNS change that broke things for Squarespace was the **nameserver move to Cloudflare**: Squarespace can no longer verify its association with the domain, so its own transactional notifier (the system that emails you about account/billing events) is failing — **a cosmetic, Squarespace-side issue that does not affect real email.** The Phase 5 Google Workspace send/receive test in the setup guide already proved live mail works.

**However, the diagnostics surfaced a separate, genuine gap: the apex has no SPF record.** The only TXT at the apex is the Google site-verification string; there is no `v=spf1` record. Without SPF, mail sent *as* `@branchandrootconsulting.com` via Google Workspace lacks a published sender policy, which weakens deliverability and DMARC alignment (mail can be downgraded or spam-filed by recipients). This is worth fixing while we're in DNS, independent of the Squarespace error.

## Action taken / recommended

No DNS write was performed automatically (no API token in this environment) — see [`manual-dns-steps.md`](manual-dns-steps.md).

1. **Add the missing SPF record** (real deliverability fix). Apex `TXT`: `v=spf1 include:_spf.google.com ~all`, **DNS-only (gray cloud)**. Keep the existing `google-site-verification` TXT untouched (SPF is a separate, additional TXT record).
2. **Stop the Squarespace error** (cosmetic): in Squarespace **Account → Notifications/Email**, change the notification email from `rmgohl@branchandrootconsulting.com` to a plain Gmail address (e.g. the Google Workspace Gmail). Squarespace's notifier is not part of the mail infrastructure, so this removes the warning without touching DNS.
3. *(Optional, later)* once SPF is live and DMARC reports look clean, consider tightening DMARC from `p=none` to `p=quarantine`.

## Verification (run after applying)

```
dig +short TXT branchandrootconsulting.com    # expect BOTH the google-site-verification line AND "v=spf1 include:_spf.google.com ~all"
```
Then send a test mail from the Google Workspace account to an external inbox (e.g. a personal Gmail) and confirm the message header shows `spf=pass` and `dkim=pass`.

---
STATUS: Manual action required
