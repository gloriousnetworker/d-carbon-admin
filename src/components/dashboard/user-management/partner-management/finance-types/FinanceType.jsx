"use client";
import CONFIG from '@/lib/config';

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  DollarSign,
  Wallet,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Hash,
  Loader2,
} from "lucide-react";
import {
  buttonPrimary,
  inputClass,
  labelClass
} from "../../styles";
import toast from "react-hot-toast";

function InfoField({ label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-500 font-sfpro">{label}</p>
      <p className="text-sm font-medium text-[#1E1E1E] font-sfpro">{value || "Not specified"}</p>
    </div>
  );
}

const STATUS_STYLE = {
  APPROVED:    { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle },
  PENDING:     { bg: "bg-amber-100",  text: "text-amber-700",  icon: Clock },
  DISAPPROVED: { bg: "bg-red-100",    text: "text-red-600",    icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_STYLE[status] || { bg: "bg-gray-100", text: "text-gray-500", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {status || "Unknown"}
    </span>
  );
}

const FinanceTypeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", status: "PENDING" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/financial-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name: formData.name })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Finance type created successfully");
        setFormData({ name: "", status: "PENDING" });
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Failed to create finance type');
      }
    } catch (error) {
      toast.error('Error creating finance type');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Finance Type</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Finance Type Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="Enter finance type name"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" className={`flex-1 ${buttonPrimary}`} disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Creating..." : "Create Finance Type"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditFinanceTypeModal = ({ isOpen, onClose, financeType, onSuccess }) => {
  const [formData, setFormData] = useState({ name: financeType?.name || "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (financeType) setFormData({ name: financeType.name });
  }, [financeType]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }
    setIsLoading(true);
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/financial-types/${financeType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name: formData.name })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Finance type updated successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Failed to update finance type');
      }
    } catch (error) {
      toast.error('Error updating finance type');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Finance Type</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Finance Type Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              placeholder="Enter finance type name"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" className={`flex-1 ${buttonPrimary}`} disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? "Updating..." : "Update Finance Type"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RejectionReasonModal = ({ isOpen, onClose, financeTypeId, onReject }) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setIsLoading(true);
    await onReject(financeTypeId, reason);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Rejection Reason</h2>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Reason for rejection</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${inputClass} min-h-[100px]`}
              placeholder="Enter the reason for rejecting this finance type"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Submitting..." : "Submit Rejection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FinanceTypes({ onBack, onViewChange }) {
  const [financeTypes, setFinanceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFinanceType, setSelectedFinanceType] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchFinanceTypes = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/user/financial-types`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const result = await response.json();
        setFinanceTypes(result.data.types || []);
      } else {
        toast.error('Failed to fetch finance types');
      }
    } catch (error) {
      toast.error('Error fetching finance types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinanceTypes(); }, []);

  const handleApprove = async (id) => {
    try {
      setUpdatingStatus(id);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/financial-types/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ status: "APPROVED" })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || 'Finance type approved successfully');
        fetchFinanceTypes();
      } else {
        toast.error(result.message || 'Failed to approve finance type');
      }
    } catch (error) {
      toast.error('Error approving finance type');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleReject = async (id, reason) => {
    try {
      setUpdatingStatus(id);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/financial-types/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ status: "DISAPPROVED", rejectionReason: reason })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || 'Finance type rejected successfully');
        fetchFinanceTypes();
      } else {
        toast.error(result.message || 'Failed to reject finance type');
      }
    } catch (error) {
      toast.error('Error rejecting finance type');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this finance type?")) return;
    try {
      setUpdatingStatus(id);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/admin/financial-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || 'Finance type deleted successfully');
        fetchFinanceTypes();
        if (viewMode === "view" && selectedFinanceType?.id === id) {
          setViewMode("list");
          setSelectedFinanceType(null);
        }
      } else {
        toast.error(result.message || 'Failed to delete finance type');
      }
    } catch (error) {
      toast.error('Error deleting finance type');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return "—"; }
  };

  const handleView = (ft) => { setSelectedFinanceType(ft); setViewMode("view"); };
  const handleBackToList = () => { setViewMode("list"); setSelectedFinanceType(null); };
  const handleEdit = (ft) => { setSelectedFinanceType(ft); setShowEditModal(true); };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col py-6 px-0 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          className="flex items-center text-[#039994] hover:text-[#02857f] text-sm font-sfpro"
          onClick={viewMode === "list" ? onBack : handleBackToList}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {viewMode === "list" ? "Back" : "Back to Finance Types"}
        </button>
        {viewMode === "list" && (
          <Button
            className="gap-2 bg-[#039994] hover:bg-[#02857f] text-white font-sfpro"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Finance Type
          </Button>
        )}
        {viewMode === "view" && selectedFinanceType && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(selectedFinanceType)} className="text-gray-600 hover:text-gray-800 font-sfpro gap-1">
              <Edit className="h-4 w-4" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(selectedFinanceType.id)} disabled={updatingStatus === selectedFinanceType.id} className="text-red-500 hover:text-red-700 font-sfpro gap-1">
              {updatingStatus === selectedFinanceType.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* ── LIST VIEW ── */}
      {viewMode === "list" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-sfpro mb-1">Total Types</p>
                  <p className="text-2xl font-bold text-[#039994] font-sfpro">{financeTypes.length}</p>
                </div>
                <DollarSign className="h-7 w-7 text-[#039994]" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-sfpro mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-600 font-sfpro">{financeTypes.filter(ft => ft.status === 'APPROVED').length}</p>
                </div>
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-sfpro mb-1">Pending</p>
                  <p className="text-2xl font-bold text-amber-600 font-sfpro">{financeTypes.filter(ft => ft.status === 'PENDING').length}</p>
                </div>
                <Clock className="h-7 w-7 text-amber-600" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-sfpro mb-1">Disapproved</p>
                  <p className="text-2xl font-bold text-red-600 font-sfpro">{financeTypes.filter(ft => ft.status === 'DISAPPROVED').length}</p>
                </div>
                <XCircle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-[#039994] font-sfpro flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Finance Type Listings
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#03999415] text-[#039994] text-xs font-medium">
                  {financeTypes.length}
                </span>
              </h3>
            </div>

            {financeTypes.length === 0 ? (
              <div className="py-16 text-center">
                <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-sfpro">No finance types found. Add your first finance type to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y bg-gray-50/60">
                      {["Name", "Code", "Status", "Created", "Updated", "Actions"].map(h => (
                        <th key={h} className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financeTypes.map((ft) => (
                      <tr key={ft.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                        <td className="py-3 px-4 font-sfpro font-medium text-[#1E1E1E]">{ft.name}</td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">{ft.namingCode || "—"}</td>
                        <td className="py-3 px-4"><StatusBadge status={ft.status} /></td>
                        <td className="py-3 px-4 font-sfpro text-gray-600 text-xs whitespace-nowrap">{formatDate(ft.createdAt)}</td>
                        <td className="py-3 px-4 font-sfpro text-gray-600 text-xs whitespace-nowrap">{formatDate(ft.updatedAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {ft.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost" size="sm"
                                  onClick={() => handleApprove(ft.id)}
                                  disabled={updatingStatus === ft.id}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 w-7 p-0"
                                  title="Approve"
                                >
                                  {updatingStatus === ft.id
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <CheckCircle className="h-3.5 w-3.5" />}
                                </Button>
                                <Button
                                  variant="ghost" size="sm"
                                  onClick={() => { setSelectedFinanceType(ft); setShowRejectModal(true); }}
                                  disabled={updatingStatus === ft.id}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                                  title="Reject"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleView(ft)}
                              className="text-[#039994] hover:text-[#02857f] hover:bg-[#03999410] h-7 px-2 text-xs font-sfpro"
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleEdit(ft)}
                              className="text-gray-600 hover:text-gray-800 h-7 w-7 p-0"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleDelete(ft.id)}
                              disabled={updatingStatus === ft.id}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                              title="Delete"
                            >
                              {updatingStatus === ft.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Trash2 className="h-3.5 w-3.5" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── DETAIL VIEW ── */}
      {viewMode === "view" && selectedFinanceType && (
        <>
          {/* Identity Banner */}
          <div className="border border-gray-200 rounded-xl p-5 mb-5 bg-gradient-to-r from-[#069B960D] to-white">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#039994] flex items-center justify-center text-white shadow">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-[#1E1E1E] font-sfpro">{selectedFinanceType.name}</h2>
                <p className="text-sm text-gray-500 font-sfpro mt-0.5">Code: {selectedFinanceType.namingCode || "—"}</p>
              </div>
              <div className="flex-shrink-0">
                <StatusBadge status={selectedFinanceType.status} />
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="border border-gray-200 rounded-xl p-5 mb-5">
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4 flex items-center gap-2">
              <Hash className="h-4 w-4" /> Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <InfoField label="Finance Type Name" value={selectedFinanceType.name} />
              <InfoField label="Naming Code" value={selectedFinanceType.namingCode} />
              <InfoField label="Date Added" value={formatDate(selectedFinanceType.createdAt)} />
              <InfoField label="Last Updated" value={formatDate(selectedFinanceType.updatedAt)} />
            </div>

            {selectedFinanceType.rejectionReason && (
              <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-sfpro font-semibold mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700 font-sfpro">{selectedFinanceType.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Pending actions */}
          {selectedFinanceType.status === 'PENDING' && (
            <div className="flex gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white font-sfpro gap-2"
                onClick={() => handleApprove(selectedFinanceType.id)}
                disabled={updatingStatus === selectedFinanceType.id}
              >
                {updatingStatus === selectedFinanceType.id
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <CheckCircle className="h-4 w-4" />}
                Approve
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-sfpro gap-2"
                onClick={() => setShowRejectModal(true)}
                disabled={updatingStatus === selectedFinanceType.id}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <FinanceTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchFinanceTypes}
      />
      <EditFinanceTypeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        financeType={selectedFinanceType}
        onSuccess={fetchFinanceTypes}
      />
      <RejectionReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        financeTypeId={selectedFinanceType?.id}
        onReject={handleReject}
      />
    </div>
  );
}
