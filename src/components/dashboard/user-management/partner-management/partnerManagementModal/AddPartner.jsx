"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, Loader } from "lucide-react";
import {
  labelClass,
  inputClass,
  selectClass,
  buttonPrimary,
  spinner,
  spinnerOverlay
} from "../../styles";

export default function AddPartnerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    partnerType: "",
    address: ""
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const partnerTypes = [
    { value: "installer", label: "Installer" },
    { value: "sales_agent", label: "Sales Agent" },
    { value: "finance_company", label: "Finance Company" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePartnerTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      partnerType: type.value
    }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.partnerType || !formData.address) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      // Get auth token from local storage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.post(
        'https://services.dcarbon.solutions/api/user/create-installer-partner-by-user',
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.status === "success") {
        // Reset form
        setFormData({
          name: "",
          email: "",
          phoneNumber: "",
          partnerType: "",
          address: ""
        });
        
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.data.message || 'Failed to create partner');
      }
    } catch (err) {
      console.error('Error creating partner:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create partner');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        partnerType: "",
        address: ""
      });
      setError(null);
      onClose();
    }
  };

  const getSelectedPartnerTypeLabel = () => {
    const selected = partnerTypes.find(type => type.value === formData.partnerType);
    return selected ? selected.label : "Choose Partner Type";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className={spinnerOverlay}>
          <div className={spinner}></div>
        </div>
      )}

      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <h2 className="text-base font-semibold text-teal-500">New Partner</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Scrollable Form Container */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Partner Type Dropdown */}
              <div className="space-y-1">
                <label className={labelClass}>
                  Partner Type
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={loading}
                    className={`${selectClass} flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className={formData.partnerType ? "text-gray-900" : "text-gray-500"}>
                      {getSelectedPartnerTypeLabel()}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {partnerTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handlePartnerTypeSelect(type)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors font-sfpro"
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Name */}
              <div className="space-y-1">
                <label className={labelClass}>
                  Partner Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter partner name"
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className={labelClass}>
                  Phone number
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="e.g. +234-phone-number"
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className={labelClass}>
                  Email address
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="e.g. name@domain.com"
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className={labelClass}>
                  Address
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading}
                  placeholder="Enter address"
                  rows={3}
                  className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed resize-none`}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-xs bg-red-50 p-2 rounded-md font-sfpro">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`${buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed text-sm`}
                >
                  {loading ? 'Creating...' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Dropdown Overlay */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
}