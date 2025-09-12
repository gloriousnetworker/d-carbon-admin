"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const ResidentialCommissionStructure = ({ onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);

  const STATIC_DATA = {
    headers: ["Party Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"],
    rows: [
      ["Residential Facility Share with Partner Referral", "50.0", "50.0", "50.0", "15", "2", "$250"],
      ["When referred by Installer/EPC", "5.0", "5.0", "5.0", "15", "2", "—"],
      ["When referred by Finance Company", "5.0", "5.0", "5.0", "15", "2", "—"],
      ["DCarbon Remainder", "45:45", "45:45", "45:45", "15", "2", "—"],
      ["", "", "", "", "", "", ""],
      ["Residential Facility Share (No Referral)", "55.0", "55.0", "55.0", "15", "2", "$250"],
      ["DCarbon Remainder (No Referral)", "45.0", "45.0", "45.0", "15", "2", "—"],
    ],
  };

  useEffect(() => {
    setTableData(STATIC_DATA);
  }, []);

  if (!tableData) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  const { headers, rows } = tableData;

  return (
    <div className="w-full">
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
                  >
                    {cell.includes(":") ? (
                      <div className="group relative inline-block">
                        <span className="cursor-help">{cell}</span>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          Installer: 100 - 50 - 5 = 45<br/>
                          Finance: 100 - 50 - 5 = 45
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

export default ResidentialCommissionStructure;