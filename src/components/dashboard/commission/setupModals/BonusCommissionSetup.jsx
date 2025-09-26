"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const BonusCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    bonusType: "quarterly",
    min: "1",
    max: "5",
    bonus: 2.0,
    unit: "MW",
    target: "Commercial",
    notes: ""
  });

  const [bonusEntries, setBonusEntries] = useState([
    { bonusType: "quarterly", min: "1", max: "5", bonus: 2.0, unit: "MW", target: "Commercial" },
    { bonusType: "annually", min: "10", max: "50", bonus: 1.5, unit: "Referral", target: "Partners" },
    { bonusType: "annually", min: "5", max: "20", bonus: 1.0, unit: "MW", target: "Residential" }
  ]);

  const [updating, setUpdating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "bonusType") {
      if (value === "quarterly") {
        setFormValues(prev => ({
          ...prev,
          bonusType: value,
          target: "Commercial",
          unit: "MW"
        }));
      } else if (value === "annually") {
        setFormValues(prev => ({
          ...prev,
          bonusType: value,
          target: "Partners",
          unit: "Referral"
        }));
      }
    }
  };

  const handleTextArea = (value) => {
    setFormValues(prev => ({ ...prev, notes: value }));
  };

  const handleAddEntry = () => {
    if (formValues.bonusType && formValues.min && formValues.max && formValues.bonus) {
      setBonusEntries(prev => [...prev, { ...formValues }]);
      setFormValues(prev => ({
        ...prev,
        min: "",
        max: "",
        bonus: 0,
        notes: ""
      }));
    }
  };

  const handleRemoveEntry = (index) => {
    setBonusEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      bonusEntries.forEach((entry, index) => {
        if (entry.bonus < 0 || entry.bonus > 100) {
          validationErrors.push(`Entry ${index + 1} bonus must be between 0-100%`);
        }
        if (parseFloat(entry.min) >= parseFloat(entry.max)) {
          validationErrors.push(`Entry ${index + 1} min must be less than max`);
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

  const renderBonusForm = () => (
    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Add Bonus Entry</h3>
      <div className="grid grid-cols-6 gap-4 text-xs items-end">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Bonus Type</label>
          <select
            value={formValues.bonusType}
            onChange={(e) => handleInputChange("bonusType", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
          >
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Target</label>
          <input
            type="text"
            value={formValues.target}
            readOnly
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs bg-gray-100"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Min</label>
          <input
            type="text"
            value={formValues.min}
            onChange={(e) => handleInputChange("min", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            placeholder="Min value"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Max</label>
          <input
            type="text"
            value={formValues.max}
            onChange={(e) => handleInputChange("max", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            placeholder="Max value"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Unit</label>
          <input
            type="text"
            value={formValues.unit}
            readOnly
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs bg-gray-100"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Bonus (%)</label>
          <input
            type="number"
            step="0.1"
            value={formValues.bonus}
            onChange={(e) => handleInputChange("bonus", parseFloat(e.target.value) || 0)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
            max="100"
          />
        </div>
      </div>
      
      <button 
        onClick={handleAddEntry}
        className="text-[#039994] text-xs hover:text-[#028B86] mt-4"
      >
        + Add Entry
      </button>
    </div>
  );

  const renderBonusEntries = () => (
    <div className="mb-8 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Current Bonus Entries</h3>
      <div className="space-y-4">
        {bonusEntries.map((entry, index) => (
          <div key={index} className="grid grid-cols-7 gap-4 text-xs items-end bg-gray-50 p-3 rounded">
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Bonus Type</label>
              <div className="text-sm font-medium">{entry.bonusType}</div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Target</label>
              <div className="text-sm font-medium">{entry.target}</div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Min</label>
              <div className="text-sm font-medium">{entry.min}</div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Max</label>
              <div className="text-sm font-medium">{entry.max}</div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Unit</label>
              <div className="text-sm font-medium">{entry.unit}</div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Bonus (%)</label>
              <div className="text-sm font-medium">{entry.bonus}</div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs invisible">Action</label>
              <button 
                onClick={() => handleRemoveEntry(index)}
                className="text-red-500 text-xs hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
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
          {renderBonusForm()}
          {renderBonusEntries()}

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