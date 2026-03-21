# DCarbon Admin — Hardcoded Data Audit
> Scanned: March 21, 2026
> Scope: All `.jsx` / `.js` files under `src/components` and `src/app`
> Purpose: Identify every place where data is hardcoded in the frontend that should either come from the server or be centralised in a single config file, then plan fixes in priority order.

---

## HOW TO READ THIS DOCUMENT

Each entry shows:
- **File** — relative path from `src/`
- **Line(s)** — approximate line numbers (may shift as code changes)
- **What is hardcoded** — the exact value or snippet
- **Why it is a problem** — what breaks if the server-side data changes
- **Recommended fix** — how it should be solved

Items are grouped by category and sorted by business impact (highest first).

---

---

# CATEGORY A — COMMISSION RATES & FINANCIAL THRESHOLDS
> **Risk: CRITICAL** — Any change to rates/tiers on the server will silently mismatch the UI display.

---

### HC-A01 · CommissionSummary — Residential commission percentages and fees
**File:** `components/dashboard/commission/commission/CommissionSummary.jsx`
**Lines:** 7–16
**Hardcoded values:**
```js
// Residential
customerShares: [50.0, 60.0, 70.0]   // %
cancellationFee: "$500"
salesAgentShare: 2.5                  // %
dcarbonRemainder: [47.5, 37.5, 27.5] // %
```
**Problem:** If DCarbon changes the revenue split structure, the summary display will show stale/wrong numbers. The user sees incorrect commission breakdowns.
**Fix:** Fetch commission structure from `GET /api/commission/structure?userType=RESIDENTIAL` and derive these values. These values should already exist on the server — they are what the commission setup screens write to.

---

### HC-A02 · CommissionSummary — Commercial commission percentages and fees
**File:** `components/dashboard/commission/commission/CommissionSummary.jsx`
**Lines:** 21–30
**Hardcoded values:**
```js
// Commercial
customerShares: [60.0, 70.0, 80.0]    // %
cancellationFee: "$500"
installerOneTimeFee: "$1,000/MW"
salesAgentShare: 2.5                   // %
dcarbonRemainder: [37.5, 27.5, 17.5]  // %
```
**Problem:** Same as HC-A01 for commercial tier.
**Fix:** Same as HC-A01 — derive from server commission structure response.

---

### HC-A03 · ResidentialRECGeneration — Points-to-dollar multiplier hardcoded as 0.1
**File:** `components/dashboard/rec-sales/management/ResidentialRECGeneration.jsx`
**Lines:** 103, 181
**Hardcoded values:**
```js
`$${(points * 0.1).toFixed(2)}`  // points value calculation
```
**Problem:** If the points-to-dollar conversion rate ever changes (business decision), the displayed dollar value will be wrong with no indication.
**Fix:** Expose conversion rate from the server (e.g., `GET /api/config/points-rate`) or include it in the points data response. Alternatively, centralise into `src/lib/config.js`.

---

### HC-A04 · PartnerCommissionSetup — Commission tier field names hardcoded
**File:** `components/dashboard/commission/setupModals/PartnerCommissionSetup.jsx`
**Lines:** 14–28
**Hardcoded values:**
```js
"salesAgentUnder500k", "salesAgent500kTo2_5m", "salesAgentOver2_5m", "salesAgentAnnualCap",
"installerUnder500k", "installer500kTo2_5m", "installerOver2_5m", "installerAnnualCap",
"financeUnder500k", "finance500kTo2_5m", "financeOver2_5m", "financeAnnualCap"
```
**Problem:** The $500k and $2.5M tier boundaries are baked into the field names. If thresholds change, field names must be refactored everywhere.
**Fix:** Fetch tier structure from server, render fields dynamically from the response shape.

---

### HC-A05 · ResidentialCommissionSetup — 100% complement calculations hardcoded
**File:** `components/dashboard/commission/setupModals/ResidentialCommissionSetup.jsx`
**Lines:** 114–132
**Hardcoded values:**
```js
100 - facility - installer   // DCarbon share
100 - facility - finance     // DCarbon share
100 - facility               // DCarbon share
```
**Problem:** Assumes total is always 100%. Any fee change or additional party share would silently break the calculation.
**Fix:** Server should return `dcarbonShare` directly, or the total share ceiling should come from a config constant, not be hardcoded as `100`.

---

### HC-A06 · ResidentialCommissionStructure / CommercialCommissionStructure — Tier threshold labels
**File:** `components/dashboard/commission/commission/ResidentialCommissionStructure.jsx` (Lines 37–40)
**File:** `components/dashboard/commission/commission/CommercialCommissionStructure.jsx` (Lines 36–39)
**Hardcoded values:**
```js
{ label: "<$500k (%)" },
{ label: "$500k - $2.5M (%)" },
{ label: ">$2.5M (%)" }
```
**Problem:** These are fallback labels shown when no server data is available. If the thresholds change, the fallback becomes actively misleading.
**Fix:** Remove static fallback tiers — show an empty state or loading message instead. Never show stale financial thresholds.

---

---

# CATEGORY B — BUSINESS DOMAIN ENUMS (Role / Status / Type Arrays)
> **Risk: HIGH** — Server-side enum changes (e.g. adding a new partner type or status) cause silent display failures.

---

### HC-B01 · PARTNER_TYPES — duplicated in 3 files
**Files:**
- `components/dashboard/registration-pipeline/RegistrationPipeline.jsx` Line 178
- `components/dashboard/user-management/UserManagement.jsx` Line 89
- `components/dashboard/user-management/partner-management/PartnerManagement.jsx` Line 92

**Hardcoded value:**
```js
const PARTNER_TYPES = ["PARTNER", "SALES_AGENT", "INSTALLER", "FINANCE_COMPANY"]
```
**Problem:** This list appears in 3 different files. If a new partner subtype is added server-side (e.g. "BROKER"), each file must be updated manually — easy to miss one.
**Fix:** Extract to `src/lib/constants.js` (or `src/lib/userTypes.js`) as a single exported constant. Import in all three files. Long-term, fetch from server config endpoint.

---

### HC-B02 · Agreement types — hardcoded array with labels and descriptions
**File:** `components/dashboard/agreement/AgreementManagement.jsx`
**Lines:** 14–45
**Hardcoded value:**
```js
const AGREEMENT_TYPES = [
  { type: "RESIDENTIAL",    label: "Residential Agreement",    description: "..." },
  { type: "COMMERCIAL",     label: "Commercial Agreement",     description: "..." },
  { type: "EPC_PARTNER",    label: "EPC Partner Agreement",    description: "..." },
  { type: "SALES_AGENT",    label: "Sales Agent Agreement",    description: "..." },
  { type: "FINANCE_PARTNER",label: "Finance Partner Agreement",description: "..." },
  { type: "OPERATOR",       label: "Operator Agreement",       description: "..." },
]
```
**Problem:** Adding or renaming an agreement type requires a frontend code change.
**Fix:** Fetch agreement types from `GET /api/agreement/types` or centralise in `src/lib/constants.js`.

---

### HC-B03 · BonusCommissionSetup — bonus type enum + field config hardcoded
**File:** `components/dashboard/commission/setupModals/BonusCommissionSetup.jsx`
**Lines:** 9, 20–40
**Hardcoded values:**
```js
"RESIDENTIAL_REFERRAL_QUARTERLY"
"SALES_AGENT_ACCOUNT_LEVEL"
"SALES_AGENT_REFERRED"
"PARTNER_RESIDENTIAL_MW_ANNUAL"
"PARTNER_COMMERCIAL_MW_ANNUAL"
"PARTNER_RESIDENTIAL_MW_QUARTER"
"PARTNER_COMMERCIAL_MW_QUARTER"
```
**Problem:** Each bonus type also drives which input fields are shown. New bonus types require frontend changes in addition to server changes.
**Fix:** Fetch bonus type definitions from server. Each type should describe its own required fields in the response.

---

### HC-B04 · CommissionStructure — property tab types hardcoded
**File:** `components/dashboard/commission/CommissionStructure.jsx`
**Line:** 234
**Hardcoded value:**
```js
const tabs = ["COMMERCIAL", "RESIDENTIAL", "ACCOUNT_LEVEL"]
```
**Problem:** Adding a new commission structure type (e.g. "PARTNER") requires a code change.
**Fix:** Derive tab list from the server commission structure response keys.

---

### HC-B05 · FilterBy modal — customer type and status options hardcoded
**File:** `components/dashboard/user-management/modals/customerManagement/FilterBy.jsx`
**Lines:** 92–96, 107–113, 142–145
**Hardcoded values:**
```jsx
<option value="RESIDENTIAL">RESIDENTIAL</option>
<option value="COMMERCIAL">COMMERCIAL</option>
<option value="PARTNER">PARTNER</option>
// ...
<option value="Active">Active</option>
<option value="Invited">Invited</option>
<option value="Registered">Registered</option>
<option value="Terminated">Terminated</option>
<option value="Inactive">Inactive</option>
// document status:
<option value="verified">verified</option>
<option value="issue">issue</option>
```
**Problem:** New user types or statuses added server-side won't appear in the filter without a code change.
**Fix:** Extract to `src/lib/constants.js`. Customer types and statuses change infrequently — centralising is sufficient; a full API fetch for these is optional.

---

### HC-B06 · InvoiceReview — status and type filter options
**File:** `components/dashboard/payout/InvoiceReview.jsx`
**Lines:** 9–10
**Hardcoded values:**
```js
const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"]
const TYPE_OPTIONS   = ["ALL", "COMMERCIAL", "PARTNER"]
```
**Problem:** If a new invoice status (e.g. "DISPUTED") is added, the filter won't show it.
**Fix:** Centralise to `src/lib/constants.js`.

---

### HC-B07 · ManagementContent (REC Sales) — WREGIS status and facility type options
**File:** `components/dashboard/rec-sales/management/ManagementContent.jsx`
**Lines:** 15–28
**Hardcoded values:**
```js
const WREGIS_STATUSES   = ["PENDING_SUBMISSION", "SUBMITTED", "APPROVED", "REJECTED", "ADJUSTED"]
const FACILITY_TYPES    = ["commercial", "residential"]
```
**Problem:** Adding a new WREGIS status stage won't show in the filter.
**Fix:** Centralise to `src/lib/constants.js`.

---

### HC-B08 · DocumentsModal — 11 document types hardcoded with status fields
**File:** `components/dashboard/user-management/customer-details/residential-details/DocumentsModal.jsx`
**Lines:** 9–98
**Hardcoded values:**
```js
const DOCUMENT_TYPES = {
  wregisAssignment:              { name: "...", statusField: "...", rejectionField: "...", mandatory: true },
  financeAgreement:              { ... },
  solarInstallationContract:     { ... },
  utilityPtoLetter:              { ... },
  installationSitePlan:          { ... },
  panelInverterDataSheet:        { ... },
  revenueMeterDataSheet:         { ... },
  utilityMeterPhoto:             { ... },
  singleLineDiagram:             { ... },
  assignmentOfRegistrationRight: { ... },
  acknowledgementOfStationService:{ ... },
}
```
**Problem:** If a new required document type is added (or an existing one renamed), the modal won't reflect it without a code change.
**Fix:** This is complex — document type metadata may need to stay in the frontend for UI purposes. At minimum, extract to `src/lib/documentTypes.js` so it's a single change point.

---

### HC-B09 · RegistrationPipeline — STAGES array hardcoded with colours and icons
**File:** `components/dashboard/registration-pipeline/RegistrationPipeline.jsx`
**Lines:** 11–89
**Hardcoded values:**
```js
const STAGES = [
  { key: "invited",       label: "Invited",        color: "...", borderColor: "...", ... },
  { key: "registered",    ... },
  { key: "docs_pending",  ... },
  { key: "docs_approved", ... },
  { key: "verified",      ... },
  { key: "active",        ... },
  { key: "terminated",    ... },
]
```
**Problem:** Registration flow stage labels and their ordering are baked in. New stages or renamed stages require a code change.
**Fix:** Stage keys and labels should be consistent with the server enum. Extract to `src/lib/constants.js`. UI colour assignments can remain in frontend, keyed off the stage key.

---

