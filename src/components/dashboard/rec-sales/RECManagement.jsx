"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data for the REC table
const recData = Array(10).fill({
  guid: "GUID",
  userId: "User ID",
  address: "Address",
  startDate: "16-03-2025",
  endDate: "16-03-2025",
  vintage: "16-03-2025",
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
})

export default function RECManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none data-[state=active]:border-b-0 data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-gray-900"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-teal-500 data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-teal-500"
          >
            Management
          </TabsTrigger>
          <TabsTrigger
            value="entries"
            className="rounded-none data-[state=active]:border-b-0 data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-gray-900"
          >
            Entries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="mt-0">
          <Card className="border-gray-200">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between">
                <h2 className="text-xl font-medium text-teal-500 flex items-center">
                  Commercial REC Generation
                  <ChevronDown className="h-5 w-5 ml-2 text-teal-500" />
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
                    {recData.map((item, index) => (
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
        </TabsContent>

        <TabsContent value="overview">
          <div className="text-center p-8 text-gray-500">Overview content would go here</div>
        </TabsContent>

        <TabsContent value="entries">
          <div className="text-center p-8 text-gray-500">Entries content would go here</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
