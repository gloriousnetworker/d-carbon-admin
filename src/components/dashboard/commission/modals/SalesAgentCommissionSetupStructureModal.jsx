"use client";
import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const SalesAgentCommissionSetupStructureModal = ({ onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState("perCustomer");
  const [expandedSections, setExpandedSections] = useState({
    solarOwner: true,
    partner: true,
    annualBonus1: true,
    annualBonus2: true,
    annualBonus3: true,
    revenueShareOwner: true,
    revenueSharePartner: true,
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
      amount: 0,
      agreementDuration: 0,
    },
    annualBonus2: {
      capacity: 0,
      amount: 0,
      agreementDuration: 0,
    },
    annualBonus3: {
      capacity: 0,
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

  const fetchSalesAgentData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const [perCustomerRes, annualBonusRes, revenueShareRes] = await Promise.all([
        fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent/per-customer', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent/annual-bonus', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent/revenue-share', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!perCustomerRes.ok || !annualBonusRes.ok || !revenueShareRes.ok) {
        throw new Error('Failed to fetch one or more sales agent commission data');
      }

      const [perCustomerData, annualBonusData, revenueShareData] = await Promise.all([
        perCustomerRes.json(),
        annualBonusRes.json(),
        revenueShareRes.json()
      ]);

      if (perCustomerData.status === 'success' && annualBonusData.status === 'success' && revenueShareData.status === 'success') {
        setFormValues({
          solarOwner: {
            capacity: perCustomerData.data.solarOwnerCapacity || 0,
            amount: perCustomerData.data.solarOwnerAmount || 0,
            agreementDuration: perCustomerData.data.solarOwnerAgreementDuration || 0,
          },
          partner: {
            capacity: perCustomerData.data.partnerCapacity || 0,
            amount: perCustomerData.data.partnerAmount || 0,
            agreementDuration: perCustomerData.data.partnerAgreementDuration || 0,
          },
          annualBonus1: {
            capacity: annualBonusData.data.bonus1Capacity || 0,
            amount: annualBonusData.data.bonus1Amount || 0,
            agreementDuration: annualBonusData.data.bonus1AgreementDuration || 0,
          },
          annualBonus2: {
            capacity: annualBonusData.data.bonus2Capacity || 0,
            amount: annualBonusData.data.bonus2Amount || 0,
            agreementDuration: annualBonusData.data.bonus2AgreementDuration || 0,
          },
          annualBonus3: {
            capacity: annualBonusData.data.bonus3Capacity || 0,
            amount: annualBonusData.data.bonus3Amount || 0,
            agreementDuration: annualBonusData.data.bonus3AgreementDuration || 0,
          },
          revenueShareOwner: {
            percentage: revenueShareData.data.solarOwnerPercentage || 0,
            agreementDuration: revenueShareData.data.solarOwnerAgreementDuration || 0,
          },
          revenueSharePartner: {
            percentage: revenueShareData.data.partnerPercentage || 0,
            agreementDuration: revenueShareData.data.partnerAgreementDuration || 0,
          },
        });
      }
    } catch (err) {
      toast.error(`Failed to fetch sales agent commission data: ${err.message}`, {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAgentData();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updatePerCustomer = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent/per-customer', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solarOwnerCapacity: formValues.solarOwner.capacity.toString(),
          solarOwnerAmount: formValues.solarOwner.amount.toString(),
          solarOwnerAgreementDuration: formValues.solarOwner.agreementDuration.toString(),
          partnerCapacity: formValues.partner.capacity.toString(),
          partnerAmount: formValues.partner.amount.toString(),
          partnerAgreementDuration: formValues.partner.agreementDuration.toString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      if (result.status === 'success') {
        toast.success('Per customer commission updated successfully', {
          position: 'top-center',
          duration: 3000,
        });
        return true;
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error(`Failed to update per customer commission: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
      return false;
    }
  };

  const updateAnnualBonus = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent/annual-bonus', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bonus1Capacity: formValues.annualBonus1.capacity.toString(),
          bonus1Amount: formValues.annualBonus1.amount.toString(),
          bonus1AgreementDuration: formValues.annualBonus1.agreementDuration.toString(),
          bonus2Capacity: formValues.annualBonus2.capacity.toString(),
          bonus2Amount: formValues.annualBonus2.amount.toString(),
          bonus2AgreementDuration: formValues.annualBonus2.agreementDuration.toString(),
          bonus3Capacity: formValues.annualBonus3.capacity.toString(),
          bonus3Amount: formValues.annualBonus3.amount.toString(),
          bonus3AgreementDuration: formValues.annualBonus3.agreementDuration.toString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      if (result.status === 'success') {
        toast.success('Annual bonus commission updated successfully', {
          position: 'top-center',
          duration: 3000,
        });
        return true;
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error(`Failed to update annual bonus commission: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
      return false;
    }
  };

  const updateRevenueShare = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent/revenue-share', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          solarOwnerPercentage: formValues.revenueShareOwner.percentage.toString(),
          solarOwnerAgreementDuration: formValues.revenueShareOwner.agreementDuration.toString(),
          partnerPercentage: formValues.revenueSharePartner.percentage.toString(),
          partnerAgreementDuration: formValues.revenueSharePartner.agreementDuration.toString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      if (result.status === 'success') {
        toast.success('Revenue share commission updated successfully', {
          position: 'top-center',
          duration: 3000,
        });
        return true;
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error(`Failed to update revenue share commission: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
      return false;
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      let success = true;
      
      // Update based on active tab
      if (activeTab === "perCustomer") {
        success = await updatePerCustomer();
      } else if (activeTab === "annualBonus") {
        success = await updateAnnualBonus();
      } else if (activeTab === "revenueShare") {
        success = await updateRevenueShare();
      }

      if (success && onUpdate) {
        onUpdate();
      }
    } finally {
      setUpdating(false);
    }
  };

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
                      onChange={(e) => handleInputChange("solarOwner", "capacity", parseFloat(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      step="0.1"
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
                      onChange={(e) => handleInputChange("solarOwner", "amount", parseFloat(e.target.value) || 0)}
                      className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.solarOwner.agreementDuration}
                      onChange={(e) => handleInputChange("solarOwner", "agreementDuration", parseInt(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("solarOwner", "agreementDuration", (formValues.solarOwner.agreementDuration || 0) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("solarOwner", "agreementDuration", Math.max(0, (formValues.solarOwner.agreementDuration || 0) - 1))}
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
                      onChange={(e) => handleInputChange("partner", "capacity", parseFloat(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      step="0.1"
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
                      onChange={(e) => handleInputChange("partner", "amount", parseFloat(e.target.value) || 0)}
                      className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formValues.partner.agreementDuration}
                      onChange={(e) => handleInputChange("partner", "agreementDuration", parseInt(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("partner", "agreementDuration", (formValues.partner.agreementDuration || 0) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("partner", "agreementDuration", Math.max(0, (formValues.partner.agreementDuration || 0) - 1))}
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
                  <input
                    type="number"
                    value={formValues.annualBonus1.capacity}
                    onChange={(e) => handleInputChange("annualBonus1", "capacity", parseFloat(e.target.value) || 0)}
                    className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                      <input
                        type="number"
                        value={formValues.annualBonus1.amount}
                        onChange={(e) => handleInputChange("annualBonus1", "amount", parseFloat(e.target.value) || 0)}
                        className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formValues.annualBonus1.agreementDuration}
                        onChange={(e) => handleInputChange("annualBonus1", "agreementDuration", parseInt(e.target.value) || 0)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        min="0"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                          className="text-gray-500 text-[10px] hover:text-gray-700"
                          onClick={() => handleInputChange("annualBonus1", "agreementDuration", (formValues.annualBonus1.agreementDuration || 0) + 1)}
                        >▲</button>
                        <button 
                          className="text-gray-500 text-[10px] hover:text-gray-700"
                          onClick={() => handleInputChange("annualBonus1", "agreementDuration", Math.max(0, (formValues.annualBonus1.agreementDuration || 0) - 1))}
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
                  <input
                    type="number"
                    value={formValues.annualBonus2.capacity}
                    onChange={(e) => handleInputChange("annualBonus2", "capacity", parseFloat(e.target.value) || 0)}
                    className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                      <input
                        type="number"
                        value={formValues.annualBonus2.amount}
                        onChange={(e) => handleInputChange("annualBonus2", "amount", parseFloat(e.target.value) || 0)}
                        className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formValues.annualBonus2.agreementDuration}
                        onChange={(e) => handleInputChange("annualBonus2", "agreementDuration", parseInt(e.target.value) || 0)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        min="0"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                          className="text-gray-500 text-[10px] hover:text-gray-700"
                          onClick={() => handleInputChange("annualBonus2", "agreementDuration", (formValues.annualBonus2.agreementDuration || 0) + 1)}
                        >▲</button>
                        <button 
                          className="text-gray-500 text-[10px] hover:text-gray-700"
                          onClick={() => handleInputChange("annualBonus2", "agreementDuration", Math.max(0, (formValues.annualBonus2.agreementDuration || 0) - 1))}
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
                  <input
                    type="number"
                    value={formValues.annualBonus3.capacity}
                    onChange={(e) => handleInputChange("annualBonus3", "capacity", parseFloat(e.target.value) || 0)}
                    className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Amount</label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l py-1 px-2 text-xs">$</span>
                      <input
                        type="number"
                        value={formValues.annualBonus3.amount}
                        onChange={(e) => handleInputChange("annualBonus3", "amount", parseFloat(e.target.value) || 0)}
                        className="rounded-r bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Agreement Duration (Yr)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formValues.annualBonus3.agreementDuration}
                        onChange={(e) => handleInputChange("annualBonus3", "agreementDuration", parseInt(e.target.value) || 0)}
                        className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                        min="0"
                      />
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                        <button 
                          className="text-gray-500 text-[10px] hover:text-gray-700"
                          onClick={() => handleInputChange("annualBonus3", "agreementDuration", (formValues.annualBonus3.agreementDuration || 0) + 1)}
                        >▲</button>
                        <button 
                          className="text-gray-500 text-[10px] hover:text-gray-700"
                          onClick={() => handleInputChange("annualBonus3", "agreementDuration", Math.max(0, (formValues.annualBonus3.agreementDuration || 0) - 1))}
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
                      onChange={(e) => handleInputChange("revenueShareOwner", "percentage", parseFloat(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueShareOwner", "percentage", Math.min(100, (formValues.revenueShareOwner.percentage || 0) + 0.5))}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueShareOwner", "percentage", Math.max(0, (formValues.revenueShareOwner.percentage || 0) - 0.5))}
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
                      onChange={(e) => handleInputChange("revenueShareOwner", "agreementDuration", parseInt(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueShareOwner", "agreementDuration", (formValues.revenueShareOwner.agreementDuration || 0) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueShareOwner", "agreementDuration", Math.max(0, (formValues.revenueShareOwner.agreementDuration || 0) - 1))}
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
                      onChange={(e) => handleInputChange("revenueSharePartner", "percentage", parseFloat(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueSharePartner", "percentage", Math.min(100, (formValues.revenueSharePartner.percentage || 0) + 0.5))}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueSharePartner", "percentage", Math.max(0, (formValues.revenueSharePartner.percentage || 0) - 0.5))}
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
                      onChange={(e) => handleInputChange("revenueSharePartner", "agreementDuration", parseInt(e.target.value) || 0)}
                      className="rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs w-full"
                      min="0"
                    />
                    <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueSharePartner", "agreementDuration", (formValues.revenueSharePartner.agreementDuration || 0) + 1)}
                      >▲</button>
                      <button 
                        className="text-gray-500 text-[10px] hover:text-gray-700"
                        onClick={() => handleInputChange("revenueSharePartner", "agreementDuration", Math.max(0, (formValues.revenueSharePartner.agreementDuration || 0) - 1))}
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-[#039994] text-center">Loading sales agent commission data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={20} />
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Sales Agent Commission Setup Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="flex justify-between mb-4 border-b">
          {renderTabButton("perCustomer", "Per Customer")}
          {renderTabButton("annualBonus", "Annual Bonus")}
          {renderTabButton("revenueShare", "Revenue Share Commission")}
        </div>

        {activeTab === "perCustomer" && renderPerCustomerTab()}
        {activeTab === "annualBonus" && renderAnnualBonusTab()}
        {activeTab === "revenueShare" && renderRevenueShareTab()}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating}
            className={`px-4 py-2 rounded-md text-sm ${
              updating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#039994] hover:bg-[#028B86] text-white'
            }`}
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesAgentCommissionSetupStructureModal;