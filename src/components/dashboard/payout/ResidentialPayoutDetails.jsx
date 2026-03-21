"use client"
import CONFIG from '@/lib/config'

import { useState, useEffect } from 'react'
import { ChevronLeft, Loader2, Wallet } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

export default function ResidentialPayoutDetails({ payoutDetails, onBack, onPayoutUpdate }) {
  const [userPayouts, setUserPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [walletLoading, setWalletLoading] = useState(false)

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const getAdminId = () => {
    return localStorage.getItem("userId")
  }

  const fetchUserPayouts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request?userId=${payoutDetails.id}&userType=RESIDENTIAL`, {
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
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request/approve`, {
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
        const updatedPayout = { id: payoutId, status: "APPROVED" }
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "APPROVED" } : p))
        onPayoutUpdate(payoutDetails.id, updatedPayout)
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
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request/reject`, {
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
        const updatedPayout = { id: payoutId, status: "REJECTED" }
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "REJECTED" } : p))
        onPayoutUpdate(payoutDetails.id, updatedPayout)
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

  const fetchWalletData = async () => {
    setWalletLoading(true)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/revenue/${payoutDetails.id}`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      const result = await response.json()
      if (result.status === "success") setWalletData(result.data)
    } catch {
      // Wallet data is supplementary, fail silently
    } finally {
      setWalletLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00'
    return `$${Number(amount).toFixed(2)}`
  }

  useEffect(() => {
    if (payoutDetails.id) {
      fetchUserPayouts()
      fetchWalletData()
    }
  }, [payoutDetails.id])

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-3">
          <ChevronLeft
            className="h-5 w-5 text-[#039994] cursor-pointer"
            onClick={onBack}
          />
          <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Residential Payout Details</h1>
        </div>
      </div>

      <div className="bg-[#E8F5F4] rounded-lg px-4 py-3 border border-[#C1E8E5] mb-5">
        <div className="divide-y divide-[#C1E8E5]">
          <div className="flex justify-between items-center py-2">
            <span className="font-sfpro text-xs text-[#1E1E1E]">Name</span>
            <span className="font-sfpro text-xs text-[#626060]">{`${payoutDetails.firstName || ''} ${payoutDetails.lastName || ''}`.trim() || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-sfpro text-xs text-[#1E1E1E]">Email</span>
            <span className="font-sfpro text-xs text-[#626060]">{payoutDetails.email || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-sfpro text-xs text-[#1E1E1E]">Phone</span>
            <span className="font-sfpro text-xs text-[#626060]">{payoutDetails.phoneNumber || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-sfpro text-xs text-[#1E1E1E]">User Type</span>
            <span className="font-sfpro text-xs text-[#626060]">{payoutDetails.userType || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-sfpro text-xs text-[#1E1E1E]">User ID</span>
            <span className="font-sfpro text-xs text-[#626060] truncate max-w-[50%] text-right">{payoutDetails.id || '—'}</span>
          </div>
        </div>
      </div>

      {/* Revenue Wallet */}
      {walletLoading ? (
        <div className="flex justify-center py-4 mb-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#039994]" />
        </div>
      ) : walletData && (
        <div className="border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-[#039994]" />
            <h4 className="font-sfpro text-[14px] font-semibold text-[#1E1E1E]">Revenue Wallet</h4>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <span className="font-sfpro text-xs text-[#626060] block">Total Earnings</span>
              <span className="font-sfpro text-lg font-semibold text-[#1E1E1E]">{formatCurrency(walletData.totalEarnings)}</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <span className="font-sfpro text-xs text-[#626060] block">Available Balance</span>
              <span className="font-sfpro text-lg font-semibold text-[#039994]">{formatCurrency(walletData.availableBalance)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 border">
        <h3 className="font-sfpro text-[18px] font-[600] mb-4">Payout Requests</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
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
                      {payout.id}
                    </td>
                    <td className="py-3 font-sfpro p-3">
                      ${(payout.amountRequested ?? 0).toFixed(2)}
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