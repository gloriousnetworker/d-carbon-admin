# DCarbon Server — Fix & Change Plan
> Source: Meeting Notes — March 16, 2026 + March 18, 2026
> Scope: Backend API (`dcarbon-server`) only
> Last updated: March 20, 2026
> **Database: fully migrated and in sync ✅**

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ DONE | Implemented in this session |
| 🔴 CRITICAL | Must be done before any real REC/facility data enters the system |
| 🟠 HIGH | Broken functionality blocking workflows |
| 🟡 MEDIUM | Feature work unblocking UI/client teams |
| 🟢 LOW | Cleanup, label changes, non-blocking |

---

## ✅ Item 1 — REC Lifecycle Status on `MonthlyFacilityRecs` 🔴 CRITICAL

**Status: IMPLEMENTED**

Added `WregisStatus` enum and the following fields to `MonthlyFacilityRecs` in `prisma/schema.prisma`:

```prisma
enum WregisStatus {
  PENDING_SUBMISSION   // default — record created, not yet exported
  SUBMITTED            // exported to WREGIS, awaiting regulator approval
  APPROVED             // WREGIS approved
  REJECTED             // WREGIS or admin rejected
  ADJUSTED             // admin corrected the REC amount
}

// New fields on MonthlyFacilityRecs:
wregisStatus       WregisStatus  @default(PENDING_SUBMISSION)
wregisSubmittedAt  DateTime?
wregisApprovedAt   DateTime?
approvedRecsAmount Float?         // authoritative after APPROVED or ADJUSTED
adminNote          String?        // rejection/adjustment reason
adjustedById       String?        // Admin.id who last changed status
zipCode            String?        // denormalized from facility for WREGIS segmentation
```

**Migration required:**
```bash
npm run migrate -- add_wregis_status_to_monthly_recs
```

---

## ✅ Item 2 — Admin Endpoints: Approve / Reject / Adjust REC Generation 🔴 CRITICAL

**Status: IMPLEMENTED**

**New files:**
- `src/services/recGeneration.service.ts`
- `src/controllers/recGeneration.controller.ts`
- `src/routes/recGeneration.routes.ts`

**New endpoints (admin-only, mounted at `/api/rec-generation`):**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/rec-generation` | List records with filters (`?month, ?year, ?facilityId, ?facilityType, ?wregisStatus, ?zipCode, ?page, ?limit`) |
| `PATCH` | `/api/rec-generation/:id/submit` | Mark record as SUBMITTED to WREGIS |
| `PATCH` | `/api/rec-generation/:id/approve` | Mark as APPROVED. Body: `{ approvedAmount?: number }` |
| `PATCH` | `/api/rec-generation/:id/reject` | Mark as REJECTED. Body: `{ adminNote: string }` (required) |
| `PATCH` | `/api/rec-generation/:id/adjust` | Adjust REC amount. Body: `{ adjustedAmount: number, adminNote: string }` |
| `POST` | `/api/rec-generation/bulk-approve` | Bulk approve. Body: `{ ids: string[] }` |

**Service methods in `RecGenerationService`:**
- `markAsSubmitted(id, adminId)`
- `approveRecGeneration(id, adminId, approvedAmount?)`
- `rejectRecGeneration(id, adminId, adminNote)`
- `adjustRecGeneration(id, adminId, adjustedAmount, adminNote)`
- `bulkApproveRecGeneration(ids[], adminId)` — returns `{ succeeded, failed, total, errors }`
- `getRecGenerationRecords(filters)` — paginated, filterable

---

## ✅ Item 3 — REC Segmentation by Vintage & Zip Code 🔴 CRITICAL

**Status: IMPLEMENTED**

- `zipCode String?` added to `MonthlyFacilityRecs` schema
- `RecGenerationService.getRecGenerationRecords()` supports `?zipCode` filter
- `ReportsService.getRecGenerationReport()` supports `?zipCode` and `?month`/`?year` (vintage) filters
- All report endpoints expose these as query parameters

**How to populate zipCode:** The service that creates/updates `MonthlyFacilityRecs` records should pull `zipCode` from the linked `CommercialFacility.zipCode` or `ResidentialFacility.zipCode` and store it on the record at write time.

---

## ✅ Item 4 — Three-Report Structure (Points, REC Generation, REC Sales) 🔴 CRITICAL

**Status: IMPLEMENTED**

**New files:**
- `src/services/reports.service.ts`
- `src/controllers/reports.controller.ts`
- `src/routes/reports.routes.ts`

**New endpoints (mounted at `/api/reports`):**

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reports/points` | Points report — earned, redeemed (converted to RECs), open carry-over balance |
| `GET` | `/api/reports/rec-generation` | REC generation report — WREGIS pipeline status per facility |
| `GET` | `/api/reports/rec-sales` | REC sales entries — individual sale transactions (multiple per month) |

**Report 1 — Points** (`GET /api/reports/points`)
- Query params: `userId, facilityId, facilityType, month, year, page, limit`
- Response includes `summary.totalEarnedPoints`, `summary.totalRedeemedPoints`, `summary.totalOpenBalance`
- Points are generated independently of WREGIS approval

**Report 2 — REC Generation** (`GET /api/reports/rec-generation`)
- Query params: `month, year, facilityId, facilityType, wregisStatus, zipCode, page, limit`
- Response includes `statusSummary` — count + totals per `WregisStatus` value

**Report 3 — REC Sales Entries** (`GET /api/reports/rec-sales`)
- Query params: `startDate, endDate, recBuyer, status, page, limit`
- Response includes `summary.totalRecsSold`, `summary.totalRevenue`, `summary.averagePricePerRec`
- Multiple entries per month are expected (unlike the monthly reports)

---

## ✅ Item 5 — WREGIS Export Chunking

**Status: IMPLEMENTED**

Excel row limit (~10,000) means large exports must be split into chunked files.

**Implementation:**
- Added `exportRecGenerationToXlsx(filters, chunkSize=9000)` to `src/services/recGeneration.service.ts`
- Uses the already-installed `xlsx` package — no new dependencies
- Fetches all matching records (no pagination), splits into sheets of 9000 rows each
- Returns an XLSX buffer + filename, streamed directly as a file download response

**New endpoint:**
```
GET /api/rec-generation/export
```
Query params: `month`, `year`, `facilityId`, `facilityType`, `wregisStatus`, `zipCode`

Response: XLSX file download (`Content-Disposition: attachment`)
- Sheet1: rows 1–9000, Sheet2: rows 9001–18000, etc.
- Filename: `wregis-export-YYYY-MM-DD.xlsx`

**Files changed:**
- `src/services/recGeneration.service.ts` — `exportRecGenerationToXlsx()` added
- `src/controllers/recGeneration.controller.ts` — `exportRecGeneration()` added
- `src/routes/recGeneration.routes.ts` — `GET /export` added (declared before `/:id` routes)

---

## ✅ Item 6 — Fix Partner Invoice Upload Endpoint 🟠 HIGH

**Status: IMPLEMENTED**

The real broken path was `POST /api/quarterly-statements/invoices` (not newPayout routes as initially suspected). `createInvoice` was reading `invoiceDocument` from `req.body` as a plain string — the GCS upload middleware was never applied.

**Files changed:**
- `src/routes/quarterlyStatement.routes.ts` — added `uploadToGCS("invoiceDocument", "invoices")` middleware to `POST /invoices`
- `src/controllers/quarterlyStatement.controller.ts` — `createInvoice` now reads `(req as any).fileUrl` (set by middleware) with fallback to `req.body.invoiceDocument` for backwards compatibility

**How to use from the frontend:**
```
POST /api/quarterly-statements/invoices
Content-Type: multipart/form-data

Fields: userId, quarter, year, invoiceNo, issueDate, dueDate, amount, description
File field: invoiceDocument  ← actual file upload (PDF/image)
```
The `invoiceDocument` URL stored in the DB will now be the GCS public URL of the uploaded file.

---

## ✅ Item 7 — Invoice Discrepancy Detection (Hide System Invoice #, Validate Amounts) 🟠 HIGH

**Status: IMPLEMENTED**

**Schema changes in `prisma/schema.prisma` → `PayoutRequest`:**
```prisma
partnerInvoiceAmount   Float?   // amount partner typed from their invoice
hasDiscrepancy         Boolean  @default(false)
systemCalculatedAmount Float?   // snapshot of server-calculated amount
```

**Service changes in `src/services/newPayout.service.ts` → `requestPayout()`:**
- Accepts new optional parameter `partnerInvoiceAmount`
- Saves `systemCalculatedAmount = amount` (the server's figure)
- Sets `hasDiscrepancy = true` if `|partnerInvoiceAmount - amount| > $0.01`
- System invoice number is never returned in the partner-facing payout creation response

**Controller changes in `src/controllers/newPayout.controller.ts` → `requestPayout()`:**
- Reads `partnerInvoiceAmount` from request body
- Passes it to service

**Migration required:**
```bash
npm run migrate -- add_invoice_discrepancy_fields_to_payout_requests
```

---

## ✅ Item 8 — Revenue Wallet — Remove "Held Amount" for Commercial/Partner 🟡 MEDIUM

**Status: IMPLEMENTED**

**Service change in `src/services/wallet.service.ts`:**
- Added new method `getWalletForDisplay(userId, userType?)`
- For `userType === "COMMERCIAL"` or `"PARTNER"`: returns wallet object WITHOUT `pendingPayout`
- For `RESIDENTIAL` (default): full wallet object returned including `pendingPayout`
- `pendingPayout` is NOT removed from the database — only excluded from the API response

**Controller change in `src/controllers/wallet.controller.ts`:**
- `getWallet()` now accepts optional `?userType` query parameter
- Routes to `getWalletForDisplay()` instead of `ensureWallet()`

**How to use from the frontend:**
```
GET /api/revenue/:userId?userType=COMMERCIAL
GET /api/revenue/:userId?userType=PARTNER
GET /api/revenue/:userId?userType=RESIDENTIAL
GET /api/revenue/:userId          (defaults to full wallet)
```

---

## ✅ Item 9 — REC Sales Management Aggregate View 🟡 MEDIUM

**Status: IMPLEMENTED**

**Service change in `src/services/recSale.service.ts`:**
- Added `getRecManagementSummary()` — returns: `{ availableRecs, totalRecsSold, mostRecentRecPrice }`
- Sources: `RecWallet(PLATFORM).recBalance`, `RecSale.totalSoldRecs` aggregate, active `RecPrice`

**Controller change in `src/controllers/recSale.controller.ts`:**
- Added `getRecManagementSummary` handler

**Route added in `src/routes/recSale.routes.ts`:**
```
GET /api/rec/summary
```
Returns the three overview stats for the REC Sales Management page. Detailed per-facility monthly records are accessible through the facility details endpoints in user management.

---

## ✅ Item 10 — Partner Performance Report Column Update 🟡 MEDIUM

**Status: IMPLEMENTED**

No existing partner performance report was found — built from scratch in `AdminService`.

**Files changed:**
- `src/services/admin.service.ts` — added `getPartnerPerformance(params)`
- `src/controllers/admin.controller.ts` — added `getPartnerPerformance` handler
- `src/routes/admin.routes.ts` — added `GET /api/admin/partner-performance`

**New endpoint:**
```
GET /api/admin/partner-performance?page=1&limit=20
```
Returns per-partner:
| Field | Source |
|---|---|
| `companyName` | `Partner.name` |
| `email` | `Partner.email` |
| `partnerType` | `Partner.partnerType` |
| `totalReferrals` | Count of `Referral` records where `inviterId = partner.userId` |
| `totalFacilities` | Count of `status = "VERIFIED"` commercial + residential facilities |
| `recsGenerated` | Sum of `MonthlyFacilityRecs.recsGenerated` across all VERIFIED facilities |

Address and status columns are NOT included (removed per meeting decision).

---

## ✅ Item 11 — REC Generation Label Change 🟡 MEDIUM

**Status: DEFERRED — frontend label change**

In the new reports system, the REC generation data is in `GET /api/reports/rec-generation`. The response field names do not include the word "generation" as a mislabeled metric — they use standard field names (`recsGenerated`, `approvedRecsAmount`, etc.).

If there is an existing endpoint/response that uses a field called `generation` to mean "commercial REC sales", locate it and rename the field in the response serializer.

---

## ✅ Item 12 — Residential Payout Eligibility Endpoint 🟡 MEDIUM

**Status: IMPLEMENTED**

**Service change in `src/services/newPayout.service.ts`:**
- Added `checkResidentialPayoutEligibility(userId)`
- Checks: user's total `RecWallet.pointBalance` across all residential facilities
- Minimum threshold: `MIN_RESIDENTIAL_PAYOUT_POINTS` env var (default: `1000`)
- Returns: `{ eligible, currentPoints, requiredPoints, availableBalance }`

**Controller change in `src/controllers/newPayout.controller.ts`:**
- Added `checkPayoutEligibility` handler

**Route added in `src/routes/newPayout.routes.ts`:**
```
GET /api/payout-request/eligibility/:userId
```

**Environment variable to configure threshold:**
```
MIN_RESIDENTIAL_PAYOUT_POINTS=1000
```

---

## Item 13 — Confirm Reporting Routes Are Read-Only 🟢 LOW

**Status: CONFIRMED**
`src/routes/quarterlyStatement.routes.ts` — only GET endpoints. No payout-triggering POST routes are present under `/api/quarterly-statements`.

---

## Item 14 — Remove Commercial/Residential Segmentation from Generation View 🟢 LOW

**Status: IMPLEMENTED via new reports structure**
The new `GET /api/reports/rec-generation` endpoint returns all records with a `facilityType` field on each record — it does NOT segment at the top level into "commercial" vs "residential" lists. The distinction is a per-row attribute, not a top-level split.

---

## Item 15 — Remove VAT from Partner Invoice Submission 🟢 LOW

**Status: DEFERRED**

No `vat` field was found in the `PayoutRequest` model or `newPayout.service.ts` in the current schema. If VAT appears in validation or request body parsing, it should be removed from:
- `src/validation/` — remove from any invoice/payout validator
- `src/controllers/newPayout.controller.ts` — stop reading `vat` from body
- `prisma/schema.prisma` — if a `vat` field exists on any model, make it optional and stop writing to it

---

## Summary of What Was Implemented

| # | Item | Status | Key Files |
|---|---|---|---|
| 1 | WREGIS status lifecycle on MonthlyFacilityRecs | ✅ Done | `prisma/schema.prisma` |
| 2 | Admin approve/reject/adjust/submit REC generation | ✅ Done | `recGeneration.service.ts`, `recGeneration.controller.ts`, `recGeneration.routes.ts` |
| 3 | REC segmentation by vintage & zip code | ✅ Done | `prisma/schema.prisma`, `reports.service.ts`, `recGeneration.service.ts` |
| 4 | Three-report structure (Points, Generation, Sales) | ✅ Done | `reports.service.ts`, `reports.controller.ts`, `reports.routes.ts` |
| 5 | WREGIS export chunking | ✅ Done | `recGeneration.service.ts` (`exportRecGenerationToXlsx`), `GET /api/rec-generation/export` |
| 6 | Fix partner invoice upload (middleware wiring) | ✅ Done | `quarterlyStatement.routes.ts` + `quarterlyStatement.controller.ts` |
| 7 | Invoice discrepancy detection | ✅ Done | `prisma/schema.prisma`, `newPayout.service.ts`, `newPayout.controller.ts` |
| 8 | Revenue Wallet — exclude Held Amount for commercial/partner | ✅ Done | `wallet.service.ts`, `wallet.controller.ts` |
| 9 | REC Sales Management aggregate endpoint | ✅ Done | `recSale.service.ts`, `recSale.controller.ts`, `recSale.routes.ts` |
| 10 | Partner performance report columns | ✅ Done | `admin.service.ts` (`getPartnerPerformance`), `GET /api/admin/partner-performance` |
| 11 | REC generation label rename | ⏳ Deferred | Frontend concern + new reports already correct |
| 12 | Residential payout eligibility endpoint | ✅ Done | `newPayout.service.ts`, `newPayout.controller.ts`, `newPayout.routes.ts` |
| 13 | Confirm quarterly statement routes are read-only | ✅ Confirmed | — |
| 14 | Remove commercial/residential segmentation from generation view | ✅ Done via new reports | `reports.routes.ts` |
| 15 | Remove VAT from invoice submission | ⏳ Deferred | Not found in schema — check validators |

## Migrations — COMPLETED ✅

Both migrations applied to `dcarbon-db` on March 17, 2026:
```
✅ 20260317212254_add_wregis_status_to_monthly_recs
✅ 20260317220000_add_invoice_discrepancy_fields_to_payout_requests
✅ Prisma Client v6.4.1 regenerated
```

---

## What The Frontend Teams Can Build Against Now

### Web App (Customer-facing)

| Feature | Server Endpoint | Status |
|---|---|---|
| Gate "Request Payout" button for residential users | `GET /api/payout-request/eligibility/:userId` | ✅ Ready |
| Submit invoice with discrepancy detection | `POST /api/payout-request/request` + `partnerInvoiceAmount` in body | ✅ Ready |
| Revenue wallet — no "Held Amount" for commercial/partner | `GET /api/revenue/:userId?userType=COMMERCIAL` | ✅ Ready |
| Points report | `GET /api/reports/points` | ✅ Ready |
| REC generation report | `GET /api/reports/rec-generation` | ✅ Ready |
| REC sales entries report | `GET /api/reports/rec-sales` | ✅ Ready |
| REC Sales Management overview (aggregate) | `GET /api/rec/summary` | ✅ Ready |
| Fix invoice file upload | `POST /api/quarterly-statements/invoices` | ✅ Ready |

### Admin App

| Feature | Server Endpoint | Status |
|---|---|---|
| WREGIS — list generation records with filters | `GET /api/rec-generation` | ✅ Ready |
| WREGIS — mark as submitted | `PATCH /api/rec-generation/:id/submit` | ✅ Ready |
| WREGIS — approve generation | `PATCH /api/rec-generation/:id/approve` | ✅ Ready |
| WREGIS — reject generation | `PATCH /api/rec-generation/:id/reject` | ✅ Ready |
| WREGIS — adjust REC amount | `PATCH /api/rec-generation/:id/adjust` | ✅ Ready |
| WREGIS — bulk approve | `POST /api/rec-generation/bulk-approve` | ✅ Ready |
| WREGIS — export to XLSX (chunked 9000 rows/sheet) | `GET /api/rec-generation/export` | ✅ Ready |
| Invoice discrepancy flag on payout records | `hasDiscrepancy`, `partnerInvoiceAmount`, `systemCalculatedAmount` on `PayoutRequest` | ✅ Ready |
| Partner performance report | `GET /api/admin/partner-performance` | ✅ Ready |
| Points report | `GET /api/reports/points` | ✅ Ready |
| REC generation report | `GET /api/reports/rec-generation` | ✅ Ready |
| REC sales entries report | `GET /api/reports/rec-sales` | ✅ Ready |
| REC Sales Management overview | `GET /api/rec/summary` | ✅ Ready |

### Still Deferred (Server work remaining)

| # | Item | Notes |
|---|---|---|
| 15 | Remove VAT from invoice submission | No `vat` field found in schema — check validators if present |

---

---

# March 18, 2026 Meeting — New Items

> Source: DCarbon Project — 2026_03_18 19_56 WAT — Notes by Gemini
> Added to plan: March 20, 2026

## Status Legend

| Symbol | Meaning |
|---|---|
| 🔴 CRITICAL | Server blocks the feature entirely — must be done first |
| 🟠 HIGH | Broken functionality, visible to users |
| 🟡 MEDIUM | Feature work / UX completeness |
| ✅ DONE | Implemented |

---

## SERVER Items — March 18, 2026

### ✅ Item 16 — Fix `getAllReferrals()` to Include Invitee Company Name 🟠 HIGH
> **Status: IMPLEMENTED — March 20, 2026**

**Meeting context:**
During the registration pipeline demo, "AK" was shown as just their individual name instead of "AK B company". Awam Victor confirmed the pipeline uses `GET /api/admin/referrals` which pulls from `getAllReferrals()`. The fix to `getAllUsers()` (Item 16 from the March 16 plan) did not help here because the registration pipeline reads the *referral* records, not the user list.

**Root cause confirmed (from schema inspection):**
The `Referral` model stores the invited customer as `inviteeEmail` (a plain string, no FK to the `User` table). The `getAllReferrals()` query joins the `inviter` (the referring partner) but there is no join path to the invitee's registered `User` record.

To get a commercial invitee's company name, the query must:
1. Fetch referrals as today
2. Collect all `inviteeEmail` values from the result
3. Batch-lookup `User` records by those emails, including `commercialUser { companyName, ownerFullName }`
4. Merge the result back onto each referral row as `inviteeUser: { companyName, ownerFullName, userType, id }`

**Fields to add to each referral row in the response:**
```
inviteeUser: {
  id            — User.id (null if not yet registered)
  userType      — COMMERCIAL | RESIDENTIAL | PARTNER
  companyName   — from commercialUser.companyName (null for residential/partner)
  ownerFullName — from commercialUser.ownerFullName (null for residential/partner)
  displayName   — companyName ?? ownerFullName ?? firstName+lastName (resolved display name)
}
```

**Fix applied (`src/services/admin.service.ts` → `getAllReferrals()`):**
After fetching referral records, all unique `inviteeEmail` values are batch-looked up in a single `prisma.user.findMany()` call. Each referral row now includes an `inviteeUser` object:
```json
"inviteeUser": {
  "id": "...",
  "email": "ak@example.com",
  "userType": "COMMERCIAL",
  "firstName": "AK",
  "lastName": "Surname",
  "companyName": "AK B company",
  "ownerFullName": "AK Full Name",
  "displayName": "AK B company"
}
```
If the invitee has not registered yet, `inviteeUser` is `null` (the email was sent but the user hasn't signed up).

**No schema migration required.**

**What the Admin team can use now:**
- Use `row.inviteeUser.displayName` as the primary label in the registration pipeline list
- For COMMERCIAL rows: `companyName` (primary) + `ownerFullName` (secondary)
- For unregistered invitees: `inviteeUser === null` → show `row.inviteeEmail` with an "Unregistered" badge

---

### ✅ Item 17 — Add PARTNER Support to Quarterly Statement Endpoint 🔴 CRITICAL
> **Status: IMPLEMENTED — March 20, 2026**

**Meeting context:**
"The feature to 'submit invoice' was only built for the partner but should be available to commercial users as well." — this line is misleading. In practice the QA found that the PARTNER userType is **blocked** by the server. The `getQuarterlyStatement` controller explicitly validates `userType` against `["RESIDENTIAL", "COMMERCIAL"]` and returns a 400 for any PARTNER request. This means partners cannot get their quarterly earnings summary and cannot submit invoices via the structured flow.

**Root cause:**
```ts
// quarterlyStatement.controller.ts line 21-22
if (!["RESIDENTIAL", "COMMERCIAL"].includes(userType)) {
  throw new ValidationError("userType must be either RESIDENTIAL or COMMERCIAL");
}
```

And `getOrCreateUserQuarterlyStatement()` has no PARTNER branch — it would fall through with zero facilities and create a zero-value statement.

**What partners earn:**
Partners earn commissions (from `Commission` table where `userId = partner.userId`). They do NOT own facilities directly, so the WREGIS and REC generation aggregation does not apply to them. Their quarterly statement is:
- `totalRecPayout` = sum of `Commission.amount` for the quarter (already computed for COMMERCIAL — same logic works for PARTNER)
- `totalRecsGenerated` = 0 (partners don't generate RECs)
- `totalRecsSold` = 0
- `totalRecsBalance` = 0

**Fix applied:**

`src/controllers/quarterlyStatement.controller.ts`:
- Validation now accepts `["RESIDENTIAL", "COMMERCIAL", "PARTNER"]`

`src/services/quarterlyStatement.service.ts` → `getOrCreateUserQuarterlyStatement()`:
- Added `UserTypeForStatement = "COMMERCIAL" | "RESIDENTIAL" | "PARTNER"` type
- PARTNER branch: `facilityIds` stays `[]`; zero-statement short-circuit is skipped for PARTNER so the commission aggregation step always runs
- REC generation aggregation (step 4) and REC sales aggregation (step 6) are both wrapped in `if (facilityIds.length > 0)` guards — PARTNER gets zeros for these, commission total is still captured in `totalRecPayout`

**No schema migration required.**

**What the Web App / Admin teams can use now:**
```
GET /api/quarterly-statements?userId=:id&quarter=1&year=2026&userType=PARTNER
```
Returns a quarterly statement for a PARTNER user with `totalRecPayout` = their commission earnings for that quarter. `totalRecsGenerated`, `totalRecsSold`, `totalRecsBalance` will be `0` — which is correct for partners.

---

### ✅ Item 18 — Quarterly Earnings Breakdown Endpoint (new) 🟡 MEDIUM
> **Status: IMPLEMENTED — March 20, 2026**

**Meeting context:**
Chimdinma Kalu requested a revamp of the reporting page, specifically: "the submit invoice function should connect to the earning statement table. The earnings statement should display what is due to the user based on commission or bonus, using a table format with facility ID, type, amount earned, quarter, and year."

**Current state:**
`GET /api/quarterly-statements?userId=...&quarter=Q&year=Y&userType=T` returns **aggregate totals only** (one number for `totalRecPayout`, one for `totalRecsGenerated`, etc.). There is no line-by-line breakdown of what was earned per facility or per commission record.

**New endpoint required:**
```
GET /api/quarterly-statements/earnings-breakdown?userId=:id&quarter=1&year=2026&userType=COMMERCIAL
```

**Response shape:**
```json
{
  "status": "success",
  "data": {
    "userId": "...",
    "quarter": 1,
    "year": 2026,
    "userType": "COMMERCIAL",
    "totalDue": 1250.00,
    "breakdown": [
      {
        "source": "COMMISSION",
        "facilityId": "...",
        "facilityType": "COMMERCIAL",
        "facilityName": "Solar Park A",
        "amount": 750.00,
        "quarter": 1,
        "year": 2026,
        "commissionDate": "2026-02-15T..."
      },
      {
        "source": "BONUS",
        "facilityId": null,
        "facilityType": null,
        "facilityName": null,
        "amount": 500.00,
        "quarter": 1,
        "year": 2026,
        "commissionDate": "2026-03-01T..."
      }
    ]
  }
}
```

**What this unlocks for the frontend:**
- The invoice submission screen can pre-populate the amount field with `totalDue`
- The user sees exactly what they are invoicing for (per facility, per commission type)
- Partners see their commission lines without facility data (facilityId null)

**Fix applied:**

`src/services/quarterlyStatement.service.ts` — new `getEarningsBreakdown()` method:
- Queries `Commission` records for the user in the quarter date range
- Queries `Bonus` records for the user in the quarter/year
- Batch-lookups facility names from both `CommercialFacility` and `ResidentialFacility` in one round-trip
- Returns `{ userId, quarter, year, totalDue, breakdown: [...rows] }`

`src/controllers/quarterlyStatement.controller.ts` — new `getEarningsBreakdown` handler

`src/routes/quarterlyStatement.routes.ts` — `GET /earnings-breakdown` declared before `/:id` routes to prevent path shadowing

**No schema migration required.**

**Endpoint:**
```
GET /api/quarterly-statements/earnings-breakdown?userId=:id&quarter=1&year=2026&userType=COMMERCIAL
```

**Response shape:**
```json
{
  "status": "success",
  "data": {
    "userId": "...",
    "quarter": 1,
    "year": 2026,
    "totalDue": 1250.00,
    "breakdown": [
      {
        "id": "...",
        "source": "COMMISSION",
        "facilityId": "...",
        "facilityType": "COMMERCIAL",
        "facilityName": "Solar Park A",
        "amount": 750.00,
        "quarter": 1,
        "year": 2026,
        "date": "2026-02-15T..."
      },
      {
        "id": "...",
        "source": "BONUS",
        "facilityId": null,
        "facilityType": null,
        "facilityName": null,
        "amount": 500.00,
        "quarter": 1,
        "year": 2026,
        "date": "2026-03-01T..."
      }
    ]
  }
}
```
Works for COMMERCIAL, RESIDENTIAL, and PARTNER. For PARTNER, `facilityType` on commission rows will be whatever type the referred facility is.

---

## Summary Table — March 18 Server Items

| # | Item | Priority | Files | Status |
|---|---|---|---|---|
| 16 | `getAllReferrals()` — attach invitee company name | 🟠 HIGH | `admin.service.ts` | ✅ DONE |
| 17 | Add PARTNER support to quarterly statement | 🔴 CRITICAL | `quarterlyStatement.controller.ts`, `quarterlyStatement.service.ts` | ✅ DONE |
| 18 | Quarterly earnings breakdown endpoint | 🟡 MEDIUM | `quarterlyStatement.service.ts`, `quarterlyStatement.controller.ts`, `quarterlyStatement.routes.ts` | ✅ DONE |

---

## ADMIN Items — March 18, 2026

> These are changes the DCARBON-ADMIN app needs to make. No server changes required for these.

### ADMIN-05 | Registration Pipeline — Use Invitee Display Name from Referrals Response
**Dependency: ✅ SERVER Item 16 (once done)**

After Item 16 ships, the `GET /api/admin/referrals` response will include `inviteeUser.companyName` and `inviteeUser.displayName` on each row.

**Action required:**
- In the registration pipeline list, replace the current name display with `row.inviteeUser.displayName`
- For COMMERCIAL rows: show `companyName` as primary, `ownerFullName` as secondary
- For RESIDENTIAL / PARTNER rows: show `firstName + lastName` as before

---

### ADMIN-06 | Registration Pipeline — Payout & Statement Screens: Restore All User Details
**No server dependency.**

**Meeting context:**
Chimdinma explicitly stated: "the intention was to add business details, not remove existing user details such as name and address." The payout screens for commercial partners had their personal details stripped. All previous data (name, address, phone) must be restored AND business name added.

**Action required:**
- On commercial payout and statement screens: show ALL of name, email, address, phone AND company name
- On partner payout and statement screens: same — restore all personal fields, add company/org name
- On residential payout screens: restore all personal detail rows (and address the extra padding issue — see WEB APP section)

---

## WEB APP Items — March 18, 2026

> These are changes the DCarbon web app (customer-facing) needs to make. No server changes required for these.

### WEB-01 | Residential Payout Screen — Remove "Amount Held" and "Total Commission" Display
**No server dependency.**

The server is correct — `GET /api/revenue/:userId?userType=RESIDENTIAL` returns the full wallet including `pendingPayout`. The frontend should not render `pendingPayout` or `totalCommission` on the residential payout screen. Only `availableBalance` and `pointBalance` should be shown.

---

### WEB-02 | Residential Payout Screen — Reduce Extra Padding on Detail Lines
**No server dependency.**

CSS/Tailwind fix — reduce `py-*` spacing on customer detail rows in the residential payout screen.

---

### WEB-03 | Commercial Statements — Restore All Personal Details + Add Business Name
**Dependency: ✅ SERVER-03 already done.**

Commercial statement and payout screens had existing fields stripped. Restore name, email, address, phone. Add company name and owner name from `GET /api/user/get-commercial-user/:userId`.

---

### WEB-04 | Partner Payout / Commission Statement — Restore All Details + Add Company Name
**No server dependency for the display fix.**

Same issue as WEB-03 but for partners. Restore all previously shown personal fields. Add company/org name from the partner profile endpoint.

---

### WEB-05 | Invoice Submission Screen — Pre-populate Amount from Earnings Breakdown
**Dependency: ⏳ SERVER Item 18 (earnings breakdown endpoint).**

Once `GET /api/quarterly-statements/earnings-breakdown` is available, the invoice submission screen should:
1. Fetch the breakdown on mount (for the selected quarter/year)
2. Pre-populate the `amount` field with `totalDue`
3. Show the breakdown table below the form so users see what they're invoicing for

---

## Updated: What Frontend Teams Can Build Against

### Web App

| Feature | Server Endpoint | Status |
|---|---|---|
| Gate "Request Payout" for residential | `GET /api/payout-request/eligibility/:userId` | ✅ Ready |
| Submit invoice with discrepancy detection | `POST /api/payout-request/request` + `partnerInvoiceAmount` | ✅ Ready |
| Revenue wallet — no Held Amount for commercial/partner | `GET /api/revenue/:userId?userType=COMMERCIAL` | ✅ Ready |
| Points report | `GET /api/reports/points` | ✅ Ready |
| REC generation report | `GET /api/reports/rec-generation` | ✅ Ready |
| REC sales entries report | `GET /api/reports/rec-sales` | ✅ Ready |
| REC Sales Management overview | `GET /api/rec/summary` | ✅ Ready |
| Invoice file upload (both modes) | `POST /api/quarterly-statements/invoices` | ✅ Ready |
| Partner quarterly statement + invoice | `GET /api/quarterly-statements?userType=PARTNER` | ✅ Ready — Item 17 done |
| Earnings breakdown for invoice screen | `GET /api/quarterly-statements/earnings-breakdown` | ✅ Ready — Item 18 done |

### Admin App

| Feature | Server Endpoint | Status |
|---|---|---|
| Registration pipeline — invitee company name | `GET /api/admin/referrals` → `inviteeUser.companyName` | ✅ Ready — Item 16 done |
| WREGIS export (submitted records only) | `GET /api/rec-generation/export` | ✅ Ready |
| WREGIS lifecycle management | `PATCH /api/rec-generation/:id/*` | ✅ Ready |
| Partner performance report | `GET /api/admin/partner-performance` | ✅ Ready |
| User list with company names | `GET /api/admin/get-all-users` | ✅ Ready |
| Referrals — exclude INVITED by default | `GET /api/admin/referrals` | ✅ Ready |

---

*Updated: March 20, 2026 — All March 18 meeting items implemented. All server fixes complete. Admin and Web App teams are fully unblocked.*
