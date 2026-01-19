"use client";
import React, { useState, useEffect } from "react";
import CommercialCommissionStructure from "./commission/CommercialCommissionStructure";
import ResidentialCommissionStructure from "./commission/ResidentialCommissionStructure";
import PartnerCommissionStructure from "./commission/PartnerCommissionStructure";
import AccountLevelBasedCommissionStructure from "./commission/AccountLevelBasedReferralCommissionStructure";
import BonusCommissionStructure from "./commission/BonusCommissionStructure";
import CommissionSummary from "./commission/CommissionSummary";
import VersioningAndAudit from "./commission/VersioningAndAudit";
import ValidationRules from "./commission/ValidationRules";
import CommercialCommissionSetup from "./setupModals/CommercialCommissionSetup";
import ResidentialCommissionSetup from "./setupModals/ResidentialCommissionSetup";
import PartnerCommissionSetup from "./setupModals/PartnerCommissionSetup";
import AccountLevelBasedCommissionSetup from "./setupModals/AccountLevelBasedReferralCommissionStructure";
import BonusCommissionSetup from "./setupModals/BonusCommissionSetup";
import InitiateCommissionModal from "./InitiateCommissionModal";
import { Toaster } from "react-hot-toast";

const CommissionStructure = () => {
  const [activeTab, setActiveTab] = useState("Commercial");
  const [showCommercialSetup, setShowCommercialSetup] = useState(false);
  const [showResidentialSetup, setShowResidentialSetup] = useState(false);
  const [showPartnerSetup, setShowPartnerSetup] = useState(false);
  const [showSalesAgentSetup, setShowSalesAgentSetup] = useState(false);
  const [showBonusSetup, setShowBonusSetup] = useState(false);
  const [showInitiateCommission, setShowInitiateCommission] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tiers, setTiers] = useState([]);
  const [editingTier, setEditingTier] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    minAmount: "",
    maxAmount: "",
    label: "",
    order: ""
  });

  useEffect(() => {
    fetchTiers();
  }, []);

  const fetchTiers = async () => {
    const authToken = localStorage.getItem("authToken");
    try {
      const response = await fetch("https://services.dcarbon.solutions/api/commission-tier", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTiers(data);
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
    }
  };

  const handleCommercialSetup = () => setShowCommercialSetup(true);
  const handleCloseCommercialSetup = () => setShowCommercialSetup(false);
  const handleResidentialSetup = () => setShowResidentialSetup(true);
  const handleCloseResidentialSetup = () => setShowResidentialSetup(false);
  const handlePartnerSetup = () => setShowPartnerSetup(true);
  const handleClosePartnerSetup = () => setShowPartnerSetup(false);
  const handleSalesAgentSetup = () => setShowSalesAgentSetup(true);
  const handleCloseSalesAgentSetup = () => setShowSalesAgentSetup(false);
  const handleBonusSetup = () => setShowBonusSetup(true);
  const handleCloseBonusSetup = () => setShowBonusSetup(false);
  const handleInitiateCommission = () => setShowInitiateCommission(true);
  const handleCloseInitiateCommission = () => setShowInitiateCommission(false);
  const handleOpenTierModal = () => {
    setEditingTier(null);
    setFormData({ minAmount: "", maxAmount: "", label: "", order: "" });
    setShowTierModal(true);
  };
  const handleCloseTierModal = () => setShowTierModal(false);

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

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
      maxAmount: tier.maxAmount,
      label: tier.label,
      order: tier.order
    });
    setShowTierModal(true);
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
        fetchTiers();
      }
    } catch (error) {
      console.error("Failed to delete tier:", error);
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
        fetchTiers();
        handleCloseTierModal();
      }
    } catch (error) {
      console.error("Failed to save tier:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      <Toaster position="top-right" />
      {showCommercialSetup && (
        <CommercialCommissionSetup onClose={handleCloseCommercialSetup} onSuccess={handleSuccess} />
      )}
      {showResidentialSetup && (
        <ResidentialCommissionSetup onClose={handleCloseResidentialSetup} onSuccess={handleSuccess} />
      )}
      {showPartnerSetup && (
        <PartnerCommissionSetup onClose={handleClosePartnerSetup} onSuccess={handleSuccess} />
      )}
      {showSalesAgentSetup && (
        <AccountLevelBasedCommissionSetup onClose={handleCloseSalesAgentSetup} onSuccess={handleSuccess} />
      )}
      {showBonusSetup && (
        <BonusCommissionSetup onClose={handleCloseBonusSetup} onSuccess={handleSuccess} />
      )}
      {showInitiateCommission && (
        <InitiateCommissionModal onClose={handleCloseInitiateCommission} onSuccess={handleSuccess} />
      )}
      
      {showTierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingTier ? "Edit Tier" : "Create Tier"}
              </h3>
              <button onClick={handleCloseTierModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitTier}>
              <div className="space-y-4">
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
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
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseTierModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#039994] rounded-md hover:bg-[#028884] disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : editingTier ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between mb-4">
          <button
            onClick={handleOpenTierModal}
            className="px-4 py-2 text-sm font-medium text-white bg-[#039994] rounded-md hover:bg-[#028884]"
          >
            Manage Tiers
          </button>
        </div>
        
        {tiers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Commission Tiers</h4>
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
                      <td className="px-3 py-2 text-sm text-gray-900">{tier.minAmount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {tier.maxAmount ? tier.maxAmount.toLocaleString() : "∞"}
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
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Commercial"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Commercial")}
              >
                Commercial
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Residential"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Residential")}
              >
                Residential
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Partner"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Partner")}
              >
                Partner
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "SalesAgent"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("SalesAgent")}
              >
                Account Level Based Referral Commission Structure
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Bonus"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Bonus")}
              >
                Bonus
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Summary"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Summary")}
              >
                Summary
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Versioning"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Versioning")}
              >
                Versioning & Audit
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Validation"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Validation")}
              >
                Validation Rules
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "Commercial" && (
              <CommercialCommissionStructure onSetupStructure={handleCommercialSetup} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === "Residential" && (
              <ResidentialCommissionStructure onSetupStructure={handleResidentialSetup} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === "Partner" && (
              <PartnerCommissionStructure onSetupStructure={handlePartnerSetup} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === "SalesAgent" && (
              <AccountLevelBasedCommissionStructure onSetupStructure={handleSalesAgentSetup} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === "Bonus" && (
              <BonusCommissionStructure onSetupStructure={handleBonusSetup} refreshTrigger={refreshTrigger} />
            )}
            {activeTab === "Summary" && (
              <CommissionSummary />
            )}
            {activeTab === "Versioning" && (
              <VersioningAndAudit />
            )}
            {activeTab === "Validation" && (
              <ValidationRules />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionStructure;