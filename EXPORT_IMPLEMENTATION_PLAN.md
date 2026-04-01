# Export Implementation Plan — DCarbon Admin

**Date:** 2026-03-14 (Updated 2026-03-14 — corrected to `develop` branch findings)
**Context:** Cross-repo audit of `dcarbon-server` (**develop branch**), `dcarbon-webapp`, and `dcarbon-admin`
**Reference templates:** `export_docs/` folder (provided by DCarbon)
**Goal:** Implement all export functionality requested by client (Phillip Kopp) for go-live

> **IMPORTANT:** The original version of this document was based on the `main` branch of `dcarbon-server`, which is significantly behind the `develop` branch. The `develop` branch is what the staging/production servers use. This corrected version reflects the actual state of the backend.

---

## Current Backend Reality (develop branch)

The backend (`dcarbon-server`, **develop branch**) is a **full-featured platform** with admin dashboard support, commission management, REC trading, and payout processing. It has:

- **29 route groups** including `/api/admin`, `/api/rec`, `/api/payout`, `/api/commission`, `/api/bonus`, `/api/quarterly-statements`, `/api/revenue`, `/api/bank-details`, and more
- **~42 Prisma models** (vs ~15 on main)
- **220+ API endpoints** (vs ~40 on main)
- **Full admin route group** — `/api/admin/*` exists with 45+ endpoints
- **Separate Admin model** — dedicated admin table with role field
- **Commission system** — 3-tier structure (CommissionTier → CommissionStructure → Commission) with 11 commission modes
- **REC sales/trading** — RecSale, RecBuyer, RecPrice, RecWallet models + full CRUD
- **Quarterly statements & invoices** — QuarterlyStatement + QuarterlyInvoice models
- **Payout system** — Two systems (legacy commission-based + new PayoutRequest-based)
- **Bonus system** — 10+ bonus types with quarterly calculation
- **Revenue wallet** — RevenueWallet + RecWallet per user
- **Storage:** Google Cloud Storage (`@google-cloud/storage`) — **already migrated from Azure**
- **DGG support** — DistributedGenerationGroup model for residential facility grouping

### Confirmed Prisma Models (~42 total)
User, Admin, CommercialUser, Partner, Referral, FinancialInformation, CommercialFacility, ResidentialFacility, UtilityAuthorization, Agreement, Contact, Documentation, ResidentialDocumentation, MeterDetails, UtilityProvider, UtilityProviderRequest, MonthlyFacilityRecs, FacilityMonthlySales, DistributedGenerationGroup, FinancialType, Notification, Faq, FeatureSuggestion, QuarterlyStatement, QuarterlyInvoice, Commission, CommissionTier, CommissionStructure, CommissionContractTerms, Bonus, BonusStructure, JobLog, RecSale, RecPrice, RecBuyer, FacilitySales, RecWallet, RevenueWallet, PayoutRequest, UserAccountDetail, AuthWatchList

