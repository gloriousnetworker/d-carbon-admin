"use client";
import React, { useState } from "react";
import CommissionTable from "./commission/CommissionTable";
import PartnerShareSetupStructureModal from "./modals/PartnerShareSetupStructureModal";
import MasterPartnerTPOShareSetupStructureModal from "./modals/MasterSuperPartnerTPOShareSetupStructureModal";
import CustomerSolarOwnerShareSetupStructureModal from "./modals/CustomerSolarOwnerShareSetupStructureModal";
import SalesAgentCommissionSetupStructureModal from "./modals/SalesAgentCommissionSetupStructureModal";
import { Toaster } from "react-hot-toast";

const CommissionStructure = () => {
  const [activeCommissionType, setActiveCommissionType] = useState("Partner Share");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [tableData, setTableData] = useState(null);

  const handleSetupStructure = () => setShowSetupModal(true);
  const handleCloseModal = () => setShowSetupModal(false);
  const handleChangeCommissionType = (type) => setActiveCommissionType(type);

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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      <Toaster position="top-right" />
      {renderSetupModal()}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col border border-[#E8E8E8]">
          <CommissionTable
            activeCommissionType={activeCommissionType}
            onChangeCommissionType={handleChangeCommissionType}
            onSetupStructure={handleSetupStructure}
            tableData={tableData}
          />
        </div>
      </div>
    </div>
  );
};

export default CommissionStructure;