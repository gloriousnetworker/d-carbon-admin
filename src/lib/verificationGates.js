/**
 * Client-side preflight for the 5 facility-verification integrity gates the
 * server enforces in dcarbon-server/src/services/facilityVerificationGates.ts
 * (Audit fix #5).
 *
 * The server is the source of truth — these checks just give the admin a
 * preview of what's blocking verification before they click. Two of the
 * server's gates (installerId / financeCompanyId pointing to a User of the
 * right partnerType) require DB lookups; we approximate client-side by
 * checking that the FK is set (truthy + not the legacy "N/A" sentinel).
 *
 * Audit ref: DCARBON_AUDIT.md fix #32, Phase 8.
 */

const isBlank = (v) => v === null || v === undefined || String(v).trim() === "";

const isLegacyNa = (v) =>
  typeof v === "string" && /^(N\/A|n\/a|NA|None|null|NULL)$/.test(v.trim());

const isPresentId = (v) => !isBlank(v) && !isLegacyNa(v);

/**
 * Returns the 5 gates with `ok` flags + a human-readable reason when failing.
 * Always returns all 5 entries (even passing ones) so the UI can render a
 * full checklist with green/red icons.
 *
 * @param {object} facility — the residential or commercial facility row
 * @returns {{ gate: string, label: string, ok: boolean, reason: string }[]}
 */
export const checkFacilityVerificationGates = (facility) => {
  if (!facility) return [];

  const gates = [];

  // Gate 1 — partner FK validity (presence-only on the client)
  // The server additionally verifies the FK points to a real User with the
  // expected partnerType. Here we just flag obviously-missing values.
  const installerOk = isBlank(facility.installerId) || isPresentId(facility.installerId);
  const financeOk = isBlank(facility.financeCompanyId) || isPresentId(facility.financeCompanyId);
  gates.push({
    gate: "partnerIds",
    label: "Partner IDs valid (if set)",
    ok: installerOk && financeOk,
    reason:
      !installerOk && !financeOk
        ? "Installer + Finance Company IDs are invalid sentinels"
        : !installerOk
        ? "Installer ID is an invalid sentinel (e.g. \"N/A\")"
        : !financeOk
        ? "Finance Company ID is an invalid sentinel"
        : "",
  });

  // Gate 2 — systemCapacity > 0
  const cap = Number(facility.systemCapacity);
  gates.push({
    gate: "systemCapacity",
    label: "System capacity set and > 0",
    ok: Number.isFinite(cap) && cap > 0,
    reason: !Number.isFinite(cap) || cap <= 0
      ? "System capacity is required and must be greater than 0"
      : "",
  });

  // Gate 3 — WREGIS info complete
  const wregisFields = [
    { key: "wregisId", label: "WREGIS ID" },
    { key: "rpsId", label: "RPS ID" },
    { key: "eiaPlantId", label: "EIA Plant ID" },
    { key: "commercialOperationDate", label: "Commercial Operation Date" },
  ];
  const wregisMissing = wregisFields.filter((f) => isBlank(facility[f.key]));
  gates.push({
    gate: "wregisInfo",
    label: "WREGIS info complete",
    ok: wregisMissing.length === 0,
    reason: wregisMissing.length === 0
      ? ""
      : `Missing: ${wregisMissing.map((f) => f.label).join(", ")}`,
  });

  // Gate 4 — Facility details (address, zip)
  const detailsMissing = [];
  if (isBlank(facility.address)) detailsMissing.push("Address");
  if (isBlank(facility.zipCode)) detailsMissing.push("Zip Code");
  gates.push({
    gate: "facilityDetails",
    label: "Facility details complete",
    ok: detailsMissing.length === 0,
    reason: detailsMissing.length === 0
      ? ""
      : `Missing: ${detailsMissing.join(", ")}`,
  });

  // Gate 5 — Documents (covered by the existing DocumentsModal flow that
  // already conditionally hides the Verify button until docs are
  // REGULATOR_APPROVED). Surfacing here for visibility — `ok` is
  // optimistically true; the existing pre-flight in DocumentsModal:280
  // is the binding check.
  gates.push({
    gate: "documents",
    label: "Documents approved (admin + WREGIS)",
    ok: true,
    reason: "Document statuses are checked in the Documents modal",
  });

  return gates;
};

/** Convenience — true iff every gate passes. */
export const allGatesPass = (gates) =>
  Array.isArray(gates) && gates.every((g) => g.ok);
