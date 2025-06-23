"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const CommissionTable = ({ activeCommissionType, onChangeCommissionType, onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const commissionTypes = [
    "Partner Share",
    "Master/Super Partner TPO Share", 
    "Customer/Solar Owner Share",
    "Residential Referral",
    "Sales Agent Commission"
  ];

  const STATIC_DATA = {
    "Master/Super Partner TPO Share": {
      headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration", "Cancellation Fee"],
      rows: [
        ["Master Partner (TPO)", "20%", "15%", "10%", "7", "1", "$250"],
        ["Master Partner (TPO)", "5%", "5%", "5%", "7", "1", "$250"],
        ["Master Partner (TPO)", "10%", "10%", "10%", "7", "1", "$250"],
        ["Master Partner (Resident/Operator Incentive)", "5%", "5%", "5%", "7", "1", "$250"],
      ],
    },
    "Customer/Solar Owner Share": {
      headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration", "Cancellation Fee"],
      rows: [
        ["Commercial Customer Share w/Partner Referral", "20%", "15%", "10%", "7", "1", "$250"],
        ["Commercial Customer Share w/o Partner Referral (also after Y7)", "5%", "5%", "5%", "7", "1", "$250"],
        ["Residential Customer Points Share", "10%", "10%", "10%", "7", "1", "$250"],
      ],
    },
  };

  // Fetch functions for each commission type
  const fetchPartnerCommissionData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/partner/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const partnerShareData = {
          headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration"],
          rows: [
            [
              "Standard Commercial/Residential", 
              `${result.data.standard?.lessThan500k || 0}%`, 
              `${result.data.standard?.between500kTo2_5m || 0}%`, 
              `${result.data.standard?.moreThan2_5m || 0}%`, 
              result.data.standard?.maxDuration || 0, 
              result.data.standard?.agreementDuration || 0
            ],
            [
              "Quarterly Bonus Commercial", 
              `${result.data.quarterlyBonus?.lessThan500k || 0}%`, 
              `${result.data.quarterlyBonus?.between500kTo2_5m || 0}%`, 
              `${result.data.quarterlyBonus?.moreThan2_5m || 0}%`, 
              result.data.quarterlyBonus?.maxDuration || 0, 
              result.data.quarterlyBonus?.agreementDuration || 0
            ],
            [
              "Bonus Residential", 
              `${result.data.bonusResidential?.lessThan500k || 0}%`, 
              `${result.data.bonusResidential?.between500kTo2_5m || 0}%`, 
              `${result.data.bonusResidential?.moreThan2_5m || 0}%`, 
              result.data.bonusResidential?.maxDuration || 0, 
              result.data.bonusResidential?.agreementDuration || 0
            ],
            [
              "Annual Bonus", 
              `${result.data.annualBonus?.lessThan500k || 0}%`, 
              `${result.data.annualBonus?.between500kTo2_5m || 0}%`, 
              `${result.data.annualBonus?.moreThan2_5m || 0}%`, 
              result.data.annualBonus?.maxDuration || 0, 
              result.data.annualBonus?.agreementDuration || 0
            ],
          ],
        };
        setTableData(partnerShareData);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch commission data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerCommissionData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/customer/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const customerShareData = {
          headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration", "Cancellation Fee"],
          rows: [
            [
              "Commercial Customer Share w/Partner Referral", 
              `${result.data.commercialWithPartner?.lessThan500k || 0}%`, 
              `${result.data.commercialWithPartner?.between500kTo2_5m || 0}%`, 
              `${result.data.commercialWithPartner?.moreThan2_5m || 0}%`, 
              result.data.commercialWithPartner?.maxDuration || 0, 
              result.data.commercialWithPartner?.agreementDuration || 0,
              `$${result.data.commercialWithPartner?.cancellationFee || 0}`
            ],
            [
              "Commercial Customer Share w/o Partner Referral", 
              `${result.data.commercialWithoutPartner?.lessThan500k || 0}%`, 
              `${result.data.commercialWithoutPartner?.between500kTo2_5m || 0}%`, 
              `${result.data.commercialWithoutPartner?.moreThan2_5m || 0}%`, 
              result.data.commercialWithoutPartner?.maxDuration || 0, 
              result.data.commercialWithoutPartner?.agreementDuration || 0,
              `$${result.data.commercialWithoutPartner?.cancellationFee || 0}`
            ],
            [
              "Residential Customer Points Share", 
              `${result.data.residentialPoints?.lessThan500k || 0}%`, 
              `${result.data.residentialPoints?.between500kTo2_5m || 0}%`, 
              `${result.data.residentialPoints?.moreThan2_5m || 0}%`, 
              result.data.residentialPoints?.maxDuration || 0, 
              result.data.residentialPoints?.agreementDuration || 0,
              `$${result.data.residentialPoints?.cancellationFee || 0}`
            ],
          ],
        };
        setTableData(customerShareData);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch commission data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchResidentialReferralData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential-referral', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const referralData = {
          headers: ["", "Tier 1", "Tier 2", "Tier 3"],
          rows: [
            ["Tier status", "Bronze", "Silver", "Gold"],
            ["Residential Referral Bonus", `${result.data.tier1Bonus || 0}%`, `${result.data.tier2Bonus || 0}%`, `${result.data.tier3Bonus || 0}%`],
            ["*Number of referrals required", result.data.tier1RequiredReferrals || 0, result.data.tier2RequiredReferrals || 0, result.data.tier3RequiredReferrals || 0],
          ],
        };
        setTableData(referralData);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch residential referral data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesAgentCommissionData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      // Fetch all three endpoints in parallel
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
        const salesAgentData = {
          headers: ["Party Type", "Capacity", "Amount", "Percentage", "Agreement Duration"],
          rows: [
            [
              "Per new solar owner (resi/commercial) registered", 
              `${perCustomerData.data.solarOwnerCapacity || 0}MW`, 
              `$${perCustomerData.data.solarOwnerAmount || 0}`, 
              "-",
              `${perCustomerData.data.solarOwnerAgreementDuration || 0}`
            ],
            [
              "Per new partner registered", 
              `${perCustomerData.data.partnerCapacity || 0}MW`, 
              `$${perCustomerData.data.partnerAmount || 0}`, 
              "-",
              `${perCustomerData.data.partnerAgreementDuration || 0}`
            ],
            [
              "Annual Bonus 1", 
              `${annualBonusData.data.bonus1Capacity || 0}MW`, 
              `$${annualBonusData.data.bonus1Amount || 0}`, 
              "-",
              `${annualBonusData.data.bonus1AgreementDuration || 0}`
            ],
            [
              "Annual Bonus 2", 
              `${annualBonusData.data.bonus2Capacity || 0}MW`, 
              `$${annualBonusData.data.bonus2Amount || 0}`, 
              "-",
              `${annualBonusData.data.bonus2AgreementDuration || 0}`
            ],
            [
              "Annual Bonus 3", 
              `${annualBonusData.data.bonus3Capacity || 0}MW`, 
              `$${annualBonusData.data.bonus3Amount || 0}`, 
              "-",
              `${annualBonusData.data.bonus3AgreementDuration || 0}`
            ],
            [
              "Revenue share commission per new solar owner", 
              "-", 
              "-", 
              `${revenueShareData.data.solarOwnerPercentage || 0}%`,
              `${revenueShareData.data.solarOwnerAgreementDuration || 0}`
            ],
            [
              "Revenue share commission per partner revenue", 
              "-", 
              "-", 
              `${revenueShareData.data.partnerPercentage || 0}%`,
              `${revenueShareData.data.partnerAgreementDuration || 0}`
            ],
          ],
        };
        setTableData(salesAgentData);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch sales agent commission data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (activeCommissionType === "Partner Share") {
      fetchPartnerCommissionData();
    } else if (activeCommissionType === "Customer/Solar Owner Share") {
      fetchCustomerCommissionData();
    } else if (activeCommissionType === "Residential Referral") {
      fetchResidentialReferralData();
    } else if (activeCommissionType === "Sales Agent Commission") {
      fetchSalesAgentCommissionData();
    } else {
      setTableData(STATIC_DATA[activeCommissionType] || null);
      setLoading(false);
    }
  }, [activeCommissionType]);

  const getCurrentTableData = () => {
    if (activeCommissionType === "Partner Share" || 
        activeCommissionType === "Customer/Solar Owner Share" ||
        activeCommissionType === "Residential Referral" ||
        activeCommissionType === "Sales Agent Commission") {
      return tableData;
    }
    return STATIC_DATA[activeCommissionType];
  };

  const currentData = getCurrentTableData();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  if (error && (activeCommissionType === "Partner Share" || 
                activeCommissionType === "Customer/Solar Owner Share" ||
                activeCommissionType === "Residential Referral" ||
                activeCommissionType === "Sales Agent Commission")) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500">No data available for {activeCommissionType}</div>
      </div>
    );
  }

  const { headers, rows } = currentData;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
          <h2 className="text-[#039994] font-semibold text-lg">
            {activeCommissionType}
          </h2>
          <div className="relative ml-2 inline-block">
            <FaChevronDown
              className="text-[#039994] cursor-pointer"
              size={15}
              onClick={() => {
                const dropdown = document.getElementById("commission-dropdown");
                dropdown.classList.toggle("hidden");
              }}
            />
            <div
              id="commission-dropdown"
              className="hidden absolute z-10 bg-white border border-gray-200 rounded shadow-lg mt-1 w-60"
            >
              {commissionTypes.map((type) => (
                <div
                  key={type}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    type === activeCommissionType ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onChangeCommissionType(type);
                    document.getElementById("commission-dropdown").classList.add("hidden");
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
          onClick={onSetupStructure}
        >
          <IoSettingsSharp className="mr-2" size={16} />
          Setup Structure
        </button>
      </div>

      <div className="w-full overflow-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200 ${
                    activeCommissionType === "Residential Referral" && index > 0 ? "font-bold" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`py-3 px-4 text-sm border-b border-gray-200 ${
                      cellIndex === 0 ? "font-medium" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionTable;