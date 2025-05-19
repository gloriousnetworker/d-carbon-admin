"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Filter,
  PenLine,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

// Styles for form elements
const styles = {
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#039994] focus:border-[#039994]",
};

export default function UtilityProviderManagement({ onViewChange }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddUtilityModal, setShowAddUtilityModal] = useState(false);
  const [currentView, setCurrentView] = useState("list"); // "list" or "details"
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
  
  const providersPerPage = 10;
  const indexOfLast = currentPage * providersPerPage;
  const indexOfFirst = indexOfLast - providersPerPage;
  const currentProviders = filteredProviders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProviders.length / providersPerPage);

  // Fetch utility providers from API
  useEffect(() => {
    const fetchUtilityProviders = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get auth token from local storage
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          throw new Error("Authentication token not found");
        }
        
        const response = await fetch("https://services.dcarbon.solutions/api/admin/utility-providers", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching utility providers: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.status === "success") {
          setUtilityProviders(result.data.utilityProviders);
          setFilteredProviders(result.data.utilityProviders);
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

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [filterValues, utilityProviders]);

  const applyFilters = () => {
    let filtered = [...utilityProviders];
    
    // Filter by name
    if (filterValues.name) {
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(filterValues.name.toLowerCase())
      );
    }
    
    // Filter by ID
    if (filterValues.id) {
      filtered = filtered.filter(provider => 
        provider.id.toLowerCase().includes(filterValues.id.toLowerCase())
      );
    }
    
    // Filter by website
    if (filterValues.website) {
      filtered = filtered.filter(provider => 
        provider.website.toLowerCase().includes(filterValues.website.toLowerCase())
      );
    }
    
    // Filter by creation date
    if (filterValues.createdAt) {
      const filterDate = new Date(filterValues.createdAt).setHours(0, 0, 0, 0);
      filtered = filtered.filter(provider => {
        const providerDate = new Date(provider.createdAt).setHours(0, 0, 0, 0);
        return providerDate === filterDate;
      });
    }
    
    setFilteredProviders(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

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

          {/* ===== Loading state ===== */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
              <span className="ml-3 text-lg text-gray-600">Loading utility providers...</span>
            </div>
          )}

          {/* ===== Error state ===== */}
          {error && (
            <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-md text-center">
              <p className="text-red-600">{error}</p>
              <Button 
                className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          )}

          {/* ===== Empty state ===== */}
          {!isLoading && !error && filteredProviders.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-lg mb-4">No utility providers found</p>
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

          {/* ===== Utility Provider Table ===== */}
          {!isLoading && !error && filteredProviders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y">
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
                      <td className="py-3 px-4">{provider.name}</td>
                      <td className="py-3 px-4">{provider.id}</td>
                      <td className="py-3 px-4">
                        <a 
                          href={provider.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {provider.website}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <a 
                          href={provider.documentation} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Docs
                        </a>
                      </td>
                      <td className="py-3 px-4">{new Date(provider.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{new Date(provider.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ===== Pagination ===== */}
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

      {/* Modals */}
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
            Edit Utility Provider
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
            <p className="text-gray-600 text-sm">Utility ID</p>
            <p className="font-medium">{provider.id}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Website</p>
            <a 
              href={provider.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              {provider.website}
            </a>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Documentation</p>
            <a 
              href={provider.documentation} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:underline"
            >
              View Documentation
            </a>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Created Date</p>
            <p className="font-medium">{new Date(provider.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Updated Date</p>
            <p className="font-medium">{new Date(provider.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal component for filtering - improved with working filters
function FilterByUtilityModal({ isOpen, onClose, filterValues, onFilterChange, onApply, onClear }) {
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onApply();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-medium mb-4">Filter Utility Providers</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={styles.labelClass}>Provider Name</label>
            <input 
              type="text" 
              name="name"
              value={filterValues.name}
              onChange={onFilterChange}
              className={styles.inputClass} 
            />
          </div>
          
          <div>
            <label className={styles.labelClass}>Utility ID</label>
            <input 
              type="text" 
              name="id"
              value={filterValues.id}
              onChange={onFilterChange}
              className={styles.inputClass} 
            />
          </div>
          
          <div>
            <label className={styles.labelClass}>Website</label>
            <input 
              type="text" 
              name="website"
              value={filterValues.website}
              onChange={onFilterChange}
              className={styles.inputClass} 
            />
          </div>
          
          <div>
            <label className={styles.labelClass}>Created Date</label>
            <input 
              type="date" 
              name="createdAt"
              value={filterValues.createdAt}
              onChange={onFilterChange}
              className={styles.inputClass} 
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              Clear Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#039994] hover:bg-[#02857f] text-white"
            >
              Apply Filter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal component for adding utility provider - improved sizing and layout
function AddUtilityProviderModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    website: "",
    documentation: ""
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would add the API call to create a new utility provider
    console.log("Form submitted:", formData);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl my-8">
        <h2 className="text-xl font-medium mb-4">Add Utility Provider</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={styles.labelClass}>Provider Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.inputClass} 
              required
            />
          </div>
          
          <div>
            <label className={styles.labelClass}>Utility ID</label>
            <input 
              type="text" 
              name="id"
              value={formData.id}
              onChange={handleChange}
              className={styles.inputClass} 
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className={styles.labelClass}>Website</label>
            <input 
              type="url" 
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className={styles.labelClass}>Documentation URL</label>
            <input 
              type="url" 
              name="documentation"
              value={formData.documentation}
              onChange={handleChange}
              className={styles.inputClass}
              placeholder="https://docs.example.com"
              required
            />
          </div>
          
          <div className="md:col-span-2 flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#039994] hover:bg-[#02857f] text-white"
            >
              Add Provider
            </Button>
          </div>
        </form>
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