"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const ResidentialCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    customerShare: {
      lessThan500k: 50.0,
      between500kTo2_5m: 50.0,
      moreThan2_5m: 50.0,
    },
    salesAgent: {
      lessThan500k: 1.0,
      between500kTo2_5m: 1.0,
      moreThan2_5m: 1.0,
    },
    installerEPC: {
      lessThan500k: 5.0,
      between500kTo2_5m: 5.0,
      moreThan2_5m: 5.0,
    },
    financeCompany: {
      lessThan500k: 5.0,
      between500kTo2_5m: 5.0,
      moreThan2_5m: 5.0,
    },
    noReferralCustomer: {
      lessThan500k: 55.0,
      between500kTo2_5m: 55.0,
      moreThan2_5m: 55.0,
    },
    durations: {
      maxDuration: 15,
      agreementDuration: 2,
      cancellationFee: 250,
    },
  });

  const [updating, setUpdating] = useState(false);

  const calculatePartnerTotal = (tier) => {
    const customer = formValues.customerShare[tier];
    const salesAgent = formValues.salesAgent[tier];
    const installerEPC = formValues.installerEPC[tier];
    const financeCompany = formValues.financeCompany[tier];
    
    return (customer + salesAgent + installerEPC + financeCompany).toFixed(1);
  };

  const calculateCompanyRemainder = (tier) => {
    return (100 - parseFloat(calculatePartnerTotal(tier))).toFixed(1);
  };

  const calculateNoReferralRemainder = (tier) => {
    return (100 - formValues.noReferralCustomer[tier]).toFixed(1);
  };

  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
        const total = parseFloat(calculatePartnerTotal(tier));
        
        if (total > 100) {
          validationErrors.push(`Total exceeds 100% in ${tier} tier`);
        }
        
        if (formValues.noReferralCustomer[tier] > 100) {
          validationErrors.push(`No referral customer share exceeds 100% in ${tier} tier`);
        }
      });
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success("Residential commission structure updated successfully", {
        position: 'top-center',
        duration: 3000,
      });
    } catch (err) {
      toast.error(`Validation failed: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderPercentageInputs = (title, section, fields, showTotal = false) => {
    return (
      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">{field.label}</label>
              <input
                type="number"
                step="0.1"
                value={formValues[section][field.key]}
                onChange={(e) => handleInputChange(section, field.key, e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
                max="100"
              />
            </div>
          ))}
        </div>
        {showTotal && (
          <div className="mt-3 p-2 bg-blue-50 rounded">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Total ($500k)</label>
                <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                  {calculatePartnerTotal("lessThan500k")}%
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Total ($500k-$2.5M)</label>
                <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                  {calculatePartnerTotal("between500kTo2_5m")}%
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Total ($2.5M)</label>
                <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                  {calculatePartnerTotal("moreThan2_5m")}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVariableSection = (title, values, isNoReferral = false) => {
    return (
      <div className="mb-6 p-3 bg-blue-50 rounded">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
        <p className="text-xs text-gray-600 mb-3">
          This remainder is automatically calculated to make the total 100%.
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {values.lessThan500k}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {values.between500kTo2_5m}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {values.moreThan2_5m}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDurationInputs = () => {
    return (
      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Durations & Terms</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
            <input
              type="number"
              value={formValues.durations.maxDuration}
              onChange={(e) => handleInputChange("durations", "maxDuration", e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
            <input
              type="number"
              value={formValues.durations.agreementDuration}
              onChange={(e) => handleInputChange("durations", "agreementDuration", e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">Cancellation Fee ($)</label>
            <input
              type="number"
              value={formValues.durations.cancellationFee}
              onChange={(e) => handleInputChange("durations", "cancellationFee", e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
            />
          </div>
        </div>
      </div>
    );
  };

  const companyRemainder = {
    lessThan500k: calculateCompanyRemainder("lessThan500k"),
    between500kTo2_5m: calculateCompanyRemainder("between500kTo2_5m"),
    moreThan2_5m: calculateCompanyRemainder("moreThan2_5m"),
  };

  const noReferralRemainder = {
    lessThan500k: calculateNoReferralRemainder("lessThan500k"),
    between500kTo2_5m: calculateNoReferralRemainder("between500kTo2_5m"),
    moreThan2_5m: calculateNoReferralRemainder("moreThan2_5m"),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Residential Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {renderPercentageInputs("Residential Customer Share", "customerShare", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ], true)}

          <h3 className="font-medium text-[#1E1E1E] text-sm">When Referred by Partner</h3>
          
          {renderPercentageInputs("Sales Agent", "salesAgent", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderPercentageInputs("Installer / EPC", "installerEPC", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderPercentageInputs("Finance Company", "financeCompany", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (Variable)", companyRemainder)}

          <h3 className="font-medium text-[#1E1E1E] text-sm">When No Referral</h3>
          
          {renderPercentageInputs("Residential Customer Share", "noReferralCustomer", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (Variable)", noReferralRemainder, true)}

          {renderDurationInputs()}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`px-4 py-2 rounded-md text-sm ${
              updating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#039994] hover:bg-[#028B86]'
            } text-white transition-colors`}
          >
            {updating ? 'Validating...' : 'Validate & Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentialCommissionSetup;