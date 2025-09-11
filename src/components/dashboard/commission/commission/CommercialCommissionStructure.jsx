"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const CommercialCommissionStructure = ({ onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);

  const STATIC_DATA = {
    headers: ["Scenario", "Customer Referrer (%)", "Installer/EPC (%)", "Finance Company (%)", "DCarbon Remainder (%)", "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"],
    rows: [
      ["Customer Referred by Partner", "—", "—", "—", "—", "—", "—", "—"],
      ["• Customer only", "10.0", "—", "—", "90.0", "15", "2", "$500"],
      ["• Installer/EPC only", "—", "10.0", "—", "90.0", "15", "2", "$500"],
      ["• Finance Company only", "—", "—", "10.0", "90.0", "15", "2", "$500"],
      ["• Customer + Installer/EPC", "10.0", "10.0", "—", "80.0", "15", "2", "$500"],
      ["• Customer + Finance Company", "10.0", "—", "10.0", "80.0", "15", "2", "$500"],
      ["• Installer/EPC + Finance Company", "—", "10.0", "10.0", "80.0", "15", "2", "$500"],
      ["• All Three Partners", "10.0", "10.0", "10.0", "70.0", "15", "2", "$500"],
      ["", "", "", "", "", "", "", ""],
      ["No Referral (Direct)", "—", "—", "—", "—", "—", "—", "—"],
      ["• Customer Direct Registration", "0.0", "—", "—", "100.0", "15", "2", "$500"],
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

      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h3 className="font-medium text-[#039994] mb-2">Commission Structure Explanation</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Partner Referral Scenarios:</strong> When customers are referred by partners, commissions are shared based on who is involved in the submission process.</p>
          <p><strong>Direct Registration:</strong> When commercial users register directly without any referral, DCarbon retains 100% of the revenue.</p>
          <p><strong>DCarbon Remainder:</strong> Automatically calculated as (100% - total partner commissions) to ensure total equals 100%.</p>
        </div>
      </div>

      <div className="w-full overflow-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200 min-w-[120px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const isHeaderRow = row[0].includes("Customer Referred by Partner") || row[0].includes("No Referral (Direct)");
              const isEmptyRow = row[0] === "";
              
              return (
                <tr 
                  key={rowIndex} 
                  className={
                    isHeaderRow 
                      ? "bg-[#039994] text-white" 
                      : isEmptyRow 
                      ? "bg-white" 
                      : rowIndex % 2 === 0 
                      ? "bg-white hover:bg-gray-50" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`py-3 px-4 text-sm border-b border-gray-200 ${
                        cellIndex === 0 ? "font-medium" : ""
                      } ${isHeaderRow ? "text-white font-semibold" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <p>• All commission percentages are fixed across revenue tiers for simplicity.</p>
        <p>• DCarbon remainder is automatically calculated to ensure total equals 100%.</p>
        <p>• Partner combinations determine final commission distribution.</p>
      </div>
    </div>
  );
};

export default CommercialCommissionStructure;