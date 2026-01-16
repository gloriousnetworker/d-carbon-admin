"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Trash2, RefreshCw, Key, CheckCircle, XCircle, Search, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import InstapullAuthorizationModal from "./InstapullAuthorizationModal";

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10',
  pageTitle: 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center',
  progressContainer: 'w-full max-w-md flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-2/3 rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  formWrapper: 'w-full max-w-md space-y-6',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]',
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  fileInputWrapper: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  rowWrapper: 'flex space-x-4',
  halfWidth: 'w-1/2',
  grayPlaceholder: 'bg-[#E8E8E8]',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  termsTextContainer: 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]',
  uploadHeading: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  uploadFieldWrapper: 'flex items-center space-x-3',
  uploadInputLabel: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  uploadIconContainer: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
  uploadButtonStyle: 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  uploadNoteStyle: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.03em] font-[300] italic text-[#1E1E1E]'
};

export default function UtilityAuthManagement({ onBack }) {
  const [auths, setAuths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reinitiatingId, setReinitiatingId] = useState(null);
  const [showInstapullModal, setShowInstapullModal] = useState(false);
  const [selectedAuth, setSelectedAuth] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1
  });
  const [instapullOpened, setInstapullOpened] = useState(false);
  const [meterStatuses, setMeterStatuses] = useState({});
  const [loadingMeters, setLoadingMeters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [filters, setFilters] = useState({
    id: '',
    userId: '',
    email: '',
    utilityType: '',
    userType: '',
    status: '',
    limit: ''
  });
  const [activeFilters, setActiveFilters] = useState([]);

  const fetchUtilityProviders = async () => {
    setLoadingProviders(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const response = await fetch(
        "https://services.dcarbon.solutions/api/auth/utility-providers",
        {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      if (!response.ok) throw new Error(`Error fetching utility providers: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === 'success') {
        setUtilityProviders(result.data || []);
      } else {
        throw new Error(result.message || "Failed to fetch utility providers");
      }
    } catch (err) {
      console.error("Error fetching utility providers:", err);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchUtilityProviders();
  }, []);

  const buildQueryString = (page = 1) => {
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.set('page', page);
    if (filters.id) queryParams.set('id', filters.id);
    if (filters.userId) queryParams.set('userId', filters.userId);
    if (filters.email) queryParams.set('email', filters.email);
    if (filters.utilityType) queryParams.set('utilityType', filters.utilityType);
    if (filters.userType) queryParams.set('userType', filters.userType);
    if (filters.status) queryParams.set('status', filters.status);
    
    const limitValue = filters.limit || pagination.limit;
    queryParams.set('limit', limitValue);
    
    return queryParams.toString();
  };

  const fetchAuths = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const queryString = buildQueryString(page);
      const response = await fetch(
        `https://services.dcarbon.solutions/api/utility-auth/list?${queryString}`,
        {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      if (!response.ok) throw new Error(`Error fetching utility authorizations: ${response.statusText}`);
      
      const result = await response.json();
      if (result.message === "Authorization list fetched successfully") {
        setAuths(result.data || []);
        setPagination(result.pagination || {
          page: page,
          limit: filters.limit ? parseInt(filters.limit) : 20,
          total: result.data?.length || 0,
          totalPages: 1
        });
        
        result.data.forEach(auth => {
          if (auth.userId && auth.status === 'completed') {
            checkUserMeters(auth.userId);
          }
        });
        
        const newActiveFilters = [];
        if (filters.id) newActiveFilters.push({ key: 'id', label: 'ID', value: filters.id });
        if (filters.userId) newActiveFilters.push({ key: 'userId', label: 'User ID', value: filters.userId });
        if (filters.email) newActiveFilters.push({ key: 'email', label: 'Email', value: filters.email });
        if (filters.utilityType) newActiveFilters.push({ key: 'utilityType', label: 'Utility Type', value: filters.utilityType });
        if (filters.userType) newActiveFilters.push({ key: 'userType', label: 'User Type', value: filters.userType });
        if (filters.status) newActiveFilters.push({ key: 'status', label: 'Status', value: filters.status });
        if (filters.limit) newActiveFilters.push({ key: 'limit', label: 'Limit', value: filters.limit });
        setActiveFilters(newActiveFilters);
        
        toast.success(`Loaded ${result.data.length} authorizations`);
      } else {
        throw new Error(result.message || "Failed to fetch utility authorizations");
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Failed to load: ${err.message}`);
      console.error("Error fetching utility authorizations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserMeters = async (userId) => {
    if (!userId || meterStatuses[userId] !== undefined) return;
    
    setLoadingMeters(prev => ({ ...prev, [userId]: true }));
    
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/user-meters/${userId}`,
        {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success' && result.data && result.data.length > 0) {
          const hasMeters = result.data.some(authData => 
            authData.meters && authData.meters.length > 0 && 
            authData.meters.some(meter => meter.uid && meter.meterNumbers && meter.meterNumbers.length > 0)
          );
          
          setMeterStatuses(prev => ({
            ...prev,
            [userId]: hasMeters ? 'fetched' : 'pending'
          }));
        } else {
          setMeterStatuses(prev => ({
            ...prev,
            [userId]: 'pending'
          }));
        }
      } else {
        setMeterStatuses(prev => ({
          ...prev,
          [userId]: 'error'
        }));
      }
    } catch (err) {
      setMeterStatuses(prev => ({
        ...prev,
        [userId]: 'error'
      }));
    } finally {
      setLoadingMeters(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  useEffect(() => {
    fetchAuths();
  }, []);

  const handleDeleteAuth = async (authId) => {
    if (!confirm("Are you sure you want to delete this authorization?")) {
      return;
    }
    
    try {
      setDeletingId(authId);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      toast.loading("Deleting authorization...");
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/utility-auth/delete/${authId}`,
        {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      if (!response.ok) throw new Error(`Error deleting utility authorization: ${response.statusText}`);
      
      const result = await response.json();
      if (result.message === "Record deleted successfully") {
        toast.dismiss();
        toast.success("Utility authorization deleted successfully");
        setAuths(prev => prev.filter(auth => auth.id !== authId));
      } else {
        throw new Error(result.message || "Failed to delete utility authorization");
      }
    } catch (err) {
      toast.dismiss();
      toast.error(err.message);
      console.error("Error deleting utility authorization:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const openInstapullTab = () => {
    const newTab = window.open('https://main.instapull.io/authorize/dcarbonsolutions/', '_blank');
    if (newTab) {
      setInstapullOpened(true);
      toast.success("Instapull opened in new tab. Complete authorization there, then return here to submit details.");
    } else {
      toast.error("Please allow pop-ups for this site to open Instapull");
    }
  };

  const handleReinitiateAuth = (auth) => {
    setReinitiatingId(auth.id);
    setSelectedAuth(auth);
    openInstapullTab();
    setShowInstapullModal(true);
  };

  const handleCloseInstapullModal = () => {
    setShowInstapullModal(false);
    setSelectedAuth(null);
    setReinitiatingId(null);
    setInstapullOpened(false);
    fetchAuths(pagination.page);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAuths(newPage);
    }
  };

  const getMeterStatusBadge = (auth) => {
    if (!auth.userId) return null;
    
    const status = meterStatuses[auth.userId];
    const isLoading = loadingMeters[auth.userId];
    
    if (isLoading) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-sfpro font-[500] bg-gray-100 text-gray-800">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Checking
        </span>
      );
    }
    
    if (status === 'fetched') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-sfpro font-[500] bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Meters Fetched
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-sfpro font-[500] bg-yellow-100 text-yellow-800">
          <XCircle className="h-3 w-3 mr-1" />
          No Meters
        </span>
      );
    } else if (status === 'error') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-sfpro font-[500] bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Error
        </span>
      );
    }
    
    if (auth.status === 'completed' && auth.userId) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-sfpro font-[500] bg-blue-100 text-blue-800">
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
          Checking...
        </span>
      );
    }
    
    return null;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchAuths(1);
  };

  const handleClearFilters = () => {
    setFilters({
      id: '',
      userId: '',
      email: '',
      utilityType: '',
      userType: '',
      status: '',
      limit: ''
    });
    setActiveFilters([]);
    fetchAuths(1);
  };

  const removeActiveFilter = (key) => {
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    
    const newActiveFilters = activeFilters.filter(filter => filter.key !== key);
    setActiveFilters(newActiveFilters);
    
    fetchAuths(1);
  };

  return (
    <div className="w-full">
      {showInstapullModal && selectedAuth && (
        <InstapullAuthorizationModal
          isOpen={showInstapullModal}
          onClose={handleCloseInstapullModal}
          utilityProvider={selectedAuth.utilityType}
          instapullOpened={instapullOpened}
          openInstapullTab={openInstapullTab}
          userId={selectedAuth.userId}
          authorizationData={selectedAuth}
          isAdminReinitiate={true}
        />
      )}

      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center text-[#039994] font-medium hover:text-[#02857f] transition-colors">
          <ChevronLeft className="h-6 w-6 mr-2" />
          <span className="text-lg font-sfpro font-[500]">Back</span>
        </button>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              const newAuth = {
                email: "",
                userType: "COMMERCIAL",
                utilityType: "",
                authorizationEmail: "",
                userId: null
              };
              setSelectedAuth(newAuth);
              openInstapullTab();
              setShowInstapullModal(true);
            }}
            className="flex items-center gap-2 bg-[#039994] hover:bg-[#02857f] text-white font-sfpro font-[500]"
          >
            <Key className="h-4 w-4" />
            New Authorization
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 border-[#039994] text-[#039994] hover:bg-[#039994] hover:text-white font-sfpro font-[500] transition-colors"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fetchAuths(pagination.page)}
            className="flex items-center gap-2 border-[#039994] text-[#039994] hover:bg-[#039994] hover:text-white font-sfpro font-[500] transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <h1 className={styles.pageTitle}>Utility Authorization Management</h1>
        <p className="text-gray-600 text-center font-sfpro text-sm mb-2">
          Admin panel for managing user utility authorizations
        </p>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-sfpro font-[600] text-[#039994]">Filter Authorizations</h2>
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-sfpro font-[500]"
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className={styles.labelClass}>Authorization ID</label>
              <input
                type="text"
                value={filters.id}
                onChange={(e) => handleFilterChange('id', e.target.value)}
                placeholder="Enter authorization ID"
                className={styles.inputClass}
              />
            </div>
            
            <div>
              <label className={styles.labelClass}>User ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                placeholder="Enter user ID"
                className={styles.inputClass}
              />
            </div>
            
            <div>
              <label className={styles.labelClass}>Email</label>
              <input
                type="email"
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                placeholder="Enter email"
                className={styles.inputClass}
              />
            </div>
            
            <div>
              <label className={styles.labelClass}>Utility Type</label>
              <div className="relative">
                <select
                  value={filters.utilityType}
                  onChange={(e) => handleFilterChange('utilityType', e.target.value)}
                  className={styles.selectClass}
                >
                  <option value="">Select or type</option>
                  {loadingProviders ? (
                    <option disabled>Loading providers...</option>
                  ) : (
                    utilityProviders.map(provider => (
                      <option key={provider.id} value={provider.name}>
                        {provider.name}
                      </option>
                    ))
                  )}
                </select>
                {filters.utilityType && (
                  <input
                    type="text"
                    value={filters.utilityType}
                    onChange={(e) => handleFilterChange('utilityType', e.target.value)}
                    placeholder="Or type utility provider"
                    className={`${styles.inputClass} mt-2`}
                  />
                )}
              </div>
            </div>
            
            <div>
              <label className={styles.labelClass}>User Type</label>
              <select
                value={filters.userType}
                onChange={(e) => handleFilterChange('userType', e.target.value)}
                className={styles.selectClass}
              >
                <option value="">All Types</option>
                <option value="RESIDENTIAL">RESIDENTIAL</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
              </select>
            </div>
            
            <div>
              <label className={styles.labelClass}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={styles.selectClass}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="duplicate">Duplicate</option>
              </select>
            </div>
            
            <div>
              <label className={styles.labelClass}>Records Limit</label>
              <input
                type="number"
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                placeholder="Leave empty for no limit"
                className={styles.inputClass}
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">Empty = all records, 0 = default (20)</p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowFilters(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-sfpro font-[500]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApplyFilters}
              className="bg-[#039994] hover:bg-[#02857f] text-white font-sfpro font-[500] flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {activeFilters.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-blue-800 font-sfpro font-[500]">Active Filters ({activeFilters.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span 
                key={filter.key}
                className="inline-flex items-center bg-white border border-blue-200 rounded-full px-3 py-1 text-sm font-sfpro text-blue-800"
              >
                <span className="font-[600] mr-1">{filter.label}:</span> {filter.value}
                <button 
                  onClick={() => removeActiveFilter(filter.key)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Loader2 className="h-12 w-12 animate-spin text-[#039994]" />
          <span className="ml-3 text-lg text-gray-600 font-sfpro mt-4">Loading utility authorizations...</span>
        </div>
      )}

      {error && (
        <div className="py-8 px-6 bg-red-50 border border-red-200 rounded-xl text-center max-w-2xl mx-auto">
          <p className="text-red-600 font-sfpro text-lg mb-4">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-sfpro font-[500] px-6 py-2 rounded-lg"
            onClick={() => fetchAuths(pagination.page)}
          >
            Retry Loading
          </Button>
        </div>
      )}

      {!isLoading && !error && auths.length === 0 && (
        <div className="py-16 text-center bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-gray-400 mb-4">
            <Key className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg font-sfpro mb-6">No utility authorizations found</p>
          {activeFilters.length > 0 ? (
            <Button 
              onClick={handleClearFilters}
              className="bg-[#039994] hover:bg-[#02857f] text-white font-sfpro font-[500]"
            >
              Clear Filters
            </Button>
          ) : (
            <Button 
              onClick={() => {
                const newAuth = {
                  email: "",
                  userType: "COMMERCIAL",
                  utilityType: "",
                  authorizationEmail: "",
                  userId: null
                };
                setSelectedAuth(newAuth);
                openInstapullTab();
                setShowInstapullModal(true);
              }}
              className="bg-[#039994] hover:bg-[#02857f] text-white font-sfpro font-[500]"
            >
              <Key className="h-4 w-4 mr-2" />
              Create New Authorization
            </Button>
          )}
        </div>
      )}

      {!isLoading && !error && auths.length > 0 && (
        <>
          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <div className="bg-gradient-to-r from-[#039994] to-[#02857f] px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-sfpro font-[600] text-lg">
                  Authorization Records ({pagination.total})
                  {activeFilters.length > 0 && ' (Filtered)'}
                </h3>
                <div className="text-white text-sm font-sfpro">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">S/N</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Email</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">User Type</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Utility Type</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Auth Email</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Status</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Meters</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Created</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Updated</th>
                    <th className="py-4 px-4 text-left font-medium text-gray-700 font-sfpro">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {auths.map((auth, index) => (
                    <tr key={auth.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-sfpro text-gray-800">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium font-sfpro text-gray-900">
                        {auth.email || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sfpro font-[500] ${
                          auth.userType === 'COMMERCIAL' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {auth.userType}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[150px] truncate font-sfpro text-gray-700" title={auth.utilityType}>
                        {auth.utilityType}
                      </td>
                      <td className="py-3 px-4 font-sfpro text-gray-700">
                        {auth.authorizationEmail}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-sfpro ${
                          auth.status === 'completed' ? 'bg-green-100 text-green-800' :
                          auth.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          auth.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {auth.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getMeterStatusBadge(auth)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-sfpro text-gray-600">
                        {new Date(auth.createdAt).toLocaleDateString()} {new Date(auth.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-sfpro text-gray-600">
                        {new Date(auth.updatedAt).toLocaleDateString()} {new Date(auth.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="h-8 px-3 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 text-xs font-sfpro font-[500]"
                            onClick={() => handleReinitiateAuth(auth)}
                            disabled={reinitiatingId === auth.id || deletingId === auth.id}
                          >
                            {reinitiatingId === auth.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            Reinitiate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800 text-xs font-sfpro font-[500]"
                            onClick={() => handleDeleteAuth(auth.id)}
                            disabled={deletingId === auth.id || reinitiatingId === auth.id}
                          >
                            {deletingId === auth.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Trash2 className="h-3 w-3 mr-1" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-2 py-4 bg-white rounded-xl border border-gray-200">
              <div className="text-sm text-gray-600 font-sfpro">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="font-sfpro border-[#039994] text-[#039994] hover:bg-[#039994] hover:text-white"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm font-sfpro text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="font-sfpro border-[#039994] text-[#039994] hover:bg-[#039994] hover:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}