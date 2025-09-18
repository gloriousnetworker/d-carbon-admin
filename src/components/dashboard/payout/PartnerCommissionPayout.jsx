"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import PartnerCommissionPayoutFilterModal from "./modals/PartnerCommissionPayoutFilterModal"
import PartnerCommissionPayoutDetails from "./PartnerCommissionPayoutDetails"
import * as styles from "./styles"

const partnerData = [
  { id: 1, name: "Partner One", partnerId: "PAR-001", invoiceId: "INV-P001", totalCommission: "$150.00", date: "14-03-2025", status: "Completed" },
  { id: 2, name: "Partner Two", partnerId: "PAR-002", invoiceId: "INV-P002", totalCommission: "$225.00", date: "17-03-2025", status: "Pending" },
  { id: 3, name: "Partner Three", partnerId: "PAR-003", invoiceId: "INV-P003", totalCommission: "$180.00", date: "15-03-2025", status: "Completed" },
  { id: 4, name: "Partner Four", partnerId: "PAR-004", invoiceId: "INV-P004", totalCommission: "$300.00", date: "16-03-2025", status: "Pending" },
  { id: 5, name: "Partner Five", partnerId: "PAR-005", invoiceId: "INV-P005", totalCommission: "$275.00", date: "18-03-2025", status: "Pending" },
  { id: 6, name: "Partner Six", partnerId: "PAR-006", invoiceId: "INV-P006", totalCommission: "$195.00", date: "19-03-2025", status: "Completed" },
  { id: 7, name: "Partner Seven", partnerId: "PAR-007", invoiceId: "INV-P007", totalCommission: "$240.00", date: "20-03-2025", status: "Pending" },
  { id: 8, name: "Partner Eight", partnerId: "PAR-008", invoiceId: "INV-P008", totalCommission: "$320.00", date: "21-03-2025", status: "Pending" },
  { id: 9, name: "Partner Nine", partnerId: "PAR-009", invoiceId: "INV-P009", totalCommission: "$165.00", date: "22-03-2025", status: "Completed" },
  { id: 10, name: "Partner Ten", partnerId: "PAR-010", invoiceId: "INV-P010", totalCommission: "$285.00", date: "23-03-2025", status: "Pending" },
]

export default function PartnerCommissionPayout() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(partnerData)
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
    let results = [...partnerData]
    
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
      <PartnerCommissionPayoutDetails 
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
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Partner ID</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Invoice ID</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Total Comm. Payable</th>
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
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.partnerId}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.invoiceId}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.totalCommission}</td>
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
        <PartnerCommissionPayoutFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
    </>
  )
}