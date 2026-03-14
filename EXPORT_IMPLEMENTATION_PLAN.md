# Export Implementation Plan — DCarbon Admin

**Date:** 2026-03-14
**Context:** Cross-repo audit of `dcarbon-server`, `dcarbon-webapp`, and `dcarbon-admin`
**Reference templates:** `export_docs/` folder (provided by DCarbon)
**Goal:** Implement all export functionality requested by client (Phillip Kopp) for go-live

---

## Current Backend Reality

The backend (`dcarbon-server`) is fundamentally a **user registration + utility data ingestion** platform. It has:

- **5 route groups:** `/api/auth`, `/api/user`, `/api/facility`, `/api/webhook`, `/api/contact`
- **No admin route group** — `/api/admin/*` does not exist
- **No role-based access control** — `userType` is RESIDENTIAL/COMMERCIAL/PARTNER only, no ADMIN
- **No export endpoints** — zero CSV/Excel/PDF generation
- **No commission/statement/payout models** — these concepts don't exist in the Prisma schema
- **No REC transaction model** — only aggregate fields on `CommercialFacility`
- **Storage:** Still Azure Blob Storage (`@azure/storage-blob`) in code. DCarbon has moved to GCP but the code migration has NOT been done — this needs to be addressed separately.

### Confirmed Prisma Models (12 total)
User, FinancialInformation, CommercialUser, Referral, CommercialFacility, UtilityAuthorization, Agreement, Contact, Partner, Documentation, MeterRecInfo, UtilityProvider

### Notable Backend Issues
- All `/api/facility/*` routes are **unprotected** (no auth middleware)
- All `/api/contact/*` routes are **unprotected**
- `GET /api/user/get-all-users` has **no email/search filtering** — only `page` and `limit` params
- `get-energy-production-by-facility/:facilityId` has a **missing leading `/`** (route bug)
- Utility auth submit in webapp is a **setTimeout stub** — utility provider selection is never saved to DB

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
Raw 15-minute interval data from UtilityAPI (this is what `MeterRecInfo` stores):
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

## Export Items — Implementation Recommendations

---

### EXPORT-1: Full User/Personal Details Export

**Client need:** Download all collected user data from the admin panel (not just view it)

**Can build now?** YES — no backend changes required

**Recommendation: Client-side CSV/Excel generation in the admin app**

**Why client-side:** The existing `GET /api/user/get-all-users?page=1&limit=1000` endpoint already returns user data. We can generate the file entirely in the browser — fastest path to delivery.

**Implementation steps:**

1. **Install dependencies in admin app:**
   ```bash
   npm install xlsx file-saver
   ```

2. **Create a reusable export utility:**
   ```
   src/lib/exportUtils.js
   ```
   - `exportToExcel(data, columns, filename)` — takes an array of objects, column definitions, and filename
   - `exportToCSV(data, columns, filename)` — same but CSV format
   - Uses `xlsx` for Excel, `file-saver` for triggering download

3. **Add "Export" button to UserManagement.jsx:**
   - Place next to existing filter/search controls
   - On click: fetch all pages of users (loop `GET /api/user/get-all-users?page=N&limit=100` until no more results)
   - Map to export columns: Name, Email, Phone, User Type, Status, Utility Provider, Finance Company, Address, Referral Code, Date Registered
   - Show a loading indicator during fetch + generation
   - Trigger Excel download

4. **Also add to PartnerManagement.jsx:**
   - Same pattern for partners via `GET /api/user/get-all?page=N`
   - Export columns: Partner Name, Email, Type (Sales Agent/Installer/Finance Company), Referral Code, Status, Customer Count, Date Registered

**Effort:** ~2-3 hours
**Dependencies:** None (uses existing endpoints)

---

### EXPORT-2: REC Data Export in WREGIS Regulator Format

**Client need:** Monthly export of all generators' REC data for WREGIS submission

**Template format** (from `Generation_data_3_1_25.csv`):
```csv
Generator ID, Reporting Unit ID, Vintage, Start Date, End Date, Total MWh
W23135,W23135,03/2025,01/01/2025,03/31/2025,0.0524
```

**Can build now?** PARTIALLY — the interval data exists in `MeterRecInfo`, but we need aggregation

**Recommendation: Hybrid approach — backend aggregation endpoint + client-side CSV generation**

**Data flow:**
1. `MeterRecInfo` stores 15-min interval kWh data per meter (from UtilityAPI webhook/cron)
2. Each `CommercialFacility` has a `meterId` linking to the meter data
3. We need to: sum `rev_kWh` (reverse/generation kWh) per facility per month → convert to MWh → map to WREGIS fields

**Implementation steps:**

#### Backend (dcarbon-server):

1. **Add a new route group** `src/routes/admin.routes.ts` mounted at `/api/admin`:
   ```
   GET /api/admin/rec-generation-export?month=3&year=2026
   ```

2. **Controller logic:**
   ```
   For each CommercialFacility:
     1. Find MeterRecInfo records where interval_start falls in the target month
     2. Sum rev_kWh → total generation kWh → convert to MWh (÷ 1000)
     3. Return:
        - generatorId: facility.wregisId (WREGIS Generator ID like "W23135")
        - reportingUnitId: facility.reportingUnitId (same as generator ID or separate)
        - vintage: "MM/YYYY" format of the target month
        - startDate: first day of month "MM/DD/YYYY"
        - endDate: last day of month "MM/DD/YYYY"
        - totalMWh: sum of rev_kWh / 1000 (rounded to 4-5 decimal places)
   ```

3. **Note:** `CommercialFacility` currently has no `wregisId` or `reportingUnitId` field. These need to be added to the Prisma schema:
   ```prisma
   model CommercialFacility {
     // ... existing fields
     wregisGeneratorId   String?  // e.g., "W23135"
     wregisReportingUnitId String? // e.g., "W23135"
   }
   ```

#### Admin app (dcarbon-admin):

4. **Add "Export WREGIS Generation Data" button in REC Sales Management:**
   - Month/year picker (default: previous month)
   - "Export for WREGIS" button
   - Calls the endpoint, generates CSV matching the exact `Generation_data_3_1_25.csv` format
   - Column headers: ` Generator ID , Reporting Unit ID , Vintage , Start Date , End Date , Total MWh`
   - Filename: `Generation_data_{M}_{D}_{YY}.csv`

**Effort:** ~4-6 hours (2-3 backend, 2-3 frontend)
**Dependencies:**
- Backend: new admin route group + `wregisGeneratorId` field on CommercialFacility
- MeterRecInfo must have data (populated by UtilityAPI cron job)

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

**Statement header metrics:**
- New MW DIR/Partner (new registrations this quarter)
- Active MW DIR/Partner (total active capacity)
- MWh DIR/Partner (energy produced this quarter)
- REC Sold (total RECs sold)
- REC Price (current price per REC)

**Can build now?** NO — requires new Prisma models and backend logic

**Recommendation: Build in phases**

#### Phase 1 — Backend: Commission Models + Generation Logic

1. **New Prisma models:**
   ```prisma
   model CommissionStatement {
     id                String   @id @default(uuid())
     agentId           String   // The sales agent/partner receiving commission
     agent             User     @relation(fields: [agentId], references: [id])
     quarter           String   // "Q2"
     year              Int      // 2025
     periodStart       DateTime
     periodEnd         DateTime

     // Header metrics
     newMwDirect       Float    @default(0)  // New MW from direct registrations
     activeMwDirect    Float    @default(0)  // Total active MW direct
     mwhDirect         Float    @default(0)  // MWh produced direct
     newMwPartner      Float    @default(0)  // New MW from partner registrations
     activeMwPartner   Float    @default(0)  // Total active MW partner
     mwhPartner        Float    @default(0)  // MWh produced partner
     recsSold          Int      @default(0)  // Total RECs sold
     recPrice          Float    @default(0)  // REC price at time of generation

     // Totals
     subtotal          Float    @default(0)
     vat               Float    @default(0)
     paid              Float    @default(0)
     totalDue          Float    @default(0)

     status            String   @default("GENERATED") // GENERATED | INVOICED | PAID
     generatedAt       DateTime @default(now())
     paidAt            DateTime?
     invoiceNumber     String?

     lineItems         CommissionLineItem[]
     createdAt         DateTime @default(now())
     updatedAt         DateTime @updatedAt
   }

   model CommissionLineItem {
     id               String   @id @default(uuid())
     statementId      String
     statement        CommissionStatement @relation(fields: [statementId], references: [id])
     itemCode         String   // "DCarbon Dir Reg", "DCarbon Part Reg", etc.
     description      String   // "Q2 Direct Registration Commissions ($/MW)"
     quantity         Float    // MW or REC count
     unitPrice        Float    // Rate per unit
     total            Float    // quantity * unitPrice
     createdAt        DateTime @default(now())
   }
   ```

2. **New endpoints:**
   ```
   GET  /api/admin/statements?page=1&limit=20&status=GENERATED&agentId=xxx&quarter=Q2&year=2025
   GET  /api/admin/statements/:id
   POST /api/admin/statements/generate   (body: { quarter: "Q2", year: 2025 })
   PUT  /api/admin/statements/:id/status  (body: { status: "PAID", invoiceNumber: "INV-001" })
   ```

3. **Statement generation logic (POST /generate):**
   For each sales agent/partner:
   - Count new facility registrations this quarter (direct vs partner-referred) → MW
   - Sum active facility capacity → MW
   - Sum MeterRecInfo rev_kWh for all their facilities → MWh
   - Get current REC price from `CommercialFacility.salePricePerREC` or a config
   - Calculate 4 line items:
     - Dir Reg: newMwDirect × $1,000
     - Part Reg: newMwPartner × $500
     - Dir Comm: recsSold × recPrice × 2.5%
     - Ong Comm: recsSold × recPrice × 1.0%
   - Create CommissionStatement + 4 CommissionLineItem records

#### Phase 2 — Admin UI + Export

4. **Statements section in admin sidebar:**
   - Quarter/year picker
   - "Generate Statements" button (triggers POST)
   - Table: Agent Name, Quarter, Subtotal, Status, Actions
   - Click row → detail view matching the `Sales Agent Invoice-Statement Example.docx` layout

5. **Export options:**
   - **Single statement:** "Download PDF" per statement (generate PDF matching the docx template)
   - **Batch export:** "Export All Statements" → Excel workbook with one sheet per agent
   - Uses `xlsx` for Excel, consider `jspdf` or `@react-pdf/renderer` for PDF

**Effort:** ~15-20 hours total (8-10 backend, 7-10 frontend)
**Dependencies:**
- Backend admin route group must exist
- Commission rates may need to be configurable (confirm with Phillip if the rates in the example are fixed or vary per agent)

---

### EXPORT-4: Document Package ZIP Export

**Client need:** Download all approved documents for a facility as a single package to submit to WREGIS/CEC.

**Template context** (from WREGIS Registration Package templates): The document checklist requires these files per facility:

**Commercial:**
- Solar installation contract
- Power Purchase Agreement
- Financing agreement
- "As Built" Single line diagrams
- Installed Product data sheets
- Interconnection agreements
- NEM agreements
- COD and/or PTO agreements
- Photograph of utility meter
- Photograph of facility
- Assignment of Reg. Rights Form
- DCarbon Services Agreement

**Residential:**
- Solar installation contract
- Financing agreement
- "As Built" Single line diagrams
- Installed Product data sheets
- Interconnection agreements
- NEM agreements
- COD and/or PTO agreements
- Utility declaration of ownership
- Photograph of utility meter
- DCarbon Information Release
- DCarbon Services Agreement

