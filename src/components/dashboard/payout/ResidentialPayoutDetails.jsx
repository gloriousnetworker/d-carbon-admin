"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

export default function ResidentialPayoutDetails({ payoutDetails, onBack }) {
  const [userPayouts, setUserPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const getAdminId = () => {
    return localStorage.getItem("userId")
  }

  const fetchUserPayouts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request?userId=${payoutDetails.id}&userType=RESIDENTIAL`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })

      const result = await response.json()
      
      if (result.status === "success") {
        setUserPayouts(result.data)
      } else {
        toast.error('Failed to fetch payout requests')
      }
    } catch (error) {
      toast.error('Error fetching payout requests')
    } finally {
      setLoading(false)
    }
  }

  const approvePayout = async (payoutId) => {
    setProcessingAction(payoutId)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          payoutId: payoutId,
          adminId: getAdminId()
        })
      })

      const result = await response.json()
      
      if (result.status === "success") {
        toast.success('Payout approved successfully')
        fetchUserPayouts()
      } else {
        toast.error('Failed to approve payout')
      }
    } catch (error) {
      toast.error('Error approving payout')
    } finally {
      setProcessingAction(null)
    }
  }

  const rejectPayout = async (payoutId) => {
    setProcessingAction(payoutId)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          payoutId: payoutId,
          adminId: getAdminId()
        })
      })

      const result = await response.json()
      
      if (result.status === "success") {
        toast.success('Payout rejected successfully')
        fetchUserPayouts()
      } else {
        toast.error('Failed to reject payout')
      }
    } catch (error) {
      toast.error('Error rejecting payout')
    } finally {
      setProcessingAction(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-[#039994] text-white"
      case "PENDING":
        return "bg-[#FFB200] text-white"
      case "REJECTED":
        return "bg-[#FF0000] text-white"
      default:
        return "bg-gray-400 text-white"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const formatId = (id) => {
    return `${id.substring(0, 8)}...`
  }

  useEffect(() => {
    if (payoutDetails.id) {
      fetchUserPayouts()
    }
  }, [payoutDetails.id])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChevronLeft 
            className="h-5 w-5 text-[#039994] cursor-pointer" 
            onClick={onBack}
          />
          <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Residential Payout Details</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">User ID:</span>
            <span className="font-sfpro text-[14px] text-[#626060]">
              {formatId(payoutDetails.id)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#E8F5F4] rounded-lg p-6 border border-[#C1E8E5] mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">User ID</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{formatId(payoutDetails.id)}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">First Name</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.firstName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Last Name</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.lastName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Email Address</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.email}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Phone number</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.phoneNumber || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">User Type</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.userType}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <h3 className="font-sfpro text-[18px] font-[600] mb-4">Payout Requests</h3>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#039994] border-t-transparent"></div>
          </div>
        ) : userPayouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left text-[#1E1E1E] bg-gray-50">
                  <th className="pb-2 font-sfpro font-semibold p-3">Payout ID</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Amount</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Status</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Created At</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPayouts.map((payout) => (
                  <tr key={payout.id} className="border-t">
                    <td className="py-3 font-sfpro p-3" title={payout.id}>
                      {formatId(payout.id)}
                    </td>
                    <td className="py-3 font-sfpro p-3">
                      ${payout.amountRequested.toFixed(2)}
                    </td>
                    <td className="py-3 p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-sfpro font-semibold ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 font-sfpro p-3">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="py-3 p-3">
                      {payout.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => approvePayout(payout.id)}
                            disabled={processingAction === payout.id}
                            className="bg-[#039994] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#028884] disabled:bg-gray-400"
                          >
                            {processingAction === payout.id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button
                            onClick={() => rejectPayout(payout.id)}
                            disabled={processingAction === payout.id}
                            className="bg-[#FF0000] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#CC0000] disabled:bg-gray-400"
                          >
                            {processingAction === payout.id ? 'Processing...' : 'Reject'}
                          </Button>
                        </div>
                      )}
                      {payout.status !== "PENDING" && (
                        <span className="font-sfpro text-xs text-gray-500">
                          {payout.status === "PAID" ? "Approved" : "Rejected"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-sfpro text-[14px] text-[#626060] text-center py-8">No payout requests found</p>
        )}
      </div>
    </div>
  )
}