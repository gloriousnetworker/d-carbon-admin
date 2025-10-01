"use client"
import { useState, useEffect } from 'react'
import { ChevronLeft, Upload, Eye, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

export default function PartnerCommissionPayoutDetails({ payoutDetails, onBack, isLoading }) {
  const [status, setStatus] = useState(payoutDetails.status)
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [uploadedInvoice, setUploadedInvoice] = useState(null)
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
  const detailedInfo = payoutDetails.detailedInfo || {}

  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "text-[#039994]"
      case "Pending":
        return "text-[#F59E0B]"
      default:
        return "text-gray-500"
    }
  }

  const handleTogglePayment = () => {
    if (status === "Pending") {
      setStatus("Paid")
      setShowInvoiceUpload(true)
    } else {
      setStatus("Pending")
      setShowInvoiceUpload(false)
    }
  }

  const handleInvoiceUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setUploadedInvoice(file)
    }
  }

  const handleSendInvoice = () => {
    if (uploadedInvoice) {
      toast.success("Invoice sent successfully!")
      setUploadedInvoice(null)
      setShowInvoiceUpload(false)
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
        setStatus("Paid")
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

  const DocumentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-sfpro font-semibold">Document Preview</h3>
          <button
            onClick={() => setShowDocumentModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <p className="font-sfpro">Document Preview</p>
            <p className="text-sm text-gray-400 mt-2">Commission_Statement_{payoutDetails.partnerId}.pdf</p>
          </div>
          <Button className="mt-4 bg-[#039994] text-white">
            <Download className="w-4 h-4 mr-2" />
            Download Document
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChevronLeft
            className="h-5 w-5 text-[#039994] cursor-pointer"
            onClick={onBack}
          />
          <h1 className="font-sfpro text-[20px] font-[600] text-[#039994]">Invoice Details</h1>
        </div>
       
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Status:</span>
            <span className={`font-sfpro text-[14px] font-[600] ${getStatusColor(status)}`}>
              {status}
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

      {isLoading ? (
        <div style={{ backgroundColor: '#069B960D' }} className="rounded-lg p-6 border border-[#C1E8E5] flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#039994] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600 font-sfpro">Loading user details...</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#069B960D' }} className="rounded-lg p-6 border border-[#C1E8E5]">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">User ID</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{detailedInfo.id || payoutDetails.id}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">First Name</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{detailedInfo.firstName || payoutDetails.firstName}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Last Name</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{detailedInfo.lastName || payoutDetails.lastName}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Name</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.name}</span>
              </div>
         
              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Partner ID</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.partnerId}</span>
              </div>
         
              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Email Address</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{detailedInfo.email || payoutDetails.email}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">User Type</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{detailedInfo.userType || payoutDetails.userType}</span>
              </div>
         
              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Phone number</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{detailedInfo.phoneNumber || '+234-000-0000-000'}</span>
              </div>
         
              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Invoice ID</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.invoiceId}</span>
              </div>
         
              <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
                <span className="font-sfpro text-[14px] text-[#1E1E1E]">Date</span>
                <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.date}</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 mb-6 border border-[#E5E7EB]">
              <h3 className="font-sfpro text-[16px] font-[600] text-[#039994] mb-4">Invoice</h3>
          
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Total REC Sold (Commercial)</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{commissionBreakdown?.facilityBreakdown?.commercial?.totalSold || 0}</span>
                </div>
            
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Total REC Sold (DGG)</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{commissionBreakdown?.facilityBreakdown?.residential?.totalSold || 0}</span>
                </div>
            
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Average $/REC price</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${commissionBreakdown?.averagePrice || 0}</span>
                </div>
            
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Avg. Commission % (Commercial)</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{commissionBreakdown?.facilityBreakdown?.commercial?.commissionRate || 0}%</span>
                </div>
            
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Avg. Commission % (Residential)</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{commissionBreakdown?.facilityBreakdown?.residential?.commissionRate || 0}%</span>
                </div>
            
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Commission payable ($) (Commercial)</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${commissionBreakdown?.facilityBreakdown?.commercial?.commissionAmount || 0}</span>
                </div>
            
                <div className="flex items-center justify-between">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Commission payable ($) (Residential)</span>
                  <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${commissionBreakdown?.facilityBreakdown?.residential?.commissionAmount || 0}</span>
                </div>
            
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                  <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Submitted Document</span>
                  <button
                    onClick={() => setShowDocumentModal(true)}
                    className="flex items-center gap-2 text-[#039994] hover:underline font-sfpro text-[14px]"
                  >
                    <Eye className="w-4 h-4" />
                    View Document
                  </button>
                </div>
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
       
            <div className="bg-[#039994] text-white p-4 rounded-lg flex justify-between items-center">
              <span className="font-sfpro text-[16px] font-[600]">Total Commission Payable</span>
              <span className="font-sfpro text-[20px] font-[700]">${commissionTotal ? commissionTotal.total : '0.00'}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border mt-6">
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

          {showInvoiceUpload && (
            <div className="mt-6 bg-white rounded-lg p-6 border border-[#E5E7EB]">
              <h3 className="font-sfpro text-[16px] font-[600] text-[#1E1E1E] mb-4">Upload Payment Invoice</h3>
          
              <div className="border-2 border-dashed border-[#C1E8E5] rounded-lg p-6 text-center mb-4">
                <Upload className="w-12 h-12 text-[#039994] mx-auto mb-3" />
                <p className="font-sfpro text-[14px] text-[#626060] mb-2">
                  Drag and drop your invoice here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleInvoiceUpload}
                  className="hidden"
                  id="invoice-upload"
                />
                <label
                  htmlFor="invoice-upload"
                  className="inline-block bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro text-[14px] cursor-pointer hover:bg-[#028A85]"
                >
                  Choose File
                </label>
              </div>

              {uploadedInvoice && (
                <div className="bg-[#F8F9FA] rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#039994] rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-sfpro text-[14px] font-[500] text-[#1E1E1E]">{uploadedInvoice.name}</p>
                        <p className="font-sfpro text-[12px] text-[#626060]">
                          {(uploadedInvoice.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedInvoice(null)}
                      className="text-red-500 hover:text-red-700 font-sfpro text-[14px]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSendInvoice}
                  disabled={!uploadedInvoice}
                  className="bg-[#039994] text-white px-6 py-2 rounded-md font-sfpro text-[14px] hover:bg-[#028A85] disabled:bg-gray-300"
                >
                  Send Invoice
                </Button>
                <Button
                  onClick={() => setShowInvoiceUpload(false)}
                  variant="outline"
                  className="px-6 py-2 rounded-md font-sfpro text-[14px]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showDocumentModal && <DocumentModal />}
        </>
      )}

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