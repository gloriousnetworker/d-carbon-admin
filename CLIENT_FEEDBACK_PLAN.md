# Client Feedback — Admin Portal Gap Analysis & Implementation Plan

**Feedback received:** 2026-03-13
**Source:** Info desk dashboard review session
**Status:** In planning

---

## What the Client Is Saying (Plain English)

The client has used the admin portal and found it has about 50% of the critical functionality needed to run the business. Their core complaint is that admin cannot complete the full operational lifecycle — from agent registration through to REC sales and partner commission payouts — because too many data views, actions, and exports are missing.

The client described a very specific process that the admin must support end-to-end:

> **Agent registers → Partner registers → Partner invites → Invites accepted → Facility registers → Agreement signed → Authorization completed → Documents uploaded → Documents reviewed & approved/rejected by admin → All documents downloaded in document package and transferred to authority → Authority approval → Registration completed, generator activated → Begin collecting REC data → Export REC data to admin → Submit REC data to authority → REC data approved, RECs generated → RECs sold → Generate commission statements → Receive invoice from partner or facility owner → Repeat monthly**

Every step in this chain requires admin visibility, action capability, and export/download access. Currently, large portions of the chain are invisible or non-actionable in the portal.

---

## Issue Breakdown & Implementation Plan

---

### ISSUE 1 — Partner Details Page Is Incomplete

**What the client said:**
> "Partner information is extremely limited and there is no segmentation by partner or user type. I would expect we would be able to see ALL data fields collected about a partner including the partner type in the partner details and the user list."

**What this means:**
The `PartnerDetails` view shows a subset of partner fields. It is missing: partner type, all registered user accounts under the partner, account status, contact details, and any custom fields collected during registration.

**Plan:**
1. Audit `PartnerDetails.jsx` — list every field currently shown vs every field available from the `/api/admin/partners/:id` response
2. Add missing fields to the detail view: partner type (formatted), registration date, address, phone, status, associated user (with name, email, user type, account status)
3. Add a "Users" sub-tab on the partner detail page showing all user accounts linked to this partner
4. Filter the user list by type (Sales Agent, Installer, Finance Company, etc.)

---

### ISSUE 2 — Facility Details Missing from Partner View

**What the client said:**
> "I would expect we would be able to see all facility details for every facility within that partner, including all of the registration and document upload states."

**What this means:**
Within a partner's detail page, there should be a list of all facilities belonging to that partner, with full registration status, document upload states (uploaded/missing/approved/rejected) for each document type, and the current step in the registration workflow.

**Plan:**
1. Add a "Facilities" tab to `PartnerDetails.jsx`
2. Fetch facilities linked to the partner via API (`/api/admin/partners/:id/facilities` or equivalent)
3. For each facility, show: name, address, system capacity, utility provider, current registration stage, and a document checklist (agreement signed, authorization, installer cert, etc.) with status icons (✓ uploaded / ✗ missing / ⚠ rejected)
4. Clicking a facility row opens the full facility detail page

---

### ISSUE 3 — Document Review: No Access to Uploaded Documents

**What the client said:**
> "How can we approve or reject documents or download them if we have no access to documents?"

**What this means:**
The admin has no interface to view, download, approve, or reject documents uploaded by partners or facility owners. This is a blocker for the entire registration approval chain.

**Plan:**
1. Add a **Documents** section to both `PartnerDetails.jsx` and the facility detail view
2. For each document type, show: upload date, file name, download link, and approve/reject action buttons
3. On approve: call `PATCH /api/admin/documents/:id/approve` (or equivalent)
4. On reject: show a reason input modal, then call `PATCH /api/admin/documents/:id/reject`
5. Add a top-level **"Document Review"** queue in the admin sidebar showing all pending documents across all partners/facilities, sortable by date and partner
6. Add **"Download Document Package"** button on partner/facility page — zips all docs and downloads them

---

### ISSUE 4 — Finance Types Page Is Blank / Non-Functional

**What the client said:**
> "The finance types page is blank."

**What this means:**
The Finance Types page is rendering blank when navigated to from certain dropdown paths. (Root cause confirmed: view name mismatch `"finance"` vs `"finance-types"` in `PartnerManagement.jsx` — **already fixed in this session**.)

**Plan:**
1. ✅ Fix already applied — `PartnerManagement.jsx` now uses `"finance-types"` consistently
2. Verify the Finance Types CRUD operations (create, edit, approve, reject, delete) are all working end-to-end against the API
3. Confirm the approve/reject actions on finance types call the correct endpoints

---

### ISSUE 5 — No Invoice / Statement Access for Partner Payouts

