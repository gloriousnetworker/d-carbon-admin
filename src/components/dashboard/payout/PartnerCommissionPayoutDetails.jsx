"use client"
import { useState } from 'react'
import { ChevronLeft, Upload, Eye, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function PartnerCommissionPayoutDetails({ payoutDetails, onBack }) {
  const [status, setStatus] = useState(payoutDetails.status)
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [uploadedInvoice, setUploadedInvoice] = useState(null)

  const recSoldCommercial = 24
  const recSoldResidential = 64
  const avgRecPrice = 15.00
  const avgCommissionCommercial = 0.12
  const avgCommissionResidential = 0.24

  const commissionPayableCommercial = recSoldCommercial * avgRecPrice * avgCommissionCommercial
  const commissionPayableResidential = recSoldResidential * avgRecPrice * avgCommissionResidential
  const totalCommissionPayable = commissionPayableCommercial + commissionPayableResidential

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
      alert("Invoice sent successfully!")
      setUploadedInvoice(null)
      setShowInvoiceUpload(false)
    }
  }

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
         
          <label className="flex items-center cursor-pointer">
            <span className="font-sfpro text-[14px] text-[#1E1E1E] mr-2">Toggle Payment</span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={status === "Paid"}
                onChange={handleTogglePayment}
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${status === "Paid" ? 'bg-[#039994]' : 'bg-gray-300'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${status === "Paid" ? 'translate-x-6' : 'translate-x-1'} mt-1`}></div>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div style={{ backgroundColor: '#069B960D' }} className="rounded-lg p-6 border border-[#C1E8E5]">
        <div className="space-y-4 mb-6">
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
            <span className="font-sfpro text-[14px] text-[#626060]">name@domain.com</span>
          </div>
         
          <div className="flex justify-between items-center py-3 border-b border-[#C1E8E5]">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Phone number</span>
            <span className="font-sfpro text-[14px] text-[#626060]">+234-000-0000-000</span>
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
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{recSoldCommercial}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Total REC Sold (DGG)</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{recSoldResidential}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Average $/REC price</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${avgRecPrice.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Avg. Commission % (Commercial)</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{(avgCommissionCommercial * 100).toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Avg. Commission % (Residential)</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">{(avgCommissionResidential * 100).toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Commission payable ($) (Commercial)</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${commissionPayableCommercial.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-sfpro text-[14px] text-[#1E1E1E]">• Commission payable ($) (Residential)</span>
              <span className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">${commissionPayableResidential.toFixed(2)}</span>
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
       
        <div className="bg-[#039994] text-white p-4 rounded-lg flex justify-between items-center">
          <span className="font-sfpro text-[16px] font-[600]">Total Commission Payable</span>
          <span className="font-sfpro text-[20px] font-[700]">${totalCommissionPayable.toFixed(2)}</span>
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
    </div>
  )
}