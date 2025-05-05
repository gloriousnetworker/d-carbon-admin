"use client"

import { useState } from "react"
import { Filter, ChevronDown, Send, Plus, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Sample data for the customer table
const customers = [
  {
    id: 1,
    name: "Name",
    type: "Residential",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Registered",
    hasIssue: true,
  },
  {
    id: 2,
    name: "Name",
    type: "Commercial",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Active",
    hasIssue: false,
  },
  {
    id: 3,
    name: "Name",
    type: "Commercial",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Invited",
    hasIssue: true,
  },
  {
    id: 4,
    name: "Name",
    type: "Resi. Group",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Active",
    hasIssue: false,
  },
  {
    id: 5,
    name: "Name",
    type: "Commercial",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Invited",
    hasIssue: true,
  },
  {
    id: 6,
    name: "Name",
    type: "Residential",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Active",
    hasIssue: false,
  },
  {
    id: 7,
    name: "Name",
    type: "Commercial",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Registered",
    hasIssue: true,
  },
  {
    id: 8,
    name: "Name",
    type: "Commercial",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Registered",
    hasIssue: true,
  },
  {
    id: 9,
    name: "Name",
    type: "Residential",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Registered",
    hasIssue: true,
  },
  {
    id: 10,
    name: "Name",
    type: "Residential",
    utility: "Utility",
    finance: "Finance Comp.",
    address: "Address",
    date: "16-03-2025",
    status: "Terminated",
    hasIssue: true,
  },
]

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Registered":
          return "bg-black text-white"
        case "Active":
          return "bg-teal-500 text-white"
        case "Invited":
          return "bg-amber-400 text-black"
        case "Terminated":
          return "bg-red-600 text-white"
        default:
          return "bg-gray-200 text-gray-800"
      }
    }

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>{status}</span>
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-between mb-6">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter by
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
                <Send className="h-4 w-4" />
                Send Reminder
              </Button>
              <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
                <Plus className="h-4 w-4" />
                Invite New Customer
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-teal-500">Customer Management</h2>
                  <ChevronDown className="h-5 w-5 text-teal-500" />
                </div>
              </div>

              {/* Status bar */}
              <div className="flex h-6 mb-4">
                <div className="bg-red-500 w-[15%]"></div>
                <div className="bg-amber-400 w-[25%]"></div>
                <div className="bg-teal-500 w-[35%]"></div>
                <div className="bg-black w-[25%]"></div>
              </div>

              <div className="px-4 pb-2 flex gap-6 text-xs">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Terminated customers
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  Invited customers
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                  Active customers
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-black"></span>
                  Registered customers
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y text-sm">
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Cus. Type</th>
                      <th className="py-3 px-4 text-left font-medium flex items-center gap-1">
                        Utility
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Finance Com.</th>
                      <th className="py-3 px-4 text-left font-medium">Address</th>
                      <th className="py-3 px-4 text-left font-medium">Date Reg.</th>
                      <th className="py-3 px-4 text-left font-medium flex items-center gap-1">
                        Cus. Status
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </th>
                      <th className="py-3 px-4 text-left font-medium">Doc. Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b text-sm">
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

              {/* Pagination */}
              <div className="p-4 flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
