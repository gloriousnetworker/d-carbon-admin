"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample data for the Commercial REC table - reduced to 3 rows
const commercialRecData = [
  {
    guid: "GUID",
    userId: "User ID",
    address: "Address",
    startDate: "16-03-2",
    endDate: "16-03-2",
    vintage: "16-03-2",
    mwhReported: "3.321",
    startingRECs: "20",
    recsGenerated: "3",
    proRataRECSold: "0.49",
    recsEnd: "22.51",
    periodRECsSold: "500",
    proRata: "0.01%",
    salePrice: "$22.00",
    revShare: "60%",
    periodEarned: "$6.47",
  },
  {
    guid: "GUID",
    userId: "User ID",
    address: "Address",
    startDate: "16-03-2",
    endDate: "16-03-2",
    vintage: "16-03-2",
    mwhReported: "3.321",
    startingRECs: "20",
    recsGenerated: "3",
    proRataRECSold: "0.49",
    recsEnd: "22.51",
    periodRECsSold: "500",
    proRata: "0.01%",
    salePrice: "$22.00",
    revShare: "60%",
    periodEarned: "$6.47",
  },
  {
    guid: "GUID",
    userId: "User ID",
    address: "Address",
    startDate: "16-03-2",
    endDate: "16-03-2",
    vintage: "16-03-2",
    mwhReported: "3.321",
    startingRECs: "20",
    recsGenerated: "3",
    proRataRECSold: "0.49",
    recsEnd: "22.51",
    periodRECsSold: "500",
    proRata: "0.01%",
    salePrice: "$22.00",
    revShare: "60%",
    periodEarned: "$6.47",
  }
]

export default function CommercialRECGeneration() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994]">Commercial REC Generation</h2>
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
                <th className="py-3 px-2 text-left font-medium">User ID</th>
                <th className="py-3 px-2 text-left font-medium">Address</th>
                <th className="py-3 px-2 text-left font-medium">Start date</th>
                <th className="py-3 px-2 text-left font-medium">End date</th>
                <th className="py-3 px-2 text-left font-medium">Vintage</th>
                <th className="py-3 px-2 text-left font-medium">MWh Reported</th>
                <th className="py-3 px-2 text-left font-medium">Starting RECs</th>
                <th className="py-3 px-2 text-left font-medium">RECs Generated</th>
                <th className="py-3 px-2 text-left font-medium">Pro-Rata REC sold</th>
                <th className="py-3 px-2 text-left font-medium">RECs End</th>
                <th className="py-3 px-2 text-left font-medium">Period RECs sold</th>
                <th className="py-3 px-2 text-left font-medium">Pro-Rata</th>
                <th className="py-3 px-2 text-left font-medium">Sale Price</th>
                <th className="py-3 px-2 text-left font-medium">Rev. Share</th>
                <th className="py-3 px-2 text-left font-medium">Period Earned</th>
              </tr>
            </thead>
            <tbody>
              {commercialRecData.map((item, index) => (
                <tr key={index} className="border-b text-sm hover:bg-gray-50">
                  <td className="py-3 px-2">{item.guid}</td>
                  <td className="py-3 px-2">{item.userId}</td>
                  <td className="py-3 px-2">{item.address}</td>
                  <td className="py-3 px-2">{item.startDate}</td>
                  <td className="py-3 px-2">{item.endDate}</td>
                  <td className="py-3 px-2">{item.vintage}</td>
                  <td className="py-3 px-2">{item.mwhReported}</td>
                  <td className="py-3 px-2">{item.startingRECs}</td>
                  <td className="py-3 px-2">{item.recsGenerated}</td>
                  <td className="py-3 px-2">{item.proRataRECSold}</td>
                  <td className="py-3 px-2">{item.recsEnd}</td>
                  <td className="py-3 px-2">{item.periodRECsSold}</td>
                  <td className="py-3 px-2">{item.proRata}</td>
                  <td className="py-3 px-2">{item.salePrice}</td>
                  <td className="py-3 px-2">{item.revShare}</td>
                  <td className="py-3 px-2">{item.periodEarned}</td>
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