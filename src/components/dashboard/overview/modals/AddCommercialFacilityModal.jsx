import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, buttonPrimary } from "../styles";

export default function AddCommercialFacilityModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    facilityName: "",
    address: "",
    utilityProvider: "",
    meterId: "",
    commercialRole: "both",
    entityType: "individual"
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/facility/create-new-facility/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Facility created successfully");
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create facility");
      }
    } catch (error) {
      console.error("Error creating facility:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to create facility"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative bg-white p-6 rounded-lg w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className={pageTitle}>Add Commercial Facility</h2>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Facility Name */}
          <div>
            <label className={labelClass}>Facility Name</label>
            <input
              type="text"
              name="facilityName"
              value={formData.facilityName}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter facility name"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className={labelClass}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter facility address"
              required
            />
          </div>

          {/* Utility Provider */}
          <div>
            <label className={labelClass}>Utility Provider</label>
            <input
              type="text"
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter utility provider"
            />
          </div>

          {/* Meter ID */}
          <div>
            <label className={labelClass}>Meter ID</label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter meter ID"
            />
          </div>

          {/* Commercial Role */}
          <div>
            <label className={labelClass}>Commercial Role</label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Entity Type */}
          <div>
            <label className={labelClass}>Entity Type</label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={inputClass}
              required
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 font-sfpro"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary}`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Add Facility"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}