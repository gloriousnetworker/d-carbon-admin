"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const BonusCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    quarterlyCommercial: [
      { threshold: "< 1 MW", bonus: 1.0 },
      { threshold: "1 - 5 MW", bonus: 1.5 },
      { threshold: "> 5 MW", bonus: 2.0 }
    ],
    quarterlyResidential: [
      { threshold: "5-10 referrals", bonus: 0.5 },
      { threshold: "11-20 referrals", bonus: 1.0 },
      { threshold: ">20 referrals", bonus: 1.5 }
    ],
    annualBonus: [
      { threshold: "< 10 MW", bonus: 1.0 },
      { threshold: "10 - 50 MW", bonus: 1.5 },
      { threshold: "> 50 MW", bonus: 2.0 }
    ],
    notes: ""
  });

  const [updating, setUpdating] = useState(false);

  const handleInputChange = (section, index, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: field === 'threshold' ? value : parseFloat(value) || 0 } : item
      )
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
        formValues[section].forEach((item, index) => {
          if (item.bonus < 0 || item.bonus > 100) {
            validationErrors.push(`${section} tier ${index + 1} bonus must be between 0-100%`);
          }
        });
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
      <div className="space-y-4">
        {formValues[section].map((item, index) => (
          <div key={index} className="grid grid-cols-3 gap-4 text-xs items-end">
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Threshold</label>
              <input
                type="text"
                value={item.threshold}
                onChange={(e) => handleInputChange(section, index, "threshold", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                placeholder="e.g., < 1 MW"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Bonus (%)</label>
              <input
                type="number"
                step="0.1"
                value={item.bonus}
                onChange={(e) => handleInputChange(section, index, "bonus", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
                max="100"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs invisible">Action</label>
              <button className="text-red-500 text-xs hover:text-red-700">
                Remove
              </button>
            </div>
          </div>
        ))}
        <button className="text-[#039994] text-xs hover:text-[#028B86] mt-2">
          + Add Tier
        </button>
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
          {renderBonusSection("Quarterly Bonus — Commercial (MW Based)", "quarterlyCommercial")}
          {renderBonusSection("Bonus — Residential (Referral Based)", "quarterlyResidential")}
          {renderBonusSection("Annual Bonus — Partners (MW Based)", "annualBonus")}

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