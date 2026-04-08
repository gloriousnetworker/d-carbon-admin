"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronUp, ChevronDown, Loader2, Save, Plus, Trash2, Upload, ExternalLink,
  FileText, CheckCircle, Shield, Download, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import CONFIG from "@/lib/config";

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

function UserTypePill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[11px] font-sfpro font-medium border transition-colors ${
        selected
          ? "bg-[#039994] text-white border-[#039994]"
          : "bg-white text-gray-500 border-gray-300 hover:border-[#039994] hover:text-[#039994]"
      }`}
    >
      {label}
    </button>
  );
}

function DocBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sfpro font-medium bg-[#039994]/10 text-[#039994] border border-[#039994]/20">
      {label}
    </span>
  );
}

export default function DocumentConfiguration() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState(null);
  const [editState, setEditState] = useState({});
  const [saving, setSaving] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [uploadingTemplate, setUploadingTemplate] = useState(null);
  const [newDoc, setNewDoc] = useState({
    docKey: "", docName: "", required: true, adminOnly: false,
    downloadable: false, workflow: "REGISTRATION", description: "",
    userTypes: [], conditionField: "", conditionOp: "equals", conditionValue: "",
  });

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    "Content-Type": "application/json",
  });

  const handleTemplateUpload = async (docKey, file) => {
    if (!file) return;
    setUploadingTemplate(docKey);
    try {
      const authToken = localStorage.getItem("authToken");
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(
        `${CONFIG.API_BASE_URL}/api/file-storage/upload/template-${docKey}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const uploadJson = await uploadRes.json();
      const templateUrl = uploadJson.data?.url || uploadJson.url || uploadJson.data;

      if (!templateUrl) throw new Error("No URL returned from upload");

      // Update the edit state with the URL
      setEditState((prev) => ({
        ...prev,
        [docKey]: { ...prev[docKey], templateUrl },
      }));

      toast.success("Template uploaded — click Save to persist");
    } catch (err) {
      toast.error(err.message || "Failed to upload template");
    } finally {
      setUploadingTemplate(null);
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/document-configs`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        const raw = Array.isArray(data) ? data : [];
        // Group by docKey — each docKey can have multiple userType entries
        const grouped = {};
        for (const doc of raw) {
          if (!grouped[doc.docKey]) {
            grouped[doc.docKey] = {
              ...doc,
              userTypes: [doc.userType],
              ids: { [doc.userType]: doc.id },
            };
          } else {
            grouped[doc.docKey].userTypes.push(doc.userType);
            grouped[doc.docKey].ids[doc.userType] = doc.id;
          }
        }
        setDocuments(Object.values(grouped).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)));
      }
    } catch {
      // Endpoint may not exist yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const parseConditions = (conditions) => {
    if (!conditions || typeof conditions !== "object") return { field: "", op: "equals", value: "" };
    const keys = Object.keys(conditions);
    if (keys.length === 0) return { field: "", op: "equals", value: "" };
    const field = keys[0];
    const val = conditions[field];
    if (typeof val === "object" && val.not !== undefined) {
      return { field, op: "not", value: String(val.not) };
    }
    return { field, op: "equals", value: String(val) };
  };

  const buildConditions = (field, op, value) => {
    if (!field || !value) return null;
    if (op === "not") return { [field]: { not: value } };
    return { [field]: value };
  };

  const toggleExpand = (docKey) => {
    if (expandedKey === docKey) {
      setExpandedKey(null);
    } else {
      setExpandedKey(docKey);
      const doc = documents.find((d) => d.docKey === docKey);
      if (doc && !editState[docKey]) {
        const cond = parseConditions(doc.conditions);
        setEditState((prev) => ({
          ...prev,
          [docKey]: {
            docName: doc.docName || "",
            required: doc.required ?? true,
            adminOnly: doc.adminOnly ?? false,
            downloadable: doc.downloadable ?? false,
            workflow: doc.workflow || "REGISTRATION",
            description: doc.description || "",
            userTypes: [...doc.userTypes],
            conditionField: cond.field,
            conditionOp: cond.op,
            conditionValue: cond.value,
            templateUrl: doc.templateUrl || "",
          },
        }));
      }
    }
  };

  const handleFieldChange = (docKey, field, value) => {
    setEditState((prev) => ({
      ...prev,
      [docKey]: { ...prev[docKey], [field]: value },
    }));
  };

  const toggleUserType = (docKey, typeKey) => {
    setEditState((prev) => {
      const current = prev[docKey]?.userTypes || [];
      const next = current.includes(typeKey)
        ? current.filter((t) => t !== typeKey)
        : [...current, typeKey];
      return { ...prev, [docKey]: { ...prev[docKey], userTypes: next } };
    });
  };

  const handleSave = async (docKey) => {
    const edit = editState[docKey];
    const doc = documents.find((d) => d.docKey === docKey);
    if (!edit || !doc) return;

    setSaving(docKey);
    try {
      const conditions = buildConditions(edit.conditionField, edit.conditionOp, edit.conditionValue);
      const currentUserTypes = doc.userTypes;
      const newUserTypes = edit.userTypes;

      // Delete removed user types
      for (const ut of currentUserTypes) {
        if (!newUserTypes.includes(ut) && doc.ids[ut]) {
          await fetch(
            `${CONFIG.API_BASE_URL}/api/admin/document-configs/${doc.ids[ut]}`,
            { method: "DELETE", headers: getAuthHeaders() }
          );
        }
      }

      // Create or update for each user type
      for (const ut of newUserTypes) {
        const existingId = doc.ids[ut];
        const body = {
          userType: ut,
          docKey,
          docName: edit.docName,
          required: edit.required,
          adminOnly: edit.adminOnly,
          downloadable: edit.downloadable,
          workflow: edit.workflow,
          description: edit.description,
          conditions,
          sortOrder: doc.sortOrder || 0,
          templateUrl: edit.templateUrl || null,
        };

        if (existingId) {
          await fetch(
            `${CONFIG.API_BASE_URL}/api/admin/document-configs/${existingId}`,
            { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(body) }
          );
        } else {
          await fetch(
            `${CONFIG.API_BASE_URL}/api/admin/document-configs`,
            { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(body) }
          );
        }
      }

      toast.success("Document configuration saved");
      await fetchDocuments();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleCreateNew = async () => {
    if (!newDoc.docKey?.trim() || !newDoc.docName?.trim()) {
      toast.error("Document key and name are required");
      return;
    }
    if (newDoc.userTypes.length === 0) {
      toast.error("Select at least one user type");
      return;
    }

    setCreatingNew(true);
    try {
      const conditions = buildConditions(newDoc.conditionField, newDoc.conditionOp, newDoc.conditionValue);

      for (const ut of newDoc.userTypes) {
        await fetch(
          `${CONFIG.API_BASE_URL}/api/admin/document-configs`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              userType: ut,
              docKey: newDoc.docKey,
              docName: newDoc.docName,
              required: newDoc.required,
              adminOnly: newDoc.adminOnly,
              downloadable: newDoc.downloadable,
              workflow: newDoc.workflow,
              description: newDoc.description,
              conditions,
            }),
          }
        );
      }

      toast.success("Document type created");
      setShowNewForm(false);
      setNewDoc({
        docKey: "", docName: "", required: true, adminOnly: false,
        downloadable: false, workflow: "REGISTRATION", description: "",
        userTypes: [], conditionField: "", conditionOp: "equals", conditionValue: "",
      });
      await fetchDocuments();
    } catch {
      toast.error("Failed to create");
    } finally {
      setCreatingNew(false);
    }
  };

  const handleDelete = async (docKey) => {
    if (!confirm("Delete this document type from ALL user types?")) return;
    const doc = documents.find((d) => d.docKey === docKey);
    if (!doc) return;

    try {
      for (const ut of Object.keys(doc.ids)) {
        await fetch(
          `${CONFIG.API_BASE_URL}/api/admin/document-configs/${doc.ids[ut]}`,
          { method: "DELETE", headers: getAuthHeaders() }
        );
      }
      toast.success("Document type deleted");
      setExpandedKey(null);
      await fetchDocuments();
    } catch {
      toast.error("Failed to delete");
    }
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
          <h1 className="text-xl font-semibold text-[#1E1E1E] font-sfpro">Document Configuration</h1>
          <p className="text-sm text-gray-500 font-sfpro mt-1">
            {documents.length} document type{documents.length !== 1 ? "s" : ""}. Configure which documents each user type must upload during registration.
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-[#039994] hover:bg-[#02857f] text-white text-xs font-sfpro"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Document Type
        </Button>
      </div>

      {/* New Document Form */}
      {showNewForm && (
        <div className="border-2 border-dashed border-[#039994]/40 rounded-xl p-4 mb-4 bg-[#039994]/5">
          <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-3">New Document Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 font-sfpro mb-1 block">Document Key</label>
              <Input
                value={newDoc.docKey}
                onChange={(e) => setNewDoc({ ...newDoc, docKey: e.target.value.replace(/\s/g, "") })}
                placeholder="e.g., financeAgreement"
                className="text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-sfpro mb-1 block">Display Name</label>
              <Input
                value={newDoc.docName}
                onChange={(e) => setNewDoc({ ...newDoc, docName: e.target.value })}
                placeholder="e.g., Finance Agreement"
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-sfpro mb-1 block">Workflow</label>
              <select
                value={newDoc.workflow}
                onChange={(e) => setNewDoc({ ...newDoc, workflow: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
              >
                <option value="REGISTRATION">Registration</option>
                <option value="ADMIN_ONLY">Admin Only</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 font-sfpro mb-1 block">Applies to</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_USER_TYPES.map((ut) => (
                <UserTypePill
                  key={ut.key}
                  label={ut.label}
                  selected={newDoc.userTypes.includes(ut.key)}
                  onClick={() => setNewDoc((prev) => ({
                    ...prev,
                    userTypes: prev.userTypes.includes(ut.key)
                      ? prev.userTypes.filter((t) => t !== ut.key)
                      : [...prev.userTypes, ut.key],
                  }))}
                />
              ))}
            </div>
          </div>

          <div className="mb-3">
            <label className="text-xs text-gray-500 font-sfpro mb-1 block">Description (optional)</label>
            <Input
              value={newDoc.description}
              onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
              placeholder="Brief description of this document"
              className="text-sm"
            />
          </div>

          {/* Condition */}
          <div className="mb-3">
            <label className="text-xs text-gray-500 font-sfpro mb-1 block">Condition (optional)</label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 font-sfpro">Show only when</span>
              <Input
                value={newDoc.conditionField}
                onChange={(e) => setNewDoc({ ...newDoc, conditionField: e.target.value })}
                placeholder="field (e.g., financeType)"
                className="text-xs w-36"
              />
              <select
                value={newDoc.conditionOp}
                onChange={(e) => setNewDoc({ ...newDoc, conditionOp: e.target.value })}
                className="rounded-md border border-gray-300 px-2 py-1.5 text-xs"
              >
                <option value="equals">equals</option>
                <option value="not">is not</option>
              </select>
              <Input
                value={newDoc.conditionValue}
                onChange={(e) => setNewDoc({ ...newDoc, conditionValue: e.target.value })}
                placeholder="value (e.g., CASH)"
                className="text-xs w-32"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={newDoc.required}
                onChange={(e) => setNewDoc({ ...newDoc, required: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]" />
              <span className="text-xs text-gray-600 font-sfpro">Required</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={newDoc.adminOnly}
                onChange={(e) => setNewDoc({ ...newDoc, adminOnly: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]" />
              <span className="text-xs text-gray-600 font-sfpro">Admin Only</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={newDoc.downloadable}
                onChange={(e) => setNewDoc({ ...newDoc, downloadable: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]" />
              <span className="text-xs text-gray-600 font-sfpro">Downloadable Template</span>
            </label>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowNewForm(false)} className="text-xs font-sfpro">Cancel</Button>
            <Button size="sm" onClick={handleCreateNew} disabled={creatingNew}
              className="bg-[#039994] hover:bg-[#02857f] text-white text-xs font-sfpro">
              {creatingNew ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              Create
            </Button>
          </div>
        </div>
      )}

      {/* Document List */}
      {documents.length === 0 && !showNewForm ? (
        <div className="border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-sfpro">No document types configured yet.</p>
          <p className="text-xs text-gray-400 font-sfpro mt-1">Click "Add Document Type" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => {
            const isExpanded = expandedKey === doc.docKey;
            const edit = editState[doc.docKey];
            const typeLabels = doc.userTypes.map(
              (k) => ALL_USER_TYPES.find((t) => t.key === k)?.label || k
            );

            return (
              <div key={doc.docKey} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(doc.docKey)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-[#039994] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#1E1E1E] font-sfpro truncate">{doc.docName}</h2>
                        {doc.adminOnly && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-sfpro font-medium bg-purple-50 text-purple-600 border border-purple-200">
                            <Shield className="h-2.5 w-2.5" /> Admin
                          </span>
                        )}
                        {doc.downloadable && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-sfpro font-medium bg-blue-50 text-blue-600 border border-blue-200">
                            <Download className="h-2.5 w-2.5" /> Template
                          </span>
                        )}
                        {!doc.required && (
                          <span className="text-[9px] font-sfpro text-amber-500">(Optional)</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {typeLabels.map((label) => <DocBadge key={label} label={label} />)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {doc.conditions && (
                      <span className="text-[9px] text-amber-600 font-sfpro bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <AlertCircle className="h-2.5 w-2.5 inline mr-0.5" />Conditional
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-sfpro uppercase">{doc.workflow}</span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Editor */}
                {isExpanded && edit && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="text-xs text-gray-500 font-sfpro mb-1 block">Document Key</label>
                        <Input value={doc.docKey} disabled className="text-sm font-mono bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-sfpro mb-1 block">Display Name</label>
                        <Input value={edit.docName} onChange={(e) => handleFieldChange(doc.docKey, "docName", e.target.value)} className="text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-sfpro mb-1 block">Workflow</label>
                        <select value={edit.workflow} onChange={(e) => handleFieldChange(doc.docKey, "workflow", e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]">
                          <option value="REGISTRATION">Registration</option>
                          <option value="ADMIN_ONLY">Admin Only</option>
                        </select>
                      </div>
                    </div>

                    {/* User Types */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Applies to</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_USER_TYPES.map((ut) => (
                          <UserTypePill
                            key={ut.key}
                            label={ut.label}
                            selected={(edit.userTypes || []).includes(ut.key)}
                            onClick={() => toggleUserType(doc.docKey, ut.key)}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Description</label>
                      <Input value={edit.description} onChange={(e) => handleFieldChange(doc.docKey, "description", e.target.value)}
                        placeholder="Brief description" className="text-sm" />
                    </div>

                    {/* Condition */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Condition</label>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500 font-sfpro">Show only when</span>
                        <Input value={edit.conditionField} onChange={(e) => handleFieldChange(doc.docKey, "conditionField", e.target.value)}
                          placeholder="field" className="text-xs w-36" />
                        <select value={edit.conditionOp} onChange={(e) => handleFieldChange(doc.docKey, "conditionOp", e.target.value)}
                          className="rounded-md border border-gray-300 px-2 py-1.5 text-xs">
                          <option value="equals">equals</option>
                          <option value="not">is not</option>
                        </select>
                        <Input value={edit.conditionValue} onChange={(e) => handleFieldChange(doc.docKey, "conditionValue", e.target.value)}
                          placeholder="value" className="text-xs w-32" />
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-4 mb-3">
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" checked={edit.required}
                          onChange={(e) => handleFieldChange(doc.docKey, "required", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]" />
                        <span className="text-xs text-gray-600 font-sfpro">Required</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" checked={edit.adminOnly}
                          onChange={(e) => handleFieldChange(doc.docKey, "adminOnly", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]" />
                        <span className="text-xs text-gray-600 font-sfpro">Admin Only</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input type="checkbox" checked={edit.downloadable}
                          onChange={(e) => handleFieldChange(doc.docKey, "downloadable", e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-gray-300 text-[#039994] focus:ring-[#039994]" />
                        <span className="text-xs text-gray-600 font-sfpro">Downloadable Template</span>
                      </label>
                    </div>

                    {/* Template Upload */}
                    {edit.downloadable && (
                      <div className="mb-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                        <label className="text-xs text-gray-500 font-sfpro mb-2 block">Example Template Document</label>
                        {edit.templateUrl ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={edit.templateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-[#039994] hover:underline font-sfpro"
                            >
                              <ExternalLink className="h-3 w-3" /> View uploaded template
                            </a>
                            <span className="text-gray-300">|</span>
                            <label className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#039994] cursor-pointer font-sfpro">
                              <Upload className="h-3 w-3" /> Replace
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={(e) => handleTemplateUpload(doc.docKey, e.target.files?.[0])}
                              />
                            </label>
                          </div>
                        ) : (
                          <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-blue-300 text-xs font-sfpro cursor-pointer hover:bg-blue-100/50 transition-colors ${uploadingTemplate === doc.docKey ? "opacity-50 pointer-events-none" : "text-blue-600"}`}>
                            {uploadingTemplate === doc.docKey ? (
                              <><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</>
                            ) : (
                              <><Upload className="h-3 w-3" /> Upload example template</>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                              onChange={(e) => handleTemplateUpload(doc.docKey, e.target.files?.[0])}
                              disabled={uploadingTemplate === doc.docKey}
                            />
                          </label>
                        )}
                        <p className="text-[10px] text-gray-400 font-sfpro mt-1">
                          Users will see a "Download Example" link to reference this document.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleDelete(doc.docKey)}
                        className="text-xs font-sfpro text-red-500 hover:text-red-700 hover:border-red-300">
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                      <Button size="sm" onClick={() => handleSave(doc.docKey)} disabled={saving === doc.docKey}
                        className="bg-[#039994] hover:bg-[#02857f] text-white text-xs font-sfpro">
                        {saving === doc.docKey ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                        Save Changes
                      </Button>
                    </div>
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
