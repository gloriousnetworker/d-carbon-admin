"use client";
import CONFIG from '@/lib/config';

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, Pencil, Trash2, Eye, Loader2, Mail, Phone,
  MapPin, Calendar, User, Hash, Users, FileText, CheckCircle2,
  XCircle, Clock, AlertCircle, ExternalLink, Copy, Check,
  Building2, ShieldCheck
} from "lucide-react";
import EditPartnerModal from "./partnerManagementModal/EditPartnerModal";
import { useToast } from "@/components/ui/use-toast";
import * as styles from "../styles";

const DOC_TYPES = [
  { key: "interconnectionAgreement", statusKey: "interconnectionStatus", label: "Interconnection Agreement" },
  { key: "meterIdPhoto", statusKey: "meterIdStatus", label: "Meter ID Photo" },
  { key: "installerAgreement", statusKey: "installerAgreementStatus", label: "Installer Agreement" },
  { key: "singleLineDiagram", statusKey: "singleLineDiagramStatus", label: "Single-Line Diagram" },
  { key: "utilityPTOLetter", statusKey: "utilityPTOLetterStatus", label: "Utility PTO Letter" },
];

const DOC_STATUS = {
  REQUIRED: { label: "Required", icon: AlertCircle, bg: "bg-gray-100", text: "text-gray-500", iconColor: "text-gray-400" },
  SUBMITTED: { label: "Submitted", icon: Clock, bg: "bg-amber-50", text: "text-amber-700", iconColor: "text-amber-500" },
  APPROVED: { label: "Approved", icon: CheckCircle2, bg: "bg-green-100", text: "text-green-700", iconColor: "text-green-600" },
  REJECTED: { label: "Rejected", icon: XCircle, bg: "bg-red-50", text: "text-red-600", iconColor: "text-red-500" },
};

const PROGRESS_STAGES = [
  { key: "Invited", label: "Invited" },
  { key: "Registered", label: "Registered" },
  { key: "Active", label: "Active" },
  { key: "Terminated", label: "Terminated" },
];

function StatusBadge({ status }) {
  const cfg = DOC_STATUS[status] || DOC_STATUS.REQUIRED;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function InfoField({ label, value, icon: Icon, fullWidth = false }) {
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <div className="text-xs text-gray-500 font-sfpro mb-0.5">{label}</div>
      <div className="text-sm font-sfpro text-[#1E1E1E] flex items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
        <span className="truncate">{value || "N/A"}</span>
      </div>
    </div>
  );
}

