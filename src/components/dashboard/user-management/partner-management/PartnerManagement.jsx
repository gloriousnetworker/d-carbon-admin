"use client";

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
} from "lucide-react";
import PartnerDetails from "./PartnerDetails";
import FilterByModal from "./partnerManagementModal/FilterBy";
import AddPartnerModal from "./partnerManagementModal/AddPartner";
import GetAllInstallers from "./GetAllInstallers";
import UtilityProviderManagement from "../utility-provider-management/UtilityProviderManagement";
import FinanceTypes from "./finance-types/FinanceType";
import UtilityAuthManagement from "../utility-provider-management/UtilityAuthManagement";
import * as styles from "../styles";

export default function PartnerManagement({ onViewChange }) {
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
        const response = await fetch("https://services.dcarbon.solutions/api/auth/utility-auth", {
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

  const fetchPartners = async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      setError(null);
      
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`https://services.dcarbon.solutions/api/admin/partners?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.data && response.data.status === "success") {
        const processedPartners = response.data.data.partners.map(partner => ({
          ...partner,
          displayEmail: partner.user?.email || partner.email
        }));
        setPartners(processedPartners || []);
        setFilteredPartners(processedPartners || []);
        setTotalPages(response.data.data.metadata?.totalPages || 1);
        setTotalCount(response.data.data.metadata?.total || 0);
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

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    let results = [...partners];
    
    if (filters.partnerType) {
      results = results.filter(partner => 
        partner.partnerType.toLowerCase() === filters.partnerType.toLowerCase()
      );
    }
    
    if (filters.status) {
      results = results.filter(partner => 
        partner.status.toLowerCase() === filters.status.toLowerCase()
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
      <span className={`inline-block px-2 py-1 rounded-full text-[11px] ${classes}`}>
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
      <div className="flex-1 overflow-hidden p-8">
        {currentView === "details" && selectedPartner && (
          <PartnerDetails 
            partner={selectedPartner} 
            onBack={handleBackToList} 
          />
        )}

        {currentView === "installers" && (
          <GetAllInstallers onBack={handleBackToList} />
        )}

        {currentView === "utility-management" && (
          <UtilityProviderManagement onViewChange={handleViewChange} />
        )}

        {currentView === "finance" && (
          <FinanceTypes onBack={handleBackToList} />
        )}

        {currentView === "auth-management" && (
          <UtilityAuthManagement onBack={() => handleViewChange("management")} />
        )}
        
        {currentView === "management" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between mb-4">
              <Button 
                variant="outline" 
                className="gap-2 text-xs"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="h-3 w-3" />
                Filter by
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 text-xs border-teal-500 text-teal-600 hover:bg-teal-50"
                  onClick={handleViewInstallers}
                >
                  <Users className="h-3 w-3" />
                  View Installers
                </Button>

                <Button
                  className="gap-2 text-xs text-white bg-[#039994] hover:bg-[#027f7f]"
                  onClick={() => setShowAddPartnerModal(true)}
                >
                  <Plus className="h-3 w-3" />
                  New Partner
                </Button>
              </div>
            </div>

            <div className="mb-4 p-3 border-b flex items-center justify-between">
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-[#039994]"
                  onClick={() => setShowMainDropdown(!showMainDropdown)}
                >
                  Partner Management
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showMainDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                        onClick={() => handleViewChange("customer-management")}
                      >
                        Customer Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 font-medium text-[#039994]"
                        onClick={() => handleViewChange("management")}
                      >
                        Partner Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                        onClick={() => handleViewChange("utility-management")}
                      >
                        Utility Provider Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                        onClick={() => handleViewChange("finance")}
                      >
                        Finance Types
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 relative"
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

              <Info className="h-3 w-3 text-teal-500" />
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
                    className="mt-3 text-xs"
                    style={{ backgroundColor: '#039994' }}
                    onClick={() => setShowAddPartnerModal(true)}
                  >
                    Add New Partner
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left font-medium">S/N</th>
                      <th className="py-2 px-3 text-left font-medium">NAME</th>
                      <th className="py-2 px-3 text-left font-medium">PARTNER TYPE</th>
                      <th className="py-2 px-3 text-left font-medium">CONTACT NO.</th>
                      <th className="py-2 px-3 text-left font-medium">EMAIL</th>
                      <th className="py-2 px-3 text-left font-medium">ADDRESS</th>
                      <th className="py-2 px-3 text-left font-medium">DATE REG.</th>
                      <th className="py-2 px-3 text-left font-medium">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPartners.map((partner, index) => (
                      <tr
                        key={partner.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handlePartnerClick(partner)}
                      >
                        <td className="py-2 px-3">{index + 1}</td>
                        <td className="py-2 px-3">{partner.name}</td>
                        <td className="py-2 px-3">{formatPartnerType(partner.partnerType)}</td>
                        <td className="py-2 px-3">{partner.phoneNumber || "N/A"}</td>
                        <td className="py-2 px-3">{partner.displayEmail || "N/A"}</td>
                        <td className="py-2 px-3">{partner.address || "N/A"}</td>
                        <td className="py-2 px-3">{formatDate(partner.createdAt)}</td>
                        <td className="py-2 px-3">
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
                    setCurrentPage((p) => Math.max(p - 1, 1));
                    fetchPartners(currentPage - 1, 50);
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                    fetchPartners(currentPage + 1, 50);
                  }}
                >
                  <ChevronRight className="h-3 w-3" />
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