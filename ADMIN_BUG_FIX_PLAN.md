# DCarbon Admin — QA Bug Verification & Fix Plan
> Source: QA_BUG_TRIAGE.md — March 18, 2026
> Scope: Admin-only issues (ADMIN-01 through ADMIN-04)
> Verified against actual source code — full file reads completed
> Updated: March 18, 2026

---

## Verification Summary

| Issue | QA Report | Verdict After Code Read | Admin Code Fix Needed |
|---|---|---|---|
| ADMIN-01 | Pipeline doesn't show company name | ⚠️ Display code is **already written correctly** — blocked by endpoint path mismatch with SERVER-03 | ❌ No code change — server confirmation needed |
| ADMIN-02 | Details page missing company/business name | ✅ **CONFIRMED BUG** — `CommercialDetails.jsx` customer info card only renders `customer.name` with label "Name"; `companyName` and `ownerFullName` fields are never displayed anywhere | ✅ Code fix required |
| ADMIN-03 | Partner click from pipeline → blank page | ✅ **CONFIRMED BUG** — `renderCustomerDetails()` switch has no PARTNER case → `default: return null` → blank screen | ✅ Code fix required |
| ADMIN-04 | User Management list doesn't show company names | ⚠️ Display code is **already written correctly** — same endpoint path mismatch risk as ADMIN-01 | ❌ No code change — server confirmation needed |

---

## Detailed Findings Per Issue

---

### ADMIN-01 | Registration Pipeline — Company Name Display
**QA Report:** *"Commercial customers company/business name are not displayed on the Registration Pipeline"*

#### Code Evidence

**Endpoint called (line 192 in RegistrationPipeline.jsx):**
```js
`${CONFIG.API_BASE_URL}/api/admin/get-all-users?page=${p}&limit=${PAGE_SIZE}`
```

**Display logic (lines 382–389 in RegistrationPipeline.jsx) — already written:**
```jsx
{customer.userType === "COMMERCIAL" && customer.companyName ? (
  <div>
    <p className="text-sm font-semibold">{customer.companyName}</p>   // ← primary
    <p className="text-xs text-gray-400">{customer.name}</p>           // ← secondary
  </div>
) : (
  <span className="text-sm font-medium">{customer.name || "—"}</span>
)}
```

**Search already includes company name (line 226):**
```js
(c.companyName || "").toLowerCase().includes(q)
```

**Column header already reads "Name / Company" (line 360).**

#### Why it's still broken

The display logic is **100% correct and complete** — but the condition `customer.companyName` will be `null` / `undefined` until the server returns it.

SERVER-03 says it patched `GET /api/admin/users`. The admin app calls `GET /api/admin/get-all-users`. **These are different route paths.** If the server only updated the `users` handler, `get-all-users` still returns `companyName: null` → the condition is falsy → falls through to just `customer.name`.

#### What needs to happen

**Server team:** Confirm whether `/api/admin/get-all-users` and `/api/admin/users` call the same underlying `getAllUsers()` service method. If they are separate route handlers, apply the SERVER-03 `companyName` + `ownerFullName` select to `get-all-users` as well.

**Admin code:** Zero changes needed. The display code is complete and will activate automatically.

---

### ADMIN-02 | Commercial User Details Page — Company Name Missing
**QA Report:** *"The information is also not displayed on the details page"*

#### Code Evidence

**The Customer Information card (lines 675–713 in CommercialDetails.jsx):**
```jsx
<div className="border border-gray-200 rounded-lg bg-[#069B960D] p-6">
  <h3 className="text-lg font-semibold text-[#039994] mb-4">Customer Information</h3>
  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
    <div><p>User ID</p><p>{customer?.id}</p></div>
    <div><p>Name</p><p>{customer?.name}</p></div>          // ← just "Name", no company split
    <div><p>Customer Type</p><p>{customer?.userType}</p></div>
    <div><p>Utility Provider</p><p>{customer?.utility}</p></div>
    <div><p>Finance Company</p><p>{customer?.financeCompany}</p></div>
    <div><p>Address</p><p>{customer?.address}</p></div>
    <div><p>Date Registered</p><p>{formatDate(customer?.date)}</p></div>
    <div><p>Status</p><StatusBadge status={customer?.status} /></div>
  </div>
</div>
```

**Search for `companyName` or `ownerFullName` in CommercialDetails.jsx: zero matches.**

#### Why it's broken

`customer.name` now resolves to the company name for commercial users (post SERVER-03) — so the right value will show in the "Name" row. But:
1. The label still reads `"Name"` not `"Company"` — no visual indication it's a business
2. `ownerFullName` (the individual contact person) is **never shown anywhere** on this page
3. There's no prominent company identity header — the company name is buried in an 8-field grid alongside Utility Provider and Finance Company

**What needs to change in CommercialDetails.jsx:**
- Add a compact identity strip **above** the Customer Information card showing `customer.companyName` (bold, large) + `customer.ownerFullName` (smaller, grey) + a COMMERCIAL badge
- Change the "Name" label in the grid to "Company Name"
- Add an "Owner / Contact" row in the grid for `customer.ownerFullName`

---

### ADMIN-03 | Partner Click from Pipeline → Blank Page
**QA Report:** *"From the registration pipeline, when you click a partner user, I expect to be redirected to their partner details page... but instead I am redirected to a blank page."*

#### Code Evidence

**Step 1 — Pipeline sends ALL user types through the same click handler (lines 174–178 in RegistrationPipeline.jsx):**
```jsx
const handleCustomerClick = (customer) => {
  sessionStorage.setItem("pipelineSelectedCustomer", JSON.stringify(customer));
  router.push("/admin-dashboard?section=userManagement");
  // ↑ No userType check — COMMERCIAL, RESIDENTIAL, PARTNER, INSTALLER all go here
};
```

**Step 2 — UserManagement reads stored customer and goes to "details" view (lines 237–246 in UserManagement.jsx):**
```jsx
const stored = sessionStorage.getItem("pipelineSelectedCustomer");
if (stored) {
  const customer = JSON.parse(stored);
  setSelectedCustomer(customer);
  setCurrentView("details");   // ← renders renderCustomerDetails()
}
```

**Step 3 — `renderCustomerDetails()` has no PARTNER case (lines 483–491 in UserManagement.jsx):**
```jsx
const renderCustomerDetails = () => {
  if (!selectedCustomer) return null;
  switch (selectedCustomer.userType) {
    case "COMMERCIAL":
      return <CommercialDetails customer={selectedCustomer} onBack={handleBackToList} />;
    case "RESIDENTIAL":
      return <ResidentialDetails customer={selectedCustomer} onBack={handleBackToList} />;
    default:
      return null;    // ← PARTNER, SALES_AGENT, INSTALLER, FINANCE_COMPANY → blank screen
  }
};
```

#### What needs to change (2 files)

**Fix A — UserManagement.jsx:**
1. Import `PartnerDetails` (already exists at `./partner-management/PartnerDetails`)
2. Add PARTNER cases to the switch

**Fix B — RegistrationPipeline.jsx:**
- No click handler change needed (partner routes correctly via sessionStorage)
- But we should store `"pipelineReturnSection": "registrationPipeline"` in sessionStorage so that pressing Back after viewing partner details returns to the pipeline, not the Customer Management list

---

### ADMIN-04 | User Management List — Company Names
**QA Report:** *"The user management list pages do not use the Company and Business names where available"*

#### Code Evidence

**Customer list name cell (lines 741–750 in UserManagement.jsx) — already written:**
```jsx
{customer.userType === "COMMERCIAL" && customer.companyName ? (
  <div>
    <p className="text-sm font-semibold truncate max-w-[160px]">{customer.companyName}</p>
    <p className="text-xs text-gray-400 truncate max-w-[160px]">{customer.name}</p>
  </div>
) : (
  <span className="text-sm truncate max-w-[140px] block">{customer.name || "—"}</span>
)}
```

**Column header already reads "Name / Company" (line 724).**

