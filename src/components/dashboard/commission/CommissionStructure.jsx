"use client";
import React, { useState } from "react";
import CommissionTable from "./commission/CommissionTable";
import CommissionSummary from "./commission/CommissionSummary";
import PartnerShareSetupStructureModal from "./modals/PartnerShareSetupStructureModal";
import MasterPartnerTPOShareSetupStructureModal from "./modals/MasterSuperPartnerTPOShareSetupStructureModal";
import CustomerSolarOwnerShareSetupStructureModal from "./modals/CustomerSolarOwnerShareSetupStructureModal";
import SalesAgentCommissionSetupStructureModal from "./modals/SalesAgentCommissionSetupStructureModal";
import ResidentialReferralSetupModal from "./modals/ResidentialReferralSetupModal";
import { Toaster } from "react-hot-toast";

const CommissionStructure = () => {
  const [activeTab, setActiveTab] = useState("Commission Summary");
  const [activeCommissionType, setActiveCommissionType] = useState("Partner Share");
  const [activeSummaryType, setActiveSummaryType] = useState("Direct Agent");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [tableData, setTableData] = useState(null);

  const handleSetupStructure = () => setShowSetupModal(true);
  const handleCloseModal = () => setShowSetupModal(false);
  const handleChangeCommissionType = (type) => setActiveCommissionType(type);
  const handleChangeSummaryType = (type) => setActiveSummaryType(type);
  
  const handleUpdateTableData = (newData) => {
    setTableData(newData);
  };

  const renderSetupModal = () => {
    if (!showSetupModal) return null;
    switch (activeCommissionType) {
      case "Partner Share":
        return (
          <PartnerShareSetupStructureModal
            onClose={handleCloseModal}
            onUpdate={handleUpdateTableData}
          />
        );
      case "Master/Super Partner TPO Share":
        return (
          <MasterPartnerTPOShareSetupStructureModal
            onClose={handleCloseModal}
            onUpdate={handleUpdateTableData}
          />
        );
      case "Customer/Solar Owner Share":
        return (
          <CustomerSolarOwnerShareSetupStructureModal
            onClose={handleCloseModal}
            onUpdate={handleUpdateTableData}
          />
        );
      case "Sales Agent Commission":
        return (
          <SalesAgentCommissionSetupStructureModal
            onClose={handleCloseModal}
            onUpdate={handleUpdateTableData}
          />
        );
      case "Residential Referral":
        return (
          <ResidentialReferralSetupModal
            onClose={handleCloseModal}
            onUpdate={handleUpdateTableData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      <Toaster position="top-right" />
      {renderSetupModal()}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "Commission Summary"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Commission Summary")}
              >
                Commission Summary
              </button>
              <button
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "Commission Structure"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Commission Structure")}
              >
                Commission Structure
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "Commission Summary" ? (
              <CommissionSummary
                activeSummaryType={activeSummaryType}
                onChangeSummaryType={handleChangeSummaryType}
              />
            ) : (
              <CommissionTable
                activeCommissionType={activeCommissionType}
                onChangeCommissionType={handleChangeCommissionType}
                onSetupStructure={handleSetupStructure}
                tableData={tableData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionStructure;