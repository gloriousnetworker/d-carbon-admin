# DCarbon Admin — UI/UX Gap Fix Plan

**Date:** 2026-03-13
**Branch:** phillip-fix1
**Methodology:** For each gap — Implement → Validate → Report → Next

---

## Gap Status Legend
- ✅ RESOLVED — fully fixed and validated
- ⚠️ PARTIAL — fixed as far as possible without backend/infra changes
- ❌ NOT STARTED — pending

---

## Gap Registry

| ID | Category | Priority | Status |
|----|----------|----------|--------|
| AUTH-02 | Security | HIGH | ✅ |
| AUTH-03 | Security | HIGH | ✅ |
| AUTH-05 | Security | MEDIUM | ✅ |
| AUTH-06 | Security | MEDIUM | ✅ |
| AUTH-07 | Security | MEDIUM | ✅ |
| NAV-02 | Navigation | MEDIUM | ✅ |
| NAV-03 | Navigation | MEDIUM | ✅ |
| UI-TABLES | Consistency | MEDIUM | ✅ |
| UI-MODALS | Consistency | MEDIUM | ✅ |
| UI-FILTERS | Consistency | MEDIUM | ✅ |

---

## Confirmed Already Fixed (from prior audit)
- **NAV-01** — URL-based routing via `useSearchParams` ✅
- **NAV-04** — Logout converted to modal overlay ✅
- **NAV-05** — Landing page is now auth-aware redirect ✅

---

## Gap Details & Fix Strategy

### GAP-AUTH-02: Full login response stored in localStorage
**Files:** `LoginCard.jsx:65`, `LoginModal.jsx:25`
**Fix:** Remove `loginResponse` dump. Store only `authToken`, `userId`, `userFirstName`, `userProfilePicture`.

---

### GAP-AUTH-03: No global axios 401 interceptor
**Files:** New file `src/lib/axiosInstance.js`
**Fix:** Create a configured axios instance with request interceptor (attaches token) and response interceptor (handles 401 → redirect to /login with toast). Update all API call files to use this instance.

---

### GAP-AUTH-05: 117 hardcoded API URLs across 58 files
**Fix:** Bulk replace `https://api.dev.dcarbon.solutions` with `CONFIG.API_BASE_URL` using import of `lib/config.js` in each file.

---

### GAP-AUTH-06: Role check only at login, not in auth guard
**File:** `src/app/admin-dashboard/page.jsx`
**Fix:** Read role from stored `loginResponse` → validate `role === 'ADMIN'` in the auth guard `useEffect`. Redirect with error if not admin.

---

### GAP-AUTH-07: Weak password validation (6 chars only)
**File:** `src/components/(auth)/register/RegisterCard.jsx`
**Fix:** Add complexity rules: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character. Update UI hint text.

---

### GAP-NAV-02: `window.history.back()` in TwoFactorAuthentication
**File:** `TwoFactorAuthentication.jsx:154`
**Fix:** Replace with `router.back()` from `next/navigation`.

---

### GAP-NAV-03: Unused `react-router-dom` + orphaned non-admin routes in 2FA
**Files:** `package.json`, `TwoFactorAuthentication.jsx`
**Fix:** Remove `react-router-dom` from `package.json`. Remove non-admin route references from `TwoFactorAuthentication.jsx` (routeUser function routes to commercial/residential dashboards which don't exist in this admin app).

---

### UI-TABLES: Inconsistent table styling across dashboard sections
**Fix:** Audit table components, standardize to consistent `thead`/`tbody` pattern, uniform hover states, action column icons (use `lucide-react` consistently).

---

### UI-MODALS: Inconsistent modal overlays, close mechanisms, button styles
**Fix:** Standardize all modals to: `fixed inset-0 z-50 bg-black/50` overlay, consistent header with title + X close button, consistent action buttons.

---

### UI-FILTERS: Inconsistent filter modal styling and structure
**Fix:** Standardize filter modals to use shared `labelClass`/`inputClass` from `src/components/dashboard/styles.js`.

---

## Execution Order
1. GAP-AUTH-02 (quick win — 2 files)
2. GAP-AUTH-07 (quick win — 1 file)
3. GAP-NAV-02 (quick win — 1 line)
4. GAP-NAV-03 (quick win — package.json + 1 file)
5. GAP-AUTH-03 (new axios instance — foundation for AUTH-05)
6. GAP-AUTH-05 (bulk URL replacement using new axios instance — 58 files)
7. GAP-AUTH-06 (auth guard role check)
8. UI-TABLES (audit + standardize)
9. UI-MODALS (audit + standardize)
10. UI-FILTERS (audit + standardize)
