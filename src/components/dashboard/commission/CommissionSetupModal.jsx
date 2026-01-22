"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const CommissionSetupModal = ({
  onClose,
  onSuccess,
  tiers,
  modes,
  propertyType,
  mode,
  editingCommission,
}) => {
  const [formData, setFormData] = useState({
    propertyType: propertyType,
    mode: mode,
    tierId: "",
    customerShare: "",
    installerShare: "",
    salesAgentShare: "",
    financeShare: "",
    epcFinanceShare: "",
    epcInstallerShare: "",
    maxDuration: "",
    agreementYrs: "",
    cancellationFee: "",
    annualCap: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingCommission) {
      setFormData({
        propertyType: editingCommission.propertyType,
        mode: editingCommission.mode,
        tierId: editingCommission.tierId,
        customerShare: editingCommission.customerShare || "",
        installerShare: editingCommission.installerShare || "",
        salesAgentShare: editingCommission.salesAgentShare || "",
        financeShare: editingCommission.financeShare || "",
        epcFinanceShare: editingCommission.epcFinanceShare || "",
        epcInstallerShare: editingCommission.epcInstallerShare || "",
        maxDuration: editingCommission.maxDuration || "",
        agreementYrs: editingCommission.agreementYrs || "",
        cancellationFee: editingCommission.cancellationFee || "",
        annualCap: editingCommission.annualCap || "",
        notes: editingCommission.notes || "",
      });
    }
  }, [editingCommission]);

  const isDirectCustomerMode = formData.mode === "DIRECT_CUSTOMER";
  const isReferredCustomerMode = formData.mode === "REFERRED_CUSTOMER";
  const isPartnerInstallerMode = formData.mode === "PARTNER_INSTALLER";
  const isPartnerFinanceMode = formData.mode === "PARTNER_FINANCE";
  const isAccountLevel = formData.propertyType === "ACCOUNT_LEVEL";
  const isSalesAgentMode = formData.mode.includes("SALES_AGENT");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateCommissionTotals = () => {
    if (isDirectCustomerMode) {
      const total = parseFloat(formData.customerShare) || 0;
      if (total > 100) {
        toast.error("Customer share cannot exceed 100%");
        return false;
      }
    }

    if (isReferredCustomerMode) {
      const customer = parseFloat(formData.customerShare) || 0;
      const installer = parseFloat(formData.installerShare) || 0;
      const finance = parseFloat(formData.financeShare) || 0;
      const total = customer + installer + finance;
      
      if (total > 100) {
        toast.error("Total commission cannot exceed 100%");
        return false;
      }
    }

    if (isPartnerInstallerMode) {
      const installer = parseFloat(formData.installerShare) || 0;
      if (installer > 100) {
        toast.error("Installer share cannot exceed 100%");
        return false;
      }
    }

    if (isPartnerFinanceMode) {
      const finance = parseFloat(formData.financeShare) || 0;
      const epcFinance = parseFloat(formData.epcFinanceShare) || 0;
      const epcInstaller = parseFloat(formData.epcInstallerShare) || 0;
      
      if (finance > 100) {
        toast.error("Finance share cannot exceed 100%");
        return false;
      }
      
      if (epcFinance + epcInstaller > finance) {
        toast.error("EPC split cannot exceed Finance share");
        return false;
      }
    }

    if (isAccountLevel && isSalesAgentMode) {
      const salesAgent = parseFloat(formData.salesAgentShare) || 0;
      const finance = parseFloat(formData.financeShare) || 0;
      const total = salesAgent + finance;
      
      if (total > 100) {
        toast.error("Total commission cannot exceed 100%");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tierId) {
      toast.error("Please select a tier");
      return;
    }

    if (!validateCommissionTotals()) {
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      
      let payload = {
        ...formData,
        customerShare: formData.customerShare ? parseFloat(formData.customerShare) : null,
        installerShare: formData.installerShare ? parseFloat(formData.installerShare) : null,
        salesAgentShare: formData.salesAgentShare ? parseFloat(formData.salesAgentShare) : null,
        financeShare: formData.financeShare ? parseFloat(formData.financeShare) : null,
        epcFinanceShare: formData.epcFinanceShare ? parseFloat(formData.epcFinanceShare) : null,
        epcInstallerShare: formData.epcInstallerShare ? parseFloat(formData.epcInstallerShare) : null,
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null,
        agreementYrs: formData.agreementYrs ? parseInt(formData.agreementYrs) : null,
        cancellationFee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : null,
        annualCap: formData.annualCap ? parseFloat(formData.annualCap) : null,
      };

      if (isPartnerInstallerMode) {
        payload.customerShare = null;
        payload.financeShare = null;
        payload.epcFinanceShare = null;
        payload.epcInstallerShare = null;
      }

      if (isPartnerFinanceMode) {
        payload.customerShare = null;
        payload.installerShare = null;
      }

      let response;
      if (editingCommission) {
        response = await fetch(
          `https://services.dcarbon.solutions/api/commission-structure/${editingCommission.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        response = await fetch("https://services.dcarbon.solutions/api/commission-structure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast.success(
          editingCommission
            ? "Commission structure updated successfully"
            : "Commission structure created successfully"
        );
        onSuccess();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Operation failed");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingPercentage = () => {
    if (isDirectCustomerMode) {
      const customer = parseFloat(formData.customerShare) || 0;
      const remaining = (100 - customer).toFixed(2);
      return remaining >= 0 ? remaining : 0;
    }

    if (isReferredCustomerMode) {
      const customer = parseFloat(formData.customerShare) || 0;
      const installer = parseFloat(formData.installerShare) || 0;
      const finance = parseFloat(formData.financeShare) || 0;
      const total = customer + installer + finance;
      const remaining = (100 - total).toFixed(2);
      return remaining >= 0 ? remaining : 0;
    }

    if (isPartnerInstallerMode) {
      const installer = parseFloat(formData.installerShare) || 0;
      const remaining = (100 - installer).toFixed(2);
      return remaining >= 0 ? remaining : 0;
    }

    if (isPartnerFinanceMode) {
      const finance = parseFloat(formData.financeShare) || 0;
      const remaining = (100 - finance).toFixed(2);
      return remaining >= 0 ? remaining : 0;
    }

    if (isAccountLevel && isSalesAgentMode) {
      const salesAgent = parseFloat(formData.salesAgentShare) || 0;
      const finance = parseFloat(formData.financeShare) || 0;
      const total = salesAgent + finance;
      const remaining = (100 - total).toFixed(2);
      return remaining >= 0 ? remaining : 0;
    }

    return 100;
  };

  const renderShareFields = () => {
    if (isDirectCustomerMode) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Share (%)
          </label>
          <input
            type="number"
            name="customerShare"
            value={formData.customerShare}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="100"
            required
          />
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{formData.customerShare || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>DCarbon Remainder:</span>
              <span className="font-medium">{calculateRemainingPercentage()}%</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      );
    }

    if (isReferredCustomerMode) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Share (%)
            </label>
            <input
              type="number"
              name="customerShare"
              value={formData.customerShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.1"
              min="0"
              max="100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installer Share (%)
            </label>
            <input
              type="number"
              name="installerShare"
              value={formData.installerShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finance Share (%)
            </label>
            <input
              type="number"
              name="financeShare"
              value={formData.financeShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{formData.customerShare || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Installer:</span>
                <span>{formData.installerShare || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Finance:</span>
                <span>{formData.financeShare || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>DCarbon Remainder:</span>
                <span className="font-medium">{calculateRemainingPercentage()}%</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1 mt-1">
                <span>Total:</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isPartnerInstallerMode) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Installer Share (%)
          </label>
          <input
            type="number"
            name="installerShare"
            value={formData.installerShare}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            step="0.1"
            min="0"
            max="100"
            required
          />
          <div className="mt-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Installer:</span>
              <span>{formData.installerShare || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>DCarbon Remainder:</span>
              <span className="font-medium">{calculateRemainingPercentage()}%</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      );
    }

    if (isPartnerFinanceMode) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finance Share (%)
            </label>
            <input
              type="number"
              name="financeShare"
              value={formData.financeShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.1"
              min="0"
              max="100"
              required
            />
          </div>
          <div className="pl-4 border-l-2 border-[#039994]">
            <h4 className="text-sm font-medium text-gray-700 mb-2">EPC Split</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  EPC Finance Share (%)
                </label>
                <input
                  type="number"
                  name="epcFinanceShare"
                  value={formData.epcFinanceShare}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.1"
                  min="0"
                  max={formData.financeShare || 100}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  EPC Installer Share (%)
                </label>
                <input
                  type="number"
                  name="epcInstallerShare"
                  value={formData.epcInstallerShare}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.1"
                  min="0"
                  max={formData.financeShare || 100}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              EPC split must not exceed Finance share
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Finance:</span>
                <span>{formData.financeShare || 0}%</span>
              </div>
              <div className="flex justify-between text-xs pl-4">
                <span className="text-gray-500">EPC Finance:</span>
                <span className="text-gray-500">{formData.epcFinanceShare || 0}%</span>
              </div>
              <div className="flex justify-between text-xs pl-4">
                <span className="text-gray-500">EPC Installer:</span>
                <span className="text-gray-500">{formData.epcInstallerShare || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>DCarbon Remainder:</span>
                <span className="font-medium">{calculateRemainingPercentage()}%</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1 mt-1">
                <span>Total:</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isAccountLevel && isSalesAgentMode) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales Agent Share (%)
            </label>
            <input
              type="number"
              name="salesAgentShare"
              value={formData.salesAgentShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.1"
              min="0"
              max="100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finance Share (%)
            </label>
            <input
              type="number"
              name="financeShare"
              value={formData.financeShare}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Sales Agent:</span>
                <span>{formData.salesAgentShare || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>Finance:</span>
                <span>{formData.financeShare || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span>DCarbon Remainder:</span>
                <span className="font-medium">{calculateRemainingPercentage()}%</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1 mt-1">
                <span>Total:</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-700">
          Please select a commission mode to configure shares.
        </p>
      </div>
    );
  };

  const getCurrentTierLabel = () => {
    if (!formData.tierId) return "";
    const tier = tiers.find(t => t.id === formData.tierId);
    return tier ? `Tier ${tier.order}: ${tier.label}` : "";
  };

  const getModalTitle = () => {
    if (editingCommission) {
      return `Edit Commission Structure ${getCurrentTierLabel()}`;
    }
    return "Create Commission Structure";
  };

  const getModeDescription = () => {
    if (isDirectCustomerMode) return "Direct Customer - No referrals";
    if (isReferredCustomerMode) return "Referred Customer - Customer referred by partners";
    if (isPartnerInstallerMode) return "Partner Installer - Installer partner share only";
    if (isPartnerFinanceMode) return "Partner Finance - Finance partner share with EPC split";
    if (isAccountLevel && isSalesAgentMode) return "Sales Agent Commission";
    return "";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">{getModalTitle()}</h2>
              {getModeDescription() && (
                <p className="text-xs text-gray-500">{getModeDescription()}</p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!!editingCommission}
                >
                  <option value="COMMERCIAL">COMMERCIAL</option>
                  <option value="RESIDENTIAL">RESIDENTIAL</option>
                  <option value="ACCOUNT_LEVEL">ACCOUNT LEVEL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Mode
                </label>
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!!editingCommission}
                >
                  {modes.map((modeOption) => (
                    <option key={modeOption} value={modeOption}>
                      {modeOption.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Commission Tier
                </label>
                <select
                  name="tierId"
                  value={formData.tierId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!!editingCommission}
                >
                  <option value="">Select a tier</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label} (Order: {tier.order})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Commission Distribution
                </label>
                {renderShareFields()}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Duration (Years)
                  </label>
                  <input
                    type="number"
                    name="maxDuration"
                    value={formData.maxDuration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agreement Years
                  </label>
                  <input
                    type="number"
                    name="agreementYrs"
                    value={formData.agreementYrs}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cancellation Fee
                  </label>
                  <input
                    type="number"
                    name="cancellationFee"
                    value={formData.cancellationFee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Cap</label>
                <input
                  type="number"
                  name="annualCap"
                  value={formData.annualCap}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-[#039994] rounded-md hover:bg-[#028884] disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : editingCommission
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommissionSetupModal;