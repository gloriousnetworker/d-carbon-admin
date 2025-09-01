"use client";
import React, { useState } from "react";
import CommercialCommissionStructure from "./commission/CommercialCommissionStructure";
import ResidentialCommissionStructure from "./commission/ResidentialCommissionStructure";
import PartnerCommissionStructure from "./commission/PartnerCommissionStructure";
import BonusCommissionStructure from "./commission/BonusCommissionStructure";
import CommissionSummary from "./commission/CommissionSummary";
import VersioningAndAudit from "./commission/VersioningAndAudit";
import ValidationRules from "./commission/ValidationRules";
import CommercialCommissionSetup from "./setupModals/CommercialCommissionSetup";
import ResidentialCommissionSetup from "./setupModals/ResidentialCommissionSetup";
import PartnerCommissionSetup from "./setupModals/PartnerCommissionSetup";
import BonusCommissionSetup from "./setupModals/BonusCommissionSetup";
import { Toaster } from "react-hot-toast";

const CommissionStructure = () => {
  const [activeTab, setActiveTab] = useState("Commercial");
  const [showCommercialSetup, setShowCommercialSetup] = useState(false);
  const [showResidentialSetup, setShowResidentialSetup] = useState(false);
  const [showPartnerSetup, setShowPartnerSetup] = useState(false);
  const [showBonusSetup, setShowBonusSetup] = useState(false);

  const handleCommercialSetup = () => setShowCommercialSetup(true);
  const handleCloseCommercialSetup = () => setShowCommercialSetup(false);
  const handleResidentialSetup = () => setShowResidentialSetup(true);
  const handleCloseResidentialSetup = () => setShowResidentialSetup(false);
  const handlePartnerSetup = () => setShowPartnerSetup(true);
  const handleClosePartnerSetup = () => setShowPartnerSetup(false);
  const handleBonusSetup = () => setShowBonusSetup(true);
  const handleCloseBonusSetup = () => setShowBonusSetup(false);

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-4">
      <Toaster position="top-right" />
      {showCommercialSetup && (
        <CommercialCommissionSetup onClose={handleCloseCommercialSetup} />
      )}
      {showResidentialSetup && (
        <ResidentialCommissionSetup onClose={handleCloseResidentialSetup} />
      )}
      {showPartnerSetup && (
        <PartnerCommissionSetup onClose={handleClosePartnerSetup} />
      )}
      {showBonusSetup && (
        <BonusCommissionSetup onClose={handleCloseBonusSetup} />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]">
          <div className="border-b border-gray-200">
            <div className="flex justify-between">
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Commercial"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Commercial")}
              >
                Commercial
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Residential"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Residential")}
              >
                Residential
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Partner"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Partner")}
              >
                Partner
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Bonus"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Bonus")}
              >
                Bonus
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Summary"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Summary")}
              >
                Summary
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Versioning"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Versioning")}
              >
                Versioning & Audit
              </button>
              <button
                className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === "Validation"
                    ? "text-[#039994] border-[#039994]"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("Validation")}
              >
                Validation Rules
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "Commercial" && (
              <CommercialCommissionStructure onSetupStructure={handleCommercialSetup} />
            )}
            {activeTab === "Residential" && (
              <ResidentialCommissionStructure onSetupStructure={handleResidentialSetup} />
            )}
            {activeTab === "Partner" && (
              <PartnerCommissionStructure onSetupStructure={handlePartnerSetup} />
            )}
            {activeTab === "Bonus" && (
              <BonusCommissionStructure onSetupStructure={handleBonusSetup} />
            )}
            {activeTab === "Summary" && (
              <CommissionSummary />
            )}
            {activeTab === "Versioning" && (
              <VersioningAndAudit />
            )}
            {activeTab === "Validation" && (
              <ValidationRules />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionStructure;