"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FaPlay, FaPercentage, FaUserTie, FaCalendarAlt, FaRedo, FaSearch, FaHeartbeat } from "react-icons/fa";
import CONFIG from "@/lib/config";

const thisYear = new Date().getFullYear();
const thisQuarter = Math.floor((new Date().getMonth() + 3) / 3);

const CalculationTriggers = () => {
  const [loading, setLoading] = useState("");
  const [activeModal, setActiveModal] = useState(null);
  // Health check is read-only and rendered inline in its own modal — keep its
  // result separate from the form params used by the trigger modals.
  const [healthData, setHealthData] = useState(null);

  const [quarterParams, setQuarterParams] = useState({ year: thisYear, quarter: thisQuarter });
  const [annualParams, setAnnualParams] = useState({ year: thisYear });
  const [facilityParams, setFacilityParams] = useState({ facilityId: "", facilityType: "RESIDENTIAL" });
  const [catchupParams, setCatchupParams] = useState({
    since: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    until: new Date().toISOString().slice(0, 10),
  });

  const authHeaders = () => {
    const authToken = localStorage.getItem("authToken");
    return { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` };
  };

  const post = async (key, path, body, successMsg) => {
    try {
      setLoading(key);
      const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Request failed");
      }
      toast.success(successMsg, { position: "top-center", duration: 4000 });
      setActiveModal(null);
    } catch (err) {
      toast.error(`Error: ${err.message}`, { position: "top-center", duration: 5000 });
    } finally {
      setLoading("");
    }
  };

  // --- Commission (unchanged behaviour) ---
  const triggerCommission = () =>
    post(
      "commission",
      "/api/commission-cron/trigger",
      { year: thisYear, quarter: thisQuarter },
      "Quarterly commission triggered; sales-agent commission will resolve 2 days later"
    );

  // Sales-agent COMMISSION (meta-commission on referred partners). NOT a bonus.
  const triggerSalesAgentCommission = () =>
    post(
      "sac",
      "/api/commission-cron/sales-agent",
      {},
      "Sales-agent commission resolution started"
    );

  // --- Bonus runners (Francis's bonus-refactoring branch) ---
  const triggerPartnerQuarterBonus = () =>
    post(
      "pqb",
      "/api/bonus/trigger-bonus",
      quarterParams,
      `Partner quarterly bonus (1a/1b/1d/1e) triggered for Q${quarterParams.quarter} ${quarterParams.year}`
    );

  const triggerPartnerAnnualBonus = () =>
    post(
      "pab",
      "/api/bonus/trigger-annual",
      annualParams,
      `Partner annual bonus (1c/1f) triggered for ${annualParams.year}`
    );

  const triggerFacilityBonus = () => {
    if (!facilityParams.facilityId) {
      toast.error("Facility ID is required", { position: "top-center" });
      return;
    }
    post(
      "fb",
      "/api/bonus/trigger-facility",
      facilityParams,
      `Facility bonus (2a/2b/3a) queued for ${facilityParams.facilityType} ${facilityParams.facilityId}`
    );
  };

  const catchupFacilities = () =>
    post(
      "cu",
      "/api/bonus/catchup-facility",
      {
        since: new Date(catchupParams.since).toISOString(),
        until: new Date(catchupParams.until).toISOString(),
      },
      `Catchup scan running from ${catchupParams.since} to ${catchupParams.until}`
    );

  // GET /api/bonus/health-check — read-only diagnostic, opens a modal with the
  // result. Verdict is "READY" when nothing is blocking bonuses, "BLOCKED"
  // with admin-friendly reasons otherwise.
  const fetchBonusHealth = async () => {
    try {
      setLoading("health");
      setHealthData(null);
      setActiveModal("health");
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/bonus/health-check`, {
        method: "GET",
        headers: authHeaders(),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Health check failed");
      setHealthData(result.data ?? result);
    } catch (err) {
      toast.error(`Health check error: ${err.message}`, { position: "top-center", duration: 5000 });
      setActiveModal(null);
    } finally {
      setLoading("");
    }
  };

  const btn = (label, icon, onClick, color, busy) => (
    <button
      onClick={onClick}
      disabled={!!loading}
      className={`px-4 py-2 text-white rounded-md disabled:opacity-50 flex items-center space-x-2 text-xs font-medium ${color}`}
      title={label}
    >
      {icon}
      <span>{busy ? "Working..." : label}</span>
    </button>
  );

  const modalShell = (title, children, onSubmit, submitLabel, busyKey) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setActiveModal(null)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={loading === busyKey}
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884] disabled:opacity-50"
          >
            {loading === busyKey ? "Triggering..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Commission triggers */}
        {btn("Trigger Commission", <FaPlay size={12} />, triggerCommission, "bg-[#039994] hover:bg-[#028884]", loading === "commission")}
        {btn("Sales Agent Commission", <FaUserTie size={12} />, triggerSalesAgentCommission, "bg-blue-600 hover:bg-blue-700", loading === "sac")}

        {/* Bonus triggers */}
        {btn("Partner Quarterly Bonus (1a/1b/1d/1e)", <FaPercentage size={12} />, () => setActiveModal("quarterly"), "bg-orange-600 hover:bg-orange-700")}
        {btn("Partner Annual Bonus (1c/1f)", <FaCalendarAlt size={12} />, () => setActiveModal("annual"), "bg-purple-600 hover:bg-purple-700")}
        {btn("Replay Facility Bonus (2a/2b/3a)", <FaRedo size={12} />, () => setActiveModal("facility"), "bg-teal-600 hover:bg-teal-700")}
        {btn("Facility Bonus Catchup Scan", <FaSearch size={12} />, () => setActiveModal("catchup"), "bg-gray-600 hover:bg-gray-700")}
        {btn("Bonus Health Check", <FaHeartbeat size={12} />, fetchBonusHealth, "bg-rose-600 hover:bg-rose-700", loading === "health")}
      </div>

      {activeModal === "quarterly" &&
        modalShell(
          "Trigger Partner Quarterly Bonus",
          <>
            <p className="text-xs text-gray-500">
              Fires bonus types <strong>1a, 1b, 1d, 1e</strong> for the selected quarter. Does not affect 1c/1f (annual) or 2a/2b/3a (event-driven).
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={quarterParams.year}
                onChange={(e) => setQuarterParams((p) => ({ ...p, year: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                min="2020" max="2030"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
              <select
                value={quarterParams.quarter}
                onChange={(e) => setQuarterParams((p) => ({ ...p, quarter: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              >
                <option value={1}>Q1 (Jan–Mar)</option>
                <option value={2}>Q2 (Apr–Jun)</option>
                <option value={3}>Q3 (Jul–Sep)</option>
                <option value={4}>Q4 (Oct–Dec)</option>
              </select>
            </div>
          </>,
          triggerPartnerQuarterBonus,
          "Trigger Quarterly",
          "pqb"
        )}

      {activeModal === "annual" &&
        modalShell(
          "Trigger Partner Annual Bonus",
          <>
            <p className="text-xs text-gray-500">
              Fires bonus types <strong>1c (universal &gt;25 MW)</strong> and <strong>1f (EPC finance &gt;25 MW)</strong> for the selected year.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={annualParams.year}
                onChange={(e) => setAnnualParams({ year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                min="2020" max="2030"
              />
            </div>
          </>,
          triggerPartnerAnnualBonus,
          "Trigger Annual",
          "pab"
        )}

      {activeModal === "facility" &&
        modalShell(
          "Replay Facility Bonus",
          <>
            <p className="text-xs text-gray-500">
              Re-queues the event-driven facility bonus (<strong>2a/2b/3a</strong>) for a single facility. Use when a WREGIS approval predates the event hook or after a config fix. Idempotent — paying twice is prevented by Bonus.uniqueKey.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility ID</label>
              <input
                type="text"
                value={facilityParams.facilityId}
                onChange={(e) => setFacilityParams((p) => ({ ...p, facilityId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
                placeholder="facility-uuid"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facility Type</label>
              <select
                value={facilityParams.facilityType}
                onChange={(e) => setFacilityParams((p) => ({ ...p, facilityType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              >
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>
          </>,
          triggerFacilityBonus,
          "Replay",
          "fb"
        )}

      {activeModal === "catchup" &&
        modalShell(
          "Facility Bonus Catchup Scan",
          <>
            <p className="text-xs text-gray-500">
              Scans WREGIS-approved facilities in the window and enqueues any that haven't been paid yet. Safety net for missed event hooks.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input
                type="date"
                value={catchupParams.since}
                onChange={(e) => setCatchupParams((p) => ({ ...p, since: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input
                type="date"
                value={catchupParams.until}
                onChange={(e) => setCatchupParams((p) => ({ ...p, until: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
          </>,
          catchupFacilities,
          "Run Catchup",
          "cu"
        )}

      {activeModal === "health" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaHeartbeat className="text-rose-600" /> Bonus Health Check
              </h3>
              <button
                onClick={() => { setActiveModal(null); setHealthData(null); }}
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {!healthData ? (
              <div className="text-sm text-gray-500 py-6 text-center">Loading diagnostic…</div>
            ) : (
              <div className="space-y-5 text-sm">
                {/* Verdict banner */}
                <div className={`p-3 rounded-md border ${
                  healthData.verdict === "READY"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}>
                  <div className="font-semibold">
                    {healthData.verdict === "READY" ? "✓ READY — bonuses can fire" : "⚠ BLOCKED — see reasons below"}
                  </div>
                  {healthData.reasons?.length > 0 && (
                    <ul className="mt-2 space-y-1 list-disc pl-5 text-xs">
                      {healthData.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* BonusStructure coverage */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">BonusStructure coverage</h4>
                  <div className="text-xs text-gray-600 mb-2">
                    {healthData.bonusStructure?.totalActive ?? 0} active rows total.
                    {healthData.bonusStructure?.missingActiveForType?.length > 0 && (
                      <span className="text-rose-600">
                        {" "}Missing for: {healthData.bonusStructure.missingActiveForType.join(", ")}
                      </span>
                    )}
                  </div>

                  {/* Configured values per bonusType — read-only audit so admin can
                      verify threshold + percent/flatValue without leaving modal. */}
                  <div className="space-y-2">
                    {Object.entries(healthData.bonusStructure?.byType || {}).map(([type, c]) => {
                      const rows = healthData.bonusStructure?.valuesByType?.[type] ?? [];
                      return (
                        <div key={type} className="border border-gray-100 rounded p-2">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-medium text-gray-700 truncate" title={type}>{type}</span>
                            <span className={c.active > 0 ? "text-green-600" : "text-rose-500"}>
                              {c.active} active
                              {c.inactive > 0 && <span className="text-gray-400"> / {c.inactive} off</span>}
                            </span>
                          </div>
                          {rows.length > 0 && (
                            <div className="text-[10px] text-gray-500 grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-2 gap-y-0.5 leading-tight">
                              <span className="text-gray-400">tier</span>
                              <span className="text-gray-400">range (min–max)</span>
                              <span className="text-gray-400">%</span>
                              <span className="text-gray-400">$/pts</span>
                              <span className="text-gray-400">on</span>
                              {rows.map((r, i) => (
                                <React.Fragment key={r.id}>
                                  <span>{r.order ?? i + 1}</span>
                                  <span>{r.minValue ?? "—"}{r.maxValue != null ? `–${r.maxValue}` : "+"}</span>
                                  <span>{r.percent != null ? `${r.percent}%` : "—"}</span>
                                  <span>{r.flatValue != null ? r.flatValue : "—"}</span>
                                  <span className={r.isActive ? "text-green-600" : "text-gray-400"}>
                                    {r.isActive ? "✓" : "off"}
                                  </span>
                                </React.Fragment>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* WREGIS records */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">WREGIS records (event-driven prerequisite)</h4>
                  <div className="grid grid-cols-5 gap-1 text-xs">
                    {Object.entries(healthData.wregisRecords?.byStatus || {}).map(([k, v]) => (
                      <div key={k} className="bg-gray-50 rounded px-2 py-1 text-center">
                        <div className="text-gray-500 text-[10px]">{k}</div>
                        <div className="font-semibold">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-600">
                    {healthData.wregisRecords?.facilitiesWithApprovedRecs ?? 0} facility(s) with APPROVED RECs.
                    {healthData.wregisRecords?.facilitiesWithApprovedRecsButNoBonus?.length > 0 && (
                      <span className="text-amber-700">
                        {" "}{healthData.wregisRecords.facilitiesWithApprovedRecsButNoBonus.length} approved without a Bonus row — run Catchup Scan.
                      </span>
                    )}
                  </div>

                  {/* Pending records list — shows admin where to go to approve */}
                  {healthData.wregisRecords?.pendingRecsByFacility?.length > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-2">
                      <div className="text-xs font-medium text-amber-900 mb-1">
                        Pending REC records ({healthData.wregisRecords.pendingRecsByFacility.length}) — approve via User Management → customer → facility → REC History:
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-[11px]">
                          <thead className="text-amber-900">
                            <tr className="border-b border-amber-200">
                              <th className="text-left py-1 pr-2">Facility</th>
                              <th className="text-left py-1 pr-2">Type</th>
                              <th className="text-left py-1 pr-2">Owner</th>
                              <th className="text-left py-1">Period</th>
                            </tr>
                          </thead>
                          <tbody>
                            {healthData.wregisRecords.pendingRecsByFacility.map((r) => (
                              <tr key={r.recId} className="border-b border-amber-100 last:border-0">
                                <td className="py-1 pr-2 truncate max-w-[140px]" title={r.facilityName ?? ""}>
                                  {r.facilityName ?? "—"}
                                </td>
                                <td className="py-1 pr-2">{r.facilityType}</td>
                                <td className="py-1 pr-2 truncate max-w-[140px]" title={r.ownerEmail ?? ""}>
                                  {r.ownerEmail ?? "—"}
                                </td>
                                <td className="py-1">{r.year}-{String(r.month).padStart(2, "0")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Referral chains */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Referral chains (recipient prerequisite)</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-gray-500 text-[10px]">2a candidates</div>
                      <div className="font-semibold">{healthData.referralChains?.customersReferredBySalesAgent ?? 0}</div>
                      <div className="text-[10px] text-gray-400">customer → SALES_AGENT</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-gray-500 text-[10px]">2b candidates</div>
                      <div className="font-semibold">{healthData.referralChains?.partnersReferredBySalesAgent ?? 0}</div>
                      <div className="text-[10px] text-gray-400">PARTNER → SALES_AGENT</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-gray-500 text-[10px]">3a candidates</div>
                      <div className="font-semibold">{healthData.referralChains?.residentialReferredByResidential ?? 0}</div>
                      <div className="text-[10px] text-gray-400">RESIDENTIAL → RESIDENTIAL</div>
                    </div>
                  </div>
                </div>

                {/* Current Bonus row count */}
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600">
                  Current Bonus rows in system:{" "}
                  <span className="font-semibold text-gray-900">{healthData.currentBonusRowCount ?? 0}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button
                onClick={() => { setActiveModal(null); setHealthData(null); }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalculationTriggers;
