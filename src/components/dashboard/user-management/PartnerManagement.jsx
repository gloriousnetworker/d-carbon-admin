"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowLeft
} from "lucide-react";
import PartnerDetails from "./PartnerDetails";
import FilterByModal from "./modals/partnerManagement/FilterBy";

const mockPartners = [
  { id: 1, name: "Name", type: "Sales Agent", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 2, name: "Name", type: "Finance Company", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 3, name: "Name", type: "Installer", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 4, name: "Name", type: "Installer", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 5, name: "Name", type: "Installer", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 6, name: "Name", type: "Finance Company", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 7, name: "Name", type: "Finance Company", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 8, name: "Name", type: "Sales Agent", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 9, name: "Name", type: "Finance Company", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
  { id: 10, name: "Name", type: "Sales Agent", contact: "+234-816-1209-492", email: "name@domain.com", address: "Address", date: "16-03-2025" },
];

export default function PartnerManagement({ onViewChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentView, setCurrentView] = useState("table"); // "table" or "details"
  
  const partnersPerPage = 10;
  const indexOfLast = currentPage * partnersPerPage;
  const indexOfFirst = indexOfLast - partnersPerPage;
  const currentPartners = mockPartners.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(mockPartners.length / partnersPerPage);

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedPartner(null);
    setCurrentView("table");
  };

  const handleBackToManagement = () => {
    // Call the parent component's function to change view
    if (onViewChange) {
      onViewChange("management");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-hidden p-10">
        {currentView === "details" && selectedPartner && (
          // Show Partner Details when a partner is selected
          <PartnerDetails 
            partner={selectedPartner} 
            onBack={handleBackToList} 
          />
        )}
        
        {currentView === "table" && (
          // Show Partner Management Table
          <>
            {/* ===== Header Row ===== */}
            <div className="flex justify-between mb-6">
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowFilterModal(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filter by
                </Button>
                
                {/* Back to Customer Management Button */}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleBackToManagement}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Customer Management
                </Button>
              </div>
            </div>

            {/* ===== Title ===== */}
            <div className="mb-6 p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-1 text-xl font-medium text-teal-500">
                Partner Management
              </div>
              <InfoIcon />
            </div>

            {/* ===== Partner Table ===== */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y">
                    <th className="py-3 px-4 text-left font-medium">S/N</th>
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Partner Type</th>
                    <th className="py-3 px-4 text-left font-medium">Contact no.</th>
                    <th className="py-3 px-4 text-left font-medium">Email address</th>
                    <th className="py-3 px-4 text-left font-medium">Address</th>
                    <th className="py-3 px-4 text-left font-medium">Date Reg.</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPartners.map((partner) => (
                    <tr
                      key={partner.id}
                      className="border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => handlePartnerClick(partner)}
                    >
                      <td className="py-3 px-4">{partner.id}</td>
                      <td className="py-3 px-4">{partner.name}</td>
                      <td className="py-3 px-4">{partner.type}</td>
                      <td className="py-3 px-4">{partner.contact}</td>
                      <td className="py-3 px-4">{partner.email}</td>
                      <td className="py-3 px-4">{partner.address}</td>
                      <td className="py-3 px-4">{partner.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== Pagination ===== */}
            <div className="p-4 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <FilterByModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)} 
      />
    </div>
  );
}

// Helper component
function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-teal-500"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}