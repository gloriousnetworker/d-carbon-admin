"use client"

import { useState, useEffect } from "react"
import { Loader2, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import CONFIG from "@/lib/config"
import InvoiceReviewDetails from "./InvoiceReviewDetails"

const STATUS_OPTIONS = ["ALL", "PENDING", "APPROVED", "REJECTED"]
const TYPE_OPTIONS = ["ALL", "COMMERCIAL", "PARTNER"]

export default function InvoiceReview() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const getAuthToken = () => localStorage.getItem("authToken")

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 15 })
      if (statusFilter !== "ALL") params.append("status", statusFilter)
      if (typeFilter !== "ALL") params.append("userType", typeFilter)

      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/quarterly-statements/invoices?${params}`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      )
      if (!res.ok) throw new Error("Failed to fetch invoices")
      const json = await res.json()
      if (json.status === "success") {
        const data = json.data
        setInvoices(Array.isArray(data) ? data : data?.invoices || [])
        setTotalPages(data?.totalPages || Math.ceil((data?.total || 0) / 15) || 1)
      }
    } catch {
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [page, statusFilter, typeFilter])

  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700"
      case "REJECTED": return "bg-red-100 text-red-700"
      case "PENDING": return "bg-amber-100 text-amber-700"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  const formatDate = (d) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount) => {
    if (amount == null) return "$0.00"
    return `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleInvoiceAction = () => {
    setSelectedInvoice(null)
    fetchInvoices()
  }

  if (selectedInvoice) {
    return (
      <InvoiceReviewDetails
        invoice={selectedInvoice}
        onBack={() => setSelectedInvoice(null)}
        onAction={handleInvoiceAction}
      />
    )
  }

  return (
    <div className="px-4 pb-4">
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#626060]" />
          <span className="font-sfpro text-xs text-[#626060]">Status:</span>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(setStatusFilter)(s)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium font-sfpro transition-colors ${
                  statusFilter === s
                    ? "bg-[#039994] text-white"
                    : "bg-gray-100 text-[#626060] hover:bg-gray-200"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <span className="font-sfpro text-xs text-[#626060]">Type:</span>
          <div className="flex gap-1">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(setTypeFilter)(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium font-sfpro transition-colors ${
                  typeFilter === t
                    ? "bg-[#039994] text-white"
                    : "bg-gray-100 text-[#626060] hover:bg-gray-200"
                }`}
              >
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-sfpro text-sm text-[#626060]">No invoices found.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y text-sm bg-gray-50/60">
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Invoice #</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">User</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Type</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Quarter</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Amount</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Due Date</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Status</th>
                  <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="border-b text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-sfpro text-[#039994] font-medium">
                      {inv.invoiceNo || "—"}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      {inv.user
                        ? `${inv.user.firstName || ""} ${inv.user.lastName || ""}`.trim() || inv.user.email
                        : "—"}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      {inv.user?.userType || "—"}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      Q{inv.quarter} {inv.year}
                    </td>
                    <td className="py-3 px-4 font-sfpro font-medium text-[#1E1E1E]">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#626060]">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-sfpro ${getStatusColor(inv.status)}`}>
                        {inv.status || "PENDING"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#626060]">
                      {formatDate(inv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-sfpro text-[#1E1E1E]">
              {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
