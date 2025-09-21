"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const PartnerCommissionSetup = ({ onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("salesAgentUpline");
  const [updating, setUpdating] = useState(false);
  const [salesAgentData, setSalesAgentData] = useState(null);
  const [epcAssistedData, setEpcAssistedData] = useState(null);

  const [salesAgentForm, setSalesAgentForm] = useState({
    salesAgentUnder500k: 0,
    salesAgent500kTo2_5m: 0,
    salesAgentOver2_5m: 0,
    salesAgentAnnualCap: 0,
    installerUnder500k: 0,
    installer500kTo2_5m: 0,
    installerOver2_5m: 0,
    installerAnnualCap: 0,
    financeUnder500k: 0,
    finance500kTo2_5m: 0,
    financeOver2_5m: 0,
    financeAnnualCap: 0,
    notes: ""
  });

  const [epcForm, setEpcForm] = useState({
    financeShareLessThan500k: 0,
    financeShare500kTo2_5m: 0,
    financeShareMoreThan2_5m: 0,
    installerShareLessThan500k: 0,
    installerShare500kTo2_5m: 0,
    installerShareMoreThan2_5m: 0,
    residentialFinanceShareLessThan500k: 0,
    residentialFinanceShare500kTo2_5m: 0,
    residentialFinanceShareMoreThan2_5m: 0,
    residentialInstallerShareLessThan500k: 0,
    residentialInstallerShare500kTo2_5m: 0,
    residentialInstallerShareMoreThan2_5m: 0,
    maxDuration: 0,
    agreementDuration: 0,
    notes: ""
  });

  const fetchSalesAgentData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent-referral', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setSalesAgentData(result.data);
          setSalesAgentForm({
            salesAgentUnder500k: result.data.salesAgentUnder500k,
            salesAgent500kTo2_5m: result.data.salesAgent500kTo2_5m,
            salesAgentOver2_5m: result.data.salesAgentOver2_5m,
            salesAgentAnnualCap: result.data.salesAgentAnnualCap,
            installerUnder500k: result.data.installerUnder500k,
            installer500kTo2_5m: result.data.installer500kTo2_5m,
            installerOver2_5m: result.data.installerOver2_5m,
            installerAnnualCap: result.data.installerAnnualCap,
            financeUnder500k: result.data.financeUnder500k,
            finance500kTo2_5m: result.data.finance500kTo2_5m,
            financeOver2_5m: result.data.financeOver2_5m,
            financeAnnualCap: result.data.financeAnnualCap,
            notes: ""
          });
        }
      }
    } catch (error) {
      console.error('Error fetching sales agent data:', error);
    }
  };

  const fetchEpcAssistedData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/epc-assisted', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setEpcAssistedData(result.data);
          setEpcForm({
            financeShareLessThan500k: result.data.financeShareLessThan500k || 0,
            financeShare500kTo2_5m: result.data.financeShare500kTo2_5m || 0,
            financeShareMoreThan2_5m: result.data.financeShareMoreThan2_5m || 0,
            installerShareLessThan500k: result.data.installerShareLessThan500k || 0,
            installerShare500kTo2_5m: result.data.installerShare500kTo2_5m || 0,
            installerShareMoreThan2_5m: result.data.installerShareMoreThan2_5m || 0,
            residentialFinanceShareLessThan500k: result.data.residentialFinanceShareLessThan500k || 0,
            residentialFinanceShare500kTo2_5m: result.data.residentialFinanceShare500kTo2_5m || 0,
            residentialFinanceShareMoreThan2_5m: result.data.residentialFinanceShareMoreThan2_5m || 0,
            residentialInstallerShareLessThan500k: result.data.residentialInstallerShareLessThan500k || 0,
            residentialInstallerShare500kTo2_5m: result.data.residentialInstallerShare500kTo2_5m || 0,
            residentialInstallerShareMoreThan2_5m: result.data.residentialInstallerShareMoreThan2_5m || 0,
            maxDuration: result.data.maxDuration || 0,
            agreementDuration: result.data.agreementDuration || 0,
            notes: result.data.notes || ""
          });
        }
      }
    } catch (error) {
      console.error('Error fetching EPC assisted data:', error);
    }
  };

  useEffect(() => {
    fetchSalesAgentData();
    fetchEpcAssistedData();
  }, []);

  const handleSalesAgentInput = (field, value) => {
    setSalesAgentForm(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleEpcInput = (field, value, isCommercial = true, isFinance = true) => {
    const numValue = parseFloat(value) || 0;
    
    setEpcForm(prev => {
      const newForm = { ...prev, [field]: numValue };
      
      if (isFinance) {
        const counterpartField = field.replace('Finance', 'Installer').replace('finance', 'installer');
        newForm[counterpartField] = 100 - numValue;
      } else {
        const counterpartField = field.replace('Installer', 'Finance').replace('installer', 'finance');
        newForm[counterpartField] = 100 - numValue;
      }
      
      return newForm;
    });
  };

  const handleResidentialEpcInput = (field, value, isFinance = true) => {
    const numValue = parseFloat(value) || 0;
    
    setEpcForm(prev => {
      const newForm = { ...prev, [field]: numValue };
      
      if (isFinance) {
        const counterpartField = field.replace('Finance', 'Installer').replace('finance', 'installer');
        newForm[counterpartField] = 100 - numValue;
      } else {
        const counterpartField = field.replace('Installer', 'Finance').replace('installer', 'finance');
        newForm[counterpartField] = 100 - numValue;
      }
      
      return newForm;
    });
  };

  const handleTextArea = (value) => {
    if (activeTab === "salesAgentUpline") {
      setSalesAgentForm(prev => ({ ...prev, notes: value }));
    } else {
      setEpcForm(prev => ({ ...prev, notes: value }));
    }
  };

  const updateSalesAgentStructure = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent-referral', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          salesAgentUnder500k: salesAgentForm.salesAgentUnder500k,
          salesAgent500kTo2_5m: salesAgentForm.salesAgent500kTo2_5m,
          salesAgentOver2_5m: salesAgentForm.salesAgentOver2_5m,
          salesAgentAnnualCap: salesAgentForm.salesAgentAnnualCap,
          installerUnder500k: salesAgentForm.installerUnder500k,
          installer500kTo2_5m: salesAgentForm.installer500kTo2_5m,
          installerOver2_5m: salesAgentForm.installerOver2_5m,
          installerAnnualCap: salesAgentForm.installerAnnualCap,
          financeUnder500k: salesAgentForm.financeUnder500k,
          finance500kTo2_5m: salesAgentForm.finance500kTo2_5m,
          financeOver2_5m: salesAgentForm.financeOver2_5m,
          financeAnnualCap: salesAgentForm.financeAnnualCap
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update sales agent structure');
      }

      const result = await response.json();
      if (result.status === 'success') {
        toast.success('Sales agent commission structure updated successfully', {
          position: 'top-center',
          duration: 3000,
        });
        onSuccess();
        return true;
      } else {
        throw new Error(result.message || 'Failed to update sales agent structure');
      }
    } catch (error) {
      toast.error(`Failed to update: ${error.message}`, {
        position: 'top-center',
        duration: 5000,
      });
      return false;
    }
  };

  const updateEpcAssistedStructure = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/epc-assisted', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          financeShareLessThan500k: epcForm.financeShareLessThan500k,
          financeShare500kTo2_5m: epcForm.financeShare500kTo2_5m,
          financeShareMoreThan2_5m: epcForm.financeShareMoreThan2_5m,
          installerShareLessThan500k: epcForm.installerShareLessThan500k,
          installerShare500kTo2_5m: epcForm.installerShare500kTo2_5m,
          installerShareMoreThan2_5m: epcForm.installerShareMoreThan2_5m,
          residentialFinanceShareLessThan500k: epcForm.residentialFinanceShareLessThan500k,
          residentialFinanceShare500kTo2_5m: epcForm.residentialFinanceShare500kTo2_5m,
          residentialFinanceShareMoreThan2_5m: epcForm.residentialFinanceShareMoreThan2_5m,
          residentialInstallerShareLessThan500k: epcForm.residentialInstallerShareLessThan500k,
          residentialInstallerShare500kTo2_5m: epcForm.residentialInstallerShare500kTo2_5m,
          residentialInstallerShareMoreThan2_5m: epcForm.residentialInstallerShareMoreThan2_5m,
          maxDuration: epcForm.maxDuration,
          agreementDuration: epcForm.agreementDuration,
          notes: epcForm.notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update EPC assisted structure');
      }

      const result = await response.json();
      if (result.status === 'success') {
        toast.success('EPC assisted commission structure updated successfully', {
          position: 'top-center',
          duration: 3000,
        });
        onSuccess();
        return true;
      } else {
        throw new Error(result.message || 'Failed to update EPC assisted structure');
      }
    } catch (error) {
      toast.error(`Failed to update: ${error.message}`, {
        position: 'top-center',
        duration: 5000,
      });
      return false;
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      let success = false;
      
      if (activeTab === "salesAgentUpline") {
        success = await updateSalesAgentStructure();
      } else {
        success = await updateEpcAssistedStructure();
      }
      
      if (success) {
        onClose();
      }
    } catch (err) {
      toast.error(`Validation failed: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderPercentageInputs = (title, fields, form, onChange, isCommercial = true, isFinance = true) => (
    <div className="mb-6">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-4 gap-4 text-xs">
        {fields.map((field) => (
          <div key={field.key} className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">{field.label}</label>
            <input
              type="number"
              step="0.1"
              value={form[field.key]}
              onChange={(e) => onChange(field.key, e.target.value, isCommercial, isFinance)}
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
      {renderPercentageInputs("Sales Agent → Sales Agent Commission", [
        { key: "salesAgentUnder500k", label: "<$500k (%)" },
        { key: "salesAgent500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "salesAgentOver2_5m", label: ">$2.5M (%)" },
        { key: "salesAgentAnnualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      {renderPercentageInputs("Sales Agent → Installer/EPC Commission", [
        { key: "installerUnder500k", label: "<$500k (%)" },
        { key: "installer500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "installerOver2_5m", label: ">$2.5M (%)" },
        { key: "installerAnnualCap", label: "Annual Cap ($)" }
      ], salesAgentForm, handleSalesAgentInput)}

      {renderPercentageInputs("Sales Agent → Finance Company Commission", [
        { key: "financeUnder500k", label: "<$500k (%)" },
        { key: "finance500kTo2_5m", label: "$500k - $2.5M (%)" },
        { key: "financeOver2_5m", label: ">$2.5M (%)" },
        { key: "financeAnnualCap", label: "Annual Cap ($)" }
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

  const renderEpcAssisted = () => {
    return (
      <div className="space-y-4">
        {renderPercentageInputs("Commercial Finance Company Share", [
          { key: "financeShareLessThan500k", label: "<$500k (%)" },
          { key: "financeShare500kTo2_5m", label: "$500k - $2.5M (%)" },
          { key: "financeShareMoreThan2_5m", label: ">$2.5M (%)" }
        ], epcForm, handleEpcInput, true, true)}

        {renderPercentageInputs("Commercial Installer/EPC Share", [
          { key: "installerShareLessThan500k", label: "<$500k (%)" },
          { key: "installerShare500kTo2_5m", label: "$500k - $2.5M (%)" },
          { key: "installerShareMoreThan2_5m", label: ">$2.5M (%)" }
        ], epcForm, (field, value) => handleEpcInput(field, value, true, false), true, false)}

        {renderPercentageInputs("Residential Finance Company Share", [
          { key: "residentialFinanceShareLessThan500k", label: "<$500k (%)" },
          { key: "residentialFinanceShare500kTo2_5m", label: "$500k - $2.5M (%)" },
          { key: "residentialFinanceShareMoreThan2_5m", label: ">$2.5M (%)" }
        ], epcForm, (field, value) => handleResidentialEpcInput(field, value, true), false, true)}

        {renderPercentageInputs("Residential Installer/EPC Share", [
          { key: "residentialInstallerShareLessThan500k", label: "<$500k (%)" },
          { key: "residentialInstallerShare500kTo2_5m", label: "$500k - $2.5M (%)" },
          { key: "residentialInstallerShareMoreThan2_5m", label: ">$2.5M (%)" }
        ], epcForm, (field, value) => handleResidentialEpcInput(field, value, false), false, false)}

        <div className="mb-6">
          <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Durations</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
              <input
                type="number"
                value={epcForm.maxDuration}
                onChange={(e) => handleEpcInput("maxDuration", e.target.value)}
                className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
                min="0"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
              <input
                type="number"
                value={epcForm.agreementDuration}
                onChange={(e) => handleEpcInput("agreementDuration", e.target.value)}
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
            onChange={(e) => handleTextArea(e.target.value)}
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
            {updating ? 'Updating...' : 'Update Structure'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCommissionSetup;