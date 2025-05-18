"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Sample buyers data
const buyers = [
  { name: "Environ" },
  { name: "3Degrees" },
  { name: "Xpex" },
  { name: "Environ" },
  // Add more buyers if needed
]

export default function ListOfBuyersCard() {
  return (
    <Card className="p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 8C17 10.2091 14.9853 12 12.5 12C10.0147 12 8 10.2091 8 8C8 5.79086 10.0147 4 12.5 4C14.9853 4 17 5.79086 17 8Z" stroke="#039994" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.5 15C8.0815 15 4.5 18.5815 4.5 23H20.5C20.5 18.5815 16.9185 15 12.5 15Z" stroke="#039994" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="text-base font-medium text-gray-900">List of Buyers</h3>
        </div>
        <span className="text-sm text-teal-500 font-medium">(10) Buyers</span>
      </div>
      
      <div className="space-y-4">
        {buyers.map((buyer, index) => (
          <div key={index} className="flex items-center gap-3 border-b border-gray-100 pb-2">
            <div className="h-2 w-2 rounded-full bg-black"></div>
            <span className="text-sm text-gray-700">{buyer.name}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <Button 
          variant="outline" 
          className="w-full border-teal-500 text-teal-500 hover:bg-teal-50"
        >
          View more
        </Button>
      </div>
    </Card>
  )
}