export default function PartnerDetails({ partner, onBack, onCustomerSelect }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const fetchPartnerDetails = useCallback(async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("No authentication token found");
      if (!partner?.email) throw new Error("Partner data is incomplete");

      const encodedEmail = encodeURIComponent(partner.email.trim());
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/user/${encodedEmail}`, {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.data) {
          setPartnerDetails({
            ...partner,
            ...data.data,
            partnerType: partner.partnerType,
            address: partner.address || data.data.address,
          });
          return;
        }
      }
      // Fallback to data already passed in
      setPartnerDetails(partner);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      setPartnerDetails(partner);
    } finally {
      setLoading(false);
    }
  }, [partner]);

  const fetchReferrals = useCallback(async () => {
    const email = partnerDetails?.email || partner?.email;
    if (!email) return;
    try {
      setReferralsLoading(true);
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/customer/${encodeURIComponent(email.trim())}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.data) {
          setReferrals(Array.isArray(data.data.referrals) ? data.data.referrals : []);
          return;
        }
      }
      // Fallback: use referrals embedded in partnerDetails
      if (partnerDetails?.referrals) {
        setReferrals(partnerDetails.referrals);
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
      if (partnerDetails?.referrals) setReferrals(partnerDetails.referrals);
    } finally {
      setReferralsLoading(false);
    }
  }, [partnerDetails, partner]);

  useEffect(() => {
    fetchPartnerDetails();
  }, [fetchPartnerDetails]);

  useEffect(() => {
    if (activeTab === "customers" && partnerDetails) {
      fetchReferrals();
    }
  }, [activeTab, partnerDetails]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatPartnerType = (type) => {
    if (!type) return "N/A";
    return type.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString)
      .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
      .replace(/\//g, "-");
  };

  const getPartnerStatusStyle = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700";
      case "Invited": return "bg-amber-100 text-amber-700";
      case "Registered": return "bg-blue-100 text-blue-700";
      case "Terminated": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getReferralStatusStyle = (status) => {
    if (!status) return "bg-gray-100 text-gray-600";
    const s = status.toUpperCase();
    if (s === "ACCEPTED" || s === "ACTIVE") return "bg-green-100 text-green-700";
    if (s === "PENDING") return "bg-amber-100 text-amber-700";
    if (s === "EXPIRED") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col justify-center items-center h-64 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
        <p className="text-sm text-gray-500 font-sfpro">Loading partner details…</p>
      </div>
    );
  }

  if (!partnerDetails) {
    return (
      <div className="w-full text-center py-12 space-y-4">
        <p className="font-medium font-sfpro text-[#1E1E1E]">Failed to load partner details</p>
        <p className="text-sm text-gray-500 font-sfpro">Email: {partner?.email || "N/A"}</p>
        <Button variant="outline" className="font-sfpro" onClick={onBack}>Go Back</Button>
      </div>
    );
  }

  const docs = partnerDetails.documentation || partnerDetails.user?.documentation;
  const agreements = partnerDetails.agreements || partnerDetails.user?.agreements;
  const referralCode = partnerDetails.referralCode || partnerDetails.user?.referralCode || partnerDetails.userDetails?.referralCode;
  const partnerName = partnerDetails.name || `${partnerDetails.firstName || ""} ${partnerDetails.lastName || ""}`.trim() || "Partner";
  const partnerEmail = partnerDetails.email || partnerDetails.displayEmail || "";

  const docApprovedCount = DOC_TYPES.filter(({ statusKey }) => {
    const st = docs?.[statusKey];
    return st === "APPROVED";
  }).length;
  const docSubmittedCount = DOC_TYPES.filter(({ statusKey }) => {
    const st = docs?.[statusKey];
    return st === "SUBMITTED" || st === "APPROVED";
  }).length;

  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "customers", label: "Customers", icon: Users },
    { id: "documents", label: `Documents ${docs ? `(${docApprovedCount}/${DOC_TYPES.length})` : ""}`, icon: FileText },
  ];

  return (
    <div className="w-full">
      {/* ─── Top navigation ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-sfpro text-gray-600 hover:text-[#039994] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Partners
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 text-sm font-sfpro"
            onClick={() => setShowEditModal(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="ghost" className="text-red-500 hover:bg-red-50" title="Delete partner">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── Identity banner ────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-5 p-5 bg-[#069B960D] border border-[#039994]/25 rounded-xl">
        <div className="h-14 w-14 rounded-full bg-[#039994] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {partnerName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[17px] font-semibold text-[#1E1E1E] font-sfpro leading-tight">{partnerName}</h1>
            <span className="px-2 py-0.5 bg-[#039994]/10 text-[#039994] rounded-full text-xs font-sfpro font-medium">
              {formatPartnerType(partnerDetails.partnerType)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${getPartnerStatusStyle(partnerDetails.status)}`}>
              {partnerDetails.status || "N/A"}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-sfpro mt-0.5 truncate">{partnerEmail}</p>
          {referralCode && (
            <button
              onClick={() => copyToClipboard(referralCode)}
              className="mt-1 flex items-center gap-1.5 text-xs text-[#039994] font-sfpro hover:underline group"
            >
              <Hash className="h-3 w-3" />
              Agent Code:&nbsp;<span className="font-mono font-semibold">{referralCode}</span>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100" />}
            </button>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-gray-400 font-sfpro">Registered</div>
          <div className="text-sm font-medium font-sfpro text-[#1E1E1E]">{formatDate(partnerDetails.createdAt)}</div>
          {docs && (
            <div className="mt-1 text-xs text-gray-400 font-sfpro">
              Docs: <span className={docApprovedCount === DOC_TYPES.length ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>{docApprovedCount}/{DOC_TYPES.length} approved</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Registration progress ───────────────────────────── */}
      <div className="mb-5 px-5 py-4 border border-gray-200 rounded-xl bg-white">
        <div className="text-xs font-medium font-sfpro text-gray-500 uppercase tracking-wide mb-3">Registration Progress</div>
        <div className="flex items-center">
          {["Invited", "Registered", "Docs Submitted", "Docs Approved", "Active"].map((stage, i, arr) => {
            const statusToStage = { Invited: 0, Registered: 1, Active: 4, Terminated: -1 };
            const docsStage = docs ? (docApprovedCount === DOC_TYPES.length ? 3 : docSubmittedCount > 0 ? 2 : 1) : 0;
            const currentStage = partnerDetails.status === "Active" ? 4 : docsStage;
            const isDone = i <= currentStage && partnerDetails.status !== "Terminated";
            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${isDone ? "bg-[#039994] border-[#039994]" : "bg-white border-gray-300"}`} />
                  <span className={`text-xs mt-1 font-sfpro whitespace-nowrap ${isDone ? "text-[#039994] font-medium" : "text-gray-400"}`}>{stage}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${isDone && i < currentStage ? "bg-[#039994]" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ─── Tabs ───────────────────────────────────────────── */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-sfpro border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#039994] text-[#039994] font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab: Profile ────────────────────────────────────── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contact information */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <InfoField label="Business Name" value={partnerDetails.name} icon={Building2} />
              <InfoField label="Partner Type" value={formatPartnerType(partnerDetails.partnerType)} />
              <InfoField label="First Name" value={partnerDetails.firstName || partnerDetails.userDetails?.firstName} icon={User} />
              <InfoField label="Last Name" value={partnerDetails.lastName || partnerDetails.userDetails?.lastName} />
              <InfoField label="Email Address" value={partnerEmail} icon={Mail} />
              <InfoField label="Phone Number" value={partnerDetails.phoneNumber} icon={Phone} />
              <InfoField label="Address" value={partnerDetails.address} icon={MapPin} fullWidth />
            </div>
          </div>

          {/* Account details */}
          <div className="space-y-5">
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4">Account Details</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                <div>
                  <div className="text-xs text-gray-500 font-sfpro mb-1">Agent / Referral Code</div>
                  {referralCode ? (
                    <button
                      onClick={() => copyToClipboard(referralCode)}
                      className="flex items-center gap-1 text-sm font-mono font-semibold text-[#039994] hover:underline"
                    >
                      {referralCode}
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3 opacity-60" />}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400 font-sfpro">Not assigned</span>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-sfpro mb-1">Account Status</div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${
                    partnerDetails.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {partnerDetails.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                <InfoField label="User Type" value={partnerDetails.userType || "PARTNER"} icon={ShieldCheck} />
                <InfoField label="Date Registered" value={formatDate(partnerDetails.createdAt)} icon={Calendar} />
              </div>
            </div>

            {/* Agreement */}
            <div className="border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4">User Agreement</h3>
              {agreements ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-sfpro font-medium text-[#1E1E1E]">Terms Accepted</div>
                      <div className="text-xs text-gray-500 font-sfpro mt-0.5">
                        {agreements.termsAccepted ? "Yes — agreement on file" : "Not yet accepted"}
                      </div>
                    </div>
                    {agreements.termsAccepted && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  {agreements.signature && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 font-sfpro text-sm justify-center"
                      onClick={() => window.open(agreements.signature, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                      View E-Signature
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-sfpro">No agreement on file</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Customers ──────────────────────────────────── */}
      {activeTab === "customers" && (
        <div>
          {referralsLoading ? (
            <div className="flex flex-col justify-center items-center h-48 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
              <p className="text-sm text-gray-500 font-sfpro">Loading customers…</p>
            </div>
          ) : referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm font-sfpro text-gray-500">No customers referred by this partner yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="mb-3 text-sm font-sfpro text-gray-500">{referrals.length} customer{referrals.length !== 1 ? "s" : ""}</div>
              <table className="w-full">
                <thead>
                  <tr className="border-y text-sm">
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Name</th>
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Email</th>
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Type</th>
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Phone</th>
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Status</th>
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref, idx) => {
                    const name = ref.firstName
                      ? `${ref.firstName} ${ref.lastName || ""}`.trim()
                      : ref.name || "N/A";
                    const email = ref.email || ref.inviteeEmail || "N/A";
                    const type = ref.userType || ref.customerType || ref.role || "N/A";
                    const phone = ref.phoneNumber || "N/A";
                    const status = ref.status || "N/A";
                    const isClickable = !!onCustomerSelect && (type === "COMMERCIAL" || type === "RESIDENTIAL");
                    return (
                      <tr
                        key={ref.id || idx}
                        className={`border-b transition-colors duration-100 ${isClickable ? "hover:bg-[#03999410] cursor-pointer" : "hover:bg-gray-50"}`}
                        onClick={isClickable ? () => onCustomerSelect(ref) : undefined}
                      >
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E] font-medium">
                          {name}
                          {isClickable && (
                            <ExternalLink className="inline ml-1.5 h-3 w-3 text-[#039994] opacity-60" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{email}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{type}</td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{phone}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${getReferralStatusStyle(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-sfpro text-[#1E1E1E]">{formatDate(ref.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Documents ──────────────────────────────────── */}
      {activeTab === "documents" && (
        <div className="space-y-3">
          {docs ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#039994] rounded-full transition-all duration-500"
                    style={{ width: `${(docApprovedCount / DOC_TYPES.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-sfpro text-gray-600 flex-shrink-0">
                  {docApprovedCount} of {DOC_TYPES.length} approved
                </span>
              </div>

              {DOC_TYPES.map(({ key, statusKey, label }) => {
                const url = docs[key];
                const status = docs[statusKey] || "REQUIRED";
                const cfg = DOC_STATUS[status] || DOC_STATUS.REQUIRED;
                const Icon = cfg.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <FileText className={`h-4 w-4 ${cfg.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-sm font-sfpro font-medium text-[#1E1E1E]">{label}</div>
                        <div className="text-xs text-gray-400 font-sfpro mt-0.5">
                          {url ? "Document on file" : "Not yet uploaded by partner"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      {url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs font-sfpro text-[#039994] hover:text-[#02857f]"
                          onClick={() => window.open(url, "_blank")}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm font-sfpro text-gray-500">No documentation record found for this partner</p>
              <p className="text-xs font-sfpro text-gray-400 mt-1">Documents are uploaded during the user registration flow</p>
            </div>
          )}
        </div>
      )}

      <EditPartnerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        partner={partnerDetails}
      />
    </div>
  );
}
