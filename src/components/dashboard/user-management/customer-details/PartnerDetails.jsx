"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft, Trash2, Copy, Check, Mail, Phone, MapPin,
  Calendar, Hash, Users, User, Loader2, ExternalLink,
  Building2, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CONFIG from "@/lib/config";

const TABS = ["Profile", "Customers"];

function UserTypeBadge({ type }) {
  const map = {
    PARTNER: { label: "Partner", bg: "bg-purple-100", text: "text-purple-700" },
    SALES_AGENT: { label: "Sales Agent", bg: "bg-blue-100", text: "text-blue-700" },
    INSTALLER: { label: "Installer", bg: "bg-orange-100", text: "text-orange-700" },
    FINANCE_COMPANY: { label: "Finance Company", bg: "bg-indigo-100", text: "text-indigo-700" },
  };
  const cfg = map[type] || { label: type || "Partner", bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-sfpro ${cfg.bg} ${cfg.text}`}>
      <Building2 className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Active: { bg: "bg-green-100", text: "text-green-700" },
    active: { bg: "bg-green-100", text: "text-green-700" },
    ACTIVE: { bg: "bg-green-100", text: "text-green-700" },
    ACCEPTED: { bg: "bg-green-100", text: "text-green-700" },
    Accepted: { bg: "bg-green-100", text: "text-green-700" },
    Invited: { bg: "bg-amber-100", text: "text-amber-700" },
    invited: { bg: "bg-amber-100", text: "text-amber-700" },
    PENDING: { bg: "bg-amber-100", text: "text-amber-700" },
    Pending: { bg: "bg-amber-100", text: "text-amber-700" },
    pending: { bg: "bg-amber-100", text: "text-amber-700" },
    Registered: { bg: "bg-sky-100", text: "text-sky-700" },
    registered: { bg: "bg-sky-100", text: "text-sky-700" },
    Inactive: { bg: "bg-gray-100", text: "text-gray-500" },
    inactive: { bg: "bg-gray-100", text: "text-gray-500" },
    Terminated: { bg: "bg-red-100", text: "text-red-600" },
    terminated: { bg: "bg-red-100", text: "text-red-600" },
    REJECTED: { bg: "bg-red-100", text: "text-red-600" },
  };
  const cfg = map[status] || { bg: "bg-gray-100", text: "text-gray-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium font-sfpro ${cfg.bg} ${cfg.text}`}>
      <ShieldCheck className="h-3 w-3" />
      {status || "Unknown"}
    </span>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-500 font-sfpro">{label}</p>
      <p className="text-sm font-medium text-[#1E1E1E] font-sfpro">{value || "Not specified"}</p>
    </div>
  );
}

