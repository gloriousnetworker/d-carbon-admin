"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const CommercialCommissionStructure = ({ onSetupStructure, refreshData }) => {
  const [tableData, setTableData] = useState(null);
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
      const tierHeaders = ["Party Type"];
      
      tiers.sort((a, b) => a.order - b.order);
      
      tiers.forEach(tier => {
        tierHeaders.push(tier.label);
      });
      
      setHeaders(tierHeaders);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast.error('Failed to load tier headers', {
        position: 'top-center',
        duration: 3000,
      });
      setHeaders(["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration"]);
    }
  };

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/commercial', {
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
        
        const formatNumber = (num) => {
          if (typeof num === 'number') {
            return num % 1 === 0 ? num.toString() : num.toFixed(1).replace('.0', '');
          }
          return num || "0";
        };

        const getCellValue = (header) => {
          switch(header) {
            case "Party Type":
              return "";
            case "<500k":
            case "<$500k":
              return (partyType) => {
                switch(partyType) {
                  case "commercialWithReferral":
                    return formatNumber(partnerInstaller.customerShareLessThan500k);
                  case "installerReferral":
                    return formatNumber(partnerInstaller.partnerShareLessThan500k);
                  case "financeReferral":
                    return formatNumber(partnerFinance.partnerShareLessThan500k);
                  case "dcarbonRemainder":
                    return `${formatNumber(partnerInstaller.dcarbonRemainderLessThan500k)}:${formatNumber(partnerFinance.dcarbonRemainderLessThan500k)}`;
                  case "commercialNoReferral":
                    return formatNumber(direct.lessThan500k);
                  case "dcarbonRemainderNoReferral":
                    return formatNumber(direct.dcarbonRemainderLessThan500k);
                  default:
                    return "0";
                }
              };
            case "500k-2.5m":
            case "$500k - $2.5M":
              return (partyType) => {
                switch(partyType) {
                  case "commercialWithReferral":
                    return formatNumber(partnerInstaller.customerShareBetween500kTo2_5m);
                  case "installerReferral":
                    return formatNumber(partnerInstaller.partnerShareBetween500kTo2_5m);
                  case "financeReferral":
                    return formatNumber(partnerFinance.partnerShareBetween500kTo2_5m);
                  case "dcarbonRemainder":
                    return `${formatNumber(partnerInstaller.dcarbonRemainderBetween500kTo2_5m)}:${formatNumber(partnerFinance.dcarbonRemainderBetween500kTo2_5m)}`;
                  case "commercialNoReferral":
                    return formatNumber(direct.between500kTo2_5m);
                  case "dcarbonRemainderNoReferral":
                    return formatNumber(direct.dcarbonRemainderBetween500kTo2_5m);
                  default:
                    return "0";
                }
              };
            case ">2.5m":
            case ">$2.5M":
              return (partyType) => {
                switch(partyType) {
                  case "commercialWithReferral":
                    return formatNumber(partnerInstaller.customerShareMoreThan2_5m);
                  case "installerReferral":
                    return formatNumber(partnerInstaller.partnerShareMoreThan2_5m);
                  case "financeReferral":
                    return formatNumber(partnerFinance.partnerShareMoreThan2_5m);
                  case "dcarbonRemainder":
                    return `${formatNumber(partnerInstaller.dcarbonRemainderMoreThan2_5m)}:${formatNumber(partnerFinance.dcarbonRemainderMoreThan2_5m)}`;
                  case "commercialNoReferral":
                    return formatNumber(direct.moreThan2_5m);
                  case "dcarbonRemainderNoReferral":
                    return formatNumber(direct.dcarbonRemainderMoreThan2_5m);
                  default:
                    return "0";
                }
              };
            case "Max Duration":
              return (partyType) => {
                if (partyType === "separator") return "";
                return formatNumber(terms.maxDuration);
              };
            case "Agreement Duration":
              return (partyType) => {
                if (partyType === "separator") return "";
                return formatNumber(terms.agreementDuration);
              };
            case "Cancellation Fee":
              return (partyType) => {
                if (partyType === "commercialWithReferral" || partyType === "commercialNoReferral") {
                  return `$${formatNumber(terms.cancellationFee)}`;
                }
                if (partyType === "separator") return "";
                return "—";
              };
            default:
              return () => "";
          }
        };

        const partyTypes = [
          { type: "commercialWithReferral", label: "Commercial Facility Share with Partner Referral" },
          { type: "installerReferral", label: "When referred by Installer/EPC" },
          { type: "financeReferral", label: "When referred by Finance Company" },
          { type: "dcarbonRemainder", label: "DCarbon Remainder" },
          { type: "separator", label: "" },
          { type: "commercialNoReferral", label: "Commercial Facility Share (No Referral)" },
          { type: "dcarbonRemainderNoReferral", label: "DCarbon Remainder (No Referral)" },
        ];

        const rows = partyTypes.map(party => {
          const row = [party.label];
          for (let i = 1; i < headers.length; i++) {
            const header = headers[i];
            const valueGetter = getCellValue(header);
            if (typeof valueGetter === 'function') {
              row.push(valueGetter(party.type));
            } else {
              row.push("");
            }
          }
          return row;
        });

        setTableData({ headers, rows });
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast.error(`Failed to load commission data: ${error.message}`, {
        position: 'top-center',
        duration: 3000,
      });
      
      const defaultRows = [
        ["Commercial Facility Share with Partner Referral", "0", "0", "0", "0", "0"],
        ["When referred by Installer/EPC", "0", "0", "0", "0", "0"],
        ["When referred by Finance Company", "0", "0", "0", "0", "0"],
        ["DCarbon Remainder", "0:0", "0:0", "0:0", "0", "0"],
        ["", "", "", "", "", ""],
        ["Commercial Facility Share (No Referral)", "0", "0", "0", "0", "0"],
        ["DCarbon Remainder (No Referral)", "0", "0", "0", "0", "0"],
      ].map(row => row.slice(0, headers.length));
      
      setTableData({ headers, rows: defaultRows });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  useEffect(() => {
    if (headers.length > 1) {
      fetchCommissionData();
    }
  }, [refreshData, headers]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  if (!tableData) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-red-500">Failed to load commission data</div>
      </div>
    );
  }

  const { rows } = tableData;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">
          Commercial Commission Structure
        </h2>
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
                    {cell && cell.includes(":") ? (
                      <div className="group relative inline-block">
                        <span className="cursor-help">{cell}</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          Installer: {cell.split(':')[0]}<br/>
                          Finance: {cell.split(':')[1]}
                        </div>
                      </div>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        DCarbon remainder is variable and calculated to make total 100% for each revenue tier.
      </div>
    </div>
  );
};

export default CommercialCommissionStructure;