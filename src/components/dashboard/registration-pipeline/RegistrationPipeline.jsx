"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ChevronRight, AlertTriangle, CheckCircle2, Clock, Users, Zap, XCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import CONFIG from "@/lib/config";

// ─── Stage definitions ───────────────────────────────────────────────────────

const STAGES = [
  {
    key: "invited",
    label: "Invited",
    description: "Awaiting registration",
    icon: Clock,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-400",
    actionNeeded: false,
  },
  {
    key: "registered",
    label: "Registered",
    description: "Account created, no facility yet",
    icon: UserCheck,
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-400",
    actionNeeded: false,
  },
  {
    key: "docs_pending",
    label: "Docs Under Review",
    description: "Awaiting admin review",
    icon: AlertTriangle,
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-400",
    actionNeeded: true,
  },
  {
    key: "docs_approved",
    label: "Docs Approved",
    description: "Awaiting facility verification",
    icon: CheckCircle2,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    actionNeeded: false,
  },
  {
    key: "verified",
    label: "Verified",
    description: "Facility verified, awaiting authority",
    icon: CheckCircle2,
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-500",
    actionNeeded: false,
  },
  {
    key: "active",
    label: "Active",
    description: "Generator running, producing RECs",
    icon: Zap,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    dot: "bg-green-500",
    actionNeeded: false,
  },
  {
    key: "terminated",
    label: "Terminated",
    description: "Account closed",
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    dot: "bg-red-500",
    actionNeeded: false,
  },
];

function getStage(customer) {
  const status = (customer.status || "").toLowerCase();
  const facilityStatus = (customer.facilityStatus || "").toUpperCase();

  if (status === "terminated") return "terminated";
  if (status === "inactive") return "terminated";

  // Derive stage from facility progress rather than user status alone.
  // A user can be "active" in the DB but not yet have a verified facility.
  if (facilityStatus === "VERIFIED") return "active";
  if (facilityStatus === "APPROVED") return "docs_approved";
  if (facilityStatus === "PENDING") return "docs_pending";

  // No facility status — check user registration status
  if (status === "active" || status === "registered") return "registered";
  if (status === "invited" || status === "pending") return "invited";
  return "invited";
}

function StageBadge({ stageKey }) {
  const stage = STAGES.find((s) => s.key === stageKey);
  if (!stage) return null;
  const Icon = stage.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-sfpro ${stage.bg} ${stage.text}`}>
      <Icon className="h-3 w-3" />
      {stage.label}
    </span>
  );
}

function formatUserType(type) {
  const map = {
    COMMERCIAL: "Commercial",
    RESIDENTIAL: "Residential",
    PARTNER: "Partner",
    SALES_AGENT: "Sales Agent",
    INSTALLER: "Installer",
    FINANCE_COMPANY: "Finance Company",
  };
  return map[type] || type || "—";
}

function formatDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

const PAGE_SIZE = 20;

// FIX-01: Status group definitions — maps operational labels to pipeline stage keys
const STATUS_GROUPS = {
  all:          null,
  pending:      ["invited", "registered"],
  under_review: ["docs_pending"],
  approved:     ["docs_approved", "verified"],
  active:       ["active"],
  terminated:   ["terminated"],
};

const STATUS_GROUP_LABELS = [
  { key: "all",          label: "All" },
  { key: "pending",      label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved",     label: "Approved" },
  { key: "active",       label: "Active" },
  { key: "terminated",   label: "Terminated" },
];

export default function RegistrationPipeline() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  // FIX-01: top-level status group filter (above stage cards)
  const [statusGroupFilter, setStatusGroupFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handleCustomerClick = (customer) => {
    // Store selected customer for UserManagement to pick up
    sessionStorage.setItem("pipelineSelectedCustomer", JSON.stringify(customer));
    router.push("/admin-dashboard?section=userManagement");
  };

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const fetchCustomers = async (p) => {
    setLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Not authenticated");

      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/get-all-users?page=${p}&limit=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCustomers(data.data?.users || []);
      const meta = data.data?.metadata || {};
      setTotalUsers(meta.total || data.data?.users?.length || 0);
      setTotalPages(meta.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Count per stage
  const stageCounts = STAGES.reduce((acc, s) => {
    acc[s.key] = customers.filter((c) => getStage(c) === s.key).length;
    return acc;
  }, {});

  // FIX-01: Filtered list — respects both statusGroupFilter (group tabs) and activeFilter (stage cards)
  const filtered = customers.filter((c) => {
    const stage = getStage(c);
    // Group filter: if not "all", stage must be in the selected group
    const groupStages = STATUS_GROUPS[statusGroupFilter];
    const matchesGroup = !groupStages || groupStages.includes(stage);
    // Stage card filter: further narrows within the selected group
    const matchesStage = activeFilter === "all" || stage === activeFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (c.name || "").toLowerCase().includes(q) ||
      (c.companyName || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q);
    return matchesGroup && matchesStage && matchesSearch;
  });

  const actionNeededCount = customers.filter((c) => getStage(c) === "docs_pending").length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-[#1E1E1E] font-sfpro">Registration Pipeline</h1>
          <p className="text-sm text-gray-500 font-sfpro mt-0.5">
            Track every customer through the full registration lifecycle
          </p>
        </div>
        {actionNeededCount > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700 font-sfpro">
              {actionNeededCount} customer{actionNeededCount > 1 ? "s" : ""} awaiting document review
            </span>
          </div>
        )}
      </div>

      {/* FIX-01: Status group filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {STATUS_GROUP_LABELS.map(({ key, label }) => {
          const groupStages = STATUS_GROUPS[key];
          const count = groupStages
            ? customers.filter((c) => groupStages.includes(getStage(c))).length
            : customers.length;
          const isActive = statusGroupFilter === key;
          return (
            <button
              key={key}
              onClick={() => { setStatusGroupFilter(key); setActiveFilter("all"); }}
              className={`px-3 py-1.5 rounded-full text-xs font-sfpro font-medium transition-colors ${
                isActive
                  ? "bg-[#039994] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
              <span className={`ml-1.5 ${isActive ? "opacity-80" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stage summary cards */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-3 mb-6">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const count = stageCounts[stage.key] || 0;
          const isActive = activeFilter === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => setActiveFilter(isActive ? "all" : stage.key)}
              className={`rounded-xl border p-3 text-left transition-all ${
                isActive
                  ? `${stage.bg} ${stage.border} ring-2 ring-offset-1 ring-current ${stage.text}`
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3.5 w-3.5 ${isActive ? stage.text : "text-gray-400"}`} />
                {stage.actionNeeded && count > 0 && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                )}
              </div>
              <div className={`text-2xl font-bold font-sfpro ${isActive ? stage.text : "text-[#1E1E1E]"}`}>
                {count}
              </div>
              <div className={`text-xs font-sfpro mt-0.5 ${isActive ? stage.text : "text-gray-500"}`}>
                {stage.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search + filter controls */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-sfpro focus:outline-none focus:ring-2 focus:ring-[#039994]"
        />
        {(activeFilter !== "all" || statusGroupFilter !== "all" || search) && (
          <Button
            variant="outline"
            size="sm"
            className="text-sm font-sfpro"
            onClick={() => { setActiveFilter("all"); setStatusGroupFilter("all"); setSearch(""); }}
          >
            Clear filters
          </Button>
        )}
        <span className="text-sm text-gray-500 font-sfpro whitespace-nowrap">
          {filtered.length} of {customers.length}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span className="text-sm font-sfpro">Loading pipeline data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600 font-sfpro mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCustomers} className="font-sfpro">
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-gray-200 rounded-xl p-10 text-center">
          <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-sfpro">No customers match the current filter.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full border-y text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["#", "Name / Company", "Email", "Type", "Stage", "Facility Status", "Date Joined", ""].map((h) => (
                  <th key={h} className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, i) => {
                const stage = getStage(customer);
                const stageObj = STAGES.find((s) => s.key === stage);
                return (
                  <tr
                    key={customer.id}
                    onClick={() => handleCustomerClick(customer)}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors duration-100 cursor-pointer ${
                      stage === "docs_pending" ? "bg-orange-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-sfpro text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    {/* FIX-03: Company name as primary identity for commercial users */}
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      {customer.userType === "COMMERCIAL" && customer.companyName ? (
                        <div>
                          <p className="text-sm font-semibold">{customer.companyName}</p>
                          <p className="text-xs text-gray-400">{customer.name}</p>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">{customer.name || "—"}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E] max-w-[180px] truncate">
                      {customer.email || "—"}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      {formatUserType(customer.userType)}
                    </td>
                    <td className="py-3 px-4">
                      <StageBadge stageKey={stage} />
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      {customer.facilityStatus ? (
                        <span
                          className={`text-xs font-medium ${
                            customer.facilityStatus === "APPROVED"
                              ? "text-green-600"
                              : customer.facilityStatus === "PENDING"
                              ? "text-amber-600"
                              : "text-gray-400"
                          }`}
                        >
                          {customer.facilityStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No facility</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">
                      {formatDate(customer.date || customer.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      {stageObj?.actionNeeded && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-sfpro">
                          <AlertTriangle className="h-3 w-3" />
                          Review docs
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/60">
              <span className="text-xs text-gray-500 font-sfpro">
                Page {page} of {totalPages} ({totalUsers} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-xs font-sfpro"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-xs font-sfpro"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
