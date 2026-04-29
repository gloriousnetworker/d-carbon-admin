"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiUploadCloud, FiRefreshCw, FiFile, FiX } from "react-icons/fi";
import { recLifecycleApi } from "@/lib/recLifecycleApi";
import ApprovalUnmatchedDrawer from "./ApprovalUnmatchedDrawer";

const POLL_MS = 3000;

const StatusPill = ({ status }) => {
  const map = {
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${map[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status}
    </span>
  );
};

export default function ApprovalsTab({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // The currently-tracked upload — drives the polling banner that sits above
  // the history table while the queue worker is still running.
  const [active, setActive] = useState(null);
  const pollTimerRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyMeta, setHistoryMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  const [unmatchedFor, setUnmatchedFor] = useState(null);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await recLifecycleApi.listApprovals({ page: 1, limit: 50 });
      setHistory(data?.data ?? []);
      setHistoryMeta({
        total: data?.total ?? 0,
        page: data?.page ?? 1,
        totalPages: data?.totalPages ?? 1,
      });
    } catch (err) {
      toast.error(`Approval history: ${err.message}`, { position: "top-center" });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Cleanup any in-flight poll on unmount.
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const startPolling = useCallback((approvalId) => {
    stopPolling();
    const tick = async () => {
      try {
        const data = await recLifecycleApi.getApproval(approvalId);
        setActive(data);
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          stopPolling();
          fetchHistory();
          onSuccess?.();
          if (data.status === "COMPLETED") {
            toast.success(
              `Approval applied — ${data.matchedCount} matched / ${data.unmatchedCount} unmatched`,
              { position: "top-center", duration: 6000 }
            );
          } else {
            toast.error(`Approval FAILED: ${data.errorMsg || "see history"}`, {
              position: "top-center",
              duration: 8000,
            });
          }
          return;
        }
        pollTimerRef.current = setTimeout(tick, POLL_MS);
      } catch (err) {
        toast.error(`Polling: ${err.message}`, { position: "top-center" });
        // Back off on errors but don't permanently stop.
        pollTimerRef.current = setTimeout(tick, POLL_MS * 2);
      }
    };
    pollTimerRef.current = setTimeout(tick, POLL_MS);
  }, [fetchHistory, onSuccess]);

  const handleFile = (incoming) => {
    if (!incoming) return;
    if (incoming.size === 0) {
      toast.error("The file is empty", { position: "top-center" });
      return;
    }
    const MAX = 25 * 1024 * 1024;
    if (incoming.size > MAX) {
      toast.error("File exceeds 25 MB — split into smaller uploads", { position: "top-center" });
      return;
    }
    setFile(incoming);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onUpload = async () => {
    if (!file) {
      toast.error("Please attach an approval file", { position: "top-center" });
      return;
    }
    setUploading(true);
    try {
      const result = await recLifecycleApi.uploadApproval(file);
      const approval = result?.approval ?? result;
      const dedup = result?.deduplicated;
      if (dedup) {
        toast(
          "This file was already uploaded — showing the existing approval row.",
          { position: "top-center", icon: "ℹ️", duration: 5000 }
        );
      } else {
        toast.success("File accepted; processing asynchronously…", {
          position: "top-center",
          duration: 4000,
        });
      }
      setActive(approval);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Already-completed dedup hits skip the poll loop entirely.
      if (approval?.status === "PENDING" || approval?.status === "PROCESSING") {
        startPolling(approval.id);
      } else {
        fetchHistory();
        onSuccess?.();
      }
    } catch (err) {
      toast.error(err.message, { position: "top-center", duration: 6000 });
    } finally {
      setUploading(false);
    }
  };

  const dismissActive = () => {
    setActive(null);
    stopPolling();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-[#1E1E1E] mb-1 font-sfpro">
          Upload WREGIS ActiveCertificates response
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          The backend parses the file, matches each row to a SUBMITTED facility-vintage by GU ID + month, and credits approved RECs to wallets.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? "border-[#039994] bg-[#03999408]" : "border-gray-300 bg-gray-50"
          }`}
        >
          <FiUploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-sm">
              <FiFile className="w-4 h-4 text-[#039994]" />
              <span className="font-medium text-gray-700">{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="ml-2 text-gray-400 hover:text-gray-600"
                title="Clear"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Drag &amp; drop the ActiveCertificates file, or{" "}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[#039994] hover:underline"
              >
                browse
              </button>
              <span className="block text-[11px] text-gray-400 mt-1">
                CSV or XLSX, max 25 MB. The backend handles parsing and dedup.
              </span>
            </p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="hidden"
          />
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={onUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-[#039994] text-white text-sm rounded-md hover:bg-[#028884] disabled:opacity-50 flex items-center gap-2"
          >
            <FiUploadCloud className="w-4 h-4" />
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>

      {active && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                {active.fileName || "Approval upload"}
                <StatusPill status={active.status} />
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {active.id} · uploaded {active.createdAt && new Date(active.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={dismissActive}
              className="p-1 rounded hover:bg-gray-100"
              title="Dismiss"
            >
              <FiX className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {(active.status === "PENDING" || active.status === "PROCESSING") && (
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded p-2 flex items-center gap-2">
              <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              Processing on the queue — polling every {POLL_MS / 1000}s. This card updates automatically.
            </div>
          )}

          {active.status === "COMPLETED" && (
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-[10px] text-gray-500">Parsed rows</div>
                <div className="font-semibold text-gray-900">{active.parsedRowCount ?? 0}</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded p-2">
                <div className="text-[10px] text-green-700">Matched</div>
                <div className="font-semibold text-green-800">{active.matchedCount ?? 0}</div>
              </div>
              <div
                className={`rounded p-2 ${
                  (active.unmatchedCount ?? 0) > 0
                    ? "bg-amber-50 border border-amber-100"
                    : "bg-gray-50"
                }`}
              >
                <div className="text-[10px] text-amber-700">Unmatched</div>
                <div className="font-semibold text-amber-800 flex items-center gap-2">
                  {active.unmatchedCount ?? 0}
                  {(active.unmatchedCount ?? 0) > 0 && (
                    <button
                      onClick={() => setUnmatchedFor(active)}
                      className="text-[10px] underline text-amber-700 hover:text-amber-900 font-normal"
                    >
                      review
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {active.status === "FAILED" && active.errorMsg && (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded p-2">
              {active.errorMsg}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#1E1E1E] font-sfpro">Upload history</h3>
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
          <div className="h-24 flex items-center justify-center text-sm text-gray-400">No approvals yet</div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-gray-100">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 text-[11px]">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">File</th>
                  <th className="text-left px-2 py-2 font-medium">Status</th>
                  <th className="text-right px-2 py-2 font-medium">Parsed</th>
                  <th className="text-right px-2 py-2 font-medium">Matched</th>
                  <th className="text-right px-2 py-2 font-medium">Unmatched</th>
                  <th className="text-left px-2 py-2 font-medium">Created</th>
                  <th className="text-right px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-t border-gray-100 ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}
                  >
                    <td className="px-3 py-2 text-gray-700 max-w-[240px] truncate" title={row.fileName}>
                      {row.fileName || "—"}
                    </td>
                    <td className="px-2 py-2"><StatusPill status={row.status} /></td>
                    <td className="px-2 py-2 text-right">{row.parsedRowCount ?? 0}</td>
                    <td className="px-2 py-2 text-right text-green-700">{row.matchedCount ?? 0}</td>
                    <td className="px-2 py-2 text-right text-amber-700">{row.unmatchedCount ?? 0}</td>
                    <td className="px-2 py-2 text-gray-500 whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {(row.unmatchedCount ?? 0) > 0 && (
                        <button
                          onClick={() => setUnmatchedFor(row)}
                          className="text-[#039994] hover:underline"
                        >
                          unmatched ({row.unmatchedCount})
                        </button>
                      )}
                      {row.fileUrl && (
                        <a
                          href={row.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 hover:underline"
                        >
                          file
                        </a>
                      )}
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

      {unmatchedFor && (
        <ApprovalUnmatchedDrawer
          approval={unmatchedFor}
          onClose={() => setUnmatchedFor(null)}
        />
      )}
    </div>
  );
}
