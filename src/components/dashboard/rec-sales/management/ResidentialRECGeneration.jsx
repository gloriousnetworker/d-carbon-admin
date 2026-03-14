"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Calendar, Search, Download, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CONFIG from "@/lib/config"

export default function ResidentialMeterRecords() {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [records, setRecords] = useState([])
  
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [facilityBalance, setFacilityBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)

  // State for filters
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [facilityId, setFacilityId] = useState("")
  const [utilityProvider, setUtilityProvider] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  // Format date for API
  const formatDateForApi = (date) => {
    if (!date) return undefined
    return format(date, "yyyy-MM-dd")
  }

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Get auth token from local storage
      const authToken = localStorage.getItem("authToken")
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive"
        })
        return
      }
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", currentPage)
      params.append("limit", 10)
      
      if (startDate) params.append("startDate", formatDateForApi(startDate))
      if (endDate) params.append("endDate", formatDateForApi(endDate))
      if (facilityId) params.append("facilityId", facilityId)
      if (utilityProvider) params.append("utilityProvider", utilityProvider)
      
      // Make the API call
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/meter-records/residential?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.status === "success") {
        setRecords(data.data.records)
        setTotalPages(data.data.metadata.totalPages)
      } else {
        throw new Error(data.message || "Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching meter records:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load residential meter records",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Calculate points and RECs values
  const calculatePointsValue = (points) => {
    return `$${(points * 0.1).toFixed(2)}`
  }
  
  // Format a date from ISO to readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd-MM-yy")
    } catch (e) {
      return dateString
    }
  }
  
  // Effect to fetch data when page or filters change
  useEffect(() => {
    fetchData()
  }, [currentPage, startDate, endDate, facilityId, utilityProvider])
  
  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }
  
  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying filters
    setIsFilterOpen(false)
    fetchData()
  }
  
  const handleExport = async () => {
    setExporting(true)
    try {
      const authToken = localStorage.getItem("authToken")
      let allRecords = []
      let page = 1
      let hasMore = true
      while (hasMore) {
        const params = new URLSearchParams({ page, limit: 100 })
        if (startDate) params.append("startDate", format(startDate, "yyyy-MM-dd"))
        if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"))
        if (facilityId) params.append("facilityId", facilityId)
        if (utilityProvider) params.append("utilityProvider", utilityProvider)
        const res = await fetch(
          `${CONFIG.API_BASE_URL}/api/admin/meter-records/residential?${params.toString()}`,
          { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
        )
        if (!res.ok) break
        const data = await res.json()
        if (data.status === "success") {
          allRecords = [...allRecords, ...data.data.records]
          hasMore = data.data.metadata.hasNextPage || page < data.data.metadata.totalPages
          page++
        } else {
          hasMore = false
        }
      }
      const rows = allRecords.map(r => ({
        ID: r.id,
        "Meter UID": r.meterUid,
        Utility: r.utility || "",
        Address: r.residentialFacility?.address || r.utilityServiceAddress || "",
        User: r.residentialFacility?.user
          ? `${r.residentialFacility.user.firstName} ${r.residentialFacility.user.lastName}`
          : "",
        "Start Date": r.intervalStart ? format(new Date(r.intervalStart), "dd-MM-yyyy") : "",
        "End Date": r.intervalEnd ? format(new Date(r.intervalEnd), "dd-MM-yyyy") : "",
        "Interval kWh": r.intervalKWh != null ? Number(r.intervalKWh).toFixed(2) : "",
        Points: r.points != null ? Number(r.points).toFixed(2) : "",
        RECs: r.recs != null ? Number(r.recs).toFixed(8) : "",
        "Points Value": r.points != null ? `$${(r.points * 0.1).toFixed(2)}` : "",
      }))
      const headers = ["ID", "Meter UID", "Utility", "Address", "User", "Start Date", "End Date", "Interval kWh", "Points", "RECs", "Points Value"]
      const csv = [
        headers.join(","),
        ...rows.map(row => headers.map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `residential_rec_generation_${new Date().toISOString().slice(0, 10)}.csv`
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export error:", err)
    } finally {
      setExporting(false)
    }
  }

  const handleRowClick = async (record) => {
    const facilityId = record.residentialFacility?.id || record.facilityId
    if (!facilityId) return
    setSelectedRecord(record)
    setFacilityBalance(null)
    setBalanceLoading(true)
    try {
      const authToken = localStorage.getItem("authToken")
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec/facility/rec-balance/${facilityId}`, {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }
      })
      if (res.ok) {
        const json = await res.json()
        if (json.status === "success") setFacilityBalance(json.data)
      }
    } catch {
      // Balance fetch is supplementary
    } finally {
      setBalanceLoading(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setFacilityId("")
    setUtilityProvider("")
    setCurrentPage(1)
  }

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994] flex items-center">
            Residential Meter Records
            <ChevronDown className="h-5 w-5 ml-2 text-[#039994]" />
          </h2>
          
          <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting || isLoading}>
            <span>{exporting ? "Exporting..." : "Export CSV"}</span>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" className={`gap-2 ${(startDate || endDate || facilityId || utilityProvider) ? "border-[#039994] text-[#039994]" : ""}`} onClick={() => setIsFilterOpen(true)}>
            <span>Filter by</span>
            <Filter className="h-4 w-4" />
          </Button>
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setIsFilterOpen(false)}>
              <div className="bg-white rounded-xl shadow-xl w-80 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm font-sfpro">Filter Options</h3>
                  <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-sfpro">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]">
                      <CalendarComponent mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-sfpro">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[60]">
                      <CalendarComponent mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-sfpro">Facility ID</label>
                  <Input placeholder="Enter facility ID" value={facilityId} onChange={(e) => setFacilityId(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-sfpro">Utility Provider</label>
                  <Select value={utilityProvider || "all"} onValueChange={(v) => setUtilityProvider(v === "all" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="all">All Providers</SelectItem>
                      <SelectItem value="Pacific Gas & Electric">Pacific Gas & Electric</SelectItem>
                      <SelectItem value="Southern California Edison">Southern California Edison</SelectItem>
                      <SelectItem value="San Diego Gas & Electric">San Diego Gas & Electric</SelectItem>
                      <SelectItem value="Duke Energy">Duke Energy</SelectItem>
                      <SelectItem value="Florida Power & Light">Florida Power & Light</SelectItem>
                      <SelectItem value="Dominion Energy">Dominion Energy</SelectItem>
                      <SelectItem value="Xcel Energy">Xcel Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>Reset</Button>
                  <Button className="bg-[#039994] hover:bg-[#02857f] text-white" onClick={applyFilters}>Apply Filters</Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y text-sm">
                <th className="py-3 px-2 text-left font-medium">ID</th>
                <th className="py-3 px-2 text-left font-medium">Meter UID</th>
                <th className="py-3 px-2 text-left font-medium">Utility</th>
                <th className="py-3 px-2 text-left font-medium">Address</th>
                <th className="py-3 px-2 text-left font-medium">User</th>
                <th className="py-3 px-2 text-left font-medium">Start Date</th>
                <th className="py-3 px-2 text-left font-medium">End Date</th>
                <th className="py-3 px-2 text-left font-medium">Interval kWh</th>
                <th className="py-3 px-2 text-left font-medium">Points</th>
                <th className="py-3 px-2 text-left font-medium">RECs</th>
                <th className="py-3 px-2 text-left font-medium">Points Value</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center">Loading data...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center">No records found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b text-sm hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(record)}>
                    <td className="py-3 px-2">{record.id.substring(0, 8)}...</td>
                    <td className="py-3 px-2">{record.meterUid}</td>
                    <td className="py-3 px-2">{record.utility}</td>
                    <td className="py-3 px-2">{record.residentialFacility?.address || record.utilityServiceAddress}</td>
                    <td className="py-3 px-2">
                      {record.residentialFacility?.user ? 
                        `${record.residentialFacility.user.firstName} ${record.residentialFacility.user.lastName}` : 
                        "N/A"}
                    </td>
                    <td className="py-3 px-2">{formatDate(record.intervalStart)}</td>
                    <td className="py-3 px-2">{formatDate(record.intervalEnd)}</td>
                    <td className="py-3 px-2">{record.intervalKWh.toFixed(2)}</td>
                    <td className="py-3 px-2">{record.points.toFixed(2)}</td>
                    <td className="py-3 px-2">{record.recs.toFixed(8)}</td>
                    <td className="py-3 px-2">{calculatePointsValue(record.points)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === 1 || isLoading}
              onClick={handlePrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === totalPages || isLoading}
              onClick={handleNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Facility REC Balance Detail Panel */}
        {selectedRecord && (
          <div className="border-t bg-[#E8F5F4] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sfpro text-sm font-semibold text-[#039994]">
                Facility Detail: {selectedRecord.residentialFacility?.address || selectedRecord.meterUid}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRecord(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-sfpro text-xs text-[#626060] block">Meter UID</span>
                <span className="font-sfpro text-xs font-semibold">{selectedRecord.meterUid}</span>
              </div>
              <div>
                <span className="font-sfpro text-xs text-[#626060] block">User</span>
                <span className="font-sfpro text-xs font-semibold">
                  {selectedRecord.residentialFacility?.user
                    ? `${selectedRecord.residentialFacility.user.firstName} ${selectedRecord.residentialFacility.user.lastName}`
                    : '-'}
                </span>
              </div>
              <div>
                <span className="font-sfpro text-xs text-[#626060] block">Address</span>
                <span className="font-sfpro text-xs font-semibold">{selectedRecord.residentialFacility?.address || selectedRecord.utilityServiceAddress || '-'}</span>
              </div>
              <div>
                <span className="font-sfpro text-xs text-[#626060] block">Utility</span>
                <span className="font-sfpro text-xs font-semibold">{selectedRecord.utility || '-'}</span>
              </div>
            </div>
            {balanceLoading ? (
              <div className="flex items-center gap-2 mt-3 text-xs text-[#626060]">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading facility REC balance...
              </div>
            ) : facilityBalance ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                <div>
                  <span className="font-sfpro text-xs text-[#626060] block">Total RECs</span>
                  <span className="font-sfpro text-xs font-semibold">{facilityBalance.totalRecs ?? facilityBalance.total ?? '-'}</span>
                </div>
                <div>
                  <span className="font-sfpro text-xs text-[#626060] block">Available RECs</span>
                  <span className="font-sfpro text-xs font-semibold text-[#039994]">{facilityBalance.availableRecs ?? facilityBalance.available ?? '-'}</span>
                </div>
                <div>
                  <span className="font-sfpro text-xs text-[#626060] block">Sold RECs</span>
                  <span className="font-sfpro text-xs font-semibold">{facilityBalance.soldRecs ?? facilityBalance.sold ?? '-'}</span>
                </div>
                <div>
                  <span className="font-sfpro text-xs text-[#626060] block">Retired RECs</span>
                  <span className="font-sfpro text-xs font-semibold">{facilityBalance.retiredRecs ?? facilityBalance.retired ?? '-'}</span>
                </div>
              </div>
            ) : (
              <p className="mt-3 font-sfpro text-xs text-[#626060]">No facility REC balance data available</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}