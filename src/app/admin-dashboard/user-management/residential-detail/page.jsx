import Link from "next/link"
import { ChevronLeft, ChevronDown, SlidersHorizontal, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ResidentialDetailPage() {
  // Sample data for the table
  const generationData = [
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
    {
      generatorId: "Generator ID",
      reportingUnitId: "Reporting Unit ID",
      vintage: "DD-MM-YYYY",
      startDate: "DD-MM-YYYY",
      endDate: "DD-MM-YYYY",
      totalMWh: "0.0524",
    },
  ]

  return (
    <div className="container mx-auto p-4 max-w-7xl bg-white">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-gray-800 font-medium mb-4">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Customer Report
        </Link>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" className="text-teal-600 font-medium flex items-center">
              WREGIS Generation Report
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              Filter by
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-medium">Generator ID</TableHead>
              <TableHead className="font-medium">Reporting Unit ID</TableHead>
              <TableHead className="font-medium">Vintage</TableHead>
              <TableHead className="font-medium">Start Date</TableHead>
              <TableHead className="font-medium">End Date</TableHead>
              <TableHead className="font-medium">Total MWh</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {generationData.map((item, index) => (
              <TableRow key={index} className="border-t border-gray-200">
                <TableCell className="text-gray-600">{item.generatorId}</TableCell>
                <TableCell className="text-gray-600">{item.reportingUnitId}</TableCell>
                <TableCell className="text-gray-600">{item.vintage}</TableCell>
                <TableCell className="text-gray-600">{item.startDate}</TableCell>
                <TableCell className="text-gray-600">{item.endDate}</TableCell>
                <TableCell className="text-gray-600">{item.totalMWh}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-6 gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1 mx-2">
          <span className="px-3 py-1 bg-gray-100 rounded-md">1</span>
          <span className="text-gray-500">of</span>
          <span className="text-gray-500">4</span>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
