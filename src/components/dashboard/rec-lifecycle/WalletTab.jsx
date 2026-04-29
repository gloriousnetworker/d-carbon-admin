"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { recLifecycleApi } from "@/lib/recLifecycleApi";

const fmt = (n) => Number(n ?? 0).toLocaleString(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const Counter = ({ label, value, hint, accent }) => (
  <div className={`rounded-lg border p-3 ${accent ? "bg-[#03999408] border-[#03999420]" : "bg-gray-50 border-gray-200"}`}>
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className={`text-xl font-bold ${accent ? "text-[#039994]" : "text-[#1E1E1E]"}`}>
      {fmt(value)}
    </div>
    {hint && <div className="text-[10px] text-gray-400 mt-1">{hint}</div>}
  </div>
);

const WalletCard = ({ title, subtitle, wallet, loading, onRefresh }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-[#1E1E1E] font-sfpro">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
        title="Refresh"
      >
        <FiRefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>

    {loading && !wallet ? (
      <div className="h-24 flex items-center justify-center text-sm text-gray-400">Loading…</div>
    ) : !wallet ? (
      <div className="h-24 flex items-center justify-center text-sm text-gray-400">No data</div>
    ) : (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Counter label="Total generated" value={wallet.totalGenerated} accent />
          <Counter label="Pending (in WREGIS)" value={wallet.pending ?? wallet.totalSubmitted} hint="awaiting WREGIS confirmation" />
          <Counter label="Total approved" value={wallet.totalApproved} hint="lifetime confirmed" />
          <Counter label="Available for sale" value={wallet.availableForSale} hint="approved minus sold" accent />
          <Counter label="All-time RECs" value={wallet.allTimeRecs} />
          <Counter label="Sales balance ($)" value={wallet.salesBalance} hint="completed sale value" />
        </div>
        {wallet.updatedAt && (
          <div className="text-[11px] text-gray-400 mt-3">
            Updated {new Date(wallet.updatedAt).toLocaleString()}
          </div>
        )}
      </>
    )}
  </div>
);

export default function WalletTab({ refreshNonce = 0 }) {
  const [platform, setPlatform] = useState(null);
  const [platformLoading, setPlatformLoading] = useState(true);

  const [facilityIdInput, setFacilityIdInput] = useState("");
  const [facilityWallet, setFacilityWallet] = useState(null);
  const [facilityWalletLoading, setFacilityWalletLoading] = useState(false);
  const [facilityWalletId, setFacilityWalletId] = useState(null);

  const fetchPlatform = useCallback(async () => {
    setPlatformLoading(true);
    try {
      const data = await recLifecycleApi.getPlatformWallet();
      setPlatform(data);
    } catch (err) {
      toast.error(`Platform wallet: ${err.message}`, { position: "top-center" });
    } finally {
      setPlatformLoading(false);
    }
  }, []);

  const fetchFacility = useCallback(async (id) => {
    setFacilityWalletLoading(true);
    try {
      const data = await recLifecycleApi.getFacilityWallet(id);
      setFacilityWallet(data);
      setFacilityWalletId(id);
    } catch (err) {
      toast.error(`Facility wallet: ${err.message}`, { position: "top-center" });
      setFacilityWallet(null);
      setFacilityWalletId(null);
    } finally {
      setFacilityWalletLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatform();
  }, [fetchPlatform, refreshNonce]);

  // Re-fetch facility wallet too whenever a successful export/approval bumps
  // the nonce (only if the user has one loaded).
  useEffect(() => {
    if (refreshNonce > 0 && facilityWalletId) {
      fetchFacility(facilityWalletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNonce]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const id = facilityIdInput.trim();
    if (!id) return;
    fetchFacility(id);
  };

  return (
    <div className="space-y-6">
      <WalletCard
        title="Platform wallet"
        subtitle="Aggregate counters across every facility"
        wallet={platform}
        loading={platformLoading}
        onRefresh={fetchPlatform}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-[#1E1E1E] font-sfpro">Facility wallet lookup</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Paste a residential or commercial facility ID — they share the same wallet keyspace.
            </p>
          </div>
        </div>

        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={facilityIdInput}
              onChange={(e) => setFacilityIdInput(e.target.value)}
              placeholder="facility-uuid"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
            />
          </div>
          <button
            type="submit"
            disabled={facilityWalletLoading || !facilityIdInput.trim()}
            className="px-4 py-2 bg-[#039994] text-white text-sm rounded-md hover:bg-[#028884] disabled:opacity-50"
          >
            {facilityWalletLoading ? "Loading…" : "Look up"}
          </button>
        </form>

        {facilityWallet && (
          <div className="mt-4">
            <WalletCard
              title={`Facility ${facilityWalletId?.slice(0, 8)}…`}
              subtitle={facilityWalletId}
              wallet={facilityWallet}
              loading={facilityWalletLoading}
              onRefresh={() => facilityWalletId && fetchFacility(facilityWalletId)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