### HC-B10 · RegistrationPipeline — STATUS_GROUPS mapping hardcoded
**File:** `components/dashboard/registration-pipeline/RegistrationPipeline.jsx`
**Lines:** 142–159
**Hardcoded values:**
```js
const STATUS_GROUPS = {
  all:          [...all stages],
  pending:      ["invited", "registered"],
  under_review: ["docs_pending"],
  approved:     ["docs_approved", "verified"],
  active:       ["active"],
  terminated:   ["terminated"],
}
```
**Problem:** Changing which stages belong to which group (a product/business decision) requires a code change.
**Fix:** Centralise to `src/lib/constants.js`. Could eventually be driven by server config.

---

### HC-B11 · InviteResidenceModal — customerType and role hardcoded
**File:** `components/modals/residence-modals/InviteResidenceModal.jsx`
**Lines:** 13–14, 192, 195
**Hardcoded values:**
```js
customerType: "RESIDENTIAL"
role: "OPERATOR"
```
**Problem:** The invite modal always submits RESIDENTIAL/OPERATOR regardless of context. If called from a commercial or partner context it would send wrong values.
**Fix:** Accept `customerType` and `role` as props with "RESIDENTIAL" and "OPERATOR" as defaults.

---

### HC-B12 · CustomerCards (Overview) — partner type options for chart filter
**File:** `components/dashboard/overview/CustomerCards.jsx`
**Line:** 16
**Hardcoded values:**
```js
const partnerTypeOptions = ["Partner", "Master Partner TPO", "Customer/Solar Owner", "Sales Agent"]
```
**Problem:** These labels don't match the server enum values (`PARTNER`, `SALES_AGENT`, etc.) and will silently fail as filter params.
**Fix:** Use the same server enum values as everywhere else, or map them consistently.

---

---

# CATEGORY C — SYSTEM JOBS (Mock/static data used as real data)
> **Risk: HIGH** — Jobs are defined entirely in the frontend. Server changes to job names/endpoints won't be reflected.

---

### HC-C01 · SystemJobs — all 5 jobs defined as a static array
**File:** `components/dashboard/system/SystemJobs.jsx`
**Lines:** 92–125
**Hardcoded values:**
```js
const jobs = [
  { id: "commission",    label: "Commission Calculation",  description: "...", endpoint: "/api/system/run-commission" },
  { id: "sales-agent",   label: "Sales Agent Commission",  description: "...", endpoint: "/api/system/run-sales-agent-commission" },
  { id: "partner-bonus", label: "Partner Bonus",           description: "...", endpoint: "/api/system/run-partner-bonus" },
  { id: "monthly-rec",   label: "Monthly REC Generation",  description: "...", endpoint: "/api/system/run-monthly-rec" },
  { id: "historical",    label: "Historical REC Re-run",   description: "...", endpoint: "/api/system/run-historical-rec" },
]
```
**Problem:** If a job is renamed or a new job added server-side, the admin UI won't reflect it.
**Fix:** Fetch available jobs from `GET /api/system/jobs`. Render the list dynamically from the response.

---

---

# CATEGORY D — PAGINATION LIMITS
> **Risk: MEDIUM** — Incorrect limits cause either over-fetching (performance) or under-fetching (missing data).

---

### HC-D01 · Multiple files — inconsistent hardcoded page sizes

| File | Line | Value | Note |
|------|------|-------|------|
| `RegistrationPipeline.jsx` | 140 | `PAGE_SIZE = 20` | Main pipeline list |
| `UserManagement.jsx` | 69 | `limit = 50` | Customer list |
| `UserManagement.jsx` | 208 | `limit=1000` | Used for a separate sub-fetch |
| `CustomerReport.jsx` | 163, 210 | `limit=200` | Report data fetch |
| `CustomerReport.jsx` | 450 | `itemsPerPage = 10` | UI display |
| `PartnerCommissionPayout.jsx` | 19 | `itemsPerPage = 10` | Payout list |
| `InvoiceReview.jsx` | 26 | `limit: 15` | Invoice list |
| `Reporting.jsx` | 118 | `/ 10` | Report table |
| `BuyerManagement.jsx` | 70 | `limit=10` | Buyer list |
| `ResidentialRECGeneration.jsx` | 59 | `limit: 10` | Main list |
| `ResidentialRECGeneration.jsx` | 149 | `limit: 100` | Export sub-fetch |
| `CommercialRECGeneration.jsx` | 22 | `limit: 10` | Main list |
| `CommercialRECGeneration.jsx` | 109 | `limit=100` | Export sub-fetch |
| `UtilityProviderManagement.jsx` | 40 | `providersPerPage = 10` | Utility list |