### Key Backend Endpoints Available for Export

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/get-all-users` | GET | All users with pagination |
| `/api/admin/customer/:email` | GET | Single customer by email |
| `/api/admin/partners` | GET | All partners |
| `/api/admin/facility-sales` | GET | Facility sales data |
| `/api/admin/meter-records/residential` | GET | Residential meter records |
| `/api/admin/meter-records/commercial` | GET | Commercial meter records |
| `/api/admin/analytics` | GET | Dashboard analytics |
| `/api/rec/` | GET | All REC sales |
| `/api/rec/statistics` | GET | REC statistics |
| `/api/rec/user-rec-report/:userId` | GET | User REC report |
| `/api/rec/sale-statement` | GET | REC sale statement |
| `/api/rec/price/current` | GET | Current REC price |
| `/api/rec/price/list` | GET | All REC prices |
| `/api/rec/buyers` | GET | All REC buyers |
| `/api/rec/chart/monthly` | GET | Monthly REC chart data |
| `/api/rec/chart/quarterly` | GET | Quarterly REC chart data |
| `/api/rec/facility/rec-balance/:facilityId` | GET | Facility REC balance |
| `/api/rec/user/rec-balance/:userId` | GET | User REC balance |
| `/api/rec/platform/rec-balance` | GET | Platform-wide REC balance |
| `/api/rec/user/revenue/:userId` | GET | User revenue balance |
| `/api/quarterly-statements/` | GET | Quarterly statement |
| `/api/quarterly-statements/invoices` | GET | List invoices |
| `/api/commission/invoice/:id` | GET | Quarterly invoice |
| `/api/payout/commission-total/:userId` | GET | Commission total for quarter |
| `/api/payout/commission-breakdown/:userId` | GET | Detailed commission breakdown |
| `/api/payout/history/:userId` | GET | Payout history |

### Notable Differences from Main Branch
| Aspect | Main Branch | Develop Branch |
|--------|-------------|----------------|
| Admin System | None | Full Admin model + 45+ endpoints |
| Commission | None | 3-tier with 11 modes |
| REC Sales | None | Full trading system |
| Payout | None | Two-tier payout system |
| Quarterly Statements | None | Statement + Invoice models |
| Storage | Azure Blob | Google Cloud Storage |
| Route Files | 6 | 29 |
| Prisma Models | ~15 | ~42 |
| Residential Facilities | Basic | Full model + routes |

---

## Reference Templates Analysis (from `export_docs/`)

### 1. `Generation_data_3_1_25.csv` — WREGIS REC Generation Data Export
This is the **exact format** the regulator (WREGIS) requires for monthly REC data submission:

```csv
Generator ID, Reporting Unit ID, Vintage, Start Date, End Date, Total MWh
W23135,W23135,03/2025,01/01/2025,03/31/2025,0.0524
W23134,W23134,03/2025,01/01/2025,03/31/2025,0.10234
W23111,W23111,03/2025,01/01/2025,03/31/2025,1.2344
```

**Columns:** Generator ID (WREGIS ID), Reporting Unit ID, Vintage (MM/YYYY), Start Date (MM/DD/YYYY), End Date (MM/DD/YYYY), Total MWh

### 2. `Sales Agent Invoice-Statement Example.docx` — Commission Statement Format
Two-part document:
- **Page 1 — Invoice:** Partner issues this to DCarbon based on their statement
- **Page 2 — Agent Statement:** DCarbon generates this showing commission breakdown

**Statement header fields:**
- New MW DIR (direct registrations MW)
- Active MW DIR (total active direct MW)
- MWh DIR (direct energy production)
- REC Sold (total RECs sold)
- New MW Partner (partner registrations MW)
- Active MW Partner (total active partner MW)
- MWh Partner (partner energy production)
- REC Price (current REC price)

**Commission line items (4 types):**
| Item Code | Description | Unit Price Basis |
|-----------|-------------|-----------------|
| DCarbon Dir Reg | Q2 Direct Registration Commissions ($/MW) | $1,000.00/MW |
| DCarbon Part Reg | Q2 Partner Registration Commissions ($/MW) | $500.00/MW |
| DCarbon Dir Comm | Q2 Ongoing Direct Commissions $12.22/REC (2.5%) | $0.3055/REC |
| DCarbon Ong Comm | Q2 Ongoing Partner Commissions $12.22/REC (1.0%) | $0.1222/REC |

**Commission rate structure (from example):**
- Direct registration commission: $1,000/MW
- Partner registration commission: $500/MW
- Ongoing direct commission: 2.5% of REC price
- Ongoing partner commission: 1.0% of REC price
- Billing: DCarbon Solutions, Inc., 8 The Green, STE A, Dover DE, 19901

### 3. `Commercial_DCarbon_WREGIS_Commercial_Registration_Package_Cover-TEMPLATE_copy.docx`
**WREGIS Registration Package for Commercial facilities.** Contains:
- Package ID format: `DCARBON-CA-{county code}-{unit codes}-{address slug}`
- Unit Name format: `DCARBON-CA-{county code}-{unit codes}`
- **Sections:** Unit Registration General Data, WREGIS Document Checklist, WREGIS Owner Fields, WREGIS Operator Fields, WREGIS Engineering Fields, CEC Registration Fields, DCarbon Internal Use
- **Key data points per facility:** Owner name, address, meter ID, utility, COD, nameplate capacity (MW AC), capacity factor, reporting unit ID

### 4. `Residential_DCarbon_WREGIS_Registration_Package_Cover-TEMPLATE.docx`
**WREGIS Registration Package for Residential facilities.** Same structure as commercial but:
- Uses Group Number/Group Name (residential units are grouped into DGGs)
- Simpler WREGIS Data Fields section
- Same CEC Registration Fields and Document Checklist

### 5. `Pre-Approval_Worksheet.xlsx` — WREGIS Pre-Approval Data
Worksheet columns for bulk residential unit registration:
- Group Number, Group Name, Fuel Type, Residential/Non-Residential
- Unit Name, Unit Nameplate (MW), Expansion Indicator
- COD, Unit Address 1/2, City, County, State, Zip, Country
- Unit Revenue Meter ID, Interconnecting Utility
- Document Checklist: Meter ID Documentation, Net Metering Agreement, PTO from Utility, One-Line Diagram, Contract and Registration Rights

### 6. `intervals_0076260311390-Ping.csv` — UtilityAPI Interval Data
Raw 15-minute interval data from UtilityAPI (this is what `MeterDetails` stores):
```csv
meter_uid,utility,utility_service_id,utility_billing_account,utility_service_address,
utility_meter_number,utility_tariff_name,interval_start,interval_end,
interval_kWh,fwd_kWh,net_kWh,rev_kWh,source,updated,interval_timezone
```

### 7. `Electric_15_Minute_...-Nicholas.csv` — Green Button Connect Interval Data
Alternative interval data format (from utility directly):
- Header: Name, Address, Account Number, Meter Number, Reading Start/End
- Data: Meter Number, Date, Start Time, Duration, Consumption, Generation, Net

---

## Export Items — Implementation Status & Recommendations

---

### EXPORT-1: Full User/Personal Details Export ✅ IMPLEMENTED

**Client need:** Download all collected user data from the admin panel (not just view it)

**Status:** IMPLEMENTED in admin app (2026-03-14)

**What was built:**
- `src/lib/exportUtils.js` — Reusable `exportToExcel()` and `exportToCSV()` utilities
- "Export" button on Customer Management page → fetches all users, downloads Excel
- "Export" button on Partner Management page → downloads partner data to Excel
- Dependencies installed: `xlsx`, `file-saver`

**Columns exported:**
- Customers: Name, Email, Phone, User Type, Status, Utility Provider, Finance Company, Address, Facility Status, Date Registered
- Partners: Name, Email, Phone, Partner Type, Status, Address, Date Registered

---

### EXPORT-2: REC Data Export in WREGIS Regulator Format

**Client need:** Monthly export of all generators' REC data for WREGIS submission

**Template format** (from `Generation_data_3_1_25.csv`):
```csv
Generator ID, Reporting Unit ID, Vintage, Start Date, End Date, Total MWh
W23135,W23135,03/2025,01/01/2025,03/31/2025,0.0524
```

**Can build now?** YES — backend has the data (develop branch)

**Backend endpoints available:**
- `GET /api/rec/chart/monthly` — monthly REC chart data
- `GET /api/rec/facility/rec-balance/:facilityId` — facility REC balance
- `GET /api/rec/user/rec-balance/:userId` — user REC balance
- `GET /api/admin/meter-records/commercial` — commercial meter records
- `GET /api/admin/meter-records/residential` — residential meter records
- `MonthlyFacilityRecs` model — already aggregates monthly REC data per facility

**Backend models available:**
- `MonthlyFacilityRecs` — monthly REC aggregation per facility (facilityId, month, year, totalSaleAmount, totalRecsAmount)
- `MeterDetails` — raw meter data
- `CommercialFacility` / `ResidentialFacility` — includes `wregisId` field

**Recommendation: Client-side CSV generation using existing backend data**

**Implementation steps:**

1. **Fetch monthly REC data** from `/api/admin/meter-records/commercial` and `/api/admin/meter-records/residential` (or `/api/rec/chart/monthly`)
2. **Map to WREGIS format:**
   - `facility.wregisId` → Generator ID + Reporting Unit ID
   - Month/year → Vintage (MM/YYYY), Start Date, End Date
   - Sum kWh → Total MWh (÷ 1000)
3. **Generate CSV** using existing `exportToCSV()` utility
4. **Add month/year picker** and "Export for WREGIS" button in REC Sales Management section

**Remaining question:** Need to confirm the exact response shape of `/api/admin/meter-records/*` and `/api/rec/chart/monthly` to finalize the field mapping. May need a dedicated WREGIS export endpoint if existing endpoints don't return per-facility monthly totals with wregisId.

**Effort:** ~3-4 hours (frontend only if data endpoints return what we need, otherwise +2h backend)

---

### EXPORT-3: Partner/Agent Commission Statement Export

**Client need:** Generate and batch-export partner commission statements quarterly. Admin must verify partner invoices against system-generated statements.

**Template format** (from `Sales Agent Invoice-Statement Example.docx`):

**Commission types and rates:**
| Item Code | Description | Rate |
|-----------|-------------|------|
| DCarbon Dir Reg | Direct Registration Commissions | $1,000/MW |
| DCarbon Part Reg | Partner Registration Commissions | $500/MW |
| DCarbon Dir Comm | Ongoing Direct Commissions | 2.5% of REC price per REC |
| DCarbon Ong Comm | Ongoing Partner Commissions | 1.0% of REC price per REC |

**Can build now?** MOSTLY YES — the backend (develop) already has most of the infrastructure

**Backend models already available:**
- `Commission` — per-user, per-facility commission records with amount, month, year
- `CommissionStructure` — 11 commission modes with share splits (customer, sales agent, installer, finance, DCarbon)
- `CommissionTier` — tiered commission rates (min/max amounts)
- `CommissionContractTerms` — max duration, agreement years, cancellation fees
- `QuarterlyStatement` — per-user quarterly aggregation (RECs generated, sold, balance, average price, payout)
- `QuarterlyInvoice` — per-user quarterly invoice (invoice number, amount, document URL)
- `RecPrice` — current and historical REC prices
- `RevenueWallet` — tracks total commission + bonus + earnings per user

**Backend endpoints already available:**
- `GET /api/payout/commission-total/:userId` — commission total for quarter
- `GET /api/payout/commission-breakdown/:userId` — detailed commission breakdown
- `GET /api/payout/history/:userId` — payout history
- `GET /api/quarterly-statements/` — quarterly statement data
- `GET /api/quarterly-statements/invoices` — list invoices
- `GET /api/commission/invoice/:id` — specific quarterly invoice
- `GET /api/rec/price/current` — current REC price
- `GET /api/rec/sale-statement` — REC sale statement

**Recommendation: Frontend export using existing backend data**

Unlike the original plan (which assumed we needed to build the entire commission system from scratch), the develop branch already has:
1. Commission calculation engine (triggered via `/api/commission-cron`)
2. Commission records per user/facility
3. Quarterly statement aggregation
4. Invoice generation

**Implementation steps:**

1. **Wire the admin Payout Processing section** to real endpoints:
   - Fetch commission breakdown: `GET /api/payout/commission-breakdown/:userId`
   - Fetch quarterly statement: `GET /api/quarterly-statements/`
   - Get REC price: `GET /api/rec/price/current`

2. **Create statement export template** matching the `Sales Agent Invoice-Statement Example.docx`:
   - Map commission breakdown data to the 4 line item types
   - Map quarterly statement data to header metrics
   - Generate Excel/PDF for download

3. **Add "Export Statement" button** on the Payout Processing page:
   - Single statement → Excel or PDF per partner
   - Batch export → Excel workbook with one sheet per partner

**Effort:** ~6-8 hours (frontend wiring + export template — no backend work needed)
**Dependencies:**
- Need to confirm the exact response shapes of the payout/commission endpoints
- Commission calculation must have been triggered for the target quarter

---

### EXPORT-4: Document Package ZIP Export ✅ IMPLEMENTED

**Client need:** Download all approved documents for a facility as a single package to submit to WREGIS/CEC.

**Status:** IMPLEMENTED in admin app (2026-03-14)

**What was built:**
- `src/lib/documentExport.js` — `exportDocumentPackage()` function
- Fetches all uploaded document URLs, packages into a ZIP with numbered filenames
- Includes `WREGIS_Document_Checklist.txt` showing all documents and their status
- "Download Docs (X/12)" button on each Commercial facility card
- "Download Docs" button on each Residential facility card

**Storage note:** Backend (develop) already uses GCP (`@google-cloud/storage`), so document URLs should be GCS public URLs. CORS configuration on the GCS bucket must allow the admin app domain to fetch these URLs directly.

---

### EXPORT-5: WREGIS Registration Package Cover Sheet Generation

**Client need:** Generate pre-filled WREGIS registration cover sheets for each facility (commercial and residential) using the DCarbon templates.

**Can build now?** YES — data exists in `CommercialFacility`, `ResidentialFacility`, `User`, `Documentation`, `ResidentialDocumentation` models. The develop branch also has `DistributedGenerationGroup` for residential DGG grouping.

**Implementation steps:**

1. **Create cover sheet generator:**
   ```
   src/lib/wregisPackageGenerator.js
   ```
   - `generateCommercialCoverSheet(facility, user, documentation)` → returns structured data
   - `generateResidentialCoverSheet(facility, user, documentation)` → returns structured data
   - Map database fields to template fields:
     - `user.firstName + user.lastName` → Company/Facility Owner Name
     - `facility.address` → Unit Address 1
     - `facility.city`, `facility.state`, `facility.zipCode` → City, State, Zip
     - `facility.meterId` / `facility.meterIds` → Unit Revenue Meter ID
     - `facility.utilityProvider` → Interconnecting Utility
     - `facility.systemCapacity` → Unit Nameplate Capacity
     - `facility.wregisId` → WREGIS Generator/Reporting Unit ID
     - `documentation.*Status` → Document Checklist confirmed/missing
     - `DistributedGenerationGroup` fields → Group Number/Group Name (residential)

2. **Render as downloadable document** (Excel or PDF):
   - Use `xlsx` to generate an Excel file matching the template layout
   - OR use `docx` library (`npm install docx`) to generate a .docx matching the exact DCarbon template

3. **Add "Generate WREGIS Package" button on facility detail pages**

**Effort:** ~4-5 hours
**Dependencies:** None — all data models exist on develop branch

---

### EXPORT-6: Pre-Approval Worksheet (Bulk Residential)

**Client need:** Generate a bulk WREGIS pre-approval worksheet for all residential units in a group (DGG).

**Template format** (from `Pre-Approval_Worksheet.xlsx`):
Columns: Group Number, Group Name, Fuel Type, Residential/Non-Residential, Unit Name, Unit Nameplate (MW), Expansion Indicator, COD, Unit Address 1/2, City, County, State, Zip, Country, Unit Revenue Meter ID, Interconnecting Utility, Document Checklist items

**Can build now?** YES — the develop branch has:
- `ResidentialFacility` model with full address, meter, utility fields
- `DistributedGenerationGroup` model for DGG grouping
- `ResidentialDocumentation` model for document status tracking
- `/api/residential-facility/get-user-facilities/:userId` endpoint

**Implementation steps:**

1. Fetch residential facilities, optionally filtered by DGG group
2. Map to Pre-Approval Worksheet columns
3. Generate Excel using `xlsx` matching the template layout
4. Add "Export Pre-Approval Worksheet" button in residential facility management

**Effort:** ~2-3 hours
**Dependencies:** None — models and endpoints exist on develop branch

---

## Priority & Sequencing (Updated)

| Order | Item | Effort | Status | Delivers |
|-------|------|--------|--------|----------|
| 1 | **EXPORT-1** (User details) | 2-3h | ✅ DONE | Admin can export all user data |
| 2 | **EXPORT-4** (Doc package ZIP) | 3-4h | ✅ DONE | Doc packages for WREGIS submission |
| 3 | **EXPORT-5** (WREGIS cover sheets) | 4-5h | Ready to build | Auto-generated registration packages |
| 4 | **EXPORT-6** (Pre-approval worksheet) | 2-3h | Ready to build | Bulk residential WREGIS submission |
| 5 | **EXPORT-2** (REC WREGIS data) | 3-4h | Ready to build (verify endpoint shapes) | Monthly REC data for WREGIS |
| 6 | **EXPORT-3** (Commission statements) | 6-8h | Ready to build (frontend only) | Partner payout verification |

**All 6 items can now proceed — no backend work is blocked.** The develop branch provides all necessary models and endpoints.

---

## Corrected Pre-requisites (develop branch status)

| Item | Main Branch Status | Develop Branch Status |
|------|-------------------|----------------------|
| ADMIN userType / model | ❌ Missing | ✅ Separate Admin model exists |
| Admin route group | ❌ Missing | ✅ `/api/admin/*` with 45+ endpoints |
| Admin auth middleware | ❌ Missing | ✅ verifyToken middleware applied |
| Storage migration (Azure → GCP) | ❌ Still Azure | ✅ Already GCP (`@google-cloud/storage`) |
| WREGIS fields on facilities | ❌ Missing | ✅ `wregisId` exists on CommercialFacility |
| Commission models | ❌ Missing | ✅ Full 3-tier commission system |
| REC sales models | ❌ Missing | ✅ RecSale, RecBuyer, RecPrice, etc. |
| Quarterly statements | ❌ Missing | ✅ QuarterlyStatement + QuarterlyInvoice |
| Payout system | ❌ Missing | ✅ Two payout systems (legacy + request-based) |
| Residential facility model | ❌ Basic | ✅ Full ResidentialFacility + routes |
| DGG support | ❌ Missing | ✅ DistributedGenerationGroup model |

---

## Webapp Fix Required (Affects Data Quality for ALL Exports)

**Critical:** The webapp's utility authorization step (Step 2 of registration) has a **simulated submit handler** — it runs a `setTimeout` and navigates to the next step **without ever calling an API**. This means:
- The utility provider selection is **never saved to the database**
- Any user data export will show blank/null utility provider for all users
- This must be fixed in `dcarbon-webapp` by wiring Step 2's submit to an actual API call

**Note:** The backend (develop branch) has `POST /api/auth/save-utility-data` and `POST /api/auth/initiate-utility-auth/:id` endpoints. The webapp needs to call these.

---

## QA Issue: Hardcoded Pagination in RECGenerationReport

**File:** `src/components/dashboard/rec-sales/management/RECGenerationReport.jsx`
**Issue:** `const totalPages = 4` (line 53) with hardcoded `reportData` array (lines 9-49)

This component uses entirely static sample data and a hardcoded page count. The develop branch has REC endpoints that can provide real data:
- `GET /api/rec/chart/monthly` — monthly REC chart data
- `GET /api/rec/statistics` — REC statistics
- `GET /api/rec/` — all REC sales

**Fix:**
1. Replace `reportData` with a fetch to `/api/rec/` or `/api/rec/chart/monthly`
2. Replace `const totalPages = 4` with `totalPages` from API response metadata
3. Add loading/error states consistent with other paginated components

---

## Audit Methodology Note

**Original audit (2026-03-14):** Reviewed `main` branch of `dcarbon-server` — found only 15 models, 6 route files, no admin system, Azure storage. This led to incorrect conclusions about backend capabilities.

**Corrected audit (2026-03-14):** Reviewed `develop` branch of `dcarbon-server` — found 42 models, 29 route files, full admin/commission/REC/payout systems, GCP storage. The develop branch is the active development branch used by staging/production.

*Generated from direct source code analysis of all three repos and DCarbon template documents on 2026-03-14.*
