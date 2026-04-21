"use client";
/**
 * Single-view Commission Structure.
 *
 * The old version forced admins to pick a Property Type AND a Commission
 * Mode from a dropdown, scattering setup across ~6 separate tables per
 * property type. Per the 2026-04-13 meeting (AWE / Chimdinma / Udofot),
 * the dropdown is gone — each property type now shows a single table
 * where each mode is one row.
 *
 * Frontend-only change. Backend endpoints unchanged (confirmed frozen
 * until Philip signs off).
 */
import CONFIG from "@/lib/config";
import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import CommissionTable from "./CommissionTable";
import CommissionSetupModal from "./CommissionSetupModal";
import ManageTiersModal from "./ManageTiersModal";
import ManageCommissionModesModal from "./ManageCommissionModesModal";
import BonusCommissionStructure from "./commission/BonusCommissionStructure";
import BonusCommissionSetup from "./setupModals/BonusCommissionSetup";
import ContractTermsTab from "./ContractTermsTab";

const CommissionStructure = () => {
  const [activeTab, setActiveTab] = useState("COMMISSION");
  const [activePropertyTab, setActivePropertyTab] = useState("COMMERCIAL");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);
  const [showCommissionModesModal, setShowCommissionModesModal] = useState(false);
  const [showBonusSetup, setShowBonusSetup] = useState(false);
  const [tiers, setTiers] = useState([]);
  const [modes, setModes] = useState([]);
  const [accountModes, setAccountModes] = useState([]);
  const [allCommissionData, setAllCommissionData] = useState([]);
  // CommissionModes records (single source of truth for tier-unit routing)
  const [commissionModes, setCommissionModes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCommission, setEditingCommission] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchTiers();
    fetchModes();
    fetchCommissionModes();
  }, []);

  useEffect(() => {
    if (activeTab === "COMMISSION") {
      fetchCommissionData();
    }
  }, [activeTab, refreshTrigger]);

  const fetchTiers = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/commission-tier`, {
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
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/commission-structure/modes`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        const allModes = data;
        // Property-type modes: everything except sales-agent/account-level.
        const propertyModes = allModes.filter(
          (mode) => !mode.includes("SALES_AGENT") && mode !== "ACCOUNT_LEVEL"
        );
        setModes(propertyModes);
        setAccountModes(
          allModes.filter(
            (mode) => mode.includes("SALES_AGENT") || mode === "ACCOUNT_LEVEL"
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch modes:", error);
    }
  };

  /**
   * Fetch CommissionModes records — the mode × propertyType → tierUnit
   * lookup that drives tier matching at commission-calculation time.
   * Passed to CommissionTable so mode rows can render the correct badge
   * and flag unconfigured modes.
   */
  const fetchCommissionModes = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/commission-mode`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setCommissionModes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch commission modes:", error);
    }
  };

  /**
   * Fetch ALL commission structures in one call and filter client-side.
   * This replaces the old `filter/mode-property?mode=&property=` per-mode
   * fetches, which paired the old dropdown. No backend change required.
   */
  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/commission-structure/`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setAllCommissionData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch commission data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Rows scoped to the active property tab.
  const filteredData = allCommissionData.filter(
    (item) => item.propertyType === activePropertyTab
  );

  const getAvailableModes = () =>
    activePropertyTab === "ACCOUNT_LEVEL" ? accountModes : modes;

  const getDefaultModeForProperty = () => {
    if (activePropertyTab === "ACCOUNT_LEVEL") {
      return accountModes[0] || "SALES_AGENT_REFERRED_RESIDENTIAL";
    }
    return modes[0] || "DIRECT_CUSTOMER";
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
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/commission-structure/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.ok) {
        fetchCommissionData();
      }
    } catch (error) {
      console.error("Failed to delete commission:", error);
    }
  };

  /**
   * Bulk delete for Delete All / Partner-Finance cascade deletes.
   *
   * QA flagged on 2026-04-15 that clicking Delete All on a single mode row
   * appeared to wipe the entire table. Root cause: the single-item handler
   * above triggers `fetchCommissionData()` on every success — which flips
   * `loading` to true and unmounts the table. When Delete All fires N parallel
   * deletes, the table blanks N times mid-operation, producing the "everything
   * got deleted" perception. Fix: run all deletes in parallel and refetch
   * exactly once after they all settle.
   */
  const handleDeleteCommissions = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    try {
      const authToken = localStorage.getItem("authToken");
      await Promise.all(
        ids.map((id) =>
          fetch(`${CONFIG.API_BASE_URL}/api/commission-structure/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` },
          })
        )
      );
      fetchCommissionData();
    } catch (error) {
      console.error("Failed to delete commissions:", error);
    }
  };

  const handleSuccess = () => {
    setShowSetupModal(false);
    fetchCommissionData();
    // The setup modal now upserts CommissionModes inline, so refresh the
    // mode records too — the CommissionTable badge and the setup modal's
    // pre-fill both read from this.
    fetchCommissionModes();
  };

  const handleTiersUpdated = () => {
    setShowTiersModal(false);
    fetchTiers();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleBonusSuccess = () => {
    setShowBonusSetup(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const getPropertyTypeForModal = () =>
    activePropertyTab === "ACCOUNT_LEVEL" ? "ACCOUNT_LEVEL" : activePropertyTab;

  return (
    <div className="min-h-screen w-full flex flex-col py-6 px-0 bg-white">
      {showSetupModal && (
        <CommissionSetupModal
          onClose={() => setShowSetupModal(false)}
          onSuccess={handleSuccess}
          tiers={tiers}
          modes={getAvailableModes()}
          propertyType={getPropertyTypeForModal()}
          mode={editingCommission?.mode || getDefaultModeForProperty()}
          editingCommission={editingCommission}
          commissionModes={commissionModes}
        />
      )}

      {showTiersModal && (
        <ManageTiersModal
          onClose={() => setShowTiersModal(false)}
          onSuccess={handleTiersUpdated}
          tiers={tiers}
        />
      )}

      {showCommissionModesModal && (
        <ManageCommissionModesModal
          onClose={() => setShowCommissionModesModal(false)}
          onSuccess={() => {
            fetchCommissionModes();
            setRefreshTrigger((prev) => prev + 1);
          }}
        />
      )}

      {showBonusSetup && (
        <BonusCommissionSetup
          onClose={() => setShowBonusSetup(false)}
          onSuccess={handleBonusSuccess}
        />
      )}

      <div>
        <div className="bg-white border border-gray-200 rounded-xl">
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
                  activeTab === "CONTRACT_TERMS"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("CONTRACT_TERMS")}
              >
                Commission Contract Terms
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
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Property Type
                  </h3>
                  <div className="flex space-x-2">
                    {["COMMERCIAL", "RESIDENTIAL", "ACCOUNT_LEVEL"].map(
                      (property) => (
                        <button
                          key={property}
                          onClick={() => setActivePropertyTab(property)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            activePropertyTab === property
                              ? "bg-[#039994] text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {property === "ACCOUNT_LEVEL"
                            ? "Account Level"
                            : property}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/*
                  The per-mode dropdown that previously sat here has been
                  removed. All modes now appear as rows in the single table
                  below — see 2026-04-13 meeting notes / COMMISSION_REFACTOR_PLAN.md.
                */}

                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      onClick={handleCreateCommission}
                      className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884]"
                    >
                      Create Commission Structure
                    </button>
                    <button
                      onClick={() => setShowTiersModal(true)}
                      className="px-4 py-2 border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white transition-colors"
                    >
                      Manage Tiers
                    </button>
                    {/*
                      2026-04-20 meeting: tier-unit selection is now inline
                      inside CommissionSetupModal, so the prominent "Manage
                      Commission Modes" button was removed. A small advanced
                      link is kept for admins who need to view or edit the
                      raw CommissionModes records (e.g., to delete an orphan).
                    */}
                    <button
                      onClick={() => setShowCommissionModesModal(true)}
                      className="text-xs text-gray-500 underline hover:text-gray-700"
                    >
                      Advanced: view mode configurations
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-xl">
                    <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
                    <span className="text-sm text-gray-500 font-sfpro mt-3">
                      Loading commission data...
                    </span>
                  </div>
                ) : (
                  <CommissionTable
                    data={filteredData}
                    tiers={tiers}
                    propertyType={activePropertyTab}
                    commissionModes={commissionModes}
                    onEdit={handleEditCommission}
                    onDelete={handleDeleteCommission}
                    onDeleteMany={handleDeleteCommissions}
                  />
                )}
              </>
            )}

            {activeTab === "CONTRACT_TERMS" && <ContractTermsTab />}

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
