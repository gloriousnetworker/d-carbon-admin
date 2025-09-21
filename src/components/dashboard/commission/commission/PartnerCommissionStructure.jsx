"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { toast } from "react-hot-toast";

const PartnerCommissionStructure = ({ onSetupStructure, refreshData }) => {
  const [activeSubTab, setActiveSubTab] = useState("salesAgentUpline");
  const [salesAgentData, setSalesAgentData] = useState(null);
  const [epcAssistedData, setEpcAssistedData] = useState(null);
  const [commercialData, setCommercialData] = useState(null);
  const [residentialData, setResidentialData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSalesAgentData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/sales-agent-referral', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sales agent data');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setSalesAgentData(result.data);
      } else {
        throw new Error('Failed to fetch sales agent data');
      }
    } catch (error) {
      console.error('Error fetching sales agent data:', error);
    }
  };

  const fetchEpcAssistedData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/epc-assisted', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch EPC assisted data');
      }

      const result = await response.json();
      if (result.status === 'success') {
        setEpcAssistedData(result.data);
      } else {
        throw new Error('Failed to fetch EPC assisted data');
      }
    } catch (error) {
      console.error('Error fetching EPC assisted data:', error);
    }
  };

  const fetchCommercialData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/commercial', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setCommercialData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching commercial data:', error);
    }
  };

  const fetchResidentialData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/commission-structure/residential', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          setResidentialData(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching residential data:', error);
    }
  };

  const calculateEpcSplit = (financeCommission, ratio = 0.6) => {
    const financeShare = Math.round(financeCommission * ratio * 10) / 10;
    const installerShare = Math.round((financeCommission - financeShare) * 10) / 10;
    return { finance: financeShare, installer: installerShare };
  };

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchSalesAgentData(),
        fetchEpcAssistedData(),
        fetchCommercialData(),
        fetchResidentialData()
      ]);
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
  }, [refreshData]);

  const getSalesAgentTableData = () => {
    if (!salesAgentData) {
      return {
        headers: ["Relationship Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap"],
        rows: [
          ["Sales Agent → Sales Agent", "0.0", "0.0", "0.0", "$0"],
          ["Sales Agent → Installer/EPC", "0.0", "0.0", "0.0", "$0"],
          ["Sales Agent → Finance Company", "0.0", "0.0", "0.0", "$0"],
        ],
      };
    }

    return {
      headers: ["Relationship Type", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Annual Cap"],
      rows: [
        ["Sales Agent → Sales Agent", salesAgentData.salesAgentUnder500k, salesAgentData.salesAgent500kTo2_5m, salesAgentData.salesAgentOver2_5m, `$${salesAgentData.salesAgentAnnualCap.toLocaleString()}`],
        ["Sales Agent → Installer/EPC", salesAgentData.installerUnder500k, salesAgentData.installer500kTo2_5m, salesAgentData.installerOver2_5m, `$${salesAgentData.installerAnnualCap.toLocaleString()}`],
        ["Sales Agent → Finance Company", salesAgentData.financeUnder500k, salesAgentData.finance500kTo2_5m, salesAgentData.financeOver2_5m, `$${salesAgentData.financeAnnualCap.toLocaleString()}`],
      ],
    };
  };

  const getEpcAssistedTableData = () => {
    if (!epcAssistedData) {
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

    const commercialFinance = epcAssistedData.financeShareLessThan500k !== null ? {
      lessThan500k: epcAssistedData.financeShareLessThan500k,
      between500kTo2_5m: epcAssistedData.financeShare500kTo2_5m,
      moreThan2_5m: epcAssistedData.financeShareMoreThan2_5m
    } : { lessThan500k: 0, between500kTo2_5m: 0, moreThan2_5m: 0 };

    const commercialInstaller = epcAssistedData.installerShareLessThan500k !== null ? {
      lessThan500k: epcAssistedData.installerShareLessThan500k,
      between500kTo2_5m: epcAssistedData.installerShare500kTo2_5m,
      moreThan2_5m: epcAssistedData.installerShareMoreThan2_5m
    } : { lessThan500k: 0, between500kTo2_5m: 0, moreThan2_5m: 0 };

    const residentialFinance = epcAssistedData.residentialFinanceShareLessThan500k !== null ? {
      lessThan500k: epcAssistedData.residentialFinanceShareLessThan500k,
      between500kTo2_5m: epcAssistedData.residentialFinanceShare500kTo2_5m,
      moreThan2_5m: epcAssistedData.residentialFinanceShareMoreThan2_5m
    } : { lessThan500k: 0, between500kTo2_5m: 0, moreThan2_5m: 0 };

    const residentialInstaller = epcAssistedData.residentialInstallerShareLessThan500k !== null ? {
      lessThan500k: epcAssistedData.residentialInstallerShareLessThan500k,
      between500kTo2_5m: epcAssistedData.residentialInstallerShare500kTo2_5m,
      moreThan2_5m: epcAssistedData.residentialInstallerShareMoreThan2_5m
    } : { lessThan500k: 0, between500kTo2_5m: 0, moreThan2_5m: 0 };

    return {
      headers: ["Stakeholder", "<$500k (%)", "$500k - $2.5M (%)", ">$2.5M (%)", "Max Duration (Years)", "Agreement Duration (Years)"],
      rows: [
        ["Finance Company (Commercial)", commercialFinance.lessThan500k, commercialFinance.between500kTo2_5m, commercialFinance.moreThan2_5m, epcAssistedData.maxDuration, epcAssistedData.agreementDuration],
        ["Installer/EPC (Commercial)", commercialInstaller.lessThan500k, commercialInstaller.between500kTo2_5m, commercialInstaller.moreThan2_5m, epcAssistedData.maxDuration, epcAssistedData.agreementDuration],
        ["", "", "", "", "", ""],
        ["Finance Company (Residential)", residentialFinance.lessThan500k, residentialFinance.between500kTo2_5m, residentialFinance.moreThan2_5m, epcAssistedData.maxDuration, epcAssistedData.agreementDuration],
        ["Installer/EPC (Residential)", residentialInstaller.lessThan500k, residentialInstaller.between500kTo2_5m, residentialInstaller.moreThan2_5m, epcAssistedData.maxDuration, epcAssistedData.agreementDuration],
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
          {renderTable(getSalesAgentTableData())}
        </div>
      )}

      {activeSubTab === "epcAssisted" && (
        <div>
          <h3 className="text-[#039994] font-medium mb-2">EPC-Assisted Commission</h3>
          <p className="text-xs text-gray-500 mb-4">
            Commission splits are automatically calculated based on Commercial and Residential commission structures.
            Finance Company receives 60% and Installer/EPC receives 40% of the partner referral commission.
          </p>
          {renderTable(getEpcAssistedTableData())}
        </div>
      )}
    </div>
  );
};

export default PartnerCommissionStructure;