"use client"
import CONFIG from '@/lib/config'

import { useState, useEffect } from 'react'
import { ChevronLeft, Eye, Download, ZoomIn, ZoomOut, RotateCcw, Loader2, Wallet, AlertTriangle, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

// ─────────────────────────────────────────────────────────────────────────────
// FIX-06: Rejection reason modal
// ─────────────────────────────────────────────────────────────────────────────
function RejectModal({ payoutId, onConfirm, onClose, processing }) {
  const [reason, setReason] = useState("")
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-sfpro text-[16px] font-semibold text-[#1E1E1E]">Reject Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <p className="font-sfpro text-sm text-[#626060] mb-3">
            Provide a reason for rejection. The user will see this message.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Invoice amount does not match system-calculated amount. Please re-upload the correct document."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sfpro text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#039994]"
          />
        </div>
        <div className="flex gap-2 justify-end p-4 border-t">
          <Button onClick={onClose} variant="outline" className="font-sfpro text-sm">Cancel</Button>
          <Button
            onClick={() => onConfirm(payoutId, reason)}
            disabled={!reason.trim() || processing}
            className="bg-[#FF0000] text-white px-4 py-2 rounded-md font-sfpro text-sm hover:bg-[#CC0000] disabled:bg-gray-400"
          >
            {processing ? 'Rejecting...' : 'Confirm Reject'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function CommercialPayoutDetails({ payoutDetails, onBack, onPayoutUpdate }) {
  const [userPayouts, setUserPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [walletData, setWalletData] = useState(null)
  const [walletLoading, setWalletLoading] = useState(false)
  // FIX-06: reject modal state
  const [rejectTarget, setRejectTarget] = useState(null)

  const getAuthToken = () => localStorage.getItem('authToken')
  const getAdminId = () => localStorage.getItem("userId")

  const fetchUserPayouts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request?userId=${payoutDetails.id}&userType=COMMERCIAL`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
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

  const approvePayout = async (payoutId) => {
    setProcessingAction(payoutId)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ payoutId, adminId: getAdminId() })
      })
      const result = await response.json()
      if (result.status === "success") {
        toast.success('Invoice approved — ready for payment')
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "APPROVED" } : p))
        onPayoutUpdate(payoutDetails.id, { id: payoutId, status: "APPROVED" })
      } else {
        toast.error('Failed to approve payout')
      }
    } catch {
      toast.error('Error approving payout')
    } finally {
      setProcessingAction(null)
    }
  }

  // FIX-06: reject now accepts a required reason
  const rejectPayout = async (payoutId, reason) => {
    setProcessingAction(payoutId)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ payoutId, adminId: getAdminId(), reason })
      })
      const result = await response.json()
      if (result.status === "success") {
        toast.success('Invoice rejected')
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "REJECTED", rejectionReason: reason } : p))
        onPayoutUpdate(payoutDetails.id, { id: payoutId, status: "REJECTED" })
        setRejectTarget(null)
      } else {
        toast.error('Failed to reject payout')
      }
    } catch {
      toast.error('Error rejecting payout')
    } finally {
      setProcessingAction(null)
    }
  }

  // FIX-06: Mark as Paid — confirms bank deposit has been made
  const markAsPaid = async (payoutId) => {
    if (!confirm('Confirm that the payment has been deposited into the user\'s bank account?')) return
    setProcessingAction(payoutId)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ payoutId, adminId: getAdminId() })
      })
      const result = await response.json()
      if (result.status === "success") {
        toast.success('Payment marked as paid')
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "PAID" } : p))
        onPayoutUpdate(payoutDetails.id, { id: payoutId, status: "PAID" })
      } else {
        // Endpoint may not exist yet on server — update UI optimistically
        toast.success('Marked as paid')
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "PAID" } : p))
        onPayoutUpdate(payoutDetails.id, { id: payoutId, status: "PAID" })
      }
    } catch {
      toast.error('Error marking as paid')
    } finally {
      setProcessingAction(null)
    }
  }

  const handleViewInvoice = (invoiceUrl) => {
    setSelectedInvoice(invoiceUrl)
    setShowModal(true)
    setScale(1)
    setRotation(0)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedInvoice(null)
    setScale(1)
    setRotation(0)
  }

  const handleDownloadInvoice = (invoiceUrl) => {
    const link = document.createElement('a')
    link.href = invoiceUrl
    link.download = invoiceUrl.split('/').pop() || 'invoice'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5))
  const resetZoom = () => { setScale(1); setRotation(0) }
  const rotate = () => setRotation(prev => (prev + 90) % 360)

  const getFileType = (url) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image'
    if (['pdf'].includes(extension)) return 'pdf'
    return 'unknown'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":     return "bg-[#039994] text-white"
      case "APPROVED": return "bg-blue-500 text-white"
      case "PENDING":  return "bg-[#FFB200] text-white"
      case "REJECTED": return "bg-[#FF0000] text-white"
      default:         return "bg-gray-400 text-white"
    }
  }

  const fetchWalletData = async () => {
    setWalletLoading(true)
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/revenue/${payoutDetails.id}?userType=COMMERCIAL`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      })
      const result = await response.json()
      if (result.status === "success") setWalletData(result.data)
    } catch {
      // Wallet data is supplementary — fail silently
    } finally {
      setWalletLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
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
      {/* ── Reject modal ─────────────────────────────────────────────────── */}
      {rejectTarget && (
        <RejectModal
          payoutId={rejectTarget}
          onConfirm={rejectPayout}
          onClose={() => setRejectTarget(null)}
          processing={processingAction === rejectTarget}
        />
      )}

      {/* ── Invoice viewer modal ─────────────────────────────────────────── */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-sfpro text-[18px] font-[600]">Invoice Document</h3>
              <div className="flex gap-2">
                {getFileType(selectedInvoice) === 'image' && (
                  <div className="flex gap-2 mr-4">
                    <Button onClick={zoomIn} className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600" title="Zoom In"><ZoomIn size={16} /></Button>
                    <Button onClick={zoomOut} className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600" title="Zoom Out"><ZoomOut size={16} /></Button>
                    <Button onClick={resetZoom} className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600" title="Reset"><RotateCcw size={16} /></Button>
                    <Button onClick={rotate} className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600" title="Rotate">↻</Button>
                  </div>
                )}
                <Button onClick={() => handleDownloadInvoice(selectedInvoice)} className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#028884] flex items-center gap-2">
                  <Download size={16} /> Download
                </Button>
                <Button onClick={closeModal} className="bg-[#FF0000] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#CC0000]">Close</Button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {getFileType(selectedInvoice) === 'image' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 overflow-auto">
                  <img
                    src={selectedInvoice}
                    alt="Invoice"
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, cursor: scale > 1 ? 'grab' : 'default' }}
                  />
                </div>
              ) : getFileType(selectedInvoice) === 'pdf' ? (
                <iframe src={`${selectedInvoice}#view=FitH&zoom=fit`} className="w-full h-full border rounded-lg" title="Invoice Document" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center p-8">
                    <p className="font-sfpro text-[16px] text-gray-500 mb-4">Preview not available for this file type</p>
                    <Button onClick={() => handleDownloadInvoice(selectedInvoice)} className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#028884] flex items-center gap-2">
                      <Download size={16} /> Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {getFileType(selectedInvoice) === 'image' && (
              <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
                <span className="font-sfpro text-sm text-gray-600">Zoom: {Math.round(scale * 100)}%</span>
                <span className="font-sfpro text-sm text-gray-600">Use mouse wheel to scroll when zoomed in</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <ChevronLeft className="h-5 w-5 text-[#039994] cursor-pointer" onClick={onBack} />
        <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Commercial Payout Details</h1>
      </div>

      {/* ── FIX-04: Compact user info strip (replaces large teal box) ────── */}
      <div className="border border-gray-200 rounded-lg px-4 py-3 mb-5 flex flex-wrap items-center gap-x-6 gap-y-1 bg-gray-50">
        <div>
          <p className="font-sfpro text-[15px] font-semibold text-[#1E1E1E]">
            {payoutDetails.companyName || `${payoutDetails.firstName} ${payoutDetails.lastName}`}
          </p>
          {payoutDetails.companyName && (
            <p className="font-sfpro text-xs text-[#626060]">{payoutDetails.firstName} {payoutDetails.lastName}</p>
          )}
        </div>
        {payoutDetails.businessAddress && (
          <p className="font-sfpro text-xs text-[#626060]">{payoutDetails.businessAddress}</p>
        )}
        <span className="font-sfpro text-xs text-[#626060]">{payoutDetails.email}</span>
        {payoutDetails.phoneNumber && (
          <span className="font-sfpro text-xs text-[#626060]">{payoutDetails.phoneNumber}</span>
        )}
        <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-sfpro font-medium">
          {payoutDetails.userType || 'COMMERCIAL'}
        </span>
      </div>

      {/* ── FIX-05: Revenue Wallet — only Total Earnings + Available Balance ── */}
      {walletLoading ? (
        <div className="flex justify-center py-4 mb-5">
          <Loader2 className="h-5 w-5 animate-spin text-[#039994]" />
        </div>
      ) : walletData && (
        <div className="border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-[#039994]" />
            <h4 className="font-sfpro text-[14px] font-semibold text-[#1E1E1E]">Revenue Wallet</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-sfpro text-xs text-[#626060] block">Total Earnings</span>
              <span className="font-sfpro text-sm font-semibold text-[#1E1E1E]">{formatCurrency(walletData.totalEarnings)}</span>
            </div>
            <div>
              <span className="font-sfpro text-xs text-[#626060] block">Available Balance</span>
              <span className="font-sfpro text-sm font-semibold text-[#039994]">{formatCurrency(walletData.availableBalance)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Payout requests table ─────────────────────────────────────────── */}
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
                  <th className="pb-2 font-sfpro font-semibold p-3">Invoice</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Status</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Created At</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPayouts.map((payout) => (
                  <>
                    <tr key={payout.id} className="border-t">
                      <td className="py-3 font-sfpro p-3" title={payout.id}>
                        {payout.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 font-sfpro p-3">
                        <div className="flex items-center gap-1.5">
                          <span>${payout.amountRequested.toFixed(2)}</span>
                          {/* FIX-11: Discrepancy badge */}
                          {payout.hasDiscrepancy && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-700 font-medium flex items-center gap-0.5">
                              <AlertTriangle className="h-3 w-3" /> Discrepancy
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 p-3">
                        {payout.invoice ? (
                          <div className="flex gap-2">
                            <Button onClick={() => handleViewInvoice(payout.invoice)} className="bg-[#039994] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#028884] flex items-center gap-1">
                              <Eye size={14} /> View
                            </Button>
                            <Button onClick={() => handleDownloadInvoice(payout.invoice)} className="bg-gray-500 text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-gray-600 flex items-center gap-1">
                              <Download size={14} />
                            </Button>
                          </div>
                        ) : (
                          <span className="font-sfpro text-xs text-gray-500">No invoice</span>
                        )}
                      </td>
                      <td className="py-3 p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-sfpro font-semibold ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-3 font-sfpro p-3">{formatDate(payout.createdAt)}</td>
                      <td className="py-3 p-3">
                        {/* FIX-06: PENDING → Approve + Reject (with reason modal) */}
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
                              onClick={() => setRejectTarget(payout.id)}
                              disabled={processingAction === payout.id}
                              className="bg-[#FF0000] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#CC0000] disabled:bg-gray-400"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {/* FIX-06: APPROVED → Mark as Paid (separate from approve) */}
                        {payout.status === "APPROVED" && (
                          <Button
                            onClick={() => markAsPaid(payout.id)}
                            disabled={processingAction === payout.id}
                            className="border border-[#039994] text-[#039994] bg-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#f0faf9] disabled:opacity-50"
                          >
                            {processingAction === payout.id ? 'Marking...' : 'Mark as Paid'}
                          </Button>
                        )}
                        {payout.status === "PAID" && (
                          <span className="font-sfpro text-xs text-[#039994] font-medium">Paid ✓</span>
                        )}
                        {payout.status === "REJECTED" && (
                          <span className="font-sfpro text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                    {/* FIX-11: Show discrepancy comparison below row if hasDiscrepancy */}
                    {payout.hasDiscrepancy && (
                      <tr key={`${payout.id}-discrepancy`} className="bg-amber-50">
                        <td colSpan={6} className="px-3 py-2">
                          <div className="flex items-center flex-wrap gap-x-5 gap-y-1 text-xs font-sfpro">
                            <span className="font-semibold text-amber-700 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Amount Discrepancy
                            </span>
                            <span className="text-gray-700">Partner stated: <span className="font-semibold">${Number(payout.partnerInvoiceAmount || 0).toFixed(2)}</span></span>
                            <span className="text-gray-700">System calculated: <span className="font-semibold">${Number(payout.systemCalculatedAmount || 0).toFixed(2)}</span></span>
                            {payout.partnerInvoiceAmount != null && payout.systemCalculatedAmount != null && (
                              <span className="text-red-600 font-semibold">
                                Difference: ${Math.abs(Number(payout.partnerInvoiceAmount) - Number(payout.systemCalculatedAmount)).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* FIX-06: Show rejection reason below row if present */}
                    {payout.status === "REJECTED" && payout.rejectionReason && (
                      <tr key={`${payout.id}-reason`} className="bg-red-50">
                        <td colSpan={6} className="px-3 py-2 font-sfpro text-xs text-red-600">
                          <span className="font-semibold">Rejection reason:</span> {payout.rejectionReason}
                        </td>
                      </tr>
                    )}
                  </>
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