**What the client said:**
> "How do we pay partners if we have no access to invoice statements?"

**What this means:**
There is no section in the admin for viewing, downloading, or generating commission statements or invoices for partners. This is required every month for payout processing.

**Plan:**
1. Add a **"Statements"** tab to the partner detail page showing all commission statements generated for that partner (month, amount, status: paid/unpaid/pending)
2. Add download button per statement (PDF)
3. Add a top-level **"Payout Processing"** section (already exists as a sidebar item — check if it has content or is also blank)
4. In Payout Processing: list all partners with outstanding invoices, total amounts due, and ability to mark as paid
5. Connect to `/api/admin/statements` or `/api/admin/payouts` endpoints — if these don't exist on the server, document them as new endpoints required in `CROSS_REPO_IMPACT.md`

---

### ISSUE 6 — No Agent Referral Code Management

**What the client said:**
> "Imagine we have a partner or agent and we cannot even lookup their referral code to tell them? Also no agent code management."

**What this means:**
Partners and agents have referral/agent codes assigned at registration. There is no UI to view, search, or manage these codes. Admin cannot look up a code to relay to a partner.

**Plan:**
1. Add **agent code** field to the partner detail view (displayed prominently)
2. Add a searchable **"Agent Codes"** sub-section in Partner Management — list: partner name, type, code, date issued, number of referrals
3. Add ability to regenerate or manually assign a code (if the API supports it)
4. Add the code field as a column in the partner list table for quick reference

---

### ISSUE 7 — No REC Data Export per Facility

**What the client said:**
> "REC data exports per facility" and "export rec data to admin → submit rec data to authority → rec data approved RECs generated"

**What this means:**
Admin needs to view REC (Renewable Energy Certificate) generation data per facility — monthly kWh production, REC count, submission status to authority — and export it in a format suitable for submitting to the authority.

**Plan:**
1. Add a **"REC Data"** tab to the facility detail view: monthly production table (month, kWh, REC count, submission status)
2. Add **"Export REC Data"** button per facility (CSV/Excel download)
3. Add a top-level **"REC Sales Management"** view (already exists as sidebar item — verify if populated or blank)
4. In REC Sales: cross-facility REC summary table with bulk export capability
5. Identify the API endpoints for REC data — if missing, add to `CROSS_REPO_IMPACT.md` as required server endpoints

---

### ISSUE 8 — No Bulk Document Package Export

**What the client said:**
> "All document packages exports"

**What this means:**
After documents are reviewed and approved, the admin must be able to download a complete document package for a facility (all required docs bundled as a ZIP) to transfer to the authority for registration approval.

**Plan:**
1. Add **"Download Document Package"** button on the facility detail page — triggers a ZIP download of all approved documents
2. Add the same button on the partner page (downloads all facility packages for that partner)
3. If the server has a `/api/admin/facilities/:id/document-package` endpoint, wire it up; if not, add it to `CROSS_REPO_IMPACT.md`
4. Add package status indicator: "Package ready" (all docs approved) vs "Package incomplete" (docs pending/rejected)

---

### ISSUE 9 — "Activate System" on Partner Detail Page Makes No Sense

**What the client said:**
> "What even is this activate system doing on a partner detailed page? None of it makes sense…"

**What this means:**
There is an "Activate System" action on the partner detail page that the client does not understand the purpose of. Either the label is wrong, the feature is misplaced, or the logic it triggers does not match the actual business process.

**Plan:**
1. Read `PartnerDetails.jsx` — find the "Activate System" button/section
2. Determine what API call it makes and what it actually does
3. If it activates a facility/generator after registration is complete: rename it to **"Activate Generator"** and move it to the facility detail view (not the partner page)
4. If it is a system-wide toggle that should not exist: remove it
5. In either case, add a confirmation modal with a clear description of what the action does before the admin can proceed

---

### ISSUE 10 — Invitation Flow Not Functional

**What the client said:**
> "If the admin is not functional there is no way we can invite users!"

**What this means:**
The admin must be able to invite partners and customers. The invite flow (sending invitations, tracking accepted/pending invitations) needs to be verified as working end-to-end.

**Plan:**
1. Verify the "Invite Customer" and "New Partner" flows currently in `UserManagement.jsx` and `PartnerManagement.jsx` — confirm the API calls succeed
2. Add an **"Invitations"** tab or section showing all sent invitations with status: pending, accepted, expired
3. Add ability to resend or revoke an invitation
4. Ensure the invitation email actually reaches the recipient (requires testing with the dev API)

---

### ISSUE 11 — Admin Cannot Complete the Full Lifecycle Workflow

**What the client said:**
> "There is a very set process which we cannot complete unless it's visible in the admin view."
> The full chain described: Agent registers → ... → RECs sold → Commission statements → Invoices → Repeat monthly

**What this means:**
The admin portal needs a **workflow visibility layer** — a way to see exactly where every partner/facility is in the process, what the next required action is, and which admin actions are pending.

**Plan:**
1. Add a **"Registration Pipeline"** view (could be under a new sidebar item or within Partner Management)
2. Show each facility as a card/row with its current stage in the workflow:
   - Stage 1: Invited (awaiting acceptance)
   - Stage 2: Registered (awaiting agreement signing)
   - Stage 3: Agreement signed (awaiting authorization)
   - Stage 4: Documents uploaded (awaiting admin review)
   - Stage 5: Documents approved (awaiting authority)
   - Stage 6: Authority approved (generator active)
   - Stage 7: Collecting REC data
3. Admin can click any row to jump directly to the action required at that stage
4. Add summary counts at the top: "3 facilities awaiting document review", "1 facility awaiting authority approval", etc.

---

## Priority Matrix

| # | Issue | Business Impact | Effort | Priority |
|---|---|---|---|---|
| 3 | Document review & download | 🔴 Blocks registration | Medium | **P0** — ✅ Done (approve/reject/view in CommercialDetails & ResidentialDetails) |
| 2 | Facility details in partner view | 🔴 Blocks oversight | Medium | **P0** — ✅ Done (Customers tab + Profile tab added to PartnerDetails) |
| 7 | REC data export | 🔴 Blocks revenue | High | **P0** — ❌ Blocked on server endpoint |
| 5 | Invoice / statement access | 🔴 Blocks payouts | Medium | **P1** — ❌ Blocked on server endpoint |
| 11 | Full lifecycle workflow view | 🟠 Blocks operations | High | **P1** — Pending |
| 1 | Partner details completeness | 🟠 Limits oversight | Low | **P1** — ✅ Done (full rewrite with all fields + referral code) |
| 8 | Document package bulk export | 🟠 Blocks authority submission | Low | **P1** — ❌ Blocked on server endpoint |
| 6 | Agent code management | 🟡 Operational friction | Low | **P2** — ✅ Done (referral code shown with copy button) |
| 9 | "Activate System" confusion | 🟡 UX confusion | Low | **P2** — ✅ Done (removed from partner details entirely) |
| 10 | Invitation flow verification | 🟡 Onboarding risk | Low | **P2** — Pending |
| 4 | Finance Types blank screen | ✅ Already fixed | — | **Done** |

---

## API Research Findings (from dcarbon-server GitHub review)

### Server routes that actually exist

| Route group | Key endpoints available to admin |
|---|---|
| `/api/auth` | utility providers list, login, register |
| `/api/user` | `GET /get-one-user/:id`, `GET /referred-users/:id`, `GET /get-users-referrals/:id` |
| `/api/facility` | `GET /get-all-facilities`, `GET /get-facility-by-id/:id`, `GET /get-energy-production-by-facility/:facilityId`, `GET /get-user-facilities-by-userId/:id` |
| `/api/admin` | facility verify, WREGIS update, document status change, ack upload, agreement re-sign |
| `/api/residential-facility` | `GET /get-user-facilities/:id`, `GET /residential-docs/:facilityId` |
| `/api/webhook`, `/api/contact` | Not relevant to admin UI |

### What's already wired up in the admin frontend

- `CommercialDetails.jsx` — fetches facilities, WREGIS, ack upload, **document approve/reject** (`PUT /api/admin/commercial-facility/:id/document/:type/status`) ✅
- `ResidentialDetails.jsx` — same pattern for residential ✅
- `PartnerDetails.jsx` (partner-management) — rewritten to use `GET /api/user/:email` and `GET /api/user/referred-users/:id` ✅
- `customer-details/PartnerDetails.jsx` — rewritten with `GET /api/user/get-one-user/:id` and referral customers ✅

### What still needs server endpoints (not built yet)

- `GET /api/admin/statements` — commission statements / invoices ❌ server endpoint missing
- `GET /api/admin/rec-data/:facilityId` — REC data export per facility ❌ server endpoint missing
- `GET /api/admin/facilities/:id/document-package` — ZIP download of all approved docs ❌ server endpoint missing
- Bulk agent-code lookup endpoint ❌ server endpoint missing

See `CROSS_REPO_IMPACT.md` for the full server gap analysis.

---

## Next Steps

1. Review and approve this plan with the client
2. Confirm which server endpoints already exist vs need to be built
3. Start with P0 items: document review UI and facility details in partner view
4. Track progress against each issue number above
