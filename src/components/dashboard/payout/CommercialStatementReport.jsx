"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import CommercialStatementPayoutFilterModal from "./modals/CommercialStatementPayoutFilterModal"
import CommercialPayoutDetails from "./CommercialPayoutDetails"

export default function CommercialStatementReport() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [commercialData, setCommercialData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const itemsPerPage = 10

  useEffect(() => {
    fetchAllCommercialUsers()
  }, [])

  const fetchUserPayoutStatus = async (email) => {
    try {
      const authToken = localStorage.getItem('authToken')
      const userResponse = await fetch(
        `https://services.dcarbon.solutions/api/user/${email}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        }
      )

      if (!userResponse.ok) return null

      const userResult = await userResponse.json()
      if (userResult.status !== 'success') return null

      const userId = userResult.data.id
      
      const payoutResponse = await fetch(
        `https://services.dcarbon.solutions/api/payout-request?userId=${userId}&userType=COMMERCIAL`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      )

      if (!payoutResponse.ok) return null

      const payoutResult = await payoutResponse.json()
      if (payoutResult.status !== 'success') return null

      const payouts = payoutResult.data
      const statusCounts = {
        PENDING: 0,
        PAID: 0,
        REJECTED: 0
      }

      payouts.forEach(payout => {
        if (statusCounts.hasOwnProperty(payout.status)) {
          statusCounts[payout.status]++
        }
      })

      return {
        userId,
        statusCounts,
        payouts
      }
    } catch (err) {
      return null
    }
  }

  const fetchAllCommercialUsers = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('authToken')
      let allCommercialUsers = []
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
          const commercialUsers = result.data.users.filter(
            user => user.userType === 'COMMERCIAL'
          )
          
          allCommercialUsers = [...allCommercialUsers, ...commercialUsers]
          hasMore = result.data.metadata.hasNextPage
          currentPage++
        } else {
          hasMore = false
        }
      }
      
      const formattedData = await Promise.all(
        allCommercialUsers.map(async (user, index) => {
          const payoutData = await fetchUserPayoutStatus(user.email)
          
          return {
            id: user.id || '-',
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : '-',
            firstName: user.firstName || '-',
            lastName: user.lastName || '-',
            email: user.email || '-',
            userType: user.userType || '-',
            date: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-') : '-',
            status: user.isActive ? "Completed" : "Pending",
            isActive: user.isActive,
            createdAt: user.createdAt || '-',
            updatedAt: user.updatedAt || '-',
            payoutStatus: payoutData ? payoutData.statusCounts : null,
            userId: payoutData ? payoutData.userId : user.id,
            payouts: payoutData ? payoutData.payouts : []
          }
        })
      )

      setCommercialData(formattedData)
      setFilteredData(formattedData)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const updateCommercialPayoutStatus = (userId, updatedPayout) => {
    const updatedCommercialData = commercialData.map(commercial => {
      if (commercial.userId === userId || commercial.id === userId) {
        const currentPayouts = commercial.payouts || []
        const updatedPayouts = currentPayouts.map(p => 
          p.id === updatedPayout.id ? updatedPayout : p
        )
        
        const statusCounts = {
          PENDING: 0,
          PAID: 0,
          REJECTED: 0
        }
        
        updatedPayouts.forEach(payout => {
          if (statusCounts.hasOwnProperty(payout.status)) {
            statusCounts[payout.status]++
          }
        })

        return {
          ...commercial,
          payoutStatus: statusCounts,
          payouts: updatedPayouts
        }
      }
      return commercial
    })

    setCommercialData(updatedCommercialData)
    setFilteredData(updatedCommercialData)
  }

  const StatusBadge = ({ payoutStatus }) => {
    if (!payoutStatus) {
      return <span className="text-gray-500 font-medium font-sfpro">No Payouts</span>
    }

    const getStatusText = () => {
      const parts = []
      if (payoutStatus.PENDING > 0) parts.push(`PENDING (${payoutStatus.PENDING})`)
      if (payoutStatus.PAID > 0) parts.push(`PAID (${payoutStatus.PAID})`)
      if (payoutStatus.REJECTED > 0) parts.push(`REJECTED (${payoutStatus.REJECTED})`)
      
      return parts.length > 0 ? parts.join(', ') : 'No Payouts'
    }

    const getStatusColor = () => {
      if (payoutStatus.PENDING > 0) return "text-[#F59E0B]"
      if (payoutStatus.PAID > 0) return "text-[#039994]"
      if (payoutStatus.REJECTED > 0) return "text-[#FF0000]"
      return "text-gray-500"
    }

    return (
      <span className={`font-medium font-sfpro ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    )
  }

  const handleFilterApply = (filters) => {
    let results = [...commercialData]
    
    if (filters.name) {
      results = results.filter(item => 
        item.name.toLowerCase().includes(filters.name.toLowerCase())
      )
    }
    if (filters.email) {
      results = results.filter(item => 
        item.email.toLowerCase().includes(filters.email.toLowerCase())
      )
    }
    if (filters.userType && filters.userType !== "All") {
      results = results.filter(item => item.userType === filters.userType)
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
          ...result.data,
          payouts: item.payouts
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBackToList = () => {
    setSelectedPayout(null)
  }

  const handlePayoutUpdate = (userId, updatedPayout) => {
    updateCommercialPayoutStatus(userId, updatedPayout)
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600 font-sfpro">Loading commercial users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-sfpro">Error: {error}</p>
        <Button onClick={fetchAllCommercialUsers} className="mt-4">Retry</Button>
      </div>
    )
  }

  if (selectedPayout) {
    return (
      <CommercialPayoutDetails 
        payoutDetails={selectedPayout} 
        onBack={handleBackToList}
        onPayoutUpdate={handlePayoutUpdate}
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
              <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Payout Status</th>
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
                <td className="py-3 px-4">
                  <StatusBadge payoutStatus={item.payoutStatus} />
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
          No commercial users found
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