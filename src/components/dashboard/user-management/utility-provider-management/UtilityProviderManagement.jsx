"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Filter, ChevronLeft, ChevronRight, ChevronDown, Plus, Loader2, Mail, Check, Info } from "lucide-react";
import UtilityProviderDetails from "./UtilityProviderDetails";
import UtilityAuthManagement from "./UtilityAuthManagement";
import UtilityProviderRequests from "./UtilityProviderRequests";
import FilterByUtilityModal from "./modals/FilterByUtilityModal";
import AddUtilityProviderModal from "./modals/AddUtilityProviderModal";
import * as styles from "./styles";

export default function UtilityProviderManagement({ onViewChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showAuthManagement, setShowAuthManagement] = useState(false);
  const [currentView, setCurrentView] = useState("list");
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({
    name: "",
    id: "",
    website: "",
    createdAt: "",
  });
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [requestsCount, setRequestsCount] = useState(0);
  const [authsCount, setAuthsCount] = useState(0);
  const [previousRequestsCount, setPreviousRequestsCount] = useState(0);
  const [previousAuthsCount, setPreviousAuthsCount] = useState(0);
  const [showRequestsNotification, setShowRequestsNotification] = useState(false);
  const [showAuthsNotification, setShowAuthsNotification] = useState(false);

  const providersPerPage = 10;
  const indexOfLast = currentPage * providersPerPage;
  const indexOfFirst = indexOfLast - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  const fetchRequestsCount = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;
      const response = await fetch("https://services.dcarbon.solutions/api/admin/utility-provider-requests", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.status === "success") {
          const newCount = result.data?.requests?.length || 0;
          if (newCount > previousRequestsCount && previousRequestsCount > 0) {
            setShowRequestsNotification(true);
          }
          setRequestsCount(newCount);
          setPreviousRequestsCount(newCount);
        }
      }
    } catch (err) {
      console.error("Error fetching requests count:", err);
    }
  };

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

  useEffect(() => {
    const initializeCounts = async () => {
      await fetchRequestsCount();
      await fetchAuthsCount();
    };
    initializeCounts();
    const interval = setInterval(() => {
      fetchRequestsCount();
      fetchAuthsCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [previousRequestsCount, previousAuthsCount]);

  useEffect(() => {
    const fetchUtilityProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) throw new Error("Authentication token not found");
        const response = await fetch("https://services.dcarbon.solutions/api/admin/utility-providers", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) throw new Error(`Error fetching utility providers: ${response.statusText}`);
        const result = await response.json();
        if (result.status === "success") {
          setUtilityProviders(result.data.utilityProviders || []);
          setFilteredProviders(result.data.utilityProviders || []);
        } else {
          throw new Error(result.message || "Failed to fetch utility providers");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching utility providers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUtilityProviders();
  }, []);

  const applyFilters = () => {
    let filtered = [...utilityProviders];
    if (filterValues.name) {
      filtered = filtered.filter(provider => 
        provider.name?.toLowerCase().includes(filterValues.name.toLowerCase())
      );
    }
    if (filterValues.id) {
      filtered = filtered.filter(provider => 
        provider.id?.toLowerCase().includes(filterValues.id.toLowerCase())
      );
    }
    if (filterValues.website) {
      filtered = filtered.filter(provider => 
        provider.website?.toLowerCase().includes(filterValues.website.toLowerCase())
      );
    }
    if (filterValues.createdAt) {
      const filterDate = new Date(filterValues.createdAt).setHours(0, 0, 0, 0);
      filtered = filtered.filter(provider => {
        const providerDate = new Date(provider.createdAt).setHours(0, 0, 0, 0);
        return providerDate === filterDate;
      });
    }
    setFilteredProviders(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters();
  }, [filterValues, utilityProviders]);

  const clearFilters = () => {
    setFilterValues({
      name: "",
      id: "",
      website: "",
      createdAt: "",
    });
  };

  const handleProviderClick = (provider) => {
    setSelectedProvider(provider);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedProvider(null);
    setCurrentView("list");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateProvider = async (formData) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      const response = await fetch("https://services.dcarbon.solutions/api/admin/utility-providers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          website: formData.website,
          documentation: formData.documentation
        })
      });
      if (!response.ok) throw new Error(`Error creating utility provider: ${response.statusText}`);
      const result = await response.json();
      if (result.status === "success") {
        const fetchResponse = await fetch("https://services.dcarbon.solutions/api/admin/utility-providers", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });
        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          setUtilityProviders(fetchResult.data.utilityProviders || []);
          setFilteredProviders(fetchResult.data.utilityProviders || []);
        }
      } else {
        throw new Error(result.message || "Failed to create utility provider");
      }
    } catch (err) {
      console.error("Error creating utility provider:", err);
    }
  };

  const handleViewRequests = () => {
    setShowRequests(true);
    setShowRequestsNotification(false);
  };

  const handleBackFromRequests = () => {
    setShowRequests(false);
    fetchRequestsCount();
    fetchAuthsCount();
  };

  const handleViewAuthManagement = () => {
    setShowAuthManagement(true);
    setShowAuthsNotification(false);
  };

  const handleBackFromAuthManagement = () => {
    setShowAuthManagement(false);
    fetchRequestsCount();
    fetchAuthsCount();
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
      {currentView === "details" && selectedProvider && (
        <UtilityProviderDetails provider={selectedProvider} onBack={handleBackToList} />
      )}
      
      {showAuthManagement ? (
        <UtilityAuthManagement onBack={handleBackFromAuthManagement} />
      ) : showRequests ? (
        <UtilityProviderRequests onBack={handleBackFromRequests} />
      ) : currentView === "list" && (
        <>
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
              
              <div className="relative">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleViewRequests}
                >
                  <Mail className="h-4 w-4" />
                  View Requests
                  <NotificationBadge count={requestsCount} show={showRequestsNotification} />
                </Button>
              </div>

              <div className="relative">
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleViewAuthManagement}
                >
                  <Check className="h-4 w-4" />
                  Manage Authorizations
                  <NotificationBadge count={authsCount} show={showAuthsNotification} />
                </Button>
              </div>
            </div>

            <Button
              className="gap-2 bg-[#039994] text-white hover:bg-[#02857f]"
              onClick={() => setShowAddUtilityModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add Utility Provider
            </Button>
          </div>

          <div className="mb-6 p-4 border-b flex items-center justify-between bg-white">
            <div className="relative">
              <button
                className={`flex items-center gap-1 text-xl font-medium text-[#039994] ${styles.pageTitle.replace('mb-4', '').replace('text-center', '')}`}
                onClick={() => setShowMainDropdown(!showMainDropdown)}
              >
                Utility Provider Management
                <ChevronDown className="h-5 w-5" />
              </button>

              {showMainDropdown && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <button
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${styles.labelClass}`}
                      onClick={() => onViewChange("management")}
                    >
                      Customer Management
                    </button>
                    <button
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 font-medium text-[#039994]`}
                    >
                      Utility Provider Management
                    </button>
                    <button
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${styles.labelClass}`}
                      onClick={() => onViewChange("partner-management")}
                    >
                      Partner Management
                    </button>
                    <button
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${styles.labelClass}`}
                      onClick={() => onViewChange("finance-types")}
                    >
                      Finance Types
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Info className="h-4 w-4 text-teal-500" />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className={styles.spinner}></div>
              <span className={`ml-3 text-lg text-gray-600 ${styles.labelClass}`}>Loading utility providers...</span>
            </div>
          )}

          {error && (
            <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-md text-center">
              <p className={`text-red-600 ${styles.labelClass}`}>{error}</p>
              <Button 
                className={`mt-4 bg-red-600 hover:bg-red-700 text-white ${styles.buttonPrimary}`}
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredProviders.length === 0 && (
            <div className="py-12 text-center">
              <p className={`text-gray-500 text-lg mb-4 ${styles.labelClass}`}>No utility providers found</p>
              {Object.values(filterValues).some(v => v !== "") && (
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredProviders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">S/N</th>
                    <th className="py-3 px-4 text-left font-medium">Utility Provider</th>
                    <th className="py-3 px-4 text-left font-medium">Utility ID</th>
                    <th className="py-3 px-4 text-left font-medium">Website</th>
                    <th className="py-3 px-4 text-left font-medium">Documentation</th>
                    <th className="py-3 px-4 text-left font-medium">Created Date</th>
                    <th className="py-3 px-4 text-left font-medium">Updated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProviders.map((provider, index) => (
                    <tr
                      key={provider.id}
                      className="border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => handleProviderClick(provider)}
                    >
                      <td className="py-3 px-4">{indexOfFirst + index + 1}</td>
                      <td className="py-3 px-4">{provider.name || "N/A"}</td>
                      <td className="py-3 px-4">{provider.id || "N/A"}</td>
                      <td className="py-3 px-4">
                        {provider.website ? (
                          <a
                            href={provider.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {provider.website}
                          </a>
                        ) : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {provider.documentation ? (
                          <a
                            href={provider.documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Docs
                          </a>
                        ) : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {provider.createdAt ? new Date(provider.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {provider.updatedAt ? new Date(provider.updatedAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && filteredProviders.length > 0 && (
            <div className="p-4 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className={`text-sm ${styles.labelClass}`}>
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

      {showFilterModal && (
        <FilterByUtilityModal 
          isOpen={showFilterModal} 
          onClose={() => setShowFilterModal(false)}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onApply={applyFilters}
          onClear={clearFilters}
        />
      )}
      
      {showAddUtilityModal && (
        <AddUtilityProviderModal 
          isOpen={showAddUtilityModal} 
          onClose={() => setShowAddUtilityModal(false)}
          onCreate={handleCreateProvider}
        />
      )}

      {showMainDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMainDropdown(false)}
        />
      )}
    </div>
  );
}