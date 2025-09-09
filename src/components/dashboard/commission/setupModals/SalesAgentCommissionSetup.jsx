"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const SalesAgentCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    salesAgent: { rate: 2.0, annualCap: 50000 },
    commercialUser: { rate: 5.0, annualCap: 100000 },
    residentialUser: { rate: 3.0, annualCap: 25000 },
    calculationMethod: "SUM",
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

  const handleSelectChange = (value) => {
    setFormValues(prev => ({ ...prev, calculationMethod: value }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      
      if (formValues.salesAgent.rate > 100 || formValues.salesAgent.rate < 0) {
        validationErrors.push("Sales Agent rate must be between 0-100%");
      }
      if (formValues.commercialUser.rate > 100 || formValues.commercialUser.rate < 0) {
        validationErrors.push("Commercial User rate must be between 0-100%");
      }
      if (formValues.residentialUser.rate > 100 || formValues.residentialUser.rate < 0) {
        validationErrors.push("Residential User rate must be between 0-100%");
      }
      
      const totalRate = formValues.salesAgent.rate + formValues.commercialUser.rate + formValues.residentialUser.rate;
      if (totalRate > 100) {
        validationErrors.push("Total commission rates exceed 100%");
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success("Sales Agent commission structure updated successfully", {
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

  const renderRateInputs = (title, section) => (
    <div className="mb-6">
      <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Commission Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={formValues[section].rate}
            onChange={(e) => handleInputChange(section, "rate", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
            max="100"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-gray-600 text-xs">Annual Cap ($)</label>
          <input
            type="number"
            value={formValues[section].annualCap}
            onChange={(e) => handleInputChange(section, "annualCap", e.target.value)}
            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
            min="0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Sales Agent Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {renderRateInputs("Sales Agent Commission", "salesAgent")}
          {renderRateInputs("Commercial User Referral Commission", "commercialUser")}
          {renderRateInputs("Residential User Referral Commission", "residentialUser")}

          <div className="mb-6">
            <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Calculation Method</h3>
            <select
              value={formValues.calculationMethod}
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

          <div className="mb-6 p-3 bg-blue-50 rounded">
            <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Total Commission Allocation</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Sales Agent</label>
                <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                  {formValues.salesAgent.rate}%
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Commercial User</label>
                <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                  {formValues.commercialUser.rate}%
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Residential User</label>
                <div className="py-1 px-2 bg-white rounded border border-gray-300 text-gray-700">
                  {formValues.residentialUser.rate}%
                </div>
              </div>
            </div>
            <div className="mt-3 p-2 bg-white rounded">
              <div className="flex justify-between text-xs">
                <span className="font-medium">Total Allocated:</span>
                <span className="font-medium">
                  {(formValues.salesAgent.rate + formValues.commercialUser.rate + formValues.residentialUser.rate).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="font-medium">Remaining for Decarbon:</span>
                <span className="font-medium">
                  {(100 - (formValues.salesAgent.rate + formValues.commercialUser.rate + formValues.residentialUser.rate)).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

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

export default SalesAgentCommissionSetup;