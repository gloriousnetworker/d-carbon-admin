"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ResidentialRedemptionPayoutFilterModal from "./modals/ResidentialRedemptionPayoutFilterModal"
import CommercialStatementPayoutFilterModal from "./modals/CommercialStatementPayoutFilterModal"
import PartnerCommissionPayoutFilterModal from "./modals/PartnerCommissionPayoutFilterModal"
import PayoutDetails from "./PayoutDetails"
import * as styles from "./styles"

// Sample data for all payout types
const residentialData = [
  { id: 1, name: "John Doe", residentId: "RES-001", paymentId: "PAY-001", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 2, name: "Jane Smith", residentId: "RES-002", paymentId: "PAY-002", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 3, name: "Robert Johnson", residentId: "RES-003", paymentId: "PAY-003", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
];

const commercialData = [
  { id: 1, name: "ABC Company", commercialId: "COM-001", invoiceId: "INV-001", totalAmount: "$500.00", date: "15-03-2025", status: "Completed" },
  { id: 2, name: "XYZ Corporation", commercialId: "COM-002", invoiceId: "INV-002", totalAmount: "$750.00", date: "16-03-2025", status: "Pending" },
];

const partnerData = [
  { id: 1, name: "Partner One", partnerId: "PAR-001", invoiceId: "INV-P001", totalCommission: "$150.00", date: "14-03-2025", status: "Completed" },
  { id: 2, name: "Partner Two", partnerId: "PAR-002", invoiceId: "INV-P002", totalCommission: "$225.00", date: "17-03-2025", status: "Pending" },
];

export default function PayoutProcessing() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [payoutType, setPayoutType] = useState("Residential Redemption Payout")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(residentialData)
  const [selectedPayout, setSelectedPayout] = useState(null)
  
  const totalPages = Math.ceil(filteredData.length / 10)

  const payoutTypes = [
    "Residential Redemption Payout", 
    "Commercial Statement Payout", 
    "Partner Commission Payout"
  ]

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Completed":
          return "text-teal-500"
        case "Pending":
          return "text-amber-500"
        default:
          return "text-gray-500"
      }
    }

    return <span className={`font-medium ${getStatusStyles()}`}>{status}</span>
  }

  const handleFilterApply = (filters) => {
    // Apply filtering logic based on current payout type
    let results;
    
    switch(payoutType) {
      case "Residential Redemption Payout":
        results = [...residentialData];
        if (filters.name) {
          results = results.filter(item => 
            item.name.toLowerCase().includes(filters.name.toLowerCase())
          )
        }
        if (filters.residentId) {
          results = results.filter(item => 
            item.residentId.toLowerCase().includes(filters.residentId.toLowerCase())
          )
        }
        if (filters.paymentId) {
          results = results.filter(item => 
            item.paymentId.toLowerCase().includes(filters.paymentId.toLowerCase())
          )
        }
        if (filters.pointRedeemed) {
          results = results.filter(item => 
            item.pointRedeemed === filters.pointRedeemed
          )
        }
        break;
        
      case "Commercial Statement Payout":
        results = [...commercialData];
        if (filters.name) {
          results = results.filter(item => 
            item.name.toLowerCase().includes(filters.name.toLowerCase())
          )
        }
        if (filters.commercialId) {
          results = results.filter(item => 
            item.commercialId.toLowerCase().includes(filters.commercialId.toLowerCase())
          )
        }
        if (filters.invoiceId) {
          results = results.filter(item => 
            item.invoiceId.toLowerCase().includes(filters.invoiceId.toLowerCase())
          )
        }
        break;
        
      case "Partner Commission Payout":
        results = [...partnerData];
        if (filters.name) {
          results = results.filter(item => 
            item.name.toLowerCase().includes(filters.name.toLowerCase())
          )
        }
        if (filters.partnerId) {
          results = results.filter(item => 
            item.partnerId.toLowerCase().includes(filters.partnerId.toLowerCase())
          )
        }
        if (filters.invoiceId) {
          results = results.filter(item => 
            item.invoiceId.toLowerCase().includes(filters.invoiceId.toLowerCase())
          )
        }
        break;
    }
    
    // Common filters for all types
    if (filters.status && filters.status !== "All") {
      results = results.filter(item => item.status === filters.status)
    }
    
    if (filters.dateFrom && filters.dateTo) {
      results = results.filter(item => {
        const itemDate = new Date(item.date.split('-').reverse().join('-'))
        const fromDate = new Date(filters.dateFrom)
        const toDate = new Date(filters.dateTo)
        return itemDate >= fromDate && itemDate <= toDate
      })
    }
    
    setFilteredData(results)
    setIsFilterModalOpen(false)
    setCurrentPage(1)
  }

  const handlePayoutTypeChange = (type) => {
    setPayoutType(type)
    setIsDropdownOpen(false)
    setSelectedPayout(null)
    
    switch(type) {
      case "Residential Redemption Payout":
        setFilteredData(residentialData)
        break
      case "Commercial Statement Payout":
        setFilteredData(commercialData)
        break
      case "Partner Commission Payout":
        setFilteredData(partnerData)
        break
    }
    setCurrentPage(1)
  }

  // Get current page data
  const indexOfLastItem = currentPage * 10
  const indexOfFirstItem = indexOfLastItem - 10
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const handleRowClick = (item) => {
    setSelectedPayout(item)
  }

  const handleBackToList = () => {
    setSelectedPayout(null)
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200">
        <CardContent className="p-0">
          {selectedPayout ? (
            <PayoutDetails 
              payoutDetails={selectedPayout} 
              onBack={handleBackToList} 
              payoutType={payoutType}
            />
          ) : (
            <>
              <div className="p-4 flex items-center justify-between">
                <div className="relative">
                  <div 
                    className="text-xl font-medium text-teal-500 flex items-center cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {payoutType}
                    <ChevronDown className="h-5 w-5 ml-2 text-teal-500" />
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 z-10 w-64 bg-white shadow-lg rounded-md border border-gray-200 mt-1">
                      {payoutTypes.map((type) => (
                        <div 
                          key={type} 
                          className="p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handlePayoutTypeChange(type)}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setIsFilterModalOpen(true)}
                >
                  <span>Filter by</span>
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-y text-sm">
                      {payoutType === "Residential Redemption Payout" ? (
                        <>
                          <th className="py-3 px-4 text-left font-medium">S/N</th>
                          <th className="py-3 px-4 text-left font-medium">Name</th>
                          <th className="py-3 px-4 text-left font-medium">Resident ID</th>
                          <th className="py-3 px-4 text-left font-medium">Payment ID</th>
                          <th className="py-3 px-4 text-left font-medium">Point Redeemed</th>
                          <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                          <th className="py-3 px-4 text-left font-medium">Date</th>
                          <th className="py-3 px-4 text-left font-medium">Payout status</th>
                        </>
                      ) : payoutType === "Commercial Statement Payout" ? (
                        <>
                          <th className="py-3 px-4 text-left font-medium">S/N</th>
                          <th className="py-3 px-4 text-left font-medium">Name</th>
                          <th className="py-3 px-4 text-left font-medium">Commercial ID</th>
                          <th className="py-3 px-4 text-left font-medium">Invoice ID</th>
                          <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                          <th className="py-3 px-4 text-left font-medium">Date</th>
                          <th className="py-3 px-4 text-left font-medium">Payout status</th>
                        </>
                      ) : (
                        <>
                          <th className="py-3 px-4 text-left font-medium">S/N</th>
                          <th className="py-3 px-4 text-left font-medium">Name</th>
                          <th className="py-3 px-4 text-left font-medium">Partner ID</th>
                          <th className="py-3 px-4 text-left font-medium">Invoice ID</th>
                          <th className="py-3 px-4 text-left font-medium">Total Comm. Payable</th>
                          <th className="py-3 px-4 text-left font-medium">Date</th>
                          <th className="py-3 px-4 text-left font-medium">Payout status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className="border-b text-sm hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(item)}
                      >
                        <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                        <td className="py-3 px-4 text-teal-500 hover:underline">
                          {item.name}
                        </td>
                        {payoutType === "Residential Redemption Payout" ? (
                          <>
                            <td className="py-3 px-4">{item.residentId}</td>
                            <td className="py-3 px-4">{item.paymentId}</td>
                            <td className="py-3 px-4">{item.pointRedeemed}</td>
                            <td className="py-3 px-4">{item.totalAmount}</td>
                            <td className="py-3 px-4">{item.date}</td>
                          </>
                        ) : payoutType === "Commercial Statement Payout" ? (
                          <>
                            <td className="py-3 px-4">{item.commercialId}</td>
                            <td className="py-3 px-4">{item.invoiceId}</td>
                            <td className="py-3 px-4">{item.totalAmount}</td>
                            <td className="py-3 px-4">{item.date}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4">{item.partnerId}</td>
                            <td className="py-3 px-4">{item.invoiceId}</td>
                            <td className="py-3 px-4">{item.totalCommission}</td>
                            <td className="py-3 px-4">{item.date}</td>
                          </>
                        )}
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 ? (
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
                    {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  No records found matching your filters
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Filter Modals */}
      {isFilterModalOpen && payoutType === "Residential Redemption Payout" && (
        <ResidentialRedemptionPayoutFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
      {isFilterModalOpen && payoutType === "Commercial Statement Payout" && (
        <CommercialStatementPayoutFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
      {isFilterModalOpen && payoutType === "Partner Commission Payout" && (
        <PartnerCommissionPayoutFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
    </div>
  )
}