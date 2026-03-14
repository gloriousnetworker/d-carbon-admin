import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export data to Excel (.xlsx) format.
 * @param {Object[]} data - Array of row objects
 * @param {Object[]} columns - Column definitions: { header, key, width? }
 * @param {string} filename - Output filename (without extension)
 * @param {string} [sheetName="Sheet1"] - Worksheet name
 */
export function exportToExcel(data, columns, filename, sheetName = "Sheet1") {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) => columns.map((c) => row[c.key] ?? ""));

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Set column widths
  ws["!cols"] = columns.map((c) => ({ wch: c.width || 18 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

/**
 * Export data to CSV format.
 * @param {Object[]} data - Array of row objects
 * @param {Object[]} columns - Column definitions: { header, key }
 * @param {string} filename - Output filename (without extension)
 */
export function exportToCSV(data, columns, filename) {
  const headers = columns.map((c) => c.header);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key] ?? "";
      // Escape values containing commas or quotes
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

/** Column definitions for customer export */
export const CUSTOMER_COLUMNS = [
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phoneNumber", width: 16 },
  { header: "User Type", key: "userType", width: 14 },
  { header: "Status", key: "status", width: 12 },
  { header: "Utility Provider", key: "utility", width: 22 },
  { header: "Finance Company", key: "financeCompany", width: 20 },
  { header: "Address", key: "address", width: 30 },
  { header: "Facility Status", key: "facilityStatus", width: 16 },
  { header: "Date Registered", key: "dateRegistered", width: 16 },
];

/** Column definitions for partner export */
export const PARTNER_COLUMNS = [
  { header: "Name", key: "name", width: 24 },
  { header: "Email", key: "email", width: 28 },
  { header: "Phone", key: "phoneNumber", width: 16 },
  { header: "Partner Type", key: "partnerType", width: 16 },
  { header: "Status", key: "status", width: 12 },
  { header: "Address", key: "address", width: 30 },
  { header: "Date Registered", key: "dateRegistered", width: 16 },
];
