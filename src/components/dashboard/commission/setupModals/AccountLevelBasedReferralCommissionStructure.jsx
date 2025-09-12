"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const AccountLevelBasedCommissionSetup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("commercial");
  const [updating, setUpdating] = useState(false);

  const [commercialForm, setCommercialForm] = useState({
    commercialToCommercial: { lessThan500k: 5.0, between500kTo2_5m: 5.5, moreThan2_5m: 6.0, annualCap: 100000 },
    commercialToResidential: { lessThan500k: 3.0, between500kTo2_5m: 3.5, moreThan2_5m: 4.0, annualCap: 50000 },
    notes: ""
  });

  const [residentialForm, setResidentialForm] = useState({
    residentialToCommercial: { lessThan500k: 4.0, between500kTo2_5m: 4.5, moreThan2_5m: 5.0, annualCap: 75000 },
    residentialToResidential: { lessThan500k: 3.0, between500kTo2_5m: 3.5, moreThan2_5m: 4.0, annualCap: 50000 },
    notes: ""
  });

  const [salesAgentForm, setSalesAgentForm] = useState({
    salesAgentToCommercial: { lessThan500k: 2.0, between500kTo2_5m: 2.5, moreThan2_5m: 3.0, annualCap: 50000 },
    salesAgentToResidential: { lessThan500k: 1.5, between500kTo2_5m: 2.0, moreThan2_5m: 2.5, annualCap: 25000 },
    notes: ""
  });

  const handleCommercialInput = (section, field, value) => {
    setCommercialForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleResidentialInput = (section, field, value) => {
    setResidentialForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleSalesAgentInput = (section, field, value) => {
    setSalesAgentForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleTextArea = (value) => {
    if (activeTab === "commercial") {
      setCommercialForm(prev => ({ ...prev, notes: value }));
    } else if (activeTab === "residential") {
      setResidentialForm(prev => ({ ...prev, notes: value }));
    } else {
      setSalesAgentForm(prev => ({ ...prev, notes: value }));
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      if (activeTab === "commercial") {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          if (commercialForm.commercialToCommercial[tier] > 100 || commercialForm.commercialToCommercial[tier] < 0) {
            validationErrors.push(`Commercial → Commercial ${tier} must be between 0-100%`);
          }
          if (commercialForm.commercialToResidential[tier] > 100 || commercialForm.commercialToResidential[tier] < 0) {
            validationErrors.push(`Commercial → Residential ${tier} must be between 0-100%`);
          }
        });
      } else if (activeTab === "residential") {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          if (residentialForm.residentialToCommercial[tier] > 100 || residentialForm.residentialToCommercial[tier] < 0) {
            validationErrors.push(`Residential → Commercial ${tier} must be between 0-100%`);
          }
          if (residentialForm.residentialToResidential[tier] > 100 || residentialForm.residentialToResidential[tier] < 0) {
            validationErrors.push(`Residential → Residential ${tier} must be between 0-100%`);
          }
        });
      } else {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          if (salesAgentForm.salesAgentToCommercial[tier] > 100 || salesAgentForm.salesAgentToCommercial[tier] < 0) {
            validationErrors.push(`Sales Agent → Commercial ${tier} must be between 0-100%`);
          }
          if (salesAgentForm.salesAgentToResidential[tier] > 100 || salesAgentForm.salesAgentToResidential[tier] < 0) {
            validationErrors.push(`Sales Agent → Residential ${tier} must be between 0-100%`);
          }
        });
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success(`Commission structure updated successfully`, {
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

  const renderCommercialTab = () => (
    <div className="space-y-4">
      {renderPercentageInputs("Commercial → Commercial Commission", "commercialToCommercial", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], commercialForm, handleCommercialInput)}

      {renderPercentageInputs("Commercial → Residential Commission", "commercialToResidential", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], commercialForm, handleCommercialInput)}

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
        <textarea
          value={commercialForm.notes}
          onChange={(e) => handleTextArea(e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );

  const renderResidentialTab = () => (
    <div className="space-y-4">
      {renderPercentageInputs("Residential → Commercial Commission", "residentialToCommercial", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], residentialForm, handleResidentialInput)}

      {renderPercentageInputs("Residential → Residential Commission", "residentialToResidential", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], residentialForm, handleResidentialInput)}

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
        <textarea
          value={residentialForm.notes}
          onChange={(e) => handleTextArea(e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );

  const renderSalesAgentTab = () => (
    <div className="space-y-4">
      {renderPercentageInputs("Sales Agent → Commercial Commission", "salesAgentToCommercial", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      {renderPercentageInputs("Sales Agent → Residential Commission", "salesAgentToResidential", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
        <textarea
          value={salesAgentForm.notes}
          onChange={(e) => handleTextArea(e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
          placeholder="Additional notes..."
        />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">
              Account Level Based Setup Commission Structure - {activeTab === "commercial" ? "Commercial Referrals" : activeTab === "residential" ? "Residential Referrals" : "Sales Agent Referrals"}
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
                activeTab === "commercial"
                  ? "text-[#039994] border-[#039994]"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("commercial")}
            >
              Commercial Referrals
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "residential"
                  ? "text-[#039994] border-[#039994]"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("residential")}
            >
              Residential Referrals
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "sales-agent"
                  ? "text-[#039994] border-[#039994]"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("sales-agent")}
            >
              Sales Agent Referrals
            </button>
          </div>
        </div>

        {activeTab === "commercial" && renderCommercialTab()}
        {activeTab === "residential" && renderResidentialTab()}
        {activeTab === "sales-agent" && renderSalesAgentTab()}

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

export default AccountLevelBasedCommissionSetup;