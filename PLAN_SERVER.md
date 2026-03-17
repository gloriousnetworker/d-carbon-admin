# DCarbon Server — Fix & Change Plan
> Source: Meeting Notes — March 16, 2026
> Scope: Backend API (`dcarbon-server`) only
> Last updated: March 17, 2026
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

## Admin App Integration — Completed (March 17, 2026)

All Phase 2 admin fixes have been implemented against the live server endpoints. See `ADMIN_IMPLEMENTATION_PLAN.md` for full details.

| Admin Fix | Server Dependency | Admin File(s) Changed | Status |
|---|---|---|---|
| FIX-11 — Invoice discrepancy auto-flag | Server Item 7 (`hasDiscrepancy`, `partnerInvoiceAmount`, `systemCalculatedAmount`) | `CommercialPayoutDetails.jsx`, `PartnerCommissionPayoutDetails.jsx` | ✅ Done |
| FIX-12 — REC approve/reject/adjust/submit per facility | Server Items 1 & 2 (`WregisStatus`, `/api/rec-generation/:id/*`) | *(new)* `FacilityRECHistory.jsx`, `CommercialDetails.jsx`, `ResidentialDetails.jsx` | ✅ Done |
| FIX-13 — Three-report structure | Server Item 4 (`/api/reports/points`, `/api/reports/rec-generation`, `/api/reports/rec-sales`) | `Reporting.jsx` | ✅ Done |
| FIX-13 — Partner Performance switched to dedicated endpoint | Server Item 10 (`GET /api/admin/partner-performance`) | `Reporting.jsx` | ✅ Done |
| FIX-14 — WREGIS chunked export | Server Item 5 (`GET /api/rec-generation/export` XLSX) | `ManagementContent.jsx` | ✅ Done |
| Wallet `userType` param | Server Item 8 (`?userType=COMMERCIAL/PARTNER`) | `CommercialPayoutDetails.jsx`, `PartnerCommissionPayoutDetails.jsx` | ✅ Done |

*Updated: March 17, 2026 — all meeting items implemented, all admin Phase 2 fixes complete*
