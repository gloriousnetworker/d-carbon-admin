"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const CustomerSolarOwnerShareSetupStructureModal = ({ onClose, onUpdate }) => {
  const [expandedSections, setExpandedSections] = useState({
    commercialWithPartner: true,
    commercialWithoutPartner: true,
    residentialPoints: true,
  });

  const [formValues, setFormValues] = useState({
    commercialWithPartner: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 0,
    },
    commercialWithoutPartner: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 0,
    },
    residentialPoints: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({
    commercialWithPartner: false,
    commercialWithoutPartner: false,
    residentialPoints: false,
  });

  const fetchCommissionData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/customer/all', {
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
          commercialWithPartner: {
            lessThan500k: result.data.commercialWithPartner?.lessThan500k || 0,
            between500kTo2_5m: result.data.commercialWithPartner?.between500kTo2_5m || 0,
            moreThan2_5m: result.data.commercialWithPartner?.moreThan2_5m || 0,
            maxDuration: result.data.commercialWithPartner?.maxDuration || 0,
            agreementDuration: result.data.commercialWithPartner?.agreementDuration || 0,
            cancellationFee: result.data.commercialWithPartner?.cancellationFee || 0,
          },
          commercialWithoutPartner: {
            lessThan500k: result.data.commercialWithoutPartner?.lessThan500k || 0,
            between500kTo2_5m: result.data.commercialWithoutPartner?.between500kTo2_5m || 0,
            moreThan2_5m: result.data.commercialWithoutPartner?.moreThan2_5m || 0,
            maxDuration: result.data.commercialWithoutPartner?.maxDuration || 0,
            agreementDuration: result.data.commercialWithoutPartner?.agreementDuration || 0,
            cancellationFee: result.data.commercialWithoutPartner?.cancellationFee || 0,
          },
          residentialPoints: {
            lessThan500k: result.data.residentialPoints?.lessThan500k || 0,
            between500kTo2_5m: result.data.residentialPoints?.between500kTo2_5m || 0,
            moreThan2_5m: result.data.residentialPoints?.moreThan2_5m || 0,
            maxDuration: result.data.residentialPoints?.maxDuration || 0,
            agreementDuration: result.data.residentialPoints?.agreementDuration || 0,
            cancellationFee: result.data.residentialPoints?.cancellationFee || 0,
          },
        });
      }
    } catch (err) {
      toast.error(`Failed to fetch commission data: ${err.message}`, {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionData();
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

  const updateCommissionStructure = async (type, data) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const endpoints = {
        commercialWithPartner: 'https://services.dcarbon.solutions/api/commission-structure/commercial-with-partner',
        commercialWithoutPartner: 'https://services.dcarbon.solutions/api/commission-structure/commercial-without-partner',
        residentialPoints: 'https://services.dcarbon.solutions/api/commission-structure/residential-points',
      };

      const response = await fetch(endpoints[type], {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessThan500k: data.lessThan500k.toString(),
          between500kTo2_5m: data.between500kTo2_5m.toString(),
          moreThan2_5m: data.moreThan2_5m.toString(),
          maxDuration: data.maxDuration.toString(),
          agreementDuration: data.agreementDuration.toString(),
          cancellationFee: data.cancellationFee.toString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      
      if (result.status === 'success') {
        toast.success(`Commission updated successfully`, {
          position: 'top-center',
          duration: 3000,
        });
        if (onUpdate) onUpdate();
        return true;
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      toast.error(`Failed to update commission: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
      return false;
    }
  };

  const handleUpdateSection = async (section) => {
    setUpdating(prev => ({ ...prev, [section]: true }));
    
    await updateCommissionStructure(section, formValues[section]);
    
    setUpdating(prev => ({ ...prev, [section]: false }));
  };

  const renderSetupSection = (title, section, expanded) => {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="mr-2">•</span>
            <h3 className="font-medium text-[#1E1E1E] text-sm">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdateSection(section)}
              disabled={updating[section]}
              className={`px-3 py-1 text-xs rounded ${
                updating[section]
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#039994] hover:bg-[#028B86]'
              } text-white transition-colors`}
            >
              {updating[section] ? 'Updating...' : 'Update'}
            </button>
            <button onClick={() => toggleSection(section)}>
              {expanded ? (
                <FaChevronUp className="text-[#039994]" size={14} />
              ) : (
                <FaChevronDown className="text-[#039994]" size={14} />
              )}
            </button>
          </div>
        </div>
        
        {expanded && (
          <>
            <div className="w-full h-px bg-[#039994] mb-3"></div>
            <div className="grid grid-cols-6 gap-3 text-xs">
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
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "lessThan500k", Math.min(100, (formValues[section].lessThan500k || 0) + 1))}
                    >▲</button>
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
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
                    value={formValues[section].between500kTo2_5m}
                    onChange={(e) => handleInputChange(section, "between500kTo2_5m", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "between500kTo2_5m", Math.min(100, (formValues[section].between500kTo2_5m || 0) + 1))}
                    >▲</button>
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "between500kTo2_5m", Math.max(0, (formValues[section].between500kTo2_5m || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].moreThan2_5m}
                    onChange={(e) => handleInputChange(section, "moreThan2_5m", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                    max="100"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "moreThan2_5m", Math.min(100, (formValues[section].moreThan2_5m || 0) + 1))}
                    >▲</button>
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "moreThan2_5m", Math.max(0, (formValues[section].moreThan2_5m || 0) - 1))}
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
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "maxDuration", (formValues[section].maxDuration || 0) + 1)}
                    >▲</button>
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
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
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "agreementDuration", (formValues[section].agreementDuration || 0) + 1)}
                    >▲</button>
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "agreementDuration", Math.max(0, (formValues[section].agreementDuration || 0) - 1))}
                    >▼</button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <label className="mb-1 text-gray-600 text-xs">Cancellation Fee ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formValues[section].cancellationFee}
                    onChange={(e) => handleInputChange(section, "cancellationFee", parseInt(e.target.value) || 0)}
                    className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                    min="0"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
                      onClick={() => handleInputChange(section, "cancellationFee", (formValues[section].cancellationFee || 0) + 50)}
                    >▲</button>
                    <button 
                      type="button"
                      className="text-gray-500 text-[10px] hover:text-gray-700"
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-[#039994] text-center">Loading commission data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Customer Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {renderSetupSection("Commercial Customer Share w/Partner Referral", "commercialWithPartner", expandedSections.commercialWithPartner)}
          {renderSetupSection("Commercial Customer Share w/o Partner Referral", "commercialWithoutPartner", expandedSections.commercialWithoutPartner)}
          {renderSetupSection("Residential Customer Points Share", "residentialPoints", expandedSections.residentialPoints)}
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSolarOwnerShareSetupStructureModal;