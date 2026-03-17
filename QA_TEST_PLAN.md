# DCarbon Admin — QA Test Plan
> Source: Meeting Notes (March 16, 2026) · PLAN_ADMIN.md · ADMIN_IMPLEMENTATION_PLAN.md
> Scope: All 14 admin-facing changes from the March 16 sprint
> Created: March 17, 2026
> Intended for: QA Engineer testing the `dcarbon-admin` dashboard

---

## HOW TO USE THIS DOCUMENT

Each section maps to a numbered fix from the implementation plan. Each test case has:
- **Pre-condition** — what the tester needs set up before starting
- **Steps** — exactly what to click/do
- **Expected Result** — what correct behaviour looks like
- **Fail condition** — what to report as a bug

Work through sections in order — they roughly follow the app's left navigation.

---

## TEST ENVIRONMENT SETUP

Before starting:

1. Log in to the admin dashboard with a valid admin account.
2. Ensure the database has at least:
   - 2+ **Residential** customers (various statuses: Invited, Active, Terminated)
   - 2+ **Commercial** customers (with `companyName` filled, various statuses)
   - 1+ **Partner** account (with commission payouts)
   - 1+ Payout request with `status = PENDING`
   - 1+ Payout request with `status = APPROVED`
   - 1+ Payout request where `hasDiscrepancy = true`
   - 1+ facility with `MonthlyFacilityRecs` records (wregisStatus = PENDING_SUBMISSION or SUBMITTED)
3. Have the browser dev tools console open to watch for errors during testing.

---

## SECTION 1 — Registration Pipeline

### TEST-01: Status Group Filter Tabs
**Fix ref:** FIX-01 (PLAN_ADMIN #1)
**Location:** Dashboard → Registration Pipeline

#### TC-01-A: Filter tabs are visible and labelled correctly
**Steps:**
1. Navigate to Registration Pipeline.
2. Look above the stage cards row.

**Expected:** A horizontal tab/pill bar is visible with labels: **All · Pending · Under Review · Approved · Active · Terminated**

**Fail:** Tabs are absent, missing labels, or wrong labels.

---

#### TC-01-B: Default state is "All"
**Steps:**
1. Navigate to Registration Pipeline without clicking anything.

**Expected:** "All" tab is highlighted/active. All stage cards are visible. The customer table shows all registrants.

---

#### TC-01-C: "Pending" tab filters correctly
**Steps:**
1. Click the **Pending** tab.

**Expected:**
- The customer list shows only accounts with stage `invited` or `registered`.
- The count shown on the tab matches the number of rows in the table.
- Stage cards for other stages (Docs Under Review, Verified, Active, Terminated) are either hidden, greyed out, or show 0 count.

**Fail:** Rows from other stages appear; count mismatch.

---

#### TC-01-D: "Under Review" tab filters correctly
**Steps:**
1. Click the **Under Review** tab.

**Expected:** Only accounts at the `docs_pending` stage appear.

---

#### TC-01-E: "Approved" tab filters correctly
**Steps:**
1. Click **Approved**.

**Expected:** Only accounts at `docs_approved` or `verified` stage appear.

---

#### TC-01-F: "Active" and "Terminated" tabs filter correctly
**Steps:**
1. Click **Active** → confirm only active accounts show.
2. Click **Terminated** → confirm only terminated accounts show.

---

#### TC-01-G: Status group + stage card combined filter
**Steps:**
1. Click **Pending** tab.
2. Then click the **"Invited"** stage card (one of the individual stage cards below the tabs).

**Expected:** List narrows to only `invited` accounts (subset of Pending).

---

#### TC-01-H: Clear filters resets both group tab and stage card
**Steps:**
1. Click **Active** tab, then click the **Active** stage card.
2. Click **Clear Filters**.

**Expected:** Returns to "All" tab, no stage card selected, full list restored.

---

#### TC-01-I: Search includes company name for commercial accounts
**Steps:**
1. Type the `companyName` of a known commercial registrant in the search box.

**Expected:** The matching commercial account appears in the results.

**Fail:** Search only matches by individual name and misses the company name.

---

### TEST-02: Company Name as Primary Identity in Pipeline
**Fix ref:** FIX-03 (PLAN_ADMIN #3)
**Location:** Registration Pipeline — customer table

#### TC-02-A: Commercial accounts display company name as primary
**Steps:**
1. Find a row where the registrant is a COMMERCIAL user with a company name.

**Expected:**
- **Company name** is shown in bold/larger text as the primary line.
- **Individual name** (first + last) is shown underneath in smaller, grey text.
- Column header reads **"Name / Company"** (not just "Name").

**Fail:** Only the individual name shows; company name is absent.

---

#### TC-02-B: Residential accounts show individual name only
**Steps:**
1. Find a RESIDENTIAL registrant row.

**Expected:** Only the individual's first + last name is shown. No secondary line.

---

---

## SECTION 2 — User Management

### TEST-03: Inline Status Filter Pills
**Fix ref:** FIX-02 (PLAN_ADMIN #2)
**Location:** Dashboard → User Management → Customer Management tab

#### TC-03-A: Status filter pills are visible inline
**Steps:**
1. Navigate to User Management.

**Expected:** Below the "Customer Management" heading (above or near the search/filter buttons), there is a row of pill buttons: **All · Active · Invited · Registered · Terminated · Inactive**

**Fail:** Pills are absent; filtering requires opening the Filter modal.

---

#### TC-03-B: "All" pill is active by default
**Steps:**
1. Load User Management without applying any filters.

**Expected:** "All" pill is highlighted. All customers are visible.

---

#### TC-03-C: Clicking "Active" pill filters the list
**Steps:**
1. Click the **Active** pill.

**Expected:** Only customers with Active status appear. The pill becomes visually active (coloured background).

---

#### TC-03-D: Clicking "Invited" pill filters the list
**Steps:**
1. Click **Invited**.

**Expected:** Only customers with Invited status appear.

---

#### TC-03-E: Clicking "Terminated" pill filters the list
**Steps:**
1. Click **Terminated**.

**Expected:** Only terminated customers appear.

---

#### TC-03-F: Status filter modal still works alongside pills
**Steps:**
1. Click the **Filter** / Filter By button to open the filter modal.
2. Apply a status filter from the modal.

**Expected:** The modal filter still works. The inline pill updates to match the applied status if applicable.

---

### TEST-04: Company Name as Primary Identity in User Management
**Fix ref:** FIX-03 (PLAN_ADMIN #3)
**Location:** User Management — customer list table

#### TC-04-A: COMMERCIAL users show company name as primary
**Steps:**
1. Find a COMMERCIAL customer row in the list.

**Expected:**
- Bold company name on the first line.
- Smaller grey individual name on the second line.
- Column header reads **"Name / Company"**.

---

#### TC-04-B: RESIDENTIAL users show individual name only
**Steps:**
1. Find a RESIDENTIAL customer row.

**Expected:** Single line with individual name. No secondary line.

---

---

## SECTION 3 — Payout Management

### TEST-05: Compact Profile Info Strip (replaced large teal box)
**Fix ref:** FIX-04 (PLAN_ADMIN #6)
**Location:** Payout → Commercial Payout Details AND Partner Payout Details

#### TC-05-A: Large teal/green profile box is gone
**Steps:**
1. Go to Payout → select a Commercial payout entry → click to view details.

**Expected:** There is NO large teal/green card dominating the top of the page. Instead, a compact single-row or two-row strip shows the user info.

**Fail:** The full-width teal card with large padding still appears.

---

#### TC-05-B: Compact strip shows required fields
**Steps:**
1. In the payout detail view, inspect the compact info strip.

**Expected:** The strip shows:
- **Company name** (bold) — primary identity
- **Individual name** (smaller, grey)
- **Business address** (if available)
- **Email**
- **Phone** (if available)
- **User Type badge** (e.g., "COMMERCIAL" or "PARTNER")

---

#### TC-05-C: Partner payout view also uses compact strip
**Steps:**
1. Go to Payout → select a Partner payout entry → view details.

**Expected:** Same compact strip (no large teal card). Partner name (company) shown as primary.

---

### TEST-06: Revenue Wallet Cleanup
**Fix ref:** FIX-05 (PLAN_ADMIN #7)
**Location:** Payout → Commercial Payout Details AND Partner Payout Details

#### TC-06-A: "Held Amount" is removed from Commercial payout wallet view
**Steps:**
1. Open any Commercial Payout Details page.
2. Look at the Revenue Wallet card.

**Expected:**
- Shows: **Total Earnings** and **Available Balance** only (2 columns).
- **"Held Amount"** is NOT present.
- **"Total Commission"** is NOT present.

**Fail:** Held Amount or Total Commission still visible.

---

#### TC-06-B: Partner payout wallet shows correct labels
**Steps:**
1. Open a Partner Payout Details page.
2. Look at the Revenue Wallet card.

**Expected:**
- Shows: **Total Revenue** (or Total Earnings) and **Available Balance**.
- "Held Amount" is absent.

---

#### TC-06-C: Wallet values are not zero or broken
**Steps:**
1. Check the displayed monetary values in the wallet card.

**Expected:** Values are real numbers (e.g., "$1,234.56"), not "$0.00" for all fields when the user has actual activity, and not "[object Object]" or undefined/NaN.

---

### TEST-07: Invoice Approve / Reject / Mark as Paid Flow
**Fix ref:** FIX-06 (PLAN_ADMIN #5)
**Location:** Payout → Commercial Payout Details / Partner Payout Details → Payout Requests table

#### TC-07-A: PENDING rows show both Approve and Reject buttons
**Pre-condition:** A payout request with status = PENDING exists.
**Steps:**
1. Open the payout detail view for a user with a PENDING payout request.
2. Find the PENDING row in the Payout Requests table.

**Expected:** Both **Approve** (teal) and **Reject** (red) buttons are visible on the row.

---

#### TC-07-B: Reject button opens a modal (not an alert)
**Steps:**
1. Click the **Reject** button on a PENDING row.

**Expected:** A modal dialog appears with:
- Title: "Reject Invoice"
- A **required** textarea for the rejection reason.
- **Cancel** and **Confirm Reject** buttons.

**Fail:** Browser `alert()` or `confirm()` pops up instead of a modal; or no dialog appears.

---

#### TC-07-C: Reject modal requires a reason before confirming
**Steps:**
1. Open the Reject modal.
2. Leave the textarea empty.
3. Try to click **Confirm Reject**.

**Expected:** The Confirm Reject button is disabled (greyed out) and cannot be clicked.

---

#### TC-07-D: Rejection completes and shows reason
**Steps:**
1. Open the Reject modal.
2. Type a reason: "Invoice amount does not match our records."
3. Click **Confirm Reject**.

**Expected:**
- Modal closes.
- The payout row now shows a red **REJECTED** badge.
- Beneath the row, a red-highlighted sub-row shows: **"Rejection reason: Invoice amount does not match our records."**
- Toast notification: "Invoice rejected"

**Fail:** Row stays as PENDING; reason does not appear below the row.

---

#### TC-07-E: Approve button works and transitions to APPROVED
**Steps:**
1. Click **Approve** on a PENDING row.

**Expected:**
- The row status changes from PENDING (amber) to **APPROVED** (blue).
- A **"Mark as Paid"** button (teal outline) appears on the row.
- Toast notification confirms success.

---

#### TC-07-F: "Mark as Paid" button appears only for APPROVED rows
**Steps:**
1. Look at rows with different statuses: PENDING, APPROVED, PAID, REJECTED.

**Expected:**
- PENDING → Approve + Reject buttons.
- APPROVED → "Mark as Paid" outline button only.
- PAID → "Paid ✓" text only (no buttons).
- REJECTED → AlertTriangle icon + "Rejected" text only.

---

#### TC-07-G: Mark as Paid shows a confirmation dialog
**Steps:**
1. Click **Mark as Paid** on an APPROVED row.

**Expected:** A browser confirmation dialog asks: "Confirm that the payment has been deposited into the user's bank account?" with OK / Cancel.

---

#### TC-07-H: Confirming "Mark as Paid" updates status to PAID
**Steps:**
1. Click **Mark as Paid** → click OK in the confirmation.

**Expected:**
- Row status changes to **PAID** (teal badge).
- "Mark as Paid" button disappears.
- "Paid ✓" text appears.
- Toast notification confirms.

---

### TEST-08: Invoice Discrepancy Auto-Flag
**Fix ref:** FIX-11 (PLAN_ADMIN #4)
**Location:** Payout → Commercial / Partner Payout Details → Payout Requests table

**Pre-condition:** A payout record exists where `hasDiscrepancy = true`, `partnerInvoiceAmount` and `systemCalculatedAmount` are set.

#### TC-08-A: Discrepancy badge appears on Amount cell
**Steps:**
1. Open a payout detail page.
2. Find a row where the invoice amount has a discrepancy.

**Expected:** In the **Amount** column, next to the dollar amount, an amber badge reading **"⚠ Discrepancy"** is visible.

**Fail:** No badge; row looks identical to non-discrepant rows.

---

#### TC-08-B: Discrepancy comparison row appears below the payout row
**Steps:**
1. On the same discrepant row, look below it.

**Expected:** An amber-highlighted sub-row appears showing:
- "Amount Discrepancy"
- **"Partner stated: $X.XX"**
- **"System calculated: $Y.YY"**
- **"Difference: $Z.ZZ"** (in red)

---

#### TC-08-C: Non-discrepant rows show no badge or sub-row
**Steps:**
1. Find a payout row where `hasDiscrepancy` is false or not set.

**Expected:** No amber badge and no discrepancy sub-row. The row looks clean.

---

#### TC-08-D: Discrepancy row + rejection reason can coexist
**Steps:**
1. Find a payout row that is both REJECTED and has a discrepancy.

**Expected:**
- The amber discrepancy sub-row appears.
- The red rejection reason sub-row also appears (below the discrepancy row).
- Both are visible at the same time without layout overlap.

---

---

## SECTION 4 — REC Sales Management

### TEST-09: REC Sales Overview — Aggregate Only
**Fix ref:** FIX-07 (PLAN_ADMIN #9)
**Location:** Dashboard → REC Sales → Overview tab

#### TC-09-A: Overview tab shows only aggregate KPI cards and charts
**Steps:**
1. Go to REC Sales → Overview tab.

**Expected:**
- **KPI cards** are visible (Total RECs Available, Total RECs Sold, Most Recent REC Price).
- **Charts/Graphs** are visible.
- A heading reads something like **"REC Sales Summary — Aggregate"**.
- The **List of Buyers card is NOT on this tab**.

**Fail:** List of Buyers still appears on Overview tab.

---

#### TC-09-B: Entries tab contains List of Buyers
**Steps:**
1. Click the **Entries** tab in REC Sales.

**Expected:**
- REC sales entries table is visible.
- Below it (separated by a divider), the **List of Buyers card** is also visible.

**Fail:** List of Buyers is absent from the Entries tab.

---

### TEST-10: Management Tab — No Per-Facility Lists
**Fix ref:** FIX-07 (PLAN_ADMIN #9)
**Location:** Dashboard → REC Sales → Management tab

#### TC-10-A: Per-facility lists (CommercialRECGeneration, ResidentialRECGeneration) are removed
**Steps:**
1. Go to REC Sales → Management tab.

**Expected:**
- NO dropdown to switch between "Commercial" and "Residential" generation lists.
- NO large table listing per-facility monthly generation records.

**Fail:** Commercial or Residential per-facility tables still appear.

---

#### TC-10-B: Management tab shows WREGIS export + info callout
**Steps:**
1. Look at the Management tab content.

**Expected:**
- A card with the label **"REC Generation Report (CA Vintage)"** and an **"Export WREGIS XLSX"** button.
- An info callout (blue box) stating that per-facility data has moved to User Management.
- The **RECGenerationReport** aggregate table below.

---

#### TC-10-C: WREGIS Export button triggers server download
**Steps:**
1. Click **Export WREGIS XLSX**.

**Expected:**
- Button shows "Exporting..." spinner while working.
- An `.xlsx` file download starts in the browser (file named like `wregis-export-YYYY-MM-DD.xlsx`).
- No "No records found" alert for a database with actual records.

**Fail:** Old CSV download triggers instead of XLSX; console shows "Failed to fetch"; or file does not download.

---

#### TC-10-D: Export Filters panel opens and accepts inputs
**Steps:**
1. Click the **Filters** button on the Management tab export bar.

**Expected:** A filter panel expands below the action bar with fields:
- Month (dropdown)
- Year (dropdown)
- Facility Type (All / Commercial / Residential)
- WREGIS Status (All / Pending Submission / Submitted / Approved / Rejected / Adjusted)
- Zip Code (text input)

---

#### TC-10-E: Export with filters passes params to server
**Steps:**
1. Set Month = "01", Year = current year, Facility Type = "Commercial".
2. Click **Export WREGIS XLSX**.

**Expected:** File downloads. The export should only contain records matching the selected filters (verify if possible by checking the spreadsheet content).

---

#### TC-10-F: Clear filters (X) button works
**Steps:**
1. Apply at least one filter.
2. Click the **X** (clear filters) button.

**Expected:** All filter dropdowns reset to "All" / empty.

---

---

## SECTION 5 — Reporting

### TEST-11: REC Generation — Merged View with Facility Type Filter
**Fix ref:** FIX-10 (PLAN_ADMIN #14)
**Location:** Dashboard → Reporting → "REC Generation" report

#### TC-11-A: "REC Generation" is in the dropdown (no separate Residential/Commercial entries)
**Steps:**
1. Go to Reporting. Click the report type dropdown.

**Expected:**
- **"REC Generation"** is in the list.
- **"Residential REC Generation"** does NOT exist as a separate item.
- **"Commercial REC Generation"** does NOT exist as a separate item.

---

#### TC-11-B: REC Generation table has a "Facility Type" column
**Steps:**
1. Select "REC Generation" report.
2. Look at the table columns.

**Expected:** Columns include: **Facility Type | Name | Facility / Property | Meter UID | Utility | Start Date | End Date | Interval kWh | Points | RECs**

---

#### TC-11-C: Facility Type badge distinguishes Residential vs Commercial
**Steps:**
1. Look at the Facility Type column values.

**Expected:**
- Residential records show a **teal "Residential"** badge.
- Commercial records show a **blue "Commercial"** badge.

---

#### TC-11-D: "Filter by type" pills work
**Steps:**
1. In the REC Generation view, find the filter pills: **All | Residential | Commercial**.
2. Click **Residential**.

**Expected:** Only residential records show. The count in the pill updates.

3. Click **Commercial**.

**Expected:** Only commercial records show.

4. Click **All**.

**Expected:** Both types show again.

---

#### TC-11-E: "Residential Redemption" is a separate report type
**Steps:**
1. Open the report type dropdown.

**Expected:** **"Residential Redemption"** exists as a separate selectable report. Columns: Name, Amount, Status, Request Date, Processed Date.

---

### TEST-12: Partner Performance Report — Updated Columns
**Fix ref:** FIX-08 (PLAN_ADMIN #12)
**Location:** Reporting → "Partner Performance" report

#### TC-12-A: Column names are correct
**Steps:**
1. Select "Partner Performance" in the report dropdown.
2. Look at the table column headers.

**Expected:** Columns in order: **Company Name | Partner Type | Total Referrals | Total Facilities | RECs Generated | Date Joined**

**Fail:** "Address" or "Status" columns still appear; Company Name is missing.

---

#### TC-12-B: Company Name column shows partner's company name
**Steps:**
1. Look at a Partner Performance row.

**Expected:** The Company Name cell contains the partner's business/company name (not an individual first+last name).

---

#### TC-12-C: RECs Generated shows a number (not a placeholder dash)
**Steps:**
1. Check the RECs Generated column values.

**Expected:** Numeric values (may be 0 for new partners, but not "—" for partners who have referred verified facilities).

> Note: If the database has no RECs generated yet, "—" or "0" is acceptable. Flag if ALL values are "—" for partners known to have generated RECs.

---

#### TC-12-D: Data loads from the dedicated endpoint (no extra API calls)
**Steps:**
1. Open the Network tab in DevTools.
2. Select "Partner Performance" from the dropdown.

**Expected:** A request to `GET /api/admin/partner-performance` is made. No separate `/api/admin/partners` call followed by supplementary referral fetches.

---

### TEST-13: Three New Report Types
**Fix ref:** FIX-13 (PLAN_ADMIN #10)
**Location:** Reporting → report type dropdown

#### TC-13-A: Three new report types are in the dropdown
**Steps:**
1. Click the report type dropdown in Reporting.

**Expected:** These three new items are present:
- **Points Report**
- **REC Generation Report**
- **REC Sales Entries**

---

#### TC-13-B: Points Report loads and shows correct columns
**Steps:**
1. Select **Points Report**.

**Expected:**
- Table loads (spinner then data or "No records found" if empty).
- Columns: **User / Facility | Earned Points | Redeemed Points | Open Balance**
- No console errors.

---

#### TC-13-C: REC Generation Report loads and shows WREGIS status badges
**Steps:**
1. Select **REC Generation Report**.

**Expected:**
- Columns: **Facility | Month/Year | RECs Generated | RECs Approved | WREGIS Status**
- The WREGIS Status column shows coloured badges:
  - Pending Submission → grey
  - Submitted → amber
  - Approved → teal
  - Rejected → red
  - Adjusted → purple

---

#### TC-13-D: REC Sales Entries loads and shows correct columns
**Steps:**
1. Select **REC Sales Entries**.

**Expected:** Columns: **Sale Date | Vintage | RECs Sold | Price Per REC | Total Amount | Buyer**

---

#### TC-13-E: Export works for all new report types
**Steps:**
1. For each of the three new report types, click **Export Report**.

**Expected:** A CSV file downloads with the correct column headers matching the table.

---

### TEST-14: REC Reporting Label Change
**Fix ref:** FIX-09 (PLAN_ADMIN #13)
**Location:** Reporting — check all visible labels

#### TC-14-A: No label says "Commercial REC Generation" (old mislabel)
**Steps:**
1. Browse through all report type names in the dropdown.
2. Check any visible UI text on the Reporting page.

**Expected:** The string "Commercial REC Generation" does NOT appear anywhere. The merged view is labelled "REC Generation".

---

---

## SECTION 6 — User Management → Facility Details

### TEST-15: REC Generation History in Facility Detail Pages
**Fix ref:** FIX-12 (PLAN_ADMIN #8)
**Location:** User Management → Commercial customer → facility card
**Also:** User Management → Residential customer → facility card

#### TC-15-A: "REC History" button appears on each facility card
**Pre-condition:** Open a Commercial or Residential customer's detail page that has at least one facility.
**Steps:**
1. Look at the facility card action buttons row.

**Expected:** A **"REC History"** button (with a history/clock icon) is present alongside the existing WREGIS Cover Sheet and other action buttons.

---

#### TC-15-B: Clicking "REC History" expands the history table inline
**Steps:**
1. Click **REC History** on a facility card.

**Expected:**
- A table expands inline below that specific facility card.
- The table shows columns: **Month/Year | RECs Generated | WREGIS Status | Approved Amount | Admin Note | Actions**
- The button turns solid teal (indicating active state).

---

#### TC-15-C: Clicking "REC History" again collapses it
**Steps:**
1. Click the active (solid teal) **REC History** button again.

**Expected:** The history table collapses. The button returns to outline style.

---

#### TC-15-D: WREGIS status badges display correctly
**Steps:**
1. Open a facility with REC records at various stages.

**Expected:** Coloured status badges:
- `PENDING_SUBMISSION` → grey
- `SUBMITTED` → amber
- `APPROVED` → teal
- `REJECTED` → red
- `ADJUSTED` → purple

---

#### TC-15-E: PENDING_SUBMISSION rows show a "Submit" button
**Pre-condition:** A facility has a REC record with `wregisStatus = PENDING_SUBMISSION`.
**Steps:**
1. Find a row with Pending Submission status.

**Expected:** A blue **"Submit"** button appears in the Actions column.

---

#### TC-15-F: Clicking "Submit" opens the Submit modal
**Steps:**
1. Click **Submit** on a Pending Submission row.

**Expected:** A modal opens with:
- Title: "Mark as Submitted to WREGIS"
- Description text explaining the action.
- **Cancel** and **Mark Submitted** buttons.

---

#### TC-15-G: Confirming Submit changes status to SUBMITTED
**Steps:**
1. Click **Mark Submitted** in the modal.

**Expected:**
- Modal closes.
- Row status changes to **SUBMITTED** (amber badge).
- Actions column now shows: **Approve | Adjust | Reject** buttons.
- Toast notification confirms.

---

#### TC-15-H: SUBMITTED rows show Approve, Adjust, and Reject buttons
**Pre-condition:** A REC record with `wregisStatus = SUBMITTED` exists.
**Steps:**
1. Find a SUBMITTED row in the history table.

**Expected:** Three action buttons are visible: **Approve** (teal), **Adjust** (purple), **Reject** (red).

---

#### TC-15-I: "Approve" directly approves without a modal
**Steps:**
1. Click **Approve** on a SUBMITTED row.

**Expected:**
- No modal (approve requires no extra input).
- Row status changes to **APPROVED** (teal badge).
- The Approve/Adjust/Reject buttons disappear (replaced by "Final" label).
- Toast notification confirms.

---

#### TC-15-J: "Reject" opens a modal requiring a note
**Steps:**
1. Click **Reject** on a SUBMITTED row.

**Expected:** A modal opens with:
- Title: "Reject REC Record"
- A **required** Admin Note textarea.
- Cancel + Confirm Reject (red) buttons.

2. Leave the note empty → click Confirm Reject.

**Expected:** Button is disabled. Cannot submit.

3. Enter a note → click Confirm Reject.

**Expected:** Row status changes to **REJECTED**. Admin note text appears in the Admin Note column. Toast confirms.

---

#### TC-15-K: "Adjust" opens a modal requiring amount AND note
**Steps:**
1. Click **Adjust** on a SUBMITTED row.

**Expected:** Modal opens with:
- Title: "Adjust REC Amount"
- A numeric input pre-filled with the current REC amount.
- A required Admin Note textarea.
- Cancel + Apply Adjustment (purple) buttons.

2. Clear the amount field → try to submit.

**Expected:** Confirm button is disabled.

3. Fill both fields → click Apply Adjustment.

**Expected:** Row status changes to **ADJUSTED** (purple). The Approved Amount column updates to the new value. The Admin Note column shows the entered note. Toast confirms.

---

#### TC-15-L: Bulk Approve checkboxes only appear on SUBMITTED rows
**Steps:**
1. Look at the checkbox column in the REC History table.

**Expected:**
- Only SUBMITTED rows have an active checkbox.
- PENDING_SUBMISSION, APPROVED, REJECTED, ADJUSTED rows have an empty space (no checkbox).

---

#### TC-15-M: Select All checkbox selects all SUBMITTED rows
**Steps:**
1. Click the **Select All** checkbox in the table header.

**Expected:** All checkboxes on SUBMITTED rows become checked. Checkboxes on other-status rows remain unaffected.

---

#### TC-15-N: Bulk Approve button appears when rows are selected
**Steps:**
1. Select 2+ SUBMITTED rows using checkboxes.

**Expected:** A **"Bulk Approve (N)"** button appears in the table header area, where N is the count of selected rows.

---

#### TC-15-O: Bulk Approve processes all selected rows
**Steps:**
1. Select 2 SUBMITTED rows.
2. Click **Bulk Approve (2)**.
3. Confirm the browser dialog.

**Expected:**
- Both rows change to APPROVED status.
- Checkboxes clear.
- Bulk Approve button disappears.
- Toast shows success message with count (e.g., "Bulk approved: 2 record(s)").

---

#### TC-15-P: REC History on Residential detail page also works
**Steps:**
1. Navigate to a Residential customer in User Management.
2. Find a facility card.
3. Click **REC History**.

**Expected:** Same history table opens. Same actions work. The API call uses `facilityType=residential`.

---

#### TC-15-Q: Pagination works if more than 20 records
**Pre-condition:** A facility has more than 20 REC history records.
**Steps:**
1. Open the REC History table.
2. Check if pagination controls appear at the bottom.
3. Click **Next**.

**Expected:** Page 2 loads. The row count in the header updates.

---

---

## SECTION 7 — Cross-Cutting & Regression

### TEST-16: Regression — Navigation & Layout
**Location:** General

#### TC-16-A: All navigation links still work
**Steps:**
1. Click each item in the left sidebar: Dashboard, Registration Pipeline, User Management, Payout, REC Sales, Reporting.

**Expected:** Each page loads without error. No blank screens or "page not found."

---

#### TC-16-B: No new JavaScript console errors on any changed page
**Steps:**
1. Open DevTools console.
2. Visit each changed page: Registration Pipeline, User Management, Commercial Payout Details, Partner Payout Details, REC Sales (all 3 tabs), Reporting.

**Expected:** No new red `TypeError`, `ReferenceError`, or `Uncaught` errors in the console. Network 4xx/5xx responses should be absent for normal operations.

---

#### TC-16-C: All changed pages load within a reasonable time
**Steps:**
1. Navigate to each changed page and time the initial load.

**Expected:** Each page renders content within 5 seconds on a normal connection. Loading spinners appear while data fetches; they do not spin indefinitely.

---

#### TC-16-D: Mobile/tablet responsive check (basic)
**Steps:**
1. In DevTools, toggle device toolbar and set viewport to 768px wide.
2. Visit Registration Pipeline, User Management, and Payout Details.

**Expected:** No horizontal overflow. Tables may scroll horizontally but content is not clipped or unusable. Filter pills wrap gracefully.

---

### TEST-17: Authentication & Permission Checks

#### TC-17-A: Non-admin users cannot access admin routes
**Steps:**
1. Log out.
2. Try to navigate directly to `/dashboard` or any admin route.

**Expected:** Redirected to the login page. Admin pages are not accessible unauthenticated.

---

#### TC-17-B: Expired session handling
**Steps:**
1. Log in.
2. Manually delete the `authToken` from localStorage (DevTools → Application → Local Storage).
3. Click any action button (Approve, Reject, etc.).

**Expected:** Either the action fails gracefully with a "Session expired" message, or the user is redirected to login.

---

---

## BUG REPORTING GUIDE

When reporting a bug from this test plan, include:

| Field | Example |
|---|---|
| **Test Case ID** | TC-07-D |
| **Summary** | Rejection reason does not appear below payout row after rejecting |
| **Steps to Reproduce** | 1. Open Commercial Payout Details... 2. Click Reject... |
| **Expected Result** | Red sub-row shows rejection reason text |
| **Actual Result** | Row shows REJECTED badge but no sub-row |
| **Severity** | Medium |
| **Browser / OS** | Chrome 123 / Windows 11 |
| **Screenshot / Recording** | [attach] |
| **Console Errors** | [paste any errors from DevTools console] |

---

## SUMMARY CHECKLIST

| Section | Fix | Priority | Status |
|---|---|---|---|
| Registration Pipeline — Status filter tabs | FIX-01 | 🟠 HIGH | ☐ |
| Registration Pipeline — Company name as primary | FIX-03 | 🟠 HIGH | ☐ |
| User Management — Inline status filter pills | FIX-02 | 🟠 HIGH | ☐ |
| User Management — Company name as primary | FIX-03 | 🟠 HIGH | ☐ |
| Payout — Compact profile info strip | FIX-04 | 🟡 MEDIUM | ☐ |
| Payout — Revenue Wallet (removed Held Amount) | FIX-05 | 🟡 MEDIUM | ☐ |
| Payout — Reject modal + Mark as Paid flow | FIX-06 | 🟡 MEDIUM | ☐ |
| Payout — Discrepancy auto-flag + comparison row | FIX-11 | 🟡 MEDIUM | ☐ |
| REC Sales — Aggregate overview (no per-facility lists) | FIX-07 | 🟡 MEDIUM | ☐ |
| REC Sales — WREGIS XLSX export with filters | FIX-14 | 🟡 MEDIUM | ☐ |
| Reporting — REC Generation merged view + filter pills | FIX-10 | 🟢 LOW | ☐ |
| Reporting — REC label renamed | FIX-09 | 🟢 LOW | ☐ |
| Reporting — Partner Performance updated columns | FIX-08 | 🟡 MEDIUM | ☐ |
| Reporting — Three new report types (Points, REC Gen, Sales) | FIX-13 | 🟡 MEDIUM | ☐ |
| User Mgmt Facility — REC History (Submit/Approve/Reject/Adjust) | FIX-12 | 🟡 MEDIUM | ☐ |
| User Mgmt Facility — Bulk Approve | FIX-12 | 🟡 MEDIUM | ☐ |
| Regression — Navigation, console errors, load times | — | — | ☐ |

---

*Total test cases: 56 | Generated from meeting notes March 16, 2026 + implementation changes*
