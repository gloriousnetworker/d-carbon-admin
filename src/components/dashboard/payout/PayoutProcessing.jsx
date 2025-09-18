"use client"

import { useState } from "react"
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import ResidentialRedemptionPayout from "./ResidentialRedemptionPayout"
import CommercialStatementReport from "./CommercialStatementReport"
import PartnerCommissionPayout from "./PartnerCommissionPayout"
import * as styles from "./styles"

export default function PayoutProcessing() {
  const [payoutType, setPayoutType] = useState("Residential Redemption Payout")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const payoutTypes = [
    "Residential Redemption Payout", 
    "Commercial Statement Payout", 
    "Partner Commission Payout"
  ]

  const handlePayoutTypeChange = (type) => {
    setPayoutType(type)
    setIsDropdownOpen(false)
  }

  const renderPayoutComponent = () => {
    switch(payoutType) {
      case "Residential Redemption Payout":
        return <ResidentialRedemptionPayout />
      case "Commercial Statement Payout":
        return <CommercialStatementReport />
      case "Partner Commission Payout":
        return <PartnerCommissionPayout />
      default:
        return <ResidentialRedemptionPayout />
    }
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <div className="relative">
              <div 
                className={`text-xl font-medium text-[#039994] flex items-center cursor-pointer font-sfpro`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {payoutType}
                <ChevronDown className="h-5 w-5 ml-2 text-[#039994]" />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 z-10 w-64 bg-white shadow-lg rounded-md border border-gray-200 mt-1">
                  {payoutTypes.map((type) => (
                    <div 
                      key={type} 
                      className="p-3 hover:bg-gray-50 cursor-pointer font-sfpro text-[14px] text-[#1E1E1E]"
                      onClick={() => handlePayoutTypeChange(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {renderPayoutComponent()}
        </CardContent>
      </Card>
    </div>
  )
}