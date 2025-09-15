"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const ResidentialCommissionSetup = ({ onClose, onSuccess }) => {
  const [formValues, setFormValues] = useState({
    facilityShareWithReferral: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
    },
    installerEPC: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
    },
    financeCompany: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
    },
    facilityShareNoReferral: {
      lessThan500k: 0,
      between500kTo2_5m: 0,
      moreThan2_5m: 0,
    },
    durations: {
      maxDuration: 0,
      agreementDuration: 0,
      cancellationFee: 0,
    },
  });

  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch commission data');
      }

      const result = await response.json();
      
      if (result.status === 'success') {
        const { direct, partnerInstaller, partnerFinance, terms } = result.data;
        
        setFormValues({
          facilityShareWithReferral: {
            lessThan500k: partnerInstaller.customerShareLessThan500k || 0,
            between500kTo2_5m: partnerInstaller.customerShareBetween500kTo2_5m || 0,
            moreThan2_5m: partnerInstaller.customerShareMoreThan2_5m || 0,
          },
          installerEPC: {
            lessThan500k: partnerInstaller.partnerShareLessThan500k || 0,
            between500kTo2_5m: partnerInstaller.partnerShareBetween500kTo2_5m || 0,
            moreThan2_5m: partnerInstaller.partnerShareMoreThan2_5m || 0,
          },
          financeCompany: {
            lessThan500k: partnerFinance.partnerShareLessThan500k || 0,
            between500kTo2_5m: partnerFinance.partnerShareBetween500kTo2_5m || 0,
            moreThan2_5m: partnerFinance.partnerShareMoreThan2_5m || 0,
          },
          facilityShareNoReferral: {
            lessThan500k: direct.lessThan500k || 0,
            between500kTo2_5m: direct.between500kTo2_5m || 0,
            moreThan2_5m: direct.moreThan2_5m || 0,
          },
          durations: {
            maxDuration: terms.maxDuration || 0,
            agreementDuration: terms.agreementDuration || 0,
            cancellationFee: terms.cancellationFee || 0,
          },
        });
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast.error(`Failed to load commission data: ${error.message}`, {
        position: 'top-center',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const calculateRemainderWithInstaller = (tier) => {
    const facility = formValues.facilityShareWithReferral[tier];
    const installer = formValues.installerEPC[tier];
    return (100 - facility - installer).toFixed(1);
  };

  const calculateRemainderWithFinance = (tier) => {
    const facility = formValues.facilityShareWithReferral[tier];
    const finance = formValues.financeCompany[tier];
    return (100 - facility - finance).toFixed(1);
  };

  const calculateNoReferralRemainder = (tier) => {
    return (100 - formValues.facilityShareNoReferral[tier]).toFixed(1);
  };

  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const updatePartnerInstaller = async () => {
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential/partner-installer', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        customerShareLessThan500k: formValues.facilityShareWithReferral.lessThan500k,
        partnerShareLessThan500k: formValues.installerEPC.lessThan500k,
        customerShareBetween500kTo2_5m: formValues.facilityShareWithReferral.between500kTo2_5m,
        partnerShareBetween500kTo2_5m: formValues.installerEPC.between500kTo2_5m,
        customerShareMoreThan2_5m: formValues.facilityShareWithReferral.moreThan2_5m,
        partnerShareMoreThan2_5m: formValues.installerEPC.moreThan2_5m,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update partner installer');
    }

    return await response.json();
  };

  const updatePartnerFinance = async () => {
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential/partner-finance', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        customerShareLessThan500k: formValues.facilityShareWithReferral.lessThan500k,
        partnerShareLessThan500k: formValues.financeCompany.lessThan500k,
        customerShareBetween500kTo2_5m: formValues.facilityShareWithReferral.between500kTo2_5m,
        partnerShareBetween500kTo2_5m: formValues.financeCompany.between500kTo2_5m,
        customerShareMoreThan2_5m: formValues.facilityShareWithReferral.moreThan2_5m,
        partnerShareMoreThan2_5m: formValues.financeCompany.moreThan2_5m,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update partner finance');
    }

    return await response.json();
  };

  const updateDirectCommission = async () => {
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential/direct', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        lessThan500k: formValues.facilityShareNoReferral.lessThan500k,
        between500kTo2_5m: formValues.facilityShareNoReferral.between500kTo2_5m,
        moreThan2_5m: formValues.facilityShareNoReferral.moreThan2_5m,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update direct commission');
    }

    return await response.json();
  };

  const updateCommissionTerms = async () => {
    const authToken = localStorage.getItem('authToken');
    
    const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential/terms', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        maxDuration: formValues.durations.maxDuration,
        agreementDuration: formValues.durations.agreementDuration,
        cancellationFee: formValues.durations.cancellationFee,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update commission terms');
    }

    return await response.json();
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      const validationErrors = [];
      
      ["lessThan500k", "between500kTo2_5m", "moreThan2_5m"].forEach(tier => {
        const installerRemainder = parseFloat(calculateRemainderWithInstaller(tier));
        const financeRemainder = parseFloat(calculateRemainderWithFinance(tier));
        const noReferralRemainder = parseFloat(calculateNoReferralRemainder(tier));
        
        if (installerRemainder < 0) {
          validationErrors.push(`Installer/EPC total exceeds 100% in ${tier} tier`);
        }
        
        if (financeRemainder < 0) {
          validationErrors.push(`Finance Company total exceeds 100% in ${tier} tier`);
        }
        
        if (noReferralRemainder < 0) {
          validationErrors.push(`No referral facility share exceeds 100% in ${tier} tier`);
        }
      });
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }

      await Promise.all([
        updatePartnerInstaller(),
        updatePartnerFinance(),
        updateDirectCommission(),
        updateCommissionTerms(),
      ]);
      
      toast.success("Residential commission structure updated successfully", {
        position: 'top-center',
        duration: 3000,
      });

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

  const renderPercentageInputs = (title, section, fields) => {
    return (
      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col">
              <label className="mb-1 text-gray-600 text-xs">{field.label}</label>
              <input
                type="number"
                step="0.1"
                value={formValues[section][field.key]}
                onChange={(e) => handleInputChange(section, field.key, e.target.value)}
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
  };

  const renderVariableSection = (title, values) => {
    return (
      <div className="mb-6 p-3 bg-blue-50 rounded">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">{title}</h3>
        <p className="text-xs text-gray-600 mb-3">
          This remainder is automatically calculated to make the total 100%.
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&lt;$500k (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {values.lessThan500k}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">$500k - $2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {values.between500kTo2_5m}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">&gt;$2.5M (%)</label>
            <div className="py-2 px-3 bg-white rounded border border-gray-300 text-gray-700">
              {values.moreThan2_5m}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDurationInputs = () => {
    return (
      <div className="mb-6">
        <h3 className="font-medium text-[#1E1E1E] text-sm mb-3">Durations & Terms</h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">Max Duration (Years)</label>
            <input
              type="number"
              value={formValues.durations.maxDuration}
              onChange={(e) => handleInputChange("durations", "maxDuration", e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">Agreement Duration (Years)</label>
            <input
              type="number"
              value={formValues.durations.agreementDuration}
              onChange={(e) => handleInputChange("durations", "agreementDuration", e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-gray-600 text-xs">Cancellation Fee ($)</label>
            <input
              type="number"
              value={formValues.durations.cancellationFee}
              onChange={(e) => handleInputChange("durations", "cancellationFee", e.target.value)}
              className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-2 px-3 text-xs"
              min="0"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    );
  };

  const installerRemainder = {
    lessThan500k: calculateRemainderWithInstaller("lessThan500k"),
    between500kTo2_5m: calculateRemainderWithInstaller("between500kTo2_5m"),
    moreThan2_5m: calculateRemainderWithInstaller("moreThan2_5m"),
  };

  const financeRemainder = {
    lessThan500k: calculateRemainderWithFinance("lessThan500k"),
    between500kTo2_5m: calculateRemainderWithFinance("between500kTo2_5m"),
    moreThan2_5m: calculateRemainderWithFinance("moreThan2_5m"),
  };

  const noReferralRemainder = {
    lessThan500k: calculateNoReferralRemainder("lessThan500k"),
    between500kTo2_5m: calculateNoReferralRemainder("between500kTo2_5m"),
    moreThan2_5m: calculateNoReferralRemainder("moreThan2_5m"),
  };

  if (loading) {
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
      <div className="bg-white rounded-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Setup Residential Commission Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-[#1E1E1E] text-sm">With Partner Referral</h3>
          
          {renderPercentageInputs("Residential Facility Share", "facilityShareWithReferral", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderPercentageInputs("When referred by Installer/EPC", "installerEPC", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (With Installer/EPC)", installerRemainder)}

          {renderPercentageInputs("When referred by Finance Company", "financeCompany", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (With Finance Company)", financeRemainder)}

          <h3 className="font-medium text-[#1E1E1E] text-sm">No Referral</h3>
          
          {renderPercentageInputs("Residential Facility Share", "facilityShareNoReferral", [
            { key: "lessThan500k", label: "<$500k (%)" },
            { key: "between500kTo2_5m", label: "$500k - $2.5M (%)" },
            { key: "moreThan2_5m", label: ">$2.5M (%)" },
          ])}

          {renderVariableSection("DCarbon Remainder (No Referral)", noReferralRemainder)}

          {renderDurationInputs()}
        </div>

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

export default ResidentialCommissionSetup;