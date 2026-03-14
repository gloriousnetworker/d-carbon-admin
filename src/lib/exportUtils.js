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

/** Column definitions for WREGIS regulator CSV export */
export const WREGIS_COLUMNS = [
  { header: "Generator ID", key: "generatorId", width: 16 },
  { header: "Reporting Unit ID", key: "reportingUnitId", width: 18 },
  { header: "Vintage", key: "vintage", width: 10 },
  { header: "Start Date", key: "startDate", width: 14 },
  { header: "End Date", key: "endDate", width: 14 },
  { header: "Total MWh", key: "totalMWh", width: 12 },
];

/**
 * Transform raw meter records into WREGIS-formatted rows.
 * Groups by facility and aggregates kWh into MWh.
 * @param {Object[]} records - Raw meter records from /api/admin/meter-records/*
 * @param {"commercial"|"residential"} type - Record type
 * @returns {Object[]} WREGIS-formatted rows
 */
export function transformToWregisFormat(records, type) {
  // Group records by facility
  const facilityMap = {}
  for (const r of records) {
    const facility = type === "commercial" ? r.commercialFacility : r.residentialFacility
    const facilityId = facility?.id || r.facilityId || "unknown"
    const wregisId = facility?.wregisId || facility?.generatorId || facilityId.slice(0, 8)

    if (!facilityMap[facilityId]) {
      facilityMap[facilityId] = {
        wregisId,
        totalKWh: 0,
        minDate: null,
        maxDate: null,
      }
    }
    const entry = facilityMap[facilityId]
    const kwh = Number(r.intervalKWh || r.netKWh || r.fwdKWh || 0)
    entry.totalKWh += kwh

    const start = r.intervalStart ? new Date(r.intervalStart) : null
    const end = r.intervalEnd ? new Date(r.intervalEnd) : null
    if (start && (!entry.minDate || start < entry.minDate)) entry.minDate = start
    if (end && (!entry.maxDate || end > entry.maxDate)) entry.maxDate = end
  }

  const pad = (n) => String(n).padStart(2, "0")
  const formatMMDDYYYY = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`

  return Object.values(facilityMap).map((f) => {
    const vintage = f.minDate ? `${pad(f.minDate.getMonth() + 1)}/${f.minDate.getFullYear()}` : "-"
    return {
      generatorId: f.wregisId,
      reportingUnitId: f.wregisId,
      vintage,
      startDate: f.minDate ? formatMMDDYYYY(f.minDate) : "-",
      endDate: f.maxDate ? formatMMDDYYYY(f.maxDate) : "-",
      totalMWh: (f.totalKWh / 1000).toFixed(4),
    }
  })
}

/** Column definitions for partner commission statement export */
export const COMMISSION_STATEMENT_COLUMNS = [
  { header: "Item Code", key: "itemCode", width: 18 },
  { header: "Description", key: "description", width: 36 },
  { header: "Facility", key: "facility", width: 24 },
  { header: "Rate", key: "rate", width: 14 },
  { header: "Quantity", key: "quantity", width: 12 },
  { header: "Amount", key: "amount", width: 14 },
  { header: "Period", key: "period", width: 14 },
];

/**
 * Generate a WREGIS Registration Package cover sheet Excel file.
 * @param {Object} facility - Facility object with address, meter, utility fields
 * @param {Object} user - User object with name, email, phone
 * @param {Object} [docs] - Documentation status object
 * @param {"commercial"|"residential"} type - Facility type
 */
export function exportWregisCoverSheet(facility, user, docs, type) {
  const ownerName = user?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "-"
  const rows = [
    { field: "Facility Owner Name", value: ownerName },
    { field: "Facility Name", value: facility?.facilityName || facility?.address || "-" },
    { field: "Unit Address 1", value: facility?.address || "-" },
    { field: "City", value: facility?.city || "-" },
    { field: "State", value: facility?.state || "-" },
    { field: "Zip Code", value: facility?.zipCode || "-" },
    { field: "Country", value: "United States" },
    { field: "Unit Revenue Meter ID", value: facility?.meterId || facility?.meterIds?.[0] || "-" },
    { field: "Interconnecting Utility", value: facility?.utilityProvider || "-" },
    { field: "Unit Nameplate Capacity (kW)", value: facility?.systemCapacity || facility?.systemSize || "-" },
    { field: "WREGIS Generator ID", value: facility?.wregisId || facility?.generatorId || "-" },
    { field: "Fuel Type", value: "Solar" },
    { field: "Facility Type", value: type === "commercial" ? "Commercial" : "Residential" },
    { field: "Contact Email", value: user?.email || "-" },
    { field: "Contact Phone", value: user?.phoneNumber || "-" },
    { field: "", value: "" },
    { field: "--- Document Checklist ---", value: "" },
    { field: "Proof of Address", value: docs?.proofOfAddressStatus || docs?.proofOfAddress || "Not uploaded" },
    { field: "Financial Agreement", value: docs?.financialAgreementStatus || docs?.financialAgreement || "Not uploaded" },
    { field: "Interconnection Agreement", value: docs?.interconnectionAgreementStatus || docs?.interconnectionAgreement || "Not uploaded" },
    { field: "Site Photo", value: docs?.sitePhotoStatus || docs?.sitePhoto || "Not uploaded" },
    { field: "Meter Photo", value: docs?.meterPhotoStatus || docs?.meterPhoto || "Not uploaded" },
  ]

  const columns = [
    { header: "Field", key: "field", width: 32 },
    { header: "Value", key: "value", width: 40 },
  ]

  const name = (facility?.facilityName || facility?.address || "facility").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30)
  exportToExcel(rows, columns, `WREGIS_Cover_Sheet_${name}`, "Cover Sheet")
}

/** Column definitions for Pre-Approval Worksheet */
export const PRE_APPROVAL_COLUMNS = [
  { header: "Group Number", key: "groupNumber", width: 14 },
  { header: "Group Name", key: "groupName", width: 20 },
  { header: "Fuel Type", key: "fuelType", width: 10 },
  { header: "Residential/Non-Residential", key: "resNonRes", width: 26 },
  { header: "Unit Name", key: "unitName", width: 24 },
  { header: "Unit Nameplate (MW)", key: "nameplateMW", width: 18 },
  { header: "Expansion Indicator", key: "expansion", width: 18 },
  { header: "COD", key: "cod", width: 14 },
  { header: "Unit Address 1", key: "address1", width: 30 },
  { header: "City", key: "city", width: 16 },
  { header: "State", key: "state", width: 8 },
  { header: "Zip", key: "zip", width: 10 },
  { header: "Country", key: "country", width: 10 },
  { header: "Unit Revenue Meter ID", key: "meterId", width: 22 },
  { header: "Interconnecting Utility", key: "utility", width: 24 },
];

/**
 * Export residential facilities as a Pre-Approval Worksheet.
 * @param {Object[]} facilities - Array of residential facility objects
 * @param {string} [groupName] - Optional DGG group name
 */
export function exportPreApprovalWorksheet(facilities, groupName) {
  const rows = facilities.map((f, idx) => ({
    groupNumber: f.groupNumber || f.distributedGenerationGroup?.groupNumber || "1",
    groupName: groupName || f.groupName || f.distributedGenerationGroup?.groupName || "DGG-1",
    fuelType: "Solar",
    resNonRes: "Residential",
    unitName: f.facilityName || f.address || `Unit ${idx + 1}`,
    nameplateMW: f.systemCapacity ? (Number(f.systemCapacity) / 1000).toFixed(4) : f.systemSize ? (Number(f.systemSize) / 1000).toFixed(4) : "-",
    expansion: "No",
    cod: f.commissionDate || f.operationalDate || "-",
    address1: f.address || "-",
    city: f.city || "-",
    state: f.state || "-",
    zip: f.zipCode || "-",
    country: "US",
    meterId: f.meterId || f.meterIds?.[0] || "-",
    utility: f.utilityProvider || "-",
  }))

  exportToExcel(rows, PRE_APPROVAL_COLUMNS, `Pre_Approval_Worksheet_${new Date().toISOString().slice(0, 10)}`, "Pre-Approval")
}
