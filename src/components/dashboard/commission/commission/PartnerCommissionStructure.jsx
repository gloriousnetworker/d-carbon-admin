"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";

const PartnerCommissionStructure = ({ onSetupStructure }) => {
  const [activeSubTab, setActiveSubTab] = useState("salesAgentUpline");
  
  const SALES_AGENT_DATA = {
    headers: ["Relationship Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap"],
    rows: [
      ["Sales Agent → Sales Agent", "0.5", "0.5", "0.75", "$25,000"],
      ["Sales Agent → Installer/EPC", "1.0", "1.0", "1.0", "$50,000"],
      ["Sales Agent → Finance Company", "1.0", "1.0", "1.0", "$50,000"],
    ],
  };

  const EPC_ASSISTED_DATA = {
    headers: ["Stakeholder", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)"],
    rows: [
      ["Finance Company", "60.0", "50.0", "45.5", "15", "2"],
      ["Installer / EPC", "40.0", "50.0", "55.0", "15", "2"],
    ],
  };

  const renderTable = (data, showTotal = false) => (
    <div className="w-full overflow-auto rounded-lg border border-gray-200 mt-4">
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
  );

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">
          Partner Commission Structure
        </h2>
        <button
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
          onClick={onSetupStructure}
        >
          <IoSettingsSharp className="mr-2" size={16} />
          Setup Structure
        </button>
      </div>

      <div className="border-b border-gray-200 mb-4">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "salesAgentUpline"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("salesAgentUpline")}
          >
            Sales-Agent Upline
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "epcAssisted"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("epcAssisted")}
          >
            EPC-Assisted
          </button>
        </div>
      </div>

      {activeSubTab === "salesAgentUpline" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Sales-Agent Upline Commission</h3>
          <p className="text-xs text-gray-500 mb-4">
            Upline % is paid from Company share, not deducted from end-customer share.
          </p>
          {renderTable(SALES_AGENT_DATA)}
        </div>
      )}

      {activeSubTab === "epcAssisted" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">EPC-Assisted Commission</h3>
          <p className="text-xs text-gray-500 mb-4">
            Customer & other partner splits (if any) are configured in Commercial/Residential. 
            This table only defines the Finance–EPC split taken from Company share for this scenario.
            Dcarbon remainder is variable and calculated to make total 100%.
          </p>
          {renderTable(EPC_ASSISTED_DATA, true)}
        </div>
      )}
    </div>
  );
};

export default PartnerCommissionStructure;