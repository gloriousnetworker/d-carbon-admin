"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for the residential groups table
const residentialGroups = Array(10).fill({
  resiGroupId: "Resi. Group ID",
  wregisId: "WREGIS ID",
  dCarbonId: "DCarbon ID",
  financeComp: "Finance Comp.",
  installer: "Installer",
  utilityProv: "Utility Prov.",
  totalRECProd: "200",
  totalKW: "250",
})

export default function ResiGroupManagement() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="flex justify-between mb-6">
        <div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[80px] bg-white">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <span>Filter by</span>
            <Filter className="h-4 w-4" />
          </Button>
          <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
            <Upload className="h-4 w-4" />
            Create Resident Group
          </Button>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-4">
            <h2 className="text-xl font-medium text-teal-500">Residential Groups</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y text-sm">
                  <th className="py-3 px-4 text-left font-medium">Resi. Group ID</th>
                  <th className="py-3 px-4 text-left font-medium">WREGIS ID</th>
                  <th className="py-3 px-4 text-left font-medium">DCarbon ID</th>
                  <th className="py-3 px-4 text-left font-medium">Finance Comp.</th>
                  <th className="py-3 px-4 text-left font-medium">Installer</th>
                  <th className="py-3 px-4 text-left font-medium">Utility Prov.</th>
                  <th className="py-3 px-4 text-left font-medium">Total REC Prod.</th>
                  <th className="py-3 px-4 text-left font-medium">Total kW</th>
                </tr>
              </thead>
              <tbody>
                {residentialGroups.map((group, index) => (
                  <tr key={index} className="border-b text-sm hover:bg-gray-50">
                    <td className="py-3 px-4">{group.resiGroupId}</td>
                    <td className="py-3 px-4">{group.wregisId}</td>
                    <td className="py-3 px-4">{group.dCarbonId}</td>
                    <td className="py-3 px-4">{group.financeComp}</td>
                    <td className="py-3 px-4">{group.installer}</td>
                    <td className="py-3 px-4">{group.utilityProv}</td>
                    <td className="py-3 px-4">{group.totalRECProd}</td>
                    <td className="py-3 px-4">{group.totalKW}</td>
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
    </div>
  )
}
