# Manual DNS Steps — Cloudflare dashboard (≈5 minutes)

No Cloudflare/Vercel API token is present in the working environment, so these changes must be made by hand. Two changes total: **(A) `www` redirect** and **(B) missing SPF record**. Both keep the established DNS posture — **only `leads` is proxied (orange); everything else stays DNS-only (gray).**

---

## A. Fix `www` (Vercel-native redirect)

**Step 1 — Vercel (issues the redirect + TLS):**
1. Vercel → your site project → **Settings → Domains**.
2. Add domain: `www.branchandrootconsulting.com`.
3. When prompted, choose **"Redirect to branchandrootconsulting.com"** (308/301).
4. Vercel shows the exact DNS record it wants for `www` — usually a **CNAME → `cname.vercel-dns.com`** (note it for Step 2). Vercel auto-provisions the `www` TLS certificate.

**Step 2 — Cloudflare (add the record, gray cloud):**
1. Cloudflare → `branchandrootconsulting.com` → **DNS → Records → Add record**.
2. Type: **CNAME**, Name: `www`, Target: `cname.vercel-dns.com` (or whatever Vercel showed in Step 1).
3. **Proxy status: DNS only (gray cloud).** ← do **not** orange-cloud `www`.
4. Save.

**Verify:**
```
curl -sIL https://www.branchandrootconsulting.com
# expect: HTTP 301/308 → location: https://branchandrootconsulting.com/ → HTTP/2 200
```

---

## B. Add the missing SPF record

Cloudflare → DNS → **Add record**:
- Type: **TXT**
- Name: `@` (the apex `branchandrootconsulting.com`)
- Content: `v=spf1 include:_spf.google.com ~all`
- Proxy status: **DNS only** (TXT can't be proxied anyway)
- Save.

> Leave the existing `google-site-verification=…` TXT in place — SPF is an **additional** TXT record, not a replacement.

**Verify:**
```
dig +short TXT branchandrootconsulting.com
# expect BOTH lines:
#   "google-site-verification=sDWAGpktl9wOrWGUw3abryNvkHMjxcujwKeG-J9xuTk"
#   "v=spf1 include:_spf.google.com ~all"
```

---

## C. Squarespace error (no DNS change)

Squarespace **Account → Notifications / Email** → change the notification email from `rmgohl@branchandrootconsulting.com` to a plain Gmail address. This is cosmetic (Squarespace's own notifier), unrelated to real mail delivery.

---

## DNS posture cheat-sheet (do not change)

| Record | Name | Proxy |
|---|---|---|
| A | `@` (apex → Vercel `216.198.79.1`) | **gray** |
| CNAME | `www` (new) | **gray** |
| MX ×5 | `@` (Google Workspace) | **gray** |
| TXT | `@` (SPF, site-verification) | **gray** |
| TXT | `_dmarc` | **gray** |
| TXT | `google._domainkey` (DKIM) | **gray** |
| CNAME | `leads` | **orange (proxied)** ← the only one |
