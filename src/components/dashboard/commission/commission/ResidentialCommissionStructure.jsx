"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const ResidentialCommissionStructure = ({ onSetupStructure, refreshData }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);
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
        
        const formatNumber = (num) => {
          if (typeof num === 'number') {
            return num % 1 === 0 ? num.toString() : num.toFixed(1).replace('.0', '');
          }
          return num || "0";
        };

        const headers = ["Party Type", ...tiers.map(tier => tier.label.includes("k") || tier.label.includes("m") ? `${tier.label} (%)` : tier.label), "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"];
        
        const getTierValue = (tierLabel, type, subtype = null) => {
          if (!tierLabel) return "0";
          
          const tierKey = tierLabel.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace('500k', '500k')
            .replace('2_5m', '2_5m')
            .replace('2.5m', '2_5m')
            .replace('25m', '2_5m');

          switch(type) {
            case 'customerShare':
              switch(tierKey) {
                case '500k':
                case 'lessthan500k':
                  return formatNumber(partnerInstaller.customerShareLessThan500k);
                case '500kto25m':
                case '500kto2_5m':
                case 'between500kto2_5m':
                  return formatNumber(partnerInstaller.customerShareBetween500kTo2_5m);
                case 'greaterthan25m':
                case 'morethan2_5m':
                  return formatNumber(partnerInstaller.customerShareMoreThan2_5m);
                default:
                  return "0";
              }
            case 'partnerShare':
              if (subtype === 'installer') {
                switch(tierKey) {
                  case '500k':
                  case 'lessthan500k':
                    return formatNumber(partnerInstaller.partnerShareLessThan500k);
                  case '500kto25m':
                  case '500kto2_5m':
                  case 'between500kto2_5m':
                    return formatNumber(partnerInstaller.partnerShareBetween500kTo2_5m);
                  case 'greaterthan25m':
                  case 'morethan2_5m':
                    return formatNumber(partnerInstaller.partnerShareMoreThan2_5m);
                  default:
                    return "0";
                }
              } else if (subtype === 'finance') {
                switch(tierKey) {
                  case '500k':
                  case 'lessthan500k':
                    return formatNumber(partnerFinance.partnerShareLessThan500k);
                  case '500kto25m':
                  case '500kto2_5m':
                  case 'between500kto2_5m':
                    return formatNumber(partnerFinance.partnerShareBetween500kTo2_5m);
                  case 'greaterthan25m':
                  case 'morethan2_5m':
                    return formatNumber(partnerFinance.partnerShareMoreThan2_5m);
                  default:
                    return "0";
                }
              }
              return "0";
            case 'dcarbonRemainder':
              if (subtype === 'installer') {
                switch(tierKey) {
                  case '500k':
                  case 'lessthan500k':
                    return formatNumber(partnerInstaller.dcarbonRemainderLessThan500k);
                  case '500kto25m':
                  case '500kto2_5m':
                  case 'between500kto2_5m':
                    return formatNumber(partnerInstaller.dcarbonRemainderBetween500kTo2_5m);
                  case 'greaterthan25m':
                  case 'morethan2_5m':
                    return formatNumber(partnerInstaller.dcarbonRemainderMoreThan2_5m);
                  default:
                    return "0";
                }
              } else if (subtype === 'finance') {
                switch(tierKey) {
                  case '500k':
                  case 'lessthan500k':
                    return formatNumber(partnerFinance.dcarbonRemainderLessThan500k);
                  case '500kto25m':
                  case '500kto2_5m':
                  case 'between500kto2_5m':
                    return formatNumber(partnerFinance.dcarbonRemainderBetween500kTo2_5m);
                  case 'greaterthan25m':
                  case 'morethan2_5m':
                    return formatNumber(partnerFinance.dcarbonRemainderMoreThan2_5m);
                  default:
                    return "0";
                }
              }
              return "0";
            case 'directShare':
              switch(tierKey) {
                case '500k':
                case 'lessthan500k':
                  return formatNumber(direct.lessThan500k);
                case '500kto25m':
                case '500kto2_5m':
                case 'between500kto2_5m':
                  return formatNumber(direct.between500kTo2_5m);
                case 'greaterthan25m':
                case 'morethan2_5m':
                  return formatNumber(direct.moreThan2_5m);
                default:
                  return "0";
              }
            case 'directRemainder':
              switch(tierKey) {
                case '500k':
                case 'lessthan500k':
                  return formatNumber(direct.dcarbonRemainderLessThan500k);
                case '500kto25m':
                case '500kto2_5m':
                case 'between500kto2_5m':
                  return formatNumber(direct.dcarbonRemainderBetween500kTo2_5m);
                case 'greaterthan25m':
                case 'morethan2_5m':
                  return formatNumber(direct.dcarbonRemainderMoreThan2_5m);
                default:
                  return "0";
              }
            default:
              return "0";
          }
        };

        const tierValues = tiers.map(tier => getTierValue(tier.label, 'customerShare'));
        const installerPartnerValues = tiers.map(tier => getTierValue(tier.label, 'partnerShare', 'installer'));
        const financePartnerValues = tiers.map(tier => getTierValue(tier.label, 'partnerShare', 'finance'));
        const installerRemainderValues = tiers.map(tier => getTierValue(tier.label, 'dcarbonRemainder', 'installer'));
        const financeRemainderValues = tiers.map(tier => getTierValue(tier.label, 'dcarbonRemainder', 'finance'));
        const directShareValues = tiers.map(tier => getTierValue(tier.label, 'directShare'));
        const directRemainderValues = tiers.map(tier => getTierValue(tier.label, 'directRemainder'));

        const rows = [
          [
            "Residential Facility Share with Partner Referral", 
            ...tierValues,
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            `$${formatNumber(terms.cancellationFee)}`
          ],
          [
            "When referred by Installer/EPC", 
            ...installerPartnerValues,
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
          [
            "When referred by Finance Company", 
            ...financePartnerValues,
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
          [
            "DCarbon Remainder", 
            ...installerRemainderValues.map((val, idx) => `${val}:${financeRemainderValues[idx]}`),
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
          ["", ...Array(tiers.length + 3).fill("")],
          [
            "Residential Facility Share (No Referral)", 
            ...directShareValues,
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            `$${formatNumber(terms.cancellationFee)}`
          ],
          [
            "DCarbon Remainder (No Referral)", 
            ...directRemainderValues,
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
        ];

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
      
      const defaultHeaders = ["Party Type", ...tiers.map(tier => tier.label.includes("k") || tier.label.includes("m") ? `${tier.label} (%)` : tier.label), "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"];
      
      const defaultRows = [
        ["Residential Facility Share with Partner Referral", ...Array(tiers.length).fill("0"), "0", "0", "$0"],
        ["When referred by Installer/EPC", ...Array(tiers.length).fill("0"), "0", "0", "—"],
        ["When referred by Finance Company", ...Array(tiers.length).fill("0"), "0", "0", "—"],
        ["DCarbon Remainder", ...Array(tiers.length).fill("0:0"), "0", "0", "—"],
        ["", ...Array(tiers.length + 3).fill("")],
        ["Residential Facility Share (No Referral)", ...Array(tiers.length).fill("0"), "0", "0", "$0"],
        ["DCarbon Remainder (No Referral)", ...Array(tiers.length).fill("0"), "0", "0", "—"],
      ];
      setTableData({ headers: defaultHeaders, rows: defaultRows });
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

  const { headers, rows } = tableData;

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">
          Residential Commission Structure
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
                    onMouseEnter={() => cell && cell.includes(":") && setHoveredCell(`${rowIndex}-${cellIndex}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {cell && cell.includes(":") ? (
                      <div className="relative inline-block">
                        <span className="cursor-help">{cell}</span>
                        {hoveredCell === `${rowIndex}-${cellIndex}` && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                            Installer: {cell.split(':')[0]}<br/>
                            Finance: {cell.split(':')[1]}
                          </div>
                        )}
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

export default ResidentialCommissionStructure;