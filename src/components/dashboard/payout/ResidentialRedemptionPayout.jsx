"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ResidentialRedemptionPayoutFilterModal from "./modals/ResidentialRedemptionPayoutFilterModal"
import ResidentialPayoutDetails from "./ResidentialPayoutDetails"
import * as styles from "./styles"

const residentialData = [
  { id: 1, name: "John Doe", residentId: "RES-001", paymentId: "PAY-001", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Completed" },
  { id: 2, name: "Jane Smith", residentId: "RES-002", paymentId: "PAY-002", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Completed" },
  { id: 3, name: "Robert Johnson", residentId: "RES-003", paymentId: "PAY-003", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 4, name: "Mary Wilson", residentId: "RES-004", paymentId: "PAY-004", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Completed" },
  { id: 5, name: "David Brown", residentId: "RES-005", paymentId: "PAY-005", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 6, name: "Sarah Davis", residentId: "RES-006", paymentId: "PAY-006", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 7, name: "Michael Taylor", residentId: "RES-007", paymentId: "PAY-007", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 8, name: "Lisa Anderson", residentId: "RES-008", paymentId: "PAY-008", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 9, name: "James Thomas", residentId: "RES-009", paymentId: "PAY-009", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 10, name: "Jennifer White", residentId: "RES-010", paymentId: "PAY-010", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 11, name: "William Harris", residentId: "RES-011", paymentId: "PAY-011", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
  { id: 12, name: "Patricia Clark", residentId: "RES-012", paymentId: "PAY-012", pointRedeemed: "3000", totalAmount: "$30.00", date: "16-03-2025", status: "Pending" },
]

export default function ResidentialRedemptionPayout() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(residentialData)
  const [selectedPayout, setSelectedPayout] = useState(null)
  
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Completed":
          return "text-[#039994]"
        case "Pending":
          return "text-[#F59E0B]"
        default:
          return "text-gray-500"
      }
    }

    return <span className={`font-medium font-sfpro ${getStatusStyles()}`}>{status}</span>
  }

  const handleFilterApply = (filters) => {
    let results = [...residentialData]
    
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

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  const handleRowClick = (item) => {
    setSelectedPayout(item)
  }

  const handleBackToList = () => {
    setSelectedPayout(null)
  }

  if (selectedPayout) {
    return (
      <ResidentialPayoutDetails 
        payoutDetails={selectedPayout} 
        onBack={handleBackToList}
      />
    )
  }

  return (
    <>
      <div className="px-4 pb-4 flex items-center justify-end">
        <Button 
          variant="outline" 
          className="gap-2 font-sfpro text-[#1E1E1E]"
          onClick={() => setIsFilterModalOpen(true)}
        >
          <span>Filter by</span>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y text-sm">
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">S/N</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Name</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Resident ID</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Payment ID</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Point Redeemed</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Total Amount</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Date</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Payout status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr 
                key={item.id} 
                className="border-b text-sm hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(item)}
              >
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{indexOfFirstItem + index + 1}</td>
                <td className="py-3 px-4 text-[#039994] hover:underline font-sfpro">
                  {item.name}
                </td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.residentId}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.paymentId}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.pointRedeemed}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.totalAmount}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.date}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          <span className="text-sm font-sfpro text-[#1E1E1E]">
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
        <div className="p-8 text-center text-gray-500 font-sfpro">
          No records found matching your filters
        </div>
      )}

      {isFilterModalOpen && (
        <ResidentialRedemptionPayoutFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
    </>
  )
}