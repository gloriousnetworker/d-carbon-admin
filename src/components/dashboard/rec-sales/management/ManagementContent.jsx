"use client"

// FIX-07: Removed per-facility generation lists (CommercialRECGeneration, ResidentialRECGeneration).
// Monthly facility-level REC data is now accessible in User Management → Facility Details.
// FIX-14: WREGIS export now calls GET /api/rec-generation/export (server XLSX chunked download).
// Filter params: month, year, facilityType, wregisStatus

import { useState } from "react"
import { Download, Loader2, Info, SlidersHorizontal, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import RECGenerationReport from "./RECGenerationReport"
import CONFIG from "@/lib/config"

const WREGIS_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING_SUBMISSION", label: "Pending Submission" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "ADJUSTED", label: "Adjusted" },
]

const FACILITY_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
]

const MONTH_OPTIONS = [
  { value: "", label: "All Months" },
  ...Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
  })),
]

export default function ManagementContent() {
  const [wregisExporting, setWregisExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    facilityType: "",
    wregisStatus: "",
    zipCode: "",
  })

  const currentYear = new Date().getFullYear()
  const yearOptions = [
    { value: "", label: "All Years" },
    ...Array.from({ length: 5 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) })),
  ]

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const clearFilters = () => setFilters({ month: "", year: "", facilityType: "", wregisStatus: "", zipCode: "" })

  // FIX-14: Call server XLSX export endpoint — returns binary file stream
  const handleWregisExport = async () => {
    setWregisExporting(true)
    try {
      const authToken = localStorage.getItem("authToken")
      const params = new URLSearchParams()
      if (filters.month) params.set("month", filters.month)
      if (filters.year) params.set("year", filters.year)
      if (filters.facilityType) params.set("facilityType", filters.facilityType)
      if (filters.wregisStatus) params.set("wregisStatus", filters.wregisStatus)
      if (filters.zipCode) params.set("zipCode", filters.zipCode.trim())

      const url = `${CONFIG.API_BASE_URL}/api/rec-generation/export${params.toString() ? `?${params}` : ""}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.message || "Failed to generate WREGIS export")
        return
      }

      // Handle XLSX binary response
      const blob = await res.blob()
      const filename = res.headers.get("Content-Disposition")?.match(/filename="?([^"]+)"?/)?.[1]
        || `wregis-export-${new Date().toISOString().slice(0, 10)}.xlsx`

      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error("WREGIS export error:", err)
      alert("Failed to generate WREGIS export")
    } finally {
      setWregisExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Action bar */}
      <Card className="bg-white">
        <CardContent className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#039994] font-sfpro">
              REC Generation Report (CA Vintage)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-1.5 text-sm font-sfpro"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters{hasActiveFilters ? " ●" : ""}</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-sm font-sfpro"
                onClick={handleWregisExport}
                disabled={wregisExporting}
              >
                {wregisExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>{wregisExporting ? "Exporting..." : "Export WREGIS XLSX"}</span>
              </Button>
            </div>
          </div>

          {/* FIX-14: Export filter panel */}
          {showFilters && (
            <div className="border-t pt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-gray-500 font-sfpro mb-1">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters(f => ({ ...f, month: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
                >
                  {MONTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-sfpro mb-1">Year</label>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters(f => ({ ...f, year: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
                >
                  {yearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-sfpro mb-1">Facility Type</label>
                <select
                  value={filters.facilityType}
                  onChange={(e) => setFilters(f => ({ ...f, facilityType: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
                >
                  {FACILITY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-sfpro mb-1">WREGIS Status</label>
                <select
                  value={filters.wregisStatus}
                  onChange={(e) => setFilters(f => ({ ...f, wregisStatus: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
                >
                  {WREGIS_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 font-sfpro mb-1">Zip Code</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={filters.zipCode}
                    onChange={(e) => setFilters(f => ({ ...f, zipCode: e.target.value }))}
                    placeholder="e.g. 90210"
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs font-sfpro focus:outline-none focus:ring-1 focus:ring-[#039994]"
                  />
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="text-gray-400 hover:text-gray-600" title="Clear filters">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FIX-07: Callout — monthly per-facility data moved to User Management */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700 font-sfpro">
          <span className="font-semibold">Monthly per-facility REC generation data</span> has been moved to{" "}
          <span className="font-semibold">User Management → select a facility → REC Generation tab</span>.
          This keeps this view focused on aggregate WREGIS reporting.
        </p>
      </div>

      {/* REC Generation Report (aggregated — WREGIS-ready) */}
      <RECGenerationReport />
    </div>
  )
}
