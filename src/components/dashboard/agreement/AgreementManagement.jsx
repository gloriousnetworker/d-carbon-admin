"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronUp, ChevronDown, Loader2, Save, RotateCcw,
  FileText, CheckCircle, AlertCircle, Clock, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import CONFIG from "../../../../lib/config";

const AGREEMENT_TYPES = [
  {
    key: "RESIDENTIAL",
    label: "Residential Customer Agreement",
    description: "Shown to residential users during facility registration",
  },
  {
    key: "COMMERCIAL",
    label: "Commercial Owner Agreement",
    description: "Shown to commercial facility owners during registration",
  },
  {
    key: "EPC_PARTNER",
    label: "EPC Partner Agreement",
    description: "Shown to EPC/installer partners during onboarding",
  },
  {
    key: "SALES_AGENT",
    label: "Sales Agent Agreement",
    description: "Shown to sales agent partners during onboarding",
  },
  {
    key: "FINANCE_PARTNER",
    label: "Finance Partner Agreement",
    description: "Shown to finance company partners during onboarding",
  },
  {
    key: "OPERATOR",
    label: "Operator Agreement",
    description: "Shown to facility operators during registration",
  },
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

export default function AgreementManagement() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [agreements, setAgreements] = useState({});
  const [editState, setEditState] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [previewKey, setPreviewKey] = useState(null);

  const getAuthHeaders = () => {
    const authToken = localStorage.getItem("authToken");
    return {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
  };

  const fetchAgreements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/agreement-templates`,
        { headers: getAuthHeaders() }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          const mapped = {};
          (Array.isArray(json.data) ? json.data : []).forEach((a) => {
            mapped[a.userType] = a;
          });
          setAgreements(mapped);
        }
      }
    } catch {
      // Endpoint may not exist yet — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  const toggleSection = (key) => {
    if (expandedSection === key) {
      setExpandedSection(null);
    } else {
      setExpandedSection(key);
      // Initialize edit state from existing data
      const existing = agreements[key];
      if (existing && !editState[key]) {
        setEditState((prev) => ({
          ...prev,
          [key]: {
            title: existing.title || "",
            content: existing.content || "",
            version: existing.version || "1.0",
          },
        }));
      } else if (!editState[key]) {
        const type = AGREEMENT_TYPES.find((t) => t.key === key);
        setEditState((prev) => ({
          ...prev,
          [key]: {
            title: type?.label || "",
            content: "",
            version: "1.0",
          },
        }));
      }
    }
  };

  const handleFieldChange = (key, field, value) => {
    setEditState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async (key, publish = false) => {
    const edit = editState[key];
    if (!edit?.content?.trim()) {
      toast.error("Agreement content cannot be empty");
      return;
    }

    setSaving(key);
    try {
      const existing = agreements[key];
      const method = existing?.id ? "PUT" : "POST";
      const url = existing?.id
        ? `${CONFIG.API_BASE_URL}/api/admin/agreement-templates/${existing.id}`
        : `${CONFIG.API_BASE_URL}/api/admin/agreement-templates`;

      const body = {
        userType: key,
        title: edit.title || AGREEMENT_TYPES.find((t) => t.key === key)?.label,
        content: edit.content,
        version: edit.version || "1.0",
        status: publish ? "PUBLISHED" : "DRAFT",
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === "success") {
          toast.success(publish ? "Agreement published" : "Draft saved");
          setAgreements((prev) => ({ ...prev, [key]: json.data }));
        } else {
          toast.error(json.message || "Failed to save");
        }
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

  const handleCancel = (key) => {
    const existing = agreements[key];
    if (existing) {
      setEditState((prev) => ({
        ...prev,
        [key]: {
          title: existing.title || "",
          content: existing.content || "",
          version: existing.version || "1.0",
        },
      }));
    } else {
      setEditState((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
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
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#1E1E1E] font-sfpro">Agreement Management</h1>
        <p className="text-sm text-gray-500 font-sfpro mt-1">
          Manage agreement content for each user type. Published agreements are shown to users during registration.
        </p>
      </div>

      <div className="space-y-3">
        {AGREEMENT_TYPES.map((type) => {
          const existing = agreements[type.key];
          const edit = editState[type.key];
          const isExpanded = expandedSection === type.key;
          const hasUnsavedChanges = edit && existing && (
            edit.content !== (existing.content || "") ||
            edit.title !== (existing.title || "") ||
            edit.version !== (existing.version || "1.0")
          );

          return (
            <div key={type.key} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Header */}
              <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(type.key)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#039994] flex-shrink-0" />
                  <div>
                    <h2 className="text-sm font-semibold text-[#1E1E1E] font-sfpro">{type.label}</h2>
                    <p className="text-xs text-gray-400 font-sfpro">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={existing?.status} />
                  {existing?.version && (
                    <span className="text-xs text-gray-400 font-sfpro">v{existing.version}</span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  {/* Title + Version row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Agreement Title</label>
                      <Input
                        value={edit?.title || ""}
                        onChange={(e) => handleFieldChange(type.key, "title", e.target.value)}
                        placeholder={type.label}
                        className="text-sm font-sfpro"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-sfpro mb-1 block">Version</label>
                      <Input
                        value={edit?.version || ""}
                        onChange={(e) => handleFieldChange(type.key, "version", e.target.value)}
                        placeholder="1.0"
                        className="text-sm font-sfpro"
                      />
                    </div>
                  </div>

                  {/* Content editor */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 font-sfpro mb-1 block">Agreement Content</label>
                    <Textarea
                      className="min-h-[250px] text-sm font-sfpro"
                      value={edit?.content || ""}
                      onChange={(e) => handleFieldChange(type.key, "content", e.target.value)}
                      placeholder="Enter the agreement text that will be shown to users during registration..."
                    />
                  </div>

                  {/* Metadata */}
                  {existing?.updatedAt && (
                    <p className="text-xs text-gray-400 font-sfpro mb-3">
                      Last updated: {new Date(existing.updatedAt).toLocaleString()}
                      {existing.updatedBy && ` by ${existing.updatedBy}`}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {previewKey === type.key ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewKey(null)}
                          className="text-xs font-sfpro"
                        >
                          Close Preview
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPreviewKey(type.key)}
                          disabled={!edit?.content}
                          className="text-xs font-sfpro"
                        >
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {hasUnsavedChanges && (
                        <span className="text-xs text-amber-500 font-sfpro">Unsaved changes</span>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(type.key)}
                        className="text-xs font-sfpro"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Discard
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSave(type.key, false)}
                        disabled={saving === type.key}
                        className="text-xs font-sfpro"
                      >
                        {saving === type.key ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        Save Draft
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(type.key, true)}
                        disabled={saving === type.key || !edit?.content?.trim()}
                        className="text-xs font-sfpro bg-[#039994] hover:bg-[#02857f] text-white"
                      >
                        {saving === type.key ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        )}
                        Publish
                      </Button>
                    </div>
                  </div>

                  {/* Preview panel */}
                  {previewKey === type.key && edit?.content && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="text-xs text-gray-400 font-sfpro mb-2 uppercase tracking-wide">Preview</div>
                      <h3 className="text-sm font-semibold text-[#1E1E1E] font-sfpro mb-2">
                        {edit.title || type.label}
                      </h3>
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
    </div>
  );
}
