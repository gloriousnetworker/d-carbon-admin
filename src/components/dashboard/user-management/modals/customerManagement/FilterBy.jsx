"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function FilterByModal({ isOpen, onClose, onApply, currentFilters }) {
  const [filters, setFilters] = useState({
    customerType: "",
    status: "",
    utilityProvider: "",
    documentStatus: ""
  });
  const [utilityProviders, setUtilityProviders] = useState([]);
  const [loadingUtilities, setLoadingUtilities] = useState(false);

  // Update local filters when currentFilters prop changes
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

  // Fetch utility providers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUtilityProviders();
    }
  }, [isOpen]);

  const fetchUtilityProviders = async () => {
    try {
      setLoadingUtilities(true);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("Authentication token not found");
        setLoadingUtilities(false);
        return;
      }

      const response = await fetch(
        "https://services.dcarbon.solutions/api/auth/utility-providers",
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === "success" && data.data) {
        setUtilityProviders(data.data);
      }
      setLoadingUtilities(false);
    } catch (err) {
      console.error("Error fetching utility providers:", err);
      setLoadingUtilities(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Applying filters:", filters); // Debug log
    // Call the onApply function passed from parent component
    onApply(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      customerType: "",
      status: "",
      utilityProvider: "",
      documentStatus: ""
    };
    console.log("Resetting filters"); // Debug log
    setFilters(emptyFilters);
    // Apply empty filters immediately
    onApply(emptyFilters);
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4 text-teal-500">Filter Customers</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Type</label>
              <select 
                name="customerType" 
                value={filters.customerType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Types</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="PARTNER">Partner</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                name="status" 
                value={filters.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Registered">Registered</option>
                <option value="Terminated">Terminated</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Utility Provider</label>
              <select 
                name="utilityProvider" 
                value={filters.utilityProvider}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loadingUtilities}
              >
                <option value="">
                  {loadingUtilities ? "Loading..." : "All Providers"}
                </option>
                {utilityProviders.map((provider) => (
                  <option key={provider.id} value={provider.name}>
                    {provider.name}
                  </option>
                ))}
                <option value="Not specified">Not specified</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Document Status</label>
              <select 
                name="documentStatus" 
                value={filters.documentStatus}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="issue">Has Issues</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={resetFilters}
            >
              Reset
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white"
            >
              Apply Filters
            </Button>
          </div>
        </form>
        
        <Button
          variant="ghost"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1"
          onClick={handleClose}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}