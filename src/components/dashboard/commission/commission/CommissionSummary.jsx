"use client";
import React, { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "react-hot-toast";

const CommissionSummary = ({ activeSummaryType, onChangeSummaryType }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const summaryTypes = [
    "Direct Agent",
    "Agent Partner", 
    "Direct Partner",
    "Master Partner",
    "Direct Resident Owner",
    "Direct Commercial Owner"
  ];

  // Dummy data for all types except Direct Agent
  const DUMMY_DATA = {
    "Agent Partner": {
      headers: ["Stakeholder", "Annual REC Sales Tier ($)", "Share (%)", "One-Time Fees", "Cancellation Fees"],
      rows: [
        ["Customer / Facility", "<$500K", "50.0", "-", "$500 or $250"],
        ["", "$500K - $2.5M", "60.0", "-", "$500 or $250"],
        ["", ">$2.5M", "70.0", "-", "$500 or $250"],
        ["Installer", "<$500K", "30.0", "-", "-"],
        ["", "$500K - $2.5M", "24.0", "-", "-"],
        ["", ">$2.5M", "19.0", "-", "-"],
        ["Sales Agent", "All Tiers", "1.0", "$500/MW", "-"],
        ["DCarbon", "<$500K", "19.0", "-", "-"],
        ["", "$500K - $2.5M", "15.0", "-", "-"],
        ["", ">$2.5M", "10.0", "-", "-"],
      ],
    },
    "Direct Partner": {
      headers: ["Stakeholder", "Annual REC Sales Tier ($)", "Share (%)"],
      rows: [
        ["Customer / Facility", "<$500K", "50.0"],
        ["", "$500K - $2.5M", "60.0"],
        ["", ">$2.5M", "70.0"],
        ["Installer", "<$500K", "30.0"],
        ["", "$500K - $2.5M", "25.0"],
        ["", ">$2.5M", "19.0"],
        ["Sales Agent", "All Tiers", "0.0"],
        ["DCarbon", "<$500K", "20.0"],
        ["", "$500K - $2.5M", "15.0"],
        ["", ">$2.5M", "10.0"],
      ],
    },
    "Master Partner": {
      headers: ["Stakeholder", "System Capacity Tiers (MW)", "Share (%)", "Cancellation Fees"],
      rows: [
        ["Master/Super Partner", "<10.0MW", "70.0", "$250"],
        ["", "10.01 - 50MW", "75.0", "$250"],
        ["", ">50.0M", "80.0", "$250"],
        ["Resident/Operator", "<10.0MW", "0.0", "-"],
        ["", "10.01 - 50MW", "0.0", "-"],
        ["", ">50.0M", "0.0", "-"],
        ["DCarbon", "<10.0MW", "30.0", "-"],
        ["", "10.01 - 50MW", "25.0", "-"],
        ["", ">50.0M", "20.0", "-"],
      ],
    },
    "Direct Resident Owner": {
      headers: ["Stakeholder", "System Capacity Tiers (MW)", "Share (%)", "Cancellation Fees"],
      rows: [
        ["Master/Super Partner", "<10.0MW", "0.0", "$250"],
        ["", "10.01 - 50MW", "0.0", "$250"],
        ["", ">50.0M", "0.0", "$250"],
        ["Resident/Operator", "<10.0MW", "50.0", "-"],
        ["", "10.01 - 50MW", "50.0", "-"],
        ["", ">50.0M", "50.0", "-"],
        ["DCarbon", "<10.0MW", "50.0", "-"],
        ["", "10.01 - 50MW", "50.0", "-"],
        ["", ">50.0M", "50.0", "-"],
      ],
    },
    "Direct Commercial Owner": {
      headers: ["Stakeholder", "System Capacity Tiers (MW)", "Share (%)", "Cancellation Fees"],
      rows: [
        ["Master/Super Partner", "<10.0MW", "0.0", "$250"],
        ["", "10.01 - 50MW", "0.0", "$250"],
        ["", ">50.0M", "0.0", "$250"],
        ["Resident/Operator", "<10.0MW", "50.0", "-"],
        ["", "10.01 - 50MW", "60.0", "-"],
        ["", ">50.0M", "70.0", "-"],
        ["DCarbon", "<10.0MW", "50.0", "-"],
        ["", "10.01 - 50MW", "40.0", "-"],
        ["", ">50.0M", "30.0", "-"],
      ],
    },
  };

  const fetchDirectAgentData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/summary/direct-agent', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const result = await response.json();
      
      if (result.status === 'success' && result.data) {
        const { customerFacility, salesAgent, dcarbon } = result.data;
        
        const directAgentData = {
          headers: ["Stakeholder", "Annual REC Sales Tier ($)", "Share (%)", "One-Time Fees", "Cancellation Fees"],
          rows: [
            [
              "Customer / Facility", 
              "<$500K", 
              `${customerFacility.lessThan500k || 0}.0`, 
              "-", 
              `$${customerFacility.cancellationFee || 0}`
            ],
            ["", "$500K - $2.5M", `${customerFacility.between500kTo2_5m || 0}.0`, "-", `$${customerFacility.cancellationFee || 0}`],
            ["", ">$2.5M", `${customerFacility.moreThan2_5m || 0}.0`, "-", `$${customerFacility.cancellationFee || 0}`],
            ["Installer", "All Tiers", "2.5", "$1000/MW", "-"],
            ["Sales Agent", "All Tiers", `${salesAgent.allTier || 0}`, "-", "-"],
            ["DCarbon", "<$500K", `${dcarbon.lessThan500k || 0}`, "-", "-"],
            ["", "$500K - $2.5M", `${dcarbon.between500kTo2_5m || 0}`, "-", "-"],
            ["", ">$2.5M", `${dcarbon.moreThan2_5m || 0}`, "-", "-"],
          ],
        };
        setTableData(directAgentData);
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to fetch direct agent data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    if (activeSummaryType === "Direct Agent") {
      fetchDirectAgentData();
    } else {
      setTableData(DUMMY_DATA[activeSummaryType] || null);
      setLoading(false);
    }
  }, [activeSummaryType]);

  const getCurrentTableData = () => {
    if (activeSummaryType === "Direct Agent") {
      return tableData;
    }
    return DUMMY_DATA[activeSummaryType];
  };

  const currentData = getCurrentTableData();

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission summary...</div>
      </div>
    );
  }

  if (error && activeSummaryType === "Direct Agent") {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!currentData) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500">No data available for {activeSummaryType}</div>
      </div>
    );
  }

  const { headers, rows } = currentData;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
          <h2 className="text-[#039994] font-semibold text-lg">
            {activeSummaryType}
          </h2>
          <div className="relative ml-2 inline-block">
            <FaChevronDown
              className="text-[#039994] cursor-pointer"
              size={15}
              onClick={() => {
                const dropdown = document.getElementById("summary-dropdown");
                dropdown.classList.toggle("hidden");
              }}
            />
            <div
              id="summary-dropdown"
              className="hidden absolute z-10 bg-white border border-gray-200 rounded shadow-lg mt-1 w-60"
            >
              {summaryTypes.map((type) => (
                <div
                  key={type}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    type === activeSummaryType ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onChangeSummaryType(type);
                    document.getElementById("summary-dropdown").classList.add("hidden");
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, index) => (
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

export default CommissionSummary;