import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  mainContainer,
  headingContainer,
  pageTitle,
  selectClass,
  buttonPrimary,
} from "./styles";

import AddFacilityModal from "./AddFacilityModal";
import FacilityCreatedModal from "./FacilityCreatedModal";
import FilterModal from "./FilterModal";
import ExportReportModal from "./ExportReportModal";

const MONTHS = [
  { label: "Month", value: "" },
  { label: "Jan", value: "1" },
  { label: "Feb", value: "2" },
  { label: "Mar", value: "3" },
  { label: "Apr", value: "4" },
  { label: "May", value: "5" },
  { label: "Jun", value: "6" },
  { label: "Jul", value: "7" },
  { label: "Aug", value: "8" },
  { label: "Sep", value: "9" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];

const YEARS = ["2023", "2024", "2025"];

export default function FacilityManagement() {
  // modals
  const [showAddFacilityModal, setShowAddFacilityModal] = useState(false);
  const [showFacilityCreatedModal, setShowFacilityCreatedModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // filters & pagination
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    customerType: "",
    time: "Oldest",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // data
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LIMIT = 10;
  const baseUrl = "https://services.dcarbon.solutions";

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        const userId =
          localStorage.getItem("userId") ||
          "8b14b23d-3082-4846-9216-2c2e9f1e96bf";

        const params = new URLSearchParams();
        if (filters.status) params.append("status", filters.status);
        if (filters.customerType)
          params.append("customerType", filters.customerType);

        // Year & month → startDate / endDate
        if (yearFilter && monthFilter) {
          const y = yearFilter;
          const m = monthFilter.padStart(2, "0");
          const lastDay = new Date(y, Number(monthFilter), 0).getDate();
          params.append("startDate", `${y}-${m}-01`);
          params.append("endDate", `${y}-${m}-${lastDay}`);
        } else if (yearFilter) {
          params.append("startDate", `${yearFilter}-01-01`);
          params.append("endDate", `${yearFilter}-12-31`);
        }

        params.append("page", currentPage);
        params.append("limit", LIMIT);

        const res = await axios.get(
          `${baseUrl}/api/user/get-users-referrals/${userId}?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let { referrals, metadata } = res.data.data;

        // client‑side sort
        referrals.sort((a, b) => {
          const da = new Date(a.createdAt),
            db = new Date(b.createdAt);
          return filters.time === "Newest" ? db - da : da - db;
        });

        setTableData(referrals);
        setTotalPages(metadata.totalPages);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [currentPage, filters, yearFilter, monthFilter]);

  const handleOpenFilterModal = () => setShowFilterModal(true);
  const handleApplyFilter = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  const handleOpenAddFacilityModal = () => setShowAddFacilityModal(true);
  const handleFacilityAdded = () => {
    setShowAddFacilityModal(false);
    setShowFacilityCreatedModal(true);
  };
  const handleCloseFacilityCreatedModal = () =>
    setShowFacilityCreatedModal(false);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleExportReport = async (exportParams) => {
    try {
      // For non-CSV formats or when email is provided
      if (exportParams.format !== "csv" || exportParams.email) {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId") || "8b14b23d-3082-4846-9216-2c2e9f1e96bf";
        
        // Prepare the request body
        const requestBody = {
          format: exportParams.format,
          email: exportParams.email,
          filters: exportParams.includeFilters ? {
            ...filters,
            year: yearFilter,
            month: monthFilter,
            page: currentPage,
            limit: LIMIT
          } : null
        };

        console.log("Exporting with params:", requestBody);
        
        // If we have an endpoint to call
        if (exportParams.format !== "csv") {
          try {
            const response = await axios.post(
              `${baseUrl}/api/reports/export-customer-report`,
              requestBody,
              { 
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' // Important for file downloads
              }
            );
            
            // Handle the file download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `customer-report.${exportParams.format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
          } catch (error) {
            console.error("Backend export error:", error);
            // Fall back to only showing an alert for the email case
            if (exportParams.email) {
              alert(`Report will be sent to ${exportParams.email} when ready`);
            } else {
              throw error; // Re-throw to show the error alert
            }
          }
        } else if (exportParams.email) {
          // For CSV with email, just show a message (since CSV is handled client-side)
          alert(`CSV report will also be sent to ${exportParams.email} when ready`);
        }
      }
      
      // CSV is already handled in the ExportReportModal component through direct download
      
      return true;
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  const handleClearFilters = () => {
    setYearFilter("");
    setMonthFilter("");
    setFilters({
      status: "",
      customerType: "",
      time: "Oldest"
    });
    setCurrentPage(1);
  };

  const renderStatusTag = (status) => {
    let bg = "#00B4AE";
    if (status === "PENDING") bg = "#FFB200";
    if (status === "ACCEPTED") bg = "#000000";
    if (status === "TERMINATED") bg = "#FF0000";
    return (
      <span
        className="inline-block px-3 py-1 rounded-full text-white text-sm"
        style={{ backgroundColor: bg }}
      >
        {status}
      </span>
    );
  };

  return (
    <div className={`${mainContainer} text-sm`}>
      {/* Top controls */}
      <div className="flex items-center justify-between w-full max-w-6xl mb-4">
        <div className="flex items-center space-x-2">
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            <option value="">Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={selectClass}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          {(yearFilter || monthFilter || filters.status || filters.customerType) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleOpenFilterModal}
            className="border border-black px-4 py-1 rounded hover:bg-gray-100 text-sm"
          >
            Filter
          </button>
          <button 
            onClick={() => setShowExportModal(true)}
            className={`${buttonPrimary} text-sm`}
          >
            Export Report
          </button>
        </div>
      </div>

      {/* Title */}
      <div className={headingContainer}>
        <h1 className={pageTitle}>Customer Report</h1>
        {(filters.status || filters.customerType) && (
          <div className="text-sm text-gray-600 mt-1">
            {filters.status && <span>Status: {filters.status} </span>}
            {filters.customerType && <span>Type: {filters.customerType} </span>}
            {filters.time && <span>Sort: {filters.time} first </span>}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="w-full max-w-6xl overflow-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading…</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : tableData.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No records found with these filters</p>
        ) : (
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 px-2 text-left">S/N</th>
                <th className="py-2 px-2 text-left">Name</th>
                <th className="py-2 px-2 text-left">Email</th>
                <th className="py-2 px-2 text-left">Customer Type</th>
                <th className="py-2 px-2 text-left">Date</th>
                <th className="py-2 px-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((ref, idx) => (
                <tr
                  key={ref.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-2 px-2">
                    {(currentPage - 1) * LIMIT + idx + 1}
                  </td>
                  <td className="py-2 px-2">{ref.name || "—"}</td>
                  <td className="py-2 px-2">{ref.inviteeEmail}</td>
                  <td className="py-2 px-2">
                    {ref.customerType || "—"}
                  </td>
                  <td className="py-2 px-2">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-2">{renderStatusTag(ref.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center space-x-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="text-[#00B4AE] disabled:opacity-50 text-sm"
        >
          &lt; Previous
        </button>
        <span>{currentPage} of {totalPages}</span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="text-[#00B4AE] disabled:opacity-50 text-sm"
        >
          Next &gt;
        </button>
      </div>

      {/* Modals */}
      {showAddFacilityModal && (
        <AddFacilityModal
          onClose={() => setShowAddFacilityModal(false)}
          onFacilityAdded={handleFacilityAdded}
        />
      )}
      {showFacilityCreatedModal && (
        <FacilityCreatedModal
          onClose={handleCloseFacilityCreatedModal}
        />
      )}
      {showFilterModal && (
        <FilterModal
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleApplyFilter}
          initialFilters={filters}
        />
      )}
      {showExportModal && (
        <ExportReportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExportReport}
          initialFilters={filters}
          yearFilter={yearFilter}
          monthFilter={monthFilter}
          tableData={tableData} // Pass the table data to the export modal
        />
      )}
    </div>
  );
}