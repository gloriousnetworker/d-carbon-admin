"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const PartnerCommissionSetup = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("salesAgentUpline");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [salesAgentForm, setSalesAgentForm] = useState({
    salesAgentToSalesAgent: { lessThan500k: 0.5, between500kTo2_5m: 0.5, moreThan2_5m: 0.75, annualCap: 25000 },
    salesAgentToInstaller: { lessThan500k: 1.0, between500kTo2_5m: 1.0, moreThan2_5m: 1.0, annualCap: 50000 },
    salesAgentToFinance: { lessThan500k: 1.0, between500kTo2_5m: 1.0, moreThan2_5m: 1.0, annualCap: 50000 },
    notes: ""
  });

  const fetchSalesAgentData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/partner/sales-agent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setSalesAgentForm(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching sales agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "salesAgentUpline") {
      fetchSalesAgentData();
    }
  }, [activeTab]);

  const handleSalesAgentInput = (section, field, value) => {
    setSalesAgentForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleTextArea = (value) => {
    setSalesAgentForm(prev => ({ ...prev, notes: value }));
  };

  const updateSalesAgentCommission = async () => {
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/partner/sales-agent', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(salesAgentForm),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update sales agent commission');
    }

    return await response.json();
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      if (activeTab === "salesAgentUpline") {
        const validationErrors = [];
        
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
        
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(", "));
        }

        await updateSalesAgentCommission();
        
        toast.success("Sales-Agent Upline commission structure updated successfully", {
          position: 'top-center',
          duration: 3000,
        });
      } else {
        toast.info("EPC-Assisted commission is automatically calculated from Commercial and Residential structures", {
          position: 'top-center',
          duration: 3000,
        });
      }

      if (onSuccess) {
        onSuccess();
      }

      window.location.reload();
    } catch (err) {
      console.error('Error updating commission structure:', err);
      toast.error(`Update failed: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderPercentageInputs = (title, section, fields) => (
    <div className="mb-6">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-4 gap-4 text-xs">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">{field.label}</label>
            <input
              type="number"
              step="0.1"
              value={salesAgentForm[section][field.key]}
              onChange={(e) => handleSalesAgentInput(section, field.key, e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
              max="100"
              disabled={loading}
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
      ])}

      {renderPercentageInputs("Sales Agent → Installer/EPC Commission", "salesAgentToInstaller", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ])}

      {renderPercentageInputs("Sales Agent → Finance Company Commission", "salesAgentToFinance", [
        { key: "lessThan500k", label: "<$500k (%)" },
        { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "moreThan2_5m", label: ">$2.5M (%)" },
        { key: "annualCap", label: "Annual Cap ($)" }
      ])}

      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Notes</h3>
        <textarea
          value={salesAgentForm.notes}
          onChange={(e) => handleTextArea(e.target.value)}
          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs h-20"
          placeholder="Additional notes..."
          disabled={loading}
        />
      </div>
    </div>
  );

  const renderEpcAssisted = () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-medium text-[#1E1E1E] text-sm mb-2">EPC-Assisted Commission</h3>
          <p className="text-xs text-gray-600">
            EPC-Assisted commission splits are automatically calculated based on the Commercial and Residential commission structures.
            The Finance Company receives 60% and Installer/EPC receives 40% of the partner referral commission from both Commercial and Residential structures.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            To modify these values, please update the Commercial and Residential commission structures.
          </p>
        </div>
      </div>
    );
  };

  if (loading && activeTab === "salesAgentUpline") {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-[#039994]">Loading commission data...</div>
        </div>
      </div>
    );
  }

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
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || loading}
            className={`px-4 py-2 rounded-md text-sm ${
              updating || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#039994] hover:bg-[#028B86]'
            } text-white transition-colors`}
          >
            {updating ? 'Updating...' : 'Validate & Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCommissionSetup;