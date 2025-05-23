"use client";

import React, { useState } from "react";
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
import CustomerDetails from "./CustomerDetails";
import CustomerReport from "./CustomerReport";
import FilterByModal from "./modals/customerManagement/FilterBy";
import SendReminderModal from "./modals/customerManagement/SendReminderModal";
import InviteCustomerModal from "./modals/customerManagement/InviteCustomerModal";
import InviteBulkCustomersModal from "./modals/customerManagement/InviteBulkCustomersModal";
import PartnerManagement from "./PartnerManagement";
import UtilityProviderManagement from "./utility-provider-management/UtilityProviderManagement";

const mockCustomers = [
  { id: 1, name: "Alice Johnson", type: "Residential", utility: "Water Co.", finance: "Finance Comp.", address: "123 Main St", date: "16-03-2025", status: "Registered", hasIssue: true },
  { id: 2, name: "Bob Smith", type: "Commercial", utility: "Power Inc.", finance: "Finance Comp.", address: "456 Elm Ave", date: "16-03-2025", status: "Active", hasIssue: false },
  { id: 3, name: "Carol Lee", type: "Residential", utility: "Gas & Co.", finance: "Finance Comp.", address: "789 Oak Blvd", date: "16-03-2025", status: "Invited", hasIssue: true },
];

export default function CustomerManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [currentView, setCurrentView] = useState("management"); // "management", "details", "report", "partner-management", "utility-management"
  
  const usersPerPage = 10;
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = mockCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(mockCustomers.length / usersPerPage);

  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setCurrentView("details");
  };

  const handleBackToList = () => {
    setSelectedCustomer(null);
    setCurrentView("management");
  };

  const handleInviteCustomerType = (type) => {
    if (type === "individual") {
      setShowInviteModal(true);
    } else if (type === "bulk") {
      setShowBulkInviteModal(true);
    }
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === "management") {
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 overflow-hidden p-10">
        {currentView === "details" && selectedCustomer && (
          // Show Customer Details when a customer is selected
          <CustomerDetails 
            customer={selectedCustomer} 
            onBack={handleBackToList} 
          />
        )}
        
        {currentView === "report" && (
          // Show Customer Report view
          <CustomerReport 
            onBack={() => handleViewChange("management")} 
          />
        )}
        
        {currentView === "partner-management" && (
          // Show Partner Management view
          <PartnerManagement 
            onViewChange={handleViewChange}
          />
        )}
        
        {currentView === "utility-management" && (
          // Show Utility Provider Management view
          <UtilityProviderManagement 
            onViewChange={handleViewChange}
          />
        )}
        
        {currentView === "management" && (
          // Show Customer Management Table
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

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="gap-2 bg-gray-900 text-white hover:bg-gray-800"
                  onClick={() => setShowReminderModal(true)}
                >
                  <Send className="h-4 w-4" />
                  Send Reminder
                </Button>

                {/* Invite New Customer Dropdown */}
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

            {/* ===== Title / Sub‑nav ===== */}
            <div className="mb-6 p-4 border-b flex items-center justify-between bg-white">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 text-xl font-medium text-teal-500">
                    Customer Management
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={() => handleViewChange("report")}>
                    Customer Report
                  </DropdownMenuItem>
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

            {/* ===== Status Bar ===== */}
            <div className="flex h-6 mb-1">
              <div className="bg-red-500 w-[15%]" />
              <div className="bg-amber-400 w-[25%]" />
              <div className="bg-teal-500 w-[35%]" />
              <div className="bg-black w-[25%]" />
            </div>
            <div className="flex text-xs mb-6">
              <div className="w-[15%] text-center">
                <LegendDot className="bg-red-500" /> Terminated
              </div>
              <div className="w-[25%] text-center">
                <LegendDot className="bg-amber-400" /> Invited
              </div>
              <div className="w-[35%] text-center">
                <LegendDot className="bg-teal-500" /> Active
              </div>
              <div className="w-[25%] text-center">
                <LegendDot className="bg-black" /> Registered
              </div>
            </div>

            {/* ===== Customer Table ===== */}
            <div className="overflow-x-auto">
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
                  {currentUsers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCustomerClick(customer)}
                    >
                      <td className="py-3 px-4">{customer.id}</td>
                      <td className="py-3 px-4">{customer.name}</td>
                      <td className="py-3 px-4">{customer.type}</td>
                      <td className="py-3 px-4">{customer.utility}</td>
                      <td className="py-3 px-4">{customer.finance}</td>
                      <td className="py-3 px-4">{customer.address}</td>
                      <td className="py-3 px-4">{customer.date}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="py-3 px-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {customer.hasIssue ? (
                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                              ) : (
                                <CheckCircle className="h-5 w-5 text-teal-500" />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {customer.hasIssue ? "Document issue" : "Documents verified"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
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

// ——— Helpers ———

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
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`}></span>;
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
    default:
      classes = "bg-gray-300 text-black";
  }
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs ${classes}`}>
      {status}
    </span>
  );
}