# DCarbon — Cross-Repo Integration Impact Document

**Date:** 2026-03-13
**Branch:** `phillip-fix1` (admin), `main` (webapp + server)
**Method:** Live analysis of all three repos via GitHub API

---

## Executive Summary

After reading the actual source code of all three repos, **four critical integration bugs** were discovered that will prevent the admin app from functioning at all in production, regardless of the UI/UX fixes already made. These must be resolved before any other work can be considered complete.

---

## Critical Bugs (System Breaking)

### BUG-1: Admin login endpoint does not exist on the server

**Severity: CRITICAL — Admin login is broken end-to-end**

| Repo | State |
|---|---|
| `dcarbon-admin` | Calls `POST /api/auth/admin/login` |
| `dcarbon-server` | Only has `POST /api/auth/login` — `/api/auth/admin/login` returns **404** |

The server's `src/routes/index.routes.ts` mounts only these route groups:
```
/api/auth    → auth.routes.ts
/api/user    → user.routes.ts
/api/facility → facility.routes.ts
/api/webhook → webhook.routes.ts
/api/contact → contact.routes.ts
```
There is no `/api/admin` route group and no `/api/auth/admin/login` endpoint.

**Fix required in `dcarbon-server`:**
Option A (Recommended) — Add a dedicated admin login endpoint:
```ts
// src/routes/auth.routes.ts
router.post("/admin/login", validateRequest(loginValidation), catchAsync(adminLogin));
```
The `adminLogin` controller should verify the user exists, check password, and validate that `user.userType === 'ADMIN'` (see BUG-3 below for the `role` vs `userType` issue) before issuing a token.

Option B — If admin uses the same login flow as regular users, update `dcarbon-admin` `LoginCard.jsx` line with the URL to call `/api/auth/login` instead of `/api/auth/admin/login`. But this is not recommended as it means any user type can log in to the admin panel.

---

### BUG-2: Server returns 422 for invalid/expired tokens — admin's 401 interceptor never fires

**Severity: CRITICAL — Session expiry handling is broken**

| Repo | State |
|---|---|
| `dcarbon-admin` | `axiosInstance.js` intercepts **401** to clear session + redirect |
| `dcarbon-server` | `verifyToken` middleware throws `ValidationError` → **422** Unprocessable Entity |

The server's `src/middleware/auth.ts`:
```ts
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "") as JWTPayload;
  req.user = decoded;
  next();
} catch (error) {
  throw new ValidationError("Invalid or expired token"); // → 422, NOT 401
}
```

`ValidationError` extends `AppError` with `statusCode: 422` (confirmed in `src/helpers/errors.ts`).

Result: When a user's token expires, every API call returns `422`. The admin's axios interceptor only catches `401`, so it silently fails — the user stays on the page with broken data and is never redirected to login.

**Fix required in `dcarbon-server`:**
Create a new `UnauthorizedError` class that returns 401:
```ts
// src/helpers/errors.ts
export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401);
  }
}
```
Update `src/middleware/auth.ts`:
```ts
import { UnauthorizedError } from "../helpers/errors";
// ...
} catch (error) {
  throw new UnauthorizedError("Invalid or expired token"); // → 401
}
```

> **Note for `dcarbon-webapp`:** The webapp has no global 401/422 interceptor at all (every API call is a direct `axios.post`/`fetch` with no shared error handling). Once the server returns 401 consistently, the webapp should also add a global interceptor.

---

### BUG-3: User model has no `role` field — admin role guard is bypassed

**Severity: CRITICAL — Any user can access the admin dashboard**

| Repo | State |
|---|---|
| `dcarbon-admin` | Auth guard checks `localStorage.getItem('userRole') !== 'ADMIN'` |
| `dcarbon-server` | `User` model has **no `role` field** — only `userType` (RESIDENTIAL/COMMERCIAL/PARTNER) |

The Prisma `User` model (`prisma/schema.prisma`):
```prisma
model User {
  id        String  @id @default(uuid())
  firstName String
  lastName  String
  email     String  @unique
  password  String
  userType  String  @default("RESIDENTIAL") // RESIDENTIAL | COMMERCIAL | PARTNER
  // NO 'role' field exists
  profilePicture String?
  ...
}
```

The login service returns the full user object. The admin app reads `admin.role` to store as `userRole`, but since there is no `role` field, it stores an empty string `""`.

The auth guard:
```js
const userRole = localStorage.getItem('userRole'); // always ""
if (userRole && userRole !== 'ADMIN') { ... } // "" is falsy → condition never enters
```
The guard is effectively disabled. Any user with a valid token can access the admin panel.

**Fix required in `dcarbon-server`:**
Add an `ADMIN` user type or a separate `role` field to the User model, and seed/create admin accounts:

```prisma
// Option A: add 'ADMIN' as a valid userType value
model User {
  userType String @default("RESIDENTIAL") // RESIDENTIAL | COMMERCIAL | PARTNER | ADMIN
  ...
}
```

Or:
```prisma
// Option B: separate role field
model User {
  role String? // "ADMIN" | null for regular users
  ...
}
```

Then update `AuthService.login` to return this field, and the admin login endpoint to reject non-admin users.

**Fix required in `dcarbon-admin` (after server fix):**
Update `LoginCard.jsx` to read from whichever field the server standardizes on:
```js
// if server uses userType:
localStorage.setItem('userRole', admin.userType || '');
// if server adds separate role field:
localStorage.setItem('userRole', admin.role || '');
```

---

### BUG-4: Most admin API endpoints don't exist on the server

**Severity: CRITICAL — The entire admin dashboard is non-functional**

The admin app calls ~95 unique API endpoints. The server only implements routes for:
`/api/auth`, `/api/user`, `/api/facility`, `/api/webhook`, `/api/contact`

The following endpoint groups called by the admin app **do not exist on the server**:

| Endpoint Group | Admin Calls | Server Status |
|---|---|---|
| `/api/admin/*` | 20+ endpoints (analytics, users, facilities, partners, utility providers) | ❌ Not implemented |
| `/api/commission-structure/*` | 15+ endpoints | ❌ Not implemented |
| `/api/commission-tier/*` | 3 endpoints | ❌ Not implemented |
| `/api/commission-contract-terms/*` | 3 endpoints | ❌ Not implemented |
| `/api/commission-cron/*` | 2 endpoints | ❌ Not implemented |
| `/api/payout-request/*` | 3 endpoints | ❌ Not implemented |
| `/api/rec/*` | 8 endpoints | ❌ Not implemented |
| `/api/residential-facility/*` | 7 endpoints | ❌ Not implemented |
| `/api/bonus-structure/*` | 3 endpoints | ❌ Not implemented |
| `/api/bonus/*` | 1 endpoint | ❌ Not implemented |
| `/api/utility-auth/*` | 3 endpoints | ❌ Not implemented |
| `/api/faq/*` | 3 endpoints | ❌ Not implemented |
| `/api/feature-suggestion` | 1 endpoint | ❌ Not implemented |

**Fix required in `dcarbon-server`:** These endpoints need to be built. See Section 5 for the full spec of what the admin app expects from each group.

---

## Webapp (`dcarbon-webapp`) Issues Found

These are distinct issues found in the webapp that mirror the admin's pre-fix state, or introduce new problems.

### WEBAPP-1: Hardcoded production URL in TwoFactorAuthentication

**File:** `src/components/(auth)/two-factor-authentication/TwoFactorAuthentication.jsx`

```js
// Current — hardcoded production URL:
const response = await axios.post(
  "https://dcarbon-server.onrender.com/api/auth/verify-2fa-login",
  ...
);
```
The webapp's TwoFactorAuthentication has the production server URL hardcoded directly. If the server URL ever changes, this silently breaks 2FA for all users.

The webapp's `LoginCard.jsx` correctly uses `process.env.NEXT_PUBLIC_API_URL` but the 2FA component bypasses it.

**Fix:** Replace with `process.env.NEXT_PUBLIC_API_URL`:
```js
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const response = await axios.post(`${baseUrl}/api/auth/verify-2fa-login`, ...);
```

**Scan result:** Multiple other webapp components also contain hardcoded `https://dcarbon-server.onrender.com` URLs. The webapp needs the same centralized API base URL treatment the admin received (all 58 files replaced).

### WEBAPP-2: `window.history.back()` in TwoFactorAuthentication

**File:** `src/components/(auth)/two-factor-authentication/TwoFactorAuthentication.jsx:line 138`

```js
<button onClick={() => window.history.back()} className={backArrow}>
```
Same issue as admin's NAV-02 gap. Should use `router.back()` from `next/navigation`.

### WEBAPP-3: Incomplete localStorage keys stored at login and 2FA

**`LoginCard.jsx`** stores: `loginResponse` (blob), `userFirstName`, `userProfilePicture`, `authToken`, `userId`
**`TwoFactorAuthentication.jsx`** stores: `authToken`, `userFirstName`, `userProfilePicture`, `userId`

Both miss: `userLastName`, `userEmail`, `userRole` (or `userType`).

This means any dashboard component that needs `userLastName` or `userEmail` must make a separate API call to get it, instead of reading from localStorage.

**Fix:** After the server's user object is confirmed, store the full set at login and 2FA completion:
```js
localStorage.setItem('authToken', token);
localStorage.setItem('userId', user.id);
localStorage.setItem('userFirstName', user.firstName);
localStorage.setItem('userLastName', user.lastName || '');
localStorage.setItem('userEmail', user.email || '');
localStorage.setItem('userType', user.userType || '');
localStorage.setItem('userProfilePicture', user.profilePicture || '');
```

### WEBAPP-4: `loginResponse` blob still stored at login

**File:** `src/components/(auth)/login/LoginCard.jsx:line 28`

```js
localStorage.setItem('loginResponse', JSON.stringify(response.data));
```
Same pattern as the admin's pre-fix AUTH-02 gap. The full response blob is stored, creating a security risk and a fragile dependency on the response shape staying constant.

**Fix:** Remove the `loginResponse` blob store. Rely on the individual keys listed in WEBAPP-3.

### WEBAPP-5: No global axios interceptor for auth errors

The webapp makes API calls via direct `axios.post`/`fetch` in every component, with no shared error handling. When a token expires:
- `MyAccount.jsx` — silent failure, shows empty profile
- `ChangePasswordModal.jsx` — silent failure
- All facility/dashboard components — silent failure

**Fix:** Create `src/lib/axiosInstance.js` in the webapp (same pattern as admin):
```js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login?reason=session_expired';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```
Then update all API calls in dashboard components to use this instance.

---

## Server (`dcarbon-server`) — Complete Action List

| # | Priority | File | Action |
|---|---|---|---|
| 1 | **CRITICAL** | `src/routes/auth.routes.ts` | Add `POST /admin/login` endpoint with admin-only validation |
| 2 | **CRITICAL** | `src/helpers/errors.ts` | Add `UnauthorizedError` class with `statusCode: 401` |
| 3 | **CRITICAL** | `src/middleware/auth.ts` | Change `throw new ValidationError(...)` → `throw new UnauthorizedError(...)` for token failures |
| 4 | **CRITICAL** | `prisma/schema.prisma` | Add admin user type or `role` field to `User` model; run migration |
| 5 | **CRITICAL** | New controllers/routes | Implement all missing `/api/admin/*`, `/api/commission-structure/*`, `/api/rec/*`, `/api/payout-request/*`, `/api/residential-facility/*`, `/api/utility-auth/*`, `/api/faq/*`, `/api/bonus/*` routes |
| 6 | **HIGH** | `src/services/auth.service.ts` | Admin login service must verify `userType === 'ADMIN'` before issuing token |
| 7 | **MEDIUM** | `src/helpers/validation/auth.validation.ts` | Update password validation: min 8 chars, uppercase, lowercase, number, special char (currently only `min: 6`) |

---

## Webapp (`dcarbon-webapp`) — Complete Action List

| # | Priority | File | Action |
|---|---|---|---|
| 1 | **HIGH** | `src/components/(auth)/two-factor-authentication/TwoFactorAuthentication.jsx` | Replace hardcoded `https://dcarbon-server.onrender.com` URL with `process.env.NEXT_PUBLIC_API_URL` |
| 2 | **HIGH** | All files with hardcoded `dcarbon-server.onrender.com` URLs | Bulk replace with `process.env.NEXT_PUBLIC_API_URL` (same treatment admin received) |
| 3 | **HIGH** | `src/components/(auth)/login/LoginCard.jsx` | Remove `loginResponse` blob; store individual keys (`userId`, `userFirstName`, `userLastName`, `userEmail`, `userType`, `userProfilePicture`, `authToken`) |
| 4 | **HIGH** | `src/components/(auth)/two-factor-authentication/TwoFactorAuthentication.jsx` | Update `routeUser()` to store full set of individual keys (same as LoginCard) |
| 5 | **HIGH** | New file: `src/lib/axiosInstance.js` | Create global axios instance with auth header + 401/422 interceptor → redirect to `/login` |
| 6 | **HIGH** | All dashboard API calls | Migrate from raw `axios`/`fetch` to the shared `axiosInstance` |
| 7 | **MEDIUM** | `src/components/(auth)/two-factor-authentication/TwoFactorAuthentication.jsx:138` | Replace `window.history.back()` with `router.back()` from `next/navigation` |
| 8 | **MEDIUM** | Registration forms | Add client-side password complexity validation (min 8 chars, uppercase, lowercase, number, special char) |

---

## What Does NOT Need to Change

The following changes made in the admin are **internal-only** and have no impact on the webapp or server:

- Modal overlay CSS standardization
- Table styling standardization
- Filter modal styling
- `styles.js` re-export consolidation
- `lucide-react` icon standardization
- `CONFIG.API_BASE_URL` centralization (runtime URL unchanged)
- Client-side role guard addition (backend still validates token independently)

---

## Section 5: Admin API Endpoint Spec (for backend team)

The following is the complete list of endpoints the admin app calls, grouped by domain, with the parameters and expected behavior inferred from the admin source code. The backend team should use this as the implementation spec.

### `/api/admin` group

| Method | Path | Body / Query | Expected Response |
|---|---|---|---|
| POST | `/api/auth/admin/login` | `{ email, password }` | `{ data: { token, admin: { id, firstName, lastName, email, role/userType, profilePicture } } }` |
| GET | `/api/admin/:userId` | — | Admin user object |
| PUT | `/api/admin/:userId` | User fields | Updated admin object |
| POST | `/api/admin/create` | Admin fields | Created admin object |
| GET | `/api/admin/analytics` | — | Dashboard analytics data |
| GET | `/api/admin/get-all-users?page=N&limit=N` | — | Paginated user list |
| GET | `/api/admin/partners?page=N` | — | Paginated partner list |
| GET | `/api/admin/customer/:id` | — | Customer object |
| GET | `/api/admin/customer/:encodedEmail` | — | Customer by email |
| POST | `/api/admin/upload-profile-picture/:userId` | multipart/form-data | Updated profile picture URL |
| GET | `/api/admin/financial-types` | — | List of financial types |
| PUT | `/api/admin/financial-types/:id` | Financial type fields | Updated object |
| DELETE | `/api/admin/financial-types/:id` | — | Success |
| GET | `/api/admin/utility-providers` | — | List of utility providers |
| GET | `/api/admin/utility-provider-requests` | — | Pending utility provider requests |
| PUT/PATCH | `/api/admin/utility-provider-requests/:requestId` | `{ status }` | Updated request |
| GET | `/api/admin/residential-facility/:facilityId` | — | Residential facility object |
| PUT | `/api/admin/residential-facility/:facilityId` | Facility fields | Updated facility |
| GET | `/api/admin/commercial-facility/:facilityId` | — | Commercial facility object |
| PUT | `/api/admin/commercial-facility/:facilityId` | Facility fields | Updated facility |
| PUT | `/api/admin/update-wregis-info/:facilityId` | WREGIS fields | Updated commercial facility |
| PUT | `/api/admin/update-residential-wregis-info/:facilityId` | WREGIS fields | Updated residential facility |
| GET | `/api/admin/residential-docs/acknowledgement-of-station-service/:facilityId` | — | Acknowledgement document |
| PUT | `/api/admin/update-acknowledgement-of-station-service/:facilityId` | Acknowledgement fields | Updated document |
| GET | `/api/admin/meter-records/commercial?page=N` | — | Paginated commercial meter records |
| GET | `/api/admin/meter-records/residential?<params>` | Query params | Paginated residential meter records |
| GET | `/api/admin/ddg/:groupId` | — | DDG group object |

### `/api/residential-facility` group

| Method | Path | Expected Response |
|---|---|---|
| GET | `/api/residential-facility/get-all-residential-facility` | All residential facilities |
| GET | `/api/residential-facility/get-user-facilities/:userId` | Facilities for user |
| GET | `/api/residential-facility/group-facilities` | Grouped facilities list |
| GET | `/api/residential-facility/groups` | All groups |
| GET/PUT | `/api/residential-facility/groups/:groupId` | Single group |
| GET | `/api/residential-facility/residential-docs/:facilityId` | Residential documents |

### `/api/commission-structure` group

| Method | Path | Notes |
|---|---|---|
| GET/POST | `/api/commission-structure` | List or create |
| GET/PUT/DELETE | `/api/commission-structure/:id` | Single entry |
| GET | `/api/commission-structure/modes` | All commission modes |
| GET | `/api/commission-structure/filter/mode-property?mode=<mode>` | Filter by mode |
| GET | `/api/commission-structure/residential` | Residential structure |
| GET | `/api/commission-structure/residential/direct` | Direct residential |
| GET | `/api/commission-structure/residential/partner-finance` | Partner-finance residential |
| GET | `/api/commission-structure/residential/partner-installer` | Partner-installer residential |
| GET | `/api/commission-structure/residential/terms` | Residential terms |
| GET | `/api/commission-structure/commercial` | Commercial structure |
| GET | `/api/commission-structure/commercial/direct` | Direct commercial |
| GET | `/api/commission-structure/commercial/partner-finance` | Partner-finance commercial |
| GET | `/api/commission-structure/commercial/partner-installer` | Partner-installer commercial |
| GET | `/api/commission-structure/commercial/terms` | Commercial terms |
| GET | `/api/commission-structure/epc-assisted` | EPC-assisted structure |
| GET | `/api/commission-structure/sales-agent-account-level` | Sales agent account-level |
| GET | `/api/commission-structure/sales-agent-referral` | Sales agent referral |

### `/api/rec` group

| Method | Path | Notes |
|---|---|---|
| GET | `/api/rec` | All RECs |
| POST | `/api/rec/create` | Create REC |
| GET | `/api/rec/overview/stats` | REC statistics |
| GET | `/api/rec/price/current` | Current price |
| POST/PUT | `/api/rec/price/set` | Set price |
| GET | `/api/rec/statistics?year=<year>` | Stats by year |
| GET | `/api/rec/buyers?page=N` | Paginated buyers |
| GET/PUT | `/api/rec/buyers/:id` | Single buyer |

### `/api/payout-request` group

| Method | Path | Notes |
|---|---|---|
| GET | `/api/payout-request?userId=<id>` | Payouts for user |
| POST/PUT | `/api/payout-request/approve` | Approve payout |
| POST/PUT | `/api/payout-request/reject` | Reject payout |

### Other missing groups

- `GET/POST/PUT/DELETE /api/commission-tier/:id`
- `GET/POST/PUT/DELETE /api/commission-contract-terms/:id`
- `POST /api/commission-cron/trigger`
- `POST /api/commission-cron/sales-agent`
- `GET/POST/PUT/DELETE /api/bonus-structure/:id`
- `POST /api/bonus/trigger-bonus`
- `GET /api/utility-auth/list`
- `POST /api/utility-auth/green-button`
- `DELETE /api/utility-auth/delete/:authId`
- `GET/POST/PUT/DELETE /api/faq/faqs/:id`
- `GET /api/feature-suggestion`

---

*This document was generated from direct source code analysis of all three repos on 2026-03-13. All findings reflect the current state of the `main` branch of `dcarbon-server` and `dcarbon-webapp`, and the `phillip-fix1` branch of `dcarbon-admin`.*
