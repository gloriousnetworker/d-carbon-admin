"use client";
import React, { useState } from "react";
import { IoSettingsSharp } from "react-icons/io5";

const AccountLevelBasedCommissionStructure = ({ onSetupStructure }) => {
  const [activeSubTab, setActiveSubTab] = useState("commercial");
  
  const COMMERCIAL_DATA = {
    headers: ["Referrer Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap ($)"],
    rows: [
      ["Commercial → Commercial", "5.0", "5.5", "6.0", "100,000"],
      ["Commercial → Residential", "3.0", "3.5", "4.0", "50,000"],
    ],
  };

  const RESIDENTIAL_DATA = {
    headers: ["Referrer Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap ($)"],
    rows: [
      ["Residential → Commercial", "4.0", "4.5", "5.0", "75,000"],
      ["Residential → Residential", "3.0", "3.5", "4.0", "50,000"],
    ],
  };

  const SALES_AGENT_DATA = {
    headers: ["Referrer Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap ($)"],
    rows: [
      ["Sales Agent → Commercial", "2.0", "2.5", "3.0", "50,000"],
      ["Sales Agent → Residential", "1.5", "2.0", "2.5", "25,000"],
    ],
  };

  const renderTable = (data, type) => (
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
          Account Level Based Commission Structure
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
              activeSubTab === "commercial"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("commercial")}
          >
            Commercial Referrals
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "residential"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("residential")}
          >
            Residential Referrals
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === "sales-agent"
                ? "text-[#039994] border-[#039994]"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveSubTab("sales-agent")}
          >
            Sales Agent Referrals
          </button>
        </div>
      </div>

      {activeSubTab === "commercial" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Commercial Account Referrals</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission structure for commercial users who refer other commercial or residential accounts.
          </p>
          {renderTable(COMMERCIAL_DATA, "commercial")}
        </div>
      )}

      {activeSubTab === "residential" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Residential Account Referrals</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission structure for residential users who refer other commercial or residential accounts.
          </p>
          {renderTable(RESIDENTIAL_DATA, "residential")}
        </div>
      )}

      {activeSubTab === "sales-agent" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Sales Agent Referrals</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission structure for sales agents who refer commercial or residential accounts.
          </p>
          {renderTable(SALES_AGENT_DATA, "sales-agent")}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Account-level commissions are calculated based on the total decarbon remainder from all facilities under a customer account.
      </div>
    </div>
  );
};

export default AccountLevelBasedCommissionStructure;