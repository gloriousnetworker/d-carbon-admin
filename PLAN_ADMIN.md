# DCarbon Admin Web App — Fix & Change Plan
> Source: Meeting Notes — March 16, 2026 + March 18, 2026
> Scope: Admin-facing web application (used internally by DCarbon staff)
> Last updated: March 20, 2026

---

## Priority Classification

| Priority | Meaning |
|---|---|
| 🔴 CRITICAL | Blocks admin operations or data integrity |
| 🟠 HIGH | Key admin workflows that are broken or missing |
| 🟡 MEDIUM | Confirmed improvements from the meeting demo |
| 🟢 LOW | UI cleanup, label changes, polish |

---

## 🟠 HIGH — Registration Pipeline & User Management

### 1. Add Status Filter to Registration Pipeline

**Context:** Phillip Kopp immediately requested the ability to filter the registration pipeline by status (e.g., show only pending accounts). This was confirmed and agreed upon by both Awam Victor and Chimdinma Kalu.

**Current state:** Registration pipeline shows all registrants in a single unfiltered list.

**Target state:** A filter/tab bar at the top of the registration pipeline with status options:
- All
- Pending
- Under Review
- Approved
- Rejected / Cancelled

**What to change:**
- Add a filter UI control (tabs or dropdown) to the Registration Pipeline page
- On filter change: call `GET /api/admin/registration-pipeline?status=PENDING` (confirm exact query param with server team)
- The list should re-fetch or filter client-side based on the selected status
- Default view: "All" or "Pending" (confirm with Chimdinma/Phillip which default makes more operational sense)

**API dependency:** Server must support `status` query param on the registration pipeline endpoint. Confirm with server team.

---

### 2. Add Status Filter to User Management

**Context:** Same as above — filtering should be available on the User Management section as well.

