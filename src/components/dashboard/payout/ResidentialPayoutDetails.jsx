"use client"

import { ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import * as styles from "./styles"

export default function ResidentialPayoutDetails({ payoutDetails, onBack }) {
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
          
          <Button className="bg-[#1E1E1E] text-white px-6 py-2 rounded-md font-sfpro text-[14px] hover:bg-[#2E2E2E]">
            Payout Redemption
          </Button>
        </div>
      </div>

      <div className="bg-[#E8F5F4] rounded-lg p-6 border border-[#C1E8E5]">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Name</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.name}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Resident ID</span>
            <span className="font-sfpro text-[14px] text-[#626060]">{payoutDetails.residentId}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Email Address</span>
            <span className="font-sfpro text-[14px] text-[#626060]">name@domain.com</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b">
            <span className="font-sfpro text-[14px] text-[#1E1E1E]">Phone number</span>
            <span className="font-sfpro text-[14px] text-[#626060]">+234-000-0000-000</span>
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
    </div>
  )
}