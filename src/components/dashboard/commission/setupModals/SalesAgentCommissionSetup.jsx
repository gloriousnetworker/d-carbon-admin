"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const SalesAgentCommissionSetup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("commercial");
  const [updating, setUpdating] = useState(false);

  const [commercialForm, setCommercialForm] = useState({
    salesAgent: { lessThan500k: 2.0, between500kTo2_5m: 2.5, moreThan2_5m: 3.0, annualCap: 50000 },
    commercialUser: { lessThan500k: 5.0, between500kTo2_5m: 5.5, moreThan2_5m: 6.0, annualCap: 100000 },
    calculationMethod: "SUM",
    notes: ""
  });

  const [residentialForm, setResidentialForm] = useState({
    salesAgent: { lessThan500k: 1.5, between500kTo2_5m: 2.0, moreThan2_5m: 2.5, annualCap: 25000 },
    residentialUser: { lessThan500k: 3.0, between500kTo2_5m: 3.5, moreThan2_5m: 4.0, annualCap: 50000 },
    calculationMethod: "SUM",
    notes: ""
  });

  const calculateCommercialTotal = (tier) => {
    const salesAgent = commercialForm.salesAgent[tier];
    const commercialUser = commercialForm.commercialUser[tier];
    return (salesAgent + commercialUser).toFixed(1);
  };

  const calculateResidentialTotal = (tier) => {
    const salesAgent = residentialForm.salesAgent[tier];
    const residentialUser = residentialForm.residentialUser[tier];
    return (salesAgent + residentialUser).toFixed(1);
  };

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

  const handleTextArea = (value) => {
    if (activeTab === "commercial") {
      setCommercialForm(prev => ({ ...prev, notes: value }));
    } else {
      setResidentialForm(prev => ({ ...prev, notes: value }));
    }
  };

  const handleSelectChange = (value) => {
    if (activeTab === "commercial") {
      setCommercialForm(prev => ({ ...prev, calculationMethod: value }));
    } else {
      setResidentialForm(prev => ({ ...prev, calculationMethod: value }));
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      if (activeTab === "commercial") {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          if (commercialForm.salesAgent[tier] > 100 || commercialForm.salesAgent[tier] < 0) {
            validationErrors.push(`Sales Agent ${tier} must be between 0-100%`);
          }
          if (commercialForm.commercialUser[tier] > 100 || commercialForm.commercialUser[tier] < 0) {
            validationErrors.push(`Commercial User ${tier} must be between 0-100%`);
          }
          
          const total = parseFloat(calculateCommercialTotal(tier));
          if (total > 100) {
            validationErrors.push(`Total exceeds 100% in ${tier} tier`);
          }
        });
      } else {
        ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
          if (residentialForm.salesAgent[tier] > 100 || residentialForm.salesAgent[tier] < 0) {
            validationErrors.push(`Sales Agent ${tier} must be between 0-100%`);
          }
          if (residentialForm.residentialUser[tier] > 100 || residentialForm.residentialUser[tier] < 0) {
            validationErrors.push(`Residential User ${tier} must be between 0-100%`);
          }
          
          const total = parseFloat(calculateResidentialTotal(tier));
          if (total > 100) {
            validationErrors.push(`Total exceeds 100% in ${tier} tier`);
          }
        });
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success(`Sales Agent ${activeTab === "commercial" ? "Commercial" : "Residential"} commission structure updated successfully`, {
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

  const renderPercentageInputs = (title, section, fields, form, onChange, showTotal = false, totalCalculator = null) => (
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
      {showTotal && totalCalculator && (
        <div className="mt-3 p-2 bg-blue-50 rounded">
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Total ($500k)</label>
              <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                {totalCalculator("lessThan500k")}%
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Total ($500k-$2.5M)</label>
              <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                {totalCalculator("between500kTo2_5m")}%
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Total ($2.5M)</label>
              <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                {totalCalculator("moreThan2_5m")}%
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Remaining</label>
              <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                {fields[0].key === "annualCap" ? "-" : `${(100 - parseFloat(totalCalculator("lessThan500k"))).toFixed(1)}%`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCommercialTab = () => (
    <div className="space-y-4">
      {renderPercentageInputs("Sales Agent Commission", "salesAgent", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], commercialForm, handleCommercialInput, true, calculateCommercialTotal)}

      {renderPercentageInputs("Commercial User Commission", "commercialUser", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], commercialForm, handleCommercialInput)}

      <div className="mb-6 p-3 bg-blue-50 rounded">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Decarbon Remainder (Variable)</h3>
        <p className="text-xs text-gray-600 mb-3">
          This remainder is automatically calculated to make the total 100%.
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {(100 - calculateCommercialTotal("lessThan500k")).toFixed(1)}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {(100 - calculateCommercialTotal("between500kTo2_5m")).toFixed(1)}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {(100 - calculateCommercialTotal("moreThan2_5m")).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Calculation Method</h3>
        <select
          value={commercialForm.calculationMethod}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
        >
          <option value="SUM">Sum of Facility Remainders</option>
          <option value="AVERAGE">Average of Facility Remainders</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Determines how the available commission pool is calculated from all facilities under an account.
        </p>
      </div>

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
      {renderPercentageInputs("Sales Agent Commission", "salesAgent", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], residentialForm, handleResidentialInput, true, calculateResidentialTotal)}

      {renderPercentageInputs("Residential User Commission", "residentialUser", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ], residentialForm, handleResidentialInput)}

      <div className="mb-6 p-3 bg-blue-50 rounded">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Decarbon Remainder (Variable)</h3>
        <p className="text-xs text-gray-600 mb-3">
          This remainder is automatically calculated to make the total 100%.
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {(100 - calculateResidentialTotal("lessThan500k")).toFixed(1)}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {(100 - calculateResidentialTotal("between500kTo2_5m")).toFixed(1)}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {(100 - calculateResidentialTotal("moreThan2_5m")).toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Calculation Method</h3>
        <select
          value={residentialForm.calculationMethod}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
        >
          <option value="SUM">Sum of Facility Remainders</option>
          <option value="AVERAGE">Average of Facility Remainders</option>
        </select>
        <p className="text-xs text-gray-500 mt-2">
          Determines how the available commission pool is calculated from all facilities under an account.
        </p>
      </div>

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">
              Setup Sales Agent Commission Structure - {activeTab === "commercial" ? "Commercial Referrals" : "Residential Referrals"}
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
          </div>
        </div>

        {activeTab === "commercial" && renderCommercialTab()}
        {activeTab === "residential" && renderResidentialTab()}

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

export default SalesAgentCommissionSetup;