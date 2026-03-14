"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Download, Eye, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import ResidentialRecGenerationFilterModal from "./modals/ResidentialRecGenerationFilterModal"
import CommercialRecGenerationFilterModal from "./modals/CommercialRecGenerationFilterModal"
import PartnerPerformanceFilterModal from "./modals/PartnerPerformanceFilterModal"
import WregisGenerationFilterModal from "./modals/WregisGenerationFilterModal"
import CONFIG from "@/lib/config"

// No more static placeholder data — all report types now fetch from the API

function formatDate(d) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("en-GB") } catch { return "—" }
}

function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null
  const url = invoice.invoiceUrl || invoice.invoiceDocument || invoice.documentUrl || invoice.fileUrl || ""
  const ext = url.split(".").pop()?.toLowerCase()
  const isPdf = ext === "pdf"
  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)

  const handleDownload = () => {
    if (!url) return
    const link = document.createElement("a")
    link.href = url
    link.download = url.split("/").pop() || "invoice"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-sfpro text-[16px] font-semibold">Invoice — {invoice.id?.slice(0, 8)}...</h3>
          <div className="flex gap-2">
            {url && (
              <Button onClick={handleDownload} className="bg-[#039994] text-white px-4 py-2 rounded-md text-sm hover:bg-[#028884] flex items-center gap-2">
                <Download className="h-4 w-4" /> Download
              </Button>
            )}
            <Button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 flex items-center gap-1">
              <X className="h-4 w-4" /> Close
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {url && isPdf ? (
            <iframe src={`${url}#view=FitH`} className="w-full h-full border rounded-lg min-h-[400px]" title="Invoice" />
          ) : url && isImage ? (
            <img src={url} alt="Invoice" className="max-w-full max-h-full object-contain mx-auto" />
          ) : url ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-sfpro mb-4">Preview not available for this file type.</p>
              <Button onClick={handleDownload} className="bg-[#039994] text-white px-4 py-2 rounded-md font-sfpro hover:bg-[#028884]">
                <Download className="h-4 w-4 mr-2" /> Download Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-3 text-sm font-sfpro">
              {Object.entries(invoice).filter(([k]) => !["invoiceUrl", "documentUrl", "fileUrl", "invoiceDocument"].includes(k)).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b py-2">
                  <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</span>
                  <span className="text-[#1E1E1E] font-medium">{v != null ? String(v) : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportsDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [reportType, setReportType] = useState("Residential REC Generation")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [residentialView, setResidentialView] = useState("sales")
  const [commercialView, setCommercialView] = useState("sales")
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const totalPages = Math.ceil(filteredData.length / 10)

  const reportTypes = [
    "Residential REC Generation",
    "Commercial REC Generation",
    "Partner Performance",
    "WREGIS Generation Report",
  ]

  // ── Data fetchers ──────────────────────────────────────────────────────────

  const fetchAllPages = async (buildUrl, extractRecords) => {
    const authToken = localStorage.getItem("authToken")
    let all = []
    let page = 1
    let hasMore = true
    while (hasMore) {
      const res = await fetch(buildUrl(page), {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      })
      if (!res.ok) break
      const json = await res.json()
      if (json.status === "success") {
        const { records, hasNextPage } = extractRecords(json.data)
        all = [...all, ...records]
        hasMore = hasNextPage
        page++
      } else {
        hasMore = false
      }
    }
    return all
  }

  const mapResidential = (records) =>
    records.map((r) => ({
      id: r.id,
      Name: r.residentialFacility?.user
        ? `${r.residentialFacility.user.firstName} ${r.residentialFacility.user.lastName}`
        : "—",
      "Meter UID": r.meterUid || "—",
      Utility: r.utility || "—",
      Address: r.residentialFacility?.address || r.utilityServiceAddress || "—",
      "Start Date": formatDate(r.intervalStart),
      "End Date": formatDate(r.intervalEnd),
      "Interval kWh": r.intervalKWh != null ? Number(r.intervalKWh).toFixed(2) : "—",
      Points: r.points != null ? Number(r.points).toFixed(2) : "—",
      RECs: r.recs != null ? Number(r.recs).toFixed(8) : "—",
    }))

  const mapCommercial = (records) =>
    records.map((r) => ({
      id: r.id,
      Name: r.commercialFacility?.commercialUser?.user
        ? `${r.commercialFacility.commercialUser.user.firstName} ${r.commercialFacility.commercialUser.user.lastName}`
        : "—",
      "Facility Name": r.commercialFacility?.facilityName || "—",
      "Meter UID": r.meterUid || "—",
      Utility: r.utility || "—",
      "Start Date": formatDate(r.intervalStart),
      "End Date": formatDate(r.intervalEnd),
      "Interval kWh": r.intervalKWh != null ? Number(r.intervalKWh).toFixed(3) : "—",
      Points: r.points != null ? Number(r.points).toFixed(4) : "—",
      RECs: r.recs != null ? Number(r.recs).toFixed(8) : "—",
    }))

  const mapInvoices = (invoices) =>
    invoices.map((inv) => ({
      id: inv.id,
      "Invoice ID": inv.id?.slice(0, 8) + "..." || "—",
      "User / Company": inv.userName || inv.companyName || inv.userId || "—",
      Amount: inv.totalAmount != null ? `$${Number(inv.totalAmount).toFixed(2)}` : inv.amount != null ? `$${Number(inv.amount).toFixed(2)}` : "—",
      Status: inv.status || "—",
      Period: inv.period || inv.quarter || "—",
      Date: formatDate(inv.createdAt || inv.generatedAt || inv.date),
      _raw: inv,
    }))

  const loadData = async (type, resView, commView) => {
    setLoading(true)
    try {
      if (type === "Residential REC Generation" && resView === "sales") {
        const records = await fetchAllPages(
          (p) => `${CONFIG.API_BASE_URL}/api/admin/meter-records/residential?page=${p}&limit=100`,
          (d) => ({ records: d.records || [], hasNextPage: d.metadata?.hasNextPage || false })
        )
        const mapped = mapResidential(records)
        setAllData(mapped)
        setFilteredData(mapped)
      } else if (type === "Commercial REC Generation" && commView === "sales") {
        const records = await fetchAllPages(
          (p) => `${CONFIG.API_BASE_URL}/api/admin/meter-records/commercial?page=${p}&limit=100`,
          (d) => ({ records: d.records || [], hasNextPage: d.metadata?.hasNextPage || false })
        )
        const mapped = mapCommercial(records)
        setAllData(mapped)
        setFilteredData(mapped)
      } else if (type === "Commercial REC Generation" && commView === "payout") {
        const authToken = localStorage.getItem("authToken")
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/quarterly-statements/invoices`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const invoices = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.invoices || []
            : []
          const mapped = mapInvoices(invoices)
          setAllData(mapped)
          setFilteredData(mapped)
        }
      } else if (type === "Partner Performance") {
        const authToken = localStorage.getItem("authToken")
        // Fetch partners list
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/admin/partners?page=1&limit=200`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const partners = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.partners || json.data?.users || []
            : []
          const mapped = partners.map((p, idx) => ({
            id: p.id || idx,
            name: p.user ? `${p.user.firstName || ""} ${p.user.lastName || ""}`.trim() : p.name || p.firstName || "—",
            address: p.user?.address || p.address || "—",
            partnerType: p.partnerType || p.type || "—",
            email: p.user?.email || p.email || "—",
            phone: p.user?.phoneNumber || p.phoneNumber || "—",
            totalReferrals: p.totalReferrals ?? p._count?.referrals ?? (Array.isArray(p.referrals) ? p.referrals.length : null),
            status: p.status || p.user?.status || "Active",
            dateJoined: formatDate(p.createdAt || p.user?.createdAt),
          }))
          setAllData(mapped)
          setFilteredData(mapped)

          // Fetch referral counts for partners that don't have them
          const needsReferrals = mapped.filter(p => p.totalReferrals == null && p.email && p.email !== "—")
          if (needsReferrals.length > 0) {
            const referralResults = await Promise.allSettled(
              needsReferrals.map(p =>
                fetch(`${CONFIG.API_BASE_URL}/api/admin/customer/${encodeURIComponent(p.email.trim())}`, {
                  headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                }).then(r => r.ok ? r.json() : null)
              )
            )
            const referralMap = {}
            needsReferrals.forEach((p, i) => {
              const result = referralResults[i]
              if (result.status === "fulfilled" && result.value?.data?.referrals) {
                referralMap[p.email] = result.value.data.referrals.length
              }
            })
            if (Object.keys(referralMap).length > 0) {
              const updated = mapped.map(p => ({
                ...p,
                totalReferrals: p.totalReferrals ?? referralMap[p.email] ?? 0,
              }))
              setAllData(updated)
              setFilteredData(updated)
            }
          }
        } else {
          setAllData([])
          setFilteredData([])
        }
      } else if (type === "WREGIS Generation Report") {
        // Fetch both residential and commercial meter records to build WREGIS generation data
        const authToken = localStorage.getItem("authToken")
        const [commRes, resiRes] = await Promise.allSettled([
          fetch(`${CONFIG.API_BASE_URL}/api/admin/meter-records/commercial?page=1&limit=500`, {
            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
          }),
          fetch(`${CONFIG.API_BASE_URL}/api/admin/meter-records/residential?page=1&limit=500`, {
            headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
          }),
        ])

        const parseRecords = async (result) => {
          if (result.status !== "fulfilled" || !result.value.ok) return []
          const json = await result.value.json()
          return json.status === "success" ? (json.data?.records || []) : []
        }

        const commRecords = await parseRecords(commRes)
        const resiRecords = await parseRecords(resiRes)

        // Aggregate by facility to build WREGIS-style rows
        const facilityMap = new Map()
        const processRecord = (r, facilityKey, wregisId) => {
          if (!facilityKey) return
          const existing = facilityMap.get(facilityKey) || {
            generatorId: wregisId || facilityKey.slice(0, 12),
            reportingUnitId: wregisId || facilityKey.slice(0, 12),
            totalKWh: 0,
            startDate: null,
            endDate: null,
          }
          const kwh = Number(r.intervalKWh || r.revKwh || 0)
          existing.totalKWh += kwh
          const start = r.intervalStart ? new Date(r.intervalStart) : null
          const end = r.intervalEnd ? new Date(r.intervalEnd) : null
          if (start && (!existing.startDate || start < existing.startDate)) existing.startDate = start
          if (end && (!existing.endDate || end > existing.endDate)) existing.endDate = end
          facilityMap.set(facilityKey, existing)
        }

        commRecords.forEach((r) => {
          const fac = r.commercialFacility
          processRecord(r, fac?.id || r.commercialFacilityId, fac?.wregisId)
        })
        resiRecords.forEach((r) => {
          const fac = r.residentialFacility
          processRecord(r, fac?.id || r.residentialFacilityId, fac?.wregisId)
        })

        const mapped = Array.from(facilityMap.entries()).map(([key, val], idx) => {
          const startMonth = val.startDate ? String(val.startDate.getMonth() + 1).padStart(2, "0") : "—"
          const startYear = val.startDate ? val.startDate.getFullYear() : "—"
          return {
            id: idx + 1,
            generatorId: val.generatorId || "—",
            reportingUnitId: val.reportingUnitId || "—",
            vintage: val.startDate ? `${startMonth}/${startYear}` : "—",
            startDate: val.startDate ? val.startDate.toLocaleDateString("en-US") : "—",
            endDate: val.endDate ? val.endDate.toLocaleDateString("en-US") : "—",
            totalMWh: (val.totalKWh / 1000).toFixed(4),
          }
        })
        setAllData(mapped)
        setFilteredData(mapped)
      } else if (type === "Residential REC Generation" && resView === "redemption") {
        // Fetch residential payout requests for redemption data
        const authToken = localStorage.getItem("authToken")
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/payout-request?userType=RESIDENTIAL`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const payouts = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.payoutRequests || json.data?.payouts || []
            : []
          const mapped = payouts.map((p, idx) => ({
            id: p.id || idx,
            Name: p.user ? `${p.user.firstName || ""} ${p.user.lastName || ""}`.trim() : p.userName || "—",
            Amount: p.amount != null ? `$${Number(p.amount).toFixed(2)}` : "—",
            Status: p.status || "—",
            "Request Date": formatDate(p.createdAt),
            "Processed Date": formatDate(p.processedAt || p.updatedAt),
          }))
          setAllData(mapped)
          setFilteredData(mapped)
        } else {
          setAllData([])
          setFilteredData([])
        }
      } else {
        setAllData([])
        setFilteredData([])
      }
    } catch (err) {
      console.error("Error loading report data:", err)
      setAllData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(reportType, residentialView, commercialView)
    setCurrentPage(1)
  }, [reportType, residentialView, commercialView])

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!filteredData.length) return
    const exportRows = filteredData.map(({ id, _raw, ...rest }) => rest)
    const headers = Object.keys(exportRows[0] || {})
    const csv = [
      headers.join(","),
      ...exportRows.map((row) =>
        headers.map((h) => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${reportType.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // ── Filter handlers ────────────────────────────────────────────────────────

  const handleFilterApply = (filters) => {
    let results = [...allData]
    if (filters.name) {
      results = results.filter((item) =>
        (item.Name || item.name || "").toLowerCase().includes(filters.name.toLowerCase())
      )
    }
    if (filters.dateFrom && filters.dateTo) {
      results = results.filter((item) => {
        const raw = item["Start Date"] || item.startDate || item.date || ""
        const parts = raw.split("/").length > 1 ? raw.split("/").reverse().join("-") : raw.split("-").reverse().join("-")
        const d = new Date(parts)
        return d >= new Date(filters.dateFrom) && d <= new Date(filters.dateTo)
      })
    }
    setFilteredData(results)
    setIsFilterModalOpen(false)
    setCurrentPage(1)
  }

  const handleReportTypeChange = (type) => {
    setReportType(type)
    setIsDropdownOpen(false)
    setCurrentPage(1)
  }

  const handleResidentialViewChange = (value) => {
    setResidentialView(value)
    setCurrentPage(1)
  }

  const handleCommercialViewChange = (value) => {
    setCommercialView(value)
    setCurrentPage(1)
  }

  // ── Table columns by context ───────────────────────────────────────────────

  const getColumns = () => {
    if (reportType === "Residential REC Generation" && residentialView === "sales") {
      return ["Name", "Meter UID", "Utility", "Address", "Start Date", "End Date", "Interval kWh", "Points", "RECs"]
    }
    if (reportType === "Commercial REC Generation" && commercialView === "sales") {
      return ["Name", "Facility Name", "Meter UID", "Utility", "Start Date", "End Date", "Interval kWh", "Points", "RECs"]
    }
    if (reportType === "Commercial REC Generation" && commercialView === "payout") {
      return ["Invoice ID", "User / Company", "Amount", "Status", "Period", "Date", "Actions"]
    }
    if (reportType === "Partner Performance") {
      return ["Name", "Email", "Partner Type", "Address", "Total Referrals", "Status", "Date Joined"]
    }
    if (reportType === "Residential REC Generation" && residentialView === "redemption") {
      return ["Name", "Amount", "Status", "Request Date", "Processed Date"]
    }
    if (reportType === "WREGIS Generation Report") {
      return ["Generator ID", "Reporting Unit ID", "Vintage", "Start Date", "End Date", "Total MWh"]
    }
    return []
  }

  const getCellValue = (item, col) => {
    if (col === "Actions") {
      return (
        <Button
          onClick={() => setSelectedInvoice(item._raw || item)}
          className="bg-[#039994] text-white px-3 py-1 rounded-md text-xs hover:bg-[#028884] flex items-center gap-1"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
      )
    }
    // Map column label to item key
    const keyMap = {
      "Generator ID": "generatorId",
      "Reporting Unit ID": "reportingUnitId",
      "Total MWh": "totalMWh",
      "Partner Type": "partnerType",
      "Total Referrals": "totalReferrals",
      "Date Joined": "dateJoined",
      "Email": "email",
      "Name": "name",
      "Status": "status",
      "Address": "address",
      "Request Date": "Request Date",
      "Processed Date": "Processed Date",
      "Amount": "Amount",
    }
    return item[keyMap[col] ?? col] ?? "—"
  }

  const columns = getColumns()
  const indexOfLastItem = currentPage * 10
  const indexOfFirstItem = indexOfLastItem - 10
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem)

  return (
    <div className="bg-white min-h-screen p-6">
      {selectedInvoice && (
        <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}

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
                      className="p-3 hover:bg-gray-50 cursor-pointer font-sfpro text-sm"
                      onClick={() => handleReportTypeChange(type)}
                    >
                      {type}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={() => setIsFilterModalOpen(true)}>
                <span>Filter by</span>
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!filteredData.length || loading}>
                <span>Export Report</span>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sub-view toggles */}
          {reportType === "Residential REC Generation" && (
            <div className="px-4 pb-4">
              <ToggleGroup type="single" value={residentialView} onValueChange={handleResidentialViewChange} className="grid grid-cols-2">
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
              <ToggleGroup type="single" value={commercialView} onValueChange={handleCommercialViewChange} className="grid grid-cols-2">
                <ToggleGroupItem value="sales" className="data-[state=on]:bg-teal-500 data-[state=on]:text-white">
                  Commercial REC Sales
                </ToggleGroupItem>
                <ToggleGroupItem value="payout" className="data-[state=on]:bg-teal-500 data-[state=on]:text-white">
                  Commercial REC Payout (Invoices)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y text-sm">
                  <th className="py-3 px-4 text-left font-medium">S/N</th>
                  {columns.filter(c => c !== "Actions").map((col) => (
                    <th key={col} className="py-3 px-4 text-left font-medium">{col}</th>
                  ))}
                  {columns.includes("Actions") && (
                    <th className="py-3 px-4 text-left font-medium">Invoice</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-10 text-center text-gray-500 font-sfpro">
                      Loading data...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="py-10 text-center text-gray-500 font-sfpro">
                      No records found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id || index} className="border-b text-sm hover:bg-gray-50">
                      <td className="py-3 px-4 font-sfpro">{indexOfFirstItem + index + 1}</td>
                      {columns.map((col) => (
                        <td key={col} className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                          {getCellValue(item, col)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredData.length > 0 ? (
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-500 font-sfpro">
                {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-sfpro">{currentPage} of {totalPages || 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : !loading && (
            <div className="p-8 text-center text-gray-500 font-sfpro">No records found</div>
          )}
        </CardContent>
      </Card>

      {/* Filter Modals */}
      {isFilterModalOpen && reportType === "Residential REC Generation" && (
        <ResidentialRecGenerationFilterModal onClose={() => setIsFilterModalOpen(false)} onApplyFilter={handleFilterApply} view={residentialView} />
      )}
      {isFilterModalOpen && reportType === "Commercial REC Generation" && (
        <CommercialRecGenerationFilterModal onClose={() => setIsFilterModalOpen(false)} onApplyFilter={handleFilterApply} view={commercialView} />
      )}
      {isFilterModalOpen && reportType === "Partner Performance" && (
        <PartnerPerformanceFilterModal onClose={() => setIsFilterModalOpen(false)} onApplyFilter={handleFilterApply} />
      )}
      {isFilterModalOpen && reportType === "WREGIS Generation Report" && (
        <WregisGenerationFilterModal onClose={() => setIsFilterModalOpen(false)} onApplyFilter={handleFilterApply} />
      )}
    </div>
  )
}
