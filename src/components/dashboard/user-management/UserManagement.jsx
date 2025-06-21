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
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import CommercialDetails from "./customer-details/CommercialDetails";
import ResidentialDetails from "./customer-details/ResidentialDetails";
import PartnerDetails from "./customer-details/PartnerDetails";
import SendReminderModal from "./modals/customerManagement/SendReminderModal";
import InviteCustomerModal from "./modals/customerManagement/InviteCustomerModal";
import InviteBulkCustomersModal from "./modals/customerManagement/InviteBulkCustomersModal";
import FilterByModal from "./modals/customerManagement/FilterBy";
import PartnerManagement from "./partner-management/PartnerManagement";
import UtilityProviderManagement from "./utility-provider-management/UtilityProviderManagement";

export default function CustomerManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [currentView, setCurrentView] = useState("management");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    customerType: "",
    status: "",
    utilityProvider: "",
    documentStatus: ""
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (filters.customerType) queryParams.append("userType", filters.customerType);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.utilityProvider) queryParams.append("utility", filters.utilityProvider);
      if (filters.documentStatus) {
        if (filters.documentStatus === "issue") queryParams.append("facilityStatus", "PENDING");
        else if (filters.documentStatus === "verified") queryParams.append("facilityStatus", "APPROVED");
      }

      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/get-all-users?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.data && data.data.users) {
        setCustomers(data.data.users);
        setTotalPages(data.data.metadata?.totalPages || 1);
        setTotalCount(data.data.metadata?.total || 0);
      } else {
        setCustomers([]);
        setTotalPages(1);
        setTotalCount(0);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message || "An unknown error occurred");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, filters]);

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setCurrentView("management");
  };

  const handleInviteCustomerType = (type) => {
    if (type === "individual") setShowInviteModal(true);
    else if (type === "bulk") setShowBulkInviteModal(true);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === "management") setSelectedCustomer(null);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilters({
      customerType: "",
      status: "",
      utilityProvider: "",
      documentStatus: ""
    });
    setCurrentPage(1);
  };

  const calculateStatusDistribution = () => {
    const statusCounts = {
      Terminated: 0,
      Invited: 0,
      Active: 0,
      Registered: 0,
      Inactive: 0
    };

    customers.forEach(customer => {
      if (customer.status === "Terminated") statusCounts.Terminated++;
      else if (customer.status === "Invited") statusCounts.Invited++;
      else if (customer.status === "Active") statusCounts.Active++;
      else if (customer.status === "Registered") statusCounts.Registered++;
      else if (customer.status === "Inactive") statusCounts.Inactive++;
    });

    const total = customers.length || 1;
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
      <div className="flex-1 overflow-hidden p-10">
        {currentView === "details" && renderCustomerDetails()}
        
        {/* {currentView === "report" && (
          <CustomerReport onBack={() => handleViewChange("management")} />
        )} */}
        
        {currentView === "partner-management" && (
          <PartnerManagement onViewChange={handleViewChange} />
        )}
        
        {currentView === "utility-management" && (
          <UtilityProviderManagement onViewChange={handleViewChange} />
        )}
        
        {currentView === "management" && (
          <>
            <div className="flex justify-between mb-6">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowFilterModal(true)}
              >
                <Filter className="h-4 w-4" />
                Filter by
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => setShowReminderModal(true)}
                >
                  <Send className="h-4 w-4" />
                  Send Reminder
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
                      <Plus className="h-4 w-4" />
                      Invite New Customer
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleInviteCustomerType("individual")}>
                      Individual Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleInviteCustomerType("bulk")}>
                      Bulk Customers (CSV)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mb-6 p-4 border-b flex items-center justify-between bg-white">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 text-xl font-medium text-teal-500">
                    Customer Management
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="bg-white">
                  {/* <DropdownMenuItem onClick={() => handleViewChange("report")}>
                    Customer Report
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={() => handleViewChange("partner-management")}>
                    Partner Management
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleViewChange("utility-management")}>
                    Utility Provider Management
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <InfoIcon />
            </div>

            <div className="flex items-center mb-6">
              <div className="flex-1 flex h-4 rounded-full overflow-hidden bg-gray-200">
                <div className="bg-red-500" style={{ width: `${statusDistribution.Terminated}%` }} />
                <div className="bg-amber-400" style={{ width: `${statusDistribution.Invited}%` }} />
                <div className="bg-teal-500" style={{ width: `${statusDistribution.Active}%` }} />
                <div className="bg-black" style={{ width: `${statusDistribution.Registered}%` }} />
                <div className="bg-gray-400" style={{ width: `${statusDistribution.Inactive}%` }} />
              </div>
              
              <div className="ml-4 flex items-center gap-4">
                <div className="text-xs flex items-center">
                  <LegendDot className="bg-red-500" /> Terminated
                </div>
                <div className="text-xs flex items-center">
                  <LegendDot className="bg-amber-400" /> Invited
                </div>
                <div className="text-xs flex items-center">
                  <LegendDot className="bg-teal-500" /> Active
                </div>
                <div className="text-xs flex items-center">
                  <LegendDot className="bg-black" /> Registered
                </div>
                <div className="text-xs flex items-center">
                  <LegendDot className="bg-gray-400" /> Inactive
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">{error}</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y">
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Cus. Type</th>
                      <th className="py-3 px-4 text-left font-medium">
                        <div className="flex items-center gap-1">
                          Utility <InfoIcon />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Finance Com.</th>
                      <th className="py-3 px-4 text-left font-medium">Address</th>
                      <th className="py-3 px-4 text-left font-medium">Date Reg.</th>
                      <th className="py-3 px-4 text-left font-medium">
                        <div className="flex items-center gap-1">
                          Cus. Status <InfoIcon />
                        </div>
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Doc. Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="border-b cursor-pointer hover:bg-gray-50"
                        onClick={() => handleCustomerClick(customer)}
                      >
                        <td className="py-3 px-4">{(currentPage - 1) * 10 + index + 1}</td>
                        <td className="py-3 px-4">{customer.name}</td>
                        <td className="py-3 px-4">{customer.userType}</td>
                        <td className="py-3 px-4">{customer.utility}</td>
                        <td className="py-3 px-4">{customer.financeCompany}</td>
                        <td className="py-3 px-4">{customer.address}</td>
                        <td className="py-3 px-4">
                          {new Date(customer.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={customer.status} />
                        </td>
                        <td className="py-3 px-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {customer.facilityStatus === "PENDING" ? (
                                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                                ) : (
                                  <CheckCircle className="h-5 w-5 text-teal-500" />
                                )}
                              </TooltipTrigger>
                              <TooltipContent>
                                {customer.facilityStatus === "PENDING" ? "Document issue" : "Documents verified"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

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

      <FilterByModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
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
    </div>
  );
}

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
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${classes}`}>
      {status}
    </span>
  );
}