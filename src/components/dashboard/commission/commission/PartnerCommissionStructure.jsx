"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const PartnerCommissionStructure = ({ onSetupStructure }) => {
  const [activeSubTab, setActiveSubTab] = useState("salesAgentUpline");
  const [commercialData, setCommercialData] = useState(null);
  const [residentialData, setResidentialData] = useState(null);
  const [loading, setLoading] = useState(true);

  const SALES_AGENT_DATA = {
    headers: ["Relationship Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap"],
    rows: [
      ["Sales Agent → Sales Agent", "0.5", "0.5", "0.75", "$25,000"],
      ["Sales Agent → Installer/EPC", "1.0", "1.0", "1.0", "$50,000"],
      ["Sales Agent → Finance Company", "1.0", "1.0", "1.0", "$50,000"],
    ],
  };

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      
      const [commercialResponse, residentialResponse] = await Promise.all([
        fetch('https://services.dcarbon.solutions/api/commission-structure/commercial', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        }),
        fetch('https://services.dcarbon.solutions/api/commission-structure/residential', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        })
      ]);

      if (!commercialResponse.ok || !residentialResponse.ok) {
        throw new Error('Failed to fetch commission data');
      }

      const commercialResult = await commercialResponse.json();
      const residentialResult = await residentialResponse.json();
      
      if (commercialResult.status === 'success' && residentialResult.status === 'success') {
        setCommercialData(commercialResult.data);
        setResidentialData(residentialResult.data);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      toast.error(`Failed to load commission data: ${error.message}`, {
        position: 'top-center',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const calculateEpcSplit = (financeCommission, ratio = 0.6) => {
    const financeShare = Math.round(financeCommission * ratio * 10) / 10;
    const installerShare = Math.round((financeCommission - financeShare) * 10) / 10;
    return { finance: financeShare, installer: installerShare };
  };

  const getEpcAssistedData = () => {
    if (!commercialData || !residentialData) {
      return {
        headers: ["Stakeholder", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)"],
        rows: [
          ["Finance Company (Commercial)", "0.0", "0.0", "0.0", "0", "0"],
          ["Installer/EPC (Commercial)", "0.0", "0.0", "0.0", "0", "0"],
          ["", "", "", "", "", ""],
          ["Finance Company (Residential)", "0.0", "0.0", "0.0", "0", "0"],
          ["Installer/EPC (Residential)", "0.0", "0.0", "0.0", "0", "0"],
        ],
      };
    }

    const commercialFinance = commercialData.partnerFinance;
    const residentialFinance = residentialData.partnerFinance;
    const terms = commercialData.terms;

    const commercialLessThan500k = calculateEpcSplit(commercialFinance.partnerShareLessThan500k);
    const commercialBetween500kTo2_5m = calculateEpcSplit(commercialFinance.partnerShareBetween500kTo2_5m);
    const commercialMoreThan2_5m = calculateEpcSplit(commercialFinance.partnerShareMoreThan2_5m);

    const residentialLessThan500k = calculateEpcSplit(residentialFinance.partnerShareLessThan500k);
    const residentialBetween500kTo2_5m = calculateEpcSplit(residentialFinance.partnerShareBetween500kTo2_5m);
    const residentialMoreThan2_5m = calculateEpcSplit(residentialFinance.partnerShareMoreThan2_5m);

    return {
      headers: ["Stakeholder", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)"],
      rows: [
        ["Finance Company (Commercial)", commercialLessThan500k.finance, commercialBetween500kTo2_5m.finance, commercialMoreThan2_5m.finance, terms.maxDuration, terms.agreementDuration],
        ["Installer/EPC (Commercial)", commercialLessThan500k.installer, commercialBetween500kTo2_5m.installer, commercialMoreThan2_5m.installer, terms.maxDuration, terms.agreementDuration],
        ["", "", "", "", "", ""],
        ["Finance Company (Residential)", residentialLessThan500k.finance, residentialBetween500kTo2_5m.finance, residentialMoreThan2_5m.finance, terms.maxDuration, terms.agreementDuration],
        ["Installer/EPC (Residential)", residentialLessThan500k.installer, residentialBetween500kTo2_5m.installer, residentialMoreThan2_5m.installer, terms.maxDuration, terms.agreementDuration],
      ],
    };
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
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

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
            Commission splits are automatically calculated based on Commercial and Residential commission structures.
            Finance Company receives 60% and Installer/EPC receives 40% of the partner referral commission.
          </p>
          {renderTable(getEpcAssistedData())}
        </div>
      )}
    </div>
  );
};

export default PartnerCommissionStructure;