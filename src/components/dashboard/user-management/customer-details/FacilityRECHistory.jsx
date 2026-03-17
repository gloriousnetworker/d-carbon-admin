"use client"

// FIX-12: Per-facility REC generation history with WREGIS lifecycle actions.
// Endpoints: GET /api/rec-generation, PATCH /api/rec-generation/:id/submit|approve|reject|adjust
//            POST /api/rec-generation/bulk-approve
// WregisStatus: PENDING_SUBMISSION | SUBMITTED | APPROVED | REJECTED | ADJUSTED

import { useState, useEffect } from "react"
import { Loader2, CheckSquare, Square, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import CONFIG from "@/lib/config"

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function WregisBadge({ status }) {
  const styles = {
    PENDING_SUBMISSION: "bg-gray-100 text-gray-600",
    SUBMITTED:          "bg-amber-100 text-amber-700",
    APPROVED:           "bg-teal-100 text-teal-700",
    REJECTED:           "bg-red-100 text-red-700",
    ADJUSTED:           "bg-purple-100 text-purple-700",
  }
  const labels = {
    PENDING_SUBMISSION: "Pending Submission",
    SUBMITTED:          "Submitted",
    APPROVED:           "Approved",
    REJECTED:           "Rejected",
    ADJUSTED:           "Adjusted",
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold font-sfpro ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status || "—"}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Action modal — used for submit, reject, and adjust (not approve — no inputs)
// ─────────────────────────────────────────────────────────────────────────────

function ActionModal({ mode, record, onConfirm, onClose, processing }) {
  const [adminNote, setAdminNote] = useState("")
  const [adjustedAmount, setAdjustedAmount] = useState(
    record?.approvedRecsAmount ?? record?.recsGenerated ?? ""
  )

  const isSubmit = mode === "submit"
  const isAdjust = mode === "adjust"

  const canConfirm = isSubmit
    ? true
    : isAdjust
      ? adminNote.trim() !== "" && adjustedAmount !== ""
      : adminNote.trim() !== ""

  const handleConfirm = () => {
    onConfirm({
      adminNote: adminNote.trim() || undefined,
      adjustedAmount: isAdjust ? Number(adjustedAmount) : undefined,
    })
  }

  const titleMap = {
    submit: "Mark as Submitted to WREGIS",
    reject: "Reject REC Record",
    adjust: "Adjust REC Amount",
  }
  const btnColorMap = {
    submit: "bg-blue-600 hover:bg-blue-700",
    reject: "bg-red-600 hover:bg-red-700",
    adjust: "bg-purple-600 hover:bg-purple-700",
  }
  const btnLabelMap = {
    submit: "Mark Submitted",
    reject: "Confirm Reject",
    adjust: "Apply Adjustment",
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-sfpro text-[16px] font-semibold text-[#1E1E1E]">{titleMap[mode]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          {isSubmit && (
            <p className="font-sfpro text-sm text-gray-600">
              Mark this record as <strong>SUBMITTED</strong> to WREGIS. The record will await regulatory approval.
            </p>
          )}
          {isAdjust && (
            <div>
              <label className="block font-sfpro text-sm text-gray-700 mb-1">
                Adjusted REC Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.00000001"
                value={adjustedAmount}
                onChange={(e) => setAdjustedAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sfpro text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                placeholder="Enter adjusted REC amount"
              />
            </div>
          )}
          {!isSubmit && (
            <div>
              <label className="block font-sfpro text-sm text-gray-700 mb-1">
                Admin Note {!isAdjust && <span className="text-red-500">*</span>}
                {isAdjust && <span className="text-red-500"> *</span>}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={isAdjust ? "Reason for adjustment..." : "Reason for rejection (required)..."}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-sfpro text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end p-4 border-t">
          <Button onClick={onClose} variant="outline" className="font-sfpro text-sm">Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || processing}
            className={`font-sfpro text-sm text-white ${btnColorMap[mode]} disabled:bg-gray-400`}
          >
            {processing ? "Processing..." : btnLabelMap[mode]}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function FacilityRECHistory({ facilityId, facilityType, facilityName }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingAction, setProcessingAction] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [actionModal, setActionModal] = useState(null) // { mode, record }
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)

  const getAuthToken = () => localStorage.getItem("authToken")
  const getAdminId = () => localStorage.getItem("userId")

  const fetchRecords = async (page = 1) => {
    if (!facilityId) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ facilityId, page, limit: 20 })
      if (facilityType) params.set("facilityType", facilityType)
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec-generation?${params}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      })
      const json = await res.json()
      if (json.status === "success") {
        const data = json.data || {}
        setRecords(data.records || [])
        const meta = data.metadata || data.pagination || {}
        setTotalPages(meta.totalPages || 1)
        setTotalRecords(meta.total || meta.totalCount || 0)
      }
    } catch {
      toast.error("Failed to load REC generation records")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords(currentPage)
  }, [facilityId, currentPage])

  // ── Direct approve (no modal — no required inputs) ─────────────────────────

  const handleApprove = async (record) => {
    setProcessingAction(record.id)
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec-generation/${record.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ adminId: getAdminId() }),
      })
      const json = await res.json()
      if (json.status === "success") {
        toast.success("REC record approved")
        setRecords(prev => prev.map(r => r.id === record.id ? { ...r, wregisStatus: "APPROVED" } : r))
      } else {
        toast.error(json.message || "Failed to approve")
      }
    } catch {
      toast.error("Error approving record")
    } finally {
      setProcessingAction(null)
    }
  }

  // ── Modal-confirmed actions (submit, reject, adjust) ───────────────────────

  const handleActionConfirm = async ({ adminNote, adjustedAmount }) => {
    if (!actionModal) return
    const { mode, record } = actionModal
    setProcessingAction(record.id)

    const bodyMap = {
      submit: { adminId: getAdminId() },
      reject: { adminId: getAdminId(), adminNote },
      adjust: { adminId: getAdminId(), adjustedAmount, adminNote },
    }
    const statusMap = { submit: "SUBMITTED", reject: "REJECTED", adjust: "ADJUSTED" }

    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec-generation/${record.id}/${mode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify(bodyMap[mode]),
      })
      const json = await res.json()
      if (json.status === "success") {
        toast.success(
          mode === "submit" ? "Marked as submitted" : mode === "reject" ? "Record rejected" : "Record adjusted"
        )
        setRecords(prev =>
          prev.map(r =>
            r.id === record.id
              ? {
                  ...r,
                  wregisStatus: statusMap[mode],
                  adminNote: adminNote ?? r.adminNote,
                  approvedRecsAmount: adjustedAmount ?? r.approvedRecsAmount,
                }
              : r
          )
        )
        setActionModal(null)
      } else {
        toast.error(json.message || `Failed to ${mode}`)
      }
    } catch {
      toast.error(`Error processing ${mode}`)
    } finally {
      setProcessingAction(null)
    }
  }

  // ── Bulk approve ───────────────────────────────────────────────────────────

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Bulk approve ${selectedIds.length} REC record(s)?`)) return
    setProcessingAction("bulk")
    try {
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec-generation/bulk-approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ ids: selectedIds, adminId: getAdminId() }),
      })
      const json = await res.json()
      if (json.status === "success") {
        const { succeeded, failed } = json.data || {}
        toast.success(
          `Bulk approved: ${succeeded ?? selectedIds.length} record(s)${failed ? `, ${failed} skipped` : ""}`
        )
        setRecords(prev =>
          prev.map(r => selectedIds.includes(r.id) ? { ...r, wregisStatus: "APPROVED" } : r)
        )
        setSelectedIds([])
      } else {
        toast.error(json.message || "Bulk approve failed")
      }
    } catch {
      toast.error("Error during bulk approve")
    } finally {
      setProcessingAction(null)
    }
  }

  // ── Selection helpers ──────────────────────────────────────────────────────

  const submittedIds = records.filter(r => r.wregisStatus === "SUBMITTED").map(r => r.id)
  const toggleSelect = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleSelectAll = () =>
    setSelectedIds(prev => prev.length === submittedIds.length && submittedIds.length > 0 ? [] : submittedIds)
  const allSubmittedSelected = submittedIds.length > 0 && selectedIds.length === submittedIds.length

  const formatMonthYear = (month, year) => {
    if (!month && !year) return "—"
    if (month && year) return `${String(month).padStart(2, "0")}/${year}`
    return String(year || month)
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-xl bg-white">
      {actionModal && (
        <ActionModal
          mode={actionModal.mode}
          record={actionModal.record}
          onConfirm={handleActionConfirm}
          onClose={() => setActionModal(null)}
          processing={processingAction === actionModal.record.id}
        />
      )}

      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div>
          <h4 className="font-sfpro text-[14px] font-semibold text-[#039994]">
            REC Generation History
          </h4>
          {facilityName && (
            <p className="font-sfpro text-xs text-gray-500 mt-0.5">{facilityName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalRecords > 0 && (
            <span className="text-xs text-gray-400 font-sfpro">{totalRecords} records</span>
          )}
          {selectedIds.length > 0 && (
            <Button
              onClick={handleBulkApprove}
              disabled={processingAction === "bulk"}
              className="bg-[#039994] text-white px-3 py-1 rounded-md font-sfpro text-xs hover:bg-[#028884]"
            >
              {processingAction === "bulk"
                ? <><Loader2 className="h-3 w-3 animate-spin mr-1" />Approving...</>
                : `Bulk Approve (${selectedIds.length})`
              }
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
        </div>
      ) : records.length === 0 ? (
        <p className="text-center py-8 font-sfpro text-sm text-gray-500">
          No REC generation records found for this facility.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3">
                  <button onClick={toggleSelectAll} className="text-gray-500" title="Select all submitted">
                    {allSubmittedSelected
                      ? <CheckSquare className="h-4 w-4 text-[#039994]" />
                      : <Square className="h-4 w-4" />}
                  </button>
                </th>
                <th className="p-3 font-sfpro text-xs font-semibold text-gray-600">Month / Year</th>
                <th className="p-3 font-sfpro text-xs font-semibold text-gray-600">RECs Generated</th>
                <th className="p-3 font-sfpro text-xs font-semibold text-gray-600">WREGIS Status</th>
                <th className="p-3 font-sfpro text-xs font-semibold text-gray-600">Approved Amount</th>
                <th className="p-3 font-sfpro text-xs font-semibold text-gray-600">Admin Note</th>
                <th className="p-3 font-sfpro text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    {record.wregisStatus === "SUBMITTED" ? (
                      <button onClick={() => toggleSelect(record.id)}>
                        {selectedIds.includes(record.id)
                          ? <CheckSquare className="h-4 w-4 text-[#039994]" />
                          : <Square className="h-4 w-4 text-gray-400" />}
                      </button>
                    ) : (
                      <span className="block h-4 w-4" />
                    )}
                  </td>
                  <td className="p-3 font-sfpro text-sm">{formatMonthYear(record.month, record.year)}</td>
                  <td className="p-3 font-sfpro text-sm">
                    {record.recsGenerated != null ? Number(record.recsGenerated).toFixed(8) : "—"}
                  </td>
                  <td className="p-3"><WregisBadge status={record.wregisStatus} /></td>
                  <td className="p-3 font-sfpro text-sm">
                    {record.approvedRecsAmount != null ? Number(record.approvedRecsAmount).toFixed(8) : "—"}
                  </td>
                  <td className="p-3 font-sfpro text-xs text-gray-500 max-w-xs">
                    <span className="line-clamp-2" title={record.adminNote}>{record.adminNote || "—"}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {/* PENDING_SUBMISSION → can submit */}
                      {record.wregisStatus === "PENDING_SUBMISSION" && (
                        <Button
                          onClick={() => setActionModal({ mode: "submit", record })}
                          disabled={processingAction === record.id}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-sfpro hover:bg-blue-600 disabled:opacity-50"
                        >
                          Submit
                        </Button>
                      )}
                      {/* SUBMITTED → approve, adjust, reject */}
                      {record.wregisStatus === "SUBMITTED" && (
                        <>
                          <Button
                            onClick={() => handleApprove(record)}
                            disabled={processingAction === record.id}
                            className="bg-[#039994] text-white px-2 py-1 rounded text-xs font-sfpro hover:bg-[#028884] disabled:opacity-50"
                          >
                            {processingAction === record.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : "Approve"}
                          </Button>
                          <Button
                            onClick={() => setActionModal({ mode: "adjust", record })}
                            disabled={processingAction === record.id}
                            className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-sfpro hover:bg-purple-700 disabled:opacity-50"
                          >
                            Adjust
                          </Button>
                          <Button
                            onClick={() => setActionModal({ mode: "reject", record })}
                            disabled={processingAction === record.id}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs font-sfpro hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {/* Final states — no actions */}
                      {["APPROVED", "REJECTED", "ADJUSTED"].includes(record.wregisStatus) && (
                        <span className="text-xs text-gray-400 font-sfpro italic">Final</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <span className="text-xs text-gray-500 font-sfpro">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
