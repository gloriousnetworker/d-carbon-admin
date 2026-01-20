"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const PartnerCommissionStructure = ({ onSetupStructure, refreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState("salesAgentUpline");
  const [salesAgentData, setSalesAgentData] = useState(null);
  const [epcAssistedData, setEpcAssistedData] = useState(null);
  const [commercialData, setCommercialData] = useState(null);
  const [residentialData, setResidentialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState([]);

  const fetchTiers = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-tier', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tiers');
      }

      const result = await response.json();
      
      const revenueTiers = result.filter(tier => 
        !["Max Duration", "Agreement Duration", "Cancellation Fee"].includes(tier.label)
      ).sort((a, b) => a.order - b.order);
      
      setTiers(revenueTiers);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setTiers([
        { label: "<$500k (%)" },
        { label: "$500k - $2.5M (%)" },
        { label: ">$2.5M (%)" }
      ]);
    }
  };

  const fetchSalesAgentData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent-referral', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sales agent data');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesAgentData(result.data);
      } else {
        throw new Error('Failed to fetch sales agent data');
      }
    } catch (error) {
      console.error('Error fetching sales agent data:', error);
    }
  };

  const fetchEpcAssistedData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/epc-assisted', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch EPC assisted data');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setEpcAssistedData(result.data);
      } else {
        throw new Error('Failed to fetch EPC assisted data');
      }
    } catch (error) {
      console.error('Error fetching EPC assisted data:', error);
    }
  };

  const fetchCommercialData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/commercial', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setCommercialData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching commercial data:', error);
    }
  };

  const fetchResidentialData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setResidentialData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching residential data:', error);
    }
  };

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSalesAgentData(),
        fetchEpcAssistedData(),
        fetchCommercialData(),
        fetchResidentialData()
      ]);
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
    fetchTiers();
  }, []);

  useEffect(() => {
    if (tiers.length > 0) {
      fetchCommissionData();
    }
  }, [refreshData, tiers]);

  const getSalesAgentTableData = () => {
    const salesAgentHeaders = ["Relationship Type", ...tiers.map(tier => tier.label.includes("k") || tier.label.includes("m") ? `${tier.label} (%)` : tier.label), "Annual Cap"];

    if (!salesAgentData) {
      const defaultRows = [
        ["Sales Agent → Sales Agent", ...Array(tiers.length).fill("0.0"), "$0"],
        ["Sales Agent → Installer/EPC", ...Array(tiers.length).fill("0.0"), "$0"],
        ["Sales Agent → Finance Company", ...Array(tiers.length).fill("0.0"), "$0"],
      ];

      return {
        headers: salesAgentHeaders,
        rows: defaultRows,
      };
    }

    const formatNumber = (num) => {
      if (typeof num === 'number') {
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
      }
      return num || "0.0";
    };

    const getTierValue = (tierLabel, dataType) => {
      if (!tierLabel) return "0.0";
      
      const tierKey = tierLabel.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace('500k', '500k')
        .replace('2_5m', '2_5m')
        .replace('2.5m', '2_5m')
        .replace('25m', '2_5m');

      switch(dataType) {
        case 'salesAgent':
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(salesAgentData.salesAgentUnder500k);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(salesAgentData.salesAgent500kTo2_5m);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(salesAgentData.salesAgentOver2_5m);
            default:
              return "0.0";
          }
        case 'installer':
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(salesAgentData.installerUnder500k);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(salesAgentData.installer500kTo2_5m);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(salesAgentData.installerOver2_5m);
            default:
              return "0.0";
          }
        case 'finance':
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(salesAgentData.financeUnder500k);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(salesAgentData.finance500kTo2_5m);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(salesAgentData.financeOver2_5m);
            default:
              return "0.0";
          }
        default:
          return "0.0";
      }
    };

    const salesAgentValues = tiers.map(tier => getTierValue(tier.label, 'salesAgent'));
    const installerValues = tiers.map(tier => getTierValue(tier.label, 'installer'));
    const financeValues = tiers.map(tier => getTierValue(tier.label, 'finance'));

    return {
      headers: salesAgentHeaders,
      rows: [
        ["Sales Agent → Sales Agent", ...salesAgentValues, `$${salesAgentData.salesAgentAnnualCap.toLocaleString()}`],
        ["Sales Agent → Installer/EPC", ...installerValues, `$${salesAgentData.installerAnnualCap.toLocaleString()}`],
        ["Sales Agent → Finance Company", ...financeValues, `$${salesAgentData.financeAnnualCap.toLocaleString()}`],
      ],
    };
  };

  const getEpcAssistedTableData = () => {
    const epcHeaders = ["Stakeholder", ...tiers.map(tier => tier.label.includes("k") || tier.label.includes("m") ? `${tier.label} (%)` : tier.label), "Max Duration (Years)", "Agreement Duration (Years)"];

    if (!epcAssistedData || !commercialData || !residentialData) {
      const defaultRows = [
        ["Finance Company (Commercial)", ...Array(tiers.length).fill("0.0"), "0", "0"],
        ["Installer/EPC (Commercial)", ...Array(tiers.length).fill("0.0"), "0", "0"],
        ["", ...Array(tiers.length + 2).fill("")],
        ["Finance Company (Residential)", ...Array(tiers.length).fill("0.0"), "0", "0"],
        ["Installer/EPC (Residential)", ...Array(tiers.length).fill("0.0"), "0", "0"],
      ];

      return {
        headers: epcHeaders,
        rows: defaultRows,
      };
    }

    const formatNumber = (num) => {
      if (typeof num === 'number') {
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
      }
      return num || "0.0";
    };

    const getEpcTierValue = (tierLabel, stakeholder, sector = "commercial") => {
      if (!tierLabel) return "0.0";
      
      const tierKey = tierLabel.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace('500k', '500k')
        .replace('2_5m', '2_5m')
        .replace('2.5m', '2_5m')
        .replace('25m', '2_5m');

      if (stakeholder === 'finance') {
        if (sector === 'commercial') {
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(epcAssistedData.financeShareLessThan500k || 0);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(epcAssistedData.financeShare500kTo2_5m || 0);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(epcAssistedData.financeShareMoreThan2_5m || 0);
            default:
              return "0.0";
          }
        } else {
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(epcAssistedData.residentialFinanceShareLessThan500k || 0);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(epcAssistedData.residentialFinanceShare500kTo2_5m || 0);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(epcAssistedData.residentialFinanceShareMoreThan2_5m || 0);
            default:
              return "0.0";
          }
        }
      } else {
        if (sector === 'commercial') {
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(epcAssistedData.installerShareLessThan500k || 0);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(epcAssistedData.installerShare500kTo2_5m || 0);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(epcAssistedData.installerShareMoreThan2_5m || 0);
            default:
              return "0.0";
          }
        } else {
          switch(tierKey) {
            case '500k':
            case 'lessthan500k':
              return formatNumber(epcAssistedData.residentialInstallerShareLessThan500k || 0);
            case '500kto25m':
            case '500kto2_5m':
            case 'between500kto2_5m':
              return formatNumber(epcAssistedData.residentialInstallerShare500kTo2_5m || 0);
            case 'greaterthan25m':
            case 'morethan2_5m':
              return formatNumber(epcAssistedData.residentialInstallerShareMoreThan2_5m || 0);
            default:
              return "0.0";
          }
        }
      }
    };

    const commercialFinanceValues = tiers.map(tier => getEpcTierValue(tier.label, 'finance', 'commercial'));
    const commercialInstallerValues = tiers.map(tier => getEpcTierValue(tier.label, 'installer', 'commercial'));
    const residentialFinanceValues = tiers.map(tier => getEpcTierValue(tier.label, 'finance', 'residential'));
    const residentialInstallerValues = tiers.map(tier => getEpcTierValue(tier.label, 'installer', 'residential'));

    return {
      headers: epcHeaders,
      rows: [
        ["Finance Company (Commercial)", ...commercialFinanceValues, formatNumber(epcAssistedData.maxDuration), formatNumber(epcAssistedData.agreementDuration)],
        ["Installer/EPC (Commercial)", ...commercialInstallerValues, formatNumber(epcAssistedData.maxDuration), formatNumber(epcAssistedData.agreementDuration)],
        ["", ...Array(tiers.length + 2).fill("")],
        ["Finance Company (Residential)", ...residentialFinanceValues, formatNumber(epcAssistedData.maxDuration), formatNumber(epcAssistedData.agreementDuration)],
        ["Installer/EPC (Residential)", ...residentialInstallerValues, formatNumber(epcAssistedData.maxDuration), formatNumber(epcAssistedData.agreementDuration)],
      ],
    };
  };

  const renderTable = (data) => (
    <div className="w-full overflow-auto rounded-lg border border-gray-200 mt-4">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            {data.headers.map((header, index) => (
              <th
                key={index}
                className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIndex) => (
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
  );

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">
          Partner Commission Structure
        </h2>
        <button
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
          onClick={onSetupStructure}
        >
          <IoSettingsSharp className="mr-2" size={16} />
          Setup Structure
        </button>
      </div>

      <div className="border-b border-gray-200 mb-4">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "salesAgentUpline"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("salesAgentUpline")}
          >
            Sales-Agent Upline
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "epcAssisted"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("epcAssisted")}
          >
            EPC-Assisted
          </button>
        </div>
      </div>

      {activeSubTab === "salesAgentUpline" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Sales-Agent Upline Commission</h3>
          <p className="text-xs text-gray-500 mb-4">
            Upline % is paid from Company share, not deducted from end-customer share.
          </p>
          {renderTable(getSalesAgentTableData())}
        </div>
      )}

      {activeSubTab === "epcAssisted" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">EPC-Assisted Commission</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission splits are automatically calculated based on Commercial and Residential commission structures.
            Finance Company receives 60% and Installer/EPC receives 40% of the partner referral commission.
          </p>
          {renderTable(getEpcAssistedTableData())}
        </div>
      )}
    </div>
  );
};

export default PartnerCommissionStructure;