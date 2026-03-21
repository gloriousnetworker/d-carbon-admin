"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronUp, ChevronDown, Loader2, Save, RotateCcw, Plus, Trash2,
  FileText, CheckCircle, AlertCircle, Clock, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import CONFIG from "../../../../lib/config";

const ALL_USER_TYPES = [
  { key: "RESIDENTIAL", label: "Residential" },
  { key: "COMMERCIAL", label: "Commercial" },
  { key: "OPERATOR", label: "Operator" },
  { key: "EPC_PARTNER", label: "EPC Partner" },
  { key: "FINANCE_PARTNER", label: "Finance Partner" },
  { key: "SALES_AGENT", label: "Sales Agent" },
  { key: "FINANCE_ASSIST", label: "Finance-Assist" },
  { key: "EPC_ASSIST", label: "EPC-Assist" },
];

function StatusBadge({ status }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium bg-green-50 text-green-700 border border-green-200">
        <CheckCircle className="h-3 w-3" /> Published
      </span>
    );
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
        <Clock className="h-3 w-3" /> Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium bg-gray-50 text-gray-500 border border-gray-200">
      <AlertCircle className="h-3 w-3" /> Not Set
    </span>
  );
}

function UserTypeBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sfpro font-medium bg-[#039994]/10 text-[#039994] border border-[#039994]/20">
      {label}
    </span>
  );
}

export default function AgreementManagement() {
  const [agreements, setAgreements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [editState, setEditState] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAgreement, setNewAgreement] = useState({
    name: "", content: "", workflow: "SIGNUP", isOptional: false,
    version: "1.0", userTypes: [],
  });
  const [creatingNew, setCreatingNew] = useState(false);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    "Content-Type": "application/json",
  });

  const fetchAgreements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/agreement-templates`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        setAgreements(Array.isArray(data) ? data : []);
      }
    } catch {
      // Endpoint may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const getUserTypeKeys = (agr) => {
    if (!agr.userTypes) return [];
    return agr.userTypes.map((ut) => (typeof ut === "string" ? ut : ut.userType));
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const agr = agreements.find((a) => a.id === id);
      if (agr && !editState[id]) {
        setEditState((prev) => ({
          ...prev,
          [id]: {
            name: agr.name || "",
            content: agr.content || "",
            version: agr.version || "1.0",
            workflow: agr.workflow || "SIGNUP",
            isOptional: agr.isOptional || false,
            userTypes: getUserTypeKeys(agr),
          },
        }));
      }
    }
  };

  const handleFieldChange = (id, field, value) => {
    setEditState((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const toggleUserType = (id, typeKey) => {
    setEditState((prev) => {
      const current = prev[id]?.userTypes || [];
      const next = current.includes(typeKey)
        ? current.filter((t) => t !== typeKey)
        : [...current, typeKey];
      return { ...prev, [id]: { ...prev[id], userTypes: next } };
    });
  };

  const handleSave = async (id, publish = false) => {
    const edit = editState[id];
    if (!edit?.content?.trim()) {
      toast.error("Agreement content cannot be empty");
      return;
    }
    if (!edit?.name?.trim()) {
      toast.error("Agreement name is required");
      return;
    }

    setSaving(id);
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/agreement-templates/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name: edit.name,
            content: edit.content,
            version: edit.version || "1.0",
            workflow: edit.workflow || "SIGNUP",
            isOptional: edit.isOptional || false,
            status: publish ? "PUBLISHED" : "DRAFT",
            userTypes: edit.userTypes || [],
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        toast.success(publish ? "Agreement published" : "Draft saved");
        await fetchAgreements();
        // Update edit state with fresh data
        const updated = json.data || json;
        setEditState((prev) => ({
          ...prev,
          [id]: {
            name: updated.name || edit.name,
            content: updated.content || edit.content,
            version: updated.version || edit.version,
            workflow: updated.workflow || edit.workflow,
            isOptional: updated.isOptional || false,
            userTypes: getUserTypeKeys(updated),
          },
        }));
      } else {
        const errJson = await res.json().catch(() => null);
        toast.error(errJson?.message || `Server error ${res.status}`);
      }
    } catch {
      toast.error("Failed to save agreement");
    } finally {
      setSaving(null);
    }
  };

  const handleCreateNew = async () => {
    if (!newAgreement.name?.trim() || !newAgreement.content?.trim()) {
      toast.error("Name and content are required");
      return;
    }
    if (newAgreement.userTypes.length === 0) {
      toast.error("Select at least one user type");
      return;
    }

    setCreatingNew(true);
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/agreement-templates`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(newAgreement),
        }
      );

      if (res.ok) {
        toast.success("Agreement created");
        setShowNewForm(false);
        setNewAgreement({
          name: "", content: "", workflow: "SIGNUP", isOptional: false,
          version: "1.0", userTypes: [],
        });
        await fetchAgreements();
      } else {
        const errJson = await res.json().catch(() => null);
        toast.error(errJson?.message || `Server error ${res.status}`);
      }
    } catch {
      toast.error("Failed to create agreement");
    } finally {
      setCreatingNew(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this agreement template? This cannot be undone.")) return;
    try {
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/agreement-templates/${id}`,
        { method: "DELETE", headers: getAuthHeaders() }
      );
      if (res.ok) {
        toast.success("Agreement deleted");
        setExpandedId(null);
        await fetchAgreements();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleCancel = (id) => {
    const agr = agreements.find((a) => a.id === id);
    if (agr) {
      setEditState((prev) => ({
        ...prev,
        [id]: {
          name: agr.name || "",
          content: agr.content || "",
          version: agr.version || "1.0",
          workflow: agr.workflow || "SIGNUP",
          isOptional: agr.isOptional || false,
          userTypes: getUserTypeKeys(agr),
        },
      }));
    }
    toast.success("Changes discarded");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#1E1E1E] font-sfpro">Agreement Management</h1>
          <p className="text-sm text-gray-500 font-sfpro mt-1">
            {agreements.length} agreement template{agreements.length !== 1 ? "s" : ""}. Published agreements are shown to users during registration.
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-[#039994] hover:bg-[#02857f] text-white text-xs font-sfpro"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Agreement
        </Button>
      </div>

      {/* New Agreement Form */}
      {showNewForm && (
        <div className="border-2 border-dashed border-[#039994]/40 rounded-xl p-4 mb-4 bg-[#039994]/5">
          <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-3">New Agreement Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-500 font-sfpro mb-1 block">Agreement Name</label>
              <Input
                value={newAgreement.name}
                onChange={(e) => setNewAgreement({ ...newAgreement, name: e.target.value })}
                placeholder="e.g., Information Release Agreement"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-sfpro mb-1 block">Workflow</label>
              <select
                value={newAgreement.workflow}
                onChange={(e) => setNewAgreement({ ...newAgreement, workflow: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
              >
                <option value="SIGNUP">Signup</option>
                <option value="REGISTRATION">Registration</option>
                <option value="ADMIN_ONLY">Admin Only</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 font-sfpro mb-1 block">Applies to</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_USER_TYPES.map((ut) => {
                const selected = newAgreement.userTypes.includes(ut.key);
                return (
                  <button
                    key={ut.key}
                    type="button"
                    onClick={() => {
                      setNewAgreement((prev) => ({
                        ...prev,
                        userTypes: selected
                          ? prev.userTypes.filter((t) => t !== ut.key)
                          : [...prev.userTypes, ut.key],
                      }));
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-sfpro font-medium border transition-colors ${
                      selected
                        ? "bg-[#039994] text-white border-[#039994]"
                        : "bg-white text-gray-500 border-gray-300 hover:border-[#039994] hover:text-[#039994]"
                    }`}
                  >
                    {ut.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 font-sfpro mb-1 block">Content</label>
            <Textarea
              className="min-h-[120px] text-sm font-sfpro"
              value={newAgreement.content}
              onChange={(e) => setNewAgreement({ ...newAgreement, content: e.target.value })}
              placeholder="Enter the agreement text..."
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <label className="flex items-center gap-1.5 mr-4">
              <input
                type="checkbox"
                checked={newAgreement.isOptional}
                onChange={(e) => setNewAgreement({ ...newAgreement, isOptional: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]"
              />
              <span className="text-xs text-gray-600 font-sfpro">Optional</span>
            </label>
            <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)} className="text-xs font-sfpro">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateNew}
              disabled={creatingNew}
              className="bg-[#039994] hover:bg-[#02857f] text-white text-xs font-sfpro"
            >
              {creatingNew ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Agreement List */}
      {agreements.length === 0 && !showNewForm ? (
        <div className="border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-sfpro">No agreement templates yet.</p>
          <p className="text-xs text-gray-400 font-sfpro mt-1">Click "Add Agreement" to create your first template.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agreements.map((agr) => {
            const edit = editState[agr.id];
            const isExpanded = expandedId === agr.id;
            const typeKeys = getUserTypeKeys(agr);
            const typeLabels = typeKeys.map(
              (k) => ALL_USER_TYPES.find((t) => t.key === k)?.label || k
            );

            return (
              <div key={agr.id} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(agr.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-[#039994] flex-shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-[#1E1E1E] font-sfpro truncate">{agr.name}</h2>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {typeLabels.map((label) => (
                          <UserTypeBadge key={label} label={label} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400 font-sfpro uppercase">{agr.workflow}</span>
                    <StatusBadge status={agr.status} />
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Editor */}
                {isExpanded && edit && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 font-sfpro mb-1 block">Agreement Name</label>
                        <Input
                          value={edit.name}
                          onChange={(e) => handleFieldChange(agr.id, "name", e.target.value)}
                          className="text-sm font-sfpro"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 font-sfpro mb-1 block">Version</label>
                          <Input
                            value={edit.version}
                            onChange={(e) => handleFieldChange(agr.id, "version", e.target.value)}
                            className="text-sm font-sfpro"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-sfpro mb-1 block">Workflow</label>
                          <select
                            value={edit.workflow}
                            onChange={(e) => handleFieldChange(agr.id, "workflow", e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
                          >
                            <option value="SIGNUP">Signup</option>
                            <option value="REGISTRATION">Registration</option>
                            <option value="ADMIN_ONLY">Admin Only</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* User Type Selector */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Applies to</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_USER_TYPES.map((ut) => {
                          const selected = (edit.userTypes || []).includes(ut.key);
                          return (
                            <button
                              key={ut.key}
                              type="button"
                              onClick={() => toggleUserType(agr.id, ut.key)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-sfpro font-medium border transition-colors ${
                                selected
                                  ? "bg-[#039994] text-white border-[#039994]"
                                  : "bg-white text-gray-500 border-gray-300 hover:border-[#039994] hover:text-[#039994]"
                              }`}
                            >
                              {ut.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Agreement Content</label>
                      <Textarea
                        className="min-h-[200px] text-sm font-sfpro"
                        value={edit.content}
                        onChange={(e) => handleFieldChange(agr.id, "content", e.target.value)}
                        placeholder="Enter the agreement text..."
                      />
                    </div>

                    {/* Optional checkbox */}
                    <label className="flex items-center gap-1.5 mb-3">
                      <input
                        type="checkbox"
                        checked={edit.isOptional}
                        onChange={(e) => handleFieldChange(agr.id, "isOptional", e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]"
                      />
                      <span className="text-xs text-gray-600 font-sfpro">Optional (user can skip this agreement)</span>
                    </label>

                    {/* Metadata */}
                    {agr.updatedAt && (
                      <p className="text-xs text-gray-400 font-sfpro mb-3">
                        Last updated: {new Date(agr.updatedAt).toLocaleString()}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {previewId === agr.id ? (
                          <Button variant="outline" size="sm" onClick={() => setPreviewId(null)} className="text-xs font-sfpro">
                            Close Preview
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setPreviewId(agr.id)} disabled={!edit.content} className="text-xs font-sfpro">
                            <Eye className="h-3 w-3 mr-1" /> Preview
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(agr.id)}
                          className="text-xs font-sfpro text-red-500 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCancel(agr.id)} className="text-xs font-sfpro">
                          <RotateCcw className="h-3 w-3 mr-1" /> Discard
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSave(agr.id, false)}
                          disabled={saving === agr.id}
                          className="text-xs font-sfpro"
                        >
                          {saving === agr.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                          Save Draft
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSave(agr.id, true)}
                          disabled={saving === agr.id || !edit.content?.trim()}
                          className="text-xs font-sfpro bg-[#039994] hover:bg-[#02857f] text-white"
                        >
                          {saving === agr.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                          Publish
                        </Button>
                      </div>
                    </div>

                    {/* Preview */}
                    {previewId === agr.id && edit.content && (
                      <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="text-xs text-gray-400 font-sfpro mb-2 uppercase tracking-wide">Preview</div>
                        <h3 className="text-sm font-semibold text-[#1E1E1E] font-sfpro mb-2">{edit.name}</h3>
                        <div className="text-sm text-[#626060] font-sfpro whitespace-pre-wrap leading-relaxed">
                          {edit.content}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
