# DCarbon Admin — Implementation Plan
> Derived from: Meeting Notes (March 16, 2026) + PLAN_ADMIN.md
> Scope: Admin dashboard only (`dcarbon-admin`)
> Last updated: 2026-03-17 — Phase 2 complete (all server endpoints now live)

---

## HOW TO READ THIS PLAN

- **Phase 1** = Frontend-only changes. Can be done immediately, no backend dependency.
- **Phase 2** = Requires server endpoints to be live first (see `PLAN_SERVER.md`).
- Each item maps directly to a `PLAN_ADMIN.md` fix number.
- Items within a phase are ordered by priority (HIGH → MEDIUM → LOW).

---

## PHASE 1 — FRONTEND-ONLY CHANGES (Start Now)

---

### FIX-01 · Registration Pipeline — Status Filter Tabs
**PLAN_ADMIN ref:** #1
**Priority:** 🟠 HIGH
**File:** `src/components/dashboard/registration-pipeline/RegistrationPipeline.jsx`

**Current state:**
The pipeline already has 7 stage cards (Invited, Registered, Docs Under Review, Docs Approved, Verified, Active, Terminated) that act as filters via `activeFilter` state. Clicking a card filters the list by that stage. A text search also exists.

**Problem:**
The stage cards only filter by pipeline stage, not by a simple "status" grouping that matches admin operational needs (e.g., "show me only Pending accounts"). Phillip Kopp requested a clean filter that groups stages into operational statuses.

**What to change:**
1. Add a horizontal tab/pill filter bar **above** the stage cards with these options:
   - `All` (default)
   - `Pending` → maps to stages: `invited`, `registered`
   - `Under Review` → maps to stages: `docs_pending`
   - `Approved` → maps to stages: `docs_approved`, `verified`
   - `Active` → maps to stage: `active`
   - `Terminated` → maps to stage: `terminated`
2. When a status tab is selected, the stage card row below should show only the cards belonging to that group (or grey out the rest).
3. The customer table filters by the stages in the selected group.
4. The existing individual stage card click still works as a more granular filter within the selected group.
5. Default: `All` tab selected, all stage cards visible.

**State additions:**
```javascript
const [statusGroupFilter, setStatusGroupFilter] = useState('all');
// Groups:
const STATUS_GROUPS = {
  all: ['invited','registered','docs_pending','docs_approved','verified','active','terminated'],
  pending: ['invited','registered'],
  under_review: ['docs_pending'],
  approved: ['docs_approved','verified'],
  active: ['active'],
  terminated: ['terminated'],
};
```

**No API change required** — client-side filtering of existing `customers[]` state.

---

### FIX-02 · User Management — Inline Status Filter Tabs
**PLAN_ADMIN ref:** #2
**Priority:** 🟠 HIGH
**File:** `src/components/dashboard/user-management/UserManagement.jsx`

**Current state:**
A Filter Modal (`FilterByModal`) already exists with `status` as one of its fields (options: Active, Invited, Registered, Terminated, Inactive). The status bar at the top shows distribution visually. Filtering requires opening the modal.

**Problem:**
The filter requires 2 clicks (open modal → apply). Phillip requested quick status filtering without going into a modal.

**What to change:**
1. Add an inline tab/pill bar directly on the customer list header row (same row as the search/filter buttons) with:
   - `All` (default)
   - `Active`
   - `Invited`
   - `Registered`
   - `Terminated`
   - `Inactive`
2. Clicking a tab sets the `filters.status` value and immediately re-runs the filter.
3. The existing Filter Modal still exists for combined multi-field filtering.
4. The status distribution bar at the top can remain as-is (it's a useful visual).
5. Apply same pattern to **Partner Management** list (partner status tabs: All, Active, Pending, Inactive).

**State change:**
No new state needed — `filters.status` already exists. The tabs just set it directly without opening the modal.

---

### FIX-03 · User Management & Pipeline — Company Name as Primary Identity
**PLAN_ADMIN ref:** #3
**Priority:** 🟠 HIGH
**Files:**
- `src/components/dashboard/user-management/UserManagement.jsx` (customer list table)
- `src/components/dashboard/registration-pipeline/RegistrationPipeline.jsx` (pipeline table)
- Any other list table that renders commercial user / partner rows

**Current state:**
Both list tables have a `Name` column that renders `user.firstName + " " + user.lastName` for all user types. There is no distinction between commercial and residential display.

**What to change:**
1. In the customer table **Name cell**, add logic:
```javascript
// If commercial user:
//   Primary line (bold, normal size): companyName
//   Secondary line (smaller, gray): firstName + lastName
// If residential user:
//   Primary line: firstName + lastName (unchanged)
// If partner:
//   Primary line (bold): partnerName / companyName
//   Secondary line (smaller, gray): contact person name (if available)
```
2. In the Registration Pipeline table **Name cell**, same logic based on `customer.userType`.
3. Column header label: change `"Name"` → `"Name / Company"` in affected tables.

**Data mapping:**
- Commercial: `user.companyName` (primary) — confirm exact field name from API response
- Partner: `partner.name` (primary — already company-level)
- Fallback: if `companyName` is null/empty, fall back to `firstName + lastName`

---

### FIX-04 · Payout View — Fix Green Profile Box
**PLAN_ADMIN ref:** #6
**Priority:** 🟡 MEDIUM
**Files:**
- `src/components/dashboard/payout/CommercialPayoutDetails.jsx`
- `src/components/dashboard/payout/PartnerCommissionPayoutDetails.jsx`
- Any other payout detail component with the green info box

**Current state:**
`CommercialPayoutDetails.jsx` has a teal/green info box with border `#C1E8E5` showing: User ID, First Name, Last Name, Email, Phone, User Type. It takes significant vertical space.

**What to change:**
1. **Reduce the box size** — make it a compact single-row or two-column layout instead of a full-width card with padding.
2. **For commercial users and partners:** Change the primary display to:
   - Large text: Company Name
   - Smaller text row: Business Address
   - Secondary row: Contact person name | Email | Phone
3. **For residential users:** Keep individual name as primary (no change).
4. **Remove the teal background** — use a light gray border instead. The all-green box was flagged as "wasteful UI." Replace with a slim header bar or a compact info strip.

**Suggested layout (compact):**
```
[ Company Name (bold 16px) ]   [ User Type badge ]
  123 Business St, City, State
  Contact: John Doe · john@company.com · 555-1234
```

---

### FIX-05 · Payout View — Revenue Wallet Cleanup
**PLAN_ADMIN ref:** #7
**Priority:** 🟡 MEDIUM
**Files:**
- `src/components/dashboard/payout/CommercialPayoutDetails.jsx`
- `src/components/dashboard/payout/PartnerCommissionPayoutDetails.jsx`

**Current state:**
Revenue Wallet section in `CommercialPayoutDetails.jsx` shows 4 fields: Total Earnings, Available Balance, **Held Amount** (amber), Total Commission.

**What to change:**
1. **Remove** the `Held Amount` field from the wallet grid entirely.
2. **Remove** `Total Commission` (this is the same as "Total Earnings" for partners — redundant).
3. **Keep:** `Total Earnings` and `Available Balance`.
4. **Rename** as needed:
   - For commercial users: "Total Earnings" / "Available Balance"
   - For partners: "Total Revenue" / "Available Balance" (or "Total Earnings" — keep consistent)
5. Update the grid from 4 columns to 2 columns.

---

### FIX-06 · Payout — Invoice Approve/Reject Flow + Mark as Paid
**PLAN_ADMIN ref:** #5
**Priority:** 🟡 MEDIUM
**Files:**
- `src/components/dashboard/payout/CommercialPayoutDetails.jsx`
- `src/components/dashboard/payout/InvoiceReview.jsx`
- `src/components/dashboard/payout/InvoiceReviewDetails.jsx`

**Current state:**
`CommercialPayoutDetails.jsx` has Approve/Reject buttons on PENDING rows. Approve calls `POST /api/payout-request/approve`, Reject calls `POST /api/payout-request/reject`. No "rejection reason" field. No "Mark as Paid" action. Status badges: PAID (teal), PENDING (amber), REJECTED (red).

**What to change:**

**Reject flow:**
1. Reject button → opens a small modal (not a full-page modal) with:
   - Heading: "Reject Invoice"
   - Required textarea: "Reason for rejection" (placeholder: "e.g., Amount on invoice does not match, please re-upload...")
   - Cancel + Confirm Reject buttons
2. API call: `POST /api/payout-request/reject` with body `{ payoutId, adminId, reason: "..." }`
3. After rejection: show `REJECTED` badge + the reason text in a small collapsible beneath the row.

**Mark as Paid:**
1. When a payout is in `APPROVED` status, show a `"Mark as Paid"` button (teal outline, not solid — it's a confirmation action, not a primary action).
2. Clicking it → small confirmation popover: "Confirm payment has been deposited?" → Yes / Cancel.
3. API call: `POST /api/payout-request/mark-paid` or `PATCH /api/payout-request/:id/paid` — confirm endpoint with server team.
4. After marking paid: status changes to `PAID` (teal badge), button disappears.

**Status flow displayed in UI:**
```
PENDING → admin reviews → APPROVED → admin deposits payment → PAID
                        ↘ REJECTED (with reason)
```

---

### FIX-07 · REC Sales Management — Aggregate Overview
**PLAN_ADMIN ref:** #9
**Priority:** 🟡 MEDIUM
**Files:**
- `src/components/dashboard/rec-sales/RECManagement.jsx`
- `src/components/dashboard/rec-sales/overview/OverviewCards.jsx`
- `src/components/dashboard/rec-sales/management/ManagementContent.jsx`
- `src/components/dashboard/rec-sales/management/CommercialRECGeneration.jsx`
- `src/components/dashboard/rec-sales/management/ResidentialRECGeneration.jsx`

**Current state:**
The Management tab contains `ManagementContent` which renders `CommercialRECGeneration` and `ResidentialRECGeneration` — per-facility monthly lists that could grow to 10,000+ rows.

**What to change:**

**Overview tab:**
1. Keep the `OverviewCards` KPI summary.
2. Keep the `Graphs` charts.
3. **Remove** `ListOfBuyersCard` from Overview — move it to the Entries tab or give it its own tab.
4. Add a clear label/heading: "REC Sales Summary (Aggregate)"

**Management tab restructure:**
1. **Remove** the per-facility monthly generation lists (`CommercialRECGeneration`, `ResidentialRECGeneration`) from this tab entirely.
2. Replace with a note/callout: "Detailed monthly REC generation data is available in each facility's detail page under User Management."
3. The Management tab should now focus on admin actions: WREGIS submission management, status updates. (The detailed per-facility data now lives in User Management → Facility Detail.)

**Note on facility detail pages:**
Add a "REC Generation" section to `CommercialDetails.jsx` and `ResidentialDetails.jsx` (User Management) that shows that specific facility's monthly generation records. (Create a reusable `FacilityRECHistory.jsx` component.)

---

### FIX-08 · Partner Performance Report — Column Changes
**PLAN_ADMIN ref:** #12
**Priority:** 🟡 MEDIUM
**File:** `src/components/dashboard/reporting/Reporting.jsx` (Partner Performance section)

**Current state:**
Partner Performance table columns: Name, Email, Partner Type, **Address**, Total Referrals, **Status**, Date Joined.

**What to change:**
1. **Remove** `Address` column.
2. **Remove** `Status` column (meeting note: only active partners appear here anyway).
3. **Add** `Company Name` as the first column (primary identity, bold).
4. **Add** `RECs Generated` column (total RECs attributed to facilities referred by this partner).
5. Final column order: `Company Name` | `Partner Type` | `Total Referrals` | `Total Facilities` | `RECs Generated` | `Date Joined`

**"Total Facilities" definition:** Only fully approved + registered facilities (not pending).

**Data note:** `RECs Generated` requires the API to return this field. If not yet available from server, render `—` as placeholder and add a TODO comment.

---

### FIX-09 · REC Reporting Label Change
**PLAN_ADMIN ref:** #13
**Priority:** 🟢 LOW
**File:** `src/components/dashboard/reporting/Reporting.jsx`

**What to change:**
- Find the label string `"generation"` (or `"Commercial REC Generation"`) in the Commercial report section/view toggle.
- Change to: `"Commercial REC Sales"`
- This is a text/label change only — no logic change.

---

### FIX-10 · Remove Commercial/Residential Segmentation from REC Generation View
**PLAN_ADMIN ref:** #14
**Priority:** 🟢 LOW
**Files:**
- `src/components/dashboard/reporting/Reporting.jsx`
- `src/components/dashboard/rec-sales/management/ManagementContent.jsx`

**Current state:**
Reporting has separate "Residential REC Generation" and "Commercial REC Generation" report types. REC Sales Management also splits by commercial/residential.

**What to change:**
1. In the Reporting dropdown, merge "Residential REC Generation" and "Commercial REC Generation" into a single **"REC Generation"** report type.
2. The merged view shows all generation records (residential + commercial combined).
3. Add a `Facility Type` column to distinguish (residential/commercial) within the combined table — so admins can still see the breakdown but don't need to switch views.
4. Keep the per-type filter option: a filter control within the REC Generation report that lets admins filter by `All | Residential | Commercial` if needed.
5. In `ManagementContent.jsx`: remove the tab split between commercial/residential generation lists (already partially handled by FIX-07).

---

## PHASE 2 — REQUIRES BACKEND ENDPOINTS (Start after server work is done)

---

### FIX-11 · Invoice Discrepancy Auto-Flag
**PLAN_ADMIN ref:** #4
**Blocked by:** `PLAN_SERVER.md` #7 — server must return `hasDiscrepancy`, `partnerInvoiceAmount`, `systemCalculatedAmount` on invoice records
**File:** `src/components/dashboard/payout/CommercialPayoutDetails.jsx`, `InvoiceReviewDetails.jsx`

**What to build (once server returns these fields):**
1. In the invoice/payout request table: add a warning icon `⚠️` on any row where `hasDiscrepancy === true`.
2. In the invoice detail view:
   - Add a comparison panel: "Partner stated: $X.XX" vs "System calculated: $Y.YY"
   - Highlight the discrepancy in red
   - Show the difference amount: "Difference: -$Z.ZZ"
3. Admin does NOT need to manually calculate — this is auto-populated from API fields.

---

### FIX-12 · REC Generation — Approve / Reject / Adjust per Facility
**PLAN_ADMIN ref:** #8
**Blocked by:** `PLAN_SERVER.md` #1 & #2 — WREGIS status fields + new endpoints
**Endpoints needed:**
- `PATCH /api/monthly-rec-data/:id/approve`
- `PATCH /api/monthly-rec-data/:id/reject`
- `PATCH /api/monthly-rec-data/:id/adjust`
- `POST /api/monthly-rec-data/bulk-approve`

**Where to build it:**
Inside the `FacilityRECHistory.jsx` component (created in FIX-07) that lives in User Management Facility Detail pages.

**What to build:**
1. `wregisStatus` indicator column: `Pending Submission | Submitted | Approved | Rejected | Adjusted`
2. Per-row action buttons (only show on SUBMITTED rows):
   - **Approve** → optional `approvedRecsAmount` input if different from generated → `PATCH .../approve`
   - **Reject** → required reason modal → `PATCH .../reject`
   - **Adjust** → numeric input + required note → `PATCH .../adjust`
3. **Bulk Approve**: checkbox column + "Bulk Approve Selected" button at table top → `POST .../bulk-approve`
4. Status badge colour scheme: Pending (gray) | Submitted (amber) | Approved (teal) | Rejected (red) | Adjusted (purple)

---

### FIX-13 · Three-Report Structure (Points, REC Generation, REC Sales Entries)
**PLAN_ADMIN ref:** #10
**Blocked by:** `PLAN_SERVER.md` #4 — new `/api/reports/*` endpoints
**File:** `src/components/dashboard/reporting/Reporting.jsx`

**What to build (once endpoints are live):**

**Report 1 — Points Report:**
- New tab/section in Reporting: "Points"
- Columns: User / Facility | Earned Points | Redeemed Points | Open Balance
- Filters: date range, user type (residential/commercial), status
- Export: CSV

**Report 2 — REC Generation Report:**
(Replaces and formalises the current REC Generation view from FIX-10)
- Columns: Facility | Month/Year (Vintage) | RECs Submitted | RECs Approved | WREGIS Status
- Filters: vintage, zip code, facility, wregisStatus
- Export: triggers WREGIS export (with chunking — see FIX-14)

**Report 3 — REC Sales Entries:**
(Currently the "Entries" tab in RECManagement — move or duplicate here)
- Columns: Sale Date | Vintage | RECs Sold | Price Per REC | Total Amount | Buyer
- Multiple entries per month (unlike monthly reports)
- Filters: vintage, date range, buyer, zip code

---

### FIX-14 · WREGIS Export — Multi-File Chunked Download UI
**PLAN_ADMIN ref:** #11
**Blocked by:** `PLAN_SERVER.md` #5 — server must return chunked export response
**File:** `src/components/dashboard/reporting/Reporting.jsx` (WREGIS Generation Report section)

**What to build (once server supports chunked response):**
1. When export is triggered and server returns `{ files: [url1, url2, ...], chunks: N }`:
   - Show a download panel listing each chunk: "Part 1 (rows 1–5000)", "Part 2 (rows 5001–10000)", etc.
   - Each chunk has its own "Download" button
   - OR: a single "Download All as ZIP" button
2. Show pre-download summary: "Exporting X facilities across Y files"
3. Progress indicator during export
4. No change to the export trigger button itself — this is purely the response handling

---

## ITEMS NOT IN SCOPE (Admin Codebase)

| Item | Reason |
|---|---|
| Fix HTTPS certificate (PLAN_ADMIN #15) | DevOps/infrastructure — not in this codebase |
| Residential payout workflow connection | Scoped to future sprint (per meeting notes) |
| REC data structure updates (vintage/segmentation) | High-dependency backend work; blocks this frontend |
| Remove VAT from partner invoice submission | Checked: this is in the **partner web app** (`PLAN_WEBAPP.md`), not the admin dashboard |

---

## EXECUTION ORDER & STATUS

```
PHASE 1 (frontend-only — ALL COMPLETED ✅):
  ✅ FIX-09  → Label change: "Commercial REC Generation" → "Commercial REC Sales" in Reporting.jsx
  ✅ FIX-10  → Merged Residential + Commercial REC Generation into "REC Generation" with Facility Type filter pills
  ✅ FIX-08  → Partner performance: removed Address/Status, added Company Name/Total Facilities/RECs Generated
  ✅ FIX-05  → Revenue wallet: removed Held Amount + Total Commission. Now shows only Total Earnings + Available Balance
  ✅ FIX-04  → Green profile box replaced with compact info strip showing Company Name + Address in payout views
  ✅ FIX-06  → Reject now opens reason modal (required field). Added "Mark as Paid" button for APPROVED status
  ✅ FIX-03  → Company name shown as primary (bold) + individual name as secondary (grey) for COMMERCIAL users in all list views
  ✅ FIX-02  → Inline status filter pills added to User Management customer list header (All/Active/Invited/Registered/Terminated/Inactive)
  ✅ FIX-01  → Status group filter tabs added above stage cards in Registration Pipeline (All/Pending/Under Review/Approved/Active/Terminated)
  ✅ FIX-07  → REC Sales Overview: aggregate only (removed ListOfBuyersCard → moved to Entries tab).
              Management tab: removed per-facility generation lists, added callout pointing to User Management.
              ManagementContent.jsx: now shows RECGenerationReport + WREGIS export only.

PHASE 2 (server endpoints now LIVE — ALL COMPLETED ✅):
  ✅ FIX-11 → Invoice discrepancy auto-flag  [PLAN_SERVER #7 — hasDiscrepancy, partnerInvoiceAmount, systemCalculatedAmount on payout rows]
  ✅ FIX-12 → REC approve/reject/adjust per facility  [PLAN_SERVER #1 & #2 — FacilityRECHistory.jsx + integrated into CommercialDetails + ResidentialDetails]
  ✅ FIX-13 → Three-report structure (Points, REC Generation, REC Sales Entries) + Partner Performance switched to dedicated endpoint  [PLAN_SERVER #4 & #10]
  ✅ FIX-14 → WREGIS chunked export UI with filter params  [PLAN_SERVER #5 — ManagementContent.jsx now calls GET /api/rec-generation/export]
```

---

## COMPONENT CHANGE SUMMARY

| File | Status | Changes Made |
|---|---|---|
| `registration-pipeline/RegistrationPipeline.jsx` | ✅ Done | Added STATUS_GROUPS + statusGroupFilter state; status group tabs above stage cards; company name as primary for COMMERCIAL; "Name / Company" header |
| `user-management/UserManagement.jsx` | ✅ Done | Added inline status filter pills (All/Active/Invited/Registered/Terminated/Inactive); "Name / Company" header; company name as primary for COMMERCIAL |
| `payout/CommercialPayoutDetails.jsx` | ✅ Done | Compact info strip replaces large teal box; Revenue Wallet shows only Total Earnings + Available Balance; Reject opens RejectModal (requires reason); APPROVED status shows "Mark as Paid" button |
| `payout/PartnerCommissionPayoutDetails.jsx` | ✅ Done | Same fixes as CommercialPayoutDetails; RejectModal added; Revenue Wallet "Held Amount" removed; "Total Revenue" terminology |
| `rec-sales/RECManagement.jsx` | ✅ Done | Overview: aggregate only (no ListOfBuyersCard); Entries tab: adds ListOfBuyersCard below RecEntries |
| `rec-sales/management/ManagementContent.jsx` | ✅ Done | Removed CommercialRECGeneration + ResidentialRECGeneration views; shows RECGenerationReport + WREGIS export + callout to User Management |
| `reporting/Reporting.jsx` | ✅ Done | Merged REC views into "REC Generation" with Facility Type pills; "Residential Redemption" as separate report; Partner Performance: Company Name/Total Facilities/RECs Generated; removed Address/Status columns |
| `user-management/CommercialDetails.jsx` | ✅ Done | Added "REC History" button per FacilityCard; inline FacilityRECHistory when toggled |
| `user-management/ResidentialDetails.jsx` | ✅ Done | Added "REC History" button per FacilityCard; inline FacilityRECHistory when toggled |
| *(new)* `customer-details/FacilityRECHistory.jsx` | ✅ Done | Per-facility REC history with Submit/Approve/Reject/Adjust actions + bulk approve + pagination |
| `payout/CommercialPayoutDetails.jsx` | ✅ Done (Phase 2 addition) | FIX-11: Discrepancy badge on Amount cell + comparison row. Also fixed wallet API to pass ?userType=COMMERCIAL |
| `payout/PartnerCommissionPayoutDetails.jsx` | ✅ Done (Phase 2 addition) | FIX-11: Same discrepancy detection. wallet API now passes ?userType=PARTNER |
| `reporting/Reporting.jsx` | ✅ Done (Phase 2 addition) | FIX-13: Added Points Report, REC Generation Report, REC Sales Entries. Switched Partner Performance to /api/admin/partner-performance |
| `rec-sales/management/ManagementContent.jsx` | ✅ Done (Phase 2 addition) | FIX-14: WREGIS export now calls GET /api/rec-generation/export with filter params (month/year/facilityType/wregisStatus/zipCode) |

---

*This plan is ready to execute. Start with Phase 1 items in the listed order.*
*Phase 2 items require server-side work to be confirmed before starting.*
