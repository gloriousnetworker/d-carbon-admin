"use client";
import React, { useEffect, useState } from "react";
import CONFIG from "@/lib/config";

/**
 * DCarbon platform earnings — the residual cut from each facility commission
 * run, materialized server-side as Commission rows with userType='DCARBON'.
 *
 * Forward-only: shows $0 for periods predating the synthetic-row deploy
 * (commission-manager.service.ts a15b652+). Historical implicit-residual
 * isn't backfilled.
 */
export default function DcarbonEarningsCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/admin/dcarbon-earnings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load earnings");
        setData(json.data ?? json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const fmt = (n) => {
    const num = Number(n ?? 0);
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#1E1E1E] font-sfpro">
            DCarbon Platform Earnings
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 font-sfpro">
            Residual after customer + partner + sales-agent commissions
          </p>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 bg-[#03999415] text-[#039994] rounded-full">
          Live
        </span>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-sm text-gray-400">
          Loading…
        </div>
      ) : error ? (
        <div className="h-24 flex items-center justify-center text-sm text-rose-500">
          {error}
        </div>
      ) : !data ? (
        <div className="h-24 flex items-center justify-center text-sm text-gray-400">
          No data
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            {/* Lifetime */}
            <div className="bg-[#03999408] border border-[#03999420] rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Lifetime earnings</div>
              <div className="text-2xl font-bold text-[#039994]">
                {fmt(data.totalEarnings)}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                across {data.totalRows ?? 0} facility-period row{data.totalRows === 1 ? "" : "s"}
              </div>
            </div>
            {/* Current quarter */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">
                Q{data.currentQuarter?.quarter ?? "?"} {data.currentQuarter?.year ?? ""}
              </div>
              <div className="text-2xl font-bold text-[#1E1E1E]">
                {fmt(data.currentQuarter?.amount)}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                from {data.currentQuarter?.facilityCount ?? 0} facility row{data.currentQuarter?.facilityCount === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {/* Per-period mini list */}
          {data.byPeriod?.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-medium text-gray-700 mb-2">Recent quarters</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {data.byPeriod.slice(0, 6).map((p) => (
                  <div key={`${p.year}-${p.quarter}`} className="flex justify-between text-xs text-gray-600 border-b border-gray-100 pb-0.5">
                    <span>Q{p.quarter} {p.year}</span>
                    <span className="font-medium">{fmt(p.amount)}</span>
                    <span className="text-gray-400">{p.facilityCount} fac</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top facility (only show one to keep card small) */}
          {data.byFacility?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-700 mb-1">Top facility (lifetime)</div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[60%]" title={data.byFacility[0].facilityName ?? data.byFacility[0].facilityId}>
                  {data.byFacility[0].facilityName ?? data.byFacility[0].facilityId}
                </span>
                <span className="font-medium text-[#039994]">{fmt(data.byFacility[0].amount)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
