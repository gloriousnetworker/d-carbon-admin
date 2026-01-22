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
    maxDuration: "",
    agreementYrs: "",
    cancellationFee: "",
    annualCap: "",
    notes: "",
  });
  
  const [epcShares, setEpcShares] = useState({
    epcAssistedFinanceShare: "",
    epcAssistedInstallerShare: ""
  });
  
  const [referredCustomerShare, setReferredCustomerShare] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

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
        maxDuration: editingCommission.maxDuration || "",
        agreementYrs: editingCommission.agreementYrs || "",
        cancellationFee: editingCommission.cancellationFee || "",
        annualCap: editingCommission.annualCap || "",
        notes: editingCommission.notes || "",
      });
    }
    
    if (!editingCommission && (mode === "PARTNER_INSTALLER" || mode === "PARTNER_FINANCE")) {
      fetchReferredCustomerShare();
    }
  }, [editingCommission, mode, propertyType]);

  const isDirectCustomerMode = formData.mode === "DIRECT_CUSTOMER";
  const isReferredCustomerMode = formData.mode === "REFERRED_CUSTOMER";
  const isPartnerInstallerMode = formData.mode === "PARTNER_INSTALLER";
  const isPartnerFinanceMode = formData.mode === "PARTNER_FINANCE";
  const isAccountLevel = formData.propertyType === "ACCOUNT_LEVEL";
  const isSalesAgentMode = formData.mode.includes("SALES_AGENT");

  const fetchReferredCustomerShare = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const property = propertyType === "ACCOUNT_LEVEL" ? "ACCOUNT_LEVEL" : propertyType;
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=REFERRED_CUSTOMER&property=${property}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setReferredCustomerShare(data[0].customerShare || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch referred customer share:", error);
    }
  };

  const calculateDCarbonRemainder = () => {
    if (isReferredCustomerMode) {
      return null;
    }
    
    let total = 0;
    
    if (isPartnerInstallerMode) {
      total += parseFloat(referredCustomerShare || 0);
      total += parseFloat(formData.installerShare || 0);
    } else if (isPartnerFinanceMode) {
      total += parseFloat(referredCustomerShare || 0);
      total += parseFloat(formData.financeShare || 0);
    } else if (isAccountLevel && isSalesAgentMode) {
      total += parseFloat(formData.salesAgentShare || 0);
      total += parseFloat(formData.financeShare || 0);
    } else if (isDirectCustomerMode) {
      total += parseFloat(formData.customerShare || 0);
    } else {
      total += parseFloat(formData.customerShare || 0);
      total += parseFloat(formData.installerShare || 0);
      total += parseFloat(formData.salesAgentShare || 0);
      total += parseFloat(formData.financeShare || 0);
    }
    
    const remainder = 100 - total;
    return remainder >= 0 ? remainder.toFixed(1) : "0.0";
  };

  const validateForm = () => {
    setValidationError("");
    
    if (isPartnerFinanceMode) {
      const financeShare = parseFloat(formData.financeShare || 0);
      const epcFinanceShare = parseFloat(epcShares.epcAssistedFinanceShare || 0);
      const epcInstallerShare = parseFloat(epcShares.epcAssistedInstallerShare || 0);
      const epcTotal = epcFinanceShare + epcInstallerShare;
      
      if (epcTotal > financeShare) {
        setValidationError(`EPC shares (${epcTotal.toFixed(1)}%) exceed Partner Finance share (${financeShare.toFixed(1)}%)`);
        return false;
      }
    }
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError("");
  };

  const handleEpcChange = (e) => {
    const { name, value } = e.target;
    setEpcShares((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError("");
  };

  const createCommissionStructure = async (payload, modeOverride = null) => {
    const authToken = localStorage.getItem("authToken");
    const finalPayload = {
      ...payload,
      mode: modeOverride || payload.mode,
    };
    
    const response = await fetch("https://services.dcarbon.solutions/api/commission-structure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(finalPayload),
    });
    
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tierId) {
      toast.error("Please select a tier");
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem("authToken");
      
      let basePayload = {
        propertyType: formData.propertyType,
        tierId: formData.tierId,
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null,
        agreementYrs: formData.agreementYrs ? parseInt(formData.agreementYrs) : null,
        cancellationFee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : null,
        annualCap: formData.annualCap ? parseFloat(formData.annualCap) : null,
        notes: formData.notes || "",
      };

      if (isPartnerFinanceMode) {
        const epcFinanceShare = parseFloat(epcShares.epcAssistedFinanceShare || 0);
        const epcInstallerShare = parseFloat(epcShares.epcAssistedInstallerShare || 0);
        
        if (epcFinanceShare > 0 || epcInstallerShare > 0) {
          let response;
          
          const referredCustomerPayload = {
            ...basePayload,
            mode: "REFERRED_CUSTOMER",
            customerShare: parseFloat(referredCustomerShare),
            installerShare: null,
            salesAgentShare: null,
            financeShare: null,
          };
          
          response = await createCommissionStructure(referredCustomerPayload);
          if (!response.ok) throw new Error("Failed to create referred customer structure");
          
          const partnerFinancePayload = {
            ...basePayload,
            mode: "PARTNER_FINANCE",
            customerShare: parseFloat(referredCustomerShare),
            installerShare: null,
            salesAgentShare: null,
            financeShare: formData.financeShare ? parseFloat(formData.financeShare) : null,
          };
          
          response = await createCommissionStructure(partnerFinancePayload);
          if (!response.ok) throw new Error("Failed to create partner finance structure");
          
          if (epcFinanceShare > 0) {
            const epcFinancePayload = {
              ...basePayload,
              mode: "EPC_ASSISTED_FINANCE",
              customerShare: parseFloat(referredCustomerShare),
              installerShare: null,
              salesAgentShare: null,
              financeShare: epcFinanceShare,
            };
            
            response = await createCommissionStructure(epcFinancePayload);
            if (!response.ok) throw new Error("Failed to create EPC assisted finance structure");
          }
          
          if (epcInstallerShare > 0) {
            const epcInstallerPayload = {
              ...basePayload,
              mode: "EPC_ASSISTED_INSTALLER",
              customerShare: parseFloat(referredCustomerShare),
              installerShare: epcInstallerShare,
              salesAgentShare: null,
              financeShare: null,
            };
            
            response = await createCommissionStructure(epcInstallerPayload);
            if (!response.ok) throw new Error("Failed to create EPC assisted installer structure");
          }
          
          toast.success("All commission structures created successfully");
          onSuccess();
          return;
        }
      }

      let payload = {
        ...basePayload,
        mode: formData.mode,
      };

      if (isDirectCustomerMode) {
        payload.customerShare = formData.customerShare ? parseFloat(formData.customerShare) : null;
        payload.installerShare = null;
        payload.salesAgentShare = null;
        payload.financeShare = null;
      } else if (isReferredCustomerMode) {
        payload.customerShare = formData.customerShare ? parseFloat(formData.customerShare) : null;
        payload.installerShare = null;
        payload.salesAgentShare = null;
        payload.financeShare = null;
      } else if (isPartnerInstallerMode) {
        payload.customerShare = referredCustomerShare ? parseFloat(referredCustomerShare) : null;
        payload.installerShare = formData.installerShare ? parseFloat(formData.installerShare) : null;
        payload.salesAgentShare = null;
        payload.financeShare = null;
      } else if (isAccountLevel && isSalesAgentMode) {
        payload.customerShare = null;
        payload.installerShare = null;
        payload.salesAgentShare = formData.salesAgentShare ? parseFloat(formData.salesAgentShare) : null;
        payload.financeShare = formData.financeShare ? parseFloat(formData.financeShare) : null;
      } else {
        payload.customerShare = formData.customerShare ? parseFloat(formData.customerShare) : null;
        payload.installerShare = formData.installerShare ? parseFloat(formData.installerShare) : null;
        payload.salesAgentShare = formData.salesAgentShare ? parseFloat(formData.salesAgentShare) : null;
        payload.financeShare = formData.financeShare ? parseFloat(formData.financeShare) : null;
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
        response = await createCommissionStructure(payload);
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
        </div>
      );
    }

    if (isReferredCustomerMode) {
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
        </div>
      );
    }

    if (isPartnerInstallerMode) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referred Customer Share (%)
            </label>
            <input
              type="number"
              value={referredCustomerShare}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
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
              required
            />
          </div>
        </div>
      );
    }

    if (isPartnerFinanceMode) {
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referred Customer Share (%)
            </label>
            <input
              type="number"
              value={referredCustomerShare}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner Finance Share (%)
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
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">EPC Assisted Settings</h4>
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EPC Assisted Finance (%)
                </label>
                <input
                  type="number"
                  name="epcAssistedFinanceShare"
                  value={epcShares.epcAssistedFinanceShare}
                  onChange={handleEpcChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.1"
                  min="0"
                  max={formData.financeShare || 100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EPC Assisted Installer (%)
                </label>
                <input
                  type="number"
                  name="epcAssistedInstallerShare"
                  value={epcShares.epcAssistedInstallerShare}
                  onChange={handleEpcChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.1"
                  min="0"
                  max={formData.financeShare || 100}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isAccountLevel && isSalesAgentMode) {
      return (
        <div className="grid grid-cols-2 gap-4">
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
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4">
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
      </div>
    );
  };

  const getCurrentTierLabel = () => {
    if (!formData.tierId) return "";
    const tier = tiers.find(t => t.id === formData.tierId);
    return tier ? `Tier ${tier.order}: ${tier.label}` : "";
  };

  const getShareFieldTitle = () => {
    if (isDirectCustomerMode) return "Share Distribution (Direct Customer)";
    if (isReferredCustomerMode) return "Share Distribution (Referred Customer)";
    if (isPartnerInstallerMode) return "Share Distribution (Partner Installer)";
    if (isPartnerFinanceMode) return "Share Distribution (Partner Finance)";
    if (isAccountLevel && isSalesAgentMode) return "Share Distribution (Sales Agent)";
    return "Share Distribution";
  };

  const dcarbonRemainder = calculateDCarbonRemainder();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              {editingCommission ? `Edit Commission Structure ${getCurrentTierLabel()}` : "Create Commission Structure"}
            </h2>
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
                  {modes.filter(mode => 
                    mode !== "EPC_ASSISTED_FINANCE" && 
                    mode !== "EPC_ASSISTED_INSTALLER"
                  ).map((modeOption) => (
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

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {getShareFieldTitle()}
                  </label>
                  {dcarbonRemainder !== null && (
                    <div className="text-sm font-medium text-gray-700">
                      DCarbon Remainder: {dcarbonRemainder}%
                    </div>
                  )}
                </div>
                {renderShareFields()}
                {validationError && (
                  <p className="text-sm text-red-600 mt-1">{validationError}</p>
                )}
                {isDirectCustomerMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    For Direct Customer mode, only Customer Share is applicable.
                  </p>
                )}
                {isReferredCustomerMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    For Referred Customer mode, only Customer Share is applicable.
                  </p>
                )}
                {isPartnerInstallerMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Referred Customer Share is read-only. Only Installer Share can be set.
                  </p>
                )}
                {isPartnerFinanceMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Referred Customer Share is read-only. EPC shares must not exceed Partner Finance share.
                  </p>
                )}
                {isAccountLevel && isSalesAgentMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    For Sales Agent modes, Sales Agent Share is required. Finance Share is optional.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  rows={3}
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