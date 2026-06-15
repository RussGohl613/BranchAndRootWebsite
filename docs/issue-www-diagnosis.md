# Diagnosis — `www` subdomain "unreachable" warning (Cloudflare)

**Date:** 2026-06-14
**Domain:** branchandrootconsulting.com
**Cloudflare banner observed:** *"Visitors cannot reach www.branchandrootconsulting.com — Add an A, AAAA, or CNAME record for www and optionally create a redirect rule to send visitors to branchandrootconsulting.com."*

## What I found (live evidence)

```
$ dig +short NS branchandrootconsulting.com
earl.ns.cloudflare.com.
lilith.ns.cloudflare.com.            # NS migration to Cloudflare is live

$ dig +short A branchandrootconsulting.com
216.198.79.1                         # Vercel anycast range

$ curl -sIL https://branchandrootconsulting.com
HTTP/2 200
server: Vercel                       # apex is the canonical, working site

$ dig +short www.branchandrootconsulting.com
                                     # (empty — no A, no AAAA, no CNAME)
$ dig +short CNAME www.branchandrootconsulting.com
                                     # (empty)
$ curl -sI https://www.branchandrootconsulting.com
                                     # (no response — host does not resolve)
```

## Diagnosis

The banner is **correct, not informational.** `www.branchandrootconsulting.com` has **no DNS record of any kind** in the Cloudflare zone and does not resolve. The canonical site is served from the **apex** (`branchandrootconsulting.com`) by Vercel via an `A` record to `216.198.79.1` and responds `HTTP/2 200`. Anyone who types `www.` today reaches a dead host. This is a real gap, not a false alarm.

## Action taken / recommended

No DNS write was performed automatically — there is **no Cloudflare/Vercel API token in this environment**, so the change is documented as manual dashboard steps in [`manual-dns-steps.md`](manual-dns-steps.md).

**Chosen fix: Vercel-native redirect (keeps `www` DNS-only / gray cloud).**
1. In the Vercel project → **Settings → Domains**, add `www.branchandrootconsulting.com` and select **"Redirect to branchandrootconsulting.com."** Vercel issues the 301/308 and auto-provisions TLS for `www`.
2. In Cloudflare DNS, add the `www` record Vercel shows (a `CNAME` → `cname.vercel-dns.com`, or to the apex), set to **DNS-only (gray cloud)** — per the established rule that only `leads` is proxied (orange).

**Why not a Cloudflare Redirect Rule (the banner's "optionally" suggestion)?** A Cloudflare Redirect Rule executes at Cloudflare's edge and only fires on **proxied (orange-cloud)** hostnames. Keeping `www` gray (DNS-only), as our "only `leads` is orange" policy requires, means Cloudflare never sees `www` traffic — so an edge Redirect Rule would never run. Letting Vercel own the redirect resolves that contradiction cleanly and keeps the DNS posture consistent.

## Verification (run after applying)

```
curl -sIL https://www.branchandrootconsulting.com
# expect: HTTP 301/308  →  location: https://branchandrootconsulting.com/  →  HTTP/2 200
```

---
STATUS: Manual action required
