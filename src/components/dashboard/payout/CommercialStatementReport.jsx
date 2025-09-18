"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import CommercialStatementPayoutFilterModal from "./modals/CommercialStatementPayoutFilterModal"
import CommercialPayoutDetails from "./CommercialPayoutDetails"
import * as styles from "./styles"

const commercialData = [
  { id: 1, name: "ABC Company", commercialId: "COM-001", invoiceId: "INV-001", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 2, name: "XYZ Corporation", commercialId: "COM-002", invoiceId: "INV-002", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 3, name: "Tech Solutions Ltd", commercialId: "COM-003", invoiceId: "INV-003", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 4, name: "Global Enterprises", commercialId: "COM-004", invoiceId: "INV-004", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 5, name: "Innovation Co", commercialId: "COM-005", invoiceId: "INV-005", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 6, name: "Smart Business", commercialId: "COM-006", invoiceId: "INV-006", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 7, name: "Future Corp", commercialId: "COM-007", invoiceId: "INV-007", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 8, name: "Prime Industries", commercialId: "COM-008", invoiceId: "INV-008", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 9, name: "Elite Systems", commercialId: "COM-009", invoiceId: "INV-009", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 10, name: "Advanced Tech", commercialId: "COM-010", invoiceId: "INV-010", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 11, name: "Next Gen Ltd", commercialId: "COM-011", invoiceId: "INV-011", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 12, name: "Digital Solutions", commercialId: "COM-012", invoiceId: "INV-012", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
]

export default function CommercialStatementReport() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(commercialData)
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
    let results = [...commercialData]
    
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
      <CommercialPayoutDetails 
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
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Commercial ID</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Invoice ID</th>
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
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.commercialId}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.invoiceId}</td>
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
        <CommercialStatementPayoutFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
    </>
  )
}