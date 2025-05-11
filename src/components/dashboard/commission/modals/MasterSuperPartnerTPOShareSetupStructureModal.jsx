"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

const MasterSuperPartnerTPOShareSetupStructureModal = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    masterPartner1: true,
    masterPartner2: true,
    masterPartner3: true,
    masterPartnerIncentive: true,
  });

  const [formValues, setFormValues] = useState({
    masterPartner1: {
      lessThan500k: 20,
      between500kAnd2_5M: 15,
      greaterThan2_5M: 10,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
    },
    masterPartner2: {
      lessThan500k: 5,
      between500kAnd2_5M: 5,
      greaterThan2_5M: 5,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
    },
    masterPartner3: {
      lessThan500k: 10,
      between500kAnd2_5M: 10,
      greaterThan2_5M: 10,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
    },
    masterPartnerIncentive: {
      lessThan500k: 5,
      between500kAnd2_5M: 5,
      greaterThan2_5M: 5,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 250,
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

  const renderSetupSection = (title, sectionKey, isExpanded) => {
    const values = formValues[sectionKey];
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <span className="mr-1">•</span>
            <h3 className="font-medium text-[#1E1E1E] text-sm">{title}</h3>
          </div>
          <button onClick={() => toggleSection(sectionKey)}>
            {isExpanded ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </button>
        </div>

        {isExpanded && (
          <>
            <div className="w-full h-px bg-[#039994] mb-2"></div>
            <div className="grid grid-cols-6 gap-2 text-xs">
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.lessThan500k}
                    onChange={(e) => handleInputChange(sectionKey, "lessThan500k", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "lessThan500k", Math.min(100, (values.lessThan500k || 0) + 1))}
                    >▲</button>
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "lessThan500k", Math.max(0, (values.lessThan500k || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.between500kAnd2_5M}
                    onChange={(e) => handleInputChange(sectionKey, "between500kAnd2_5M", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "between500kAnd2_5M", Math.min(100, (values.between500kAnd2_5M || 0) + 1))}
                    >▲</button>
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "between500kAnd2_5M", Math.max(0, (values.between500kAnd2_5M || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.greaterThan2_5M}
                    onChange={(e) => handleInputChange(sectionKey, "greaterThan2_5M", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "greaterThan2_5M", Math.min(100, (values.greaterThan2_5M || 0) + 1))}
                    >▲</button>
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "greaterThan2_5M", Math.max(0, (values.greaterThan2_5M || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.maxDuration}
                    onChange={(e) => handleInputChange(sectionKey, "maxDuration", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2"
                    min="0"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "maxDuration", Math.min(100, (values.maxDuration || 0) + 1))}
                    >▲</button>
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "maxDuration", Math.max(0, (values.maxDuration || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.agreementDuration}
                    onChange={(e) => handleInputChange(sectionKey, "agreementDuration", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2"
                    min="0"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "agreementDuration", Math.min(100, (values.agreementDuration || 0) + 1))}
                    >▲</button>
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "agreementDuration", Math.max(0, (values.agreementDuration || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Cancellation Fee ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={values.cancellationFee}
                    onChange={(e) => handleInputChange(sectionKey, "cancellationFee", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2"
                    min="0"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "cancellationFee", Math.min(100000, (values.cancellationFee || 0) + 100))}
                    >▲</button>
                    <button
                      className="text-gray-500 text-[10px]"
                      onClick={() => handleInputChange(sectionKey, "cancellationFee", Math.max(0, (values.cancellationFee || 0) - 100))}
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
            <h2 className="text-lg font-semibold text-[#039994]">Master Super Partner TPO Share Setup</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-medium text-[#1E1E1E]">Setup Structure</h3>
        </div>

        <div className="space-y-3">
          {renderSetupSection("Master Partner 1", "masterPartner1", expandedSections.masterPartner1)}
          {renderSetupSection("Master Partner 2", "masterPartner2", expandedSections.masterPartner2)}
          {renderSetupSection("Master Partner 3", "masterPartner3", expandedSections.masterPartner3)}
          {renderSetupSection("Master Partner Incentive", "masterPartnerIncentive", expandedSections.masterPartnerIncentive)}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-1 bg-[#039994] text-white rounded hover:bg-[#02857f] text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MasterSuperPartnerTPOShareSetupStructureModal;