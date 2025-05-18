"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample data for the REC Generation Report CA Vintage table
const reportData = [
  {
    startDate: "16-03-2",
    endDate: "16-03-2",
    vintage: "16-03-2",
    mwhReported: "3.321",
    location: "California",
    beginningInventory: "500",
    recsGenerated: "120",
    recsSold: "80",
    endingInventory: "540",
    avgPrice: "$22.00",
    totalSales: "$1,760.00"
  },
  {
    startDate: "16-03-2",
    endDate: "16-03-2",
    vintage: "16-03-2",
    mwhReported: "3.321",
    location: "California",
    beginningInventory: "500",
    recsGenerated: "120",
    recsSold: "80",
    endingInventory: "540",
    avgPrice: "$22.00",
    totalSales: "$1,760.00"
  },
  {
    startDate: "16-03-2",
    endDate: "16-03-2",
    vintage: "16-03-2",
    mwhReported: "3.321",
    location: "California",
    beginningInventory: "500",
    recsGenerated: "120",
    recsSold: "80",
    endingInventory: "540",
    avgPrice: "$22.00",
    totalSales: "$1,760.00"
  }
]

export default function RECGenerationReport() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994] flex items-center">
            REC Generation Report CA Vintage
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
                <th className="py-3 px-2 text-left font-medium">Start date</th>
                <th className="py-3 px-2 text-left font-medium">End date</th>
                <th className="py-3 px-2 text-left font-medium">Vintage</th>
                <th className="py-3 px-2 text-left font-medium">MWh Reported</th>
                <th className="py-3 px-2 text-left font-medium">Location</th>
                <th className="py-3 px-2 text-left font-medium">Beginning Inventory</th>
                <th className="py-3 px-2 text-left font-medium">RECs Generated</th>
                <th className="py-3 px-2 text-left font-medium">RECs Sold</th>
                <th className="py-3 px-2 text-left font-medium">Ending Inventory</th>
                <th className="py-3 px-2 text-left font-medium">Avg. Price</th>
                <th className="py-3 px-2 text-left font-medium">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index} className="border-b text-sm hover:bg-gray-50">
                  <td className="py-3 px-2">{item.startDate}</td>
                  <td className="py-3 px-2">{item.endDate}</td>
                  <td className="py-3 px-2">{item.vintage}</td>
                  <td className="py-3 px-2">{item.mwhReported}</td>
                  <td className="py-3 px-2">{item.location}</td>
                  <td className="py-3 px-2">{item.beginningInventory}</td>
                  <td className="py-3 px-2">{item.recsGenerated}</td>
                  <td className="py-3 px-2">{item.recsSold}</td>
                  <td className="py-3 px-2">{item.endingInventory}</td>
                  <td className="py-3 px-2">{item.avgPrice}</td>
                  <td className="py-3 px-2">{item.totalSales}</td>
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