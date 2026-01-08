"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const ResidentialCommissionStructure = ({ onSetupStructure, refreshData }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

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

        const headers = ["Party Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"];
        
        const rows = [
          [
            "Residential Facility Share with Partner Referral", 
            formatNumber(partnerInstaller.customerShareLessThan500k), 
            formatNumber(partnerInstaller.customerShareBetween500kTo2_5m), 
            formatNumber(partnerInstaller.customerShareMoreThan2_5m), 
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            `$${formatNumber(terms.cancellationFee)}`
          ],
          [
            "When referred by Installer/EPC", 
            formatNumber(partnerInstaller.partnerShareLessThan500k), 
            formatNumber(partnerInstaller.partnerShareBetween500kTo2_5m), 
            formatNumber(partnerInstaller.partnerShareMoreThan2_5m), 
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
          [
            "When referred by Finance Company", 
            formatNumber(partnerFinance.partnerShareLessThan500k), 
            formatNumber(partnerFinance.partnerShareBetween500kTo2_5m), 
            formatNumber(partnerFinance.partnerShareMoreThan2_5m), 
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
          [
            "DCarbon Remainder", 
            `${formatNumber(partnerInstaller.dcarbonRemainderLessThan500k)}:${formatNumber(partnerFinance.dcarbonRemainderLessThan500k)}`, 
            `${formatNumber(partnerInstaller.dcarbonRemainderBetween500kTo2_5m)}:${formatNumber(partnerFinance.dcarbonRemainderBetween500kTo2_5m)}`, 
            `${formatNumber(partnerInstaller.dcarbonRemainderMoreThan2_5m)}:${formatNumber(partnerFinance.dcarbonRemainderMoreThan2_5m)}`, 
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            "—"
          ],
          ["", "", "", "", "", "", ""],
          [
            "Residential Facility Share (No Referral)", 
            formatNumber(direct.lessThan500k), 
            formatNumber(direct.between500kTo2_5m), 
            formatNumber(direct.moreThan2_5m), 
            formatNumber(terms.maxDuration), 
            formatNumber(terms.agreementDuration), 
            `$${formatNumber(terms.cancellationFee)}`
          ],
          [
            "DCarbon Remainder (No Referral)", 
            formatNumber(direct.dcarbonRemainderLessThan500k), 
            formatNumber(direct.dcarbonRemainderBetween500kTo2_5m), 
            formatNumber(direct.dcarbonRemainderMoreThan2_5m), 
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
      
      const defaultHeaders = ["Party Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"];
      const defaultRows = [
        ["Residential Facility Share with Partner Referral", "0", "0", "0", "0", "0", "$0"],
        ["When referred by Installer/EPC", "0", "0", "0", "0", "0", "—"],
        ["When referred by Finance Company", "0", "0", "0", "0", "0", "—"],
        ["DCarbon Remainder", "0:0", "0:0", "0:0", "0", "0", "—"],
        ["", "", "", "", "", "", ""],
        ["Residential Facility Share (No Referral)", "0", "0", "0", "0", "0", "$0"],
        ["DCarbon Remainder (No Referral)", "0", "0", "0", "0", "0", "—"],
      ];
      setTableData({ headers: defaultHeaders, rows: defaultRows });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionData();
  }, [refreshData]);

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
                    onMouseEnter={() => cell.includes(":") && setHoveredCell(`${rowIndex}-${cellIndex}`)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {cell.includes(":") ? (
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