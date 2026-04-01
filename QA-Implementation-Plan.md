# QA Implementation Plan

**QA Report:** QA-Reports.md (27 issues)
**Date:** 2026-03-16

---

## Business Rules (confirmed)

- **Residential users** → Payout flow (request redemption, admin approves/rejects)
- **Commercial users** → Invoice flow (submit invoice with document, admin reviews/approves)
- **Partner users** → Invoice flow (submit invoice, admin reviews/approves) — **currently uses payout flow, needs migration to invoice**
- Everyone eventually gets paid. Commercial/Partners use invoicing because they're more likely to be companies requiring formal invoicing.

---

## Issue Triage — Mapped to Codebase

### d-carbon-admin (this repo) — 8 issues

| # | QA Issue | Severity | Effort | Details |
|---|----------|----------|--------|---------|
| **A1** | #1: Download Docs ZIP fails — "12 documents failed, see placeholder files" | P0 | 2h | `documentExport.js` — `fetchBlob()` hits CORS on GCS signed URLs. Need a proxy or backend download endpoint. |
| **A2** | #2: Historical Collection job uses wrong endpoint `/run` → `/start` | P0 | 5min | `SystemJobs.jsx:43` — change `/api/historical-collection/run` to `/api/historical-collection/start` |
| **A3** | #7: Commission calculation and REC generation jobs return 404 | P1 | 30min | `SystemJobs.jsx` — verify correct endpoints for commission-cron and monthly-rec-data against server. |
| **A4** | #8: Move trigger commission, sales agent bonus, partner bonus to System Jobs page | P1 | 1-2h | Add new job cards to `SystemJobs.jsx` for these operations. |
| **A5** | #22: Remove admin registration page / Create Account | P1 | 30min | Remove `/register` route and link from admin login page. |
| **A6** | #24: "Failed to fetch FAQs" on Help & Tutorials + #25: FAQ creation fails | P1 | 30min | **Root cause found:** `Faq.jsx` does NOT import `CONFIG` — every API call throws `ReferenceError: CONFIG is not defined`. Also, `HelpCentre.jsx` uses hardcoded mock data instead of calling the FAQ API. Fix: add `import CONFIG from '@/lib/config'` to `Faq.jsx`, wire `HelpCentre.jsx` to API. |
| **A7** | #27: Registration Pipeline needs pagination (10-20 per page) | P2 | 1h | `RegistrationPipeline.jsx` — currently loads 200 records with no pagination UI. |
| **A8** | #15: Commercial invoices not visible in admin | P1 | 2h | Admin payout section already has `CommercialPayoutDetails.jsx` which can view invoice docs. Need to verify the invoice list is accessible and the admin can action submitted invoices from the quarterly-statements endpoint. |

### dcarbon-webapp — 14 issues

