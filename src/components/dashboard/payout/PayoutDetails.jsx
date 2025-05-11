"use client"

import { ChevronLeft } from "lucide-react"
import * as styles from "./styles"

export default function PayoutDetails({ payoutDetails, onBack, payoutType }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-teal-500"
      case "Pending":
        return "text-[#FFB200]"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button, status and payout button */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className="flex items-center text-[#039994]"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to {payoutType}</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <span className={`text-sm font-medium ${getStatusColor(payoutDetails.status)}`}>
                {payoutDetails.status}
              </span>
            </div>
            
            <button className="bg-black text-white rounded-md px-4 py-2 text-sm font-medium">
              {payoutType.includes("Residential") ? "Payout Redemption" : 
               payoutType.includes("Commercial") ? "Process Payout" : "Pay Commission"}
            </button>
          </div>
        </div>
        
        {/* Details card */}
        <div className="rounded-lg border border-[#039994] bg-[#069B960D] overflow-hidden">
          <div className="p-6 space-y-4">
            {/* Information rows */}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Name</span>
              <span className="text-sm">{payoutDetails.name}</span>
            </div>
            
            {payoutType.includes("Residential") && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Resident ID</span>
                  <span className="text-sm">{payoutDetails.residentId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email Address</span>
                  <span className="text-sm">{payoutDetails.email || "N/A"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Phone number</span>
                  <span className="text-sm">{payoutDetails.phone || "N/A"}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Payment ID</span>
                  <span className="text-sm">{payoutDetails.paymentId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Points Redeemed</span>
                  <span className="text-sm">{payoutDetails.pointRedeemed || payoutDetails.pointsRedeemed}</span>
                </div>
              </>
            )}
            
            {payoutType.includes("Commercial") && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Commercial ID</span>
                  <span className="text-sm">{payoutDetails.commercialId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Invoice ID</span>
                  <span className="text-sm">{payoutDetails.invoiceId}</span>
                </div>
              </>
            )}
            
            {payoutType.includes("Partner") && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Partner ID</span>
                  <span className="text-sm">{payoutDetails.partnerId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Invoice ID</span>
                  <span className="text-sm">{payoutDetails.invoiceId}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Commission Rate</span>
                  <span className="text-sm">{payoutDetails.commissionRate || "10%"}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Date</span>
              <span className="text-sm">{payoutDetails.date}</span>
            </div>
          </div>
          
          {/* Total amount footer */}
          <div className="flex justify-between items-center bg-[#039994] text-white p-4">
            <span className="font-medium">
              {payoutType.includes("Partner") ? "Total Commission Payable" : "Total Amount"}
            </span>
            <span className="font-bold">
              {payoutType.includes("Partner") ? payoutDetails.totalCommission : payoutDetails.totalAmount}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}