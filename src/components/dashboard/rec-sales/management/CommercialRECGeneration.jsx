"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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

  const fetchCommercialData = async (page = 1) => {
    setLoading(true)
    try {
      // Get the auth token from local storage
      const authToken = localStorage.getItem("authToken")
      
      if (!authToken) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/meter-records/commercial?page=${page}`, {
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
      const headers = Object.keys(rows[0] || {})
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

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994]">Commercial REC Generation</h2>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <span>Filter by</span>
              <Filter className="h-4 w-4" />
            </Button>
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
                    <tr key={item.id} className="border-b text-sm hover:bg-gray-50">
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
      </CardContent>
    </Card>
  )
}