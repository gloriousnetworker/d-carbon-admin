"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const BonusCommissionSetup = ({ onClose }) => {
  const [target, setTarget] = useState("commercial");
  const [bonusEntries, setBonusEntries] = useState([
    { bonusType: "quarterly", min: "1", max: "5", bonus: 2.0, unit: "referral", target: "commercial" },
    { bonusType: "quarterly", min: "6", max: "10", bonus: 2.5, unit: "referral", target: "commercial" },
    { bonusType: "annually", min: "5", max: "20", bonus: 1.0, unit: "MW", target: "residential" },
    { bonusType: "annually", min: "21", max: "50", bonus: 1.5, unit: "MW", target: "residential" },
    { bonusType: "annually", min: "10", max: "50", bonus: 1.5, unit: "partner", target: "partner" },
    { bonusType: "annually", min: "51", max: "100", bonus: 2.0, unit: "partner", target: "partner" }
  ]);

  const [newEntry, setNewEntry] = useState({
    bonusType: "quarterly",
    min: "",
    max: "",
    bonus: 0,
    unit: "referral",
    target: "commercial"
  });

  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const filteredEntries = bonusEntries.filter(entry => entry.target === target);

  const getUnitForTarget = (target) => {
    switch (target) {
      case "commercial": return "referral";
      case "residential": return "MW";
      case "partner": return "partner";
      default: return "referral";
    }
  };

  const handleTargetChange = (selectedTarget) => {
    setTarget(selectedTarget);
    setNewEntry(prev => ({
      ...prev,
      target: selectedTarget,
      unit: getUnitForTarget(selectedTarget)
    }));
  };

  const handleNewEntryChange = (field, value) => {
    setNewEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddEntry = () => {
    if (newEntry.min && newEntry.max && newEntry.bonus) {
      setBonusEntries(prev => [...prev, { ...newEntry }]);
      setNewEntry({
        bonusType: "quarterly",
        min: "",
        max: "",
        bonus: 0,
        unit: getUnitForTarget(target),
        target: target
      });
    }
  };

  const handleEntryChange = (index, field, value) => {
    setBonusEntries(prev => 
      prev.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    );
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

  const renderTargetSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">Select Target</label>
      <div className="flex space-x-4">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            target === "commercial"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("commercial")}
        >
          Commercial
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            target === "residential"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("residential")}
        >
          Residential
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            target === "partner"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("partner")}
        >
          Partner
        </button>
      </div>
    </div>
  );

  const renderAddEntryForm = () => (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Add New Bonus Entry</h3>
      <div className="grid grid-cols-6 gap-4 text-xs items-end">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Bonus Type</label>
          <select
            value={newEntry.bonusType}
            onChange={(e) => handleNewEntryChange("bonusType", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
          >
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Min Threshold</label>
          <input
            type="text"
            value={newEntry.min}
            onChange={(e) => handleNewEntryChange("min", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            placeholder="Min"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Max Threshold</label>
          <input
            type="text"
            value={newEntry.max}
            onChange={(e) => handleNewEntryChange("max", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            placeholder="Max"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Bonus (%)</label>
          <input
            type="number"
            step="0.1"
            value={newEntry.bonus}
            onChange={(e) => handleNewEntryChange("bonus", parseFloat(e.target.value) || 0)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
            max="100"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Unit</label>
          <input
            type="text"
            value={newEntry.unit}
            readOnly
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs bg-gray-100"
          />
        </div>
        
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs invisible">Action</label>
          <button
            onClick={handleAddEntry}
            className="bg-[#039994] text-white px-4 py-2 rounded text-xs hover:bg-[#028B86] transition-colors"
          >
            Add Entry
          </button>
        </div>
      </div>
    </div>
  );

  const renderBonusTable = () => (
    <div className="mb-6">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">
        {target.charAt(0).toUpperCase() + target.slice(1)} Bonus Structure
      </h3>
      <div className="w-full overflow-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Bonus Type</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Min Threshold</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Max Threshold</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Bonus (%)</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Unit</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Target</th>
              <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <select
                    value={entry.bonusType}
                    onChange={(e) => handleEntryChange(bonusEntries.findIndex(e => e === entry), "bonusType", e.target.value)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                  >
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <input
                    type="text"
                    value={entry.min}
                    onChange={(e) => handleEntryChange(bonusEntries.findIndex(e => e === entry), "min", e.target.value)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                  />
                </td>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <input
                    type="text"
                    value={entry.max}
                    onChange={(e) => handleEntryChange(bonusEntries.findIndex(e => e === entry), "max", e.target.value)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                  />
                </td>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <input
                    type="number"
                    step="0.1"
                    value={entry.bonus}
                    onChange={(e) => handleEntryChange(bonusEntries.findIndex(e => e === entry), "bonus", parseFloat(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                    max="100"
                  />
                </td>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <input
                    type="text"
                    value={entry.unit}
                    readOnly
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs bg-gray-100"
                  />
                </td>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <input
                    type="text"
                    value={entry.target}
                    readOnly
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs bg-gray-100"
                  />
                </td>
                <td className="py-3 px-4 text-sm border-b border-gray-200">
                  <button
                    onClick={() => handleRemoveEntry(bonusEntries.findIndex(e => e === entry))}
                    className="text-red-500 text-xs hover:text-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

        {renderTargetSelector()}
        {renderAddEntryForm()}
        {renderBonusTable()}

        <div className="mb-6">
          <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
            placeholder="Additional notes..."
          />
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