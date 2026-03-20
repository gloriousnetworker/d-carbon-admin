"use client";
import CONFIG from '@/lib/config';

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, Pencil, Trash2, Eye, Loader2, Mail, Phone,
  MapPin, Calendar, User, Hash, Users, FileText, CheckCircle2,
  XCircle, Clock, ExternalLink, Copy, Check,
  Building2, ShieldCheck, Download
} from "lucide-react";
import EditPartnerModal from "./partnerManagementModal/EditPartnerModal";
import { useToast } from "@/components/ui/use-toast";
import { exportToExcel, exportToCSV } from "@/lib/exportUtils";
import * as styles from "../styles";


const PARTNER_PROGRESS = [
  { key: "invited", label: "Invited" },
  { key: "registered", label: "Registered" },
  { key: "agreement", label: "Agreement Signed" },
  { key: "customers", label: "Customers Referred" },
  { key: "active", label: "Active" },
];

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
  const [agreementData, setAgreementData] = useState(null);
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
          const d = data.data;
          const partnerRel = d.partner || {};
          setPartnerDetails({
            ...partner,
            ...d,
            // Preserve partner business name from either source
            companyName: partner.companyName || partnerRel.name || d.companyName || '',
            partnerType: partner.partnerType || d.partnerType,
            address: partner.address || partnerRel.address || d.address || '',
            phoneNumber: partner.phoneNumber || partnerRel.phoneNumber || d.phoneNumber || '',
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

  const fetchAgreement = useCallback(async () => {
    const userId = partnerDetails?.id || partnerDetails?.userId || partner?.id || partner?.userId;
    if (!userId) return;
    try {
      const authToken = localStorage.getItem("authToken");
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/user/agreement/${userId}`, {
        headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          setAgreementData(json.data);
        }
      }
    } catch {
      // Non-critical — fall back to embedded agreements
    }
  }, [partnerDetails, partner]);

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
    if (partnerDetails) {
      fetchReferrals();
      fetchAgreement();
    }
  }, [partnerDetails]);

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
  const agreements = agreementData || partnerDetails.agreements || partnerDetails.user?.agreements;
  const referralCode = partnerDetails.referralCode || partnerDetails.user?.referralCode || partnerDetails.userDetails?.referralCode;
  const businessName = partnerDetails.companyName || partner?.companyName || "";
  const personalName = partnerDetails.ownerFullName || `${partnerDetails.firstName || ""} ${partnerDetails.lastName || ""}`.trim() || "";
  const partnerName = businessName || personalName || "Partner";
  const partnerEmail = partnerDetails.email || partnerDetails.displayEmail || "";


  const TABS = [
    { id: "profile", label: "Profile", icon: User },
    { id: "customers", label: "Customers", icon: Users },
    { id: "agreement", label: "Partner Agreement", icon: FileText },
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
            {businessName && personalName && businessName !== personalName && (
              <span className="text-xs text-gray-400 font-sfpro">({personalName})</span>
            )}
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
          <div className="mt-1 text-xs text-gray-400 font-sfpro">
            Agreement: <span className={agreements?.termsAccepted ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
              {agreements?.termsAccepted ? "Signed" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Registration progress ───────────────────────────── */}
      {(() => {
        const status = (partnerDetails.status || partnerDetails.user?.status || "").toLowerCase();
        const hasAgreement = !!(agreements?.termsAccepted || agreements?.signature || partnerDetails.agreementSigned);
        const hasCustomers = referrals.length > 0;
        const isTerminated = status === "terminated" || status === "inactive";
        const isActive = status === "active" || status === "approved" || partnerDetails.isActive === true;

        // Derive current stage from real data — each step is independently checked
        let currentStage = 0; // invited (always true if we have the partner)
        if (status !== "invited" && status !== "pending" && status !== "") currentStage = 1; // registered
        if (hasAgreement) currentStage = Math.max(currentStage, 2); // agreement signed
        if (hasCustomers) currentStage = Math.max(currentStage, 3); // customers referred
        // Active: partner has completed all steps (agreement + customers) and is active in system
        if (isActive && hasAgreement) currentStage = 4; // active

        return (
          <div className="mb-5 px-5 py-4 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium font-sfpro text-gray-500 uppercase tracking-wide">Registration Progress</div>
              {isTerminated && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium bg-red-100 text-red-600">
                  <XCircle className="h-3 w-3" /> Terminated
                </span>
              )}
            </div>
            <div className="flex items-center">
              {PARTNER_PROGRESS.map((stage, i, arr) => {
                const isDone = !isTerminated && i <= currentStage;
                const isCurrent = !isTerminated && i === currentStage;
                return (
                  <React.Fragment key={stage.key}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                        isDone ? "bg-[#039994] border-[#039994]" : "bg-white border-gray-300"
                      } ${isCurrent ? "ring-2 ring-[#039994]/30" : ""}`} />
                      <span className={`text-xs mt-1 font-sfpro whitespace-nowrap ${
                        isDone ? "text-[#039994] font-medium" : "text-gray-400"
                      }`}>{stage.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${isDone && i < currentStage ? "bg-[#039994]" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })()}

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
              <InfoField label="Partner Type" value={formatPartnerType(partnerDetails.partnerType)} icon={Building2} />
              <InfoField label="Email Address" value={partnerEmail} icon={Mail} />
              <InfoField label="Phone Number" value={partnerDetails.phoneNumber} icon={Phone} />
              <InfoField label="Date Joined" value={partnerDetails.createdAt ? new Date(partnerDetails.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"} icon={Calendar} />
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
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-sfpro text-gray-500">{referrals.length} customer{referrals.length !== 1 ? "s" : ""}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-sm font-sfpro"
                  onClick={() => {
                    const rows = referrals.map(ref => ({
                      name: ref.firstName ? `${ref.firstName} ${ref.lastName || ""}`.trim() : ref.name || "N/A",
                      email: ref.email || ref.inviteeEmail || "N/A",
                      userType: ref.userType || ref.customerType || ref.role || "N/A",
                      phoneNumber: ref.phoneNumber || "N/A",
                      status: ref.status || "N/A",
                      dateRegistered: ref.createdAt ? new Date(ref.createdAt).toLocaleDateString() : "N/A",
                    }))
                    const columns = [
                      { header: "Name", key: "name", width: 24 },
                      { header: "Email", key: "email", width: 28 },
                      { header: "Type", key: "userType", width: 14 },
                      { header: "Phone", key: "phoneNumber", width: 16 },
                      { header: "Status", key: "status", width: 12 },
                      { header: "Date Registered", key: "dateRegistered", width: 16 },
                    ]
                    const partnerName = (partnerDetails?.user?.firstName || partnerDetails?.name || "partner").replace(/[^a-zA-Z0-9]/g, "_")
                    exportToExcel(rows, columns, `${partnerName}_customers_${new Date().toISOString().slice(0, 10)}`, "Customers")
                  }}
                >
                  <Download className="h-4 w-4" />
                  Export Customers
                </Button>
              </div>
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

      {/* ─── Tab: Partner Agreement ────────────────────────────── */}
      {activeTab === "agreement" && (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4">Partner Agreement</h3>
            {agreements ? (
              <div className="space-y-4">
                {/* Agreement status card */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      agreements.termsAccepted ? "bg-green-100" : "bg-amber-50"
                    }`}>
                      {agreements.termsAccepted
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : <Clock className="h-4 w-4 text-amber-500" />
                      }
                    </div>
                    <div>
                      <div className="text-sm font-sfpro font-medium text-[#1E1E1E]">Terms & Conditions</div>
                      <div className="text-xs text-gray-500 font-sfpro mt-0.5">
                        {agreements.termsAccepted ? "Accepted and signed" : "Pending acceptance"}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${
                    agreements.termsAccepted ? "bg-green-100 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {agreements.termsAccepted ? "Signed" : "Pending"}
                  </span>
                </div>

                {/* E-Signature */}
                {agreements.signature && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#03999415]">
                        <FileText className="h-4 w-4 text-[#039994]" />
                      </div>
                      <div>
                        <div className="text-sm font-sfpro font-medium text-[#1E1E1E]">E-Signature</div>
                        <div className="text-xs text-gray-500 font-sfpro mt-0.5">Signed agreement on file</div>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(agreements.signature, "_blank")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#039994] text-[#039994] hover:bg-[#039994] hover:text-white rounded-lg text-xs font-sfpro font-medium transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Signature
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-10 w-10 text-gray-200 mb-3" />
                <p className="text-sm font-sfpro text-gray-500">No partner agreement on file</p>
                <p className="text-xs font-sfpro text-gray-400 mt-1">The partner has not yet signed their agreement</p>
              </div>
            )}
          </div>

          {/* Note about customer documents */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-2">Customer Documents</h3>
            <p className="text-xs text-gray-500 font-sfpro">
              Partners do not upload documents themselves. Facility documents (interconnection agreements, meter photos, etc.)
              are uploaded by their customers during registration. To view customer documents, go to the
              <button onClick={() => setActiveTab("customers")} className="text-[#039994] font-medium hover:underline mx-1">
                Customers tab
              </button>
              and select a customer.
            </p>
          </div>
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
