"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiX, FiChevronDown, FiChevronRight } from "react-icons/fi";
import { recLifecycleApi } from "@/lib/recLifecycleApi";

// Map of common server-side reasons → admin-friendly hint. The reason text
// from the server is shown verbatim above the hint so admins can grep their
// own logs against the same string.
const REASON_HINTS = [
  {
    match: /missing WREGIS GU ID/i,
    hint: "The WREGIS file row has no GU ID — likely a malformed export from WREGIS. Check the source file before re-uploading.",
  },
  {
    match: /missing or unparseable Vintage/i,
    hint: "Vintage column was blank or in an unexpected format. Ask WREGIS to re-issue the response file.",
  },
  {
    match: /missing Quantity/i,
    hint: "Quantity column was blank or non-numeric. Re-issue the response file with full data.",
  },
  {
    match: /No facility found with wregisId/i,
    hint: "The GU ID isn't on any facility in our DB. Set the facility's wregisId in User Management → facility details, then re-upload.",
  },
  {
    match: /No MonthlyFacilityRecs row for facility/i,
    hint: "Approval came back for a vintage we never generated. Check if meter ingest ran for that facility for this month.",
  },
  {
    match: /status PENDING_SUBMISSION; only SUBMITTED/i,
    hint: "We never sent this vintage to WREGIS. Run the export for that month first, then re-upload the approval.",
  },
  {
    match: /status APPROVED;/i,
    hint: "Already approved — this is most likely a duplicate file. Safe to ignore.",
  },
  {
    match: /Approved \d.* exceeds submitted/i,
    hint: "WREGIS returned more RECs than we submitted. Investigate — possibly a file mismatch or a wregisId collision.",
  },
  {
    match: /Lost race to concurrent approval/i,
    hint: "Another worker beat us to this row. Safe to ignore.",
  },
];

const reasonHintFor = (reason) => {
  if (!reason) return null;
  const m = REASON_HINTS.find((h) => h.match.test(reason));
  return m?.hint ?? null;
};

export default function ApprovalUnmatchedDrawer({ approval, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(() => new Set());

  const fetchItems = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await recLifecycleApi.listUnmatched(approval.id, { page: p, limit: 50 });
      setItems(data?.data ?? []);
      setMeta({
        total: data?.total ?? 0,
        page: data?.page ?? p,
        totalPages: data?.totalPages ?? 1,
      });
    } catch (err) {
      toast.error(`Unmatched: ${err.message}`, { position: "top-center" });
    } finally {
      setLoading(false);
    }
  }, [approval.id]);

  useEffect(() => {
    fetchItems(page);
  }, [fetchItems, page]);

  const toggle = (id) => {
    setExpanded((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-3xl bg-white h-full overflow-y-auto shadow-xl">
        <div className="flex items-start justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Unmatched rows — {approval.fileName || "approval"}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {meta.total} row{meta.total === 1 ? "" : "s"} from this upload could not be matched to a SUBMITTED facility-vintage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {loading && items.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-12">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-12">
              No unmatched rows for this upload.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((it) => {
                const isExpanded = expanded.has(it.id);
                const hint = reasonHintFor(it.unmatchedReason);
                return (
                  <div
                    key={it.id}
                    className="border border-gray-200 rounded-md overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(it.id)}
                      className="w-full text-left p-3 hover:bg-gray-50 flex items-start gap-3"
                    >
                      <div className="pt-0.5 text-gray-400">
                        {isExpanded ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-mono text-gray-700">{it.wregisGuId || "—"}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600">
                            {it.vintageYear}-{String(it.vintageMonth ?? "").padStart(2, "0")}
                          </span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-600">
                            qty {it.approvedQuantity ?? "—"}
                          </span>
                        </div>
                        <div className="text-xs text-rose-700 mt-1">
                          {it.unmatchedReason || "No reason recorded"}
                        </div>
                        {hint && (
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {hint}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 whitespace-nowrap">
                        row {it.rowIndex}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 p-3 text-[11px] space-y-2">
                        {it.serialRangeStart && (
                          <div>
                            <span className="text-gray-500">Serial range: </span>
                            <span className="font-mono text-gray-700">
                              {it.serialRangeStart} → {it.serialRangeEnd}
                            </span>
                          </div>
                        )}
                        {it.generationStartDate && (
                          <div>
                            <span className="text-gray-500">Generation window: </span>
                            <span className="text-gray-700">
                              {new Date(it.generationStartDate).toLocaleDateString()} → {new Date(it.generationEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {it.eligibility?.summary && (
                          <div>
                            <span className="text-gray-500">Eligibility: </span>
                            <span className="text-gray-700">{it.eligibility.summary}</span>
                          </div>
                        )}
                        <details>
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                            Raw row JSON
                          </summary>
                          <pre className="mt-2 p-2 bg-white border border-gray-200 rounded font-mono text-[10px] overflow-x-auto whitespace-pre-wrap break-words max-h-60 overflow-y-auto">
                            {JSON.stringify(it.rawJson ?? {}, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-gray-500">
                Page {meta.page} of {meta.totalPages} · {meta.total} row{meta.total === 1 ? "" : "s"}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.page <= 1 || loading}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages || loading}
                  className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
