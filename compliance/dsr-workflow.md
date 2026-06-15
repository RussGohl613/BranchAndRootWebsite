# Data Subject Request (DSR) Workflow — Branch and Root Consulting

**Prepared:** June 14, 2026
**Owner:** Matthew Sr. (Client Relations & privacy contact)
**Statutory basis:** CCPA/CPRA (Cal. Civ. Code §§ 1798.100–1798.130) and CPPA regulations (Cal. Code Regs. tit. 11, §§ 7020–7028, 7060, 7101).

This document is the operating procedure for handling consumer privacy requests ("DSRs" / "verifiable consumer requests"). It is written for a one-person operation — deliberately simple, but complete.

---

## 1. Intake — how requests reach us (two methods, as required)

The CCPA requires at least two designated request methods for a business that operates online. We offer:

1. **Web form** — the request form on **/your-privacy-choices**. It submits to the existing `/api/lead` endpoint with `source: "privacy-request"` and tags `privacy-request` + `dsr-<type>`, so the request lands in **GoHighLevel** clearly labeled as a DSR (not a sales lead).
2. **Email** — **sales@branchandrootconsulting.com** with "Privacy Request" in the subject. *(Recommended: create a dedicated `privacy@branchandrootconsulting.com` alias and forward it to the same inbox; update the policy + this doc if you do.)*

A consumer may also use an **authorized agent**. Require written proof the consumer authorized the agent, and you may still verify the consumer's identity directly.

---

## 2. Triage & acknowledgement (within 10 business days)

When a request arrives:

1. **Log it** in the DSR register (see § 6). Record date received, name, email/phone, request type.
2. **Acknowledge receipt within 10 business days** (§ 7021) — a short email confirming you got it and stating you'll respond within 45 days. Use the template in § 7.
3. **Classify** the request: Know/Access, Delete, Correct, Opt-out of sale/share, or Limit SPI.

---

## 3. Identity verification (proportionate, not excessive)

Verify before disclosing or deleting — but don't collect more than necessary (§ 7060).

- **Match-on-file (default):** confirm the request comes from, or can confirm, the **email and/or phone already in the CRM** for that person. For an emailed request, reply to the address on file and ask them to confirm one detail you hold.
- **Higher bar for deletion/correction or sensitive disclosures:** require confirmation from the email on file (a two-step "reply YES to confirm" is sufficient at this scale).
- **No record found:** if we hold nothing matching the requester, respond saying so (that is itself a valid "right to know" answer) — do not collect new identifying data just to search.
- **Can't verify:** if identity can't be reasonably verified, deny the substantive request, explain why, and (for an opt-out) still honor it (opt-out does not require verification).

---

## 4. Fulfillment by request type (within 45 days; one 45-day extension allowed)

Respond within **45 calendar days**. If more time is needed, you may extend **once by another 45 days** with written notice of the reason (§ 1798.130).

| Request | What to do |
|---|---|
| **Know / Access** | Compile the categories and the specific pieces of personal information held for that person (pull the GHL contact record; note analytics is aggregate/not identifiable). Provide categories of sources, business purposes, and categories of third parties. Deliver securely to the verified email. |
| **Delete** | Delete the contact + associated records in GoHighLevel. Instruct any service provider that holds the data to delete it. Confirm completion in writing. Keep only what a legal exception permits (and say which). |
| **Correct** | Update the inaccurate field(s) in the CRM; confirm in writing. |
| **Opt-out of sale/share** | The consumer can self-serve on /your-privacy-choices (sets `br_privacy_optout`, which suppresses ad pixels). If they ask by email, confirm you've recorded the opt-out. GPC is honored automatically and needs no action. |
| **Limit use of sensitive PI** | We do not collect sensitive PI — respond that there is nothing to limit. |

**No retaliation:** never deny service, change pricing, or degrade service because someone exercised a right.

---

## 5. Closure

1. Send the response using the appropriate template (§ 7).
2. Mark the register entry **closed** with the date and the action taken.
3. If extended or denied, record the reason.

---

## 6. Record-keeping (retain 24 months — § 7101)

Keep a simple **DSR register** (a spreadsheet or a dedicated GHL view is fine) with one row per request:

| Field | Example |
|---|---|
| Request ID | DSR-2026-001 |
| Date received | 2026-06-20 |
| Channel | Web form / Email |
| Requester name | Jane Doe |
| Contact on file | jane@example.com |
| Request type | Delete |
| Date acknowledged | 2026-06-23 |
| Verification method | Confirmed email on file |
| Outcome | Completed / Extended / Denied (reason) |
| Date closed | 2026-07-10 |

Retain each record for **24 months**. Do **not** use information collected for verification for any other purpose.

---

## 7. Email templates

**(a) Acknowledgement (send within 10 business days)**

> Subject: Re: Your privacy request — Branch and Root Consulting
>
> Hi [name],
>
> Thanks for your request. This confirms we received it on [date] and that we'll respond within 45 days. To protect your information, we may first ask you to confirm a detail we already have on file. If you have questions, just reply to this email.
>
> — Branch and Root Consulting

**(b) Completion — Know/Access**

> Hi [name], here is the personal information we hold about you: [categories + specifics]. We collected it from [sources], use it to [purposes], and share it only with the service providers listed in our Privacy Policy. Let us know if you'd like anything corrected or deleted.

**(c) Completion — Delete / Correct / Opt-out**

> Hi [name], we've [deleted your information / corrected the following: … / recorded your opt-out of the sale and sharing of your personal information]. [For delete: We've also asked our service providers to delete it.] You're all set — reply if you need anything else.

**(d) Unable to verify**

> Hi [name], we weren't able to verify your identity with the information provided, so we can't process this particular request. [If opt-out: We have, however, recorded your opt-out, which does not require verification.] You're welcome to reply with [detail] so we can try again.

---

## 8. Web intake — technical reference

The /your-privacy-choices form posts JSON to `/api/lead`:

```json
{
  "firstName": "Jane", "lastName": "Doe",
  "email": "jane@example.com", "phone": "...",
  "source": "privacy-request",
  "tags": ["privacy-request", "dsr-delete"],
  "customFields": { "lead_source": "Website — Privacy Request",
                    "message": "DSR (delete): ..." }
}
```

In GoHighLevel, create a workflow/notification on the `privacy-request` tag so these never sit in the general sales pipeline unnoticed. No backend code change is required; `api/lead.js` already forwards `tags` and `customFields`.
