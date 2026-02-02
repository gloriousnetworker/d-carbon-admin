"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const BonusCommissionSetup = ({ onClose, onSuccess }) => {
  const [target, setTarget] = useState("COMMERCIAL_MW_QUARTERLY");
  const [bonusEntries, setBonusEntries] = useState([]);
  const [newEntry, setNewEntry] = useState({
    minValue: "",
    maxValue: "",
    percent: 0,
    flatValue: ""
  });
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const getFieldsForTarget = (targetType) => {
    switch (targetType) {
      case "COMMERCIAL_MW_QUARTERLY":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false, unit: "MW" };
      case "RESIDENTIAL_REFERRAL_QUARTERLY":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false, unit: "Referrals" };
      case "SALES_AGENT_DIRECT":
        return { showMin: true, showMax: true, showPercent: false, showFlat: true, unit: "Units" };
      case "SALES_AGENT_INDIRECT":
        return { showMin: true, showMax: true, showPercent: false, showFlat: true, unit: "Units" };
      case "PARTNER_RESIDENTIAL_MW_ANNUAL":
        return { showMin: true, showMax: false, showPercent: true, showFlat: false, unit: "MW" };
      case "PARTNER_COMMERCIAL_MW_ANNUAL":
        return { showMin: true, showMax: false, showPercent: true, showFlat: false, unit: "MW" };
      case "PARTNER_RESIDENTIAL_MW_QUARTER":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false, unit: "MW" };
      case "PARTNER_COMMERCIAL_MW_QUARTER":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false, unit: "MW" };
      default:
        return { showMin: true, showMax: true, showPercent: true, showFlat: false, unit: "" };
    }
  };

  const handleTargetChange = (selectedTarget) => {
    setTarget(selectedTarget);
    setNewEntry({
      minValue: "",
      maxValue: "",
      percent: 0,
      flatValue: ""
    });
  };

  const handleNewEntryChange = (field, value) => {
    setNewEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddEntry = () => {
    const fields = getFieldsForTarget(target);
    let isValid = true;

    if (fields.showMin && !newEntry.minValue) isValid = false;
    if (fields.showMax && fields.showMax !== false && !newEntry.maxValue) isValid = false;
    if (fields.showPercent && !newEntry.percent) isValid = false;
    if (fields.showFlat && !newEntry.flatValue) isValid = false;

    if (isValid) {
      const entry = {
        bonusType: target,
        minValue: newEntry.minValue ? parseFloat(newEntry.minValue) : null,
        maxValue: newEntry.maxValue ? parseFloat(newEntry.maxValue) : null,
        percent: newEntry.percent ? parseFloat(newEntry.percent) : null,
        flatValue: newEntry.flatValue ? parseFloat(newEntry.flatValue) : null
      };
      
      setBonusEntries(prev => [...prev, entry]);
      setNewEntry({
        minValue: "",
        maxValue: "",
        percent: 0,
        flatValue: ""
      });
    }
  };

  const handleRemoveEntry = (index) => {
    setBonusEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const requests = bonusEntries.map(entry => 
        fetch("https://services.dcarbon.solutions/api/bonus-structure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`
          },
          body: JSON.stringify(entry)
        })
      );

      const responses = await Promise.all(requests);
      const results = await Promise.all(responses.map(res => res.json()));

      const hasError = results.some(result => !result.success);
      if (hasError) {
        throw new Error("Some entries failed to update");
      }

      toast.success("Bonus commission structure updated successfully", {
        position: 'top-center',
        duration: 3000,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderTargetSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">Select Bonus Type</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "COMMERCIAL_MW_QUARTERLY"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("COMMERCIAL_MW_QUARTERLY")}
        >
          Commercial MW Quarterly
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "RESIDENTIAL_REFERRAL_QUARTERLY"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("RESIDENTIAL_REFERRAL_QUARTERLY")}
        >
          Residential Referral Quarterly
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "SALES_AGENT_DIRECT"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("SALES_AGENT_DIRECT")}
        >
          Sales Agent Direct
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "SALES_AGENT_INDIRECT"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("SALES_AGENT_INDIRECT")}
        >
          Sales Agent Indirect
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "PARTNER_RESIDENTIAL_MW_ANNUAL"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("PARTNER_RESIDENTIAL_MW_ANNUAL")}
        >
          Partner Residential MW Annual
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "PARTNER_COMMERCIAL_MW_ANNUAL"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("PARTNER_COMMERCIAL_MW_ANNUAL")}
        >
          Partner Commercial MW Annual
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "PARTNER_RESIDENTIAL_MW_QUARTER"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("PARTNER_RESIDENTIAL_MW_QUARTER")}
        >
          Partner Residential MW Quarter
        </button>
        <button
          className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
            target === "PARTNER_COMMERCIAL_MW_QUARTER"
              ? "bg-[#039994] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => handleTargetChange("PARTNER_COMMERCIAL_MW_QUARTER")}
        >
          Partner Commercial MW Quarter
        </button>
      </div>
    </div>
  );

  const renderAddEntryForm = () => {
    const fields = getFieldsForTarget(target);
    const getLabel = (fieldName) => {
      if (fieldName === "minValue" && target === "COMMERCIAL_MW_QUARTERLY") return "Min MW Value";
      if (fieldName === "maxValue" && target === "COMMERCIAL_MW_QUARTERLY") return "Top MW Value";
      if (fieldName === "percent" && target === "RESIDENTIAL_REFERRAL_QUARTERLY") return "Bonus Points";
      if (fieldName === "percent") return "Bonus (%)";
      if (fieldName === "minValue") return "Min Value";
      if (fieldName === "maxValue") return "Max Value";
      if (fieldName === "flatValue") return "Flat Value ($)";
      return fieldName;
    };

    return (
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Add New Bonus Entry</h3>
        <div className={`grid gap-4 text-xs items-end ${fields.showFlat ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {fields.showMin && (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">{getLabel("minValue")}</label>
              <input
                type="number"
                value={newEntry.minValue}
                onChange={(e) => handleNewEntryChange("minValue", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                placeholder="Min"
                step="0.1"
              />
            </div>
          )}
          
          {fields.showMax && fields.showMax !== false && (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">{getLabel("maxValue")}</label>
              <input
                type="number"
                value={newEntry.maxValue}
                onChange={(e) => handleNewEntryChange("maxValue", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                placeholder="Max"
                step="0.1"
              />
            </div>
          )}
          
          {fields.showPercent && (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">{getLabel("percent")}</label>
              <input
                type="number"
                step="0.1"
                value={newEntry.percent}
                onChange={(e) => handleNewEntryChange("percent", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
                max="100"
              />
            </div>
          )}
          
          {fields.showFlat && (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">{getLabel("flatValue")}</label>
              <input
                type="number"
                value={newEntry.flatValue}
                onChange={(e) => handleNewEntryChange("flatValue", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
                step="0.01"
              />
            </div>
          )}
          
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
  };

  const renderBonusTable = () => {
    const fields = getFieldsForTarget(target);
    const filteredEntries = bonusEntries.filter(entry => entry.bonusType === target);
    
    const getHeaderLabel = (fieldName) => {
      if (fieldName === "minValue" && target === "COMMERCIAL_MW_QUARTERLY") return "Min MW Value";
      if (fieldName === "maxValue" && target === "COMMERCIAL_MW_QUARTERLY") return "Top MW Value";
      if (fieldName === "percent" && target === "RESIDENTIAL_REFERRAL_QUARTERLY") return "Bonus Points";
      if (fieldName === "percent") return "Bonus (%)";
      if (fieldName === "minValue") return "Min Value";
      if (fieldName === "maxValue") return "Max Value";
      if (fieldName === "flatValue") return "Flat Value ($)";
      return fieldName;
    };

    return (
      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">
          {target.replace(/_/g, " ")} Structure
        </h3>
        <div className="w-full overflow-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                  {getHeaderLabel("minValue")}
                </th>
                {fields.showMax && fields.showMax !== false && (
                  <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                    {getHeaderLabel("maxValue")}
                  </th>
                )}
                {fields.showPercent && (
                  <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                    {getHeaderLabel("percent")}
                  </th>
                )}
                {fields.showFlat && (
                  <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                    {getHeaderLabel("flatValue")}
                  </th>
                )}
                <th className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-3 px-4 text-sm border-b border-gray-200">
                    {entry.minValue}
                  </td>
                  {fields.showMax && fields.showMax !== false && (
                    <td className="py-3 px-4 text-sm border-b border-gray-200">
                      {entry.maxValue || "N/A"}
                    </td>
                  )}
                  {fields.showPercent && (
                    <td className="py-3 px-4 text-sm border-b border-gray-200">
                      {entry.percent || "N/A"}
                    </td>
                  )}
                  {fields.showFlat && (
                    <td className="py-3 px-4 text-sm border-b border-gray-200">
                      {entry.flatValue || "N/A"}
                    </td>
                  )}
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
  };

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
            disabled={updating || bonusEntries.length === 0}
            className={`px-4 py-2 rounded-md text-sm ${
              updating || bonusEntries.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#039994] hover:bg-[#028B86]'
            } text-white transition-colors`}
          >
            {updating ? 'Updating...' : 'Update Structure'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BonusCommissionSetup;