| # | QA Issue | Severity | Effort | Details |
|---|----------|----------|--------|---------|
| **W1** | #3: Expired auth token doesn't force logout | P0 | 1h | 401 interceptor exists in `lib/config.js` and clears most localStorage keys + redirects to `/login?reason=session_expired`. But it misses `userLastName` and `userRole`. Verify it fires in all cases (not just axiosInstance calls — raw `fetch()` calls won't trigger it). |
| **W2** | #4: Residential user can access commercial dashboard | P0 | 1-2h | All dashboard pages only check `if (!authToken)`. Need `userType` validation: residential→`/residence-dashboard`, commercial→`/commercial-dashboard`, partner→`/partner-dashboard`, operator→`/operator-dashboard`. |
| **W3** | #9: Residential account page missing owner details | P1 | 2h | `MyAccount.jsx` has profile/contact but no facility owner details (name, phone, address). |
| **W4** | #10: Landing page has two "Sign In" buttons | P1 | 15min | One in header, one in hero. Remove the duplicate. |
| **W5** | #11: Solar System Management greyed out (old implementation) | P1 | 30min | Residential sidebar disables this until utility auth. Commercial doesn't. Remove the gating. |
| **W6** | #12: Agreement signing fails with 422 "No file uploaded" | P0 | 1-2h | `SignatureModal.jsx` — signature canvas data likely not properly converted to File/Blob in FormData for `PUT /api/user/update-user-agreement/{userId}`. |
| **W7** | #13: Users can bypass agreement by closing modal and clicking "continue existing facility" | P0 | 1h | Must check agreement status before allowing facility registration to proceed. Block the "continue existing" flow if agreement not signed. |
| **W8** | #14: No visibility into additional utility auth state | P2 | 2h | After adding second utility auth, no status indicator shown. |
| **W9** | #19: Notification system not working post-instapull migration | P1 | 2h | Notification UI exists in all dashboards and calls `/api/user/notifications/{userId}`. The issue is likely server-side — notifications aren't being created after instapull utility auth completes. Server needs to create notification records when utility auth succeeds. |
| **W10** | #20: Tables not mobile responsive | P2 | 3-4h | Need horizontal scroll wrapper or card layout on mobile. |
| **W11** | #21: ReCAPTCHA width overflows form on mobile | P2 | 30min | ReCAPTCHA v2 is 304px fixed width. Add responsive wrapper with `transform: scale()` on small screens. |
| **W12** | #23: "No file uploaded" error on profile picture upload | P1 | 1h | `ProfileImage.jsx` sends to `/api/user/upload-profile-picture/{userId}`. Likely FormData field name mismatch with backend expectation. |
| **W13** | Partner users need invoice flow instead of payout request | P1 | 2h | Partner dashboard currently uses `POST /api/payout-request/request`. Need to add invoice submission UI similar to commercial (`SubmitInvoice.jsx`), using `/api/quarterly-statements/invoices`. |
| **W14** | Commercial payout modal uses hardcoded/mock data | P1 | 1h | "Request Payout" in commercial dashboard is not connected to real endpoints. Since commercial uses invoice flow, either remove the payout option or wire it correctly. |

### dcarbon-server — 8 issues

| # | QA Issue | Severity | Effort | Details |
|---|----------|----------|--------|---------|
| **S1** | #2: Historical Collection route `/run` vs `/start` | P0 | 5min | Confirm `/api/historical-collection/start` is the correct route. |
| **S2** | #5: Facility docs approved but customer details shows unapproved | P0 | 2h | `facilityStatus` vs `documentStatus` out of sync between models. |
| **S3** | #6: No REC data for meter 2453 — forward vs reverse energy data | P0 | 2h | Investigate if REC aggregation uses forward or reverse. Instapull shows data but system doesn't. |
| **S4** | #7: Commission calculation and REC generation return 404 | P0 | 1h | Verify `/api/commission-cron` and `/api/monthly-rec-data/aggregate` routes are mounted. |
| **S5** | #16: Invoice endpoints not role-restricted | P1 | 1h | `GET /api/quarterly-statements/invoices` → admin only. `GET /api/quarterly-statements/invoices/:id` → owner + admin. |
| **S6** | #17: Payout approve/reject not admin-restricted | P1 | 30min | Add admin role guard to `POST /api/payout-request/approve` and `/reject`. |
| **S7** | #26: Duplicate commission structure returns raw Prisma error | P1 | 30min | Catch P2002 unique constraint violation → return 409 with readable message. |
| **S8** | #19: Notifications not created after instapull utility auth | P1 | 1-2h | Server needs to create a notification record when utility auth completes successfully via instapull webhook/callback. |

---

## Execution Order

### Phase 1: d-carbon-admin (this repo)

**Order:** A2 → A6 → A3 → A4 → A5 → A7 → A8 → A1

1. **A2** (5min): Fix Historical Collection endpoint `/run` → `/start`
2. **A6** (30min): Fix FAQ — add missing `CONFIG` import to `Faq.jsx`, wire `HelpCentre.jsx` to API
3. **A3** (30min): Fix commission/REC generation job endpoints
4. **A4** (1-2h): Add commission, sales agent bonus, partner bonus triggers to System Jobs
5. **A5** (30min): Remove admin registration page
6. **A7** (1h): Add pagination to Registration Pipeline
7. **A8** (2h): Verify/build admin invoice management for commercial users
8. **A1** (2h): Fix document ZIP download CORS issue

### Phase 2: dcarbon-webapp

**Order:** W6 → W7 → W2 → W1 → W4 → W5 → W12 → W3 → W13 → W14 → W9 → W11 → W10 → W8

1. **W6** (P0): Fix agreement signing 422 error
2. **W7** (P0): Prevent agreement bypass on "continue existing"
3. **W2** (P0): Add role-based dashboard access guards
4. **W1** (P0): Harden 401 interceptor — clear all keys, cover edge cases
5. **W4** (P1): Remove duplicate sign-in button
6. **W5** (P1): Remove solar system management gating
7. **W12** (P1): Fix profile picture upload
8. **W3** (P1): Add owner details to residential account page
9. **W13** (P1): Add invoice flow for partners (replace payout request)
10. **W14** (P1): Fix/remove commercial payout mock — they use invoices
11. **W9** (P1): Verify notification UI works when server sends notifications
12. **W11** (P2): Fix ReCAPTCHA width on mobile
13. **W10** (P2): Mobile responsive tables
14. **W8** (P2): Utility auth status visibility for additional auths

### Phase 3: dcarbon-server

**Order:** S1 → S4 → S2 → S3 → S7 → S5 → S6 → S8

1. **S1**: Confirm/fix Historical Collection route
2. **S4**: Fix commission-cron and monthly-rec-data route mounting
3. **S2**: Fix facility doc approval → customer status sync
4. **S3**: Investigate forward vs reverse energy data for RECs
5. **S7**: Graceful error for duplicate commission structure
6. **S5**: Add role guards to invoice endpoints
7. **S6**: Add admin guard to payout approval endpoints
8. **S8**: Create notifications after instapull utility auth completion

---

## Key Findings from Investigation

### FAQ — Root Cause Found
`Faq.jsx` is missing `import CONFIG from '@/lib/config'` — all 4 API calls (fetch, create, update, delete) throw `ReferenceError`. This explains both #24 ("Failed to fetch FAQs") and #25 ("Operation failed on FAQ create"). Single import fix resolves both.

### Notification System — Not a Business Decision
Notification UI is fully implemented across all 4 webapp dashboards. The issue is **server-side**: after migrating to instapull for utility auth, the server no longer creates notification records when auth completes. The fix is adding a `createNotification()` call in the server's instapull webhook/callback handler.

### Payout/Invoice Flow — Current State
| User Type | Current Flow | Correct Flow | Gap |
|-----------|-------------|--------------|-----|
| Residential | Payout request (redemption) | Payout request | None — working correctly |
| Commercial | Invoice submission + broken payout mock | Invoice only | Remove payout mock, verify invoice-to-admin pipeline |
| Partner | Payout request only | Invoice submission | Need to add invoice UI, similar to commercial |

### Document ZIP Download — CORS Issue
GCS signed URLs (`storage.googleapis.com/dcarbon-dev-env-storage/...`) block cross-origin `fetch()` from the browser. Options:
1. **Backend proxy** — add `GET /api/facility/download-document?url=...` that fetches server-side and streams back
2. **Direct download links** — open each doc in a new tab instead of ZIP packaging
3. **GCS CORS config** — add the admin domain to GCS bucket CORS policy (requires GCP access)

---

## Estimates

| Phase | Issues | Effort |
|-------|--------|--------|
| d-carbon-admin | 8 | ~8h |
| dcarbon-webapp | 14 | ~18h |
| dcarbon-server | 8 | ~10h |
| **Total** | **30** | **~36h** |

P0 items alone: **~10h** across all repos.
