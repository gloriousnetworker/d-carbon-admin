"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";

const SalesAgentCommissionStructure = ({ onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);

  const STATIC_DATA = {
    headers: ["Referrer Type", "Commission Rate (%)", "Annual Cap ($)", "Calculation Method"],
    rows: [
      ["Sales Agent", "2.0", "50,000", "Account Level"],
      ["Commercial User", "5.0", "100,000", "Account Level"],
      ["Residential User", "3.0", "25,000", "Account Level"],
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
          Sales Agent Commission Structure
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
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Account-level commissions are calculated based on the total decarbon remainder from all facilities under a customer account.
      </div>
    </div>
  );
};

export default SalesAgentCommissionStructure;