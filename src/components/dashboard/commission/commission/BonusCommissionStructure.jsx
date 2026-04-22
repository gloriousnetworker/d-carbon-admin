"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FiEdit, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import CONFIG from "@/lib/config";

const BONUS_META = {
  PARTNER_RESIDENTIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "Partner Residential Quarterly (1a)",
    showMin: true, showMax: true, showPercent: true, showFlat: false, hasEpcSplit: false,
  },
  PARTNER_COMMERCIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "Partner Commercial Quarterly (1b)",
    showMin: true, showMax: true, showPercent: true, showFlat: false, hasEpcSplit: false,
  },
  PARTNER_UNIVERSAL_MW_ANNUAL: {
    unit: "PERCENT", period: "ANNUAL",
    label: "Partner Universal Annual (1c)",
    showMin: true, showMax: true, showPercent: true, showFlat: false, hasEpcSplit: false,
  },
  EPC_ASSISTED_RESIDENTIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "EPC Residential Quarterly (1d)",
    showMin: true, showMax: true, showPercent: true, showFlat: false, hasEpcSplit: true,
  },
  EPC_ASSISTED_COMMERCIAL_MW_QUARTER: {
    unit: "PERCENT", period: "QUARTERLY",
    label: "EPC Commercial Quarterly (1e)",
    showMin: true, showMax: true, showPercent: true, showFlat: false, hasEpcSplit: true,
  },
  EPC_ASSISTED_FINANCE_ANNUAL: {
    unit: "PERCENT", period: "ANNUAL",
    label: "EPC Finance Annual (1f)",
    showMin: true, showMax: true, showPercent: true, showFlat: false, hasEpcSplit: false,
  },
  SALES_AGENT_ACCOUNT_LEVEL: {
    unit: "USD_PER_MW", period: "CUMULATIVE",
    label: "Sales Agent Direct (2a)",
    showMin: false, showMax: false, showPercent: false, showFlat: true, flatLabel: "$/MW", hasEpcSplit: false,
  },
  SALES_AGENT_REFERRED: {
    unit: "USD_PER_MW", period: "CUMULATIVE",
    label: "Sales Agent Via Partner (2b)",
    showMin: false, showMax: false, showPercent: false, showFlat: true, flatLabel: "$/MW", hasEpcSplit: false,
  },
  RESIDENTIAL_REFERRAL_QUARTERLY: {
    unit: "POINTS", period: "CUMULATIVE",
    label: "Residential Referral Tiers (3a)",
    showMin: true, showMax: true, showPercent: false, showFlat: true, flatLabel: "Points", isPoints: true, hasEpcSplit: false,
  },
};

const PARTNER_ORDER = [
  "PARTNER_RESIDENTIAL_MW_QUARTER",
  "PARTNER_COMMERCIAL_MW_QUARTER",
  "PARTNER_UNIVERSAL_MW_ANNUAL",
  "EPC_ASSISTED_RESIDENTIAL_MW_QUARTER",
  "EPC_ASSISTED_COMMERCIAL_MW_QUARTER",
  "EPC_ASSISTED_FINANCE_ANNUAL",
];

const BonusCommissionStructure = ({ onSetupStructure, refreshTrigger }) => {
  const [groupedData, setGroupedData] = useState({ partner: [], salesAgent: [], residential: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchBonusStructure();
  }, [refreshTrigger]);

  const fetchBonusStructure = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/bonus-structure/grouped`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const result = await response.json();
      if (!result.success) throw new Error("Failed to load bonus structure");
      setGroupedData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyData = () =>
    groupedData.partner.length > 0 ||
    groupedData.salesAgent.length > 0 ||
    groupedData.residential.length > 0;

  const handleEdit = (item) => {
    const splitConfig = item.splitConfig || {};
    setEditingId(item.id);
    setEditForm({
      minValue: item.minValue ?? "",
      maxValue: item.maxValue ?? "",
      percent: item.percent ?? "",
      flatValue: item.flatValue ?? "",
      isActive: item.isActive ?? true,
      financeShare: splitConfig.financeShare ?? 0.5,
      installerShare: splitConfig.installerShare ?? 0.5,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const setField = (key, val) => setEditForm((p) => ({ ...p, [key]: val }));

  const handleUpdate = async (id, bonusType) => {
    const meta = BONUS_META[bonusType] || {};
    try {
      const authToken = localStorage.getItem("authToken");
      const payload = {
        unit: meta.unit,
        period: meta.period,
        isActive: editForm.isActive,
        minValue: editForm.minValue !== "" ? parseFloat(editForm.minValue) : null,
        maxValue: editForm.maxValue !== "" ? parseFloat(editForm.maxValue) : null,
        percent: meta.showPercent && editForm.percent !== "" ? parseFloat(editForm.percent) : null,
        flatValue: meta.showFlat && editForm.flatValue !== "" ? parseFloat(editForm.flatValue) : null,
        splitConfig: meta.hasEpcSplit
          ? { financeShare: parseFloat(editForm.financeShare) || 0.5, installerShare: parseFloat(editForm.installerShare) || 0.5 }
          : null,
      };
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/bonus-structure/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) throw new Error("Update failed");
      toast.success("Updated successfully", { position: "top-center", duration: 3000 });
      setEditingId(null);
      setEditForm({});
      fetchBonusStructure();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, { position: "top-center", duration: 5000 });
    }
  };

  const renderRow = (item, rowIndex, meta) => {
    const isEditing = editingId === item.id;
    const splitConfig = item.splitConfig || {};

    if (isEditing) {
      return (
        <tr key={item.id} className="bg-blue-50">
          {meta.showMin && (
            <td className="py-2 px-4 border-b">
              <input type="number" value={editForm.minValue} onChange={(e) => setField("minValue", e.target.value)}
                className="w-full rounded bg-white border border-gray-300 py-1 px-2 text-xs" step="0.1" />
            </td>
          )}
          {meta.showMax && (
            <td className="py-2 px-4 border-b">
              <input type="number" value={editForm.maxValue} onChange={(e) => setField("maxValue", e.target.value)}
                className="w-full rounded bg-white border border-gray-300 py-1 px-2 text-xs" step="0.1" placeholder="no cap" />
            </td>
          )}
          {meta.showPercent && (
            <td className="py-2 px-4 border-b">
              <input type="number" value={editForm.percent} onChange={(e) => setField("percent", e.target.value)}
                className="w-full rounded bg-white border border-gray-300 py-1 px-2 text-xs" step="0.1" min="0" max="100" />
            </td>
          )}
          {meta.showFlat && (
            <td className="py-2 px-4 border-b">
              <input type="number" value={editForm.flatValue} onChange={(e) => setField("flatValue", e.target.value)}
                className="w-full rounded bg-white border border-gray-300 py-1 px-2 text-xs"
                step={meta.isPoints ? "1" : "0.01"} min="0" />
            </td>
          )}
          {meta.hasEpcSplit && (
            <>
              <td className="py-2 px-4 border-b">
                <input type="number" value={editForm.financeShare} onChange={(e) => setField("financeShare", e.target.value)}
                  className="w-full rounded bg-white border border-gray-300 py-1 px-2 text-xs" step="0.01" min="0" max="1" />
              </td>
              <td className="py-2 px-4 border-b">
                <input type="number" value={editForm.installerShare} onChange={(e) => setField("installerShare", e.target.value)}
                  className="w-full rounded bg-white border border-gray-300 py-1 px-2 text-xs" step="0.01" min="0" max="1" />
              </td>
            </>
          )}
          <td className="py-2 px-4 border-b">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={editForm.isActive} onChange={(e) => setField("isActive", e.target.checked)} />
              <span className="text-xs">{editForm.isActive ? "Active" : "Inactive"}</span>
            </label>
          </td>
          <td className="py-2 px-4 border-b">
            <div className="flex gap-2">
              <button onClick={() => handleUpdate(item.id, item.bonusType)} className="text-green-600 hover:text-green-800" title="Save">
                <FiSave size={15} />
              </button>
              <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700" title="Cancel">
                <FiX size={15} />
              </button>
            </div>
          </td>
        </tr>
      );
    }

    const suffix = meta.isPoints ? "" : " MW";
    return (
      <tr key={item.id} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
        {meta.showMin && (
          <td className="py-3 px-4 text-sm border-b">{item.minValue}{suffix}</td>
        )}
        {meta.showMax && (
          <td className="py-3 px-4 text-sm border-b">{item.maxValue != null ? `${item.maxValue}${suffix}` : "no cap"}</td>
        )}
        {meta.showPercent && (
          <td className="py-3 px-4 text-sm border-b">{item.percent != null ? `${item.percent}%` : "—"}</td>
        )}
        {meta.showFlat && (
          <td className="py-3 px-4 text-sm border-b">
            {item.flatValue != null
              ? (meta.isPoints ? `${item.flatValue} pts` : `$${item.flatValue}`)
              : "—"}
          </td>
        )}
        {meta.hasEpcSplit && (
          <>
            <td className="py-3 px-4 text-sm border-b">{splitConfig.financeShare ?? 0.5}</td>
            <td className="py-3 px-4 text-sm border-b">{splitConfig.installerShare ?? 0.5}</td>
          </>
        )}
        <td className="py-3 px-4 text-sm border-b">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {item.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="py-3 px-4 text-sm border-b">
          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit">
            <FiEdit size={15} />
          </button>
        </td>
      </tr>
    );
  };

  const renderBonusTypeTable = (bonusType, rows) => {
    if (!rows || rows.length === 0) return null;
    const meta = BONUS_META[bonusType] || {};

    const minHeader = meta.isPoints ? "Min #" : "Min MW";
    const maxHeader = meta.isPoints ? "Max #" : "Max MW";
    const headers = [
      ...(meta.showMin ? [minHeader] : []),
      ...(meta.showMax ? [maxHeader] : []),
      ...(meta.showPercent ? ["Bonus %"] : []),
      ...(meta.showFlat ? [meta.flatLabel || "Flat"] : []),
      ...(meta.hasEpcSplit ? ["Finance share", "Installer share"] : []),
      "Active",
      "Actions",
    ];

    return (
      <div className="mb-5" key={bonusType}>
        <h4 className="text-sm font-medium text-gray-700 mb-2">{meta.label}</h4>
        <div className="w-full overflow-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((h, i) => (
                  <th key={i} className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((item, idx) => renderRow(item, idx, meta))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPartnerSection = () => {
    if (groupedData.partner.length === 0) return null;
    const byType = {};
    for (const row of groupedData.partner) {
      if (!byType[row.bonusType]) byType[row.bonusType] = [];
      byType[row.bonusType].push(row);
    }
    return (
      <div className="mb-8">
        <h3 className="text-[#039994] font-semibold mb-4 text-base border-b border-gray-200 pb-2">Partner Bonuses</h3>
        {PARTNER_ORDER.map((t) => byType[t] ? renderBonusTypeTable(t, byType[t]) : null)}
      </div>
    );
  };

  const renderSalesAgentSection = () => {
    if (groupedData.salesAgent.length === 0) return null;
    const byType = {};
    for (const row of groupedData.salesAgent) {
      if (!byType[row.bonusType]) byType[row.bonusType] = [];
      byType[row.bonusType].push(row);
    }
    return (
      <div className="mb-8">
        <h3 className="text-[#039994] font-semibold mb-4 text-base border-b border-gray-200 pb-2">Sales Agent Bonuses</h3>
        {["SALES_AGENT_ACCOUNT_LEVEL", "SALES_AGENT_REFERRED"].map((t) =>
          byType[t] ? renderBonusTypeTable(t, byType[t]) : null
        )}
      </div>
    );
  };

  const renderResidentialSection = () => {
    if (groupedData.residential.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-[#039994] font-semibold mb-4 text-base border-b border-gray-200 pb-2">Residential Referral</h3>
        {renderBonusTypeTable("RESIDENTIAL_REFERRAL_QUARTERLY", groupedData.residential)}
        <p className="text-xs text-gray-500 mt-1">
          Ordinal is cumulative forever — it counts every WREGIS-approved referral this user has earned, not per quarter.
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading bonus data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!hasAnyData()) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-[#039994] font-semibold text-lg">Bonus Commission Structure</h2>
          <button
            className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
            onClick={onSetupStructure}
          >
            <IoSettingsSharp className="mr-2" size={16} />
            Setup Structure
          </button>
        </div>
        <div className="w-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-500 mb-4">No bonus structure configured</div>
          <button
            className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-md text-sm hover:bg-[#028B86] transition-colors"
            onClick={onSetupStructure}
          >
            <IoSettingsSharp className="mr-2" size={16} />
            Create Bonus Structure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">Bonus Commission Structure</h2>
        <button
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
          onClick={onSetupStructure}
        >
          <IoSettingsSharp className="mr-2" size={16} />
          Setup Structure
        </button>
      </div>

      {renderPartnerSection()}
      {renderSalesAgentSection()}
      {renderResidentialSection()}

      <div className="text-xs text-gray-500 mt-2">
        Partner bonuses calculate at period close. Sales-agent and residential bonuses fire per WREGIS-approved facility.
      </div>
    </div>
  );
};

export default BonusCommissionStructure;
