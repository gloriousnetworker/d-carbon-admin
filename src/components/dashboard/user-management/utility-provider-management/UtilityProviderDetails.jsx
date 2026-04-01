"use client";
import CONFIG from "@/lib/config";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ExternalLink, Globe, FileText, Calendar,
  Hash, Users, Loader2, CheckCircle2, XCircle, Clock, AlertCircle,
} from "lucide-react";

function InfoField({ label, value, link = false }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-500 font-sfpro">{label}</p>
      {link && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#039994] font-sfpro flex items-center gap-1 hover:underline truncate"
        >
          {value}
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      ) : (
        <p className="text-sm font-medium text-[#1E1E1E] font-sfpro">{value || "Not specified"}</p>
      )}
    </div>
  );
}

const REQUEST_STATUS_STYLE = {
  pending:  { bg: "bg-amber-100",  text: "text-amber-700",  icon: Clock },
  approved: { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle2 },
  rejected: { bg: "bg-red-100",    text: "text-red-600",    icon: XCircle },
};

function RequestStatusBadge({ status }) {
  const key = (status || "").toLowerCase();
  const cfg = REQUEST_STATUS_STYLE[key] || { bg: "bg-gray-100", text: "text-gray-500", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-sfpro font-medium ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {status || "Unknown"}
    </span>
  );
}

export default function UtilityProviderDetails({ provider, onBack }) {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const formatDate = (d) => {
    if (!d) return "Not specified";
    try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return "Not specified"; }
  };

  useEffect(() => {
    if (!provider?.id) return;
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) return;
        const res = await fetch(
          `${CONFIG.API_BASE_URL}/api/admin/utility-provider-requests`,
          { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success") {
            const all = data.data?.requests || data.data || [];
            // Filter to requests for this specific provider
            const filtered = all.filter(
              r => r.utilityProviderId === provider.id || r.providerName === provider.name
            );
            setRequests(filtered);
          }
        }
      } catch (err) {
        console.error("Error fetching provider requests:", err);
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, [provider?.id]);

  if (!provider) return null;

  return (
    <div className="min-h-screen w-full flex flex-col py-6 px-0 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button
          className="flex items-center text-[#039994] hover:text-[#02857f] text-sm font-sfpro"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Utility Providers
        </button>
      </div>

      {/* Identity Banner */}
      <div className="border border-gray-200 rounded-xl p-5 mb-5 bg-gradient-to-r from-[#069B960D] to-white">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#039994] flex items-center justify-center text-white font-bold text-xl font-sfpro shadow">
            {(provider.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-[#1E1E1E] font-sfpro truncate">{provider.name || "—"}</h2>
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#039994] font-sfpro flex items-center gap-1 hover:underline mt-0.5"
              >
                <Globe className="h-3.5 w-3.5" />
                {provider.website}
              </a>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-xs text-gray-500 font-sfpro mb-0.5">Provider ID</p>
            <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{provider.id || "—"}</p>
          </div>
        </div>
      </div>

      {/* Details Card */}
      <div className="border border-gray-200 rounded-xl p-5 mb-5">
        <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4 flex items-center gap-2">
          <Hash className="h-4 w-4" /> Provider Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
          <InfoField label="Provider Name" value={provider.name} />
          <InfoField label="Website" value={provider.website} link />
          <InfoField label="Documentation" value={provider.documentation} link />
          <InfoField label="Date Added" value={formatDate(provider.createdAt)} />
          <InfoField label="Last Updated" value={formatDate(provider.updatedAt)} />
        </div>
      </div>

      {/* Associated Requests */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[#039994] font-sfpro mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Associated Requests
          {!loadingRequests && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-[#03999415] text-[#039994] text-xs font-medium">
              {requests.length}
            </span>
          )}
        </h3>

        {loadingRequests ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm font-sfpro">Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-sfpro">No requests found for this provider.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y">
                  {["Name", "Contact Email", "Status", "Requested"].map(h => (
                    <th key={h} className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={req.id || i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{req.name || "—"}</td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{req.contactEmail || req.email || "—"}</td>
                    <td className="py-3 px-4"><RequestStatusBadge status={req.status} /></td>
                    <td className="py-3 px-4 font-sfpro text-[#1E1E1E]">{formatDate(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
