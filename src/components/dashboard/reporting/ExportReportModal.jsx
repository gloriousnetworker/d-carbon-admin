import React, { useState } from "react";
import {
  selectClass,
  buttonPrimary,
  labelClass,
  inputClass,
} from "./styles";

const EXPORT_FORMATS = [
  { label: "Select format", value: "" },
  { label: "CSV", value: "csv" },
  { label: "Excel", value: "xlsx" },
  { label: "PDF", value: "pdf" },
];

export default function ExportReportModal({
  onClose,
  onExport,
  initialFilters = {},
  yearFilter,
  monthFilter,
  tableData = [] // Add tableData prop to get current data
}) {
  const [format, setFormat] = useState("");
  const [email, setEmail] = useState("");
  const [includeFilters, setIncludeFilters] = useState(true);
  const [loading, setLoading] = useState(false);

  const generateCSV = (data) => {
    // CSV header
    const headers = ["S/N", "Name", "Email", "Customer Type", "Date", "Status"];
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    data.forEach((row, index) => {
      const rowData = [
        index + 1,
        row.name || "-",
        row.inviteeEmail || "-",
        row.customerType || "-",
        new Date(row.createdAt).toLocaleDateString(),
        row.status
      ];
      
      // Escape any commas in the data
      const escapedRowData = rowData.map(field => {
        if (typeof field === 'string' && field.includes(',')) {
          return `"${field}"`;
        }
        return field;
      });
      
      csvContent += escapedRowData.join(",") + "\n";
    });
    
    return csvContent;
  };

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!format) {
      alert("Please select an export format");
      return;
    }

    setLoading(true);
    try {
      const exportParams = {
        format,
        email,
        includeFilters,
        filters: includeFilters ? {
          ...initialFilters,
          year: yearFilter,
          month: monthFilter
        } : null
      };

      // Handle direct download for CSV format
      if (format === "csv") {
        const csvContent = generateCSV(tableData);
        const dateStr = new Date().toISOString().split('T')[0];
        downloadFile(csvContent, `customer-report-${dateStr}.csv`, "text/csv");
        
        // If email is provided, still send to the backend
        if (email) {
          await onExport(exportParams);
        }
      } else {
        // For other formats, use the existing export function
        await onExport(exportParams);
      }
      
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-[#039994]">Export Report</h2>
       
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Export Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={selectClass}
            >
              {EXPORT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>
              Email (optional)
              <span className="text-gray-500 text-xs ml-1">
                - We'll send the report to this email
              </span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="your@email.com"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeFilters"
              checked={includeFilters}
              onChange={(e) => setIncludeFilters(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="includeFilters" className={labelClass}>
              Include current filters in export
            </label>
          </div>
          
          {format === "csv" && (
            <div className="bg-green-50 p-3 rounded-md border border-green-200">
              <p className="text-sm text-green-700">
                <strong>CSV format</strong> will be downloaded directly to your device.
                {email && " A copy will also be sent to your email."}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className={`${buttonPrimary} px-4 py-2`}
            disabled={loading}
          >
            {loading ? "Exporting..." : "Export"}
          </button>
        </div>
      </div>
    </div>
  );
}