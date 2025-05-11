"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const CustomerSolarOwnerShareSetupStructureModal = ({ onClose }) => {
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    customerWithReferral: true,
    customerWithoutReferral: true,
    residentialPoints: true,
  });

  // Initial state for form values
  const [formValues, setFormValues] = useState({
    customerWithReferral: {
      lessThan500k: 20,
      between500kAnd2_5M: 15,
      greaterThan2_5M: 10,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
    },
    customerWithoutReferral: {
      lessThan500k: 5,
      between500kAnd2_5M: 5,
      greaterThan2_5M: 5,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
    },
    residentialPoints: {
      lessThan500k: 10,
      between500kAnd2_5M: 10,
      greaterThan2_5M: 10,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
    },
  });

  // Handle toggling sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setFormValues((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    // In a real application, you would send this data to your backend
    console.log("Submitting form values:", formValues);
    onClose();
  };

  // Function to render a setup section
  const renderSetupSection = (title, section, expanded) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="mr-2">•</span>
            <h3 className="font-medium text-[#1E1E1E]">{title}</h3>
          </div>
          <button onClick={() => toggleSection(section)}>
            {expanded ? (
              <FaChevronUp className="text-[#039994]" size={16} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={16} />
            )}
          </button>
        </div>
        
        {expanded && (
          <>
            <div className="w-full h-px bg-[#039994] mb-4"></div>
            <div className="grid grid-cols-6 gap-4">
              <div className="flex flex-col">
                <label className="text-xs mb-1 text-gray-600">&lt;$500k (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].lessThan500k}
                    onChange={(e) => handleInputChange(section, "lessThan500k", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "lessThan500k", Math.min(100, (formValues[section].lessThan500k || 0) + 1))}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "lessThan500k", Math.max(0, (formValues[section].lessThan500k || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs mb-1 text-gray-600">$500k - $2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].between500kAnd2_5M}
                    onChange={(e) => handleInputChange(section, "between500kAnd2_5M", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "between500kAnd2_5M", Math.min(100, (formValues[section].between500kAnd2_5M || 0) + 1))}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "between500kAnd2_5M", Math.max(0, (formValues[section].between500kAnd2_5M || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs mb-1 text-gray-600">&gt;$2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].greaterThan2_5M}
                    onChange={(e) => handleInputChange(section, "greaterThan2_5M", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "greaterThan2_5M", Math.min(100, (formValues[section].greaterThan2_5M || 0) + 1))}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "greaterThan2_5M", Math.max(0, (formValues[section].greaterThan2_5M || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs mb-1 text-gray-600">Max Duration (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].maxDuration}
                    onChange={(e) => handleInputChange(section, "maxDuration", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "maxDuration", (formValues[section].maxDuration || 0) + 1)}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "maxDuration", Math.max(0, (formValues[section].maxDuration || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs mb-1 text-gray-600">Agreement Duration (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].agreementDuration}
                    onChange={(e) => handleInputChange(section, "agreementDuration", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "agreementDuration", (formValues[section].agreementDuration || 0) + 1)}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "agreementDuration", Math.max(0, (formValues[section].agreementDuration || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="text-xs mb-1 text-gray-600">Cancellation Fee ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].cancellationFee}
                    onChange={(e) => handleInputChange(section, "cancellationFee", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "cancellationFee", (formValues[section].cancellationFee || 0) + 50)}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-xs"
                      onClick={() => handleInputChange(section, "cancellationFee", Math.max(0, (formValues[section].cancellationFee || 0) - 50))}
                      >▼</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={20} />
            <h2 className="text-xl font-semibold text-[#039994]">Setup Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {renderSetupSection("Commercial Customer Share w/Partner Referral", "customerWithReferral", expandedSections.customerWithReferral)}
          {renderSetupSection("Commercial Customer Share w/o Partner Referral (also after Y7)", "customerWithoutReferral", expandedSections.customerWithoutReferral)}
          {renderSetupSection("Residential Customer Points Share", "residentialPoints", expandedSections.residentialPoints)}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028B86]"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSolarOwnerShareSetupStructureModal;