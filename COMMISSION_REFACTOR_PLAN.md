# Commission Structure UI Refactor — Plan

**Branch:** `phillip-fix2-commission-single-view`
**Scope:** Admin dashboard only (frontend). **No backend changes** until Philip signs off.
**Date:** 2026-04-13

---

## 1. Meeting Summary (interpreted)

Stakeholders: AWE FRANCIS OLAWUMI, Chimdinma Kalu, Udofot (tsx).

### What is wrong today
The admin Commission Structure screen forces the admin to pick a **Property Type** (COMMERCIAL / RESIDENTIAL / ACCOUNT_LEVEL) **and then** a **Commission Mode** from a dropdown (DIRECT_CUSTOMER, REFERRED_CUSTOMER, PARTNER_INSTALLER, PARTNER_FINANCE, EPC_ASSISTED_FINANCE, EPC_ASSISTED_INSTALLER). Only the rows matching that single mode show up, so the admin has to repeatedly switch modes to see or set up the full picture. This makes setting up commissions painful.

### What the team decided
- **Remove the Commission Mode dropdown entirely.**
- Under each Property Type (COMMERCIAL, RESIDENTIAL, ACCOUNT_LEVEL), show **one unified table** that lists **all structure types as rows** (Referred Customer, Direct Customer, Partner Installer, Partner Finance, EPC Assisted Finance, EPC Assisted Installer, etc.).
- Tier columns (Tier 1, Tier 2, …) stay as-is.
- Create, edit (pencil icon on the row), delete, delete-all — all existing behaviors stay.
- Same-share duplicate validation stays (confirmed working).
- Tier-level remainder share logic stays (confirmed correct).
- Contract Terms and Bonus Structure tabs are **out of scope** for this refactor (they already work fine).

### How to deliver (code policy agreed by AWE / Chimdinma)
- **Do not alter existing production code.** Work in a new branch + new files.
- Rename the old component with an `.old` suffix (or comment out its mount point) so the current version is preserved for rollback.
- No backend work until Philip responds.

---

## 2. Files in play

### Existing (to preserve)
- `src/components/dashboard/commission/CommissionStructure.jsx` — parent container with property tabs + mode dropdown.
- `src/components/dashboard/commission/CommissionTable.jsx` — table that renders one mode at a time.
- `src/components/dashboard/commission/CommissionSetupModal.jsx` — create/edit modal (keep as-is, reuse).
- `src/components/dashboard/commission/ManageTiersModal.jsx` — tier management (keep as-is, reuse).
- `src/components/dashboard/commission/ContractTermsTab.jsx` — unchanged.
- `src/components/dashboard/commission/commission/BonusCommissionStructure.jsx` — unchanged.
- `src/components/dashboard/commission/setupModals/BonusCommissionSetup.jsx` — unchanged.

### Mount point
- `src/app/admin-dashboard/page.jsx:11` imports `CommissionStructure` — this is the single switch point.

### Backend endpoints used (confirmed, will not change)
- `GET /api/commission-tier` — tier list.
- `GET /api/commission-structure/modes` — mode enum.
- `GET /api/commission-structure/` — all structures (used for ACCOUNT_LEVEL today).
- `GET /api/commission-structure/filter/mode-property?mode=&property=` — filtered by mode + property (today’s dropdown-driven fetch).
- `DELETE /api/commission-structure/:id`.
- Plus whatever the `CommissionSetupModal` already POSTs/PUTs to.

---

## 3. Proposed file layout (new work)

```
src/components/dashboard/commission/
├── CommissionStructure.jsx            ← OLD — renamed to CommissionStructure.old.jsx
├── CommissionStructure.old.jsx        ← preserved original (renamed copy)
├── CommissionStructure.jsx            ← NEW — single-view container (no mode dropdown)
├── CommissionTable.jsx                ← OLD — renamed to CommissionTable.old.jsx
├── CommissionTable.old.jsx            ← preserved original (renamed copy)
├── CommissionTable.jsx                ← NEW — renders all modes as rows for one property type
└── ... (other files untouched)
```

The mount point in `src/app/admin-dashboard/page.jsx` keeps importing `CommissionStructure` — the rename-swap makes the switch transparent.

---

## 4. Behavior of the NEW components

### New `CommissionStructure.jsx`
- Keep the three top tabs: **Commission Structure | Contract Terms | Bonus Structure** (unchanged).
- Keep the three property-type buttons: **COMMERCIAL | RESIDENTIAL | ACCOUNT_LEVEL**.
- **Remove** the `<select>` for Commission Mode and remove `activeMode` state.
- Replace the property-filtered fetch (`filter/mode-property?mode=&property=`) with a **single fetch of all structures**, filtered client-side by `propertyType`:
  - Fetch `GET /api/commission-structure/` once (already supported by the backend; used today for ACCOUNT_LEVEL).
  - Client-side filter rows by `activePropertyTab`.
  - For ACCOUNT_LEVEL: same logic — filter by `propertyType === "ACCOUNT_LEVEL"`.
