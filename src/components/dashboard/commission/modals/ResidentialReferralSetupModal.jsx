"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

// Import styles
const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
const rowWrapper = 'flex space-x-4';
const halfWidth = 'w-1/2';
const grayPlaceholder = 'bg-[#E8E8E8]';

const ResidentialReferralSetupModal = ({ onClose, onUpdate }) => {
  const [formValues, setFormValues] = useState({
    tier1Bonus: 0,
    tier1RequiredReferrals: 0,
    tier2Bonus: 0,
    tier2RequiredReferrals: 0,
    tier3Bonus: 0,
    tier3RequiredReferrals: 0,
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [expandedTiers, setExpandedTiers] = useState({
    tier1: true,
    tier2: false,
    tier3: false,
  });

  const fetchResidentialReferralData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential-referral', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        setFormValues({
          tier1Bonus: result.data.tier1Bonus || 0,
          tier1RequiredReferrals: result.data.tier1RequiredReferrals || 0,
          tier2Bonus: result.data.tier2Bonus || 0,
          tier2RequiredReferrals: result.data.tier2RequiredReferrals || 0,
          tier3Bonus: result.data.tier3Bonus || 0,
          tier3RequiredReferrals: result.data.tier3RequiredReferrals || 0,
        });
      }
    } catch (err) {
      toast.error(`Failed to fetch residential referral data: ${err.message}`, {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidentialReferralData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setUpdating(true);
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential-referral', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier1Bonus: formValues.tier1Bonus.toString(),
          tier1RequiredReferrals: formValues.tier1RequiredReferrals.toString(),
          tier2Bonus: formValues.tier2Bonus.toString(),
          tier2RequiredReferrals: formValues.tier2RequiredReferrals.toString(),
          tier3Bonus: formValues.tier3Bonus.toString(),
          tier3RequiredReferrals: formValues.tier3RequiredReferrals.toString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      if (result.status === 'success') {
        toast.success('Residential referral commission updated successfully', {
          position: 'top-center',
          duration: 3000,
        });
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error(`Failed to update residential referral: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const toggleTier = (tier) => {
    setExpandedTiers(prev => ({
      ...prev,
      [tier]: !prev[tier]
    }));
  };

  const renderInputField = (label, field, step = 1, isPercentage = false) => {
    return (
      <div className="flex flex-col mb-4">
        <label className={labelClass}>
          {label} {isPercentage ? '(%)' : ''}
        </label>
        <div className="relative">
          <input
            type="number"
            value={formValues[field]}
            onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
            className={`${inputClass} ${grayPlaceholder}`}
            min="0"
            step={step}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
            <button 
              className="text-gray-500 text-xs hover:text-gray-700"
              onClick={() => handleInputChange(field, (formValues[field] || 0) + step)}
            >
              ▲
            </button>
            <button 
              className="text-gray-500 text-xs hover:text-gray-700"
              onClick={() => handleInputChange(field, Math.max(0, (formValues[field] || 0) - step))}
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTierSection = (tierNumber, tierKey) => {
    const isExpanded = expandedTiers[tierKey];
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
            <h3 className="font-sfpro text-[16px] leading-[100%] tracking-[-0.05em] font-[400] text-black">
              Tier {tierNumber}
            </h3>
          </div>
          <button
            onClick={() => toggleTier(tierKey)}
            className="text-[#039994] hover:text-[#02857f] transition-colors"
          >
            <svg
              className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="w-full h-px bg-[#039994] mb-4"></div>
        
        {isExpanded && (
          <div className="space-y-4">
            <div className={rowWrapper}>
              <div className={halfWidth}>
                {renderInputField("Residential Referral Bonus (%)", `${tierKey}Bonus`, 0.25, true)}
              </div>
              <div className={halfWidth}>
                {renderInputField("*Number of referrals required", `${tierKey}RequiredReferrals`, 1)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-[#039994] text-center font-sfpro">Loading residential referral data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={20} />
            <h2 className="font-sfpro text-[18px] leading-[100%] tracking-[-0.05em] font-[600] text-[#039994]">
              Setup Structure
            </h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700 transition-colors">
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {renderTierSection(1, 'tier1')}
          {renderTierSection(2, 'tier2')}
          {renderTierSection(3, 'tier3')}
        </div>

        <div className="flex space-x-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-sfpro font-[500]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updating}
            className={`flex-1 py-3 px-4 rounded-md font-sfpro font-[500] transition-colors ${
              updating
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-[#039994] hover:bg-[#02857f] text-white'
            }`}
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentialReferralSetupModal;