# DCarbon Web App — Fix & Change Plan
> Source: Meeting Notes — March 16, 2026 + March 18, 2026
> Scope: Customer-facing web application (used by residential users, commercial users, and partners)
> Last updated: March 20, 2026

---

## Priority Classification

| Priority | Meaning |
|---|---|
| 🔴 CRITICAL | Blocks core workflow — user cannot complete key actions |
| 🟠 HIGH | Broken or wrong functionality that affects current users |
| 🟡 MEDIUM | UI/UX improvements agreed upon in the meeting |
| 🟢 LOW | Label/text cleanup, non-blocking polish |

---

## 🔴 CRITICAL — Broken Functionality

### 1. Fix Partner Invoice Upload Flow

**Context:** The partner invoice submission endpoint is broken. This blocks partners from submitting invoices and requesting payouts.

**What to fix:**
- The invoice submission form is not successfully uploading documents to the server
- After the server-side fix (see `PLAN_SERVER.md` item #6), confirm the frontend is:
  - Sending the file as `multipart/form-data` (NOT base64 JSON)
  - Using the correct endpoint: `POST /api/payout-request/...` (the new payout route, NOT the legacy `/api/payout`)
  - Reading and displaying the server error response when upload fails

**Where to look in the codebase:**
- Partner invoice submission page/component
- The API call that handles form submission (likely in a `payoutService` or `apiService` file)
- Confirm the `Content-Type: multipart/form-data` header is being set correctly (do NOT manually set it — let the browser/axios set it with the boundary)

---

### 2. Residential Payout — "Request Payout" Button Gating

**Context:** Residential users cannot request payout until they have enough points. The button should be disabled (with an explanation tooltip) when the user is ineligible.

**What to fix:**
- On load of the residential payout/wallet page:
  - Call `GET /api/payout-request/eligibility`
  - If `eligible: false` → disable the "Request Payout" button
  - Show message: e.g., "You need X more points to request a payout" (use `requiredPoints - currentPoints`)
  - If `eligible: true` → enable the button
- The button must never be hard-disabled or hidden — users should see why they cannot use it yet

---

## 🟠 HIGH — Payout & Invoice Workflow Fixes

### 3. Restructure Partner Invoice Submission Page

**Context:** The "Request Payout" button on the reporting page should be removed. The ability to generate an invoice should be moved into the "Submit Invoice" section.

**Current state:** Reporting page has a "Request Payout" button mixed in.

**Target state:** The "Submit Invoice" section should have two clear options:
1. **Generate Invoice** — system generates an invoice from the earnings statement data (pre-filled with the system's calculated amount)
2. **Upload Custom Invoice** — partner uploads their own invoice document and manually enters the invoice amount

**What to change:**
- Remove "Request Payout" / "Request Payout" button from the reporting page entirely
- On the "Submit Invoice" page/modal:
  - Add two clearly labelled options (tabs or radio selection): "Generate Invoice" | "Upload Custom Invoice"
  - For "Upload Custom Invoice":
    - File upload input (PDF/image)
    - A text field: "Enter the invoice amount" (this is the partner's stated amount, NOT the system number)
    - The system invoice number should NOT be visible to the partner
    - Display: "Our system calculated amount: $X.XX — this will be used for verification"
  - Remove the VAT field entirely from this form

---

### 4. Payout View — Fix the Green Profile Box

**Context:** The green box in the payout view displays basic user info but takes up too much space and is missing key commercial/partner details.

**What to change:**
- Reduce the height/padding of the green profile box
- For **commercial users and partners**, display:
  - Business/company name (primary, large text)
  - Business address
  - Owner name (secondary, smaller text)
- For **residential users**, current display is acceptable (individual name)
- The box should be compact — no wasted whitespace

---

### 5. Partner Payout Processing View — Align with Commercial Invoice List UI

**Context:** The partner payout processing view currently resembles the residential user view. It should instead look like the commercial invoice list.

**What to change:**
- Partner payout page should display an **invoice list table** (same structure as the commercial user invoice list), not the residential card/wallet view
- Columns: Invoice #, Date Submitted, Amount, Status (Pending / Approved / Rejected), Actions
- On row click: show invoice details modal (uploaded document preview, amount comparison, admin notes if rejected)

---

## 🟡 MEDIUM — UI/UX Improvements

### 6. Revenue Wallet Display — Commercial & Partner Cleanup

**Context:** The Revenue Wallet display is confusing for commercial users and partners. "Held Amount" is irrelevant to their workflow.

**What to change:**
- For **commercial users and partners**:
  - Show only two values:
    - "Total Earnings" (formerly `totalEarnings` — lifetime earnings from REC sales)
    - "Available Balance" (formerly `availableBalance`)
  - Remove / hide "Held Amount" entirely
  - Rename "Revenue Wallet" section header to just "Revenue" or "Earnings"
- For **residential users**: no change (held amount may still be relevant to their points-based flow)

**API to use:** `GET /api/revenue` — the server will return the simplified wallet object for commercial/partner users (pending server fix in `PLAN_SERVER.md` item #8)

---

### 7. REC Reporting View — Label Change

**Context:** On the REC reporting screen, the column/metric labelled "generation" is incorrect for the commercial context.

**What to change:**
- Change the label `"generation"` → `"Commercial REC Sales"` on the commercial REC reporting component
- This is a text-only change in the component template/JSX

---

### 8. Partner Performance Table — Column Changes

**Context:** The partner performance table includes irrelevant columns and is missing useful ones.

**What to change:**
- **Remove** columns: `Address`, `Status`
- **Add** columns: `Company Name`, `RECs Generated`
- Column order suggestion: Company Name → Total Referrals → Total Facilities → RECs Generated
- "Total Facilities" should only count fully approved and registered facilities (confirmed in meeting)

**API dependency:** Server-side update required (see `PLAN_SERVER.md` item #10) — confirm new fields are returned before building this

---

### 9. Commercial REC Generation List — Show Aggregate Only

**Context:** The commercial REC generation list currently shows per-facility monthly records (potentially 10,000+ rows). Must switch to aggregate view.

**Current view:** Table with one row per facility per month
**Target view:** Summary cards/stat boxes showing:
- Total RECs Available
- Total RECs Sold
- Most Recent REC Price

**Detailed monthly data** (per facility) → moved to the **Facility Detail** page inside User Management (admin side handles this — see `PLAN_ADMIN.md`)

**API to use:** New `GET /api/rec/summary` endpoint (see `PLAN_SERVER.md` item #9)

---

### 10. Invoice Workflow — Discrepancy Warning Display

**Context:** When a partner enters an invoice amount that doesn't match the system-calculated amount, the admin sees a flag. The partner should also have visibility when submitting.

**What to add:**
- When the partner enters their invoice amount in the "Upload Custom Invoice" flow:
  - Show a real-time comparison: "System calculated: $X.XX | You entered: $Y.YY"
  - If they differ by more than a small threshold (e.g., $0.01): show a yellow warning banner: "Your entered amount differs from our system calculation. The admin will review this discrepancy."
  - Do NOT block submission — just warn

---

## 🟢 LOW — Text & Label Cleanup

### 11. Remove "Request Payout" Button from Reporting Page

Already covered in item #3. Note it here as a separate checklist item to confirm it is removed at the route/page level, not just hidden with CSS.

---

### 12. Use "Revenue" / "Total Earnings" Terminology Consistently

**What to change:**
- Audit all instances of "Revenue Wallet", "Available Balance", "Held Amount", "Commission" in the commercial/partner-facing UI
- Replace:
  - "Revenue Wallet" → "Revenue" or "Earnings"
  - "Commission" (for partners) → "Revenue" or "Total Earnings" (Phillip Kopp: "For partners, earnings and commission are essentially the same thing")
  - "Held Amount" → remove entirely for commercial/partner

---

## Summary Table

| # | Item | Priority | Area |
|---|---|---|---|
| 1 | Fix partner invoice upload flow | 🔴 CRITICAL | Invoice Submission |
| 2 | Residential "Request Payout" button gating by eligibility | 🔴 CRITICAL | Residential Payout |
| 3 | Restructure partner invoice submission (two options, remove VAT, hide system invoice #) | 🟠 HIGH | Partner Invoice |
| 4 | Fix green profile box in payout view (smaller, show company name/address) | 🟠 HIGH | Payout UI |
| 5 | Partner payout view → align with commercial invoice list | 🟠 HIGH | Partner Payout |
| 6 | Revenue Wallet — remove Held Amount for commercial/partner | 🟡 MEDIUM | Wallet |
| 7 | REC reporting label: "generation" → "Commercial REC Sales" | 🟡 MEDIUM | REC Reporting |
| 8 | Partner performance table: remove Address/Status, add Company Name/RECs Generated | 🟡 MEDIUM | Partner Reporting |
| 9 | Commercial REC generation list → aggregate view | 🟡 MEDIUM | REC Reporting |
| 10 | Show discrepancy warning during invoice amount entry | 🟡 MEDIUM | Invoice Submission |
| 11 | Confirm "Request Payout" removed from reporting page (not just hidden) | 🟢 LOW | Reporting |
| 12 | Consistent "Revenue/Total Earnings" terminology across commercial/partner UI | 🟢 LOW | Terminology |

---

*Generated from meeting notes — March 16, 2026*

---

---

# March 18, 2026 Meeting — New Web App Items

> Source: DCarbon Project — 2026_03_18 19_56 WAT — Notes by Gemini
> Added: March 20, 2026

---

## 🟠 HIGH — Confirmed Broken Displays (can start NOW — no server dependency)

### 13. Residential Payout Screen — Remove "Amount Held" and "Total Commission" Display

**Meeting context:**
Awam Victor confirmed in the demo: the residential payout screen still shows "amount held" and "total commission" fields. These must not be displayed for residential users.

**Current state:** The server correctly returns `pendingPayout` in the full wallet for residential users. The frontend is rendering it when it should not be.

**What to fix:**
- Locate the residential payout / redemption screen components
- Remove any rendering of `pendingPayout`, `heldAmount`, and `totalCommission` fields
- Only show: `availableBalance` and `pointBalance` (plus any REC-related fields)
- Do NOT change the API call — the server intentionally returns these fields; just stop displaying them

**Server dependency:** None — server is correct. ✅ Can start now.

---

### 14. Residential Payout Screen — Reduce Padding on Customer Detail Lines

**Meeting context:**
Awam Victor flagged this in the demo — the customer detail lines on the residential payout screen still have excessive vertical padding between them.

**What to fix:**
- Find the customer detail rows section on the residential payout / redemption screen
- Reduce `py-*` / `p-*` Tailwind spacing on each detail row to compact them
- Target: tight, compact rows — similar to the commercial invoice list style

**Server dependency:** None. ✅ Can start now.

---

### 15. Commercial & Partner Payout Screens — Restore All Personal Details + Add Business Name

**Meeting context:**
Chimdinma Kalu explicitly stated: *"the intention was to add business details, not remove existing user details such as name and address."* The commercial payout and partner commission statement screens had their personal fields stripped, leaving only username and email.

**What to fix — for Commercial payout screen:**
- Restore ALL previously displayed fields: name, email, address, phone
- ADD on top of that: `companyName` (primary, large) + `ownerFullName` (secondary, smaller)
- Fetch from `GET /api/user/get-commercial-user/:userId` on mount to get company details

**What to fix — for Partner commission statement screen:**
- Restore ALL previously displayed fields: name, email, address, phone
- ADD: partner company/organization name and business address
- Fetch from the partner profile endpoint on mount

**Server dependency:** Server-03 ✅ already done. `companyName` and `ownerFullName` available in user endpoints. Can start now.

---

## 🟠 HIGH — Invoice Submission for Commercial Users (can start NOW)

### 16. Add Invoice Submission UI for Commercial Users

**Meeting context:**
*"The feature to 'submit invoice' was only built for the partner but should be available to commercial users as well."*

**Important:** The server already supports commercial user invoice submission — `POST /api/quarterly-statements/invoices` accepts any authenticated user and `getOrCreateUserQuarterlyStatement` handles `COMMERCIAL` userType. This is a **frontend-only gap** — the invoice submission UI was never surfaced to commercial users.

**What to fix:**
- Add an "Submit Invoice" button / flow to the commercial user dashboard or payout screen
- The flow mirrors the partner invoice flow:
  1. **Generate Invoice mode** — system computes the quarterly earnings; user confirms and submits (JSON body, no file)
  2. **Upload Custom Invoice mode** — user uploads their own document + enters invoice amount
- Pre-populate the quarter/year selector with the current quarter
- Show the invoice history table below (fetched from `GET /api/quarterly-statements/invoices/user/:userId`)

**Server dependency:** None (server already supports commercial users). ✅ Can start now.
**Note:** Partner invoice flow also works for the file upload mode. For the "Generate Invoice" mode, partners are currently blocked server-side — see Item 17 in PLAN_SERVER.md.

---

## 🟡 MEDIUM — New Feature: Earnings Breakdown on Invoice Screen (waits on server)

### 17. Invoice Submission Screen — Show Per-Quarter Earnings Breakdown Table

**Meeting context:**
Chimdinma Kalu: *"the submit invoice function should connect to the earning statement table. The earnings statement should display what is due to the user based on commission or bonus, using a table format with facility ID, type, amount earned, quarter, and year."*

**Current state:** The invoice submission screen has a standalone amount field. Users have no visibility into how that amount was calculated.

**Target state:**
When the user opens the invoice submission form and selects a quarter/year:
1. Fetch `GET /api/quarterly-statements/earnings-breakdown?userId=:id&quarter=Q&year=Y&userType=T`
2. Display a breakdown table above the form:

| Facility | Type | Amount Earned | Quarter | Year |
|---|---|---|---|---|
| Solar Park A | COMMERCIAL | $750.00 | Q1 | 2026 |
| Bonus | — | $500.00 | Q1 | 2026 |

3. Pre-populate the invoice `amount` field with `totalDue` from the response
4. User can still edit the amount (for custom invoice mode) — discrepancy warning will show if they change it

**Server dependency:** ⏳ Blocked on PLAN_SERVER.md **Item 18** (`GET /api/quarterly-statements/earnings-breakdown` endpoint). Start this once server Item 18 is deployed.

---

## 🟡 MEDIUM — Partner Invoice Generate Mode (waits on server)

### 18. Partner "Generate Invoice" Mode — Remove Workaround, Wire Up Fully

**Meeting context:**
The "no file uploaded" bug was discussed. The server fix (PLAN_SERVER.md Item 17 + previous fix) now supports generate mode for partners with no file.

**Current state:**
The generate mode sends a JSON body (no file). The server now accepts this, but:
- The frontend may have a `catch` block showing a workaround message — this should be removed
- The invoice record returned by the server will have `invoiceDocument: null` for system-generated invoices

**What to fix:**
- Remove any temporary error workaround added for the "no file uploaded" error
- In the invoice history list / detail view: when `invoiceDocument` is `null`, show "System Generated" label instead of a download link
- Wire the "Generate Invoice" form to `POST /api/quarterly-statements/invoices` with JSON body (no file field)

**Server dependency:** ⏳ Blocked on PLAN_SERVER.md **Item 17** (PARTNER support in quarterly statement — partners need `userType=PARTNER` to work before the full flow can be tested).

---

## Updated Summary Table (all items)

| # | Item | Priority | Area | Server Dep | Status |
|---|---|---|---|---|---|
| 1 | Fix partner invoice upload flow | 🔴 CRITICAL | Invoice | Server-06 ✅ | Start now |
| 2 | Residential payout button gating by eligibility | 🔴 CRITICAL | Residential | Server-12 ✅ | Start now |
| 3 | Partner invoice submission — two options, remove VAT, hide system # | 🟠 HIGH | Partner Invoice | None | Start now |
| 4 | Fix green profile box (smaller, show company name/address) | 🟠 HIGH | Payout UI | Server-03 ✅ | Start now |
| 5 | Partner payout view → align with commercial invoice list | 🟠 HIGH | Partner Payout | None | Start now |
| 6 | Revenue Wallet — remove Held Amount for commercial/partner | 🟡 MEDIUM | Wallet | Server-08 ✅ | Start now |
| 7 | REC reporting label: "generation" → "Commercial REC Sales" | 🟡 MEDIUM | REC Reporting | None | Start now |
| 8 | Partner performance table: remove Address/Status, add Company/RECs | 🟡 MEDIUM | Partner Reporting | Server-10 ✅ | Start now |
| 9 | Commercial REC generation list → aggregate view | 🟡 MEDIUM | REC Reporting | Server-09 ✅ | Start now |
| 10 | Discrepancy warning during invoice amount entry | 🟡 MEDIUM | Invoice | None | Start now |
| 11 | Confirm "Request Payout" removed from reporting page | 🟢 LOW | Reporting | None | Start now |
| 12 | Consistent "Revenue/Total Earnings" terminology | 🟢 LOW | Terminology | None | Start now |
| **13** | **Residential payout — remove held amount + commission display** | 🟠 HIGH | Residential Payout | None ✅ | **Start now** |
| **14** | **Residential payout — reduce padding on detail lines** | 🟢 LOW | Residential Payout | None ✅ | **Start now** |
| **15** | **Commercial + partner payout — restore all fields + add company name** | 🟠 HIGH | Payout Screens | Server-03 ✅ | **Start now** |
| **16** | **Add invoice submission UI for commercial users** | 🟠 HIGH | Invoice | None ✅ | **Start now** |
| **17** | **Invoice screen — earnings breakdown table + pre-populate amount** | 🟡 MEDIUM | Invoice | Server Item 18 ✅ | **Start now** |
| **18** | **Partner generate invoice — remove workaround, handle null doc** | 🟡 MEDIUM | Partner Invoice | Server Item 17 ✅ | **Start now** |

---

## Server Dependency Map (updated March 20, 2026)

| Web App Item | Blocked By | Server Status |
|---|---|---|
| Item 17 — Earnings breakdown table | PLAN_SERVER Item 18 | ✅ DONE |
| Item 18 — Partner generate invoice fully wired | PLAN_SERVER Item 17 | ✅ DONE |
| Items 1–16 (all others) | Various — all complete | ✅ Unblocked |

**All server dependencies are resolved. Every web app item can start now.**

---

*Updated: March 20, 2026 — All server fixes complete. All web app items fully unblocked.*