- Keep **Create Commission Structure** and **Manage Tiers** buttons exactly as they are. On create, pass `propertyType` only (no default mode) — the setup modal already collects the mode via its own field, so nothing to change there.
- Pass the full list of rows (filtered by property type) to the new `CommissionTable`.

### New `CommissionTable.jsx`
- Input: the same `{ data, tiers, propertyType, onEdit, onDelete }` contract.
- Group rows by `mode` (one row group per mode) instead of by `property_mode` pair — since we’re already scoped to one property type.
- Render **every mode** that has data, plus modes that have no data yet show a placeholder row that says *“No structure yet”* with a Create shortcut (nice-to-have; behind a flag if it slows us down).
- First column becomes **Mode** (e.g., `Referred Customer`, `Direct Customer`, `Partner Installer`, `Partner Finance`, `EPC Assisted Finance`, `EPC Assisted Installer`), not `Property + Mode`.
- Tier columns unchanged — reuse `getShareDisplay(...)` verbatim (it already switches on mode).
- Actions column unchanged (Edit, Delete, Delete All).
- EPC-assisted cross-reference helpers (`findEpcFinanceShare`, `findEpcInstallerShare`, `findPartnerFinanceItem`) stay — they already look within the filtered set.

### What does NOT change
- `CommissionSetupModal.jsx` — keep. The user can still pick mode + tier in the modal when creating a new structure.
- `ManageTiersModal.jsx` — keep.
- `ContractTermsTab.jsx` — keep.
- Bonus Structure sub-tree — keep.
- Validation (no duplicate share values per tier/mode) — lives in the backend + modal, unchanged.
- Remainder share math (tier-based) — lives in `getShareDisplay`, copy verbatim.

---

## 5. Step-by-step execution

1. ✅ Create branch `phillip-fix2-commission-single-view` from `phillip-fix1`. **(done)**
2. Rename `CommissionStructure.jsx` → `CommissionStructure.old.jsx`. Rename `CommissionTable.jsx` → `CommissionTable.old.jsx`. Leave the `.old.jsx` files as-is — nothing imports them.
3. Create new `CommissionStructure.jsx` with the single-view behavior described in §4.
4. Create new `CommissionTable.jsx` with the mode-as-row behavior described in §4.
5. Verify the admin-dashboard mount (`src/app/admin-dashboard/page.jsx:11`) still resolves — it imports `./CommissionStructure` which is now the new file. No change needed there.
6. Smoke-test locally against the dev API:
   - COMMERCIAL tab shows every mode in rows, no dropdown visible.
   - RESIDENTIAL tab shows the same for residential.
   - ACCOUNT_LEVEL tab shows only account-level entries.
   - Tier columns render the same share breakdowns as today.
   - Edit pencil on any row opens the setup modal pre-filled.
   - Create opens the modal with the correct `propertyType`.
   - Delete / Delete All still work.
7. Open a PR titled `feat(admin): single-view commission structure table` against the default base branch. Label “do-not-merge until Philip approves backend scope” so this does not ship ahead of any backend decisions.
8. Share the PR URL with Chimdinma / AWE for review; wait on Philip before any backend request-shape change.

---

## 6. Risks / open questions

- **Data volume.** `GET /api/commission-structure/` returns *all* structures across users/property types. If the list is large, filtering client-side is still fine today but may want a `?property=` server filter later — that is a backend change, so deferred.
- **Empty-mode rows.** Do we want rows for modes that have zero structures set up yet (to act as a "Create" prompt), or only rows with data? The meeting did not spell this out. **Default: only rows with data**, with an empty-state message + CTA when the table is empty. Revisit with design.
- **ACCOUNT_LEVEL modes.** ACCOUNT_LEVEL uses a different mode set (sales-agent modes). The new table handles this naturally since modes come from the data itself, but we should confirm with Chimdinma that ACCOUNT_LEVEL is in scope for this change — the meeting only explicitly called out Commercial.
- **Property-type default.** Meeting noted a perceived bug where property type looked like it was defaulting to residential under commercial view; that turned out to be a misread of the UI. No code change needed, but the new layout should visually make the active property type obvious (keep the teal background on the active button as today).

---

## 7. Meeting → code traceability

| Meeting beat | Code action |
|---|---|
| “Eliminate commission mode dropdown” (00:01:24) | Remove `activeMode` + `<select>` in new `CommissionStructure.jsx`. |
| “All structure types in a single table … each type occupies its own row” (00:01:24) | New `CommissionTable.jsx` groups by `mode` only, not `property + mode`. |
| “Create the new interface in a separate branch and file” (00:01:24, 00:02:50) | New branch `phillip-fix2-commission-single-view`; new sibling files. |
| “Rename old file with ‘old’ or comment out the link” (00:02:09) | Rename originals to `*.old.jsx`. |
| “Create flow stays; edit from the table row” (00:03:45) | Keep existing `CommissionSetupModal` + pencil-icon handler. |
| “System prevents two values for same share — keep” (00:05:09) | Do not touch validation; do not touch the modal. |
| “Remainder share distribution is tier-based — keep” (00:09:37) | Reuse `getShareDisplay` math verbatim. |
| “No backend changes until Philip responds” (00:12:50) | Frontend-only PR; no endpoint changes; client-side filtering. |
