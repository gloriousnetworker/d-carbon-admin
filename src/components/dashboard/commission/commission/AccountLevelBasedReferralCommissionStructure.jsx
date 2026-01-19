"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const AccountLevelBasedCommissionStructure = ({ onSetupStructure, refreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState("sales-agent");
  const [salesAgentData, setSalesAgentData] = useState(null);
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
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent-account-level', {
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
        setSalesAgentData({
          commercialUnder500k: 2.0,
          commercial500kTo2_5m: 2.5,
          commercialOver2_5m: 3.0,
          commercialAnnualCap: 50000,
          residentialUnder500k: 1.5,
          residential500kTo2_5m: 2.0,
          residentialOver2_5m: 2.5,
          residentialAnnualCap: 25000
        });
      }
    } catch (error) {
      console.error('Error fetching sales agent data:', error);
      setSalesAgentData({
        commercialUnder500k: 2.0,
        commercial500kTo2_5m: 2.5,
        commercialOver2_5m: 3.0,
        commercialAnnualCap: 50000,
        residentialUnder500k: 1.5,
        residential500kTo2_5m: 2.0,
        residentialOver2_5m: 2.5,
        residentialAnnualCap: 25000
      });
    }
  };

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      await fetchSalesAgentData();
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
    const tableHeaders = ["Referrer Type"];
    
    const filteredTierHeaders = headers.filter(header => 
      !["Max Duration", "Agreement Duration", "Cancellation Fee"].includes(header)
    );
    
    tableHeaders.push(...filteredTierHeaders.map(header => 
      header.includes("k") || header.includes("m") ? `${header} (%)` : header
    ));
    
    tableHeaders.push("Annual Cap ($)");

    const formatValue = (value) => {
      if (typeof value === 'number') {
        return value % 1 === 0 ? value.toString() : value.toFixed(1);
      }
      return value || "0.0";
    };

    const getCommercialValue = (tierLabel) => {
      if (!salesAgentData) return "0.0";
      
      switch(tierLabel) {
        case "<500k":
        case "<$500k":
          return formatValue(salesAgentData.commercialUnder500k);
        case "500k-2.5m":
        case "$500k - $2.5M":
          return formatValue(salesAgentData.commercial500kTo2_5m);
        case ">2.5m":
        case ">$2.5M":
          return formatValue(salesAgentData.commercialOver2_5m);
        default:
          return "0.0";
      }
    };

    const getResidentialValue = (tierLabel) => {
      if (!salesAgentData) return "0.0";
      
      switch(tierLabel) {
        case "<500k":
        case "<$500k":
          return formatValue(salesAgentData.residentialUnder500k);
        case "500k-2.5m":
        case "$500k - $2.5M":
          return formatValue(salesAgentData.residential500kTo2_5m);
        case ">2.5m":
        case ">$2.5M":
          return formatValue(salesAgentData.residentialOver2_5m);
        default:
          return "0.0";
      }
    };

    const commercialValues = filteredTierHeaders.map(tier => getCommercialValue(tier));
    const residentialValues = filteredTierHeaders.map(tier => getResidentialValue(tier));

    const commercialAnnualCap = salesAgentData ? `$${salesAgentData.commercialAnnualCap.toLocaleString()}` : "$0";
    const residentialAnnualCap = salesAgentData ? `$${salesAgentData.residentialAnnualCap.toLocaleString()}` : "$0";

    return {
      headers: tableHeaders,
      rows: [
        ["Sales Agent → Commercial", ...commercialValues, commercialAnnualCap],
        ["Sales Agent → Residential", ...residentialValues, residentialAnnualCap],
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
          Account Level Based Commission Structure
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
              activeSubTab === "sales-agent"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("sales-agent")}
          >
            Sales Agent Referrals
          </button>
        </div>
      </div>

      {activeSubTab === "sales-agent" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Sales Agent Referrals</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission structure for sales agents who refer commercial or residential accounts.
          </p>
          {renderTable(getSalesAgentTableData())}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Account-level commissions are calculated based on the total decarbon remainder from all facilities under a customer account.
      </div>
    </div>
  );
};

export default AccountLevelBasedCommissionStructure;