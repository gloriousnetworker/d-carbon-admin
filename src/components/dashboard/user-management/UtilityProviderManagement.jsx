"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Filter,
  PenLine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import * as styles from "./styles";

// Mock data for utility providers
const mockUtilityProviders = [
  { 
    id: 1, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 2, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 3, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 4, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 5, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 6, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 7, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 8, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 9, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
  { 
    id: 10, 
    name: "Name", 
    utilityId: "Utility ID", 
    utilityCode: "Utility Code", 
    capacityFactor: "100%", 
    address: "Address", 
    zipcode: "zipcode", 
    operationDate: "DD/MM/YYYY",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    partnerName: "Partner Name"
  },
];

export default function UtilityProviderManagement({ onViewChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [currentView, setCurrentView] = useState("list"); // "list" or "details"
  
  const providersPerPage = 10;
  const indexOfLast = currentPage * providersPerPage;
  const indexOfFirst = indexOfLast - providersPerPage;
  const currentProviders = mockUtilityProviders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(mockUtilityProviders.length / providersPerPage);

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedProvider(null);
    setCurrentView("list");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {currentView === "details" && selectedProvider && (
        // Show Utility Provider Details when a provider is selected
        <UtilityProviderDetails 
          provider={selectedProvider} 
          onBack={handleBackToList} 
        />
      )}
      
      {currentView === "list" && (
        // Show Utility Provider Management Table
        <>
          {/* ===== Header Row ===== */}
          <div className="flex justify-between mb-6">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowFilterModal(true)}
            >
              <Filter className="h-4 w-4" />
              Filter by
            </Button>

            <Button
              className="gap-2 bg-[#039994] hover:bg-[#02857f] text-white"
              onClick={() => setShowAddUtilityModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Utility Provider
            </Button>
          </div>

          {/* ===== Title / Sub‑nav ===== */}
          <div className="mb-6 p-4 border-b flex items-center justify-between bg-white">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-xl font-medium text-[#039994]">
                  Utility Provider Management
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-white">
                <DropdownMenuItem onClick={() => onViewChange("management")}>
                  Customer Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange("report")}>
                  Customer Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewChange("partner-management")}>
                  Partner Management
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <InfoIcon />
          </div>

          {/* ===== Utility Provider Table ===== */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y">
                  <th className="py-3 px-4 text-left font-medium">S/N</th>
                  <th className="py-3 px-4 text-left font-medium">Utility Provider</th>
                  <th className="py-3 px-4 text-left font-medium">Utility ID</th>
                  <th className="py-3 px-4 text-left font-medium">Utility Code</th>
                  <th className="py-3 px-4 text-left font-medium">Capacity Factor</th>
                  <th className="py-3 px-4 text-left font-medium">Address</th>
                  <th className="py-3 px-4 text-left font-medium">Zipcode</th>
                  <th className="py-3 px-4 text-left font-medium">Operation Date</th>
                </tr>
              </thead>
              <tbody>
                {currentProviders.map((provider) => (
                  <tr
                    key={provider.id}
                    className="border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => handleProviderClick(provider)}
                  >
                    <td className="py-3 px-4">{provider.id}</td>
                    <td className="py-3 px-4">{provider.name}</td>
                    <td className="py-3 px-4">{provider.utilityId}</td>
                    <td className="py-3 px-4">{provider.utilityCode}</td>
                    <td className="py-3 px-4">{provider.capacityFactor}</td>
                    <td className="py-3 px-4">{provider.address}</td>
                    <td className="py-3 px-4">{provider.zipcode}</td>
                    <td className="py-3 px-4">{provider.operationDate}</td>
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

      {/* Modals */}
      {showFilterModal && (
        <FilterByUtilityModal 
          isOpen={showFilterModal} 
          onClose={() => setShowFilterModal(false)} 
        />
      )}
      
      {showAddUtilityModal && (
        <AddUtilityProviderModal 
          isOpen={showAddUtilityModal} 
          onClose={() => setShowAddUtilityModal(false)} 
        />
      )}
    </div>
  );
}

// UtilityProviderDetails component
function UtilityProviderDetails({ provider, onBack }) {
  return (
    <div className="w-full">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-[#039994] font-medium"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Utility Provider Details
        </button>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="bg-[#1E1E1E] text-white hover:bg-gray-800 flex items-center gap-1"
          >
            <PenLine className="h-4 w-4" />
            Edit Utility Code
          </Button>
          
          <Button variant="outline" className="text-red-500 border-none">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Provider details card */}
      <div className="p-6 rounded-md bg-[#069B960D] border border-[#039994]">
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-gray-600 text-sm">Name</p>
            <p className="font-medium">{provider.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Partner Name</p>
            <p className="font-medium">{provider.partnerName}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Utility ID</p>
            <p className="font-medium">{provider.utilityId}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Utility ID</p>
            <p className="font-medium">{provider.utilityId}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Utility Code</p>
            <p className="font-medium">{provider.utilityCode}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Utility Code</p>
            <p className="font-medium">{provider.utilityCode}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Email Address</p>
            <p className="font-medium">{provider.email}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Phone Number</p>
            <p className="font-medium">{provider.phone}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Address</p>
            <p className="font-medium">{provider.address}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Zipcode</p>
            <p className="font-medium">{provider.zipcode}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Capacity Factor</p>
            <p className="font-medium">{provider.capacityFactor}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Operation Date</p>
            <p className="font-medium">{provider.operationDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal component for filtering
function FilterByUtilityModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-medium mb-4">Filter Utility Providers</h2>
        
        <div className="space-y-4">
          <div>
            <label className={styles.labelClass}>Provider Name</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Utility ID</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Utility Code</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Address</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Operation Date</label>
            <input type="date" className={styles.inputClass} />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#039994] hover:bg-[#02857f] text-white"
              onClick={onClose}
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal component for adding utility provider
function AddUtilityProviderModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-medium mb-4">Add Utility Provider</h2>
        
        <div className="space-y-4">
          <div>
            <label className={styles.labelClass}>Provider Name</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Utility ID</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Utility Code</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Email Address</label>
            <input type="email" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Phone Number</label>
            <input type="tel" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Address</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Zipcode</label>
            <input type="text" className={styles.inputClass} />
          </div>
          
          <div>
            <label className={styles.labelClass}>Capacity Factor</label>
            <input type="text" className={styles.inputClass} placeholder="100%" />
          </div>
          
          <div>
            <label className={styles.labelClass}>Operation Date</label>
            <input type="date" className={styles.inputClass} />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-[#039994] hover:bg-[#02857f] text-white"
              onClick={onClose}
            >
              Add Provider
            </Button>
          </div>
        </div>
      </div>
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
      className="w-4 h-4 text-[#039994]"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}