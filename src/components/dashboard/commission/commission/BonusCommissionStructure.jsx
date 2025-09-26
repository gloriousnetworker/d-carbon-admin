"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";

const BonusCommissionStructure = ({ onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);

  const QUARTERLY_COMMERCIAL = {
    headers: ["MW Threshold", "Bonus (%)"],
    rows: [
      ["< 1 MW", "1.0"],
      ["1 - 5 MW", "1.5"],
      ["> 5 MW", "2.0"]
    ]
  };

  const QUARTERLY_RESIDENTIAL = {
    headers: ["Referrals", "Bonus (%)"],
    rows: [
      ["5-10 referrals", "0.5"],
      ["11-20 referrals", "1.0"],
      [">20 referrals", "1.5"]
    ]
  };

  const ANNUAL_BONUS = {
    headers: ["MW Threshold", "Bonus (%)"],
    rows: [
      ["< 10 MW", "1.0"],
      ["10 - 50 MW", "1.5"],
      ["> 50 MW", "2.0"]
    ]
  };

  useEffect(() => {
    setTableData({ QUARTERLY_COMMERCIAL, QUARTERLY_RESIDENTIAL, ANNUAL_BONUS });
  }, []);

  if (!tableData) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  const renderTable = (title, data) => (
    <div className="mb-8">
      <h3 className="text-[#039994] font-medium mb-3">{title}</h3>
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

      {renderTable("Quarterly Bonus — Commercial (MW Based)", tableData.QUARTERLY_COMMERCIAL)}
      {renderTable("Bonus — Residential (Referral Based)", tableData.QUARTERLY_RESIDENTIAL)}
      {renderTable("Annual Bonus — Partners (MW Based)", tableData.ANNUAL_BONUS)}

      <div className="text-xs text-gray-500 mt-2">
        All bonuses are based on megawatts (MW) generated or number of referrals, not dollar amounts.
      </div>
    </div>
  );
};

export default BonusCommissionStructure;