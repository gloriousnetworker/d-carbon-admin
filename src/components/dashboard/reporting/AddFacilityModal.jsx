import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import {
  labelClass,
  selectClass,
  inputClass,
  buttonPrimary,
  pageTitle,
} from "./styles";
import Loader from "@/components/loader/Loader.jsx";

export default function AddFacilityModal({ onClose, onFacilityAdded }) {
  // Form states - keeping only the requested fields
  const [formData, setFormData] = useState({
    facilityName: "",
    address: "",
    utilityProvider: "",
    meterId: "",
    commercialRole: "",
    entityType: "company", // Default to company
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const authToken = localStorage.getItem("authToken");

      if (!userId || !authToken) {
        toast.error("User authentication required");
        return;
      }

      // Prepare the request body - only including the specified fields
      const requestBody = {
        facilityName: formData.facilityName,
        address: formData.address,
        utilityProvider: formData.utilityProvider,
        meterId: formData.meterId,
        commercialRole: formData.commercialRole,
        entityType: formData.entityType,
      };

      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/create-new-facility/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create facility");
      }

      const data = await response.json();
      toast.success("Facility added successfully");
      onFacilityAdded(data.data); // Pass the created facility data to parent
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create facility");
      console.error("Error creating facility:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-lg rounded-md shadow-lg p-6 relative">
        {/* Centered Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
            <Loader />
          </div>
        )}
        
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX size={24} />
        </button>

        {/* Heading */}
        <h2 className={`${pageTitle} text-left mb-6`}>
          Add Commercial Facility
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Facility Name */}
          <div className="mb-4">
            <label className={labelClass}>
              Facility Name <span className="text-red-500">*</span>
            </label>
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
          <div className="mb-4">
            <label className={labelClass}>
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={inputClass}
              placeholder="Street, City, County, State"
              required
            />
          </div>

          {/* Utility Provider */}
          <div className="mb-4">
            <label className={labelClass}>
              Utility Provider <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="utilityProvider"
              value={formData.utilityProvider}
              onChange={handleChange}
              className={inputClass}
              placeholder="Utility company name"
              required
            />
          </div>

          {/* Meter ID */}
          <div className="mb-4">
            <label className={labelClass}>
              Meter ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="meterId"
              value={formData.meterId}
              onChange={handleChange}
              className={inputClass}
              placeholder="Meter identification number"
              required
            />
          </div>

          {/* Commercial Role */}
          <div className="mb-4">
            <label className={labelClass}>
              Commercial Role <span className="text-red-500">*</span>
            </label>
            <select
              name="commercialRole"
              value={formData.commercialRole}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="">Choose role</option>
              <option value="owner">Owner</option>
              <option value="operator">Operator</option>
              <option value="both">Both</option>
            </select>
          </div>

          {/* Entity Type */}
          <div className="mb-4">
            <label className={labelClass}>
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="entityType"
              value={formData.entityType}
              onChange={handleChange}
              className={selectClass}
              required
            >
              <option value="company">Company</option>
              <option value="individual">Individual</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`${buttonPrimary} mt-6 w-full`}
            disabled={loading}
          >
            Add Facility
          </button>
        </form>
      </div>
    </div>
  );
}