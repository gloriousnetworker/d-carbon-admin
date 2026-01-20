"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

const ManageTiersModal = ({ onClose, onSuccess, tiers: initialTiers }) => {
  const [tiers, setTiers] = useState(initialTiers);
  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    label: "",
    order: ""
  });
  const [editingTier, setEditingTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditTier = (tier) => {
    setEditingTier(tier);
    setFormData({
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount || "",
      label: tier.label,
      order: tier.order
    });
  };

  const handleDeleteTier = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tier?")) return;
    
    const authToken = localStorage.getItem("authToken");
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/commission-tier/${id}`, {
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
      order: parseInt(formData.order)
    };

    try {
      let response;
      if (editingTier) {
        response = await fetch(`https://services.dcarbon.solutions/api/commission-tier/${editingTier.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("https://services.dcarbon.solutions/api/commission-tier", {
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
          order: ""
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
      order: ""
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    placeholder="e.g., <500k"
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
                    Min Amount
                  </label>
                  <input
                    type="number"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Amount (optional)
                  </label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    step="0.01"
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Label</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Min Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Max Amount</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tiers.sort((a, b) => a.order - b.order).map((tier) => (
                      <tr key={tier.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">{tier.order}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">{tier.label}</td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          ${tier.minAmount.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {tier.maxAmount ? `$${tier.maxAmount.toLocaleString()}` : "∞"}
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