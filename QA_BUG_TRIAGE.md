# DCarbon QA Bug Triage
> Source: QA Report — Post March 16, 2026 Meeting Fixes
> Date: March 18, 2026
> Last Updated: March 18, 2026 — All 4 server fixes deployed

---

## Overview of All 10 Reported Issues

| # | Issue | Team | Priority | Status |
|---|---|---|---|---|
| 1 | REC Management tab blank; WREGIS export includes non-submitted facilities | SERVER + PROJECT | HIGH | ✅ SERVER FIXED / PROJECT pending |
| 2 | System doesn't recognize "invited" state — tracking starts at Registered | SERVER | HIGH | ✅ SERVER FIXED |
| 3 | Commercial company/business name missing from Registration Pipeline & details page | SERVER + ADMIN | HIGH | ✅ SERVER FIXED / ADMIN pending |
| 4 | Partner click in Registration Pipeline → blank page in user management | ADMIN | HIGH | 🔲 ADMIN pending |
| 5 | Residential payout still shows "held amount" and "total commission" | PROJECT | MEDIUM | 🔲 PROJECT pending |
| 6 | Residential payout screen — customer detail lines have large padding | PROJECT | LOW | 🔲 PROJECT pending |
| 7 | Commercial and partner payout pages don't show business/company name | PROJECT | HIGH | 🔲 PROJECT pending |
| 8 | User management list pages don't use company/business names where available | ADMIN | MEDIUM | 🔲 ADMIN pending |
| 9 | Point records table in reporting page filled with hyphens | PROJECT | MEDIUM | 🔲 PROJECT pending |
| 10 | Generate invoice (partner) throws "no file uploaded" error on submit | SERVER + PROJECT | HIGH | ✅ SERVER FIXED / PROJECT pending |

---

---

## DCARBON SERVER — Issues to Fix

### ✅ SERVER-01 | WREGIS Export Includes Non-Submitted Facilities
> **Status: FIXED — March 18, 2026**

**QA Report:** *"When I click on the export WREGIS XLSX I get a list including facilities that are not yet submitted"*

**Root Cause:**
The `exportRecGenerationToXlsx()` function in `recGeneration.service.ts` had no default `wregisStatus` filter — it was exporting every `MonthlyFacilityRecs` record including `PENDING_SUBMISSION` (not yet sent to WREGIS) and `REJECTED` records.

**Fix Applied (`src/services/recGeneration.service.ts`):**
The export now defaults to only include records with `wregisStatus IN [SUBMITTED, APPROVED, ADJUSTED]` when no explicit filter is passed. `PENDING_SUBMISSION` and `REJECTED` records are excluded from the default export.

Callers can still request specific statuses via the `?wregisStatus=` query param if needed (e.g. `?wregisStatus=APPROVED` for an approved-only view).

**Endpoint:** `GET /api/rec-generation/export`

**What the Admin/Project teams can expect now:**
- Default XLSX export contains only records that have been formally submitted to or processed by WREGIS (`SUBMITTED`, `APPROVED`, `ADJUSTED`)
- `PENDING_SUBMISSION` and `REJECTED` records are filtered out by default
- No change to the list/filter endpoint `GET /api/rec-generation` — that still returns all records, filterable by `?wregisStatus=`

---

### ✅ SERVER-02 | "Invited" State Not Recognized — Tracking Should Start at Registered
> **Status: FIXED — March 18, 2026**

**QA Report:** *"The system does not recognize the invited state, proper tracking starts at Registered"*

**Root Cause:**
`AdminService.getAllReferrals()` which powers `GET /api/admin/referrals` (the registration pipeline) had no default status exclusion. When called without a `?status=` filter, it returned all referral records — including `INVITED` entries (emails sent, user has not yet registered).

**Fix Applied (`src/services/admin.service.ts`):**
`getAllReferrals()` now defaults to `status != 'INVITED'` when no status filter is passed. Referrals where the invitee only received an email but has not registered are excluded from the default pipeline view.

Admin can still query `?status=INVITED` explicitly if they need to view pending invite-only entries.

**Endpoint:** `GET /api/admin/referrals`

**What the Admin team can expect now:**
- The registration pipeline no longer shows rows where the user was only emailed — they must have registered to appear
- The earliest state in the pipeline is `PENDING` (registered, awaiting review) or `REGISTERED`, depending on the status values set at registration
- Passing `?status=INVITED` still works for admin lookup of pending invites
- No change to query structure — filtering by other statuses (`APPROVED`, `REJECTED`, etc.) works exactly as before

---

### ✅ SERVER-03 | Generic User Endpoint Does Not Return Commercial Company Details
> **Status: FIXED — March 18, 2026**

**QA Report:** *"Commercial customers company/business name are not displayed... this is because the get user by email/user ID does not return the commercial user's company details."*

**Root Cause:**
`AdminService.getAllUsers()` which powers `GET /api/admin/users` was selecting only `companyAddress` and `phoneNumber` from the `commercialUser` relation — `companyName` and `ownerFullName` were never fetched. The display name was always formatted as `"firstName + lastName"` for every user regardless of type.

**Fix Applied (`src/services/admin.service.ts` — `getAllUsers()`):**

1. **Prisma select updated:** `commercialUser` now also selects `companyName` and `ownerFullName`

2. **Display name priority for commercial users:**
   - Primary: `companyName` (if set)
   - Fallback: `ownerFullName` (if set)
   - Last resort: `firstName + lastName`

3. **New fields added to every user row in the response:**
   | Field | Description |
   |---|---|
   | `name` | Display name — company name for commercial, full name for residential |
   | `companyName` | Company/business name (`null` for non-commercial users) |
   | `ownerFullName` | Owner's full name from commercial profile (`null` for non-commercial) |
   | `firstName` | Always present |
   | `lastName` | Always present |

**Endpoint:** `GET /api/admin/users`

**What the Admin team needs to do (ADMIN-01, ADMIN-02, ADMIN-04):**

The `GET /api/admin/users` response now contains everything needed to display company names correctly. The Admin app no longer needs to make a separate call to `GET /api/user/get-commercial-user/:userId` just to get the company name for list views.

For list rows:
```
// Use name (already resolves to companyName for commercial users)
// Show companyName as primary, ownerFullName as secondary where available
Primary display: row.name  (= companyName for COMMERCIAL, firstName+lastName for RESIDENTIAL)
Secondary:       row.ownerFullName  (owner's individual name, shown below company name)
```

For detail pages, continue using `GET /api/user/get-commercial-user/:userId` — it returns the complete commercial profile including all facility and document data.

---

### ✅ SERVER-04 | Generate Invoice Mode — Server Requires File Even Without Upload
> **Status: FIXED — March 18, 2026**

**QA Report:** *"Partner dashboard has a generate invoice screen with a description saying it doesn't require invoice upload but when I submit the form, it throws an error 'no file uploaded'"*

**Root Cause:**
The `uploadToGCS` middleware on `POST /api/quarterly-statements/invoices` unconditionally threw `ValidationError("No file uploaded")` when no file was attached — even when the partner was using "Generate Invoice" mode (JSON body, no file).

**Fix Applied:**

**`src/middleware/uploadFile.ts`:**
`uploadToGCS` factory now accepts an optional third argument `{ optional: true }`. When set, a request with no file and no base64 data simply passes through — `req.fileUrl` is not set, and the controller receives an undefined `fileUrl`.

**`src/routes/quarterlyStatement.routes.ts`:**
```
POST /api/quarterly-statements/invoices
  → uploadToGCS("invoiceDocument", "invoices", { optional: true })
```

**`src/controllers/quarterlyStatement.controller.ts` (no change needed):**
The controller already reads `const invoiceDocument = (req as any).fileUrl ?? req.body.invoiceDocument`. When no file is uploaded in generate mode, `invoiceDocument` will be `null` / `undefined` and the invoice record is created without a file attached.

**Endpoint:** `POST /api/quarterly-statements/invoices`

**What the Project team can expect now (PROJECT-06):**

Both modes work on the same endpoint:

| Mode | Content-Type | invoiceDocument field | Server behaviour |
|---|---|---|---|
| Generate (system invoice) | `application/json` | Not sent | ✅ Creates invoice with `invoiceDocument: null` |
| Upload (custom file) | `multipart/form-data` | PDF/image file | ✅ Uploads to GCS, stores public URL |

The server-side workaround described in PROJECT-06 (`PartnerSubmitInvoice.jsx` catch block) is no longer needed. Generate mode will now succeed without any file attached.

The `invoiceDocument` field in the DB will be `null` for system-generated invoices — the Project team should handle this gracefully in the UI (e.g. show "System Generated" instead of a download link when `invoiceDocument` is null).

---

---

## DCARBON ADMIN — Issues to Fix

> **Server dependency SERVER-03 is now resolved.** ADMIN-01, ADMIN-02, and ADMIN-04 can proceed immediately.

### 🔲 ADMIN-01 | Commercial Company Name Missing from Registration Pipeline
**QA Report:** *"Commercial customers company/business name are not displayed on the Registration Pipeline"*

**Server dependency: ✅ SERVER-03 FIXED**

**Root Cause:**
The admin app's registration pipeline list view was calling the generic user endpoint which previously did not return company details. SERVER-03 has now added `companyName` and `ownerFullName` to the `GET /api/admin/users` response.

**What the server now returns for commercial users:**
```json
{
  "id": "...",
  "name": "Acme Solar Ltd",        ← now resolves to companyName
  "companyName": "Acme Solar Ltd", ← new field
  "ownerFullName": "John Smith",   ← new field
  "firstName": "John",
  "lastName": "Smith",
  "userType": "COMMERCIAL",
  ...
}
```

**Action Required:**
- In the registration pipeline list, use `row.name` (already the company name for commercial users) as the primary display label
- Optionally show `row.ownerFullName` as a secondary line for commercial rows
- For the **details page**, continue calling `GET /api/user/get-commercial-user/:userId` for the full commercial profile

---

### 🔲 ADMIN-02 | Commercial Company Name Missing from User Details Page
**QA Report:** *"The information is also not displayed on the details page"*

**Server dependency: ✅ SERVER-03 FIXED (partial — list is fixed; details still needs dedicated endpoint)**

**Action Required:**
- The user details page in the admin app must call `GET /api/user/get-commercial-user/:userId` (not the generic user endpoint) to get the full commercial profile
- This endpoint returns: `companyName`, `ownerFullName`, `companyAddress`, `businessType`, facilities, documents, etc.
- Display `companyName` prominently at the top of the details view

---

### 🔲 ADMIN-03 | Partner Click in Registration Pipeline → Blank Page
**QA Report:** *"From the registration pipeline, when you click a partner user, I expect to be redirected to their partner details page... but instead I am redirected to a blank page."*

**No server dependency — can be fixed independently.**

**Action Required:**
- Update the registration pipeline row click handler to check `userType`:
  - If `COMMERCIAL` → navigate to commercial user details (already working)
  - If `PARTNER` → navigate to the partner details page (same one accessible via User Management → Partner Management)
- Ensure the partner details page accepts `userId` or `partnerId` regardless of which navigation path was used

---

### 🔲 ADMIN-04 | User Management List Pages Don't Use Company/Business Names
**QA Report:** *"The user management list pages do not use the Company and Business names where available"*

**Server dependency: ✅ SERVER-03 FIXED**

**Action Required:**
- `GET /api/admin/users` now returns `companyName` and `ownerFullName` for commercial users
- Update the user management list views:
  - **Commercial users:** display `companyName` as the primary identifier in the Name column; show `ownerFullName` as secondary
  - **Partners:** display the partner's company/organization name as primary identifier
  - **Residential users:** continue displaying `firstName + lastName` (unchanged)
- The `name` field already resolves correctly — using `row.name` directly in the Name column will show the right value for every user type

---

---

## DCARBON PROJECT — Issues to Fix

> These are issues in the current `dcarbon-web-app-vercel / DCarbon-project` codebase.

---

### 🔲 PROJECT-01 | REC Management Tab Shows Nothing
**QA Report:** *"The REC Management tab under REC sales does not have anything displayed on it"*

**Server dependency: None (SERVER-01 fixed the export; the tab display is a frontend concern)**

**File to investigate:** `src/components/dashboard/commercial-dashboard/rec-sales-and-report/`

**Root Cause (suspected):**
The `GeneratorReport.jsx` was rewritten to call `GET /api/rec/summary` and display 3 aggregate stat cards. The QA sees a **blank tab** — likely one of:
- The component may not be mounting at all (tab routing issue in the parent `GeneratorMonthlyReport.jsx`)
- The API response shape doesn't match `response.data?.status === 'success'`, causing `setSummary(null)` with no cards rendered

**Confirmed server response shape for `GET /api/rec/summary`:**
```json
{
  "status": "success",
  "data": {
    "availableRecs": 0,
    "totalRecsSold": 0,
    "mostRecentRecPrice": 0
  }
}
```
If the server returns all zeros (no sales/wallets yet), the component should still render the stat cards with `0` values — not a blank screen.

**Action Required:**
1. Confirm the parent component mounts `GeneratorReport` for the correct tab key
2. Confirm the API call to `/api/rec/summary` is being made (check network tab)
3. If response shape differs from above, update data field mapping in `GeneratorReport.jsx`

---

### 🔲 PROJECT-02 | Residential Payout Shows "Held Amount" and "Total Commission"
**QA Report:** *"In the residential redemption payout, held amount and total commission are still being displayed"*

**File to investigate:** `src/components/dashboard/residence-dashboard/transaction/`

**No server dependency — the server intentionally returns `pendingPayout` for residential users (by design). The fix is to stop rendering it.**

**Action Required:**
1. Read `RedeemPoints.jsx` and `ResidentialBonusTable.jsx` — locate where `pendingPayout` / `totalCommission` are rendered
2. Remove those fields from the residential payout display — only `availableBalance` and `pointBalance` should be shown
3. Do not change the API call; `pendingPayout` remains in the server response but must not be displayed

---

### 🔲 PROJECT-03 | Residential Payout — Customer Detail Lines Have Large Padding
**QA Report:** *"In the residential redemption payout screen, the lines for the customer details still have large paddings"*

**No server dependency — can be fixed immediately.**

**File:** `src/components/dashboard/residence-dashboard/transaction/Transaction.jsx` (or sub-components)

**Action Required:**
- Locate the customer details display rows in the residential payout screen
- Reduce `py-*` or `p-*` Tailwind classes on each row to bring them closer together
- Target: compact rows similar to the commercial payouts invoice list style

---

### 🔲 PROJECT-04 | Commercial & Partner Payout Pages Don't Show Business Name / Company Name
**QA Report:** *"The commercial and partner redemption payout pages are neither displaying the business name nor company names when available"*

**Server dependency: ✅ SERVER-03 FIXED — company data is available, frontend just needs to call the right endpoint**

**Files:**
- `src/components/dashboard/commercial-dashboard/payouts/Payouts.jsx`
- `src/components/dashboard/partner-dashboard/reporting/CommissionStatement.jsx`

**Action Required:**

In `Payouts.jsx` (commercial): on mount, fetch `GET /api/user/get-commercial-user/:userId`. In the header/profile section:
- Primary (large, teal): `companyName`
- Secondary (small, grey): `ownerFullName`
- Show: `companyAddress`, `email`
- Make the profile box compact (remove excessive height/padding — see PROJECT-03)

In `CommissionStatement.jsx` (partner): fetch partner details on mount. In the invoice header (billing-from block):
- Primary: partner company/organization name
- Secondary: owner's full name
- Show: business address, email, phone

---

### 🔲 PROJECT-05 | Point/Generation Records Table Filled with Hyphens
**QA Report:** *"The point records under the reporting page does has a table filled with hyphens"*

**No server dependency — can be fixed immediately.**

**File:** `src/components/dashboard/partner-dashboard/reporting/GenerationReport.jsx`

**Root Cause (confirmed — code reviewed):**
`GenerationReport.jsx` line 161–172 has a `defaultTableData` array used as a fallback when `tableData` is empty:

```js
const defaultTableData = [
  {
    id: "1",
    customerId: "-",
    name: "No data available",
    address: "-",
    zipcode: "-",
    customerType: "-",
    generation: "0",
    commission: "0"
  }
];

const displayData = tableData.length > 0 ? tableData : defaultTableData;
```

When the API returns an empty array, the table renders this dummy row — showing hyphens across columns.

**Action Required:**
1. **Remove `defaultTableData` entirely.** The `ResponsiveTable` component already handles empty state via `emptyTitle` and `emptyDescription` props — change `displayData` to use `tableData` directly
2. **Update the heading label** on line 217 from `"Generation Report"` to the appropriate label (confirm with product)

---

### 🔲 PROJECT-06 | Generate Invoice (Partner) — Error No Longer Thrown
**QA Report:** *"Partner dashboard has a generate invoice screen with a description saying it doesn't require invoice upload but when I submit the form, it throws an error 'no file uploaded'"*

**Server dependency: ✅ SERVER-04 FIXED — the "no file uploaded" error is gone**

**File:** `src/components/dashboard/partner-dashboard/reporting/PartnerSubmitInvoice.jsx`

