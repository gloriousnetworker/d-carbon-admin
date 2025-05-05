import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import {
  labelClass,
  selectClass,
  buttonPrimary
} from "./styles";

export default function FilterModal({
  onClose,
  onApplyFilter,
  initialFilters = { status: "", customerType: "", time: "Oldest" },
}) {
  const [status, setStatus] = useState(initialFilters.status);
  const [customerType, setCustomerType] = useState(
    initialFilters.customerType
  );
  const [time, setTime] = useState(initialFilters.time);

  useEffect(() => {
    setStatus(initialFilters.status);
    setCustomerType(initialFilters.customerType);
    setTime(initialFilters.time);
  }, [initialFilters]);

  const handleClear = () => {
    setStatus("");
    setCustomerType("");
    setTime("Oldest");
  };

  const handleDone = () => {
    onApplyFilter({ status, customerType, time });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F04438] hover:text-red-600"
        >
          <FiX size={20} />
        </button>

        <h2 className="text-xl font-semibold text-[#039994] mb-4">
          Filter Records
        </h2>
        <hr className="mb-4 border-gray-200" />

        {/* By Status */}
        <div className="mb-4">
          <label className={labelClass}>By Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${selectClass} text-sm`}
          >
            <option value="">All</option>
            <option value="PENDING">PENDING</option>
            <option value="ACCEPTED">ACCEPTED</option>
            <option value="TERMINATED">TERMINATED</option>
          </select>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* By Customer Type */}
        <div className="mb-4">
          <label className={labelClass}>By Customer Type</label>
          <select
            value={customerType}
            onChange={(e) => setCustomerType(e.target.value)}
            className={`${selectClass} text-sm`}
          >
            <option value="">All</option>
            <option value="RESIDENTIAL">RESIDENTIAL</option>
            <option value="COMMERCIAL">COMMERCIAL</option>
            <option value="PARTNER">PARTNER</option>
          </select>
        </div>
        <hr className="mb-4 border-gray-200" />

        {/* By Time */}
        <div className="mb-4">
          <label className={labelClass}>By Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`${selectClass} text-sm`}
          >
            <option value="Oldest">Oldest First</option>
            <option value="Newest">Newest First</option>
          </select>
        </div>
        <hr className="mb-4 border-gray-200" />

        <div className="flex space-x-2">
          <button
            onClick={handleClear}
            className="flex-1 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Clear
          </button>
          <button
            onClick={handleDone}
            className={`${buttonPrimary} text-sm flex-1`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}