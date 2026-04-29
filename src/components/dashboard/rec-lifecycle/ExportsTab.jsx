"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiDownload, FiAlertTriangle, FiX, FiRefreshCw } from "react-icons/fi";
import { recLifecycleApi, downloadBlob } from "@/lib/recLifecycleApi";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;

const StatusPill = ({ status }) => {
  const map = {
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${map[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

export default function ExportsTab({ onSuccess }) {
  const [year, setYear] = useState(thisYear);
  const [month, setMonth] = useState(thisMonth > 1 ? thisMonth - 1 : 12);
  const [format, setFormat] = useState("CSV");
  const [submitting, setSubmitting] = useState(false);

  // Re-export-blocked modal (the spec's 409 case).
  const [blockedMsg, setBlockedMsg] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const [drawer, setDrawer] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await recLifecycleApi.listExports({ page: 1, limit: 50 });
      setHistory(data?.data ?? []);
      setHistoryMeta({
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        totalPages: data?.totalPages ?? 1,
      });
    } catch (err) {
      toast.error(`Export history: ${err.message}`, { position: "top-center" });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onGenerate = async (e) => {
    e.preventDefault();
    if (!year || !month) {
      toast.error("Pick a year and month", { position: "top-center" });
      return;
    }
    setSubmitting(true);
    try {
      const result = await recLifecycleApi.createExport({
        year: Number(year),
        month: Number(month),
        format,
      });
      downloadBlob(result.blob, result.filename);
      toast.success(
        `Exported ${result.headers.totalRows} facility-vintage row${result.headers.totalRows === 1 ? "" : "s"}` +
          (result.headers.warnings > 0 ? ` (${result.headers.warnings} warning${result.headers.warnings === 1 ? "" : "s"})` : ""),
        { position: "top-center", duration: 5000 }
      );
      // History reflects this export immediately + wallet counters moved.
      fetchHistory();
      onSuccess?.();
    } catch (err) {
      if (err.status === 409) {
        setBlockedMsg(
          err.message ||
            `Cannot re-export ${year}-${String(month).padStart(2, "0")} — some facility-vintages are already approved. Use the adjust workflow instead.`
        );
      } else {
        toast.error(err.message, { position: "top-center", duration: 6000 });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openDrawer = async (id) => {
    setDrawer({ id });
    setDrawerLoading(true);
    try {
      const data = await recLifecycleApi.getExport(id);
      setDrawer(data);
    } catch (err) {
      toast.error(`Export details: ${err.message}`, { position: "top-center" });
      setDrawer(null);
    } finally {
      setDrawerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-[#1E1E1E] mb-1 font-sfpro">Generate WREGIS upload file</h3>
        <p className="text-xs text-gray-500 mb-4">
          Builds the file for a whole month and flips matched rows to <span className="font-medium">SUBMITTED</span>. Re-running for an already-approved month is blocked.
        </p>

        <form onSubmit={onGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value || "0", 10))}
              min={2020}
              max={2030}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
              disabled={submitting}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{`${i + 1} — ${name}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
            <div className="flex items-center gap-3 h-[38px]">
              {["CSV", "XLSX"].map((f) => (
                <label key={f} className="inline-flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                    disabled={submitting}
                  />
                  {f}
                </label>
              ))}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-[#039994] text-white text-sm rounded-md hover:bg-[#028884] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiDownload className="w-4 h-4" />
              {submitting ? "Generating…" : "Generate export"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#1E1E1E] font-sfpro">Export history</h3>
          <button
            onClick={fetchHistory}
            disabled={historyLoading}
            className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Refresh"
          >
            <FiRefreshCw className={`w-4 h-4 text-gray-500 ${historyLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {historyLoading && history.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : history.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-sm text-gray-400">No exports yet</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-100">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 text-[11px]">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Period</th>
                  <th className="text-left px-2 py-2 font-medium">Format</th>
                  <th className="text-right px-2 py-2 font-medium">Rows</th>
                  <th className="text-right px-2 py-2 font-medium">Quantity</th>
                  <th className="text-left px-2 py-2 font-medium">Status</th>
                  <th className="text-left px-2 py-2 font-medium">Created</th>
                  <th className="text-right px-3 py-2 font-medium">File</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t border-gray-100 hover:bg-gray-50 cursor-pointer ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                    onClick={() => openDrawer(row.id)}
                  >
                    <td className="px-3 py-2 text-gray-700">
                      {row.year}-{String(row.month).padStart(2, "0")}
                    </td>
                    <td className="px-2 py-2 text-gray-600">{row.format}</td>
                    <td className="px-2 py-2 text-right text-gray-700">{row.totalRows}</td>
                    <td className="px-2 py-2 text-right text-gray-700">{row.totalQuantity}</td>
                    <td className="px-2 py-2"><StatusPill status={row.status} /></td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.fileUrl ? (
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#039994] hover:underline"
                        >
                          download
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {historyMeta.total > history.length && (
          <div className="mt-2 text-[11px] text-gray-400">
            Showing {history.length} of {historyMeta.total}
          </div>
        )}
      </div>

      {blockedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-full">
                <FiAlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Re-export blocked</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Some facility-vintages in this period have already been approved. Adjustments must go through the per-record adjust workflow rather than a fresh export.
                </p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-900 my-3">
              {blockedMsg}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setBlockedMsg(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-xl">
            <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Export details</h3>
                <p className="text-xs text-gray-500 mt-0.5">{drawer.id}</p>
              </div>
              <button
                onClick={() => setDrawer(null)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {drawerLoading ? (
                <div className="text-gray-400 text-center py-8">Loading…</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-[10px] text-gray-500">Period</div>
                      <div className="font-medium">{drawer.year}-{String(drawer.month ?? "").padStart(2, "0")}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-[10px] text-gray-500">Format</div>
                      <div className="font-medium">{drawer.format}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-[10px] text-gray-500">Rows</div>
                      <div className="font-medium">{drawer.totalRows}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-[10px] text-gray-500">Total quantity</div>
                      <div className="font-medium">{drawer.totalQuantity}</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2 col-span-2">
                      <div className="text-[10px] text-gray-500">Checksum</div>
                      <div className="font-mono text-[11px] break-all">{drawer.fileChecksum || "—"}</div>
                    </div>
                  </div>

                  {drawer.fileUrl && (
                    <a
                      href={drawer.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-[#039994] hover:underline"
                    >
                      <FiDownload className="w-4 h-4" /> Download file
                    </a>
                  )}

                  {Array.isArray(drawer.items) && drawer.items.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Facility-vintages in this export ({drawer.items.length})
                      </div>
                      <div className="border border-gray-100 rounded overflow-hidden">
                        <table className="w-full text-[11px]">
                          <thead className="bg-gray-50 text-gray-500">
                            <tr>
                              <th className="text-left px-2 py-1.5 font-medium">Facility</th>
                              <th className="text-left px-2 py-1.5 font-medium">Type</th>
                              <th className="text-right px-2 py-1.5 font-medium">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drawer.items.slice(0, 100).map((it, i) => (
                              <tr key={it.id ?? i} className={i % 2 === 0 ? "" : "bg-gray-50/40"}>
                                <td className="px-2 py-1.5 truncate max-w-[200px]" title={it.facilityName ?? it.facilityId}>
                                  {it.facilityName ?? (it.facilityId ?? "").slice(0, 12) + "…"}
                                </td>
                                <td className="px-2 py-1.5 text-gray-500">{it.facilityType}</td>
                                <td className="px-2 py-1.5 text-right">{it.quantity ?? it.recsGenerated ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {drawer.items.length > 100 && (
                          <div className="px-2 py-1.5 text-[10px] text-gray-400 border-t border-gray-100">
                            Showing first 100 of {drawer.items.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
