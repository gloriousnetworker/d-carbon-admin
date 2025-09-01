"use client";
import React from "react";
import { pageTitle, labelClass, noteText } from "../styles";

const VersioningAndAudit = () => {
  const auditData = {
    headers: ["Version #", "Status", "Effective Date", "Last Modified By", "Modified At", "Diff Summary", "Actions"],
    rows: [
      ["v2.1", "Published", "2024-01-15", "admin@dcarbon.com", "2024-01-14 14:30", "Updated commercial tiers", "Preview, Restore"],
      ["v2.0", "Published", "2023-12-01", "finance@dcarbon.com", "2023-11-30 09:15", "Initial residential rules", "Preview, Restore"],
      ["v1.9", "Draft", "—", "sales@dcarbon.com", "2023-11-20 16:45", "Added partner bonuses", "Preview, Restore"]
    ]
  };

  return (
    <div className="w-full">
      <h2 className={pageTitle}>Versioning & Audit (supporting tables)</h2>
      
      <div className="mb-4">
        <h3 className={`${labelClass} font-semibold text-lg mb-4`}>A. "Audit & Version History" List</h3>
        <div className="w-full overflow-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {auditData.headers.map((header, index) => (
                  <th key={index} className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditData.rows.map((row, rowIndex) => (
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

export default VersioningAndAudit;