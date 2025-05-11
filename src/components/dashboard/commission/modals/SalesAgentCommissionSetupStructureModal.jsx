"use client";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const SalesAgentCommissionSetupStructureModal = ({ onClose }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("perCustomer");

  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    solarOwner: true,
    partner: true,
    annualBonus1: true,
    annualBonus2: true,
    annualBonus3: true,
    revenueShareOwner: true,
    revenueSharePartner: true,
  });

  // Initial state for form values
  const [formValues, setFormValues] = useState({
    solarOwner: {
      capacity: 0,
      amount: 0,
      agreementDuration: 0,
    },
    partner: {
      capacity: 0,
      amount: 0,
      agreementDuration: 0,
    },
    annualBonus1: {
      capacity: 0,
      targetCapacity: 10,
      amount: 0,
      agreementDuration: 0,
    },
    annualBonus2: {
      capacity: 0,
      targetCapacity: 20,
      amount: 0,
      agreementDuration: 0,
    },
    annualBonus3: {
      capacity: 0,
      targetCapacity: 30,
      amount: 0,
      agreementDuration: 0,
    },
    revenueShareOwner: {
      percentage: 0,
      agreementDuration: 0,
    },
    revenueSharePartner: {
      percentage: 0,
      agreementDuration: 0,
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
  const handleUpdate = () => {
    console.log("Updating form values:", formValues);
    onClose();
  };

  // Function to render a tab button
  const renderTabButton = (tabId, tabName) => {
    return (
      <button
        className={`py-2 px-4 text-sm font-medium ${
          activeTab === tabId
            ? "text-[#039994] border-b-2 border-[#039994]"
            : "text-gray-500"
        }`}
        onClick={() => setActiveTab(tabId)}
      >
        {tabName}
      </button>
    );
  };

  // Render Per Customer tab content
  const renderPerCustomerTab = () => {
    return (
      <div className="mt-4">
        {/* Per new solar owner section */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("solarOwner")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Per new solar owner (residential/commercial) registered</h3>
            </div>
            {expandedSections.solarOwner ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.solarOwner && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={formValues.solarOwner.capacity}
                      onChange={(e) => handleInputChange("solarOwner", "capacity", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                    <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r py-1 px-2 text-xs">MW</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Amount</label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                    <input
                      type="number"
                      value={formValues.solarOwner.amount}
                      onChange={(e) => handleInputChange("solarOwner", "amount", e.target.value)}
                      className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.solarOwner.agreementDuration}
                      onChange={(e) => handleInputChange("solarOwner", "agreementDuration", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("solarOwner", "agreementDuration", Number(formValues.solarOwner.agreementDuration) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("solarOwner", "agreementDuration", Math.max(0, Number(formValues.solarOwner.agreementDuration) - 1))}
                      >▼</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Per new partner section */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("partner")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Per new partner registered</h3>
            </div>
            {expandedSections.partner ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.partner && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={formValues.partner.capacity}
                      onChange={(e) => handleInputChange("partner", "capacity", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                    <span className="bg-gray-100 border border-l-0 border-gray-300 rounded-r py-1 px-2 text-xs">MW</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Amount</label>
                  <div className="flex items-center">
                    <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                    <input
                      type="number"
                      value={formValues.partner.amount}
                      onChange={(e) => handleInputChange("partner", "amount", e.target.value)}
                      className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.partner.agreementDuration}
                      onChange={(e) => handleInputChange("partner", "agreementDuration", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("partner", "agreementDuration", Number(formValues.partner.agreementDuration) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("partner", "agreementDuration", Math.max(0, Number(formValues.partner.agreementDuration) - 1))}
                      >▼</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render Annual Bonus tab content
  const renderAnnualBonusTab = () => {
    return (
      <div className="mt-4">
        {/* Annual Bonus 1 */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("annualBonus1")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Annual Bonus 1</h3>
            </div>
            {expandedSections.annualBonus1 ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.annualBonus1 && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2">
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Capacity (MW)</label>
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formValues.annualBonus1.capacity}
                      onChange={(e) => handleInputChange("annualBonus1", "capacity", e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#039994]"
                    />
                    <div className="flex justify-between text-xs text-gray-600 px-1 mt-1">
                      <span>0</span>
                      <span className="text-[#039994]">{formValues.annualBonus1.targetCapacity}/yr</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                      <input
                        type="number"
                        value={formValues.annualBonus1.amount}
                        onChange={(e) => handleInputChange("annualBonus1", "amount", e.target.value)}
                        className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formValues.annualBonus1.agreementDuration}
                        onChange={(e) => handleInputChange("annualBonus1", "agreementDuration", e.target.value)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                          className="text-gray-500 text-[10px]"
                          onClick={() => handleInputChange("annualBonus1", "agreementDuration", Number(formValues.annualBonus1.agreementDuration) + 1)}
                        >▲</button>
                        <button 
                          className="text-gray-500 text-[10px]"
                          onClick={() => handleInputChange("annualBonus1", "agreementDuration", Math.max(0, Number(formValues.annualBonus1.agreementDuration) - 1))}
                        >▼</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Annual Bonus 2 */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("annualBonus2")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Annual Bonus 2</h3>
            </div>
            {expandedSections.annualBonus2 ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.annualBonus2 && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2">
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Capacity (MW)</label>
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formValues.annualBonus2.capacity}
                      onChange={(e) => handleInputChange("annualBonus2", "capacity", e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#039994]"
                    />
                    <div className="flex justify-between text-xs text-gray-600 px-1 mt-1">
                      <span>0</span>
                      <span className="text-[#039994]">{formValues.annualBonus2.targetCapacity}/yr</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                      <input
                        type="number"
                        value={formValues.annualBonus2.amount}
                        onChange={(e) => handleInputChange("annualBonus2", "amount", e.target.value)}
                        className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formValues.annualBonus2.agreementDuration}
                        onChange={(e) => handleInputChange("annualBonus2", "agreementDuration", e.target.value)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                          className="text-gray-500 text-[10px]"
                          onClick={() => handleInputChange("annualBonus2", "agreementDuration", Number(formValues.annualBonus2.agreementDuration) + 1)}
                        >▲</button>
                        <button 
                          className="text-gray-500 text-[10px]"
                          onClick={() => handleInputChange("annualBonus2", "agreementDuration", Math.max(0, Number(formValues.annualBonus2.agreementDuration) - 1))}
                        >▼</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Annual Bonus 3 */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("annualBonus3")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Annual Bonus 3</h3>
            </div>
            {expandedSections.annualBonus3 ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.annualBonus3 && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2">
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Capacity (MW)</label>
                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formValues.annualBonus3.capacity}
                      onChange={(e) => handleInputChange("annualBonus3", "capacity", e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#039994]"
                    />
                    <div className="flex justify-between text-xs text-gray-600 px-1 mt-1">
                      <span>0</span>
                      <span className="text-[#039994]">{formValues.annualBonus3.targetCapacity}/yr</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                      <input
                        type="number"
                        value={formValues.annualBonus3.amount}
                        onChange={(e) => handleInputChange("annualBonus3", "amount", e.target.value)}
                        className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formValues.annualBonus3.agreementDuration}
                        onChange={(e) => handleInputChange("annualBonus3", "agreementDuration", e.target.value)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                          className="text-gray-500 text-[10px]"
                          onClick={() => handleInputChange("annualBonus3", "agreementDuration", Number(formValues.annualBonus3.agreementDuration) + 1)}
                        >▲</button>
                        <button 
                          className="text-gray-500 text-[10px]"
                          onClick={() => handleInputChange("annualBonus3", "agreementDuration", Math.max(0, Number(formValues.annualBonus3.agreementDuration) - 1))}
                        >▼</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render Revenue Share Commission tab content
  const renderRevenueShareTab = () => {
    return (
      <div className="mt-4">
        {/* Revenue share commission per new solar owner */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("revenueShareOwner")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Revenue share commission per new solar owner</h3>
            </div>
            {expandedSections.revenueShareOwner ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.revenueShareOwner && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.revenueShareOwner.percentage}
                      onChange={(e) => handleInputChange("revenueShareOwner", "percentage", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      max="100"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("revenueShareOwner", "percentage", Math.min(100, Number(formValues.revenueShareOwner.percentage) + 1))}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("revenueShareOwner", "percentage", Math.max(0, Number(formValues.revenueShareOwner.percentage) - 1))}
                      >▼</button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.revenueShareOwner.agreementDuration}
                      onChange={(e) => handleInputChange("revenueShareOwner", "agreementDuration", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("revenueShareOwner", "agreementDuration", Number(formValues.revenueShareOwner.agreementDuration) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("revenueShareOwner", "agreementDuration", Math.max(0, Number(formValues.revenueShareOwner.agreementDuration) - 1))}
                      >▼</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Revenue share commission per partner revenue */}
        <div className="mb-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("revenueSharePartner")}
          >
            <div className="flex items-center">
              <span className="mr-2 text-black">•</span>
              <h3 className="font-medium text-[#1E1E1E] text-sm">Revenue share commission per partner revenue</h3>
            </div>
            {expandedSections.revenueSharePartner ? (
              <FaChevronUp className="text-[#039994]" size={14} />
            ) : (
              <FaChevronDown className="text-[#039994]" size={14} />
            )}
          </div>
          
          {expandedSections.revenueSharePartner && (
            <>
              <div className="w-full h-px bg-[#039994] my-2"></div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Percentage (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.revenueSharePartner.percentage}
                      onChange={(e) => handleInputChange("revenueSharePartner", "percentage", e.target.value)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      max="100"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("revenueSharePartner", "percentage", Math.min(100, Number(formValues.revenueSharePartner.percentage) + 1))}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px]"
                        onClick={() => handleInputChange("revenueSharePartner", "percentage", Math.max(0, Number(formValues.revenueSharePartner.percentage) - 1))}
                      >▼</button>
                    </div>
                  </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                        <input
                        type="number"
                        value={formValues.revenueSharePartner.agreementDuration}
                        onChange={(e) => handleInputChange("revenueSharePartner", "agreementDuration", e.target.value)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        />
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                            className="text-gray-500 text-[10px]"
                            onClick={() => handleInputChange("revenueSharePartner", "agreementDuration", Number(formValues.revenueSharePartner.agreementDuration) + 1)}
                        >▲</button>
                        <button 
                            className="text-gray-500 text-[10px]"
                            onClick={() => handleInputChange("revenueSharePartner", "agreementDuration", Math.max(0, Number(formValues.revenueSharePartner
                            .agreementDuration) - 1))}
                        >▼</button>
                        </div>
                    </div>
                </div>
                </div>
            </>
            )}
        </div>
        </div>
        );
    }
    // Render the modal
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#1E1E1E]">Sales Agent Commission Setup Structure</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <IoMdClose size={24} />
                    </button>
                </div>
                <div className="flex justify-between mb-4">
                    {renderTabButton("perCustomer", "Per Customer")}
                    {renderTabButton("annualBonus", "Annual Bonus")}
                    {renderTabButton("revenueShare", "Revenue Share Commission")}
                </div>
                {activeTab === "perCustomer" && renderPerCustomerTab()}
                {activeTab === "annualBonus" && renderAnnualBonusTab()}
                {activeTab === "revenueShare" && renderRevenueShareTab()}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleUpdate}
                        className="bg-[#039994] text-white py-2 px-4 rounded-lg"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
export default SalesAgentCommissionSetupStructureModal;