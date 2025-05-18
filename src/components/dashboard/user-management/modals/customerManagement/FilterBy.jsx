"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

// This is a placeholder for the FilterBy modal component
// You'll replace this with your actual FilterBy component code

export default function FilterByModal({ isOpen, onClose }) {
  const [filters, setFilters] = useState({
    customerType: "",
    status: "",
    utilityProvider: "",
    registrationDate: "",
    documentStatus: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Apply filters logic here
    console.log("Applying filters:", filters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      customerType: "",
      status: "",
      utilityProvider: "",
      registrationDate: "",
      documentStatus: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-teal-500">Filter Customers</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Type</label>
              <select 
                name="customerType" 
                value={filters.customerType}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                name="status" 
                value={filters.status}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Invited">Invited</option>
                <option value="Registered">Registered</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Utility Provider</label>
              <select 
                name="utilityProvider" 
                value={filters.utilityProvider}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Providers</option>
                <option value="Water Co.">Water Co.</option>
                <option value="Power Inc.">Power Inc.</option>
                <option value="Gas & Co.">Gas & Co.</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Document Status</label>
              <select 
                name="documentStatus" 
                value={filters.documentStatus}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
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
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </Button>
      </div>
    </div>
  );
}