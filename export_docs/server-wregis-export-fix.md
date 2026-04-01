**Project:** dcarbon-server
**Branch:** `phillip-fix3`
**Priority:** MEDIUM — WREGIS XLSX export has no headers when empty

## Problem

`GET /api/rec-generation/export` generates an XLSX via `XLSX.utils.json_to_sheet(chunk)`. When no records match the filter criteria (default: `wregisStatus IN ["SUBMITTED", "APPROVED", "ADJUSTED"]`), the exported file has no headers — just an empty sheet.

Also, even when data exists, the QA reports no visible headers. This may be because `json_to_sheet` uses the raw object keys (e.g., `RecsGenerated`, `WregisStatus`) which are PascalCase and not human-readable.

## Fix

In `src/services/recGeneration.service.ts`, around line 309:

```typescript
// Before creating the worksheet, define explicit headers:
const headers = [
  "ID", "Facility Type", "Facility Name", "Address", "Zip Code",
  "Month", "Year", "RECs Generated", "Approved RECs Amount",
  "WREGIS Status", "WREGIS Submitted At", "WREGIS Approved At", "Admin Note"
];

// Map rows to use human-readable headers:
const readableRows = rows.map(r => ({
  "ID": r.ID,
  "Facility Type": r.FacilityType,
  "Facility Name": r.FacilityName,
  "Address": r.Address,
  "Zip Code": r.ZipCode,
  "Month": r.Month,
  "Year": r.Year,
  "RECs Generated": r.RecsGenerated,
  "Approved RECs Amount": r.ApprovedRecsAmount,
  "WREGIS Status": r.WregisStatus,
  "WREGIS Submitted At": r.WregisSubmittedAt,
  "WREGIS Approved At": r.WregisApprovedAt,
  "Admin Note": r.AdminNote,
}));

const workbook = XLSX.utils.book_new();
const totalChunks = Math.max(1, Math.ceil(readableRows.length / chunkSize));

for (let i = 0; i < totalChunks; i++) {
  const chunk = readableRows.slice(i * chunkSize, (i + 1) * chunkSize);
  // If chunk is empty, still create sheet with headers
  const worksheet = chunk.length > 0
    ? XLSX.utils.json_to_sheet(chunk)
    : XLSX.utils.aoa_to_sheet([headers]);
  XLSX.utils.book_append_sheet(workbook, worksheet, `Sheet${i + 1}`);
}
```

This ensures:
1. Headers are always present, even with no data
2. Column names are human-readable ("RECs Generated" not "RecsGenerated")

Also: consider removing the default `wregisStatus` filter so the export includes ALL records unless the admin explicitly filters. Currently line 274 restricts to `["SUBMITTED", "APPROVED", "ADJUSTED"]` which may exclude most records.

Build and push to `phillip-fix3`.