**What to change:**
- Add status filter to the User Management list page
- For **Customers**: filter by `isActive`, `registrationStep`, account status
- For **Partners**: filter by partner status, approval state
- Controls: tabs or dropdown, same pattern as Registration Pipeline filter (item #1) for UI consistency

---

### 3. Show Company Name as Primary Identity for Commercial Users & Partners

**Context:** Phillip Kopp: "The admin is more likely to recognize [commercial accounts and partners] by their corporate identity." Individual name may refer to different people within the same company.

**What to change:**
- In all admin list views that show commercial users or partners, display **company name as the primary text** (large, prominent)
- Individual owner name shown **secondary** (smaller, grey text or subtitle)
- This affects:
  - User Management list (commercial section)
  - User Management list (partners section)
  - Registration Pipeline list
  - Any search results that return commercial/partner users
  - Invoice management list (payout section)

**Data mapping:**
- Commercial users: use `CommercialUser.companyName` (primary) + `User.firstName + User.lastName` (secondary)
- Partners: use `Partner.name` (primary — already company-level) + `User.firstName + User.lastName` (secondary, if linked user exists)

---

## 🟡 MEDIUM — Payout & Invoice Admin Workflow

### 4. Invoice Review — Discrepancy Auto-Flag

**Context:** When a partner submits an invoice, the admin UI should automatically flag discrepancies where the user-entered invoice amount differs from the system-calculated statement amount.

**Current state:** Invoice review exists but discrepancy flagging may not be implemented.

**Target state:**
- In the invoice list, add a visual indicator (red icon, warning badge) on rows where `hasDiscrepancy: true`
- In the invoice detail view:
  - Show side-by-side comparison: "Partner's stated amount: $X.XX" vs "System calculated amount: $Y.YY"
  - Highlight the difference in red if they don't match
  - The system flag should be automatic — admin does not need to calculate manually

**API dependency:** Server must return `hasDiscrepancy`, `partnerInvoiceAmount`, `systemCalculatedAmount` on the invoice record (see `PLAN_SERVER.md` item #7).

---

### 5. Invoice Review — Approve / Reject Flow

**Context:** The admin can approve or reject a partner invoice. Rejection requires a comment/reason.

**What to confirm / implement:**
- Approve button → calls `PATCH /api/payout-request/:id/approve`
- Reject button → opens a modal with a required text field for rejection reason → calls `PATCH /api/payout-request/:id/reject` with `{ reason: "..." }`
- After admin rejects: the partner sees the rejection reason in their invoice submission history
- Status transitions to display:
  - `PENDING` → waiting for admin review
  - `APPROVED` → invoice accepted, payout queued
  - `REJECTED` → show reason
  - `PAID` → payment deposited into bank

**Clarification from meeting:** Payout is marked as complete **only when payment has been deposited into the bank**, not just when the invoice is approved. There must be a separate "Mark as Paid" action available to admin.

---

### 6. Payout View — Fix Green Profile Box

**Context:** Phillip Kopp: the green box is a "wasteful UI", takes too much space, and is missing key commercial details.

**What to change:**
- Reduce the size/padding of the user profile box in the payout/invoice views
- For **commercial users and partners**: display company name and business address prominently
- For **residential users**: individual name is acceptable
- Remove excess whitespace — the box should not dominate the screen

---

### 7. Revenue Wallet Display — Commercial & Partner Cleanup

**Context:** Remove "Held Amount" from the wallet display for commercial users and partners.

**What to change:**
- On the admin view of a commercial user or partner's wallet/revenue section:
  - Show: "Total Earnings" and "Available Balance" only
  - Remove: "Held Amount"
- Ensure terminology is consistent: "Revenue" or "Total Earnings" (not "Commission" for partners)

---

## 🟡 MEDIUM — REC Management Admin Tools

### 8. New Admin Action: Approve / Reject / Adjust REC Generation per Facility

**Context:** The three-step REC workflow requires an admin to manually mark generation as approved after WREGIS (the regulator) approves it. Admin must also be able to reject or adjust per-facility amounts if the regulator disagrees.

**What to build:**
- In the Monthly REC Data section (or Facility Detail view):
  - Show each facility's monthly REC generation with a `wregisStatus` indicator: `Pending Submission | Submitted | Approved | Rejected | Adjusted`
  - For each record, admin actions:
    - **Approve** → confirms WREGIS approved this facility's generation; optionally enter `approvedRecsAmount` if different from generated
    - **Reject** → opens modal for admin note/reason; marks record as `REJECTED`
    - **Adjust** → opens modal with numeric input for adjusted REC amount + note
  - Add a **"Bulk Approve"** checkbox + button for batch processing large submission sets

**API endpoints needed (from `PLAN_SERVER.md` item #2):**
- `PATCH /api/monthly-rec-data/:id/approve`
- `PATCH /api/monthly-rec-data/:id/reject`
- `PATCH /api/monthly-rec-data/:id/adjust`
- `POST /api/monthly-rec-data/bulk-approve`

---

### 9. REC Sales Management — Aggregate Overview

**Context:** The REC Sales Management overview should show aggregate totals, not a per-facility monthly list.

**Target admin view:**
- Summary stat cards:
  - Total RECs Available (approved, unsold)
  - Total RECs Sold (lifetime)
  - Most Recent REC Price (latest from `RecPrice`)
- Below summary: REC Sales entries table (multiple entries per month possible — this is the "entries" report)

**What to remove:** The long per-facility monthly list from this overview page.

**Where detailed monthly facility data goes:** Inside the individual Facility Detail page (within User Management → select a facility).

---

### 10. Three-Report Structure in Admin Reporting

**Context:** Phillip Kopp outlined three distinct reports that the admin reporting section must provide.

**Report 1 — Points Report** (tab/section in admin reporting):
- Columns: User / Facility, Earned Points, Redeemed Points, Open Balance Points
- Filter by: date range, user type (residential/commercial), status
- Note: Points are generated regardless of WREGIS approval

**Report 2 — REC Generation Report** (tab/section in admin reporting):
- Columns: Facility, Month/Year (Vintage), RECs Submitted, RECs Approved, WREGIS Status
- Filter by: vintage (month/year), zip code, facility, wregisStatus
- This report is what gets exported to WREGIS

**Report 3 — REC Sales Entries** (tab/section in admin reporting):
- Columns: Sale Date, Vintage, RECs Sold, Price Per REC, Total Amount, Buyer
- Multiple entries per month (unlike the monthly points/generation reports)
- Filter by: vintage, date range, buyer, zip code

**API dependency:** Requires new `/api/reports/*` endpoints (see `PLAN_SERVER.md` item #4).

---

### 11. WREGIS Export with Chunking

**Context:** Exporting REC generation data to WREGIS for large datasets (e.g., 10,000 facilities) must produce chunked files because Excel has a row limit.

**What to change:**
- On the admin export action for REC generation:
  - If the server returns `{ files: [url1, url2, ...], chunks: N }`:
    - Show download buttons for each chunk: "Download Part 1", "Download Part 2", etc.
    - OR trigger a zip file download (if server returns a single zip URL)
  - Display a count: "Exporting X facilities across Y files"
- Do not change the trigger UI — this should be transparent to the admin other than the multi-file download

---

### 12. Partner Performance Report — Column Changes

**Context:** Remove irrelevant columns, add meaningful ones.

**What to change on the admin partner performance page:**
- **Remove** columns: `Address`, `Status`
- **Add** columns: `Company Name`, `RECs Generated`
- Final column order: Company Name → Total Referrals → Total Facilities (approved+registered) → RECs Generated
- "Total Facilities" count: only fully approved and registered facilities

---

### 13. REC Reporting — Label Change

**Context:** The metric labelled "generation" in the commercial REC reporting view is mislabeled.

**What to change:**
- Change label `"generation"` → `"Commercial REC Sales"` on the relevant admin reporting component
- Text/label change only

---

## 🟢 LOW — Label & Terminology Cleanup

### 14. Remove Commercial/Residential Segmentation from REC Generation View

**Context:** Phillip Kopp: keep it simple — one REC type flowing through, no residential/commercial split in the generation view itself.

**What to change:**
- REC generation view should show `"REC Generation"` without commercial/residential prefixes
- Remove any tabs or filters labelled "Commercial REC Generation" / "Residential REC Generation" from this specific view
- The facility type (commercial/residential) is still available in the facility details — it just should not be a top-level segmentation in this view

---

### 15. Fix HTTPS Certificate Error on Corporate Website

**Context:** Phillip Kopp encountered an HTTPS invalid certificate error on the corporate website. Chimdinma Kalu committed to investigating.

**Action:** This is a DevOps/infrastructure task, not a UI code change. Check:
- SSL certificate expiry on the corporate website domain
- Certificate chain validity
- Auto-renewal configuration (Let's Encrypt / cloud provider)

---

## Summary Table

| # | Item | Priority | Area |
|---|---|---|---|
| 1 | Filter registration pipeline by status | 🟠 HIGH | Registration Pipeline |
| 2 | Filter user management by status | 🟠 HIGH | User Management |
| 3 | Show company name as primary identity for commercial/partners in all lists | 🟠 HIGH | User Management |
| 4 | Invoice review — auto-flag discrepancies (side-by-side amount comparison) | 🟡 MEDIUM | Invoice / Payout |
| 5 | Invoice approve/reject flow + separate "Mark as Paid" action | 🟡 MEDIUM | Invoice / Payout |
| 6 | Fix green profile box in payout view (smaller, show company/address) | 🟡 MEDIUM | Payout UI |
| 7 | Revenue wallet — remove Held Amount for commercial/partner views | 🟡 MEDIUM | Wallet |
| 8 | Admin: approve/reject/adjust REC generation per facility + bulk approve | 🟡 MEDIUM | REC Management |
| 9 | REC Sales Management — aggregate overview + move monthly detail to facility page | 🟡 MEDIUM | REC Reporting |
| 10 | Three-report structure: Points, REC Generation, REC Sales Entries | 🟡 MEDIUM | Admin Reporting |
| 11 | WREGIS export — multi-file chunked download UI | 🟡 MEDIUM | REC Export |
| 12 | Partner performance table: remove Address/Status, add Company Name/RECs Generated | 🟡 MEDIUM | Partner Reporting |
| 13 | REC reporting label: "generation" → "Commercial REC Sales" | 🟢 LOW | REC Reporting |
| 14 | Remove commercial/residential split from REC generation view | 🟢 LOW | REC Reporting |
| 15 | Fix HTTPS certificate on corporate website (DevOps) | 🟢 LOW | Infrastructure |

---

## Cross-System Dependencies

The admin plan has several items that require server-side work to be completed first:

| Admin Item | Depends On (Server) |
|---|---|
| Invoice discrepancy auto-flag (#4) | PLAN_SERVER #7 — `hasDiscrepancy` field |
| REC approve/reject/adjust actions (#8) | PLAN_SERVER #1 & #2 — WREGIS status fields + endpoints |
| Three-report structure (#10) | PLAN_SERVER #4 — new `/api/reports/*` endpoints |
| WREGIS export chunking UI (#11) | PLAN_SERVER #5 — chunked export response format |
| Partner performance columns (#12) | PLAN_SERVER #10 — updated response fields |
| Aggregate REC view (#9) | PLAN_SERVER #9 — `GET /api/rec/summary` |

**Recommended sequence:** Complete all 🔴 CRITICAL server items first, then start admin and webapp work in parallel.

---

*Generated from meeting notes — March 16, 2026*

---

---

# March 18, 2026 Meeting — New Admin Items

> Source: DCarbon Project — 2026_03_18 19_56 WAT — Notes by Gemini
> Added: March 20, 2026

---

## 🟠 HIGH — Registration Pipeline Fixes (mixed dependencies)

### 16. Registration Pipeline — Show Invitee Company Name
**Blocked by: PLAN_SERVER Item 16** 🔲

**Meeting context:**
During the live demo, Awam Victor showed "AK" appearing as just a name instead of "AK B company". This is the most-mentioned visual bug from the meeting. The root cause is that the registration pipeline reads from `GET /api/admin/referrals`, and the `Referral` table stores the invitee only as an email string — no join to the `User` table exists today.

**What will change on the server (Item 16):**
The `GET /api/admin/referrals` response will include a new `inviteeUser` object on each row:
```json
"inviteeUser": {
  "id": "...",
  "userType": "COMMERCIAL",
  "companyName": "AK B company",
  "ownerFullName": "AK Full Name",
  "displayName": "AK B company"
}
```

**What the admin app needs to do (once server Item 16 ships):**
- Replace the current name display in the registration pipeline list with `row.inviteeUser.displayName`
- For COMMERCIAL rows: show `companyName` as primary (large, bold), `ownerFullName` as secondary (smaller, grey)
- For RESIDENTIAL rows: show `firstName + lastName` as before
- For PARTNER rows: show partner name as before
- If `inviteeUser` is `null` (user not yet registered despite referral existing): show `row.inviteeEmail` with an "Unregistered" badge

---

### 17. Registration Pipeline — Fix Partner Click → Blank Page Routing
**No server dependency.** ✅ Can start now.

**Meeting context:**
When clicking a partner user row in the registration pipeline, the admin is redirected to a blank page. Clicking a commercial user works correctly. The fix is a routing correction in the admin app.

**What to fix:**
- Update the row click handler in the registration pipeline to check `inviteeUser.userType` (or `row.customerType`):
  - If `COMMERCIAL` → navigate to commercial user detail page (already working)
  - If `PARTNER` → navigate to **partner detail page** (the same one accessible via User Management → Partner Management)
  - If `RESIDENTIAL` → navigate to residential user detail page
- Ensure the partner detail page accepts the userId from a route param regardless of how it was navigated to

---

## 🟠 HIGH — Payout & Statement Screen Fixes (can start NOW)

### 18. Payout + Statement Screens — Restore All Personal Details + Add Business Name
**Server dependency:** Server-03 ✅ already complete.

**Meeting context:**
Chimdinma Kalu: *"the intention was to add business details, not remove existing user details such as name and address."* The admin payout and statement review pages had existing fields stripped during the March 16 implementation, leaving only username and email visible.

**What to fix:**

For **commercial user** payout/invoice screens in admin:
- Restore ALL previously shown fields: name, email, address, phone number
- ADD on top: `companyName` (primary identifier, large) + `ownerFullName` (secondary)
- Fetch commercial profile from `GET /api/user/get-commercial-user/:userId` for the full set of fields

For **partner** payout/invoice screens in admin:
- Restore ALL personal fields: name, email, address, phone
- ADD: partner company/organization name and business address
- Fetch from the partner profile endpoint

For **residential user** payout screens in admin:
- Restore all personal detail fields (confirm none were inadvertently removed)

**Key principle from meeting:** Adding business details is additive — never replace or remove existing user detail fields.

---

## 🟡 MEDIUM — Invoice Admin Workflow (mixed dependencies)

### 19. Admin Invoice List — Show Commercial User Invoices
**Server dependency:** Server Item 17 ✅ partially unblocks this (partners fully unblocked once done).

**Meeting context:**
*"The feature to 'submit invoice' was only built for the partner but should be available to commercial users as well."* On the admin side, the invoice review list (`GET /api/quarterly-statements/invoices`) already returns all invoices regardless of userType. But if the admin invoice list is filtering to only show PARTNER invoices, this filter must be removed or updated to include COMMERCIAL.

**What to fix:**
- Confirm the admin invoice list does NOT filter by `userType=PARTNER` only
- The `GET /api/quarterly-statements/invoices?userType=COMMERCIAL` query param works — use it when showing the commercial-specific invoice tab if applicable
- Ensure the approve/reject actions work for COMMERCIAL invoices (same flow as PARTNER — `PUT /api/quarterly-statements/invoices/:id/approve`)

---

### 20. Admin — Quarterly Earnings Breakdown View per User
**Blocked by: PLAN_SERVER Item 18** 🔲

**Meeting context:**
Chimdinma requested that the earning statement should show what is due to the user per quarter/facility. On the admin side, this means the admin can view the breakdown of what a user earned in a given quarter before approving their invoice.

**Target view (in admin, on the invoice detail page or user detail page):**
- A table showing the quarterly earnings breakdown for the user being reviewed:

| Facility | Type | Amount Earned | Quarter | Year |
|---|---|---|---|---|
| Solar Park A | COMMERCIAL | $750.00 | Q1 | 2026 |
| Bonus | — | $500.00 | Q1 | 2026 |
| **Total** | | **$1,250.00** | | |

- The `Total Due` from this table should match the invoice amount — the admin can see at a glance whether the invoice matches what the system calculated
- This is especially useful alongside the discrepancy flag (existing Admin Item #4)

**API to use (once ready):** `GET /api/quarterly-statements/earnings-breakdown?userId=:id&quarter=Q&year=Y&userType=T`

**What to build now (before server Item 18 ships):**
- The UI shell can be built now — just show a loading skeleton where the breakdown table will appear
- Wire up the actual API call once server Item 18 is deployed

---

## Updated Summary Table (all items)

| # | Item | Priority | Area | Server Dep | Status |
|---|---|---|---|---|---|
| 1 | Filter registration pipeline by status | 🟠 HIGH | Registration Pipeline | None ✅ | Start now |
| 2 | Filter user management by status | 🟠 HIGH | User Management | None ✅ | Start now |
| 3 | Company name as primary identity in all admin lists | 🟠 HIGH | User Management | Server-03 ✅ | Start now |
| 4 | Invoice discrepancy auto-flag (side-by-side amounts) | 🟡 MEDIUM | Invoice / Payout | Server-07 ✅ | Start now |
| 5 | Invoice approve/reject + separate "Mark as Paid" action | 🟡 MEDIUM | Invoice / Payout | None ✅ | Start now |
| 6 | Fix green profile box (smaller, company name/address) | 🟡 MEDIUM | Payout UI | Server-03 ✅ | Start now |
| 7 | Revenue wallet — remove Held Amount for commercial/partner | 🟡 MEDIUM | Wallet | Server-08 ✅ | Start now |
| 8 | Admin: approve/reject/adjust REC per facility + bulk approve | 🟡 MEDIUM | REC Management | Server-01/02 ✅ | Start now |
| 9 | REC Sales Management — aggregate overview | 🟡 MEDIUM | REC Reporting | Server-09 ✅ | Start now |
| 10 | Three-report structure: Points, REC Generation, Sales | 🟡 MEDIUM | Admin Reporting | Server-04 ✅ | Start now |
| 11 | WREGIS export — multi-file chunked download UI | 🟡 MEDIUM | REC Export | Server-05 ✅ | Start now |
| 12 | Partner performance table: remove Address/Status, add Company/RECs | 🟡 MEDIUM | Partner Reporting | Server-10 ✅ | Start now |
| 13 | REC reporting label: "generation" → "Commercial REC Sales" | 🟢 LOW | REC Reporting | None ✅ | Start now |
| 14 | Remove commercial/residential split from REC generation view | 🟢 LOW | REC Reporting | None ✅ | Start now |
| 15 | Fix HTTPS certificate on corporate website | 🟢 LOW | Infrastructure | None | DevOps task |
| **16** | **Registration pipeline — show invitee company name** | 🟠 HIGH | Registration Pipeline | Server Item 16 ✅ | **Start now** |
| **17** | **Registration pipeline — fix partner click routing** | 🟠 HIGH | Registration Pipeline | None ✅ | **Start now** |
| **18** | **Payout/statement screens — restore all fields + add business name** | 🟠 HIGH | Payout Screens | Server-03 ✅ | **Start now** |
| **19** | **Admin invoice list — include commercial user invoices** | 🟡 MEDIUM | Invoice | None ✅ | **Start now** |
| **20** | **Quarterly earnings breakdown view on invoice detail page** | 🟡 MEDIUM | Invoice / Reporting | Server Item 18 ✅ | **Start now** |

---

## Updated Cross-System Dependencies

| Admin Item | Depends On | Server Status |
|---|---|---|
| Item 4 — Invoice discrepancy auto-flag | PLAN_SERVER #7 | ✅ Done |
| Item 8 — REC approve/reject/adjust | PLAN_SERVER #1 & #2 | ✅ Done |
| Item 10 — Three-report structure | PLAN_SERVER #4 | ✅ Done |
| Item 11 — WREGIS export chunking UI | PLAN_SERVER #5 | ✅ Done |
| Item 12 — Partner performance columns | PLAN_SERVER #10 | ✅ Done |
| Item 9 — Aggregate REC view | PLAN_SERVER #9 | ✅ Done |
| Item 3, 6, 18 — Company name in lists/payout | PLAN_SERVER #3 (March 16) | ✅ Done |
| **Item 16 — Pipeline invitee company name** | **PLAN_SERVER Item 16** | ✅ DONE |
| **Item 20 — Earnings breakdown view** | **PLAN_SERVER Item 18** | ✅ DONE |

**All server dependencies are resolved. Every admin item can start now.**

---

*Updated: March 20, 2026 — All server fixes complete. All admin items fully unblocked.*

---

---

# March 21, 2026 — 🚨 SERVER ACTION REQUIRED: Facility Verification Blocked by Server-Side Document Status Check

> Identified: March 21, 2026
> Status: **PENDING SERVER FIX**
> Affects: Residential facility verification + Commercial facility verification

## Problem

The admin can now see the "Verify Facility" button (frontend fixed — see sections below), but clicking it still fails with this server error toast:

> **"All required documents must be approved before verification"**

The server's verify endpoints are running their own document status check and rejecting the request because they require `status === "APPROVED"` strictly. Documents that have progressed to `WREGIS_SUBMITTED` or `REGULATOR_APPROVED` (which are **downstream** of internal approval) are being treated as "not approved."

## Endpoints affected

- `PUT /api/admin/residential-facility/:id/verify`
- `PUT /api/admin/commercial-facility/:id/verify`

## Required server fix

In both verify endpoint handlers, update the document status check from:

```js
// Current (blocking verification)
doc.status === "APPROVED"
```

To:

```js
// Required fix — accept any status that has cleared internal review
["APPROVED", "WREGIS_SUBMITTED", "REGULATOR_APPROVED"].includes(doc.status)
```

**Why:** Once a document is internally approved (`APPROVED`), the admin may then submit it to WREGIS (`WREGIS_SUBMITTED`) or it may receive regulator approval (`REGULATOR_APPROVED`). All three states confirm the document has passed the internal admin review. Only `REGULATOR_REJECTED` should block verification — it means the document was sent to WREGIS and came back rejected and needs re-attention before the facility should be verified.

## How the error surfaces on the frontend

```
Admin clicks "Verify Facility"
  → PUT /api/admin/[residential|commercial]-facility/:id/verify
  → Server returns 4xx with { message: "All required documents must be approved before verification" }
  → Frontend: throw new Error(errorData.message)
  → toast.error(err.message)   ← this is what the admin sees
```

Frontend code references:
- `residential-details/ResidentialDetails.jsx` lines 251–253
- `commercial-details/CommercialDetails.jsx` lines 275–277

## Frontend status: ✅ Already fixed
The `canVerifyFacility` condition in both DocumentsModal files now correctly accepts `WREGIS_SUBMITTED` and `REGULATOR_APPROVED`. The button shows at the right time. Only the server validation remains.

---

# March 21, 2026 — Bug Fix: Commercial Facility Verify Button Missing

> Fixed: March 21, 2026
> File: `src/components/dashboard/user-management/customer-details/commercial-details/DocumentsModal.jsx`

---

## Bug Description

**Reported:** Admin can no longer see the "Verify Facility" button on a commercial facility even after all documents have been approved.

**Root cause (3 compounding issues):**

### Issue 1 — `every()` ran across ALL documents with no mandatory/optional distinction
```js
// BEFORE (broken)
const allDocumentsApproved = documents.every(doc => doc.status === "APPROVED");
```
The commercial `documents` array had 12 entries with no `mandatory` flag. Any document whose status was `null` (never uploaded), `"PENDING"`, or `"SUBMITTED"` would cause `every()` to return `false` and hide the button — even if all required docs were approved.

### Issue 2 — Newly added document caused immediate regression
`"Utility Interconnection Agreement"` was added to the frontend documents array using field `facility.interconnectionAgreementStatus`. Existing commercial facilities in the database do not have this field populated — it returns `null`. `null === "APPROVED"` is `false`, so the button disappeared for every existing facility the moment this document type was added.

### Issue 3 — WREGIS-track statuses not counted as "past approval"
If a document had progressed to `"WREGIS_SUBMITTED"` or `"REGULATOR_APPROVED"` (downstream of internal approval), the old `=== "APPROVED"` check still failed, blocking verification even though the document had already cleared the internal review step.

### Why residential worked but commercial didn't
The residential `DocumentsModal.jsx` already used the correct pattern:
```js
const mandatoryDocsApproved = docList
  .filter(doc => doc.mandatory)   // only mandatory docs gated verification
  .every(doc => doc.status === "APPROVED");
```
Commercial was missing the `mandatory` distinction entirely.

---

## Fix Applied

**File:** `src/components/dashboard/user-management/customer-details/commercial-details/DocumentsModal.jsx`
**Lines changed:** ~102–118

1. Added `mandatory: true / false` to every document entry in the `documents` array:

| Document | Mandatory |
|---|---|
| WREGIS Assignment | ✅ true |
| Finance Agreement | ❌ false |
| Solar Installation Contract | ✅ true |
| Utility Interconnection Agreement | ❌ false |
| Utility PTO Letter | ✅ true |
| Single Line Diagram | ✅ true |
| Installation Site Plan | ✅ true |
| Panel/Inverter Datasheet | ❌ false |
| Revenue Meter Datasheet | ❌ false |
| Utility Meter Photo | ✅ true |
| Assignment of Registration Right | ✅ true |
| Acknowledgement of Station Service | ✅ true |

2. Replaced `allDocumentsApproved` with a proper `mandatoryDocsApproved` check that also accepts WREGIS-track statuses:

```js
// AFTER (fixed)
const docPassesVerification = (status) =>
  ["APPROVED", "WREGIS_SUBMITTED", "REGULATOR_APPROVED"].includes(status);

const mandatoryDocsApproved = documents
  .filter(doc => doc.mandatory)
  .every(doc => docPassesVerification(doc.status));

const canVerifyFacility = mandatoryDocsApproved && facility.status !== "VERIFIED";
```

---

## What was NOT changed
- The button itself (`{canVerifyFacility && <Button>Verify Facility</Button>}`) — unchanged
- The `onVerifyFacility` prop wiring in `CommercialDetails.jsx` — unchanged
- The `handleVerifyFacility` function and API call (`PUT /api/admin/commercial-facility/:id/verify`) — unchanged
- The residential `DocumentsModal.jsx` — unaffected (was already correct)
- All other components — no changes required

---

## ⚠️ Action Required — Confirm mandatory flags with the team
The `mandatory` classification above mirrors the residential document requirements. Confirm with Awam Victor / Chimdinma Kalu whether "Utility Interconnection Agreement" should ever be mandatory for commercial facility verification. If yes, change its flag to `mandatory: true` in `commercial-details/DocumentsModal.jsx` line ~106.

---

*Fix logged: March 21, 2026*

---

---

# March 21, 2026 — Bug Fix: Verify Facility Button Missing (Residential + Commercial)

> Fixed: March 21, 2026
> Files:
> - `src/components/dashboard/user-management/customer-details/residential-details/DocumentsModal.jsx`
> - `src/components/dashboard/user-management/customer-details/commercial-details/DocumentsModal.jsx`

---

## Bug Description

**Reported:** Admin cannot see the "Verify Facility" button on a residential facility even when the document summary bar shows all 11 documents as approved (11/11).

**Root cause — UI counter and verification condition were out of sync:**

The document summary bar counts documents as "approved" using `isInRegulatorTrack()`:
```js
// Line 554 — residential DocumentsModal
{docList.filter(d => isInRegulatorTrack(d.status)).length} approved
```

`isInRegulatorTrack` accepts: `APPROVED`, `WREGIS_SUBMITTED`, `REGULATOR_APPROVED`, `REGULATOR_REJECTED`

But the verification condition used a strict check:
```js
// BEFORE (broken) — line 178
const mandatoryDocsApproved = docList
  .filter(doc => doc.mandatory)
  .every(doc => doc.status === "APPROVED");  // ← strict equality
```

So when an admin approves a document and then clicks **"Submit to WREGIS"** on it, the status changes from `"APPROVED"` to `"WREGIS_SUBMITTED"`. The counter still shows it as approved, the row badge still shows "Approved" — but the verification condition fails because `"WREGIS_SUBMITTED" !== "APPROVED"`. The button disappears with no explanation.

**Scenario that triggers the bug:**
1. Admin approves all 11 documents → button appears ✅
2. Admin clicks "Submit to WREGIS" on any doc → status → `WREGIS_SUBMITTED`
3. UI shows "11 approved" and "Approved" badge → but button is gone ❌

---

## Fix Applied

**Same fix applied to both residential and commercial.**

```js
// AFTER (fixed)
const docPassesVerification = (status) =>
  ["APPROVED", "WREGIS_SUBMITTED", "REGULATOR_APPROVED"].includes(status);

const mandatoryDocsApproved = docList
  .filter(doc => doc.mandatory)
  .every(doc => docPassesVerification(doc.status));

const canVerifyFacility = mandatoryDocsApproved && facility.status !== "VERIFIED";
```

**Logic:**
- `APPROVED` → passes ✅ (internally approved, not yet sent to WREGIS)
- `WREGIS_SUBMITTED` → passes ✅ (was internally approved, now submitted to WREGIS)
- `REGULATOR_APPROVED` → passes ✅ (approved at every level)
- `REGULATOR_REJECTED` → does NOT pass ❌ (regulator rejected — needs admin attention before facility can be verified)
- `PENDING`, `SUBMITTED`, `REQUIRED`, `null` → do NOT pass ❌

This is now consistent with what the document summary bar and the Internal Status badge column already show to the admin.

---

## What was NOT changed
- The document approval/reject/WREGIS submit action buttons — unchanged
- The `handleVerifyFacility` functions and API calls — unchanged
- The document summary counter logic — unchanged (it was already correct)
- All other components — no changes required

*Fix logged: March 21, 2026*
