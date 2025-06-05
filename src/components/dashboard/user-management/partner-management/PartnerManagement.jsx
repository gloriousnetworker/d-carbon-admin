"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowLeft,
  Loader,
  ChevronDown,
  Plus,
  Users
} from "lucide-react";
import PartnerDetails from "./PartnerDetails";
import FilterByModal from "./partnerManagementModal/FilterBy";
import AddPartnerModal from "./partnerManagementModal/AddPartner";
import GetAllInstallers from "./GetAllInstallers";
import FinanceTypes from "./finance-types/FinanceType";

export default function PartnerManagement({ onViewChange }) {
  const [partners, setPartners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [currentView, setCurrentView] = useState("table"); // "table", "details", "installers", "finance"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const partnersPerPage = 10;
  const indexOfLast = currentPage * partnersPerPage;
  const indexOfFirst = indexOfLast - partnersPerPage;
  const currentPartners = partners.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(partners.length / partnersPerPage);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get auth token from local storage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get('https://services.dcarbon.solutions/api/admin/partners', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.data && response.data.status === "success") {
        setPartners(response.data.data.partners || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch partners');
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError(err.message || 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

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

  const handleViewInstallers = () => {
    setCurrentView("installers");
  };

  const handleViewFinanceTypes = () => {
    setCurrentView("finance");
  };

  const handleDropdownSelect = (option) => {
    if (option === "customer") {
      handleBackToManagement();
    } else if (option === "finance") {
      handleViewFinanceTypes();
    }
    setShowDropdown(false);
  };

  const handleAddPartnerSuccess = () => {
    // Refresh the partners list after successful addition
    fetchPartners();
    setShowAddPartnerModal(false);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Helper function to format partner type
  const formatPartnerType = (type) => {
    if (!type) return "";
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

        {currentView === "installers" && (
          // Show Partner Installers
          <GetAllInstallers onBack={handleBackToList} />
        )}

        {currentView === "finance" && (
          // Show Finance Types
          <FinanceTypes onBack={handleBackToList} />
        )}
        
        {currentView === "table" && (
          // Show Partner Management Table
          <>
            {/* ===== Header Row ===== */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-3 items-center">
                <Button 
                  variant="outline" 
                  className="gap-2 border-black bg-transparent hover:bg-gray-50"
                  onClick={() => setShowFilterModal(true)}
                >
                  <Filter className="h-4 w-4" />
                  Filter by
                </Button>
                
                {/* Management Type Dropdown */}
                <div className="relative">
                  <Button
                    variant="outline"
                    className="gap-2 border-gray-300"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    Partner Management
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-teal-600 font-medium"
                          onClick={() => handleDropdownSelect("partner")}
                        >
                          Partner Management
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          onClick={() => handleDropdownSelect("customer")}
                        >
                          Customer Management
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                          onClick={() => handleDropdownSelect("finance")}
                        >
                          Finance Types
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Partner Installers Button */}
                <Button
                  variant="outline"
                  className="gap-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                  onClick={handleViewInstallers}
                >
                  <Users className="h-4 w-4" />
                  View Partner Installers
                </Button>
              </div>

              {/* New Partner Button */}
              <Button
                className="gap-2 text-white"
                style={{ backgroundColor: '#039994' }}
                onClick={() => setShowAddPartnerModal(true)}
              >
                <Plus className="h-4 w-4" />
                New Partner
              </Button>
            </div>

            {/* ===== Title ===== */}
            <div className="mb-6 p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-1 text-xl font-medium text-teal-500">
                Partner Management
              </div>
              <InfoIcon />
            </div>

            {/* ===== Loading and Error States ===== */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="h-8 w-8 text-teal-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-red-500 text-center">
                  <p className="font-medium">Error loading partners</p>
                  <p className="text-sm">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={fetchPartners}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : partners.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500 text-center">
                  <p className="font-medium">No partners found</p>
                </div>
              </div>
            ) : (
              /* ===== Partner Table ===== */
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
                    {currentPartners.map((partner, index) => (
                      <tr
                        key={partner.id}
                        className="border-b cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePartnerClick(partner)}
                      >
                        <td className="py-3 px-4">{indexOfFirst + index + 1}</td>
                        <td className="py-3 px-4">{partner.name}</td>
                        <td className="py-3 px-4">{formatPartnerType(partner.partnerType)}</td>
                        <td className="py-3 px-4">{partner.phoneNumber}</td>
                        <td className="py-3 px-4">{partner.email}</td>
                        <td className="py-3 px-4">{partner.address}</td>
                        <td className="py-3 px-4">{formatDate(partner.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ===== Pagination (only show if we have partners and not loading) ===== */}
            {!loading && !error && partners.length > 0 && (
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
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <FilterByModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)} 
      />
      
      <AddPartnerModal 
        isOpen={showAddPartnerModal} 
        onClose={() => setShowAddPartnerModal(false)}
        onSuccess={handleAddPartnerSuccess}
      />

      {/* Dropdown overlay */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
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