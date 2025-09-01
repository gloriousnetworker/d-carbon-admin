"use client";
import React from "react";
import { pageTitle, labelClass, noteText } from "../styles";

const CommissionSummary = () => {
  const directPartnerData = {
    headers: ["Stakeholder", "Annual REC Sales Tier", "Share (%)", "One-Time Fees", "Cancellation Fees"],
    rows: [
      ["Customer / Facility", "< $500k", "50.0", "—", "$500"],
      ["Customer / Facility", "$500k – $2.5M", "60.0", "—", "$500"],
      ["Customer / Facility", "> $2.5M", "70.0", "—", "$500"],
      ["Installer", "All Tiers", "0.0", "—", "—"],
      ["Sales Agent", "All Tiers", "2.5", "—", "—"],
      ["DCarbon", "< $500k", "47.5", "—", "—"],
      ["DCarbon", "$500k – $2.5M", "37.5", "—", "—"],
      ["DCarbon", "> $2.5M", "27.5", "—", "—"]
    ]
  };

  const directAgentData = {
    headers: ["Stakeholder", "Annual REC Sales Tier", "Share (%)", "One-Time Fees", "Cancellation Fees"],
    rows: [
      ["Customer / Facility", "< $500k", "60.0", "—", "$500"],
      ["Customer / Facility", "$500k – $2.5M", "70.0", "—", "$500"],
      ["Customer / Facility", "> $2.5M", "80.0", "—", "$500"],
      ["Installer", "All Tiers", "0.0", "$1,000/MW", "—"],
      ["Sales Agent", "All Tiers", "2.5", "—", "—"],
      ["DCarbon", "< $500k", "37.5", "—", "—"],
      ["DCarbon", "$500k – $2.5M", "27.5", "—", "—"],
      ["DCarbon", "> $2.5M", "17.5", "—", "—"]
    ]
  };

  return (
    <div className="w-full">
      <h2 className={pageTitle}>Commission Summary (Scenario Readouts)</h2>
      
      <div className="mb-8">
        <h3 className={`${labelClass} font-semibold text-lg mb-4`}>A. "Direct Partner" (read-only)</h3>
        <div className="w-full overflow-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {directPartnerData.headers.map((header, index) => (
                  <th key={index} className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {directPartnerData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={`py-3 px-4 text-sm border-b border-gray-200 ${cellIndex === 0 ? "font-medium" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className={`${labelClass} font-semibold text-lg mb-4`}>B. "Direct Agent" (read-only)</h3>
        <div className="w-full overflow-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {directAgentData.headers.map((header, index) => (
                  <th key={index} className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {directAgentData.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={`py-3 px-4 text-sm border-b border-gray-200 ${cellIndex === 0 ? "font-medium" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommissionSummary;