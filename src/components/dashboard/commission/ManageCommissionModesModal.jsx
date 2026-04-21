"use client";
/**
 * Manage Commission Modes — declares which tier unit (USD / MW) each
 * commission mode uses for a given property type.
 *
 * This is the single source of truth for tier-unit routing at commission
 * calculation time. Without a record here for `(mode, propertyType)`, the
 * calculation job silently skips that facility — no Commission rows are
 * created and no wallet credits happen for that quarter.
 *
 * Backend endpoint: /api/commission-mode
 *   GET, POST, PUT /:id, DELETE /:id
 *
 * Payload shape (per Francis, commit 25bc75a):
 *   { mode: CommissionMode, tierUnit: ETierUnit, propertyType: PropertyType }
 *
 * Uniqueness: (mode, propertyType) — one tierUnit per pair.
 */
import CONFIG from "@/lib/config";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const MODES = [
  "DIRECT_CUSTOMER",
  "REFERRED_CUSTOMER",
  "PARTNER_INSTALLER",
  "PARTNER_FINANCE",
  "EPC_ASSISTED_FINANCE",
  "EPC_ASSISTED_INSTALLER",
  "SALES_AGENT_SALES_AGENT",
  "SALES_AGENT_FINANCE",
  "SALES_AGENT_INSTALLER",
  "SALES_AGENT_REFERRED_RESIDENTIAL",
  "SALES_AGENT_REFERRED_COMMERCIAL",
];

const PROPERTY_TYPES = ["COMMERCIAL", "RESIDENTIAL", "ACCOUNT_LEVEL"];

const EMPTY_FORM = {
  mode: "DIRECT_CUSTOMER",
  propertyType: "COMMERCIAL",
  tierUnit: "SALES_VOLUME",
};

const ManageCommissionModesModal = ({ onClose, onSuccess }) => {
  const [records, setRecords] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    fetchModes();
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem("authToken");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchModes = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/commission-mode`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch commission modes:", e);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleEdit = (rec) => {
    setEditing(rec);
    setFormData({
      mode: rec.mode,
      propertyType: rec.propertyType,
      tierUnit: rec.tierUnit,
    });
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this commission mode configuration?")) return;
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/commission-mode/${id}`,
        { method: "DELETE", headers: authHeaders() }
      );
      if (res.ok || res.status === 204) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        toast.success("Commission mode deleted");
        onSuccess?.();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to delete");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editing
        ? `${CONFIG.API_BASE_URL}/api/commission-mode/${editing.id}`
        : `${CONFIG.API_BASE_URL}/api/commission-mode`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const result = await res.json();
        if (editing) {
          setRecords((prev) => prev.map((r) => (r.id === editing.id ? result : r)));
          toast.success("Commission mode updated");
        } else {
          setRecords((prev) => [...prev, result]);
          toast.success("Commission mode created");
        }
        setFormData(EMPTY_FORM);
        setEditing(null);
        onSuccess?.();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to save");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sorted = [...records].sort((a, b) => {
    if (a.propertyType !== b.propertyType)
      return a.propertyType.localeCompare(b.propertyType);
    return a.mode.localeCompare(b.mode);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold">Commission Mode Configuration</h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                Declare which tier unit (Sales Volume USD or System Capacity MW)
                each commission mode uses per property type. This is the single
                source of truth used by the commission calculation job — a mode
                with no record here will be skipped and no commission will be
                credited.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* ── Form ───────────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                {editing ? "Edit Configuration" : "Create Configuration"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Mode
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={!!editing}
                  >
                    {MODES.map((m) => (
                      <option key={m} value={m}>
                        {m.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    disabled={!!editing}
                  >
                    {PROPERTY_TYPES.map((p) => (
                      <option key={p} value={p}>
                        {p.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tier Unit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm ${
                        formData.tierUnit === "SALES_VOLUME"
                          ? "border-[#039994] bg-[#03999410] text-[#039994]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tierUnit"
                        value="SALES_VOLUME"
                        checked={formData.tierUnit === "SALES_VOLUME"}
                        onChange={onChange}
                        className="accent-[#039994]"
                      />
                      Sales Volume (USD)
                    </label>
                    <label
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm ${
                        formData.tierUnit === "SYSTEM_CAPACITY"
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tierUnit"
                        value="SYSTEM_CAPACITY"
                        checked={formData.tierUnit === "SYSTEM_CAPACITY"}
                        onChange={onChange}
                        className="accent-amber-500"
                      />
                      System Capacity (MW)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    USD is matched against tier `minAmountUSD / maxAmountUSD`;
                    MW against `minAmountMW / maxAmountMW`.
                  </p>
                </div>

                <div className="flex space-x-3 pt-2">
                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#039994] rounded-md hover:bg-[#028884] disabled:opacity-50"
                  >
                    {loading
                      ? "Saving…"
                      : editing
                      ? "Update Configuration"
                      : "Create Configuration"}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Existing records list ──────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Existing Configurations
              </h3>

              {fetchLoading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : sorted.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                  No commission modes configured yet.
                  <br />
                  Create one on the left to tell the commission job which tier
                  unit to use.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="text-xs font-medium text-gray-500">
                        <th className="px-3 py-2 text-left">Property Type</th>
                        <th className="px-3 py-2 text-left">Mode</th>
                        <th className="px-3 py-2 text-left">Tier Unit</th>
                        <th className="px-3 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sorted.map((rec) => (
                        <tr key={rec.id}>
                          <td className="px-3 py-2 text-gray-900">
                            {rec.propertyType.replace(/_/g, " ")}
                          </td>
                          <td className="px-3 py-2 text-gray-900">
                            {rec.mode.replace(/_/g, " ")}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                rec.tierUnit === "SYSTEM_CAPACITY"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-[#03999415] text-[#039994] border border-[#03999430]"
                              }`}
                            >
                              {rec.tierUnit === "SYSTEM_CAPACITY" ? "MW" : "USD"}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEdit(rec)}
                              className="text-[#039994] hover:text-[#028884] mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(rec.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCommissionModesModal;
