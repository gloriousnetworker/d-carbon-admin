"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const PartnerShareSetupStructureModal = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    standard: true,
    quarterly: true,
    bonusResidential: true,
    annual: true,
  });

  const [formValues, setFormValues] = useState({
    standard: {
      lessThan500k: 20,
      between500kAnd2_5M: 15,
      greaterThan2_5M: 10,
      maxDuration: 0,
      agreementDuration: 0,
    },
    quarterly: {
      lessThan500k: 0,
      between500kAnd2_5M: 0,
      greaterThan2_5M: 0,
      maxDuration: 0,
      agreementDuration: 0,
    },
    bonusResidential: {
      lessThan500k: 0,
      between500kAnd2_5M: 0,
      greaterThan2_5M: 0,
      maxDuration: 0,
      agreementDuration: 0,
    },
    annual: {
      lessThan500k: 0,
      between500kAnd2_5M: 0,
      greaterThan2_5M: 0,
      maxDuration: 0,
      agreementDuration: 0,
    },
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = () => {
    console.log("Submitting form values:", formValues);
    onClose();
  };

  const renderSetupSection = (title, section, expanded) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="mr-2">•</span>
            <h3 className="font-medium text-[#1E1E1E] text-sm">{title}</h3>
          </div>
          <button onClick={() => toggleSection(section)}>
            {expanded ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </button>
        </div>
        
        {expanded && (
          <>
            <div className="w-full h-px bg-[#039994] mb-3"></div>
            <div className="grid grid-cols-5 gap-3 text-xs">
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].lessThan500k}
                    onChange={(e) => handleInputChange(section, "lessThan500k", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "lessThan500k", Math.min(100, (formValues[section].lessThan500k || 0) + 1))}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "lessThan500k", Math.max(0, (formValues[section].lessThan500k || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].between500kAnd2_5M}
                    onChange={(e) => handleInputChange(section, "between500kAnd2_5M", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "between500kAnd2_5M", Math.min(100, (formValues[section].between500kAnd2_5M || 0) + 1))}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "between500kAnd2_5M", Math.max(0, (formValues[section].between500kAnd2_5M || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].greaterThan2_5M}
                    onChange={(e) => handleInputChange(section, "greaterThan2_5M", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "greaterThan2_5M", Math.min(100, (formValues[section].greaterThan2_5M || 0) + 1))}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "greaterThan2_5M", Math.max(0, (formValues[section].greaterThan2_5M || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].maxDuration}
                    onChange={(e) => handleInputChange(section, "maxDuration", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "maxDuration", (formValues[section].maxDuration || 0) + 1)}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "maxDuration", Math.max(0, (formValues[section].maxDuration || 0) - 1))}
                      >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].agreementDuration}
                    onChange={(e) => handleInputChange(section, "agreementDuration", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "agreementDuration", (formValues[section].agreementDuration || 0) + 1)}
                      >▲</button>
                    <button 
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(section, "agreementDuration", Math.max(0, (formValues[section].agreementDuration || 0) - 1))}
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
      <div className="bg-white rounded-lg w-full max-w-3xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {renderSetupSection("Standard Commercial/Residential", "standard", expandedSections.standard)}
          {renderSetupSection("Quarterly Bonus Commercial", "quarterly", expandedSections.quarterly)}
          {renderSetupSection("Bonus Residential", "bonusResidential", expandedSections.bonusResidential)}
          {renderSetupSection("Annual Bonus", "annual", expandedSections.annual)}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-[#039994] text-white rounded-md hover:bg-[#028B86] text-sm"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerShareSetupStructureModal;