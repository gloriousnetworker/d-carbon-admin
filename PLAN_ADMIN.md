# DCarbon Admin Web App — Fix & Change Plan
> Source: Meeting Notes — March 16, 2026
> Scope: Admin-facing web application (used internally by DCarbon staff)

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
