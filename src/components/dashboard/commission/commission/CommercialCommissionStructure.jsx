"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const CommercialCommissionStructure = ({ onSetupStructure }) => {
  const [tableData, setTableData] = useState(null);

  const STATIC_DATA = {
    headers: ["Party Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)", "Cancellation Fee"],
    rows: [
      ["Commercial (with Partner Referral) – Customer/Facility", "50.0", "60.0", "70.0", "15", "2", "$500"],
      ["Commercial (with Partner Referral) – Sales Agent", "2.5", "2.5", "2.5", "15", "2", "—"],
      ["Commercial (with Partner Referral) – Installer/EPC", "10.0", "10.0", "10.0", "15", "2", "—"],
      ["Commercial (with Partner Referral) – Finance Company", "10.0", "10.0", "10.0", "15", "2", "—"],
      ["Commercial (with Partner Referral) – DCarbon (Remainder)", "27.5", "17.5", "7.5", "15", "2", "—"],
      ["", "", "", "", "", "", ""],
      ["Commercial (No Referral) – Customer/Facility", "60.0", "70.0", "80.0", "15", "2", "$500"],
      ["Commercial (No Referral) – DCarbon (Remainder)", "40.0", "30.0", "20.0", "15", "2", "—"],
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
        Company share is auto-calculated as 100 − (Customer + Partner splits) for each tier.
      </div>
    </div>
  );
};

export default CommercialCommissionStructure;