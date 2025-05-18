"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample data for the Residential REC table
const residentialRecData = [
  {
    guid: "GUID",
    groupId: "Group ID",
    userId: "User ID",
    address: "Address",
    startDate: "16-03-2",
    endDate: "16-03-2",
    proRata: "0.01%",
    mwhReported: "3.321",
    startPoints: "100",
    pointsEarned: "25",
    redeemPoints: "10",
    pointsEnd: "115",
    redeemValue: "$11.50"
  },
  {
    guid: "GUID",
    groupId: "Group ID",
    userId: "User ID",
    address: "Address",
    startDate: "16-03-2",
    endDate: "16-03-2",
    proRata: "0.01%",
    mwhReported: "3.321",
    startPoints: "100",
    pointsEarned: "25",
    redeemPoints: "10",
    pointsEnd: "115",
    redeemValue: "$11.50"
  },
  {
    guid: "GUID",
    groupId: "Group ID",
    userId: "User ID",
    address: "Address",
    startDate: "16-03-2",
    endDate: "16-03-2",
    proRata: "0.01%",
    mwhReported: "3.321",
    startPoints: "100",
    pointsEarned: "25",
    redeemPoints: "10",
    pointsEnd: "115",
    redeemValue: "$11.50"
  }
]

export default function ResidentialRECGeneration() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994] flex items-center">
            Residential REC Generation
            <ChevronDown className="h-5 w-5 ml-2 text-[#039994]" />
          </h2>
          <Button variant="outline" className="gap-2">
            <span>Filter by</span>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y text-sm">
                <th className="py-3 px-2 text-left font-medium">GUID</th>
                <th className="py-3 px-2 text-left font-medium">Group ID</th>
                <th className="py-3 px-2 text-left font-medium">User ID</th>
                <th className="py-3 px-2 text-left font-medium">Address</th>
                <th className="py-3 px-2 text-left font-medium">Start date</th>
                <th className="py-3 px-2 text-left font-medium">End date</th>
                <th className="py-3 px-2 text-left font-medium">Pro-Rata</th>
                <th className="py-3 px-2 text-left font-medium">MWh Reported</th>
                <th className="py-3 px-2 text-left font-medium">Start Points</th>
                <th className="py-3 px-2 text-left font-medium">Points Earned</th>
                <th className="py-3 px-2 text-left font-medium">Redeem Points</th>
                <th className="py-3 px-2 text-left font-medium">Points End</th>
                <th className="py-3 px-2 text-left font-medium">Redeem Value</th>
              </tr>
            </thead>
            <tbody>
              {residentialRecData.map((item, index) => (
                <tr key={index} className="border-b text-sm hover:bg-gray-50">
                  <td className="py-3 px-2">{item.guid}</td>
                  <td className="py-3 px-2">{item.groupId}</td>
                  <td className="py-3 px-2">{item.userId}</td>
                  <td className="py-3 px-2">{item.address}</td>
                  <td className="py-3 px-2">{item.startDate}</td>
                  <td className="py-3 px-2">{item.endDate}</td>
                  <td className="py-3 px-2">{item.proRata}</td>
                  <td className="py-3 px-2">{item.mwhReported}</td>
                  <td className="py-3 px-2">{item.startPoints}</td>
                  <td className="py-3 px-2">{item.pointsEarned}</td>
                  <td className="py-3 px-2">{item.redeemPoints}</td>
                  <td className="py-3 px-2">{item.pointsEnd}</td>
                  <td className="py-3 px-2">{item.redeemValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}