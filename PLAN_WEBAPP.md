# DCarbon Web App — Fix & Change Plan
> Source: Meeting Notes — March 16, 2026
> Scope: Customer-facing web application (used by residential users, commercial users, and partners)

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
