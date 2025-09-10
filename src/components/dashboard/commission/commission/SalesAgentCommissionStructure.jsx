"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";

const SalesAgentCommissionStructure = ({ onSetupStructure }) => {
  const [activeSubTab, setActiveSubTab] = useState("commercial");
  
  const COMMERCIAL_DATA = {
    headers: ["Referrer Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap ($)"],
    rows: [
      ["Sales Agent", "2.0", "2.5", "3.0", "50,000"],
      ["Commercial User", "5.0", "5.5", "6.0", "100,000"],
    ],
  };

  const RESIDENTIAL_DATA = {
    headers: ["Referrer Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap ($)"],
    rows: [
      ["Sales Agent", "1.5", "2.0", "2.5", "25,000"],
      ["Residential User", "3.0", "3.5", "4.0", "50,000"],
    ],
  };

  const renderTable = (data) => (
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
          <tr className="bg-blue-50">
            <td className="py-3 px-4 text-sm font-medium border-b border-gray-200">Total Allocation</td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">
              {activeSubTab === "commercial" ? "7.0%" : "4.5%"}
            </td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">
              {activeSubTab === "commercial" ? "8.0%" : "5.5%"}
            </td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">
              {activeSubTab === "commercial" ? "9.0%" : "6.5%"}
            </td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">-</td>
          </tr>
          <tr className="bg-green-50">
            <td className="py-3 px-4 text-sm font-medium border-b border-gray-200">Decarbon Remainder</td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">
              {activeSubTab === "commercial" ? "93.0%" : "95.5%"}
            </td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">
              {activeSubTab === "commercial" ? "92.0%" : "94.5%"}
            </td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">
              {activeSubTab === "commercial" ? "91.0%" : "93.5%"}
            </td>
            <td className="py-3 px-4 text-sm border-b border-gray-200">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

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
        </div>
      </div>

      {activeSubTab === "commercial" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Commercial Account Referrals</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission structure for sales agents and commercial users who refer commercial accounts.
          </p>
          {renderTable(COMMERCIAL_DATA)}
        </div>
      )}

      {activeSubTab === "residential" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">Residential Account Referrals</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission structure for sales agents and residential users who refer residential accounts.
          </p>
          {renderTable(RESIDENTIAL_DATA)}
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Account-level commissions are calculated based on the total decarbon remainder from all facilities under a customer account.
      </div>
    </div>
  );
};

export default SalesAgentCommissionStructure;