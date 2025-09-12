"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const CommercialCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    facilityShareWithReferral: {
      lessThan500k: 50.0,
      between500kTo2_5m: 50.0,
      moreThan2_5m: 50.0,
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
    facilityShareNoReferral: {
      lessThan500k: 55.0,
      between500kTo2_5m: 55.0,
      moreThan2_5m: 55.0,
    },
    durations: {
      maxDuration: 15,
      agreementDuration: 2,
      cancellationFee: 500,
    },
  });

  const [updating, setUpdating] = useState(false);

  const calculateRemainderWithInstaller = (tier) => {
    const facility = formValues.facilityShareWithReferral[tier];
    const installer = formValues.installerEPC[tier];
    return (100 - facility - installer).toFixed(1);
  };

  const calculateRemainderWithFinance = (tier) => {
    const facility = formValues.facilityShareWithReferral[tier];
    const finance = formValues.financeCompany[tier];
    return (100 - facility - finance).toFixed(1);
  };

  const calculateNoReferralRemainder = (tier) => {
    return (100 - formValues.facilityShareNoReferral[tier]).toFixed(1);
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
        const installerRemainder = parseFloat(calculateRemainderWithInstaller(tier));
        const financeRemainder = parseFloat(calculateRemainderWithFinance(tier));
        const noReferralRemainder = parseFloat(calculateNoReferralRemainder(tier));
        
        if (installerRemainder < 0) {
          validationErrors.push(`Installer/EPC total exceeds 100% in ${tier} tier`);
        }
        
        if (financeRemainder < 0) {
          validationErrors.push(`Finance Company total exceeds 100% in ${tier} tier`);
        }
        
        if (noReferralRemainder < 0) {
          validationErrors.push(`No referral facility share exceeds 100% in ${tier} tier`);
        }
      });
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success("Commercial commission structure updated successfully", {
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

  const renderPercentageInputs = (title, section, fields) => {
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
      </div>
    );
  };

  const renderVariableSection = (title, values) => {
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

  const installerRemainder = {
    lessThan500k: calculateRemainderWithInstaller("lessThan500k"),
    between500kTo2_5m: calculateRemainderWithInstaller("between500kTo2_5m"),
    moreThan2_5m: calculateRemainderWithInstaller("moreThan2_5m"),
  };

  const financeRemainder = {
    lessThan500k: calculateRemainderWithFinance("lessThan500k"),
    between500kTo2_5m: calculateRemainderWithFinance("between500kTo2_5m"),
    moreThan2_5m: calculateRemainderWithFinance("moreThan2_5m"),
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
            <h2 className="text-lg font-semibold text-[#039994]">Setup Commercial Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-[#1E1E1E] text-sm">With Partner Referral</h3>
          
          {renderPercentageInputs("Commercial Facility Share", "facilityShareWithReferral", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderPercentageInputs("When referred by Installer/EPC", "installerEPC", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (With Installer/EPC)", installerRemainder)}

          {renderPercentageInputs("When referred by Finance Company", "financeCompany", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (With Finance Company)", financeRemainder)}

          <h3 className="font-medium text-[#1E1E1E] text-sm">No Referral</h3>
          
          {renderPercentageInputs("Commercial Facility Share", "facilityShareNoReferral", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (No Referral)", noReferralRemainder)}

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

export default CommercialCommissionSetup;