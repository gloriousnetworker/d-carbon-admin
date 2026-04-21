"use client";
/**
 * Manage Commission Tiers — new model (feature/tier-unit-refactor branch).
 *
 * Per 2026-04-15 meeting (Phillip / Chimdinma / Francis):
 * - Each tier stores BOTH a Sales Volume (USD) range AND a System Capacity
 *   (MW) range. The old `isForSystemCapacity` radio button is gone.
 * - The "unit" used at payout time is determined by the Commission Structure
 *   (mode setup), not by the tier. See CommissionSetupModal for that change.
 *
 * API shape expected from Francis's refactor:
 *   POST/PUT /api/commission-tier  →  { label, order, minAmountUSD,
 *     maxAmountUSD, minAmountMW, maxAmountMW }
 *
 * ⚠️  This file targets the NEW backend schema. Do NOT merge to
 *     phillip-fix2-commission-single-view until Francis confirms the
 *     backend migration is deployed.
 */
import CONFIG from "@/lib/config";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const EMPTY_FORM = {
  label: "",
  order: "",
  minAmountUSD: "",
  maxAmountUSD: "",
  minAmountMW: "",
  maxAmountMW: "",
};

const ManageTiersModal = ({ onClose, onSuccess, tiers: initialTiers }) => {
  const [tiers, setTiers] = useState(initialTiers);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingTier, setEditingTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setFormData({
      label: tier.label ?? "",
      order: tier.order ?? "",
      minAmountUSD: tier.minAmountUSD ?? "",
      maxAmountUSD: tier.maxAmountUSD ?? "",
      minAmountMW: tier.minAmountMW ?? "",
      maxAmountMW: tier.maxAmountMW ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditingTier(null);
    setFormData(EMPTY_FORM);
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tier?")) return;
    const authToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/commission-tier/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        setTiers((prev) => prev.filter((t) => t.id !== id));
        toast.success("Tier deleted successfully");
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to delete tier:", error);
      toast.error("Failed to delete tier");
    }
  };

  const handleSubmitTier = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const authToken = localStorage.getItem("authToken");

    const payload = {
      label: formData.label,
      order: parseInt(formData.order),
      minAmountUSD: parseFloat(formData.minAmountUSD),
      maxAmountUSD: formData.maxAmountUSD ? parseFloat(formData.maxAmountUSD) : null,
      minAmountMW: parseFloat(formData.minAmountMW),
      maxAmountMW: formData.maxAmountMW ? parseFloat(formData.maxAmountMW) : null,
    };

    try {
      const url = editingTier
        ? `${CONFIG.API_BASE_URL}/api/commission-tier/${editingTier.id}`
        : `${CONFIG.API_BASE_URL}/api/commission-tier`;
      const method = editingTier ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingTier) {
          setTiers((prev) => prev.map((t) => (t.id === editingTier.id ? result : t)));
          toast.success("Tier updated successfully");
        } else {
          setTiers((prev) => [...prev, result]);
          toast.success("Tier created successfully");
        }
        setFormData(EMPTY_FORM);
        setEditingTier(null);
        onSuccess();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || "Failed to save tier");
      }
    } catch (error) {
      console.error("Failed to save tier:", error);
      toast.error("Failed to save tier");
    } finally {
      setIsLoading(false);
    }
  };

  const fmtUSD = (v) =>
    v == null || v === "" ? "∞" : `$${Number(v).toLocaleString()}`;
  const fmtMW = (v) => (v == null || v === "" ? "∞" : `${v} MW`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Manage Commission Tiers</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Form ─────────────────────────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                {editingTier ? "Edit Tier" : "Create New Tier"}
              </h3>

              <form onSubmit={handleSubmitTier} className="space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                    placeholder='e.g. "Tier 1"'
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order (1, 2, 3…)
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                    min="1"
                  />
                </div>

                {/* USD range */}
                <div className="rounded-lg border border-[#03999430] bg-[#03999408] p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#039994]">
                      Sales Volume (USD)
                    </span>
                    <span className="text-xs text-gray-500">— for referred / partner modes</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min USD
                      </label>
                      <input
                        type="number"
                        name="minAmountUSD"
                        value={formData.minAmountUSD}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                        step="0.01"
                        min="0"
                        placeholder="e.g. 0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max USD{" "}
                        <span className="font-normal text-gray-400">(empty = unbounded)</span>
                      </label>
                      <input
                        type="number"
                        name="maxAmountUSD"
                        value={formData.maxAmountUSD}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 499999"
                      />
                    </div>
                  </div>
                </div>

                {/* MW range */}
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      System Capacity (MW)
                    </span>
                    <span className="text-xs text-gray-500">— for direct customer mode</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Min MW
                      </label>
                      <input
                        type="number"
                        name="minAmountMW"
                        value={formData.minAmountMW}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                        step="0.01"
                        min="0"
                        placeholder="e.g. 0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Max MW{" "}
                        <span className="font-normal text-gray-400">(empty = unbounded)</span>
                      </label>
                      <input
                        type="number"
                        name="maxAmountMW"
                        value={formData.maxAmountMW}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  {editingTier && (
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
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#039994] rounded-md hover:bg-[#028884] disabled:opacity-50"
                  >
                    {isLoading
                      ? "Saving…"
                      : editingTier
                      ? "Update Tier"
                      : "Create Tier"}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Existing tiers list ───────────────────────────────── */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Existing Tiers
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="text-xs font-medium text-gray-500">
                      <th className="px-3 py-2 text-left">Order</th>
                      <th className="px-3 py-2 text-left">Label</th>
                      <th className="px-3 py-2 text-left">USD Range</th>
                      <th className="px-3 py-2 text-left">MW Range</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...tiers]
                      .sort((a, b) => a.order - b.order)
                      .map((tier) => (
                        <tr key={tier.id}>
                          <td className="px-3 py-2 text-gray-900">{tier.order}</td>
                          <td className="px-3 py-2 text-gray-900">{tier.label}</td>
                          <td className="px-3 py-2">
                            <span className="text-[#039994] font-medium">
                              {fmtUSD(tier.minAmountUSD)}
                            </span>
                            <span className="text-gray-400 mx-1">–</span>
                            <span className="text-[#039994] font-medium">
                              {fmtUSD(tier.maxAmountUSD)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="text-amber-700 font-medium">
                              {fmtMW(tier.minAmountMW)}
                            </span>
                            <span className="text-gray-400 mx-1">–</span>
                            <span className="text-amber-700 font-medium">
                              {fmtMW(tier.maxAmountMW)}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button
                              onClick={() => handleEditTier(tier)}
                              className="text-[#039994] hover:text-[#028884] mr-3"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTier(tier.id)}
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

export default ManageTiersModal;
