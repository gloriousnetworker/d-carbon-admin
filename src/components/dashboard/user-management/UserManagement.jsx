"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Send,
  Plus,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  Mail,
} from "lucide-react";
import CommercialDetails from "./customer-details/CommercialDetails";
import ResidentialDetails from "./customer-details/ResidentialDetails";
import PartnerDetails from "./customer-details/PartnerDetails";
import SendReminderModal from "./modals/customerManagement/SendReminderModal";
import InviteCustomerModal from "./modals/customerManagement/InviteCustomerModal";
import InviteBulkCustomersModal from "./modals/customerManagement/InviteBulkCustomersModal";
import FilterByModal from "./modals/customerManagement/FilterBy";
import PartnerManagement from "./partner-management/PartnerManagement";
import UtilityProviderManagement from "./utility-provider-management/UtilityProviderManagement";
import FinanceTypes from "./partner-management/finance-types/FinanceType";
import * as styles from "./styles";

export default function CustomerManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [currentView, setCurrentView] = useState("management");
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    customerType: "",
    status: "",
    utilityProvider: "",
    documentStatus: "",
    name: "",
    email: ""
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [resending, setResending] = useState(false);

  const fetchCustomers = async (page = 1, limit = 50) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");

      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/get-all-users?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.data?.users) {
        setCustomers(data.data.users);
        setFilteredCustomers(data.data.users);
        setTotalPages(data.data.metadata.totalPages);
        setTotalCount(data.data.metadata.total);
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (err) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchUtilityProviders = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;

      const response = await fetch(
        "https://services.dcarbon.solutions/api/auth/utility-providers",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setUtilityProviders(data.data);
      }
    } catch (err) {
      console.error("Error fetching utility providers:", err);
    }
  };

  const handleResendESignature = async (email) => {
    try {
      setResending(true);
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      
      if (!authToken || !userId) {
        throw new Error("Authentication token or user ID not found");
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/${userId}/request-agreement-resign`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emails: [email]
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === "success") {
        alert("E-Signature resend request sent successfully");
      } else {
        throw new Error(data.message || "Failed to send resend request");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (currentView === "management") {
      fetchCustomers(currentPage, 50);
      fetchUtilityProviders();
    }
  }, [currentView, currentPage]);

  useEffect(() => {
    applyFilters(filters);
  }, [customers]);

  const applyFilters = (newFilters) => {
    let results = [...customers];
    
    if (newFilters.name) {
      results = results.filter(customer => 
        customer.name?.toLowerCase().includes(newFilters.name.toLowerCase())
      );
    }

    if (newFilters.email) {
      results = results.filter(customer => 
        customer.email?.toLowerCase().includes(newFilters.email.toLowerCase())
      );
    }

    if (newFilters.customerType) {
      results = results.filter(customer => 
        customer.userType === newFilters.customerType
      );
    }

    if (newFilters.status) {
      results = results.filter(customer => 
        customer.status === newFilters.status
      );
    }

    if (newFilters.utilityProvider) {
      results = results.filter(customer => 
        customer.utility === newFilters.utilityProvider
      );
    }

    if (newFilters.documentStatus) {
      results = results.filter(customer => 
        newFilters.documentStatus === "issue" ? 
          customer.facilityStatus === "PENDING" : 
          customer.facilityStatus === "APPROVED"
      );
    }

    setFilteredCustomers(results);
  };

  const getCurrentRange = () => {
    const start = (currentPage - 1) * 50 + 1;
    const end = Math.min(currentPage * 50, totalCount);
    return `${start}-${end} of ${totalCount}`;
  };

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setCurrentView("management");
    fetchCustomers(currentPage);
  };

  const handleInviteCustomerType = (type) => {
    if (type === "individual") setShowInviteModal(true);
    else if (type === "bulk") setShowBulkInviteModal(true);
    setShowInviteDropdown(false);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === "management") setSelectedCustomer(null);
    setShowMainDropdown(false);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    const emptyFilters = {
      customerType: "",
      status: "",
      utilityProvider: "",
      documentStatus: "",
      name: "",
      email: ""
    };
    setFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  const calculateStatusDistribution = () => {
    const statusCounts = {
      Terminated: 0,
      Invited: 0,
      Active: 0,
      Registered: 0,
      Inactive: 0
    };

    filteredCustomers.forEach(customer => {
      if (customer.status === "Terminated") statusCounts.Terminated++;
      else if (customer.status === "Invited") statusCounts.Invited++;
      else if (customer.status === "Active") statusCounts.Active++;
      else if (customer.status === "Registered") statusCounts.Registered++;
      else if (customer.status === "Inactive") statusCounts.Inactive++;
    });

    const total = filteredCustomers.length || 1;
    return {
      Terminated: (statusCounts.Terminated / total) * 100,
      Invited: (statusCounts.Invited / total) * 100,
      Active: (statusCounts.Active / total) * 100,
      Registered: (statusCounts.Registered / total) * 100,
      Inactive: (statusCounts.Inactive / total) * 100
    };
  };

  const statusDistribution = calculateStatusDistribution();

  const renderCustomerDetails = () => {
    if (!selectedCustomer) return null;
    
    switch (selectedCustomer.userType) {
      case "COMMERCIAL":
        return <CommercialDetails customer={selectedCustomer} onBack={handleBackToList} />;
      case "RESIDENTIAL":
        return <ResidentialDetails customer={selectedCustomer} onBack={handleBackToList} />;
      case "PARTNER":
        return <PartnerDetails customer={selectedCustomer} onBack={handleBackToList} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-hidden p-4">
        {currentView === "details" && renderCustomerDetails()}
        
        {currentView === "partner-management" && (
          <PartnerManagement onViewChange={handleViewChange} />
        )}
        
        {currentView === "utility-management" && (
          <UtilityProviderManagement onViewChange={handleViewChange} />
        )}

        {currentView === "finance-types" && (
          <FinanceTypes onBack={() => handleViewChange("management")} />
        )}
        
        {currentView === "management" && (
          <>
            <div className="flex justify-between mb-3">
              <Button 
                variant="outline" 
                className="gap-2 text-xs h-8"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="h-3 w-3" />
                Filter by
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 text-xs h-8 bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => setShowReminderModal(true)}
                >
                  <Send className="h-3 w-3" />
                  Send Reminder
                </Button>

                <div className="relative">
                  <Button 
                    className="gap-2 text-xs h-8 bg-teal-500 hover:bg-teal-600"
                    onClick={() => setShowInviteDropdown(!showInviteDropdown)}
                  >
                    <Plus className="h-3 w-3" />
                    Invite Customer
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>

                  {showInviteDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        <button
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                          onClick={() => handleInviteCustomerType("individual")}
                        >
                          Individual Customer
                        </button>
                        <button
                          className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                          onClick={() => handleInviteCustomerType("bulk")}
                        >
                          Bulk Customers (CSV)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-3 p-2 border-b flex items-center justify-between">
              <div className="relative">
                <button
                  className="flex items-center gap-1 text-sm font-medium text-[#039994]"
                  onClick={() => setShowMainDropdown(!showMainDropdown)}
                >
                  Customer Management
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showMainDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50 font-medium text-[#039994]"
                        onClick={() => handleViewChange("management")}
                      >
                        Customer Management
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-xs hover:bg-gray-50"
                        onClick={() => handleViewChange("partner-management")}
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
                        onClick={() => handleViewChange("finance-types")}
                      >
                        Finance Types
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Info className="h-3 w-3 text-teal-500" />
            </div>

            <div className="mb-3">
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                <div className="flex h-full">
                  <div className="bg-red-500" style={{ width: `${statusDistribution.Terminated}%` }} />
                  <div className="bg-amber-400" style={{ width: `${statusDistribution.Invited}%` }} />
                  <div className="bg-teal-500" style={{ width: `${statusDistribution.Active}%` }} />
                  <div className="bg-black" style={{ width: `${statusDistribution.Registered}%` }} />
                  <div className="bg-gray-400" style={{ width: `${statusDistribution.Inactive}%` }} />
                </div>
              </div>
              
              <div className="flex justify-end mt-1 gap-2">
                <div className="text-[10px] flex items-center">
                  <LegendDot className="bg-red-500" /> Terminated
                </div>
                <div className="text-[10px] flex items-center">
                  <LegendDot className="bg-amber-400" /> Invited
                </div>
                <div className="text-[10px] flex items-center">
                  <LegendDot className="bg-teal-500" /> Active
                </div>
                <div className="text-[10px] flex items-center">
                  <LegendDot className="bg-black" /> Registered
                </div>
                <div className="text-[10px] flex items-center">
                  <LegendDot className="bg-gray-400" /> Inactive
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className={styles.spinner}></div>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500 text-xs">{error}</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="flex justify-center items-center h-48">
                  <div className="text-gray-500 text-center text-xs">
                    <p className="font-medium">No customers found</p>
                    <Button 
                      className="mt-3 text-xs bg-teal-500 hover:bg-teal-600"
                      onClick={() => setShowInviteDropdown(true)}
                    >
                      Invite New Customer
                    </Button>
                  </div>
                </div>
              ) : (
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b">
                      <th className="py-1 px-1 text-left font-medium">S/N</th>
                      <th className="py-1 px-1 text-left font-medium">NAME</th>
                      <th className="py-1 px-1 text-left font-medium">EMAIL</th>
                      <th className="py-1 px-1 text-left font-medium">PHONE</th>
                      <th className="py-1 px-1 text-left font-medium">TYPE</th>
                      <th className="py-1 px-1 text-left font-medium">STATUS</th>
                      <th className="py-1 px-1 text-left font-medium">DOCS</th>
                      <th className="py-1 px-1 text-left font-medium">RESEND</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-1 px-1">{(currentPage - 1) * 50 + index + 1}</td>
                        <td className="py-1 px-1 truncate max-w-[100px] cursor-pointer" onClick={() => handleCustomerClick(customer)}>{customer.name}</td>
                        <td className="py-1 px-1 truncate max-w-[120px] cursor-pointer" onClick={() => handleCustomerClick(customer)}>{customer.email}</td>
                        <td className="py-1 px-1 cursor-pointer" onClick={() => handleCustomerClick(customer)}>{customer.phoneNumber}</td>
                        <td className="py-1 px-1 cursor-pointer" onClick={() => handleCustomerClick(customer)}>{customer.userType}</td>
                        <td className="py-1 px-1 cursor-pointer" onClick={() => handleCustomerClick(customer)}>
                          <StatusBadge status={customer.status} />
                        </td>
                        <td className="py-1 px-1 cursor-pointer" onClick={() => handleCustomerClick(customer)}>
                          <div className="relative group">
                            {customer.facilityStatus === "PENDING" ? (
                              <AlertTriangle className="h-3 w-3 text-amber-400" />
                            ) : customer.facilityStatus === "APPROVED" ? (
                              <CheckCircle className="h-3 w-3 text-teal-500" />
                            ) : (
                              <span className="text-[9px] text-gray-400">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="py-1 px-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-5 text-[9px] gap-1"
                            onClick={() => handleResendESignature(customer.email)}
                            disabled={resending}
                          >
                            <Mail className="h-2 w-2" />
                            E-Sign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && !error && totalCount > 0 && (
              <div className="p-2 flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage === 1}
                  onClick={() => {
                    const prevPage = Math.max(currentPage - 1, 1);
                    setCurrentPage(prevPage);
                    fetchCustomers(prevPage, 50);
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-xs">
                  {getCurrentRange()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    const nextPage = Math.min(currentPage + 1, totalPages);
                    setCurrentPage(nextPage);
                    fetchCustomers(nextPage, 50);
                  }}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <FilterByModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
        utilityProviders={utilityProviders}
      />
      
      <SendReminderModal 
        isOpen={showReminderModal} 
        onClose={() => setShowReminderModal(false)} 
      />
      
      <InviteCustomerModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
      
      <InviteBulkCustomersModal 
        isOpen={showBulkInviteModal} 
        onClose={() => setShowBulkInviteModal(false)} 
      />

      {(showInviteDropdown || showMainDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowInviteDropdown(false);
            setShowMainDropdown(false);
          }}
        />
      )}
    </div>
  );
}

function LegendDot({ className }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className} mr-1`}></span>;
}

function StatusBadge({ status }) {
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
    <span className={`inline-block px-2 py-1 rounded-full text-[9px] ${classes}`}>
      {status}
    </span>
  );
}