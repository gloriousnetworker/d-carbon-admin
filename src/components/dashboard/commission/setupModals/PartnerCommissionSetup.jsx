"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const PartnerCommissionSetup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("salesAgentUpline");
  const [updating, setUpdating] = useState(false);

  const [salesAgentForm, setSalesAgentForm] = useState({
    salesAgentToSalesAgent: { lessThan500k: 0.5, between500kTo2_5m: 0.5, moreThan2_5m: 0.75, annualCap: 25000 },
    salesAgentToInstaller: { lessThan500k: 1.0, between500kTo2_5m: 1.0, moreThan2_5m: 1.0, annualCap: 50000 },
    salesAgentToFinance: { lessThan500k: 1.0, between500kTo2_5m: 1.0, moreThan2_5m: 1.0, annualCap: 50000 },
    notes: ""
  });

  const [epcForm, setEpcForm] = useState({
    financeCompany: { lessThan500k: 60.0, between500kTo2_5m: 50.0, moreThan2_5m: 45.5 },
    installerEPC: { lessThan500k: 40.0, between500kTo2_5m: 50.0, moreThan2_5m: 55.0 },
    durations: { maxDuration: 15, agreementDuration: 2 },
    notes: ""
  });

  const handleSalesAgentInput = (section, field, value) => {
    setSalesAgentForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleEpcInput = (section, field, value) => {
    const numValue = parseFloat(value) || 0;
    
    if (section === "financeCompany") {
      const remaining = 100 - numValue;
      setEpcForm(prev => ({
        ...prev,
        financeCompany: { ...prev.financeCompany, [field]: numValue },
        installerEPC: { ...prev.installerEPC, [field]: remaining }
      }));
    } else if (section === "installerEPC") {
      const remaining = 100 - numValue;
      setEpcForm(prev => ({
        ...prev,
        installerEPC: { ...prev.installerEPC, [field]: numValue },
        financeCompany: { ...prev.financeCompany, [field]: remaining }
      }));
    } else {
      setEpcForm(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: numValue },
      }));
    }
  };

  const handleTextArea = (section, value) => {
    if (activeTab === "salesAgentUpline") {
      setSalesAgentForm(prev => ({ ...prev, [section]: value }));
    } else {
      setEpcForm(prev => ({ ...prev, [section]: value }));
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      if (activeTab === "salesAgentUpline") {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          if (salesAgentForm.salesAgentToSalesAgent[tier] > 100 || salesAgentForm.salesAgentToSalesAgent[tier] < 0) {
            validationErrors.push(`Sales Agent to Sales Agent ${tier} must be between 0-100%`);
          }
          if (salesAgentForm.salesAgentToInstaller[tier] > 100 || salesAgentForm.salesAgentToInstaller[tier] < 0) {
            validationErrors.push(`Sales Agent to Installer ${tier} must be between 0-100%`);
          }
          if (salesAgentForm.salesAgentToFinance[tier] > 100 || salesAgentForm.salesAgentToFinance[tier] < 0) {
            validationErrors.push(`Sales Agent to Finance ${tier} must be between 0-100%`);
          }
        });
      } else {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          const finance = epcForm.financeCompany[tier];
          const installer = epcForm.installerEPC[tier];
          const total = finance + installer;
          if (total !== 100) {
            validationErrors.push(`Finance + Installer must equal 100% in ${tier} tier (currently ${total}%)`);
          }
        });
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success(`Partner ${activeTab === "salesAgentUpline" ? "Sales-Agent Upline" : "EPC-Assisted"} commission structure updated successfully`, {
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

  const renderPercentageInputs = (title, section, fields, form, onChange) => (
    <div className="mb-6">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-4 gap-4 text-xs">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">{field.label}</label>
            <input
              type="number"
              step="0.1"
              value={form[section][field.key]}
              onChange={(e) => onChange(section, field.key, e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
              max="100"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSalesAgentUpline = () => (
    <div className="space-y-4">
      {renderPercentageInputs("Sales Agent → Sales Agent Commission", "salesAgentToSalesAgent", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      {renderPercentageInputs("Sales Agent → Installer/EPC Commission", "salesAgentToInstaller", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      {renderPercentageInputs("Sales Agent → Finance Company Commission", "salesAgentToFinance", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
        <textarea
          value={salesAgentForm.notes}
          onChange={(e) => handleTextArea("notes", e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );

  const renderEpcAssisted = () => {
    return (
      <div className="space-y-4">
        {renderPercentageInputs("Finance Company Share", "financeCompany", [
          { key: "lessThan500k", label: "<$500k (%)" },
          { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
          { key: "moreThan2_5m", label: ">$2.5M (%)" }
        ], epcForm, handleEpcInput)}

        {renderPercentageInputs("Installer/EPC Share", "installerEPC", [
          { key: "lessThan500k", label: "<$500k (%)" },
          { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
          { key: "moreThan2_5m", label: ">$2.5M (%)" }
        ], epcForm, handleEpcInput)}

        <div className="mb-6">
          <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Durations</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
              <input
                type="number"
                value={epcForm.durations.maxDuration}
                onChange={(e) => handleEpcInput("durations", "maxDuration", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
              <input
                type="number"
                value={epcForm.durations.agreementDuration}
                onChange={(e) => handleEpcInput("durations", "agreementDuration", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
          <textarea
            value={epcForm.notes}
            onChange={(e) => handleTextArea("notes", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
            placeholder="Additional notes..."
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">
              Setup Partner Commission Structure - {activeTab === "salesAgentUpline" ? "Sales-Agent Upline" : "EPC-Assisted"}
            </h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="border-b border-gray-200 mb-6">
          <div className="flex">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "salesAgentUpline"
                  ? "text-[#039994] border-[#039994]"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("salesAgentUpline")}
            >
              Sales-Agent Upline
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "epcAssisted"
                  ? "text-[#039994] border-[#039994]"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("epcAssisted")}
            >
              EPC-Assisted
            </button>
          </div>
        </div>

        {activeTab === "salesAgentUpline" && renderSalesAgentUpline()}
        {activeTab === "epcAssisted" && renderEpcAssisted()}

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

export default PartnerCommissionSetup;