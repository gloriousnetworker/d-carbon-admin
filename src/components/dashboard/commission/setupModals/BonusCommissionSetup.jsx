"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import CONFIG from "@/lib/config";

const BONUS_META = {
  PARTNER_RESIDENTIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "Partner Residential Quarterly (1a)",
    description: "Non-EPC residential MW in quarter > threshold → +% on partner commission",
    showMin: true, showMax: false, showPercent: true, showFlat: false,
  },
  PARTNER_COMMERCIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "Partner Commercial Quarterly (1b)",
    description: "Non-EPC commercial MW in quarter > threshold → +% on partner commission",
    showMin: true, showMax: false, showPercent: true, showFlat: false,
  },
  PARTNER_UNIVERSAL_MW_ANNUAL: {
    unit: "PERCENT", period: "ANNUAL",
    label: "Partner Universal Annual (1c)",
    description: "Combined residential + commercial MW in year > threshold → +% on annual commission",
    showMin: true, showMax: false, showPercent: true, showFlat: false,
  },
  EPC_ASSISTED_RESIDENTIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "EPC Residential Quarterly (1d)",
    description: "EPC residential MW in quarter > threshold → % split 50/50 between finance & installer",
    showMin: true, showMax: false, showPercent: true, showFlat: false, showSplitConfig: true,
  },
  EPC_ASSISTED_COMMERCIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "EPC Commercial Quarterly (1e)",
    description: "EPC commercial MW in quarter > threshold → % split 50/50 between finance & installer",
    showMin: true, showMax: false, showPercent: true, showFlat: false, showSplitConfig: true,
  },
  EPC_ASSISTED_FINANCE_ANNUAL: {
    unit: "PERCENT", period: "ANNUAL",
    label: "EPC Finance Annual (1f)",
    description: "EPC finance partner MW in year > threshold → +% on annual finance commission (installer excluded)",
    showMin: true, showMax: false, showPercent: true, showFlat: false,
  },
  SALES_AGENT_ACCOUNT_LEVEL: {
    unit: "USD_PER_MW", period: "CUMULATIVE",
    label: "Sales Agent Direct (2a)",
    description: "Each WREGIS-approved MW referred directly by agent → flat $/MW (default $1000). Pays once per facility.",
    showMin: false, showMax: false, showPercent: false, showFlat: true, flatLabel: "$/MW",
  },
  SALES_AGENT_REFERRED: {
    unit: "USD_PER_MW", period: "CUMULATIVE",
    label: "Sales Agent Via Partner (2b)",
    description: "Each WREGIS-approved MW from a partner the agent referred → flat $/MW (confirmed $500). Pays once per facility.",
    showMin: false, showMax: false, showPercent: false, showFlat: true, flatLabel: "$/MW",
  },
  RESIDENTIAL_REFERRAL_QUARTERLY: {
    unit: "POINTS", period: "CUMULATIVE",
    label: "Residential Referral Tiers (3a)",
    description: "Referrer earns points when their referral reaches WREGIS approval. Points are tiered by cumulative ordinal (1st referral, 2nd, 3rd–5th, 6th+). Add one row per tier band.",
    showMin: true, showMax: true, showPercent: false, showFlat: true, flatLabel: "Points",
  },
};

const ALL_TYPES = Object.keys(BONUS_META);
const EMPTY_ENTRY = { minValue: "", maxValue: "", percent: "", flatValue: "", financeShare: "0.5", installerShare: "0.5" };

