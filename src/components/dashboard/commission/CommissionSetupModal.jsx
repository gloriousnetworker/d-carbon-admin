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
  
  const [partnerFinanceData, setPartnerFinanceData] = useState({
    partnerFinanceTotal: "",
    epcAssistedFinanceShare: "",
    epcAssistedInstallerShare: ""
  });
  
  const [referredCustomerShare, setReferredCustomerShare] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [existingPartnerFinance, setExistingPartnerFinance] = useState(null);

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

      if (editingCommission.mode === "PARTNER_FINANCE") {
        fetchExistingEpcShares(editingCommission);
        setExistingPartnerFinance(editingCommission);
      }
    }
    
    if (!editingCommission && (mode === "PARTNER_INSTALLER" || mode === "PARTNER_FINANCE")) {
      fetchReferredCustomerShare();
    }
  }, [editingCommission, mode, propertyType]);

  const fetchExistingEpcShares = async (commission) => {
    try {
      const authToken = localStorage.getItem("authToken");
      
      const epcFinanceResponse = await fetch(
        `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=EPC_ASSISTED_FINANCE&property=${commission.propertyType}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      
      const epcInstallerResponse = await fetch(
        `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=EPC_ASSISTED_INSTALLER&property=${commission.propertyType}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (epcFinanceResponse.ok && epcInstallerResponse.ok) {
        const epcFinanceData = await epcFinanceResponse.json();
        const epcInstallerData = await epcInstallerResponse.json();
        
        const tierEpcFinance = epcFinanceData.find(item => item.tierId === commission.tierId);
        const tierEpcInstaller = epcInstallerData.find(item => item.tierId === commission.tierId);
        
        const epcFinanceShare = tierEpcFinance?.financeShare || "";
        const epcInstallerShare = tierEpcInstaller?.installerShare || "";
        const partnerFinanceTotal = parseFloat(epcFinanceShare || 0) + parseFloat(epcInstallerShare || 0);
        
        setPartnerFinanceData({
          partnerFinanceTotal: partnerFinanceTotal > 0 ? partnerFinanceTotal.toString() : "",
          epcAssistedFinanceShare: epcFinanceShare,
          epcAssistedInstallerShare: epcInstallerShare
        });
      }
    } catch (error) {
      console.error("Failed to fetch existing EPC shares:", error);
    }
  };

  const isDirectCustomerMode = formData.mode === "DIRECT_CUSTOMER";
  const isReferredCustomerMode = formData.mode === "REFERRED_CUSTOMER";
  const isPartnerInstallerMode = formData.mode === "PARTNER_INSTALLER";
  const isPartnerFinanceMode = formData.mode === "PARTNER_FINANCE";
  const isAccountLevel = formData.propertyType === "ACCOUNT_LEVEL";
  const isSalesAgentMode = formData.mode.includes("SALES_AGENT");

  useEffect(() => {
    if ((isPartnerFinanceMode || isPartnerInstallerMode) && formData.tierId) {
      fetchReferredCustomerShare();
    }
  }, [formData.tierId, isPartnerFinanceMode, isPartnerInstallerMode]);

  const fetchReferredCustomerShare = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const property = formData.propertyType === "ACCOUNT_LEVEL" ? "ACCOUNT_LEVEL" : formData.propertyType;
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=REFERRED_CUSTOMER&property=${property}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const tierData = data.find(item => item.tierId === formData.tierId);
        setReferredCustomerShare(tierData?.customerShare || "");
      }
    } catch (error) {
      console.error("Failed to fetch referred customer share:", error);
      setReferredCustomerShare("");
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
      total += parseFloat(partnerFinanceData.partnerFinanceTotal || 0);
    } else if (isAccountLevel && isSalesAgentMode) {
      total += parseFloat(formData.salesAgentShare || 0);
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
      const partnerTotal = parseFloat(partnerFinanceData.partnerFinanceTotal || 0);
      const referredShare = parseFloat(referredCustomerShare || 0);
      const epcFinanceShare = parseFloat(partnerFinanceData.epcAssistedFinanceShare || 0);
      const epcInstallerShare = parseFloat(partnerFinanceData.epcAssistedInstallerShare || 0);
      
      if (!referredCustomerShare) {
        setValidationError("Referred Customer Share is required. Please ensure a REFERRED_CUSTOMER structure exists for this tier.");
        return false;
      }
      
      const totalAllocation = referredShare + partnerTotal;
      if (totalAllocation > 100) {
        setValidationError(`Total allocation (${totalAllocation}%) exceeds 100%. Available after Referred Customer: ${100 - referredShare}%`);
        return false;
      }
      
      if (epcFinanceShare + epcInstallerShare > partnerTotal) {
        setValidationError(`EPC shares (${epcFinanceShare + epcInstallerShare}%) exceed Partner Finance Total (${partnerTotal}%)`);
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

  const handlePartnerFinanceChange = (e) => {
    const { name, value } = e.target;
    setPartnerFinanceData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError("");
  };

  const createCommissionStructure = async (payload) => {
    const authToken = localStorage.getItem("authToken");
    
    const response = await fetch("https://services.dcarbon.solutions/api/commission-structure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
    
    return response;
  };

  const updateCommissionStructure = async (id, payload) => {
    const authToken = localStorage.getItem("authToken");
    
    const response = await fetch(`https://services.dcarbon.solutions/api/commission-structure/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
    
    return response;
  };

  const updatePartnerFinanceWithEpcShares = async () => {
    const referredShare = parseFloat(referredCustomerShare);
    const partnerTotal = parseFloat(partnerFinanceData.partnerFinanceTotal || 0);
    const dcarbonRemainder = 100 - (referredShare + partnerTotal);
    
    const epcFinanceShare = parseFloat(partnerFinanceData.epcAssistedFinanceShare || 0);
    const epcInstallerShare = parseFloat(partnerFinanceData.epcAssistedInstallerShare || 0);
    
    const basePayload = {
      propertyType: formData.propertyType,
      tierId: formData.tierId,
      maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null,
      agreementYrs: formData.agreementYrs ? parseInt(formData.agreementYrs) : null,
      cancellationFee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : null,
      annualCap: formData.annualCap ? parseFloat(formData.annualCap) : null,
      notes: formData.notes || "",
    };

    const authToken = localStorage.getItem("authToken");
    
    const getRelatedIds = async () => {
      try {
        const epcFinanceResponse = await fetch(
          `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=EPC_ASSISTED_FINANCE&property=${formData.propertyType}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        
        const epcInstallerResponse = await fetch(
          `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=EPC_ASSISTED_INSTALLER&property=${formData.propertyType}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        const partnerFinanceResponse = await fetch(
          `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=PARTNER_FINANCE&property=${formData.propertyType}`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        if (epcFinanceResponse.ok && epcInstallerResponse.ok && partnerFinanceResponse.ok) {
          const epcFinanceData = await epcFinanceResponse.json();
          const epcInstallerData = await epcInstallerResponse.json();
          const partnerFinanceData = await partnerFinanceResponse.json();
          
          const tierEpcFinance = epcFinanceData.find(item => item.tierId === formData.tierId);
          const tierEpcInstaller = epcInstallerData.find(item => item.tierId === formData.tierId);
          const tierPartnerFinance = partnerFinanceData.find(item => item.tierId === formData.tierId);
          
          return {
            epcFinanceId: tierEpcFinance?.id,
            epcInstallerId: tierEpcInstaller?.id,
            partnerFinanceId: tierPartnerFinance?.id
          };
        }
      } catch (error) {
        console.error("Failed to fetch related IDs:", error);
        return { epcFinanceId: null, epcInstallerId: null, partnerFinanceId: null };
      }
    };

    const relatedIds = await getRelatedIds();
    
    const partnerFinancePayload = {
      ...basePayload,
      mode: "PARTNER_FINANCE",
      customerShare: referredShare,
      installerShare: epcInstallerShare,
      salesAgentShare: null,
      financeShare: epcFinanceShare,
      dcarbonShare: dcarbonRemainder,
    };

    let partnerResponse;
    if (relatedIds.partnerFinanceId) {
      partnerResponse = await updateCommissionStructure(relatedIds.partnerFinanceId, partnerFinancePayload);
    } else {
      partnerResponse = await createCommissionStructure(partnerFinancePayload);
    }
    
    if (partnerTotal > 0) {
      if (epcFinanceShare > 0) {
        const epcFinancePayload = {
          ...basePayload,
          mode: "EPC_ASSISTED_FINANCE",
          customerShare: null,
          installerShare: null,
          salesAgentShare: null,
          financeShare: epcFinanceShare,
          dcarbonShare: null,
        };
        
        if (relatedIds.epcFinanceId) {
          await updateCommissionStructure(relatedIds.epcFinanceId, epcFinancePayload);
        } else {
          await createCommissionStructure(epcFinancePayload);
        }
      } else if (relatedIds.epcFinanceId) {
        await fetch(`https://services.dcarbon.solutions/api/commission-structure/${relatedIds.epcFinanceId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }

      if (epcInstallerShare > 0) {
        const epcInstallerPayload = {
          ...basePayload,
          mode: "EPC_ASSISTED_INSTALLER",
          customerShare: null,
          installerShare: epcInstallerShare,
          salesAgentShare: null,
          financeShare: null,
          dcarbonShare: null,
        };
        
        if (relatedIds.epcInstallerId) {
          await updateCommissionStructure(relatedIds.epcInstallerId, epcInstallerPayload);
        } else {
          await createCommissionStructure(epcInstallerPayload);
        }
      } else if (relatedIds.epcInstallerId) {
        await fetch(`https://services.dcarbon.solutions/api/commission-structure/${relatedIds.epcInstallerId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    } else {
      if (relatedIds.epcFinanceId) {
        await fetch(`https://services.dcarbon.solutions/api/commission-structure/${relatedIds.epcFinanceId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
      
      if (relatedIds.epcInstallerId) {
        await fetch(`https://services.dcarbon.solutions/api/commission-structure/${relatedIds.epcInstallerId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        });
      }
    }
    
    return partnerResponse;
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
      if (isPartnerFinanceMode) {
        const response = await updatePartnerFinanceWithEpcShares();
        if (response.ok) {
          toast.success(
            existingPartnerFinance
              ? "Partner Finance structure updated successfully"
              : "Partner Finance structure created successfully"
          );
          onSuccess();
        } else {
          const error = await response.json();
          throw new Error(error.message || "Operation failed");
        }
        return;
      }

      let basePayload = {
        propertyType: formData.propertyType,
        tierId: formData.tierId,
        maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null,
        agreementYrs: formData.agreementYrs ? parseInt(formData.agreementYrs) : null,
        cancellationFee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : null,
        annualCap: formData.annualCap ? parseFloat(formData.annualCap) : null,
        notes: formData.notes || "",
      };

      let payload = {
        ...basePayload,
        mode: formData.mode,
      };

      if (isDirectCustomerMode) {
        payload.customerShare = formData.customerShare ? parseFloat(formData.customerShare) : null;
        payload.installerShare = null;
        payload.salesAgentShare = null;
        payload.financeShare = null;
        payload.dcarbonShare = null;
      } else if (isReferredCustomerMode) {
        payload.customerShare = formData.customerShare ? parseFloat(formData.customerShare) : null;
        payload.installerShare = null;
        payload.salesAgentShare = null;
        payload.financeShare = null;
        payload.dcarbonShare = null;
      } else if (isPartnerInstallerMode) {
        payload.customerShare = referredCustomerShare ? parseFloat(referredCustomerShare) : null;
        payload.installerShare = formData.installerShare ? parseFloat(formData.installerShare) : null;
        payload.salesAgentShare = null;
        payload.financeShare = null;
        payload.dcarbonShare = 100 - (parseFloat(referredCustomerShare || 0) + parseFloat(formData.installerShare || 0));
      } else if (isAccountLevel && isSalesAgentMode) {
        payload.customerShare = null;
        payload.installerShare = null;
        payload.salesAgentShare = formData.salesAgentShare ? parseFloat(formData.salesAgentShare) : null;
        payload.financeShare = null;
        payload.dcarbonShare = null;
      } else {
        payload.customerShare = formData.customerShare ? parseFloat(formData.customerShare) : null;
        payload.installerShare = formData.installerShare ? parseFloat(formData.installerShare) : null;
        payload.salesAgentShare = formData.salesAgentShare ? parseFloat(formData.salesAgentShare) : null;
        payload.financeShare = formData.financeShare ? parseFloat(formData.financeShare) : null;
        payload.dcarbonShare = null;
      }

      let response;
      if (editingCommission) {
        response = await updateCommissionStructure(editingCommission.id, payload);
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
            Referred Customer Share (%)
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
              max={100 - parseFloat(referredCustomerShare || 0)}
              required
            />
          </div>
        </div>
      );
    }

    if (isPartnerFinanceMode) {
      const referredShare = parseFloat(referredCustomerShare || 0);
      const partnerTotal = parseFloat(partnerFinanceData.partnerFinanceTotal || 0);
      const availableAllocation = 100 - referredShare;
      const epcFinanceShare = parseFloat(partnerFinanceData.epcAssistedFinanceShare || 0);
      const epcInstallerShare = parseFloat(partnerFinanceData.epcAssistedInstallerShare || 0);
      
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
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Partner Finance Settings</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner Finance Total Share (%)
              </label>
              <input
                type="number"
                name="partnerFinanceTotal"
                value={partnerFinanceData.partnerFinanceTotal}
                onChange={handlePartnerFinanceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                step="0.1"
                min="0"
                max={availableAllocation}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available allocation after Referred Customer: {availableAllocation}%
              </p>
            </div>
            
            {partnerFinanceData.partnerFinanceTotal && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h5 className="text-sm font-medium text-gray-700 mb-2">EPC Shares Distribution</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      EPC Assisted Finance (%)
                    </label>
                    <input
                      type="number"
                      name="epcAssistedFinanceShare"
                      value={partnerFinanceData.epcAssistedFinanceShare}
                      onChange={handlePartnerFinanceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.1"
                      min="0"
                      max={partnerTotal}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      EPC Assisted Installer (%)
                    </label>
                    <input
                      type="number"
                      name="epcAssistedInstallerShare"
                      value={partnerFinanceData.epcAssistedInstallerShare}
                      onChange={handlePartnerFinanceChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      step="0.1"
                      min="0"
                      max={partnerTotal}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <div>EPC Finance: {epcFinanceShare}%</div>
                  <div>EPC Installer: {epcInstallerShare}%</div>
                  <div className="font-medium mt-1">EPC Total: {epcFinanceShare + epcInstallerShare}% of {partnerTotal}%</div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (isAccountLevel && isSalesAgentMode) {
      return (
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

  const filteredModes = modes.filter(mode => 
    mode !== "EPC_ASSISTED_FINANCE" && 
    mode !== "EPC_ASSISTED_INSTALLER"
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              {editingCommission ? `Edit ${formData.mode.replace(/_/g, ' ')} Structure ${getCurrentTierLabel()}` : "Create Commission Structure"}
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
                  {filteredModes.map((modeOption) => (
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
                    For Referred Customer mode, only Referred Customer Share is applicable.
                  </p>
                )}
                {isPartnerInstallerMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Referred Customer Share is read-only. Only Installer Share can be set.
                  </p>
                )}
                {isPartnerFinanceMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Partner Finance Total can be set independently. EPC shares must not exceed Partner Finance Total.
                  </p>
                )}
                {isAccountLevel && isSalesAgentMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    For Sales Agent modes, only Sales Agent Share is applicable.
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