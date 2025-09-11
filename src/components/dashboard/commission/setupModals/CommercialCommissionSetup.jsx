"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-hot-toast";

const CommercialCommissionSetup = ({ onClose }) => {
  const [formValues, setFormValues] = useState({
    partnerCommissions: {
      customerReferrer: 10.0,
      installerEPC: 10.0,
      financeCompany: 10.0,
    },
    directRegistration: {
      customerShare: 0.0,
    },
    durations: {
      maxDuration: 15,
      agreementDuration: 2,
      cancellationFee: 500,
    },
  });

  const [updating, setUpdating] = useState(false);

  const calculateScenarioCommissions = () => {
    const { customerReferrer, installerEPC, financeCompany } = formValues.partnerCommissions;
    
    return {
      customerOnly: {
        customer: customerReferrer,
        dcarbon: (100 - customerReferrer).toFixed(1)
      },
      installerOnly: {
        installer: installerEPC,
        dcarbon: (100 - installerEPC).toFixed(1)
      },
      financeOnly: {
        finance: financeCompany,
        dcarbon: (100 - financeCompany).toFixed(1)
      },
      customerInstaller: {
        customer: customerReferrer,
        installer: installerEPC,
        dcarbon: (100 - customerReferrer - installerEPC).toFixed(1)
      },
      customerFinance: {
        customer: customerReferrer,
        finance: financeCompany,
        dcarbon: (100 - customerReferrer - financeCompany).toFixed(1)
      },
      installerFinance: {
        installer: installerEPC,
        finance: financeCompany,
        dcarbon: (100 - installerEPC - financeCompany).toFixed(1)
      },
      allThree: {
        customer: customerReferrer,
        installer: installerEPC,
        finance: financeCompany,
        dcarbon: (100 - customerReferrer - installerEPC - financeCompany).toFixed(1)
      },
      directRegistration: {
        customer: formValues.directRegistration.customerShare,
        dcarbon: (100 - formValues.directRegistration.customerShare).toFixed(1)
      }
    };
  };

  const handleInputChange = (section, field, value) => {
    setFormValues(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: parseFloat(value) || 0 },
    }));
  };

  const handleUpdate = async () => {
    setUpdating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const validationErrors = [];
      const scenarios = calculateScenarioCommissions();
      
      Object.entries(scenarios).forEach(([scenarioName, values]) => {
        const dcarbon = parseFloat(values.dcarbon);
        if (dcarbon < 0) {
          validationErrors.push(`Invalid commission total in ${scenarioName} scenario - exceeds 100%`);
        }
      });
      
      if (formValues.partnerCommissions.customerReferrer < 0 || 
          formValues.partnerCommissions.installerEPC < 0 || 
          formValues.partnerCommissions.financeCompany < 0) {
        validationErrors.push("Commission percentages cannot be negative");
      }
      
      if (formValues.partnerCommissions.customerReferrer > 100 || 
          formValues.partnerCommissions.installerEPC > 100 || 
          formValues.partnerCommissions.financeCompany > 100) {
        validationErrors.push("Individual commission percentages cannot exceed 100%");
      }
      
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(", "));
      }
      
      toast.success("Commercial commission structure updated successfully", {
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

  const scenarios = calculateScenarioCommissions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <IoSettingsSharp className="text-[#039994] mr-2" size={18} />
            <h2 className="text-lg font-semibold text-[#039994]">Commercial Commission Setup Structure</h2>
          </div>
          <button onClick={onClose} className="text-red-500 hover:text-red-700">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-orange-800 mb-2">Setup Instructions</h3>
          <p className="text-sm text-orange-700">
            Set the base commission percentages for each partner type. The system will automatically calculate 
            all possible scenarios and DCarbon remainder to ensure totals equal 100%.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Partner Commission Rates</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">Customer Referrer Commission (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.partnerCommissions.customerReferrer}
                    onChange={(e) => handleInputChange("partnerCommissions", "customerReferrer", e.target.value)}
                    className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Commission for customers who refer others to the platform</p>
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">Installer/EPC Commission (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.partnerCommissions.installerEPC}
                    onChange={(e) => handleInputChange("partnerCommissions", "installerEPC", e.target.value)}
                    className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Commission for installers/EPCs submitting documents</p>
                </div>

                <div>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">Finance Company Commission (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formValues.partnerCommissions.financeCompany}
                    onChange={(e) => handleInputChange("partnerCommissions", "financeCompany", e.target.value)}
                    className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Commission for finance companies handling submissions</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Direct Registration</h3>
              
              <div>
                <label className="block mb-1 text-gray-700 text-sm font-medium">Customer Direct Share (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formValues.directRegistration.customerShare}
                  onChange={(e) => handleInputChange("directRegistration", "customerShare", e.target.value)}
                  className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Commission for customers who register directly (typically 0%)</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-[#1E1E1E] text-sm mb-4">Terms & Conditions</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">Max Duration (Years)</label>
                  <input
                    type="number"
                    value={formValues.durations.maxDuration}
                    onChange={(e) => handleInputChange("durations", "maxDuration", e.target.value)}
                    className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">Agreement Duration (Years)</label>
                  <input
                    type="number"
                    value={formValues.durations.agreementDuration}
                    onChange={(e) => handleInputChange("durations", "agreementDuration", e.target.value)}
                    className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 text-gray-700 text-sm font-medium">Cancellation Fee ($)</label>
                  <input
                    type="number"
                    value={formValues.durations.cancellationFee}
                    onChange={(e) => handleInputChange("durations", "cancellationFee", e.target.value)}
                    className="w-full rounded bg-white border border-gray-300 py-2 px-3 text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-[#039994] text-sm mb-4">Live Preview - All Scenarios</h3>
            
            <div className="space-y-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Partner Referral Scenarios</h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Customer Only:</span>
                    <span>Customer {scenarios.customerOnly.customer}% | DCarbon {scenarios.customerOnly.dcarbon}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Installer/EPC Only:</span>
                    <span>Installer {scenarios.installerOnly.installer}% | DCarbon {scenarios.installerOnly.dcarbon}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Finance Company Only:</span>
                    <span>Finance {scenarios.financeOnly.finance}% | DCarbon {scenarios.financeOnly.dcarbon}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Customer + Installer:</span>
                    <span>C {scenarios.customerInstaller.customer}% | I {scenarios.customerInstaller.installer}% | DCarbon {scenarios.customerInstaller.dcarbon}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Customer + Finance:</span>
                    <span>C {scenarios.customerFinance.customer}% | F {scenarios.customerFinance.finance}% | DCarbon {scenarios.customerFinance.dcarbon}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Installer + Finance:</span>
                    <span>I {scenarios.installerFinance.installer}% | F {scenarios.installerFinance.finance}% | DCarbon {scenarios.installerFinance.dcarbon}%</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>All Three Partners:</span>
                    <span>C {scenarios.allThree.customer}% | I {scenarios.allThree.installer}% | F {scenarios.allThree.finance}% | DCarbon {scenarios.allThree.dcarbon}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">Direct Registration</h4>
                <div className="text-xs">
                  <div className="flex justify-between">
                    <span>No Referral:</span>
                    <span>Customer {scenarios.directRegistration.customer}% | DCarbon {scenarios.directRegistration.dcarbon}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-100 p-3 rounded border border-orange-300">
                <h4 className="font-medium text-orange-800 mb-1">Validation Status</h4>
                <p className="text-xs text-orange-700">
                  {parseFloat(scenarios.allThree.dcarbon) < 0 ? 
                    "⚠️ Warning: Total commissions exceed 100% in worst case scenario" : 
                    "✅ All scenarios are valid (DCarbon remainder ≥ 0%)"
                  }
                </p>
              </div>
            </div>
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

export default CommercialCommissionSetup;