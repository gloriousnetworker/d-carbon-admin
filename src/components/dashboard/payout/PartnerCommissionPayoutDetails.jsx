"use client"
import CONFIG from '@/lib/config'

import { useState, useEffect } from 'react'
import { ChevronLeft, Loader2, Wallet, CreditCard, TrendingUp, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'
import { exportToExcel, COMMISSION_STATEMENT_COLUMNS } from '@/lib/exportUtils'

export default function PartnerCommissionPayoutDetails({ payoutDetails, onBack, onPayoutUpdate }) {
  const [userPayouts, setUserPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)
  const [commissionData, setCommissionData] = useState(null)
  const [walletData, setWalletData] = useState(null)
  const [bankDetails, setBankDetails] = useState(null)
  const [extraLoading, setExtraLoading] = useState(false)

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const getAdminId = () => {
    return localStorage.getItem("userId")
  }

  const fetchUserPayouts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request?userId=${payoutDetails.id}&userType=PARTNER`, {
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
    } catch {
      toast.error('Error fetching payout requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchExtraDetails = async () => {
    setExtraLoading(true)
    const headers = { 'Authorization': `Bearer ${getAuthToken()}` }

    const fetches = [
      fetch(`${CONFIG.API_BASE_URL}/api/payout/commission-total/${payoutDetails.id}`, { headers })
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") setCommissionData(result.data)
        })
        .catch(() => {}),

      fetch(`${CONFIG.API_BASE_URL}/api/revenue/${payoutDetails.id}`, { headers })
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") setWalletData(result.data)
        })
        .catch(() => {}),

      fetch(`${CONFIG.API_BASE_URL}/api/bank-details/${payoutDetails.id}`, { headers })
        .then(r => r.json())
        .then(result => {
          if (result.status === "success") setBankDetails(result.data)
        })
        .catch(() => {})
    ]

    await Promise.allSettled(fetches)
    setExtraLoading(false)
  }

  const handleExportStatement = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${getAuthToken()}`, 'Content-Type': 'application/json' }

      // Fetch commission breakdown for detailed line items
      const breakdownRes = await fetch(`${CONFIG.API_BASE_URL}/api/payout/commission-breakdown/${payoutDetails.id}`, { headers })
      let breakdownData = []
      if (breakdownRes.ok) {
        const json = await breakdownRes.json()
        if (json.status === "success") breakdownData = Array.isArray(json.data) ? json.data : json.data?.commissions || []
      }

      // Build statement rows
      const rows = breakdownData.length > 0
        ? breakdownData.map((c) => ({
            itemCode: c.itemCode || c.commissionMode || '-',
            description: c.description || c.type || '-',
            facility: c.facilityName || c.facility || '-',
            rate: c.rate != null ? `${c.rate}%` : c.rateAmount != null ? `$${Number(c.rateAmount).toFixed(2)}` : '-',
            quantity: c.quantity ?? c.recsCount ?? '-',
            amount: c.amount != null ? `$${Number(c.amount).toFixed(2)}` : '-',
            period: c.period || c.month ? `${c.month}/${c.year}` : '-',
          }))
        : userPayouts.map((p) => ({
            itemCode: 'PAYOUT',
            description: `Payout Request - ${p.status}`,
            facility: '-',
            rate: '-',
            quantity: 1,
            amount: `$${Number(p.amountRequested).toFixed(2)}`,
            period: new Date(p.createdAt).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }),
          }))

      if (rows.length === 0) {
        toast.error('No commission data to export')
        return
      }

      const partnerName = `${payoutDetails.firstName || ''}_${payoutDetails.lastName || ''}`.replace(/\s+/g, '_')
      exportToExcel(rows, COMMISSION_STATEMENT_COLUMNS, `Commission_Statement_${partnerName}_${new Date().toISOString().slice(0, 10)}`, 'Commission Statement')
      toast.success('Commission statement exported')
    } catch {
      toast.error('Failed to export commission statement')
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
        const updatedPayout = { id: payoutId, status: "PAID" }
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "PAID" } : p))
        onPayoutUpdate(payoutDetails.id, updatedPayout)
      } else {
        toast.error('Failed to approve payout')
      }
    } catch {
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
    } catch {
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

  const formatCurrency = (amount) => {
    if (amount == null) return '$0.00'
    return `$${Number(amount).toFixed(2)}`
  }

  useEffect(() => {
    if (payoutDetails.id) {
      fetchUserPayouts()
      fetchExtraDetails()
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
          <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Partner Payout Details</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">User ID:</span>
            <span className="font-sfpro text-[14px] text-[#626060]">
              {payoutDetails.id}
            </span>
          </div>
          <Button
            onClick={handleExportStatement}
            className="bg-[#039994] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#028884] flex items-center gap-1"
          >
            <Download className="h-3 w-3" />
            Export Statement
          </Button>
        </div>
      </div>

      <div className="bg-[#E8F5F4] rounded-lg p-6 border border-[#C1E8E5] mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">User ID</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.id}</span>
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

      {/* Commission & Wallet Summary Cards */}
      {extraLoading ? (
        <div className="flex justify-center py-6 mb-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Commission Totals */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[#039994]" />
              <h4 className="font-sfpro text-[14px] font-semibold text-[#1E1E1E]">Commission Summary</h4>
            </div>
            {commissionData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Total Commission</span>
                  <span className="font-sfpro text-xs font-semibold text-[#1E1E1E]">{formatCurrency(commissionData.totalCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Total Bonus</span>
                  <span className="font-sfpro text-xs font-semibold text-[#1E1E1E]">{formatCurrency(commissionData.totalBonus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Total Paid</span>
                  <span className="font-sfpro text-xs font-semibold text-[#039994]">{formatCurrency(commissionData.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Total Pending</span>
                  <span className="font-sfpro text-xs font-semibold text-[#FFB200]">{formatCurrency(commissionData.totalPending)}</span>
                </div>
              </div>
            ) : (
              <p className="font-sfpro text-xs text-[#626060]">No commission data available</p>
            )}
          </div>

          {/* Revenue Wallet */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-[#039994]" />
              <h4 className="font-sfpro text-[14px] font-semibold text-[#1E1E1E]">Revenue Wallet</h4>
            </div>
            {walletData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Total Earnings</span>
                  <span className="font-sfpro text-xs font-semibold text-[#1E1E1E]">{formatCurrency(walletData.totalEarnings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Available Balance</span>
                  <span className="font-sfpro text-xs font-semibold text-[#039994]">{formatCurrency(walletData.availableBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sfpro text-xs text-[#626060]">Held Amount</span>
                  <span className="font-sfpro text-xs font-semibold text-[#FFB200]">{formatCurrency(walletData.heldAmount)}</span>
                </div>
              </div>
            ) : (
              <p className="font-sfpro text-xs text-[#626060]">No wallet data available</p>
            )}
          </div>

          {/* Bank Details */}
          <div className="border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-[#039994]" />
              <h4 className="font-sfpro text-[14px] font-semibold text-[#1E1E1E]">Bank Details</h4>
            </div>
            {bankDetails && bankDetails.length > 0 ? (
              <div className="space-y-2">
                {bankDetails.map((account, idx) => (
                  <div key={account.id || idx} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-sfpro text-xs text-[#626060]">Type</span>
                      <span className="font-sfpro text-xs font-semibold text-[#1E1E1E]">{account.accountType || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sfpro text-xs text-[#626060]">Account</span>
                      <span className="font-sfpro text-xs font-semibold text-[#1E1E1E]">
                        {account.accountNumber ? `****${account.accountNumber.slice(-4)}` : account.email || '-'}
                      </span>
                    </div>
                    {account.bankName && (
                      <div className="flex justify-between">
                        <span className="font-sfpro text-xs text-[#626060]">Bank</span>
                        <span className="font-sfpro text-xs font-semibold text-[#1E1E1E]">{account.bankName}</span>
                      </div>
                    )}
                    {account.isPrimary && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[#039994] text-white">Primary</span>
                    )}
                    {idx < bankDetails.length - 1 && <hr className="my-2" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sfpro text-xs text-[#626060]">No bank details on file</p>
            )}
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
                  <tr key={payout.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-sfpro p-3" title={payout.id}>
                      {payout.id}
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