**What changed on the server:**
`POST /api/quarterly-statements/invoices` now accepts JSON body requests with no file attachment. The generate mode (no file) will succeed and the invoice is created with `invoiceDocument: null`.

**Action Required:**
1. **Remove any temporary error-handling workaround** added to `PartnerSubmitInvoice.jsx` for the "no file uploaded" error (if it was added)
2. **Handle `invoiceDocument: null` in the UI** — when the server returns an invoice record with no `invoiceDocument`, show "System Generated" or a similar label instead of a broken download link
3. The generate mode form submission (JSON body, no file) will now work end-to-end without modification

---

---

## Fix Sequencing — Updated

All 4 server fixes are deployed as of March 18, 2026. The unblocking dependencies are now resolved.

### Phase 1 — Server Fixes ✅ ALL DONE
| ID | Fix | Status |
|---|---|---|
| SERVER-04 | Make `invoiceDocument` optional (generate mode) | ✅ DONE |
| SERVER-03 | Return `companyName`/`ownerFullName` in user list endpoint | ✅ DONE |
| SERVER-02 | Exclude INVITED referrals from registration pipeline | ✅ DONE |
| SERVER-01 | Filter WREGIS export to SUBMITTED/APPROVED/ADJUSTED only | ✅ DONE |

### Phase 2 — Admin Fixes (unblocked — can start now)
| ID | Fix | Dependency | Status |
|---|---|---|---|
| ADMIN-03 | Fix partner click routing in pipeline | None | 🔲 Start now |
| ADMIN-01 | Show company name in Registration Pipeline list | ✅ SERVER-03 done | 🔲 Start now |
| ADMIN-02 | Show company details on commercial user details page | ✅ SERVER-03 done | 🔲 Start now |
| ADMIN-04 | Show company names in user management list | ✅ SERVER-03 done | 🔲 Start now |

### Phase 3 — Project Fixes (unblocked — can start now)
| ID | Fix | Dependency | Status |
|---|---|---|---|
| PROJECT-03 | Fix large padding in residential payout details | None | 🔲 Start now |
| PROJECT-05 | Remove hyphens fallback from GenerationReport table | None | 🔲 Start now |
| PROJECT-06 | Remove error workaround; handle `invoiceDocument: null` | ✅ SERVER-04 done | 🔲 Start now |
| PROJECT-02 | Remove held amount / total commission from residential payout | None | 🔲 Start now |
| PROJECT-01 | Investigate and fix REC Management tab blank state | None | 🔲 Start now |
| PROJECT-04 | Show business/company name in commercial + partner payout | ✅ SERVER-03 done | 🔲 Start now |

---

## Summary Table by Team

### DCARBON SERVER
| ID | Title | Status |
|---|---|---|
| SERVER-01 | WREGIS export — filter to SUBMITTED/APPROVED/ADJUSTED | ✅ DONE |
| SERVER-02 | Exclude INVITED referrals from registration pipeline | ✅ DONE |
| SERVER-03 | Return companyName + ownerFullName in user list endpoint | ✅ DONE |
| SERVER-04 | Make invoiceDocument upload optional (generate mode) | ✅ DONE |

### DCARBON ADMIN
| ID | Title | Dependency | Status |
|---|---|---|---|
| ADMIN-01 | Show company name in Registration Pipeline list | ✅ SERVER-03 done | 🔲 Pending |
| ADMIN-02 | Show company details on commercial user details page | ✅ SERVER-03 done | 🔲 Pending |
| ADMIN-03 | Fix partner click routing in pipeline | None | 🔲 Pending |
| ADMIN-04 | Show company names in user management list | ✅ SERVER-03 done | 🔲 Pending |

### DCARBON PROJECT
| ID | Title | Dependency | Status |
|---|---|---|---|
| PROJECT-01 | Fix REC Management tab blank state | None | 🔲 Pending |
| PROJECT-02 | Remove held amount / total commission from residential payout | None | 🔲 Pending |
| PROJECT-03 | Fix large padding in residential payout details | None | 🔲 Pending |
| PROJECT-04 | Show business/company name in commercial + partner payout | ✅ SERVER-03 done | 🔲 Pending |
| PROJECT-05 | Fix hyphens in partner GenerationReport table | None | 🔲 Pending |
| PROJECT-06 | Remove workaround; handle invoiceDocument: null | ✅ SERVER-04 done | 🔲 Pending |

---

*QA Bug Triage v2.0 — March 18, 2026 | Server fixes complete — Admin + Project teams unblocked*
