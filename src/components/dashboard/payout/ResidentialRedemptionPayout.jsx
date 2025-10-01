"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import ResidentialRedemptionPayoutFilterModal from "./modals/ResidentialRedemptionPayoutFilterModal"
import ResidentialPayoutDetails from "./ResidentialPayoutDetails"

export default function ResidentialRedemptionPayout() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [residentialData, setResidentialData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const itemsPerPage = 10

  useEffect(() => {
    fetchAllResidentialUsers()
  }, [])

  const fetchAllResidentialUsers = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      let allResidentialUsers = []
      let currentPage = 1
      let hasMore = true

      while (hasMore) {
        const response = await fetch(
          `https://services.dcarbon.solutions/api/user/get-all-users?page=${currentPage}&limit=50`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const result = await response.json()
        
        if (result.status === 'success') {
          const residentialUsers = result.data.users.filter(
            user => user.userType === 'RESIDENTIAL'
          )
          
          allResidentialUsers = [...allResidentialUsers, ...residentialUsers]
          hasMore = result.data.metadata.hasNextPage
          currentPage++
        } else {
          hasMore = false
        }
      }
      
      const formattedData = allResidentialUsers.map((user, index) => ({
        id: user.id || '-',
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-',
        firstName: user.firstName || '-',
        lastName: user.lastName || '-',
        email: user.email || '-',
        userType: user.userType || '-',
        residentId: user.id ? user.id.slice(0, 8).toUpperCase() : '-',
        paymentId: '-',
        pointRedeemed: '-',
        totalAmount: '-',
        date: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
        status: user.isActive ? "Completed" : "Pending",
        isActive: user.isActive,
        createdAt: user.createdAt || '-',
        updatedAt: user.updatedAt || '-'
      }))

      setResidentialData(formattedData)
      setFilteredData(formattedData)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

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
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handleRowClick = async (item) => {
    try {
      const authToken = localStorage.getItem('authToken')
      const response = await fetch(
        `https://services.dcarbon.solutions/api/user/${item.email}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      )
      if (!response.ok) throw new Error('Failed to fetch user details')
      const result = await response.json()
      if (result.status === "success") {
        setSelectedPayout({
          ...item,
          ...result.data
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBackToList = () => {
    setSelectedPayout(null)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 font-sfpro">Loading residential users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-sfpro">Error: {error}</p>
        <Button onClick={fetchAllResidentialUsers} className="mt-4">Retry</Button>
      </div>
    )
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
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Email</th>
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">User Type</th>
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
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.email}</td>
                <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{item.userType}</td>
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
          No residential users found
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