**Problem:** Values are scattered, inconsistent, and must be updated file-by-file.
**Fix:** Create `src/lib/config.js` (or add to existing config) with named constants:
```js
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  REPORT_PAGE_SIZE:  10,
  EXPORT_LIMIT:      200,
}
```
Import and reference everywhere. The `limit=1000` outlier should be investigated — it will break for large datasets.

---

---

# CATEGORY E — DATE / YEAR VALUES
> **Risk: LOW-MEDIUM** — Current-year calculations via `new Date()` are fine. Static year arrays are not.

---

### HC-E01 · CustomerCards — 5-year lookback hardcoded
**File:** `components/dashboard/overview/CustomerCards.jsx`
**Line:** 18
**Hardcoded value:**
```js
Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())
// → ["2026", "2025", "2024", "2023", "2022"]
```
**Problem:** Limits chart history to 5 years. If DCarbon has older data, admin can't view it.
**Fix:** Fetch available years from the server, or make the lookback window a named constant in config.

---

### HC-E02 · CustomerCards — chart Y-axis scale hardcoded
**File:** `components/dashboard/overview/CustomerCards.jsx`
**Lines:** 65–70, 82–83, 94–95
**Hardcoded values:**
```js
const chartScale = [0, 25, 50, 75, 100]
```
**Problem:** Fixed scale breaks when actual data values exceed 100.
**Fix:** Derive scale dynamically from the actual max value in the chart data.

---

### HC-E03 · SystemJobs — current year and quarter derived inline (duplicated)
**File:** `components/dashboard/system/SystemJobs.jsx`
**Lines:** 16–17, 130–132
**Hardcoded pattern:**
```js
year: new Date().getFullYear(),
quarter: Math.ceil((new Date().getMonth() + 1) / 3),
```
**Problem:** Duplicated in two places. Also: the admin can't select a different year/quarter to re-run a job for a past period.
**Fix:** Make `year` and `quarter` configurable inputs in the SystemJobs UI rather than auto-derived. Move the derivation to a shared utility.

---

---

# CATEGORY F — CONFIGURATION / DISPLAY-ONLY HARDCODES
> **Risk: LOW** — These are UI configuration values that are unlikely to change but are still worth centralising.

---

### HC-F01 · Reporting — supported image preview extensions
**File:** `components/dashboard/reporting/Reporting.jsx`
**Line:** 30
**Hardcoded value:**
```js
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
```
**Fix:** Extract to `src/lib/constants.js`.

---

### HC-F02 · Commission tier filter labels used as magic strings
**Files:**
- `components/dashboard/commission/commission/ResidentialCommissionStructure.jsx` Line 30–31
- `components/dashboard/commission/commission/CommercialCommissionStructure.jsx` Lines 29–30
- `components/dashboard/commission/commission/AccountLevelBasedReferralCommissionStructure.jsx` Line 31

**Hardcoded values:**
```js
!["Max Duration", "Agreement Duration", "Cancellation Fee"].includes(tier.label)
```
**Problem:** These strings are used to filter out non-rate tiers from the display. If the server renames a field, these labels silently stop filtering.
**Fix:** Use a `tierType` field from the server response rather than filtering on human-readable labels.

---

### HC-F03 · formatUserType function — userType display labels hardcoded
**File:** `components/dashboard/registration-pipeline/RegistrationPipeline.jsx`
**Lines:** 122–132
**Hardcoded values:**
```js
const formatUserType = (type) => {
  switch (type) {
    case "COMMERCIAL":     return "Commercial"
    case "RESIDENTIAL":    return "Residential"
    case "PARTNER":        return "Partner"
    case "SALES_AGENT":    return "Sales Agent"
    case "INSTALLER":      return "Installer"
    case "FINANCE_COMPANY":return "Finance Company"
    default:               return type
  }
}
```
**Problem:** Display labels for user types duplicated inline. Any new type won't get a formatted label.
**Fix:** Move to `src/lib/formatters.js` as a shared `formatUserType()` utility. Already duplicated across multiple files.

---

---

# PROPOSED FIX PLAN

## Phase 1 — Create `src/lib/constants.js` (quick wins, no API changes needed)
Move all enum arrays and magic strings to a single file. Fixes: HC-B01, HC-B04, HC-B05, HC-B06, HC-B07, HC-B09, HC-B10, HC-F01, HC-F03.

## Phase 2 — Create `src/lib/config.js` pagination block
Centralise all page size numbers. Fixes: HC-D01. Review the `limit=1000` call specifically.

## Phase 3 — Commission values from server
Fetch commission structure data for CommissionSummary display instead of hardcoding it. Fixes: HC-A01, HC-A02, HC-A05, HC-A06.

## Phase 4 — Dynamic SystemJobs list
Fetch available jobs from the server. Add year/quarter inputs. Fixes: HC-C01, HC-E03.

## Phase 5 — Points multiplier and tier fields
Move `0.1` multiplier and partner tier field names to server-driven config. Fixes: HC-A03, HC-A04.

## Phase 6 — DocumentsModal dynamic types
Refactor `DOCUMENT_TYPES` to `src/lib/documentTypes.js` and assess whether the type list can be fetched from the server. Fixes: HC-B08.

---

## SUMMARY TABLE

| ID | File (abbreviated) | Category | Risk | Phase |
|---|---|---|---|---|
| HC-A01 | CommissionSummary | Residential commission % | CRITICAL | 3 |
| HC-A02 | CommissionSummary | Commercial commission % | CRITICAL | 3 |
| HC-A03 | ResidentialRECGeneration | Points × 0.1 multiplier | HIGH | 5 |
| HC-A04 | PartnerCommissionSetup | Tier field names | HIGH | 5 |
| HC-A05 | ResidentialCommissionSetup | 100% complement calc | HIGH | 3 |
| HC-A06 | ResidentialCommissionStructure + CommercialCommissionStructure | Fallback tier labels | HIGH | 3 |
| HC-B01 | RegistrationPipeline + UserManagement + PartnerManagement | PARTNER_TYPES in 3 files | HIGH | 1 |
| HC-B02 | AgreementManagement | Agreement types array | HIGH | 1 |
| HC-B03 | BonusCommissionSetup | Bonus type enums | HIGH | 1 |
| HC-B04 | CommissionStructure | Tab types array | HIGH | 1 |
| HC-B05 | FilterBy | Customer type + status options | MEDIUM | 1 |
| HC-B06 | InvoiceReview | Status + type filter options | MEDIUM | 1 |
| HC-B07 | ManagementContent | WREGIS status + facility type | MEDIUM | 1 |
| HC-B08 | DocumentsModal | 11 document type definitions | MEDIUM | 6 |
| HC-B09 | RegistrationPipeline | STAGES array | MEDIUM | 1 |
| HC-B10 | RegistrationPipeline | STATUS_GROUPS mapping | MEDIUM | 1 |
| HC-B11 | InviteResidenceModal | customerType + role defaults | MEDIUM | 1 |
| HC-B12 | CustomerCards | Partner type options (label mismatch) | MEDIUM | 1 |
| HC-C01 | SystemJobs | Static jobs array | HIGH | 4 |
| HC-D01 | 14 files | Inconsistent page sizes | MEDIUM | 2 |
| HC-E01 | CustomerCards | 5-year lookback hardcoded | LOW | — |
| HC-E02 | CustomerCards | Chart Y-axis scale | LOW | — |
| HC-E03 | SystemJobs | Year/quarter duplicated inline | LOW | 4 |
| HC-F01 | Reporting | Image file extension array | LOW | 1 |
| HC-F02 | Commission structure files | Tier label magic strings | LOW | 6 |
| HC-F03 | RegistrationPipeline | formatUserType function | LOW | 1 |

**Total instances found: 26 distinct hardcoded data issues across 20+ files**

---

*Audit created: March 21, 2026 — DCarbon Admin codebase scan*
