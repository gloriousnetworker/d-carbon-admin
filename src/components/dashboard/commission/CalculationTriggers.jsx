"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FaPlay, FaPercentage, FaUserTie, FaCalendarAlt, FaRedo, FaSearch } from "react-icons/fa";
import CONFIG from "@/lib/config";

const thisYear = new Date().getFullYear();
const thisQuarter = Math.floor((new Date().getMonth() + 3) / 3);

const CalculationTriggers = () => {
  const [loading, setLoading] = useState("");
  const [activeModal, setActiveModal] = useState(null);

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
    </>
  );
};

export default CalculationTriggers;
