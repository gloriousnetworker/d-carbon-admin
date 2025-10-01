"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

export default function ResidentialPayoutDetails({ payoutDetails, onBack }) {
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [processingStatus, setProcessingStatus] = useState(null)
  const [commissionBreakdown, setCommissionBreakdown] = useState(null)
  const [commissionTotal, setCommissionTotal] = useState(null)
  const [payoutHistory, setPayoutHistory] = useState(null)
  const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [loading, setLoading] = useState(false)

  const years = Array.from({length: 4}, (_, i) => new Date().getFullYear() - i)
  const quarters = [1, 2, 3, 4]

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-[#039994]"
      case "Pending":
        return "text-[#F59E0B]"
      default:
        return "text-gray-500"
    }
  }

  const initiateBackgroundProcess = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/process-quarter-background/${payoutDetails.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          quarter: selectedQuarter,
          year: selectedYear
        })
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to initiate background process')
    } finally {
      setLoading(false)
      setShowProcessModal(false)
    }
  }

  const processFacilities = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/process-quarter/${payoutDetails.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          quarter: selectedQuarter,
          year: selectedYear
        })
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to process facilities')
    } finally {
      setLoading(false)
      setShowProcessModal(false)
    }
  }

  const checkProcessingStatus = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/processing-status/${payoutDetails.id}?quarter=${selectedQuarter}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setProcessingStatus(data.data)
      if (data.data.isComplete) {
        toast.success('Quarter processing is complete')
      } else {
        toast.error('Quarter processing is not complete')
      }
    } catch (error) {
      toast.error('Failed to check processing status')
    }
  }

  const getCommissionBreakdown = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/commission-breakdown/${payoutDetails.id}?quarter=${selectedQuarter}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setCommissionBreakdown(data.data)
    } catch (error) {
      toast.error('Failed to get commission breakdown')
    }
  }

  const getCommissionTotal = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/commission-total/${payoutDetails.id}?quarter=${selectedQuarter}&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setCommissionTotal(data.data)
    } catch (error) {
      toast.error('Failed to get commission total')
    }
  }

  const getPayoutHistory = async () => {
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/history/${payoutDetails.id}?page=1&limit=10&year=${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      const data = await response.json()
      setPayoutHistory(data.data)
    } catch (error) {
      toast.error('Failed to get payout history')
    }
  }

  const markAsPaid = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout/mark-as-paid/${payoutDetails.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          quarter: selectedQuarter,
          year: selectedYear,
          transactionId: transactionId,
          paymentMethod: paymentMethod
        })
      })
      const data = await response.json()
      if (data.status === 'success') {
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to mark as paid')
    } finally {
      setLoading(false)
      setShowMarkAsPaidModal(false)
      setTransactionId('')
    }
  }

  useEffect(() => {
    if (payoutDetails.id) {
      checkProcessingStatus()
      getCommissionBreakdown()
      getCommissionTotal()
      getPayoutHistory()
    }
  }, [payoutDetails.id, selectedQuarter, selectedYear])

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChevronLeft 
            className="h-5 w-5 text-[#039994] cursor-pointer" 
            onClick={onBack}
          />
          <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Payout Details</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Status:</span>
            <span className={`font-sfpro text-[14px] font-[600] ${getStatusColor(payoutDetails.status)}`}>
              {payoutDetails.status}
            </span>
          </div>
          
          <Button 
            className="bg-[#1E1E1E] text-white px-6 py-2 rounded-md font-sfpro text-[14px] hover:bg-[#2E2E2E]"
            onClick={() => setShowMarkAsPaidModal(true)}
          >
            Payout Redemption
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <select 
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
          className="p-2 border rounded-md font-sfpro text-[14px]"
        >
          {quarters.map(q => (
            <option key={q} value={q}>Q{q}</option>
          ))}
        </select>
        
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="p-2 border rounded-md font-sfpro text-[14px]"
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <Button 
          onClick={() => setShowProcessModal(true)}
          className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro text-[14px] hover:bg-[#028884]"
        >
          Process Quarter
        </Button>

        <Button 
          onClick={checkProcessingStatus}
          className="bg-[#F59E0B] text-white px-4 py-2 rounded-md font-sfpro text-[14px] hover:bg-[#E58E0A]"
        >
          Check Status
        </Button>
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
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Resident ID</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.residentId}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Payment ID</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.paymentId}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Points Redeemed</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.pointRedeemed}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Date</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.date}</span>
          </div>
        </div>
        
        <div className="mt-6 bg-[#039994] text-white p-4 rounded-lg flex justify-between items-center">
          <span className="font-sfpro text-[16px] font-[600]">Total Amount</span>
          <span className="font-sfpro text-[20px] font-[700]">{payoutDetails.totalAmount}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-sfpro text-[14px] font-[600] mb-2">Processing Status</h3>
          <p className="font-sfpro text-[12px] text-[#626060]">
            {processingStatus ? (processingStatus.isComplete ? 'Complete' : 'In Progress') : 'Loading...'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-sfpro text-[14px] font-[600] mb-2">Commission Total</h3>
          <p className="font-sfpro text-[12px] text-[#626060]">
            {commissionTotal ? `$${commissionTotal.total}` : 'Loading...'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-sfpro text-[14px] font-[600] mb-2">Paid Out</h3>
          <p className="font-sfpro text-[12px] text-[#626060]">
            {commissionBreakdown ? `$${commissionBreakdown.totalPaidOut}` : 'Loading...'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-sfpro text-[14px] font-[600] mb-2">Pending</h3>
          <p className="font-sfpro text-[12px] text-[#626060]">
            {commissionBreakdown ? `$${commissionBreakdown.totalPending}` : 'Loading...'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border">
        <h3 className="font-sfpro text-[18px] font-[600] mb-4">Payout History</h3>
        <div className="space-y-2">
          {payoutHistory && payoutHistory.payouts.length > 0 ? (
            payoutHistory.payouts.map((payout, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">{payout.date}</span>
                <span className="font-sfpro text-[14px] text-[#626060]">${payout.amount}</span>
              </div>
            ))
          ) : (
            <p className="font-sfpro text-[14px] text-[#626060] text-center py-4">No payout history found</p>
          )}
        </div>
      </div>

      {showMarkAsPaidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-sfpro text-[18px] font-[600] mb-4">Mark as Paid</h3>
            
            <div className="space-y-4">
              <div>
                <label className="font-sfpro text-[14px] text-[#1E1E1E] block mb-2">Transaction ID</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full p-2 border rounded-md font-sfpro text-[14px]"
                  placeholder="Enter transaction ID"
                />
              </div>
              
              <div>
                <label className="font-sfpro text-[14px] text-[#1E1E1E] block mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded-md font-sfpro text-[14px]"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={markAsPaid}
                disabled={loading || !transactionId}
                className="flex-1 bg-[#039994] text-white py-2 rounded-md font-sfpro text-[14px] hover:bg-[#028884] disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </Button>
              <Button
                onClick={() => setShowMarkAsPaidModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-md font-sfpro text-[14px] hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h3 className="font-sfpro text-[18px] font-[600] mb-4">Process Quarter</h3>
            <p className="font-sfpro text-[14px] text-[#626060] mb-6">
              Process Q{selectedQuarter} {selectedYear} for {payoutDetails.firstName} {payoutDetails.lastName}?
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={initiateBackgroundProcess}
                disabled={loading}
                className="flex-1 bg-[#039994] text-white py-2 rounded-md font-sfpro text-[14px] hover:bg-[#028884] disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Background Process'}
              </Button>
              <Button
                onClick={processFacilities}
                disabled={loading}
                className="flex-1 bg-[#F59E0B] text-white py-2 rounded-md font-sfpro text-[14px] hover:bg-[#E58E0A] disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Process Facilities'}
              </Button>
              <Button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-md font-sfpro text-[14px] hover:bg-gray-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}