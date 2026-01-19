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
  const [headers, setHeaders] = useState([]);

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

      const tiers = await response.json();
      const tierHeaders = [];
      
      tiers.sort((a, b) => a.order - b.order);
      
      tiers.forEach(tier => {
        tierHeaders.push(tier.label);
      });
      
      setHeaders(tierHeaders);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      setHeaders(["<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration"]);
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
    if (headers.length > 0) {
      fetchCommissionData();
    }
  }, [refreshData, headers]);

  const getSalesAgentTableData = () => {
    const salesAgentHeaders = ["Relationship Type"];
    
    const filteredTierHeaders = headers.filter(header => 
      !["Max Duration", "Agreement Duration", "Cancellation Fee"].includes(header)
    );
    
    salesAgentHeaders.push(...filteredTierHeaders.map(header => 
      header.includes("k") || header.includes("m") ? `${header} (%)` : header
    ));
    
    salesAgentHeaders.push("Annual Cap");

    if (!salesAgentData) {
      const defaultRows = filteredTierHeaders.length === 3 ? [
        ["Sales Agent → Sales Agent", "0.0", "0.0", "0.0", "$0"],
        ["Sales Agent → Installer/EPC", "0.0", "0.0", "0.0", "$0"],
        ["Sales Agent → Finance Company", "0.0", "0.0", "0.0", "$0"],
      ] : filteredTierHeaders.map(() => "0.0");

      return {
        headers: salesAgentHeaders,
        rows: defaultRows
      };
    }

    const formatValue = (value) => {
      if (typeof value === 'number') {
        return value % 1 === 0 ? value.toString() : value.toFixed(1);
      }
      return value || "0.0";
    };

    const getSalesAgentValue = (tierLabel) => {
      switch(tierLabel) {
        case "<500k":
        case "<$500k":
          return formatValue(salesAgentData.salesAgentUnder500k);
        case "500k-2.5m":
        case "$500k - $2.5M":
          return formatValue(salesAgentData.salesAgent500kTo2_5m);
        case ">2.5m":
        case ">$2.5M":
          return formatValue(salesAgentData.salesAgentOver2_5m);
        default:
          return "0.0";
      }
    };

    const getInstallerValue = (tierLabel) => {
      switch(tierLabel) {
        case "<500k":
        case "<$500k":
          return formatValue(salesAgentData.installerUnder500k);
        case "500k-2.5m":
        case "$500k - $2.5M":
          return formatValue(salesAgentData.installer500kTo2_5m);
        case ">2.5m":
        case ">$2.5M":
          return formatValue(salesAgentData.installerOver2_5m);
        default:
          return "0.0";
      }
    };

    const getFinanceValue = (tierLabel) => {
      switch(tierLabel) {
        case "<500k":
        case "<$500k":
          return formatValue(salesAgentData.financeUnder500k);
        case "500k-2.5m":
        case "$500k - $2.5M":
          return formatValue(salesAgentData.finance500kTo2_5m);
        case ">2.5m":
        case ">$2.5M":
          return formatValue(salesAgentData.financeOver2_5m);
        default:
          return "0.0";
      }
    };

    const salesAgentValues = filteredTierHeaders.map(tier => getSalesAgentValue(tier));
    const installerValues = filteredTierHeaders.map(tier => getInstallerValue(tier));
    const financeValues = filteredTierHeaders.map(tier => getFinanceValue(tier));

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
    const epcHeaders = ["Stakeholder"];
    
    headers.forEach(header => {
      if (header !== "Cancellation Fee") {
        epcHeaders.push(header.includes("k") || header.includes("m") ? `${header} (%)` : header);
      }
    });

    if (!epcAssistedData || !commercialData || !residentialData) {
      const rowLength = epcHeaders.length;
      const emptyRow = Array(rowLength - 1).fill("0.0");
      
      return {
        headers: epcHeaders,
        rows: [
          ["Finance Company (Commercial)", ...emptyRow],
          ["Installer/EPC (Commercial)", ...emptyRow],
          ["", ...Array(rowLength - 1).fill("")],
          ["Finance Company (Residential)", ...emptyRow],
          ["Installer/EPC (Residential)", ...emptyRow],
        ],
      };
    }

    const getEpcValue = (type, header, sector = "commercial") => {
      const formatNumber = (num) => {
        if (typeof num === 'number') {
          return num % 1 === 0 ? num.toString() : num.toFixed(1);
        }
        return num || "0.0";
      };

      if (header === "Max Duration") {
        return formatNumber(epcAssistedData.maxDuration);
      }
      
      if (header === "Agreement Duration") {
        return formatNumber(epcAssistedData.agreementDuration);
      }

      if (header === "Cancellation Fee") {
        return "—";
      }

      if (header.includes("500k") || header.includes("k") || header.includes("m")) {
        const baseValue = sector === "commercial" 
          ? commercialData[type === "finance" ? "partnerFinance" : "partnerInstaller"]
          : residentialData[type === "finance" ? "partnerFinance" : "partnerInstaller"];

        let commissionValue;
        switch(header) {
          case "<500k":
          case "<$500k":
            commissionValue = baseValue[`partnerShareLessThan500k`];
            break;
          case "500k-2.5m":
          case "$500k - $2.5M":
            commissionValue = baseValue[`partnerShareBetween500kTo2_5m`];
            break;
          case ">2.5m":
          case ">$2.5M":
            commissionValue = baseValue[`partnerShareMoreThan2_5m`];
            break;
          default:
            commissionValue = 0;
        }

        const epcValue = type === "finance" 
          ? epcAssistedData[`${sector === "residential" ? "residential" : ""}financeShare${header.replace(/[^a-zA-Z0-9]/g, '')}`] || 
            commissionValue * (type === "finance" ? 0.6 : 0.4)
          : epcAssistedData[`${sector === "residential" ? "residential" : ""}installerShare${header.replace(/[^a-zA-Z0-9]/g, '')}`] || 
            commissionValue * (type === "finance" ? 0.6 : 0.4);

        return formatNumber(epcValue);
      }

      return "0.0";
    };

    const commercialFinanceValues = headers
      .filter(header => header !== "Cancellation Fee")
      .map(header => getEpcValue("finance", header, "commercial"));
    
    const commercialInstallerValues = headers
      .filter(header => header !== "Cancellation Fee")
      .map(header => getEpcValue("installer", header, "commercial"));
    
    const residentialFinanceValues = headers
      .filter(header => header !== "Cancellation Fee")
      .map(header => getEpcValue("finance", header, "residential"));
    
    const residentialInstallerValues = headers
      .filter(header => header !== "Cancellation Fee")
      .map(header => getEpcValue("installer", header, "residential"));

    return {
      headers: epcHeaders,
      rows: [
        ["Finance Company (Commercial)", ...commercialFinanceValues],
        ["Installer/EPC (Commercial)", ...commercialInstallerValues],
        ["", ...Array(epcHeaders.length - 1).fill("")],
        ["Finance Company (Residential)", ...residentialFinanceValues],
        ["Installer/EPC (Residential)", ...residentialInstallerValues],
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