#### Why it's still broken

Same root cause as ADMIN-01: `UserManagement.jsx` fetches from `/api/admin/get-all-users?page=...` (line 73). Same endpoint path mismatch. `customer.companyName` is `null` → falls through to plain `customer.name`.

**Partner Management section** (`PartnerManagement.jsx`): Partners come from `/api/admin/partners` (a different endpoint) and render `{partner.name}` directly — since `Partner.name` is the organization/company name in the DB schema, this is likely already correct.

#### What needs to happen

**Server team:** Same as ADMIN-01 — confirm `get-all-users` receives the same `companyName` + `ownerFullName` fields as `users`.

**Admin code:** Zero changes needed. Display code is complete.

---

## Fix Plan

### Priority Order

| # | Fix ID | Description | File | Type | Urgency |
|---|---|---|---|---|---|
| 1 | ADMIN-03-A | Add `PartnerDetails` import + PARTNER cases to `renderCustomerDetails()` | `UserManagement.jsx` | Code — 10 lines | 🔴 HIGH — blank page |
| 2 | ADMIN-03-B | Store return-to-pipeline marker in sessionStorage on partner click | `RegistrationPipeline.jsx` | Code — 5 lines | 🟠 HIGH — UX |
| 3 | ADMIN-02 | Add company identity strip + update info grid labels in commercial details | `CommercialDetails.jsx` | Code — 30 lines | 🟡 MEDIUM |
| 4 | ADMIN-01 / ADMIN-04 | Confirm server endpoint `get-all-users` returns `companyName` | Server team check | No code | 🟡 MEDIUM |

---

## Code Changes

---

### Fix 1 — ADMIN-03-A: UserManagement.jsx

**Add import at top of file** (alongside other detail imports):
```jsx
import PartnerDetails from "./partner-management/PartnerDetails";
```

**Update `renderCustomerDetails()`:**
```jsx
const renderCustomerDetails = () => {
  if (!selectedCustomer) return null;
  switch (selectedCustomer.userType) {
    case "COMMERCIAL":
      return <CommercialDetails customer={selectedCustomer} onBack={handleBackToList} />;
    case "RESIDENTIAL":
      return <ResidentialDetails customer={selectedCustomer} onBack={handleBackToList} />;
    case "PARTNER":
    case "SALES_AGENT":
    case "INSTALLER":
    case "FINANCE_COMPANY":
      return (
        <PartnerDetails
          partner={{ ...selectedCustomer, email: selectedCustomer.email }}
          onBack={handleBackToList}
        />
      );
    default:
      return null;
  }
};
```

---

### Fix 2 — ADMIN-03-B: RegistrationPipeline.jsx

**Update `handleCustomerClick()`** to tag partner navigations so the back button returns to the pipeline:
```jsx
const handleCustomerClick = (customer) => {
  const isPartnerType = ["PARTNER", "SALES_AGENT", "INSTALLER", "FINANCE_COMPANY"]
    .includes(customer.userType);
  sessionStorage.setItem("pipelineSelectedCustomer", JSON.stringify(customer));
  if (isPartnerType) {
    sessionStorage.setItem("pipelineReturnSection", "registrationPipeline");
  }
  router.push("/admin-dashboard?section=userManagement");
};
```

**In `UserManagement.jsx` `handleBackToList()`** — check for the return marker:
```jsx
const handleBackToList = () => {
  setSelectedCustomer(null);
  const returnSection = sessionStorage.getItem("pipelineReturnSection");
  if (returnSection === "registrationPipeline") {
    sessionStorage.removeItem("pipelineReturnSection");
    router.push("/admin-dashboard?section=registrationPipeline");
    return;
  }
  const backTo = previousView || "management";
  setPreviousView(null);
  setCurrentView(backTo);
  if (backTo === "management") fetchCustomers(currentPage);
};
```

> Note: Only add this if the dashboard router supports `section=registrationPipeline` as a URL param. If not, the fallback `setCurrentView("management")` is acceptable and simpler.

---

### Fix 3 — ADMIN-02: CommercialDetails.jsx

**Insert a company identity strip above the Customer Information card (after line 640 — the back button section, before line 642):**

```jsx
{/* Company Identity Strip — ADMIN-02 fix */}
{(customer?.companyName || customer?.name) && (
  <div className="border border-gray-200 rounded-lg px-4 py-3 mb-5 bg-white flex items-start justify-between w-full max-w-7xl">
    <div>
      <p className="text-base font-bold text-[#1E1E1E] font-sfpro leading-tight">
        {customer.companyName || customer.name}
      </p>
      {customer.ownerFullName && (
        <p className="text-xs text-gray-400 font-sfpro mt-0.5">
          Contact: {customer.ownerFullName}
        </p>
      )}
    </div>
    <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-sfpro flex-shrink-0 ml-4">
      COMMERCIAL
    </span>
  </div>
)}
```

**Update the Customer Information grid** — change "Name" label to "Company Name" and add "Owner / Contact" row:

```jsx
// Change line 683 from:
<p className={labelClass}>Name</p>
<p className="font-medium">{customer?.name || "Not specified"}</p>

// To:
<p className={labelClass}>Company Name</p>
<p className="font-medium">{customer?.companyName || customer?.name || "Not specified"}</p>
```

```jsx
// Add after the Name row (after line 685):
{customer?.ownerFullName && (
  <div className="space-y-1">
    <p className={labelClass}>Owner / Contact</p>
    <p className="font-medium">{customer.ownerFullName}</p>
  </div>
)}
```

---

### Fix 4 — ADMIN-01 / ADMIN-04: Server Endpoint Confirmation

**Message for server team:**

> Both `RegistrationPipeline.jsx` and `UserManagement.jsx` in the admin app call `GET /api/admin/get-all-users` (not `GET /api/admin/users`). SERVER-03 patched `getAllUsers()` which you described as powering `/api/admin/users`. Please confirm:
>
> 1. Does `GET /api/admin/get-all-users` use the same `getAllUsers()` service method?
> 2. If not — please apply the same `companyName` + `ownerFullName` Prisma select and display name resolution logic to the `get-all-users` route handler.
>
> No admin code changes are needed — the display logic in both files is complete and will activate as soon as the fields appear in the response.

---

## Files to Change

| File | Change | Estimated lines |
|---|---|---|
| [UserManagement.jsx](src/components/dashboard/user-management/UserManagement.jsx) | Add `PartnerDetails` import; add PARTNER cases in `renderCustomerDetails()`; update `handleBackToList()` | +20 lines |
| [RegistrationPipeline.jsx](src/components/dashboard/registration-pipeline/RegistrationPipeline.jsx) | Tag partner clicks with sessionStorage return-section marker | +6 lines |
| [CommercialDetails.jsx](src/components/dashboard/user-management/customer-details/commercial-details/CommercialDetails.jsx) | Add company identity strip above info card; rename "Name" label; add `ownerFullName` row | +25 lines |

**No changes needed to:**
- `RegistrationPipeline.jsx` company name display logic (already complete)
- `UserManagement.jsx` list name cell (already complete)
- Any API call / endpoint URL (endpoint confirmation is server-side only)

---

## Expected State After Fixes

| Issue | After Fix |
|---|---|
| ADMIN-01 | Company name shows as primary bold text in pipeline once server confirms `get-all-users` returns `companyName` |
| ADMIN-02 | Commercial details page shows company identity strip at top with company name (bold) + owner name (grey) + COMMERCIAL badge; "Name" label renamed; owner row added to info grid |
| ADMIN-03 | Clicking a PARTNER from the pipeline opens their Partner Details page (same view as User Management → Partner Management → click partner); Back button returns to pipeline |
| ADMIN-04 | Company name shows as primary bold text in User Management list once server confirms `get-all-users` returns `companyName` |

---

*Verified: March 18, 2026 | Full code reads: RegistrationPipeline.jsx, UserManagement.jsx, CommercialDetails.jsx, PartnerManagement.jsx, PartnerDetails.jsx*
