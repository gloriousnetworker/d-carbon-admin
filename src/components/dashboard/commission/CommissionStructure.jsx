"use client";
import React, { useState, useEffect } from "react";
import CommissionTable from "./CommissionTable";
import CommissionSetupModal from "./CommissionSetupModal";
import ManageTiersModal from "./ManageTiersModal";
import BonusCommissionStructure from "./commission/BonusCommissionStructure";
import BonusCommissionSetup from "./setupModals/BonusCommissionSetup";

const CommissionStructure = () => {
  const [activeTab, setActiveTab] = useState("COMMISSION");
  const [activePropertyTab, setActivePropertyTab] = useState("COMMERCIAL");
  const [activeMode, setActiveMode] = useState("DIRECT_CUSTOMER");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const [showBonusSetup, setShowBonusSetup] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [modes, setModes] = useState([]);
  const [accountModes, setAccountModes] = useState([]);
  const [commissionData, setCommissionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const propertyTypes = {
    COMMERCIAL: ["COMMERCIAL"],
    RESIDENTIAL: ["RESIDENTIAL"],
    ACCOUNT_LEVEL: ["ACCOUNT_LEVEL"]
  };

  useEffect(() => {
    fetchTiers();
    fetchModes();
  }, []);

  useEffect(() => {
    if (activeTab === "COMMISSION") {
      fetchCommissionData();
    }
  }, [activeTab, activePropertyTab, activeMode, refreshTrigger]);

  const fetchTiers = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch("https://services.dcarbon.solutions/api/commission-tier", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTiers(data.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
    }
  };

  const fetchModes = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch("https://services.dcarbon.solutions/api/commission-structure/modes", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        const allModes = data;
        setModes(allModes.filter(mode => 
          !mode.includes("SALES_AGENT") && mode !== "ACCOUNT_LEVEL"
        ));
        setAccountModes(allModes.filter(mode => 
          mode.includes("SALES_AGENT") || mode === "ACCOUNT_LEVEL"
        ));
      }
    } catch (error) {
      console.error("Failed to fetch modes:", error);
    }
  };

  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const property = activePropertyTab === "ACCOUNT_LEVEL" ? "ACCOUNT_LEVEL" : activePropertyTab;
      const mode = activePropertyTab === "ACCOUNT_LEVEL" ? activeMode : activeMode;
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/commission-structure/filter/mode-property?mode=${mode}&property=${property}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCommissionData(data);
      }
    } catch (error) {
      console.error("Failed to fetch commission data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableModes = () => {
    if (activePropertyTab === "ACCOUNT_LEVEL") {
      return accountModes;
    }
    return modes;
  };

  const handleCreateCommission = () => {
    setEditingCommission(null);
    setShowSetupModal(true);
  };

  const handleEditCommission = (commission) => {
    setEditingCommission(commission);
    setShowSetupModal(true);
  };

  const handleDeleteCommission = async (id) => {
    if (!window.confirm("Are you sure you want to delete this commission structure?")) return;
    
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`https://services.dcarbon.solutions/api/commission-structure/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.ok) {
        fetchCommissionData();
      }
    } catch (error) {
      console.error("Failed to delete commission:", error);
    }
  };

  const handleSuccess = () => {
    setShowSetupModal(false);
    fetchCommissionData();
  };

  const handleTiersUpdated = () => {
    setShowTiersModal(false);
    fetchTiers();
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBonusSuccess = () => {
    setShowBonusSetup(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const getPropertyTypeForModal = () => {
    return activePropertyTab === "ACCOUNT_LEVEL" ? "ACCOUNT_LEVEL" : activePropertyTab;
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      {showSetupModal && (
        <CommissionSetupModal
          onClose={() => setShowSetupModal(false)}
          onSuccess={handleSuccess}
          tiers={tiers}
          modes={getAvailableModes()}
          propertyType={getPropertyTypeForModal()}
          mode={activeMode}
          editingCommission={editingCommission}
        />
      )}

      {showTiersModal && (
        <ManageTiersModal
          onClose={() => setShowTiersModal(false)}
          onSuccess={handleTiersUpdated}
          tiers={tiers}
        />
      )}

      {showBonusSetup && (
        <BonusCommissionSetup
          onClose={() => setShowBonusSetup(false)}
          onSuccess={handleBonusSuccess}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "COMMISSION"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("COMMISSION")}
              >
                Commission Structure
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "BONUS"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("BONUS")}
              >
                Bonus Structure
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "COMMISSION" && (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Property Type</h3>
                  <div className="flex space-x-2">
                    {["COMMERCIAL", "RESIDENTIAL", "ACCOUNT_LEVEL"].map((property) => (
                      <button
                        key={property}
                        onClick={() => {
                          setActivePropertyTab(property);
                          if (property === "ACCOUNT_LEVEL") {
                            setActiveMode("SALES_AGENT_DIRECT_CUSTOMER");
                          } else {
                            setActiveMode("DIRECT_CUSTOMER");
                          }
                        }}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          activePropertyTab === property
                            ? "bg-[#039994] text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {property === "ACCOUNT_LEVEL" ? "Account Level" : property}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {activePropertyTab === "ACCOUNT_LEVEL" ? "Sales Agent Mode" : "Commission Mode"}
                  </h3>
                  <select
                    value={activeMode}
                    onChange={(e) => setActiveMode(e.target.value)}
                    className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md bg-white"
                  >
                    {getAvailableModes().map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={handleCreateCommission}
                    className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884]"
                  >
                    Create Commission Structure
                  </button>
                  <button
                    onClick={() => setShowTiersModal(true)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Manage Tiers
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : (
                  <CommissionTable
                    data={commissionData}
                    tiers={tiers}
                    propertyType={activePropertyTab}
                    onEdit={handleEditCommission}
                    onDelete={handleDeleteCommission}
                  />
                )}
              </>
            )}

            {activeTab === "BONUS" && (
              <BonusCommissionStructure
                onSetupStructure={() => setShowBonusSetup(true)}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionStructure;