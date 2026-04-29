"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FaPlay, FaClock, FaPercentage, FaUserTie } from "react-icons/fa";
import CONFIG from "@/lib/config";

const CalculationTriggers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSalesAgentLoading, setIsSalesAgentLoading] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusParams, setBonusParams] = useState({
    year: new Date().getFullYear(),
    quarter: Math.floor((new Date().getMonth() + 3) / 3)
  });
  const [showSalesAgentModal, setShowSalesAgentModal] = useState(false);
  // Audit fix #31 — main commission trigger now opens a modal so the admin can
  // pick which quarter to run for. Pre-fix it was hardcoded to the current
  // quarter only, with no way to retro-run a missed period.
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commissionParams, setCommissionParams] = useState({
    year: new Date().getFullYear(),
    quarter: Math.floor((new Date().getMonth() + 3) / 3)
  });

  const handleCommissionTrigger = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        toast.error("Authentication token not found", { position: 'top-center' });
        return;
      }

      const payload = {
        year: commissionParams.year,
        quarter: commissionParams.quarter
      };

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/commission-cron/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Commission calculation triggered for Q${commissionParams.quarter} ${commissionParams.year}`,
          { position: 'top-center', duration: 4000 }
        );

        toast.success("Sales agent bonus will trigger automatically in 15 minutes", {
          position: 'top-center',
          duration: 6000
        });

        setShowCommissionModal(false);
      } else {
        toast.error(result.message || "Failed to trigger calculation", {
          position: 'top-center'
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalesAgentTrigger = async () => {
    try {
      setIsSalesAgentLoading(true);
      const authToken = localStorage.getItem("authToken");
      
      if (!authToken) {
        toast.error("Authentication token not found", { position: 'top-center' });
        return;
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/commission-cron/sales-agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({})
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Sales agent bonus calculation triggered successfully", {
          position: 'top-center',
          duration: 4000
        });
        setShowSalesAgentModal(false);
      } else {
        toast.error(result.message || "Failed to trigger sales agent calculation", {
          position: 'top-center'
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { position: 'top-center' });
    } finally {
      setIsSalesAgentLoading(false);
    }
  };

  const handleBonusTrigger = async () => {
    try {
      setIsLoading(true);
      const authToken = localStorage.getItem("authToken");
      
      if (!authToken) {
        toast.error("Authentication token not found", { position: 'top-center' });
        return;
      }

      const payload = {
        year: bonusParams.year,
        quarter: bonusParams.quarter
      };

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/bonus/trigger-bonus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Bonus calculation triggered successfully", {
          position: 'top-center',
          duration: 4000
        });
        setShowBonusModal(false);
      } else {
        toast.error(result.message || "Failed to trigger bonus calculation", {
          position: 'top-center'
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, { position: 'top-center' });
    } finally {
      setIsLoading(false);
    }
  };

  const CommissionModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Trigger Commission Calculation</h3>
        <p className="text-xs text-gray-500 mb-4">
          Runs the quarterly commission split for every facility with sales in the selected period. Idempotent — re-running the same quarter is safe.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={commissionParams.year}
              onChange={(e) => setCommissionParams(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
            <select
              value={commissionParams.quarter}
              onChange={(e) => setCommissionParams(prev => ({ ...prev, quarter: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value={1}>Q1 (Jan - Mar)</option>
              <option value={2}>Q2 (Apr - Jun)</option>
              <option value={3}>Q3 (Jul - Sep)</option>
              <option value={4}>Q4 (Oct - Dec)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCommissionModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCommissionTrigger}
            disabled={isLoading}
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884] disabled:opacity-50 flex items-center"
          >
            {isLoading ? "Triggering..." : `Trigger Q${commissionParams.quarter} ${commissionParams.year}`}
          </button>
        </div>
      </div>
    </div>
  );

  const SalesAgentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Trigger Sales Agent Bonus</h3>
        
        <p className="text-sm text-gray-600 mb-4">
          This will manually trigger the sales agent bonus calculation. 
          Normally this runs automatically 15 minutes after commission calculation.
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowSalesAgentModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSalesAgentTrigger}
            disabled={isSalesAgentLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isSalesAgentLoading ? "Triggering..." : "Trigger Sales Agent"}
          </button>
        </div>
      </div>
    </div>
  );

  const BonusModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Trigger Bonus Calculation</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={bonusParams.year}
              onChange={(e) => setBonusParams(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
              min="2020"
              max="2030"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
            <select
              value={bonusParams.quarter}
              onChange={(e) => setBonusParams(prev => ({ ...prev, quarter: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994]"
            >
              <option value={1}>Q1 (Jan - Mar)</option>
              <option value={2}>Q2 (Apr - Jun)</option>
              <option value={3}>Q3 (Jul - Sep)</option>
              <option value={4}>Q4 (Oct - Dec)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowBonusModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleBonusTrigger}
            disabled={isLoading}
            className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884] disabled:opacity-50 flex items-center"
          >
            {isLoading ? "Triggering..." : "Trigger Calculation"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={() => setShowCommissionModal(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884] disabled:opacity-50 flex items-center space-x-2"
          title="Pick a quarter and trigger commission calculation"
        >
          <FaPlay size={12} />
          <span>Trigger Commission</span>
        </button>
        
        <button
          onClick={() => setShowSalesAgentModal(true)}
          disabled={isSalesAgentLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          title="Manually trigger sales agent bonus calculation"
        >
          <FaUserTie size={12} />
          <span>Sales Agent Bonus</span>
        </button>
        
        <button
          onClick={() => setShowBonusModal(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center space-x-2"
          title="Trigger partner bonus calculation"
        >
          <FaPercentage size={12} />
          <span>Trigger Partner Bonus</span>
        </button>
      </div>

      {showCommissionModal && <CommissionModal />}
      {showSalesAgentModal && <SalesAgentModal />}
      {showBonusModal && <BonusModal />}
    </>
  );
};

export default CalculationTriggers;