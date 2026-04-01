"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Download, Eye, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ResidentialRecGenerationFilterModal from "./modals/ResidentialRecGenerationFilterModal"
import PartnerPerformanceFilterModal from "./modals/PartnerPerformanceFilterModal"
import WregisGenerationFilterModal from "./modals/WregisGenerationFilterModal"
import CONFIG from "@/lib/config"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return "—"
  try { return new Date(d).toLocaleDateString("en-GB") } catch { return "—" }
}

// ─────────────────────────────────────────────────────────────────────────────
// Invoice preview modal
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Facility Type badge (used in merged REC Generation table)
// ─────────────────────────────────────────────────────────────────────────────

function FacilityTypeBadge({ type }) {
  if (type === "Commercial") return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Commercial</span>
  )
  if (type === "Residential") return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">Residential</span>
  )
  return <span className="text-gray-400">—</span>
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function ReportsDashboard() {
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  // FIX-10: default changed to "REC Generation" (merged view)
  const [reportType, setReportType] = useState("REC Generation")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [allData, setAllData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  // FIX-10: replaces residentialView + commercialView toggles
  const [recGenerationFilter, setRecGenerationFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const totalPages = Math.ceil(filteredData.length / 10)

  // FIX-09: "Commercial REC Generation" renamed to "Commercial REC Sales"
  // FIX-10: "Residential REC Generation" + "Commercial REC Sales" merged into "REC Generation"
  //         "Residential Redemption" is the former redemption sub-view, now its own report
  // FIX-13: Added three new report types from /api/reports/* endpoints
  const reportTypes = [
    "REC Generation",
    "Residential Redemption",
    "Partner Performance",
    "Partner Customers",
    "WREGIS Generation Report",
    "Points Report",
    "REC Generation Report",
    "REC Sales Entries",
  ]

  // ── Data mappers ──────────────────────────────────────────────────────────

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

  // FIX-10: residential records now include Facility Type + _type for filtering
  const mapResidentialForREC = (records) =>
    records.map((r) => ({
      id: r.id,
      "Facility Type": "Residential",
      _type: "residential",
      Name: r.residentialFacility?.user
        ? `${r.residentialFacility.user.firstName} ${r.residentialFacility.user.lastName}`
        : "—",
      "Facility / Property": r.residentialFacility?.address || r.utilityServiceAddress || "—",
      "Meter UID": r.meterUid || "—",
      Utility: r.utility || "—",
      "Start Date": formatDate(r.intervalStart),
      "End Date": formatDate(r.intervalEnd),
      "Interval kWh": r.intervalKWh != null ? Number(r.intervalKWh).toFixed(2) : "—",
      Points: r.points != null ? Number(r.points).toFixed(2) : "—",
      RECs: r.recs != null ? Number(r.recs).toFixed(8) : "—",
    }))

  // FIX-10: commercial records now include Facility Type + _type for filtering
  const mapCommercialForREC = (records) =>
    records.map((r) => ({
      id: r.id,
      "Facility Type": "Commercial",
      _type: "commercial",
      Name: r.commercialFacility?.commercialUser?.user
        ? `${r.commercialFacility.commercialUser.user.firstName} ${r.commercialFacility.commercialUser.user.lastName}`
        : "—",
      "Facility / Property": r.commercialFacility?.facilityName || "—",
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

  // ── Load data by report type ──────────────────────────────────────────────

  const loadData = async (type) => {
    setLoading(true)
    try {
      // FIX-10: combined REC Generation fetches both residential + commercial
      if (type === "REC Generation") {
        const authToken = localStorage.getItem("authToken")
        const [resiResult, commResult] = await Promise.allSettled([
          fetchAllPages(
            (p) => `${CONFIG.API_BASE_URL}/api/admin/meter-records/residential?page=${p}&limit=100`,
            (d) => ({ records: d.records || [], hasNextPage: d.metadata?.hasNextPage || false })
          ),
          fetchAllPages(
            (p) => `${CONFIG.API_BASE_URL}/api/admin/meter-records/commercial?page=${p}&limit=100`,
            (d) => ({ records: d.records || [], hasNextPage: d.metadata?.hasNextPage || false })
          ),
        ])
        const resiRecords = resiResult.status === "fulfilled" ? resiResult.value : []
        const commRecords = commResult.status === "fulfilled" ? commResult.value : []
        const combined = [
          ...mapResidentialForREC(resiRecords),
          ...mapCommercialForREC(commRecords),
        ]
        setAllData(combined)
        setFilteredData(combined)

      // Residential Redemption (was sub-view of "Residential REC Generation")
      } else if (type === "Residential Redemption") {
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

      // FIX-08 + FIX-13: Partner Performance — uses dedicated /api/admin/partner-performance endpoint
      } else if (type === "Partner Performance") {
        const authToken = localStorage.getItem("authToken")
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/admin/partner-performance?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const partners = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.partners || json.data?.data || []
            : []
          const mapped = partners.map((p, idx) => ({
            id: p.id || idx,
            companyName: p.companyName || "—",
            name: p.email || "—",
            partnerType: p.partnerType || "—",
            email: p.email || "—",
            totalReferrals: p.totalReferrals ?? 0,
            totalFacilities: p.totalFacilities ?? "—",
            recsGenerated: p.recsGenerated != null ? Number(p.recsGenerated).toFixed(4) : "—",
            dateJoined: formatDate(p.createdAt),
          }))
          setAllData(mapped)
          setFilteredData(mapped)
        } else {
          setAllData([])
          setFilteredData([])
        }

      // Partner Customers — individual customers referred by each partner, enriched with live profile data
      } else if (type === "Partner Customers") {
        const authToken = localStorage.getItem("authToken")
        // Step 1: fetch all partners
        const partnersRes = await fetch(`${CONFIG.API_BASE_URL}/api/admin/partner-performance?page=1&limit=200`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (!partnersRes.ok) { setAllData([]); setFilteredData([]); return }
        const partnersJson = await partnersRes.json()
        const partners = partnersJson.status === "success"
          ? Array.isArray(partnersJson.data) ? partnersJson.data : partnersJson.data?.partners || partnersJson.data?.data || []
          : []

        // Step 2: fetch referrals for each partner in parallel (only those with referrals)
        const activePartners = partners.filter((p) => (p.totalReferrals ?? 0) > 0 && (p.id || p.userId))
        const referralResults = await Promise.allSettled(
          activePartners.map((p) => {
            const uid = p.id || p.userId
            return fetch(`${CONFIG.API_BASE_URL}/api/user/get-users-referrals/${uid}`, {
              headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
            }).then((r) => r.ok ? r.json() : null)
          })
        )

        // Step 3: enrich + flatten
        const allRows = []
        for (let i = 0; i < activePartners.length; i++) {
          const partner = activePartners[i]
          const result = referralResults[i]
          if (result.status !== "fulfilled" || !result.value) continue
          const json = result.value
          let rawRefs = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.referrals ?? []
            : []

          // Enrich missing name/type/phone from registered User profile
          const needsEnrichment = rawRefs.filter(
            (r) => r.inviteeEmail && ((!r.firstName && !r.name) || !r.phoneNumber || (!r.userType && !r.customerType))
          )
          if (needsEnrichment.length) {
            const profileResults = await Promise.allSettled(
              needsEnrichment.map((r) =>
                fetch(`${CONFIG.API_BASE_URL}/api/user/${encodeURIComponent(r.inviteeEmail.trim())}`, {
                  headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
                }).then((res) => res.ok ? res.json() : null)
              )
            )
            const profileMap = new Map()
            needsEnrichment.forEach((r, idx) => {
              const pr = profileResults[idx]
              if (pr.status === "fulfilled" && pr.value?.status === "success") {
                const d = pr.value.data
                const nested = d?.user || d?.userDetails || d || {}
                profileMap.set(r.inviteeEmail.toLowerCase(), {
                  firstName: d?.firstName || nested?.firstName || null,
                  lastName: d?.lastName || nested?.lastName || null,
                  userType: d?.userType || nested?.userType || null,
                  phoneNumber: d?.phoneNumber || nested?.phoneNumber || null,
                })
              }
            })
            rawRefs = rawRefs.map((ref) => {
              if (!ref.inviteeEmail) return ref
              const profile = profileMap.get(ref.inviteeEmail.toLowerCase())
              if (!profile) return ref
              return {
                ...ref,
                firstName: profile.firstName || ref.name?.split(" ")[0] || null,
                lastName: profile.lastName || ref.name?.split(" ").slice(1).join(" ") || null,
                userType: profile.userType || ref.customerType || null,
                phoneNumber: profile.phoneNumber || ref.phoneNumber || null,
              }
            })
          }

          // Deduplicate by inviteeEmail
          const seen = new Map()
          for (const ref of rawRefs) {
            const key = ref.inviteeEmail?.toLowerCase() ?? ref.id
            if (!seen.has(key)) {
              seen.set(key, { ...ref })
            } else {
              const merged = { ...seen.get(key) }
              for (const [k, v] of Object.entries(ref)) {
                if (merged[k] === null || merged[k] === undefined || merged[k] === "") merged[k] = v
              }
              seen.set(key, merged)
            }
          }

          for (const ref of seen.values()) {
            const name = ref.firstName
              ? `${ref.firstName} ${ref.lastName || ""}`.trim()
              : ref.name || "—"
            allRows.push({
              id: ref.id || `${partner.id}-${ref.inviteeEmail}`,
              _partnerName: partner.companyName || partner.email || "—",
              _customerName: name,
              _email: ref.email || ref.inviteeEmail || "—",
              _customerType: ref.userType || ref.customerType || ref.role || "—",
              _phone: ref.phoneNumber || "—",
              _status: ref.status || "—",
              _date: ref.createdAt ? formatDate(ref.createdAt) : "—",
            })
          }
        }
        setAllData(allRows)
        setFilteredData(allRows)

      } else if (type === "WREGIS Generation Report") {
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

        const mapped = Array.from(facilityMap.entries()).map(([, val], idx) => {
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
      // FIX-13: Points Report — GET /api/reports/points
      } else if (type === "Points Report") {
        const authToken = localStorage.getItem("authToken")
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/reports/points?page=1&limit=200`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const records = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.records || json.data?.data || []
            : []
          const mapped = records.map((r, idx) => ({
            id: r.id || idx,
            "User / Facility": r.facilityName || r.facilityId
              || (r.user ? `${r.user.firstName || ""} ${r.user.lastName || ""}`.trim() : null)
              || r.userId || "—",
            "Earned Points": r.earnedPoints ?? r.totalEarnedPoints ?? "—",
            "Redeemed Points": r.redeemedPoints ?? r.totalRedeemedPoints ?? "—",
            "Open Balance": r.openBalance ?? r.carryOverPoints ?? r.pointBalance ?? "—",
          }))
          setAllData(mapped)
          setFilteredData(mapped)
        } else {
          setAllData([])
          setFilteredData([])
        }

      // FIX-13: REC Generation Report (WREGIS pipeline) — GET /api/reports/rec-generation
      } else if (type === "REC Generation Report") {
        const authToken = localStorage.getItem("authToken")
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/reports/rec-generation?page=1&limit=200`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const records = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.records || json.data?.data || []
            : []
          const mapped = records.map((r, idx) => ({
            id: r.id || idx,
            _wregisStatus: r.wregisStatus,
            "Facility": r.facilityName || r.facilityId || "—",
            "Month/Year": r.month && r.year
              ? `${String(r.month).padStart(2, "0")}/${r.year}`
              : formatDate(r.intervalStart || r.createdAt),
            "RECs Generated": r.recsGenerated != null ? Number(r.recsGenerated).toFixed(8) : "—",
            "RECs Approved": r.approvedRecsAmount != null ? Number(r.approvedRecsAmount).toFixed(8) : "—",
            "WREGIS Status": r.wregisStatus || "—",
          }))
          setAllData(mapped)
          setFilteredData(mapped)
        } else {
          setAllData([])
          setFilteredData([])
        }

      // FIX-13: REC Sales Entries — GET /api/reports/rec-sales
      } else if (type === "REC Sales Entries") {
        const authToken = localStorage.getItem("authToken")
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/reports/rec-sales?page=1&limit=200`, {
          headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
        })
        if (res.ok) {
          const json = await res.json()
          const records = json.status === "success"
            ? Array.isArray(json.data) ? json.data : json.data?.records || json.data?.sales || json.data?.data || []
            : []
          const mapped = records.map((r, idx) => ({
            id: r.id || idx,
            "Sale Date": formatDate(r.saleDate || r.createdAt),
            "Vintage": r.vintage || (r.month && r.year ? `${String(r.month).padStart(2, "0")}/${r.year}` : "—"),
            "RECs Sold": r.recsSold ?? r.quantity ?? r.totalRecsSold ?? "—",
            "Price Per REC": r.pricePerRec != null ? `$${Number(r.pricePerRec).toFixed(4)}` : "—",
            "Total Amount": r.totalAmount != null ? `$${Number(r.totalAmount).toFixed(2)}` : "—",
            "Buyer": r.buyer || r.recBuyer || r.buyerName || "—",
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
    loadData(reportType)
    setCurrentPage(1)
    // Reset rec generation filter when switching report types
    if (reportType === "REC Generation") setRecGenerationFilter("all")
  }, [reportType])

  // FIX-10: filter the combined REC generation data by facility type
  useEffect(() => {
    if (reportType !== "REC Generation") return
    if (recGenerationFilter === "all") {
      setFilteredData(allData)
    } else {
      setFilteredData(allData.filter((r) => r._type === recGenerationFilter))
    }
    setCurrentPage(1)
  }, [recGenerationFilter])

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!filteredData.length) return
    const cols = getColumns()
    const exportRows = reportType === "Partner Customers"
      ? filteredData.map((item) => Object.fromEntries(cols.map((c) => [c, item[{
          "Partner": "_partnerName", "Customer Name": "_customerName", "Email": "_email",
          "Customer Type": "_customerType", "Phone": "_phone", "Status": "_status", "Referred Date": "_date",
        }[c]] ?? "—"])))
      : filteredData.map(({ id, _raw, _type, _wregisStatus, ...rest }) => rest)
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
        (item.Name || item.name || item.companyName || "").toLowerCase().includes(filters.name.toLowerCase())
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
    // Re-apply recGenerationFilter on top of name/date filter
    if (reportType === "REC Generation" && recGenerationFilter !== "all") {
      results = results.filter((r) => r._type === recGenerationFilter)
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

  // ── Table columns by report type ───────────────────────────────────────────

  const getColumns = () => {
    // FIX-10: merged REC Generation columns with Facility Type
    if (reportType === "REC Generation") {
      return ["Facility Type", "Name", "Facility / Property", "Meter UID", "Utility", "Start Date", "End Date", "Interval kWh", "Points", "RECs"]
    }
    if (reportType === "Residential Redemption") {
      return ["Name", "Amount", "Status", "Request Date", "Processed Date"]
    }
    // FIX-08: updated partner performance columns
    if (reportType === "Partner Performance") {
      return ["Company Name", "Partner Type", "Total Referrals", "Total Facilities", "RECs Generated", "Date Joined"]
    }
    if (reportType === "Partner Customers") {
      return ["Partner", "Customer Name", "Email", "Customer Type", "Phone", "Status", "Referred Date"]
    }
    if (reportType === "WREGIS Generation Report") {
      return ["Generator ID", "Reporting Unit ID", "Vintage", "Start Date", "End Date", "Total MWh"]
    }
    // FIX-13: Three new report types
    if (reportType === "Points Report") {
      return ["User / Facility", "Earned Points", "Redeemed Points", "Open Balance"]
    }
    if (reportType === "REC Generation Report") {
      return ["Facility", "Month/Year", "RECs Generated", "RECs Approved", "WREGIS Status"]
    }
    if (reportType === "REC Sales Entries") {
      return ["Sale Date", "Vintage", "RECs Sold", "Price Per REC", "Total Amount", "Buyer"]
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
    // FIX-10: render badge for Facility Type
    if (col === "Facility Type") {
      return <FacilityTypeBadge type={item["Facility Type"]} />
    }
    // FIX-13: render badge for WREGIS Status in REC Generation Report
    if (col === "WREGIS Status") {
      const s = item["WREGIS Status"]
      const styleMap = {
        PENDING_SUBMISSION: "bg-gray-100 text-gray-600",
        SUBMITTED:          "bg-amber-100 text-amber-700",
        APPROVED:           "bg-teal-100 text-teal-700",
        REJECTED:           "bg-red-100 text-red-700",
        ADJUSTED:           "bg-purple-100 text-purple-700",
      }
      const labelMap = {
        PENDING_SUBMISSION: "Pending",
        SUBMITTED:          "Submitted",
        APPROVED:           "Approved",
        REJECTED:           "Rejected",
        ADJUSTED:           "Adjusted",
      }
      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold font-sfpro ${styleMap[s] || "bg-gray-100 text-gray-500"}`}>
          {labelMap[s] || s || "—"}
        </span>
      )
    }
    // Partner Customers columns map to underscore-prefixed internal keys
    if (reportType === "Partner Customers") {
      const pcMap = {
        "Partner": "_partnerName",
        "Customer Name": "_customerName",
        "Email": "_email",
        "Customer Type": "_customerType",
        "Phone": "_phone",
        "Status": "_status",
        "Referred Date": "_date",
      }
      return item[pcMap[col]] ?? "—"
    }
    const keyMap = {
      "Generator ID": "generatorId",
      "Reporting Unit ID": "reportingUnitId",
      "Total MWh": "totalMWh",
      // FIX-08: new partner performance columns
      "Company Name": "companyName",
      "Partner Type": "partnerType",
      "Total Referrals": "totalReferrals",
      "Total Facilities": "totalFacilities",
      "RECs Generated": "recsGenerated",
      "Date Joined": "dateJoined",
      // shared
      "Email": "email",
      "Name": "name",
      "Status": "status",
      "Address": "address",
      "Facility / Property": "Facility / Property",
      "Request Date": "Request Date",
      "Processed Date": "Processed Date",
      "Amount": "Amount",
    }
    // FIX-13: new report columns map directly by column name (used as object key)
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

          {/* Header row */}
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
                      className={`p-3 hover:bg-gray-50 cursor-pointer font-sfpro text-sm ${reportType === type ? "bg-teal-50 text-teal-600 font-medium" : ""}`}
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

          {/* FIX-10: REC Generation filter pills (All | Residential | Commercial) */}
          {reportType === "REC Generation" && (
            <div className="px-4 pb-3 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-sfpro mr-1">Filter by type:</span>
              {[
                { label: "All", value: "all" },
                { label: "Residential", value: "residential" },
                { label: "Commercial", value: "commercial" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setRecGenerationFilter(value)}
                  className={`px-3 py-1 rounded-full text-xs font-sfpro font-medium transition-colors ${
                    recGenerationFilter === value
                      ? "bg-[#039994] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                  {value !== "all" && allData.length > 0 && (
                    <span className="ml-1 opacity-75">
                      ({allData.filter((r) => r._type === value).length})
                    </span>
                  )}
                </button>
              ))}
              {allData.length > 0 && (
                <span className="ml-auto text-xs text-gray-400 font-sfpro">
                  {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
                </span>
              )}
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
      {isFilterModalOpen && (reportType === "REC Generation" || reportType === "Residential Redemption") && (
        <ResidentialRecGenerationFilterModal
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilter={handleFilterApply}
          view="sales"
        />
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
