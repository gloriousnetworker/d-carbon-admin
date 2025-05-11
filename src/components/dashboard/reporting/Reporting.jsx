"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import ResidentialRecGenerationFilterModal from "./modals/ResidentialRecGenerationFilterModal"
import CommercialRecGenerationFilterModal from "./modals/CommercialRecGenerationFilterModal"
import PartnerPerformanceFilterModal from "./modals/PartnerPerformanceFilterModal"
import WregisGenerationFilterModal from "./modals/WregisGenerationFilterModal"

// Sample data for all report types
const residentialRecSalesData = [
  { id: 1, name: "John Doe", residentId: "RES-001", recBalance: "150", avgRecPrice: "$12.50", recSold: "50", date: "16-03-2025" },
  { id: 2, name: "Jane Smith", residentId: "RES-002", recBalance: "200", avgRecPrice: "$13.00", recSold: "30", date: "15-03-2025" },
  { id: 3, name: "Robert Johnson", residentId: "RES-003", recBalance: "75", avgRecPrice: "$11.75", recSold: "25", date: "14-03-2025" },
];

const residentialRecRedemptionData = [
  { id: 1, name: "John Doe", residentId: "RES-001", paymentId: "PAY-001", pointRedeemed: "3000", pricePerPoint: "$0.10", totalAmount: "$300.00", date: "16-03-2025" },
  { id: 2, name: "Jane Smith", residentId: "RES-002", paymentId: "PAY-002", pointRedeemed: "2500", pricePerPoint: "$0.10", totalAmount: "$250.00", date: "16-03-2025" },
  { id: 3, name: "Robert Johnson", residentId: "RES-003", paymentId: "PAY-003", pointRedeemed: "1800", pricePerPoint: "$0.10", totalAmount: "$180.00", date: "15-03-2025" },
];

const commercialRecSalesData = [
  { id: 1, name: "ABC Company", commercialId: "COM-001", recBalance: "500", avgRecPrice: "$11.25", recSold: "200", date: "15-03-2025" },
  { id: 2, name: "XYZ Corporation", commercialId: "COM-002", recBalance: "750", avgRecPrice: "$12.50", recSold: "300", date: "16-03-2025" },
];

const commercialRecPayoutData = [
  { id: 1, name: "ABC Company", commercialId: "COM-001", invoiceId: "INV-001", totalAmount: "$2250.00", date: "15-03-2025", status: "Completed" },
  { id: 2, name: "XYZ Corporation", commercialId: "COM-002", invoiceId: "INV-002", totalAmount: "$3750.00", date: "16-03-2025", status: "Pending" },
];

const partnerPerformanceData = [
  { id: 1, name: "Partner One", address: "123 Main St", activeCommGenerators: "5", activeResidentGenerators: "25", totalCommGen: "150", totalRecsSold: "1200", totalEarnings: "$14,400" },
  { id: 2, name: "Partner Two", address: "456 Oak Ave", activeCommGenerators: "3", activeResidentGenerators: "18", totalCommGen: "90", totalRecsSold: "750", totalEarnings: "$9,000" },
];

const wregisGenerationData = [
  { id: 1, generatorId: "GEN-001", reportingUnitId: "RU-001", vintage: "2024", startDate: "01-01-2024", endDate: "31-12-2024", totalMWh: "150" },
  { id: 2, generatorId: "GEN-002", reportingUnitId: "RU-002", vintage: "2024", startDate: "01-01-2024", endDate: "31-12-2024", totalMWh: "225" },
];

export default function ReportsDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [reportType, setReportType] = useState("Residential REC Generation")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [filteredData, setFilteredData] = useState(residentialRecSalesData)
  const [residentialView, setResidentialView] = useState("sales")
  const [commercialView, setCommercialView] = useState("sales")
  
  const totalPages = Math.ceil(filteredData.length / 10)

  const reportTypes = [
    "Residential REC Generation", 
    "Commercial REC Generation", 
    "Partner Performance",
    "WREGIS Generation Report"
  ]

  const handleFilterApply = (filters) => {
    // Apply filtering logic based on current report type and view
    let results;
    
    switch(reportType) {
      case "Residential REC Generation":
        results = residentialView === "sales" 
          ? [...residentialRecSalesData] 
          : [...residentialRecRedemptionData];
        break;
        
      case "Commercial REC Generation":
        results = commercialView === "sales" 
          ? [...commercialRecSalesData] 
          : [...commercialRecPayoutData];
        break;
        
      case "Partner Performance":
        results = [...partnerPerformanceData];
        break;
        
      case "WREGIS Generation Report":
        results = [...wregisGenerationData];
        break;
    }
    
    // Apply common filters
    if (filters.name) {
      results = results.filter(item => 
        item.name?.toLowerCase().includes(filters.name.toLowerCase())
      )
    }
    
    if (filters.dateFrom && filters.dateTo) {
      results = results.filter(item => {
        const itemDate = new Date(item.date?.split('-').reverse().join('-') || item.startDate?.split('-').reverse().join('-'))
        const fromDate = new Date(filters.dateFrom)
        const toDate = new Date(filters.dateTo)
        return itemDate >= fromDate && itemDate <= toDate
      })
    }
    
    // Apply type-specific filters
    if (reportType === "Residential REC Generation") {
      if (filters.residentId) {
        results = results.filter(item => 
          item.residentId?.toLowerCase().includes(filters.residentId.toLowerCase())
        )
      }
      if (residentialView === "sales" && filters.recBalance) {
        results = results.filter(item => item.recBalance === filters.recBalance)
      }
      if (residentialView === "redemption" && filters.paymentId) {
        results = results.filter(item => 
          item.paymentId?.toLowerCase().includes(filters.paymentId.toLowerCase())
        )
      }
    }
    
    if (reportType === "Commercial REC Generation") {
      if (filters.commercialId) {
        results = results.filter(item => 
          item.commercialId?.toLowerCase().includes(filters.commercialId.toLowerCase())
        )
      }
      if (commercialView === "payout" && filters.invoiceId) {
        results = results.filter(item => 
          item.invoiceId?.toLowerCase().includes(filters.invoiceId.toLowerCase())
        )
      }
    }
    
    if (reportType === "Partner Performance") {
      if (filters.address) {
        results = results.filter(item => 
          item.address?.toLowerCase().includes(filters.address.toLowerCase())
        )
      }
      if (filters.totalRecsSold) {
        results = results.filter(item => item.totalRecsSold === filters.totalRecsSold)
      }
    }
    
    if (reportType === "WREGIS Generation Report") {
      if (filters.generatorId) {
        results = results.filter(item => 
          item.generatorId?.toLowerCase().includes(filters.generatorId.toLowerCase())
        )
      }
      if (filters.reportingUnitId) {
        results = results.filter(item => 
          item.reportingUnitId?.toLowerCase().includes(filters.reportingUnitId.toLowerCase())
        )
      }
      if (filters.vintage) {
        results = results.filter(item => item.vintage === filters.vintage)
      }
    }
    
    setFilteredData(results)
    setIsFilterModalOpen(false)
    setCurrentPage(1)
  }

  const handleReportTypeChange = (type) => {
    setReportType(type)
    setIsDropdownOpen(false)
    
    switch(type) {
      case "Residential REC Generation":
        setFilteredData(residentialRecSalesData)
        setResidentialView("sales")
        break
      case "Commercial REC Generation":
        setFilteredData(commercialRecSalesData)
        setCommercialView("sales")
        break
      case "Partner Performance":
        setFilteredData(partnerPerformanceData)
        break
      case "WREGIS Generation Report":
        setFilteredData(wregisGenerationData)
        break
    }
    setCurrentPage(1)
  }

  const handleResidentialViewChange = (value) => {
    setResidentialView(value)
    setFilteredData(value === "sales" ? residentialRecSalesData : residentialRecRedemptionData)
    setCurrentPage(1)
  }

  const handleCommercialViewChange = (value) => {
    setCommercialView(value)
    setFilteredData(value === "sales" ? commercialRecSalesData : commercialRecPayoutData)
    setCurrentPage(1)
  }

  const handleExport = () => {
    // Convert data to CSV
    const headers = Object.keys(filteredData[0] || {})
    const csvContent = [
      headers.join(","),
      ...filteredData.map(row => 
        headers.map(header => 
          `"${row[header]?.toString().replace(/"/g, '""') || ''}"`
        ).join(",")
      )
    ].join("\n")
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get current page data
  const indexOfLastItem = currentPage * 10
  const indexOfFirstItem = indexOfLastItem - 10
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <div className="relative">
              <div 
                className="text-xl font-medium text-teal-500 flex items-center cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {reportType}
                <ChevronDown className="h-5 w-5 ml-2 text-teal-500" />
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 z-10 w-64 bg-white shadow-lg rounded-md border border-gray-200 mt-1">
                  {reportTypes.map((type) => (
                    <div 
                      key={type} 
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleReportTypeChange(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <span>Filter by</span>
                <Filter className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleExport}
              >
                <span>Export Report</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* View Toggles */}
          {reportType === "Residential REC Generation" && (
            <div className="px-4 pb-4">
              <ToggleGroup 
                type="single" 
                value={residentialView}
                onValueChange={handleResidentialViewChange}
                className="grid grid-cols-2"
              >
                <ToggleGroupItem value="sales" className="data-[state=on]:bg-teal-500 data-[state=on]:text-white">
                  Residential REC Sales
                </ToggleGroupItem>
                <ToggleGroupItem value="redemption" className="data-[state=on]:bg-teal-500 data-[state=on]:text-white">
                  Residential REC Points Redemption
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {reportType === "Commercial REC Generation" && (
            <div className="px-4 pb-4">
              <ToggleGroup 
                type="single" 
                value={commercialView}
                onValueChange={handleCommercialViewChange}
                className="grid grid-cols-2"
              >
                <ToggleGroupItem value="sales" className="data-[state=on]:bg-teal-500 data-[state=on]:text-white">
                  Commercial REC Sales
                </ToggleGroupItem>
                <ToggleGroupItem value="payout" className="data-[state=on]:bg-teal-500 data-[state=on]:text-white">
                  Commercial REC Payout
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y text-sm">
                  {reportType === "Residential REC Generation" && residentialView === "sales" ? (
                    <>
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Resident ID</th>
                      <th className="py-3 px-4 text-left font-medium">REC Balance</th>
                      <th className="py-3 px-4 text-left font-medium">Avg. REC Price</th>
                      <th className="py-3 px-4 text-left font-medium">REC Sold</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                    </>
                  ) : reportType === "Residential REC Generation" && residentialView === "redemption" ? (
                    <>
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Resident ID</th>
                      <th className="py-3 px-4 text-left font-medium">Payment ID</th>
                      <th className="py-3 px-4 text-left font-medium">Point Redeemed</th>
                      <th className="py-3 px-4 text-left font-medium">Price/Point</th>
                      <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                    </>
                  ) : reportType === "Commercial REC Generation" && commercialView === "sales" ? (
                    <>
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Commercial ID</th>
                      <th className="py-3 px-4 text-left font-medium">REC Balance</th>
                      <th className="py-3 px-4 text-left font-medium">Avg. REC Price</th>
                      <th className="py-3 px-4 text-left font-medium">REC Sold</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                    </>
                  ) : reportType === "Commercial REC Generation" && commercialView === "payout" ? (
                    <>
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Commercial ID</th>
                      <th className="py-3 px-4 text-left font-medium">Invoice ID</th>
                      <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                      <th className="py-3 px-4 text-left font-medium">Date</th>
                    </>
                  ) : reportType === "Partner Performance" ? (
                    <>
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Address</th>
                      <th className="py-3 px-4 text-left font-medium">Active Comm. Generators</th>
                      <th className="py-3 px-4 text-left font-medium">Active Resident Generators</th>
                      <th className="py-3 px-4 text-left font-medium">Total Comm. Gen. (MWh)</th>
                      <th className="py-3 px-4 text-left font-medium">Total RECs Sold</th>
                      <th className="py-3 px-4 text-left font-medium">Total Earnings</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4 text-left font-medium">S/N</th>
                      <th className="py-3 px-4 text-left font-medium">Generator ID</th>
                      <th className="py-3 px-4 text-left font-medium">Reporting Unit ID</th>
                      <th className="py-3 px-4 text-left font-medium">Vintage</th>
                      <th className="py-3 px-4 text-left font-medium">Start Date</th>
                      <th className="py-3 px-4 text-left font-medium">End Date</th>
                      <th className="py-3 px-4 text-left font-medium">Total MWh</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="border-b text-sm hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{indexOfFirstItem + index + 1}</td>
                    
                    {reportType === "Residential REC Generation" && residentialView === "sales" ? (
                      <>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.residentId}</td>
                        <td className="py-3 px-4">{item.recBalance}</td>
                        <td className="py-3 px-4">{item.avgRecPrice}</td>
                        <td className="py-3 px-4">{item.recSold}</td>
                        <td className="py-3 px-4">{item.date}</td>
                      </>
                    ) : reportType === "Residential REC Generation" && residentialView === "redemption" ? (
                      <>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.residentId}</td>
                        <td className="py-3 px-4">{item.paymentId}</td>
                        <td className="py-3 px-4">{item.pointRedeemed}</td>
                        <td className="py-3 px-4">{item.pricePerPoint}</td>
                        <td className="py-3 px-4">{item.totalAmount}</td>
                        <td className="py-3 px-4">{item.date}</td>
                      </>
                    ) : reportType === "Commercial REC Generation" && commercialView === "sales" ? (
                      <>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.commercialId}</td>
                        <td className="py-3 px-4">{item.recBalance}</td>
                        <td className="py-3 px-4">{item.avgRecPrice}</td>
                        <td className="py-3 px-4">{item.recSold}</td>
                        <td className="py-3 px-4">{item.date}</td>
                      </>
                    ) : reportType === "Commercial REC Generation" && commercialView === "payout" ? (
                      <>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.commercialId}</td>
                        <td className="py-3 px-4">{item.invoiceId}</td>
                        <td className="py-3 px-4">{item.totalAmount}</td>
                        <td className="py-3 px-4">{item.date}</td>
                      </>
                    ) : reportType === "Partner Performance" ? (
                      <>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.address}</td>
                        <td className="py-3 px-4">{item.activeCommGenerators}</td>
                        <td className="py-3 px-4">{item.activeResidentGenerators}</td>
                        <td className="py-3 px-4">{item.totalCommGen}</td>
                        <td className="py-3 px-4">{item.totalRecsSold}</td>
                        <td className="py-3 px-4">{item.totalEarnings}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4">{item.generatorId}</td>
                        <td className="py-3 px-4">{item.reportingUnitId}</td>
                        <td className="py-3 px-4">{item.vintage}</td>
                        <td className="py-3 px-4">{item.startDate}</td>
                        <td className="py-3 px-4">{item.endDate}</td>
                        <td className="py-3 px-4">{item.totalMWh}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 ? (
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
                {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No records found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Modals */}
      {isFilterModalOpen && reportType === "Residential REC Generation" && (
        <ResidentialRecGenerationFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
          view={residentialView}
        />
      )}
      {isFilterModalOpen && reportType === "Commercial REC Generation" && (
        <CommercialRecGenerationFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
          view={commercialView}
        />
      )}
      {isFilterModalOpen && reportType === "Partner Performance" && (
        <PartnerPerformanceFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
      {isFilterModalOpen && reportType === "WREGIS Generation Report" && (
        <WregisGenerationFilterModal 
          onClose={() => setIsFilterModalOpen(false)} 
          onApplyFilter={handleFilterApply}
        />
      )}
    </div>
  )
}