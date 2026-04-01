"use client";
import CONFIG from '@/lib/config';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  Plus,
  Users,
  ChevronDown,
  Check,
  Download,
  Loader2,
} from "lucide-react";
import { exportToExcel, PARTNER_COLUMNS } from "@/lib/exportUtils";
import PartnerDetails from "./PartnerDetails";
import FilterByModal from "./partnerManagementModal/FilterBy";
import AddPartnerModal from "./partnerManagementModal/AddPartner";
import GetAllInstallers from "./GetAllInstallers";
import UtilityProviderManagement from "../utility-provider-management/UtilityProviderManagement";
import FinanceTypes from "./finance-types/FinanceType";
import UtilityAuthManagement from "../utility-provider-management/UtilityAuthManagement";
import * as styles from "../styles";

export default function PartnerManagement({ onViewChange, onCustomerSelect }) {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [currentView, setCurrentView] = useState("management");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [authsCount, setAuthsCount] = useState(0);
  const [previousAuthsCount, setPreviousAuthsCount] = useState(0);
  const [showAuthsNotification, setShowAuthsNotification] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (currentView === "management") {
      fetchPartners(currentPage, 50);
    }
  }, [currentView, currentPage]);

  useEffect(() => {
    const fetchAuthsCount = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth/utility-auth`, {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.status === "success") {
            const newCount = result.data?.length || 0;
            if (newCount > previousAuthsCount && previousAuthsCount > 0) {
              setShowAuthsNotification(true);
            }
            setAuthsCount(newCount);
            setPreviousAuthsCount(newCount);
          }
        }
      } catch (err) {
        console.error("Error fetching auths count:", err);
      }
    };

    const initializeCounts = async () => {
      await fetchAuthsCount();
    };
    initializeCounts();
    const interval = setInterval(() => {
      fetchAuthsCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [previousAuthsCount]);

  const PARTNER_TYPES = new Set(["PARTNER", "SALES_AGENT", "INSTALLER", "FINANCE_COMPANY"]);

  const fetchPartners = async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('Authentication token not found');

      // Fetch registered/active partners from the partners endpoint
      const [partnersRes, allUsersRes] = await Promise.allSettled([
        axios.get(`${CONFIG.API_BASE_URL}/api/admin/partners?page=${page}&limit=${limit}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        }),
        fetch(`${CONFIG.API_BASE_URL}/api/admin/get-all-users?page=1&limit=200`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }
        })
      ]);

      // Process registered partners
      let registeredPartners = [];
      if (partnersRes.status === "fulfilled" && partnersRes.value.data?.status === "success") {
        registeredPartners = partnersRes.value.data.data.partners.map(p => ({
          ...p,
          displayEmail: p.user?.email || p.email
        }));
      }

      // Process invited/pending partner-type users not yet in the partners table
      let invitedPartners = [];
      if (allUsersRes.status === "fulfilled" && allUsersRes.value.ok) {
        const allUsersData = await allUsersRes.value.json();
        if (allUsersData.data?.users) {
          const registeredEmails = new Set(registeredPartners.map(p => p.displayEmail?.toLowerCase()));
          invitedPartners = allUsersData.data.users
            .filter(u => PARTNER_TYPES.has(u.userType) && !registeredEmails.has(u.email?.toLowerCase()))
            .map(u => ({
              ...u,
              displayEmail: u.email,
              partnerType: u.userType,
              name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
            }));
        }
      }

      const combined = [...registeredPartners, ...invitedPartners];
      setPartners(combined);
      setFilteredPartners(combined);
      setTotalPages(partnersRes.status === "fulfilled" ? partnersRes.value.data?.data?.metadata?.totalPages || 1 : 1);
      setTotalCount(combined.length);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError(err.message || 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    let results = [...partners];

    if (filters.partnerType) {
      results = results.filter(partner =>
        (partner.partnerType || "").toLowerCase() === filters.partnerType.toLowerCase()
      );
    }

    if (filters.status) {
      results = results.filter(partner =>
        (partner.status || "").toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    if (filters.startDate && filters.endDate) {
      results = results.filter(partner => {
        const partnerDate = new Date(partner.createdAt);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return partnerDate >= startDate && partnerDate <= endDate;
      });
    }
    
    setFilteredPartners(results);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handlePartnerClick = (partner) => {
    const enhancedPartner = {
      ...partner,
      email: partner.displayEmail,
      userDetails: partner.user
    };
    setSelectedPartner(enhancedPartner);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedPartner(null);
    setCurrentView("management");
    fetchPartners();
  };

  const handleViewChange = (view) => {
    if (view === "customer-management") {
      if (onViewChange) {
        onViewChange("management");
      }
    } else {
      setCurrentView(view);
    }
    setSelectedPartner(null);
    setShowMainDropdown(false);
  };

  const handleViewInstallers = () => {
    setCurrentView("installers");
  };

  const handleAddPartnerSuccess = () => {
    fetchPartners();
    setShowAddPartnerModal(false);
  };

  const handleExportPartners = async () => {
    try {
      setExporting(true);
      const exportData = partners.map((p) => ({
        name: p.name || "",
        email: p.displayEmail || p.email || "",
        phoneNumber: p.phoneNumber || "",
        partnerType: formatPartnerType(p.partnerType),
        status: p.status || "Active",
        address: p.address || "",
        dateRegistered: p.createdAt
          ? new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          : "",
      }));

      const filename = `DCarbon_Partners_${new Date().toISOString().slice(0, 10)}`;
      exportToExcel(exportData, PARTNER_COLUMNS, filename, "Partners");
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const formatPartnerType = (type) => {
    if (!type) return "N/A";
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const StatusBadge = ({ status }) => {
    let classes = "";
    switch (status) {
      case "Active":
        classes = "bg-teal-500 text-white";
        break;
      case "Invited":
        classes = "bg-amber-400 text-white";
        break;
      case "Registered":
        classes = "bg-black text-white";
        break;
      case "Terminated":
        classes = "bg-red-500 text-white";
        break;
      case "Inactive":
        classes = "bg-gray-400 text-white";
        break;
      default:
        classes = "bg-gray-300 text-black";
    }
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${classes}`}>
        {status}
      </span>
    );
  };

  const NotificationBadge = ({ count, show }) => {
    if (!show || count === 0) return null;
    return (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
        {count > 99 ? '99+' : count}
      </span>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 p-6">
        {currentView === "details" && selectedPartner && (
          <PartnerDetails
            partner={selectedPartner}
            onBack={handleBackToList}
            onCustomerSelect={onCustomerSelect}
          />
        )}

        {currentView === "installers" && (
          <GetAllInstallers onBack={handleBackToList} />
        )}

        {currentView === "utility-management" && (
          <UtilityProviderManagement onViewChange={handleViewChange} />
        )}

        {currentView === "finance-types" && (
          <FinanceTypes onBack={handleBackToList} onViewChange={handleViewChange} />
        )}

        {currentView === "auth-management" && (
          <UtilityAuthManagement onBack={() => handleViewChange("management")} />
        )}
        
        {currentView === "management" && (
          <div>
            <div className="flex justify-between mb-4">
              <Button
                variant="outline"
                className="gap-2 text-sm font-sfpro"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="h-4 w-4" />
                Filter by
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 text-sm font-sfpro"
                  onClick={handleExportPartners}
                  disabled={exporting || partners.length === 0}
                >
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {exporting ? "Exporting..." : "Export"}
                </Button>

                <Button
                  variant="outline"
                  className="gap-2 text-sm font-sfpro border-teal-500 text-teal-600 hover:bg-teal-50"
                  onClick={handleViewInstallers}
                >
                  <Users className="h-4 w-4" />
                  View Installers
                </Button>

                <Button
                  className="gap-2 text-sm font-sfpro text-white bg-[#039994] hover:bg-[#02857f]"
                  onClick={() => setShowAddPartnerModal(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Partner
                </Button>
              </div>
            </div>

            <div className="mb-4 p-3 border-b flex items-center justify-between">
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-base font-semibold text-[#039994] font-sfpro"
                  onClick={() => setShowMainDropdown(!showMainDropdown)}
                >
                  Partner Management
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showMainDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => handleViewChange("customer-management")}
                      >
                        Customer Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 font-semibold text-[#039994]"
                        onClick={() => handleViewChange("management")}
                      >
                        Partner Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => handleViewChange("utility-management")}
                      >
                        Utility Provider Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => handleViewChange("finance-types")}
                      >
                        Finance Types
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 relative"
                        onClick={() => {
                          setShowAuthsNotification(false);
                          handleViewChange("auth-management");
                        }}
                      >
                        Manage Authorizations
                        <NotificationBadge count={authsCount} show={showAuthsNotification} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Info className="h-4 w-4 text-teal-500" />
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className={styles.spinner}></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 text-xs">{error}</div>
            ) : filteredPartners.length === 0 ? (
              <div className="flex justify-center items-center h-48">
                <div className="text-gray-500 text-center text-xs">
                  <p className="font-medium">No partners found</p>
                  <Button
                    className="mt-3 text-sm bg-[#039994] hover:bg-[#02857f] text-white font-sfpro"
                    onClick={() => setShowAddPartnerModal(true)}
                  >
                    Add New Partner
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y text-sm">
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">S/N</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Name</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Partner Type</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Contact No.</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Email</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Address</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Date Registered</th>
                      <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.map((partner, index) => (
                      <tr
                        key={partner.id}
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors duration-100"
                        onClick={() => handlePartnerClick(partner)}
                      >
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{index + 1}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{partner.name}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{formatPartnerType(partner.partnerType)}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{partner.phoneNumber || "N/A"}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{partner.displayEmail || "N/A"}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{partner.address || "N/A"}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{formatDate(partner.createdAt)}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">
                          <StatusBadge status={partner.status || "Active"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && totalCount > 0 && (
              <div className="p-3 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage === 1}
                  onClick={() => {
                    const newPage = Math.max(currentPage - 1, 1);
                    setCurrentPage(newPage);
                    fetchPartners(newPage, 50);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-sfpro">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    const newPage = Math.min(currentPage + 1, totalPages);
                    setCurrentPage(newPage);
                    fetchPartners(newPage, 50);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <FilterByModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={applyFilters}
        currentFilters={activeFilters}
      />
      
      <AddPartnerModal 
        isOpen={showAddPartnerModal} 
        onClose={() => setShowAddPartnerModal(false)}
        onSuccess={handleAddPartnerSuccess}
      />

      {showMainDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMainDropdown(false)}
        />
      )}
    </div>
  );
}