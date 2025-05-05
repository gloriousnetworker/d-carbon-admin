import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function InviteCollaboratorModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    customerType: "RESIDENTIAL",
    role: "OWNER",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      customerType: "RESIDENTIAL",
      role: "OWNER",
      message: ""
    });
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

    const { name, email, phoneNumber, customerType, role, message } = formData;

    if (!email) {
      toast.error("Please enter an email address");
      setLoading(false);
      return;
    }

    const payload = {
      invitees: [
        {
          name,
          email,
          phoneNumber,
          customerType,
          role,
          ...(message && { message })
        }
      ]
    };

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success("Invitation sent successfully");
        resetForm();      // Reset form after successful invite
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 overflow-y-auto">
      <div className="relative bg-white p-5 rounded-lg w-full max-w-md text-sm max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
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

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader size="large" />
          </div>
        )}

        {/* Modal Content */}
        <div className="flex flex-col items-center">
          {/* Vector Image */}
          <div className="flex justify-center mb-2">
            <img 
              src="/vectors/EmailVector.png" 
              alt="Invite Collaborator"
              className="h-16 w-auto"
            />
          </div>

          <h2 className={`text-base font-semibold ${pageTitle} text-center`}>Invite a Customer</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 mt-3">
          {/* Name Input */}
          <div>
            <label className={`${labelClass} text-xs`}>Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              placeholder="Enter customer's name"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className={`${labelClass} text-xs`}>Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              placeholder="Enter customer's email"
              required
            />
          </div>

          {/* Phone Input */}
          <div>
            <label className={`${labelClass} text-xs`}>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`${inputClass} text-xs`}
              placeholder="Enter phone number"
            />
          </div>

          {/* Customer Type */}
          <div>
            <label className={`${labelClass} text-xs`}>Customer Type <span className="text-red-500">*</span></label>
            <select
              name="customerType"
              value={formData.customerType}
              onChange={handleChange}
              className={`${selectClass} text-xs`}
              required
            >
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
            </select>
          </div>

          {/* Role */}
          <div>
            <label className={`${labelClass} text-xs`}>Role <span className="text-red-500">*</span></label>
            {formData.customerType === "COMMERCIAL" ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`${selectClass} text-xs`}
                required
              >
                <option value="OWNER">Owner</option>
                <option value="OPERATOR">Operator</option>
                <option value="BOTH">Both</option>
              </select>
            ) : (
              <input
                type="text"
                value="Owner"
                disabled
                className={`${inputClass} bg-gray-100 text-xs cursor-not-allowed`}  
              />
            )}
          </div>

          {/* Message */}
          <div>
            <label className={`${labelClass} text-xs`}>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`${inputClass} text-xs h-16 resize-none`}
              placeholder="Add a custom message (optional)"
            />
          </div>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-1 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} flex items-center justify-center py-1 text-xs`}
              disabled={loading}
            >
              Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