const BonusCommissionSetup = ({ onClose, onSuccess }) => {
  const [target, setTarget] = useState("SALES_AGENT_ACCOUNT_LEVEL");
  const [bonusEntries, setBonusEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({ ...EMPTY_ENTRY });
  const [updating, setUpdating] = useState(false);

  const meta = BONUS_META[target] || {};
  const setField = (key, val) => setNewEntry((p) => ({ ...p, [key]: val }));

  const handleTargetChange = (t) => {
    setTarget(t);
    setNewEntry({ ...EMPTY_ENTRY });
  };

  const handleAddEntry = () => {
    if (meta.showMin && newEntry.minValue === "") {
      toast.error("Min value is required", { position: "top-center" }); return;
    }
    if (meta.showMax && newEntry.maxValue === "") {
      toast.error("Max value is required", { position: "top-center" }); return;
    }
    if (meta.showPercent && newEntry.percent === "") {
      toast.error("Bonus % is required", { position: "top-center" }); return;
    }
    if (meta.showFlat && newEntry.flatValue === "") {
      toast.error(`${meta.flatLabel || "Flat value"} is required`, { position: "top-center" }); return;
    }

    const existing3aCount = bonusEntries.filter((e) => e.bonusType === "RESIDENTIAL_REFERRAL_QUARTERLY").length;

    const entry = {
      bonusType: target,
      unit: meta.unit,
      period: meta.period,
      isActive: true,
      order: target === "RESIDENTIAL_REFERRAL_QUARTERLY" ? existing3aCount : 0,
      label: meta.label,
      minValue: meta.showMin ? parseFloat(newEntry.minValue) : 0,
      maxValue: meta.showMax && newEntry.maxValue !== "" ? parseFloat(newEntry.maxValue) : null,
      percent: meta.showPercent && newEntry.percent !== "" ? parseFloat(newEntry.percent) : null,
      flatValue: meta.showFlat && newEntry.flatValue !== "" ? parseFloat(newEntry.flatValue) : null,
      splitConfig: meta.showSplitConfig
        ? { financeShare: parseFloat(newEntry.financeShare) || 0.5, installerShare: parseFloat(newEntry.installerShare) || 0.5 }
        : null,
    };

    setBonusEntries((prev) => [...prev, entry]);
    setNewEntry({ ...EMPTY_ENTRY });
    toast.success("Entry staged", { position: "top-center", duration: 1500 });
  };

  const handleRemoveEntry = (idx) => {
    setBonusEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (bonusEntries.length === 0) {
      toast.error("Add at least one entry first", { position: "top-center" }); return;
    }
    setUpdating(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/bonus-structure/bulk-upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ rows: bonusEntries }),
      });
      const result = await res.json();
      if (!result.success) throw new Error("Bulk save failed");
      toast.success("Bonus structure saved", { position: "top-center", duration: 3000 });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(`Save failed: ${err.message}`, { position: "top-center", duration: 5000 });
    } finally {
      setUpdating(false);
    }
  };

  const filteredEntries = bonusEntries.filter((e) => e.bonusType === target);
  const stagedTypes = new Set(bonusEntries.map((e) => e.bonusType)).size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Bonus Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        {/* Bonus type selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Bonus Type</label>
          <div className="grid grid-cols-3 gap-2">
            {ALL_TYPES.map((t) => (
              <button
                key={t}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors text-left leading-tight ${
                  target === t ? "bg-[#039994] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleTargetChange(t)}
              >
                {BONUS_META[t].label}
                {bonusEntries.filter((e) => e.bonusType === t).length > 0 && (
                  <span className={`ml-1 text-[10px] font-bold ${target === t ? "text-white/80" : "text-[#039994]"}`}>
                    ({bonusEntries.filter((e) => e.bonusType === t).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          {meta.description && (
            <p className="text-xs text-gray-500 mt-2 italic">{meta.description}</p>
          )}
        </div>

        {/* Add entry form */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-sm mb-4">Add Entry — {meta.label}</h3>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 text-xs items-end">
            {meta.showMin && (
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600">
                  {target === "RESIDENTIAL_REFERRAL_QUARTERLY" ? "Min ordinal (#)" : "Min MW threshold"}
                </label>
                <input
                  type="number"
                  value={newEntry.minValue}
                  onChange={(e) => setField("minValue", e.target.value)}
                  className="rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3"
                  placeholder={target === "RESIDENTIAL_REFERRAL_QUARTERLY" ? "e.g. 1" : "e.g. 1"}
                  step={target === "RESIDENTIAL_REFERRAL_QUARTERLY" ? "1" : "0.1"}
                />
              </div>
            )}
            {meta.showMax && (
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600">Max ordinal (#)</label>
                <input
                  type="number"
                  value={newEntry.maxValue}
                  onChange={(e) => setField("maxValue", e.target.value)}
                  className="rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3"
                  placeholder="null = no cap"
                  step="1"
                />
              </div>
            )}
            {meta.showPercent && (
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600">Bonus %</label>
                <input
                  type="number"
                  value={newEntry.percent}
                  onChange={(e) => setField("percent", e.target.value)}
                  className="rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3"
                  placeholder="e.g. 10"
                  step="0.1" min="0" max="100"
                />
              </div>
            )}
            {meta.showFlat && (
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600">{meta.flatLabel || "Amount"}</label>
                <input
                  type="number"
                  value={newEntry.flatValue}
                  onChange={(e) => setField("flatValue", e.target.value)}
                  className="rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3"
                  placeholder={meta.flatLabel === "$/MW" ? "e.g. 500" : "e.g. 5"}
                  step={meta.flatLabel === "Points" ? "1" : "0.01"} min="0"
                />
              </div>
            )}
            {meta.showSplitConfig && (
              <>
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Finance share (0–1)</label>
                  <input
                    type="number"
                    value={newEntry.financeShare}
                    onChange={(e) => setField("financeShare", e.target.value)}
                    className="rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3"
                    step="0.01" min="0" max="1"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-1 text-gray-600">Installer share (0–1)</label>
                  <input
                    type="number"
                    value={newEntry.installerShare}
                    onChange={(e) => setField("installerShare", e.target.value)}
                    className="rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3"
                    step="0.01" min="0" max="1"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 invisible">Action</label>
              <button
                onClick={handleAddEntry}
                className="bg-[#039994] text-white px-4 py-2 rounded text-xs hover:bg-[#028B86] transition-colors"
              >
                + Add Entry
              </button>
            </div>
          </div>
        </div>

        {/* Staged entries for current target */}
        {filteredEntries.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-sm mb-3">Staged: {meta.label}</h3>
            <div className="overflow-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    {target === "RESIDENTIAL_REFERRAL_QUARTERLY" && (
                      <th className="text-left py-2 px-4 border-b font-medium">#</th>
                    )}
                    {meta.showMin && <th className="text-left py-2 px-4 border-b font-medium">Min</th>}
                    {meta.showMax && <th className="text-left py-2 px-4 border-b font-medium">Max</th>}
                    {meta.showPercent && <th className="text-left py-2 px-4 border-b font-medium">Bonus %</th>}
                    {meta.showFlat && <th className="text-left py-2 px-4 border-b font-medium">{meta.flatLabel}</th>}
                    {meta.showSplitConfig && (
                      <th className="text-left py-2 px-4 border-b font-medium">Finance / Installer</th>
                    )}
                    <th className="text-left py-2 px-4 border-b font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry, idx) => {
                    const globalIdx = bonusEntries.indexOf(entry);
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {target === "RESIDENTIAL_REFERRAL_QUARTERLY" && (
                          <td className="py-2 px-4 border-b text-gray-500">{idx + 1}</td>
                        )}
                        {meta.showMin && <td className="py-2 px-4 border-b">{entry.minValue}</td>}
                        {meta.showMax && <td className="py-2 px-4 border-b">{entry.maxValue ?? "no cap"}</td>}
                        {meta.showPercent && <td className="py-2 px-4 border-b">{entry.percent}%</td>}
                        {meta.showFlat && <td className="py-2 px-4 border-b">{entry.flatValue}</td>}
                        {meta.showSplitConfig && (
                          <td className="py-2 px-4 border-b">
                            {entry.splitConfig?.financeShare} / {entry.splitConfig?.installerShare}
                          </td>
                        )}
                        <td className="py-2 px-4 border-b">
                          <button
                            onClick={() => handleRemoveEntry(globalIdx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary banner */}
        {bonusEntries.length > 0 && (
          <div className="mb-4 p-3 bg-[#039994]/5 rounded-lg border border-[#039994]/20">
            <p className="text-xs text-[#039994] font-medium">
              {bonusEntries.length} total {bonusEntries.length === 1 ? "entry" : "entries"} staged across {stagedTypes} bonus type{stagedTypes !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updating || bonusEntries.length === 0}
            className={`px-4 py-2 rounded-md text-sm ${
              updating || bonusEntries.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-[#039994] hover:bg-[#028B86]"
            } text-white transition-colors`}
          >
            {updating ? "Saving..." : `Save ${bonusEntries.length} ${bonusEntries.length === 1 ? "Entry" : "Entries"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BonusCommissionSetup;
