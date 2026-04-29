import CONFIG from "./config";

const BASE = `${CONFIG.API_BASE_URL}/api/rec-lifecycle`;

const authHeaders = (extra = {}) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return {
    Authorization: token ? `Bearer ${token}` : "",
    ...extra,
  };
};

const unwrap = async (res) => {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // empty/non-json response
  }
  if (!res.ok) {
    const message =
      body?.message ||
      body?.error ||
      `${res.status} ${res.statusText || "Request failed"}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body?.data ?? body;
};

export const recLifecycleApi = {
  // ---- Wallet ----
  getPlatformWallet: async () => {
    const res = await fetch(`${BASE}/wallet/platform`, {
      headers: authHeaders(),
    });
    return unwrap(res);
  },

  getFacilityWallet: async (facilityId) => {
    const res = await fetch(
      `${BASE}/wallet/facility/${encodeURIComponent(facilityId)}`,
      { headers: authHeaders() }
    );
    return unwrap(res);
  },

  getFacilityHalfWallet: async (facilityId, year) => {
    const res = await fetch(
      `${BASE}/wallet/facility/${encodeURIComponent(facilityId)}/half/${year}`,
      { headers: authHeaders() }
    );
    return unwrap(res);
  },

  // ---- Exports ----
  /**
   * POST /exports — generates the WREGIS upload file for a whole month and
   * transitions matching rows to SUBMITTED. The response body IS the file;
   * audit metadata comes back in custom headers.
   *
   * Returns: { blob, filename, headers: { id, fileUrl, checksum, totalRows, warnings } }
   */
  createExport: async ({ year, month, format = "CSV" }) => {
    const res = await fetch(`${BASE}/exports`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ year, month, format }),
    });
    if (!res.ok) {
      let body = null;
      try {
        body = await res.json();
      } catch {}
      const err = new Error(
        body?.message || `${res.status} ${res.statusText || "Export failed"}`
      );
      err.status = res.status;
      err.body = body;
      throw err;
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const filename =
      match?.[1] ||
      `wregis-generation-${year}-${String(month).padStart(2, "0")}.${
        format.toLowerCase() === "xlsx" ? "xlsx" : "csv"
      }`;
    return {
      blob,
      filename,
      headers: {
        id: res.headers.get("X-Rec-Export-Id"),
        fileUrl: res.headers.get("X-Rec-Export-File-Url"),
        checksum: res.headers.get("X-Rec-Export-Checksum"),
        totalRows: Number(res.headers.get("X-Rec-Export-Total-Rows") || 0),
        warnings: Number(res.headers.get("X-Rec-Export-Warnings") || 0),
      },
    };
  },

  listExports: async ({ year, month, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (year) params.set("year", String(year));
    if (month) params.set("month", String(month));
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(`${BASE}/exports?${params.toString()}`, {
      headers: authHeaders(),
    });
    return unwrap(res);
  },

  getExport: async (id) => {
    const res = await fetch(`${BASE}/exports/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
    });
    return unwrap(res);
  },

  // ---- Approvals ----
  uploadApproval: async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${BASE}/approvals`, {
      method: "POST",
      // Don't set Content-Type — browser sets the correct multipart boundary.
      headers: authHeaders(),
      body: fd,
    });
    return unwrap(res);
  },

  listApprovals: async ({ status, page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(`${BASE}/approvals?${params.toString()}`, {
      headers: authHeaders(),
    });
    return unwrap(res);
  },

  getApproval: async (id) => {
    const res = await fetch(`${BASE}/approvals/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
    });
    return unwrap(res);
  },

  listUnmatched: async (id, { page = 1, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    const res = await fetch(
      `${BASE}/approvals/${encodeURIComponent(id)}/unmatched?${params.toString()}`,
      { headers: authHeaders() }
    );
    return unwrap(res);
  },
};

/**
 * Triggers a browser download from a Blob without leaving the page.
 * Used for the export response which streams the file as the body.
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
