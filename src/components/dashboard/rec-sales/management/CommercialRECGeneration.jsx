"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Calendar, Download, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import CONFIG from "@/lib/config"

export default function CommercialRECGeneration() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const [exporting, setExporting] = useState(false)
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [facilityBalance, setFacilityBalance] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [facilityId, setFacilityId] = useState("")
  const [utilityProvider, setUtilityProvider] = useState("")

  const fetchCommercialData = async (page = 1) => {
    setLoading(true)
    try {
      const authToken = localStorage.getItem("authToken")
      if (!authToken) throw new Error("Authentication token not found")

      const params = new URLSearchParams({ page, limit: 10 })
      if (startDate) params.append("startDate", format(startDate, "yyyy-MM-dd"))
      if (endDate) params.append("endDate", format(endDate, "yyyy-MM-dd"))
      if (facilityId) params.append("facilityId", facilityId)
      if (utilityProvider) params.append("utilityProvider", utilityProvider)

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/meter-records/commercial?${params.toString()}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const result = await response.json()
      
      if (result.status === "success") {
        setData(result.data.records)
        setMetadata(result.data.metadata)
      } else {
        throw new Error(result.message || "Failed to fetch data")
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching commercial records:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommercialData(currentPage)
  }, [currentPage])

  const applyFilters = () => {
    setCurrentPage(1)
    setFilterOpen(false)
    fetchCommercialData(1)
  }

  const resetFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setFacilityId("")
    setUtilityProvider("")
    setCurrentPage(1)
    setFilterOpen(false)
    fetchCommercialData(1)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const authToken = localStorage.getItem("authToken")
      let allRecords = []
      let page = 1
      let hasMore = true
      while (hasMore) {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/admin/meter-records/commercial?page=${page}&limit=100`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }
        })
        if (!res.ok) break
        const result = await res.json()
        if (result.status === "success") {
          allRecords = [...allRecords, ...result.data.records]
          hasMore = result.data.metadata.hasNextPage
          page++
        } else {
          hasMore = false
        }
      }
      const rows = allRecords.map(r => ({
        ID: r.id,
        "Meter UID": r.meterUid,
        "Facility Name": r.commercialFacility?.facilityName || "",
        Address: r.utilityServiceAddress || "",
        User: r.commercialFacility?.commercialUser?.user
          ? `${r.commercialFacility.commercialUser.user.firstName} ${r.commercialFacility.commercialUser.user.lastName}`
          : "",
        Utility: r.utility || "",
        "Start Date": r.intervalStart ? new Date(r.intervalStart).toLocaleDateString() : "",
        "End Date": r.intervalEnd ? new Date(r.intervalEnd).toLocaleDateString() : "",
        "Interval kWh": r.intervalKWh != null ? Number(r.intervalKWh).toFixed(3) : "",
        "Forward kWh": r.fwdKWh != null ? Number(r.fwdKWh).toFixed(3) : "",
        "Net kWh": r.netKWh != null ? Number(r.netKWh).toFixed(3) : "",
        "Reverse kWh": r.revKWh != null ? Number(r.revKWh).toFixed(3) : "",
        Points: r.points != null ? Number(r.points).toFixed(4) : "",
        RECs: r.recs != null ? Number(r.recs).toFixed(8) : "",
      }))
      const headers = ["ID", "Meter UID", "Facility Name", "Address", "User", "Utility", "Start Date", "End Date", "Interval kWh", "Forward kWh", "Net kWh", "Reverse kWh", "Points", "RECs"]
      const csv = [
        headers.join(","),
        ...rows.map(row => headers.map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `commercial_rec_generation_${new Date().toISOString().slice(0, 10)}.csv`
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

  // Format date string to a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Format number to show a fixed number of decimal places
  const formatNumber = (num, decimals = 4) => {
    if (num === undefined || num === null) return "-"
    return Number(num).toFixed(decimals)
  }

  // Format kWh values
  const formatKWh = (value) => {
    if (value === undefined || value === null) return "-"
    return formatNumber(value, 3)
  }

  const handleRowClick = async (record) => {
    const facilityId = record.commercialFacility?.id || record.facilityId
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

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994]">Commercial REC Generation</h2>
          <div className="flex gap-2">
            <Button variant="outline" className={`gap-2 ${(startDate || endDate || facilityId || utilityProvider) ? "border-[#039994] text-[#039994]" : ""}`} onClick={() => setFilterOpen(true)}>
              <span>Filter by</span>
              <Filter className="h-4 w-4" />
            </Button>
            {filterOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setFilterOpen(false)}>
                <div className="bg-white rounded-xl shadow-xl w-80 p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm font-sfpro">Filter Options</h3>
                    <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
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
            <Button variant="outline" className="gap-2" onClick={handleExport} disabled={exporting || loading}>
              <span>{exporting ? "Exporting..." : "Export CSV"}</span>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-6 text-center text-red-500">
            <p>Error loading data: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setError(null)
                fetchCommercialData(currentPage)
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="p-6 text-center text-gray-500">
            <p>Loading commercial meter records...</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y text-sm">
                  <th className="py-3 px-2 text-left font-medium">ID</th>
                  <th className="py-3 px-2 text-left font-medium">Meter UID</th>
                  <th className="py-3 px-2 text-left font-medium">Facility Name</th>
                  <th className="py-3 px-2 text-left font-medium">Address</th>
                  <th className="py-3 px-2 text-left font-medium">User</th>
                  <th className="py-3 px-2 text-left font-medium">Utility</th>
                  <th className="py-3 px-2 text-left font-medium">Start Date</th>
                  <th className="py-3 px-2 text-left font-medium">End Date</th>
                  <th className="py-3 px-2 text-left font-medium">Interval kWh</th>
                  <th className="py-3 px-2 text-left font-medium">Forward kWh</th>
                  <th className="py-3 px-2 text-left font-medium">Net kWh</th>
                  <th className="py-3 px-2 text-left font-medium">Reverse kWh</th>
                  <th className="py-3 px-2 text-left font-medium">Points</th>
                  <th className="py-3 px-2 text-left font-medium">RECs</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id} className="border-b text-sm hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(item)}>
                      <td className="py-3 px-2">{item.id.slice(0, 8)}...</td>
                      <td className="py-3 px-2">{item.meterUid}</td>
                      <td className="py-3 px-2">{item.commercialFacility?.facilityName || '-'}</td>
                      <td className="py-3 px-2">{item.utilityServiceAddress}</td>
                      <td className="py-3 px-2">
                        {item.commercialFacility?.commercialUser?.user ? 
                          `${item.commercialFacility.commercialUser.user.firstName} ${item.commercialFacility.commercialUser.user.lastName}` : 
                          '-'}
                      </td>
                      <td className="py-3 px-2">{item.utility}</td>
                      <td className="py-3 px-2">{formatDate(item.intervalStart)}</td>
                      <td className="py-3 px-2">{formatDate(item.intervalEnd)}</td>
                      <td className="py-3 px-2">{formatKWh(item.intervalKWh)}</td>
                      <td className="py-3 px-2">{formatKWh(item.fwdKWh)}</td>
                      <td className="py-3 px-2">{formatKWh(item.netKWh)}</td>
                      <td className="py-3 px-2">{formatKWh(item.revKWh)}</td>
                      <td className="py-3 px-2">{formatNumber(item.points)}</td>
                      <td className="py-3 px-2">{formatNumber(item.recs, 8)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="14" className="py-8 text-center text-gray-500">
                      No records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {!loading && !error && metadata.total > 0 && 
              `Showing ${(metadata.page - 1) * metadata.limit + 1} to ${Math.min(metadata.page * metadata.limit, metadata.total)} of ${metadata.total} records`
            }
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={loading || !metadata.hasPrevPage}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {metadata.totalPages || 1}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={loading || !metadata.hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
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
                Facility Detail: {selectedRecord.commercialFacility?.facilityName || selectedRecord.meterUid}
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
                  {selectedRecord.commercialFacility?.commercialUser?.user
                    ? `${selectedRecord.commercialFacility.commercialUser.user.firstName} ${selectedRecord.commercialFacility.commercialUser.user.lastName}`
                    : '-'}
                </span>
              </div>
              <div>
                <span className="font-sfpro text-xs text-[#626060] block">Address</span>
                <span className="font-sfpro text-xs font-semibold">{selectedRecord.utilityServiceAddress || '-'}</span>
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