export default function PartnerDetails({ customer, onBack }) {
  const [activeTab, setActiveTab] = useState("Profile");
  const [partnerData, setPartnerData] = useState(null);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [referredUsers, setReferredUsers] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (customer?.id || customer?.email) {
      fetchPartnerDetails();
    }
  }, [customer?.id, customer?.email]);

  useEffect(() => {
    if (activeTab === "Customers" && (customer?.id || partnerData?.id)) {
      fetchReferrals();
    }
  }, [activeTab]);

  const fetchPartnerDetails = async () => {
    setLoadingPartner(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;
      const email = customer.email;
      if (!email) return;
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/customer/${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.data) {
          setPartnerData(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching partner details:", err);
    } finally {
      setLoadingPartner(false);
    }
  };

  const fetchReferrals = async () => {
    const userId = customer?.id || partnerData?.id;
    if (!userId) return;
    setLoadingReferrals(true);
    setReferralError(null);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) return;

      // Primary: referred-users endpoint
      let rawReferrals = null;
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/user/referred-users/${userId}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success") {
          rawReferrals = Array.isArray(data.data) ? data.data : [];
        }
      }
      if (!rawReferrals) rawReferrals = partnerData?.referrals ?? [];

      // Enrich missing fields using get-all-users?email=X — same source as Customer Management
      const needsEnrichment = rawReferrals.filter(
        (r) => {
          const email = r.inviteeEmail || r.email;
          return email && (!r.firstName && !r.name || !r.phoneNumber || !r.userType && !r.customerType);
        }
      );
      if (needsEnrichment.length) {
        const enrichResults = await Promise.allSettled(
          needsEnrichment.map((r) => {
            const email = (r.inviteeEmail || r.email || "").trim();
            return fetch(
              `${CONFIG.API_BASE_URL}/api/admin/get-all-users?email=${encodeURIComponent(email)}&limit=1`,
              { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
            ).then((res) => res.ok ? res.json() : null);
          })
        );
        const profileMap = new Map();
        needsEnrichment.forEach((r, i) => {
          const result = enrichResults[i];
          if (result.status === "fulfilled" && result.value?.data?.users?.length) {
            const u = result.value.data.users[0];
            const key = (r.inviteeEmail || r.email || "").toLowerCase();
            profileMap.set(key, u);
          }
        });
        rawReferrals = rawReferrals.map((ref) => {
          const key = (ref.inviteeEmail || ref.email || "").toLowerCase();
          const u = profileMap.get(key);
          if (!u) return ref;
          return {
            ...ref,
            firstName: u.firstName || ref.firstName || null,
            lastName: u.lastName || ref.lastName || null,
            name: u.name || ref.name || null,
            userType: u.userType || ref.userType || ref.customerType || null,
            role: u.role || ref.role || null,
            phoneNumber: u.phoneNumber || ref.phoneNumber || null,
            status: u.status || ref.status || null,
            createdAt: u.createdAt || ref.createdAt || null,
          };
        });
      }

      setReferredUsers(rawReferrals);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setReferralError(err.message);
      if (partnerData?.referrals) setReferredUsers(partnerData.referrals);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const merged = { ...customer, ...partnerData };
  // Construct full name from firstName/lastName if a combined .name isn't present
  const fullName = merged.name ||
    (merged.firstName || merged.lastName
      ? `${merged.firstName || ""} ${merged.lastName || ""}`.trim()
      : null);
  const referralCode = merged.referralCode || merged.agentCode || "—";
  const initials = (fullName || "??")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formatDate = (d) => {
    if (!d) return "Not specified";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return "Not specified"; }
  };

  const handleCopyCode = () => {
    if (referralCode !== "—") {
      navigator.clipboard.writeText(referralCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const formatUserType = (type) => {
    const map = {
      COMMERCIAL: "Commercial Owner",
      RESIDENTIAL: "Residential",
      PARTNER: "Partner",
      SALES_AGENT: "Sales Agent",
      INSTALLER: "Installer",
      FINANCE_COMPANY: "Finance Company",
    };
    return map[type] || type || "Not specified";
  };

  return (
    <div className="min-h-screen w-full flex flex-col py-6 px-0 bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-1">
        <button
          className="flex items-center text-[#039994] hover:text-[#02857f] text-sm font-sfpro"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Customers
        </button>
        <button className="text-red-500 hover:text-red-600 p-1" title="Delete partner">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Identity Banner */}
      <div className="border border-gray-200 rounded-xl p-5 mb-5 bg-gradient-to-r from-[#069B960D] to-white">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#039994] flex items-center justify-center text-white font-bold text-lg font-sfpro shadow">
            {loadingPartner ? <Loader2 className="h-5 w-5 animate-spin" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[#1E1E1E] font-sfpro truncate">{fullName || "—"}</h2>
            <p className="text-sm text-gray-500 font-sfpro truncate">{merged.email || "—"}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <UserTypeBadge type={merged.userType || merged.partnerType} />
              <StatusBadge status={merged.status} />
            </div>
          </div>
          {/* Referral Code */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-500 font-sfpro mb-1">Agent / Referral Code</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="font-mono text-sm font-semibold text-[#039994] bg-[#03999415] px-3 py-1 rounded-lg">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                title="Copy code"
                className="text-gray-400 hover:text-[#039994] transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-sfpro font-medium transition-colors border-b-2 ${
              activeTab === tab
                ? "border-[#039994] text-[#039994]"
                : "border-transparent text-gray-500 hover:text-[#1E1E1E]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Profile */}
      {activeTab === "Profile" && (
        <div className="space-y-5">
          {/* Contact Info */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4 flex items-center gap-2">
              <User className="h-4 w-4" /> Contact Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <InfoField label="Full Name" value={fullName} />
              <InfoField label="Email Address" value={merged.email} />
              <InfoField label="Phone Number" value={merged.phone} />
              <InfoField label="Address" value={merged.address} />
              <InfoField label="User Type" value={formatUserType(merged.userType)} />
              <InfoField label="Partner Type" value={formatUserType(merged.partnerType || merged.userType)} />
            </div>
          </div>

          {/* Account Details */}
          <div className="border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Account Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
              <InfoField label="User ID" value={merged.id} />
              <InfoField label="Status" value={merged.status} />
              <InfoField label="Date Registered" value={formatDate(merged.date || merged.createdAt)} />
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 font-sfpro">Referral / Agent Code</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-[#039994]">{referralCode}</span>
                  <button onClick={handleCopyCode} className="text-gray-400 hover:text-[#039994]">
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <InfoField label="Active Account" value={merged.isActive === true ? "Yes" : merged.isActive === false ? "No" : "Not specified"} />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Customers */}
      {activeTab === "Customers" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#1E1E1E] font-sfpro flex items-center gap-2">
              <Users className="h-4 w-4 text-[#039994]" />
              Referred Customers
              {!loadingReferrals && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#03999415] text-[#039994] text-xs font-medium">
                  {referredUsers.length}
                </span>
              )}
            </h3>
          </div>

          {loadingReferrals ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-sfpro">Loading customers...</span>
            </div>
          ) : referralError ? (
            <div className="border border-red-200 rounded-xl p-10 text-center">
              <p className="text-sm text-red-500 font-sfpro">Failed to load customers: {referralError}</p>
              <button onClick={fetchReferrals} className="mt-3 text-sm text-[#039994] underline font-sfpro">Retry</button>
            </div>
          ) : referredUsers.length === 0 ? (
            <div className="border border-gray-200 rounded-xl p-10 text-center">
              <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-sfpro">No referred customers found for this partner.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full border-y text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">S/N</th>
                    {["Name", "Email", "Customer Type", "Role", "Phone Number", "Status", "Date Registered"].map((h) => (
                      <th key={h} className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {referredUsers.map((referral, i) => {
                    const name = referral.firstName
                      ? `${referral.firstName} ${referral.lastName || ""}`.trim()
                      : referral.name || "—";
                    const email = referral.email || referral.inviteeEmail || "—";
                    const customerType = referral.userType || referral.customerType || "—";
                    const role = referral.role || referral.partnerType || "—";
                    return (
                      <tr key={referral.id || i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                        <td className="py-3 px-4 font-sfpro text-[#626060]">{i + 1}</td>
                        <td className="py-3 px-4 font-sfpro text-[#1E1E1E] font-medium">{name}</td>
                        <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{email}</td>
                        <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{customerType}</td>
                        <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{role}</td>
                        <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{referral.phoneNumber || "—"}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={referral.status} />
                        </td>
                        <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{formatDate(referral.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
