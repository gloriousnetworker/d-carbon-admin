"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, Eye, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

export default function CommercialPayoutDetails({ payoutDetails, onBack, onPayoutUpdate }) {
  const [userPayouts, setUserPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const getAdminId = () => {
    return localStorage.getItem("userId")
  }

  const fetchUserPayouts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`https://services.dcarbon.solutions/api/payout-request?userId=${payoutDetails.id}&userType=COMMERCIAL`, {
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
        const updatedPayout = { id: payoutId, status: "PAID" }
        setUserPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status: "PAID" } : p))
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

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setScale(1)
    setRotation(0)
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const getFileType = (url) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image'
    } else if (['pdf'].includes(extension)) {
      return 'pdf'
    } else if (['doc', 'docx'].includes(extension)) {
      return 'document'
    }
    return 'unknown'
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

  useEffect(() => {
    if (payoutDetails.id) {
      fetchUserPayouts()
    }
  }, [payoutDetails.id])

  return (
    <div className="p-4">
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-sfpro text-[18px] font-[600]">Invoice Document</h3>
              <div className="flex gap-2">
                {getFileType(selectedInvoice) === 'image' && (
                  <div className="flex gap-2 mr-4">
                    <Button
                      onClick={zoomIn}
                      className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600"
                      title="Zoom In"
                    >
                      <ZoomIn size={16} />
                    </Button>
                    <Button
                      onClick={zoomOut}
                      className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600"
                      title="Zoom Out"
                    >
                      <ZoomOut size={16} />
                    </Button>
                    <Button
                      onClick={resetZoom}
                      className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600"
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </Button>
                    <Button
                      onClick={rotate}
                      className="bg-gray-500 text-white px-3 py-2 rounded-md font-sfpro hover:bg-gray-600"
                      title="Rotate"
                    >
                      ↻
                    </Button>
                  </div>
                )}
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#028884] flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </Button>
                <Button
                  onClick={closeModal}
                  className="bg-[#FF0000] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#CC0000]"
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              {getFileType(selectedInvoice) === 'image' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 overflow-auto">
                  <img 
                    src={selectedInvoice} 
                    alt="Invoice" 
                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                    style={{ 
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      cursor: scale > 1 ? 'grab' : 'default'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                  <div className="hidden text-center p-8">
                    <p className="font-sfpro text-[16px] text-gray-500 mb-4">Unable to display image</p>
                    <Button
                      onClick={() => handleDownloadInvoice(selectedInvoice)}
                      className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#028884] flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download File
                    </Button>
                  </div>
                </div>
              ) : getFileType(selectedInvoice) === 'pdf' ? (
                <iframe
                  src={`${selectedInvoice}#view=FitH&zoom=fit`}
                  className="w-full h-full border rounded-lg"
                  title="Invoice Document"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center p-8">
                    <p className="font-sfpro text-[16px] text-gray-500 mb-4">Preview not available for this file type</p>
                    <Button
                      onClick={() => handleDownloadInvoice(selectedInvoice)}
                      className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#028884] flex items-center gap-2"
                    >
                      <Download size={16} />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {getFileType(selectedInvoice) === 'image' && (
              <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
                <span className="font-sfpro text-sm text-gray-600">
                  Zoom: {Math.round(scale * 100)}%
                </span>
                <span className="font-sfpro text-sm text-gray-600">
                  Use mouse wheel to scroll when zoomed in
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChevronLeft 
            className="h-5 w-5 text-[#039994] cursor-pointer" 
            onClick={onBack}
          />
          <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Commercial Payout Details</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">User ID:</span>
            <span className="font-sfpro text-[14px] text-[#626060]">
              {payoutDetails.id}
            </span>
          </div>
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
                  <th className="pb-2 font-sfpro font-semibold p-3">Invoice</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Status</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Created At</th>
                  <th className="pb-2 font-sfpro font-semibold p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userPayouts.map((payout) => (
                  <tr key={payout.id} className="border-t">
                    <td className="py-3 font-sfpro p-3" title={payout.id}>
                      {payout.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 font-sfpro p-3">
                      ${payout.amountRequested.toFixed(2)}
                    </td>
                    <td className="py-3 p-3">
                      {payout.invoice ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleViewInvoice(payout.invoice)}
                            className="bg-[#039994] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#028884] flex items-center gap-1"
                          >
                            <Eye size={14} />
                            View
                          </Button>
                          <Button
                            onClick={() => handleDownloadInvoice(payout.invoice)}
                            className="bg-gray-500 text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-gray-600 flex items-center gap-1"
                          >
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