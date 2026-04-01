**Project:** dcarbon-server (Express, TypeScript, Prisma, PostgreSQL)
**Branch:** `phillip-fix3` — all changes go here. Push after each fix group.
**Safety:** Do NOT drop tables, change JWT logic, or modify existing response shapes unless specified.

## Context

A thorough code audit of the phillip-fix3 branch found security vulnerabilities, logic bugs, and missing endpoints. The full audit is in `/home/chimdi/Project/d-carbon-admin/MEETING_FEEDBACK_PLAN.md` under "SERVER CODE QUALITY ISSUES". Work through these in order. Build/type-check after each group.

---

## GROUP 1 — CRITICAL Security Fixes (do these first)

### S-BUG-1: SQL Injection in quarterlyStatement.service.ts

**File:** `src/services/quarterlyStatement.service.ts` lines 126-142
**Problem:** `$queryRawUnsafe()` with string-interpolated facilityIds and dates.
**Fix:** Replace with parameterized `$queryRaw` using Prisma's `Prisma.sql` tagged template, or rewrite as a Prisma `findMany()` with proper `where`/`include` clauses. Do NOT use string concatenation for SQL.

### S-BUG-2: Missing verifyToken on commercial facility doc status route

**File:** `src/routes/admin.routes.ts` lines 160-164
**Problem:** `verifyToken` is commented out on the `PUT /commercial-facility/:facilityId/document/:docType/status` route.
**Fix:** Uncomment `verifyToken` and add `verifyAdmin` middleware.

### S-BUG-3: Missing verifyToken on acknowledgement upload route

**File:** `src/routes/admin.routes.ts` lines 179-183
**Problem:** `PUT /update-acknowledgement-of-station-service/:id` has no auth middleware.
**Fix:** Add `verifyToken, verifyAdmin` before the upload middleware.

### S-BUG-4: Missing verifyAdmin on admin creation route

**File:** `src/routes/admin.routes.ts` lines 65-69
**Problem:** `POST /create` has no auth — anyone can create admin accounts.
**Fix:** Add `verifyToken, verifyAdmin` middleware. If this is meant for initial setup, add a comment but still guard it.

---

## GROUP 2 — HIGH Priority Fixes

### S-BUG-5: Missing verifyAdmin on admin invoice list

**File:** `src/routes/quarterlyStatement.routes.ts` lines 39-44
**Problem:** `GET /invoices` (admin list) only has `verifyToken`, not `verifyAdmin`.
**Fix:** Add `verifyAdmin` after `verifyToken`.

### S-BUG-6: Missing user ID authorization on user invoice list

**File:** `src/routes/quarterlyStatement.routes.ts` lines 47-51
**Problem:** `GET /invoices/user/:userId` — any authenticated user can view any other user's invoices.
**Fix:** In the controller, verify `req.user.id === req.params.userId` OR the requester is an admin. If neither, return 403.

### S-BUG-7: Missing state transition validation in approveRecGeneration

**File:** `src/services/recGeneration.service.ts` lines 50-71
**Problem:** Only checks `wregisStatus !== "APPROVED"`. Can approve REJECTED or PENDING_SUBMISSION records.
**Fix:** Add: `if (record.wregisStatus !== "SUBMITTED") throw new BadRequestError("Can only approve records in SUBMITTED status")`

### S-BUG-9: Race condition on double-approve invoice

**File:** `src/services/quarterlyStatement.service.ts` lines 272-316
**Problem:** Check-then-act: reads status, validates PENDING, then updates. Two concurrent requests can both pass the check and create duplicate PayoutRequests.
**Fix:** Use Prisma conditional update:
```typescript
const updatedInvoice = await prisma.quarterlyInvoice.updateMany({
  where: { id: invoiceId, status: "PENDING" },
  data: { status: "APPROVED", reviewedBy: adminId, reviewedAt: new Date() }
});
if (updatedInvoice.count === 0) {
  throw new BadRequestError("Invoice is no longer pending or was already processed");
}
```
Then create the PayoutRequest after the conditional update succeeds.

### S-BUG-10: getAllRevenueWallet returns {} instead of []

**File:** `src/services/wallet.service.ts` lines 19-26
**Problem:** Catch block returns `{}` (object) instead of `[]` (array).
**Fix:** Change `return {}` to `return []`.

### QA-S1: Residential facility doc upload "Unexpected field"

**Problem:** Webapp sends a file with a field name that doesn't match what multer expects in the upload middleware.
**Investigation:** Check `src/middleware/uploadFile.ts` — what field name does `uploadToGCS()` expect for residential facility documents? Then check the admin route that handles residential doc uploads. The field name in the route's `uploadToGCS("fieldName", ...)` must match what the client sends.
**Fix:** Align the field name between client and server.

### CF-7: OTP resend "user not found" during registration

**Problem:** When a new user tries to resend OTP during registration, server returns "user not found" because the user hasn't been created yet (OTP is sent before account creation).
**Investigation:** Check `src/services/auth.service.ts` or `src/services/otp.service.ts` — find the resend OTP function. It likely does `findUnique({ where: { email } })` and throws if null.
**Fix:** The resend OTP flow should work for pre-registration emails. Either:
1. Store the OTP against the email (not userId) in a separate OTP table
2. Or create the user record on initial registration request (before OTP verification)
Investigate which approach fits the current architecture.

---

## GROUP 3 — Missing Endpoints (for admin REC Sales section)

The admin dashboard's REC Sales section calls these endpoints that don't exist. We need to add them:

### 3a: REC Sale CRUD endpoints

These support the admin's ability to manage REC sales (the third step in the REC workflow: generation → approval → sale).

**Endpoints needed:**
1. `GET /api/rec-sale` — List REC sales with pagination + filters (status, date range, buyer)
2. `GET /api/rec-sale/overview/stats` — Aggregate stats: total RECs available, RECs sold, latest REC price
3. `GET /api/rec-sale/price/current` — Current REC price
4. `POST /api/rec-sale/price/set` — Set/update REC price (admin only)
5. `POST /api/rec-sale/create` — Create a new REC sale entry
6. `GET /api/rec-sale/buyers` — List REC buyers
7. `POST /api/rec-sale/buyers` — Create a new buyer
8. `PUT /api/rec-sale/buyers/:id` — Update a buyer

**Check first:** The existing `src/routes/recSale.routes.ts` and `src/services/recSale.service.ts` — some of these may already partially exist. Only add what's missing.

**Prisma models to check:** `RecSale`, `RecBuyer`, `RecPrice` (or similar). If these models don't exist in schema.prisma, you'll need to add them with a migration.

### 3b: Partner performance aggregation endpoint

**Endpoint:** `GET /api/admin/partner-performance`
**Returns:** For each active partner: companyName, partnerType, totalReferrals, totalFacilities (approved/registered), totalRecsGenerated, dateJoined
**Source:** Aggregate from User (PARTNER type) + their referrals + facilities + REC generation data.
**Route:** Add to `src/routes/admin.routes.ts` with `verifyToken, verifyAdmin`.

### 3c: Get-one-residential-user endpoint

**Endpoint:** `GET /api/admin/residential-customer/:email`
**Returns:** Residential user details similar to `GET /api/admin/customer/:email` (which returns commercial details). Include: user data, facilities, documentation, utility auth, agreements.
**Why:** The webapp's residential owner details page shows "-" because there's no endpoint to get full residential user data.
**Route:** Add to `src/routes/admin.routes.ts` with `verifyToken`.

---

## GROUP 4 — Validation Hardening (if time permits)

| # | File | Fix |
|---|------|-----|
| S-BUG-8 | recGeneration.service.ts:104-129 | Add upper bound check on adjustedAmount (e.g., cannot exceed 2x original recsGenerated) |
| S-BUG-11 | recGeneration.service.ts:135-149 | Return failed IDs in bulk approve: `{ succeeded, failed, total, failedIds, errors: [{ id, message }] }` |
| S-BUG-12 | reports.service.ts:25-271 | Validate month is 1-12, year is reasonable (2020-2030), limit max 500 |
| S-BUG-13 | reports.service.ts:228-232 | Validate date strings: `if (startDate && isNaN(new Date(startDate).getTime())) throw BadRequestError` |
| S-BUG-14 | quarterlyStatement.service.ts:318-346 | Validate rejectionReason is non-empty: `if (!rejectionReason?.trim()) throw BadRequestError` |
| S-BUG-15 | newPayout.service.ts:82-89 | Validate partnerInvoiceAmount is a valid number before using |
| S-BUG-16 | wallet.service.ts:54-77 | Validate amount > 0 in creditWallet |
| S-BUG-17 | wallet.service.ts:101-119 | Validate pendingPayout >= amount in finalizePayout |
| S-BUG-18 | admin.service.ts:1960 | Normalize commercial doc status: add `.toUpperCase()` to match residential pattern |
| S-BUG-19 | admin.controller.ts:680 | Add 30s timeout + 50MB Content-Length limit to proxyDocument axios call |

## GROUP 5 — Agreement Template Management Endpoints

The admin dashboard needs to manage agreement content per user type. Add a new `AgreementTemplate` model and CRUD endpoints.

### 5a: Prisma model

Add to `prisma/schema.prisma`:
```prisma
model AgreementTemplate {
  id        String   @id @default(uuid())
  userType  String   @unique // RESIDENTIAL, COMMERCIAL, EPC_PARTNER, SALES_AGENT, FINANCE_PARTNER, OPERATOR
  title     String
  content   String   @db.Text
  version   String   @default("1.0")
  status    String   @default("DRAFT") // DRAFT, PUBLISHED
  updatedBy String?  // admin userId who last updated
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("agreement_templates")
}
```

Run migration: `npx prisma migrate dev --name add_agreement_templates`

### 5b: Endpoints

Add to `src/routes/admin.routes.ts` (all require `verifyToken, verifyAdmin`):

1. `GET /api/admin/agreement-templates` — List all agreement templates
2. `POST /api/admin/agreement-templates` — Create a new template (body: `{ userType, title, content, version, status }`)
3. `PUT /api/admin/agreement-templates/:id` — Update existing template
4. `GET /api/admin/agreement-templates/:userType` — Get template by user type (used by webapp during registration to show the correct agreement)

The GET by userType endpoint should also work without admin auth (just `verifyToken`) since the webapp needs it during registration.

### 5c: Document Configuration Endpoints (for Document Checklist feature)

Add a new `DocumentConfig` model:
```prisma
model DocumentConfig {
  id            String   @id @default(uuid())
  userType      String   // RESIDENTIAL, COMMERCIAL, EPC_PARTNER, SALES_AGENT, FINANCE_PARTNER, OPERATOR
  facilityType  String?  // Optional: for facility-type-specific docs
  docKey        String   // e.g., "interconnectionAgreement", "meterIdPhoto", etc.
  docName       String   // Human-readable: "Interconnection Agreement"
  required      Boolean  @default(true)
  adminOnly     Boolean  @default(false) // e.g., Acknowledgement of Station Service
  downloadable  Boolean  @default(false) // e.g., Assignment of Registration Rights (user downloads, signs, re-uploads)
  description   String?
  sortOrder     Int      @default(0)
  conditions    Json?    // Optional JSON for conditional logic (e.g., { "mode": "EPC_ASSISTED", "required": false })
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@unique([userType, docKey])
  @@map("document_configs")
}
```

Endpoints (all `verifyToken, verifyAdmin` except GET by userType):

1. `GET /api/admin/document-configs` — List all document configs (admin)
2. `GET /api/admin/document-configs/:userType` — Get required docs for a user type (also usable by webapp)
3. `POST /api/admin/document-configs` — Create a document config
4. `PUT /api/admin/document-configs/:id` — Update a document config
5. `DELETE /api/admin/document-configs/:id` — Delete a document config

---

## Execution Order

```
GROUP 1 (critical security) → GROUP 2 (high priority) → GROUP 3 (missing endpoints) → GROUP 4 (validation) → GROUP 5 (agreement + doc config)
```

Build after each group. Commit and push to `phillip-fix3`.
