"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const BonusCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    quarterlyCommercial: {
      lessThan500k: 1.0,
      between500kTo2_5m: 1.5,
      moreThan2_5m: 2.0,
      maxDuration: 3,
      agreementDuration: 1
    },
    quarterlyResidential: {
      lessThan500k: 0.5,
      between500kTo2_5m: 0.5,
      moreThan2_5m: 0.5,
      maxDuration: 2,
      agreementDuration: 1
    },
    annualBonus: {
      lessThan500k: 1.0,
      between500kTo2_5m: 1.0,
      moreThan2_5m: 1.0,
      maxDuration: 5,
      agreementDuration: 1
    },
    notes: ""
  });

  const [updating, setUpdating] = useState(false);

  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleTextArea = (value) => {
    setFormValues(prev => ({ ...prev, notes: value }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      ["quarterlyCommercial", "quarterlyResidential", "annualBonus"].forEach(section => {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          const value = formValues[section][tier];
          if (value < 0 || value > 100) {
            validationErrors.push(`${section} ${tier} must be between 0-100%`);
          }
        });
        
        if (formValues[section].maxDuration < 0) {
          validationErrors.push(`${section} max duration must be ≥ 0`);
        }
        if (formValues[section].agreementDuration < 0) {
          validationErrors.push(`${section} agreement duration must be ≥ 0`);
        }
      });
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success("Bonus commission structure updated successfully", {
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

  const renderBonusSection = (title, section) => (
    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">{title}</h3>
      <div className="grid grid-cols-5 gap-4 text-xs">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
          <input
            type="number"
            step="0.1"
            value={formValues[section].lessThan500k}
            onChange={(e) => handleInputChange(section, "lessThan500k", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
            max="100"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
          <input
            type="number"
            step="0.1"
            value={formValues[section].between500kTo2_5m}
            onChange={(e) => handleInputChange(section, "between500kTo2_5m", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
            max="100"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
          <input
            type="number"
            step="0.1"
            value={formValues[section].moreThan2_5m}
            onChange={(e) => handleInputChange(section, "moreThan2_5m", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
            max="100"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
          <input
            type="number"
            value={formValues[section].maxDuration}
            onChange={(e) => handleInputChange(section, "maxDuration", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
          <input
            type="number"
            value={formValues[section].agreementDuration}
            onChange={(e) => handleInputChange(section, "agreementDuration", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Bonus Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {renderBonusSection("Quarterly Bonus — Commercial", "quarterlyCommercial")}
          {renderBonusSection("Bonus — Residential", "quarterlyResidential")}
          {renderBonusSection("Annual Bonus", "annualBonus")}

          <div className="mb-6">
            <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
            <textarea
              value={formValues.notes}
              onChange={(e) => handleTextArea(e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
              placeholder="Additional notes..."
            />
          </div>
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

export default BonusCommissionSetup;