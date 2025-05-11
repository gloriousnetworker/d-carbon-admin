"use client";
import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { IoSettingsSharp } from "react-icons/io5";

const COMMISSION_DATA = {
  "Partner Share": {
    headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration"],
    rows: [
      ["Standard Commercial/Residential", "20%", "15%", "10%", "7", "1"],
      ["Quarterly Bonus Commercial", "5%", "5%", "5%", "7", "1"],
      ["Bonus Residential", "10%", "10%", "10%", "7", "1"],
      ["Annual Bonus", "5%", "5%", "5%", "7", "1"],
    ],
  },
  "Master/Super Partner TPO Share": {
    headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration", "Cancellation Fee"],
    rows: [
      ["Master Partner (TPO)", "20%", "15%", "10%", "7", "1", "$250"],
      ["Master Partner (TPO)", "5%", "5%", "5%", "7", "1", "$250"],
      ["Master Partner (TPO)", "10%", "10%", "10%", "7", "1", "$250"],
      ["Master Partner (Resident/Operator Incentive)", "5%", "5%", "5%", "7", "1", "$250"],
    ],
  },
  "Customer/Solar Owner Share": {
    headers: ["Party Type", "<$500k", "$500k - $2.5M", ">$2.5M", "Max Duration", "Agreement Duration", "Cancellation Fee"],
    rows: [
      ["Commercial Customer Share w/Partner Referral", "20%", "15%", "10%", "7", "1", "$250"],
      ["Commercial Customer Share w/o Partner Referral (also after Y7)", "5%", "5%", "5%", "7", "1", "$250"],
      ["Residential Customer Points Share", "10%", "10%", "10%", "7", "1", "$250"],
    ],
  },
  "Sales Agent Commission": {
    headers: ["Party Type", "Capacity", "Amount", "Percentage", "Agreement Duration"],
    rows: [
      ["Per new solar owner (resi/commercial) registered", "1MW", "$1,000.00", "-", "1"],
      ["Per new partner registered", "1MW", "$5,000.00", "-", "1"],
      ["Annual Bonus 1", "10MW (year)", "$5,000.00", "-", "1"],
      ["Annual Bonus 2", "20MW (year)", "$10,000.00", "-", "1"],
      ["Annual Bonus 3", "30MW (year)", "$20,000.00", "-", "1"],
      ["Revenue share commission per new solar owner", "-", "-", "2.5%", "1"],
      ["Revenue share commission per partner revenue", "-", "-", "1%", "1"],
    ],
  },
};

const CommissionTable = ({ activeCommissionType, onChangeCommissionType, onSetupStructure, tableData }) => {
  const commissionTypes = Object.keys(COMMISSION_DATA);
  const { headers, rows } = tableData ? tableData : COMMISSION_DATA[activeCommissionType];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center">
          <h2 className="text-[#039994] font-semibold text-lg">
            {activeCommissionType}
          </h2>
          <div className="relative ml-2 inline-block">
            <FaChevronDown
              className="text-[#039994] cursor-pointer"
              size={15}
              onClick={() => {
                const dropdown = document.getElementById("commission-dropdown");
                dropdown.classList.toggle("hidden");
              }}
            />
            <div
              id="commission-dropdown"
              className="hidden absolute z-10 bg-white border border-gray-200 rounded shadow-lg mt-1 w-60"
            >
              {commissionTypes.map((type) => (
                <div
                  key={type}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    type === activeCommissionType ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onChangeCommissionType(type);
                    document.getElementById("commission-dropdown").classList.add("hidden");
                  }}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default CommissionTable;