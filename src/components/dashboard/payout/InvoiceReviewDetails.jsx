"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft, Eye, Download, ZoomIn, ZoomOut, RotateCcw,
  Loader2, CheckCircle, XCircle, FileText, X, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import CONFIG from "@/lib/config"
import toast from "react-hot-toast"

export default function InvoiceReviewDetails({ invoice, onBack, onAction }) {
  const [statementData, setStatementData] = useState(null)
  const [statementLoading, setStatementLoading] = useState(false)
  const [processing, setProcessing] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showDocViewer, setShowDocViewer] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const getAuthToken = () => localStorage.getItem("authToken")
  const getAdminId = () => localStorage.getItem("userId")

  const userType = invoice.user?.userType || ""
  const userName = invoice.user
    ? `${invoice.user.firstName || ""} ${invoice.user.lastName || ""}`.trim() || invoice.user.email
    : "—"

  useEffect(() => {
    fetchStatementData()
  }, [])

  const fetchStatementData = async () => {
    setStatementLoading(true)
    try {
      const token = getAuthToken()
      let url
      if (userType === "PARTNER") {
        url = `${CONFIG.API_BASE_URL}/api/commission/invoice/${invoice.userId}?quarter=${invoice.quarter}&year=${invoice.year}`
      } else {
        url = `${CONFIG.API_BASE_URL}/api/quarterly-statements?quarter=${invoice.quarter}&year=${invoice.year}&userId=${invoice.userId}&userType=${userType}`
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const json = await res.json()
        if (json.status === "success") setStatementData(json.data)
      }
    } catch {
      // Statement data is supplementary
    } finally {
      setStatementLoading(false)
    }
  }

  const handleApprove = async () => {
    setProcessing("approve")
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/quarterly-statements/invoices/${invoice.id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ adminId: getAdminId() }),
        }
      )
      const json = await res.json()
      if (res.ok && json.status === "success") {
        toast.success("Invoice approved — payout request created")
        onAction()
      } else {
        toast.error(json.message || "Failed to approve invoice")
      }
    } catch {
      toast.error("Error approving invoice")
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason")
      return
    }
    setProcessing("reject")
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/quarterly-statements/invoices/${invoice.id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminId: getAdminId(),
            rejectionReason: rejectionReason.trim(),
          }),
        }
      )
      const json = await res.json()
      if (res.ok && json.status === "success") {
        toast.success("Invoice rejected")
        setShowRejectModal(false)
        onAction()
      } else {
        toast.error(json.message || "Failed to reject invoice")
      }
    } catch {
      toast.error("Error rejecting invoice")
    } finally {
      setProcessing(null)
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

  const getFileType = (url) => {
    if (!url) return "unknown"
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image"
    if (ext === "pdf") return "pdf"
    return "document"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700"
      case "REJECTED": return "bg-red-100 text-red-700"
      case "PENDING": return "bg-amber-100 text-amber-700"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChevronLeft className="h-5 w-5 text-[#039994] cursor-pointer" onClick={onBack} />
          <h1 className="font-sfpro text-lg font-semibold text-[#039994]">Invoice Review</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium font-sfpro ${getStatusColor(invoice.status)}`}>
            {invoice.status || "PENDING"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Invoice Details */}
        <div className="space-y-4">
          {/* Invoice Metadata */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-sfpro text-sm font-semibold text-[#1E1E1E] mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#039994]" />
              Invoice Details
            </h3>
            <div className="space-y-2">
              {[
                ["Invoice #", invoice.invoiceNo],
                ["User", userName],
                ["Email", invoice.user?.email],
                ["User Type", userType],
                ["Quarter", `Q${invoice.quarter} ${invoice.year}`],
                ["Amount", formatCurrency(invoice.amount)],
                ["Issue Date", formatDate(invoice.issueDate)],
                ["Due Date", formatDate(invoice.dueDate)],
                ["Description", invoice.description],
                ["Submitted", formatDate(invoice.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
                  <span className="font-sfpro text-xs text-[#626060]">{label}</span>
                  <span className="font-sfpro text-xs font-medium text-[#1E1E1E] text-right max-w-[60%] truncate">
                    {value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Document */}
          {invoice.invoiceDocument && (
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-sfpro text-sm font-semibold text-[#1E1E1E] mb-3">Invoice Document</h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowDocViewer(true)}
                  className="bg-[#039994] text-white hover:bg-[#028884] flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" /> View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement("a")
                    a.href = invoice.invoiceDocument
                    a.target = "_blank"
                    a.download = invoice.invoiceNo || "invoice"
                    a.click()
                  }}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3 w-3" /> Download
                </Button>
              </div>
            </div>
          )}

          {/* Rejection info if rejected */}
          {invoice.status === "REJECTED" && invoice.rejectionReason && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4">
              <h3 className="font-sfpro text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Rejection Reason
              </h3>
              <p className="font-sfpro text-xs text-red-600">{invoice.rejectionReason}</p>
              {invoice.reviewedAt && (
                <p className="font-sfpro text-xs text-red-400 mt-1">Reviewed: {formatDate(invoice.reviewedAt)}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Statement Data + Actions */}
        <div className="space-y-4">
          {/* Statement Data */}
          <div className="border border-gray-200 rounded-xl p-4">
            <h3 className="font-sfpro text-sm font-semibold text-[#1E1E1E] mb-3">
              {userType === "PARTNER" ? "Earnings Statement" : "Quarterly Statement"} — Q{invoice.quarter} {invoice.year}
            </h3>
            {statementLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-[#039994]" />
              </div>
            ) : statementData ? (
              <div className="space-y-2">
                {userType === "PARTNER" ? (
                  <>
                    {[
                      ["Total Commission", formatCurrency(statementData.totalCommission)],
                      ["Total Bonus", formatCurrency(statementData.totalBonus)],
                      ["Total Earnings", formatCurrency(statementData.totalEarnings)],
                      ["Customers Referred", statementData.totalCustomers || statementData.referralCount || "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <span className="font-sfpro text-xs text-[#626060]">{label}</span>
                        <span className="font-sfpro text-xs font-medium text-[#1E1E1E]">{value}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      ["Total RECs Generated", statementData.totalRecsGenerated ?? "—"],
                      ["Total RECs Sold", statementData.totalRecsSold ?? "—"],
                      ["RECs Balance", statementData.totalRecsBalance ?? "—"],
                      ["Avg REC Price", statementData.averageRecPrice ? formatCurrency(statementData.averageRecPrice) : "—"],
                      ["Total REC Payout", statementData.totalRecPayout ? formatCurrency(statementData.totalRecPayout) : "—"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 last:border-0">
                        <span className="font-sfpro text-xs text-[#626060]">{label}</span>
                        <span className="font-sfpro text-xs font-medium text-[#1E1E1E]">{value}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Compare invoice amount vs statement payout */}
                {(() => {
                  const expected = userType === "PARTNER"
                    ? statementData.totalEarnings
                    : statementData.totalRecPayout
                  if (expected != null && invoice.amount != null) {
                    const diff = Math.abs(Number(invoice.amount) - Number(expected))
                    const match = diff < 0.01
                    return (
                      <div className={`mt-3 p-2 rounded-lg text-xs font-sfpro ${match ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                        {match
                          ? "Invoice amount matches statement data."
                          : `Invoice amount (${formatCurrency(invoice.amount)}) differs from statement (${formatCurrency(expected)}) by ${formatCurrency(diff)}.`}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>
            ) : (
              <p className="font-sfpro text-xs text-[#626060] py-4 text-center">
                No statement data available for this period.
              </p>
            )}
          </div>

          {/* Actions */}
          {invoice.status === "PENDING" && (
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="font-sfpro text-sm font-semibold text-[#1E1E1E] mb-3">Actions</h3>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={!!processing}
                  className="flex-1 bg-[#039994] text-white hover:bg-[#028884] flex items-center justify-center gap-2"
                >
                  {processing === "approve" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4" /> Approve</>
                  )}
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={!!processing}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
              <p className="font-sfpro text-xs text-[#626060] mt-2">
                Approving will create a payout request for {formatCurrency(invoice.amount)}.
              </p>
            </div>
          )}

          {invoice.status === "APPROVED" && (
            <div className="border border-green-200 bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-sfpro text-sm font-semibold text-green-700">Approved</span>
              </div>
              <p className="font-sfpro text-xs text-green-600">
                Reviewed: {formatDate(invoice.reviewedAt)}. Payout request has been created.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocViewer && invoice.invoiceDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-11/12 h-5/6 max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-sfpro text-base font-semibold text-[#1E1E1E]">Invoice Document</h3>
              <div className="flex gap-2">
                {getFileType(invoice.invoiceDocument) === "image" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.min(s + 0.25, 3))}><ZoomIn className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}><ZoomOut className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => { setScale(1); setRotation(0) }}><RotateCcw className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)}>↻</Button>
                  </>
                )}
                <Button
                  size="sm"
                  onClick={() => { setShowDocViewer(false); setScale(1); setRotation(0) }}
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
              {getFileType(invoice.invoiceDocument) === "image" ? (
                <img
                  src={invoice.invoiceDocument}
                  alt="Invoice"
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
                />
              ) : getFileType(invoice.invoiceDocument) === "pdf" ? (
                <iframe
                  src={`${invoice.invoiceDocument}#view=FitH`}
                  className="w-full h-full border rounded-lg"
                  title="Invoice Document"
                />
              ) : (
                <div className="text-center p-8">
                  <p className="font-sfpro text-sm text-[#626060] mb-3">Preview not available</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      const a = document.createElement("a")
                      a.href = invoice.invoiceDocument
                      a.target = "_blank"
                      a.click()
                    }}
                    className="bg-[#039994] text-white hover:bg-[#028884]"
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sfpro text-base font-semibold text-[#1E1E1E]">Reject Invoice</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="font-sfpro text-xs text-[#626060] mb-3">
              Please provide a reason for rejecting invoice <strong>{invoice.invoiceNo}</strong>.
              The user will see this reason and can resubmit.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-sfpro focus:outline-none focus:ring-2 focus:ring-[#039994] resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleReject}
                disabled={!!processing || !rejectionReason.trim()}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {processing === "reject" ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Rejecting...</>
                ) : (
                  "Reject Invoice"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
