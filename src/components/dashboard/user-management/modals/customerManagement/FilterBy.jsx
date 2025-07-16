"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as styles from "../../styles";

export default function FilterByModal({ isOpen, onClose, onApply, currentFilters, utilityProviders }) {
  const [filters, setFilters] = useState({
    customerType: "",
    status: "",
    utilityProvider: "",
    documentStatus: "",
    name: "",
    email: ""
  });

  useEffect(() => {
    if (currentFilters) setFilters(currentFilters);
  }, [currentFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      customerType: "",
      status: "",
      utilityProvider: "",
      documentStatus: "",
      name: "",
      email: ""
    };
    setFilters(emptyFilters);
    onApply(emptyFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-medium">Filter Customers</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs mb-1 block">Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleChange}
              className="w-full p-2 text-xs border rounded"
              placeholder="Search by name"
            />
          </div>

          <div>
            <label className="text-xs mb-1 block">Email</label>
            <input
              type="text"
              name="email"
              value={filters.email}
              onChange={handleChange}
              className="w-full p-2 text-xs border rounded"
              placeholder="Search by email"
            />
          </div>

          <div>
            <label className="text-xs mb-1 block">Customer Type</label>
            <select 
              name="customerType" 
              value={filters.customerType}
              onChange={handleChange}
              className="w-full p-2 text-xs border rounded"
            >
              <option value="">All Types</option>
              <option value="RESIDENTIAL">RESIDENTIAL</option>
              <option value="COMMERCIAL">COMMERCIAL</option>
              <option value="PARTNER">PARTNER</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs mb-1 block">Status</label>
            <select 
              name="status" 
              value={filters.status}
              onChange={handleChange}
              className="w-full p-2 text-xs border rounded"
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
            <label className="text-xs mb-1 block">Utility Provider</label>
            <select 
              name="utilityProvider" 
              value={filters.utilityProvider}
              onChange={handleChange}
              className="w-full p-2 text-xs border rounded"
            >
              <option value="">All Providers</option>
              {utilityProviders.map((provider) => (
                <option key={provider.id} value={provider.name}>
                  {provider.name}
                </option>
              ))}
              <option value="Not specified">Not specified</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs mb-1 block">Document Status</label>
            <select 
              name="documentStatus" 
              value={filters.documentStatus}
              onChange={handleChange}
              className="w-full p-2 text-xs border rounded"
            >
              <option value="">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="issue">Has Issues</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="text-xs h-8"
            >
              Clear
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button 
              className="text-xs h-8 bg-teal-500 hover:bg-teal-600"
              type="submit"
            >
              Apply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}