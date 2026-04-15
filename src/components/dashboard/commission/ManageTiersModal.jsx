"use client";
import CONFIG from '@/lib/config';
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const ManageTiersModal = ({ onClose, onSuccess, tiers: initialTiers }) => {
  const [tiers, setTiers] = useState(initialTiers);
  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    label: "",
    order: "",
    isForSystemCapacity: false,
  });
  const [editingTier, setEditingTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setFormData({
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount || "",
      label: tier.label,
      order: tier.order,
      isForSystemCapacity: !!tier.isForSystemCapacity,
    });
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tier?")) return;
    
    const authToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/commission-tier/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const updatedTiers = tiers.filter(tier => tier.id !== id);
        setTiers(updatedTiers);
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
      minAmount: parseFloat(formData.minAmount),
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
      label: formData.label,
      order: parseInt(formData.order),
      isForSystemCapacity: !!formData.isForSystemCapacity,
    };

    try {
      let response;
      if (editingTier) {
        response = await fetch(`${CONFIG.API_BASE_URL}/api/commission-tier/${editingTier.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${CONFIG.API_BASE_URL}/api/commission-tier`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const result = await response.json();
        if (editingTier) {
          const updatedTiers = tiers.map(tier => 
            tier.id === editingTier.id ? result : tier
          );
          setTiers(updatedTiers);
          toast.success("Tier updated successfully");
        } else {
          setTiers([...tiers, result]);
          toast.success("Tier created successfully");
        }
        
        setFormData({
          minAmount: "",
          maxAmount: "",
          label: "",
          order: "",
          isForSystemCapacity: false,
        });
        setEditingTier(null);
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to save tier:", error);
      toast.error("Failed to save tier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTier(null);
    setFormData({
      minAmount: "",
      maxAmount: "",
      label: "",
      order: "",
      isForSystemCapacity: false,
    });
  };

  // Unit helpers — keep in sync with CommissionTable.formatTierRange.
  const unitLabel = formData.isForSystemCapacity ? "MW" : "USD";
  const amountPlaceholder = formData.isForSystemCapacity ? "e.g. 2" : "e.g. 500000";
  const labelPlaceholder = formData.isForSystemCapacity
    ? 'e.g. "2 – 3 MW"'
    : 'e.g. "<500k"';
  const formatTierAmount = (value, forCapacity) => {
    if (value == null || value === "") return "∞";
    return forCapacity
      ? `${value} MW`
      : `$${Number(value).toLocaleString()}`;
  };

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
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                {editingTier ? "Edit Tier" : "Create New Tier"}
              </h3>
              <form onSubmit={handleSubmitTier} className="space-y-4">
                {/*
                  Tier Unit selector — new in 2026-04-15 (backend commit 9a3dc66).
                  Capacity (MW) tiers drive commission for direct customers (no
                  partner/installer/finance referral); Sales Volume (USD) tiers
                  drive commission for partner-referred customers. See
                  CAPACITY-TIER-INTEGRATION-PLAN.md at the d-carbon root.
                */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tier Unit
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm ${
                        !formData.isForSystemCapacity
                          ? "border-[#039994] bg-[#03999410] text-[#039994]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="isForSystemCapacity"
                        checked={!formData.isForSystemCapacity}
                        onChange={() =>
                          setFormData({ ...formData, isForSystemCapacity: false })
                        }
                        className="accent-[#039994]"
                      />
                      Sales Volume (USD)
                    </label>
                    <label
                      className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm ${
                        formData.isForSystemCapacity
                          ? "border-[#039994] bg-[#03999410] text-[#039994]"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="isForSystemCapacity"
                        checked={formData.isForSystemCapacity}
                        onChange={() =>
                          setFormData({ ...formData, isForSystemCapacity: true })
                        }
                        className="accent-[#039994]"
                      />
                      System Capacity (MW)
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    MW tiers are applied to direct customers; USD tiers are applied
                    to partner-referred customers.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label ({labelPlaceholder})
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    placeholder="Enter range label"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Amount ({unitLabel})
                  </label>
                  <input
                    type="number"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    step="0.01"
                    placeholder={amountPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount ({unitLabel}, optional — leave empty for unbounded top tier)
                  </label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
                    placeholder={amountPlaceholder}
                  />
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
                    {isLoading ? "Saving..." : editingTier ? "Update Tier" : "Create Tier"}
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Existing Tiers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Order</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Unit</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Label</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Min</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Max</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tiers.sort((a, b) => a.order - b.order).map((tier) => {
                      const forCapacity = !!tier.isForSystemCapacity;
                      return (
                        <tr key={tier.id}>
                          <td className="px-3 py-2 text-sm text-gray-900">{tier.order}</td>
                          <td className="px-3 py-2 text-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                forCapacity
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-[#03999415] text-[#039994] border border-[#03999430]"
                              }`}
                            >
                              {forCapacity ? "MW" : "USD"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">{tier.label}</td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {formatTierAmount(tier.minAmount, forCapacity)}
                          </td>
                          <td className="px-3 py-2 text-sm text-gray-900">
                            {formatTierAmount(tier.maxAmount, forCapacity)}
                          </td>
                          <td className="px-3 py-2 text-sm">
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
                      );
                    })}
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