**Can build now?** YES — documents are stored as URLs; we can fetch and ZIP client-side

**Important:** The backend code still uses Azure Blob Storage (`@azure/storage-blob`). DCarbon has moved to GCP, but the code hasn't been migrated. Need to verify:
- Are existing document URLs still accessible via Azure?
- Has the storage been migrated with URL redirects?
- Do we need to update the upload middleware to use GCP first?

**Implementation steps:**

1. **Install dependencies in admin app:**
   ```bash
   npm install jszip file-saver
   ```

2. **Create ZIP export utility:**
   ```
   src/lib/documentExport.js
   ```
   - `exportDocumentPackage(documents, facilityInfo)`:
     - Takes array of `{ name, url, status }` document objects
     - Filters to approved/uploaded documents
     - Fetches each URL as a blob
     - Names files descriptively: `01_Interconnection_Agreement.pdf`, `02_Meter_ID_Photo.jpg`, etc.
     - Also generates a `WREGIS_Checklist.txt` or `.csv` file listing all documents and their status (matching the WREGIS Document Checklist from the templates)
     - Generates and downloads the ZIP: `{PACKAGE_ID}_documents.zip`

3. **Add "Download Document Package" button in CommercialDetails.jsx and ResidentialDetails.jsx:**
   - Only visible when at least one document is uploaded
   - Shows document count: "Download Package (5/12 docs)"
   - Loading state while fetching + zipping
   - Also include a "Generate WREGIS Cover Sheet" option that pre-fills the registration template with data from the facility record

4. **Optional: Bulk export per partner:**
   - In PartnerDetails.jsx → Customers tab → "Download All Document Packages"
   - Creates one ZIP per facility

**Effort:** ~3-4 hours (+ WREGIS cover sheet generation ~2h extra)
**Dependencies:**
- Verify document URLs are accessible (Azure → GCP migration status)
- CORS must allow the admin app domain to fetch blob URLs directly

---

### EXPORT-5: WREGIS Registration Package Cover Sheet Generation

**Client need:** Generate pre-filled WREGIS registration cover sheets for each facility (commercial and residential) using the DCarbon templates.

**Can build now?** YES — data exists in `CommercialFacility`, `User`, `Documentation` models

**This is NOT in the original export list but is closely related to EXPORT-4.** The templates in `export_docs/` show that DCarbon needs to generate these cover sheets as part of the registration submission to WREGIS/CEC. Currently these are manually filled.

**Implementation steps:**

1. **Create cover sheet generator:**
   ```
   src/lib/wregisPackageGenerator.js
   ```
   - `generateCommercialCoverSheet(facility, user, documentation)` → returns a structured object
   - `generateResidentialCoverSheet(facility, user, documentation)` → returns a structured object
   - Map database fields to template fields:
     - `user.firstName + user.lastName` → Company/Facility Owner Name
     - `facility.address` → Unit Address 1
     - `facility.city`, `facility.state`, `facility.zipCode` → City, State, Zip
     - `facility.meterId` → Unit Revenue Meter ID
     - `facility.utilityProvider` → Interconnecting Utility
     - `facility.systemCapacity` → Unit Nameplate Capacity
     - `facility.cod` → Commercial Operation Date
     - `documentation.*Status` → Document Checklist confirmed/missing

2. **Render as downloadable document** (Excel or PDF):
   - Use `xlsx` to generate an Excel file matching the template layout
   - OR use `docx` library (`npm install docx`) to generate a .docx matching the exact DCarbon template

3. **Add "Generate WREGIS Package" button on facility detail pages**

**Effort:** ~4-5 hours
**Dependencies:**
- Facility must have WREGIS-related fields (some may need to be added to schema: `wregisGeneratorId`, `wregisReportingUnitId`, `cecFacilityName`, etc.)

---

### EXPORT-6: Pre-Approval Worksheet (Bulk Residential)

**Client need:** Generate a bulk WREGIS pre-approval worksheet for all residential units in a group (DGG).

**Template format** (from `Pre-Approval_Worksheet.xlsx`):
Columns: Group Number, Group Name, Fuel Type, Residential/Non-Residential, Unit Name, Unit Nameplate (MW), Expansion Indicator, COD, Unit Address 1/2, City, County, State, Zip, Country, Unit Revenue Meter ID, Interconnecting Utility, Document Checklist items

**Can build now?** PARTIALLY — depends on residential facility data availability

**Implementation steps:**

1. Use the existing `GET /api/facility/get-all-facilities` or residential equivalent
2. Filter by group/DGG
3. Map to the Pre-Approval Worksheet columns
4. Generate Excel using `xlsx` matching the template layout

**Effort:** ~2-3 hours (if residential data is available)
**Dependencies:** Residential facility API endpoints must be functional

---

## Priority & Sequencing

| Order | Item | Effort | Blocked? | Delivers |
|-------|------|--------|----------|----------|
| 1 | **EXPORT-1** (User details) | 2-3h | No | Admin can export all user data |
| 2 | **EXPORT-4** (Doc package ZIP) | 3-4h | Verify blob URLs | Doc packages for WREGIS submission |
| 3 | **EXPORT-5** (WREGIS cover sheets) | 4-5h | No | Auto-generated registration packages |
| 4 | **EXPORT-6** (Pre-approval worksheet) | 2-3h | Residential data | Bulk residential WREGIS submission |
| 5 | **EXPORT-2** (REC WREGIS data) | 4-6h | Backend endpoint | Monthly REC data for WREGIS |
| 6 | **EXPORT-3** (Commission statements) | 15-20h | Full backend system | Partner payout verification |

**Items 1, 2, 5, 6 can all start immediately in the admin app.**
**Items 3 and 4 need backend work first.**

---

## Pre-requisites Before Backend Work

1. **Add ADMIN userType** to Prisma User model + run migration
2. **Create admin route group** (`src/routes/admin.routes.ts`) mounted at `/api/admin`
3. **Add admin auth middleware** (verifyToken + check userType === 'ADMIN')
4. **Fix token error response** — change `ValidationError` (422) to `UnauthorizedError` (401)
5. **Storage migration** — migrate from `@azure/storage-blob` to GCP (`@google-cloud/storage`) and update all upload middleware in `src/middleware/uploadFile.ts`
6. **Add WREGIS fields** to `CommercialFacility`: `wregisGeneratorId`, `wregisReportingUnitId`

---

## Webapp Fix Required (Affects Data Quality for ALL Exports)

**Critical:** The webapp's utility authorization step (Step 2 of registration) has a **simulated submit handler** — it runs a `setTimeout` and navigates to the next step **without ever calling an API**. This means:
- The utility provider selection is **never saved to the database**
- Any user data export will show blank/null utility provider for all users
- This must be fixed in `dcarbon-webapp` by wiring Step 2's submit to an actual API call

---

## QA Issue: Hardcoded Pagination in RECGenerationReport

**File:** `src/components/dashboard/rec-sales/management/RECGenerationReport.jsx`
**Issue:** `const totalPages = 4` (line 53) with hardcoded `reportData` array (lines 9-49)

This component uses entirely static sample data and a hardcoded page count. It needs to be wired to a real API endpoint for REC generation report data. This is blocked on the backend — no `/api/rec/generation-report` endpoint exists.

**Fix when backend is ready:**
1. Replace `reportData` with a fetch to the REC generation report endpoint
2. Replace `const totalPages = 4` with `totalPages` from API response metadata
3. Add loading/error states consistent with other paginated components

---

*Generated from direct source code analysis of all three repos and DCarbon template documents on 2026-03-14.*
