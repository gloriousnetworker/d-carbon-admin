"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";

const BonusCommissionStructure = ({ onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);

  const BONUS_DATA = {
    headers: ["Bonus Type", "Target", "Min", "Max", "Unit", "Bonus (%)"],
    rows: [
      ["Quarterly", "Commercial", "1", "5", "MW", "2.0"],
      ["Annually", "Partners", "10", "50", "Referral", "1.5"],
      ["Annually", "Residential", "5", "20", "MW", "1.0"]
    ]
  };

  useEffect(() => {
    setTableData(BONUS_DATA);
  }, []);

  if (!tableData) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  const renderTable = (data) => (
    <div className="mb-8">
      <div className="w-full overflow-auto rounded-lg border border-gray-200">
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
                    className="py-3 px-4 text-sm border-b border-gray-200"
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">
          Bonus Commission Structure
        </h2>
        <button
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
          onClick={onSetupStructure}
        >
          <IoSettingsSharp className="mr-2" size={16} />
          Setup Structure
        </button>
      </div>

      {renderTable(tableData)}

      <div className="text-xs text-gray-500 mt-2">
        All bonuses are based on megawatts (MW) generated or number of referrals.
      </div>
    </div>
  );
};

export default BonusCommissionStructure;