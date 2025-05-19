"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FilterByModal({ isOpen, onClose, onApplyFilters, currentFilters }) {
  // Initialize state with current filters or defaults
  const [filters, setFilters] = useState({
    partnerType: "",
    startDate: "",
    endDate: "",
    status: ""
  });

  // Update local state when currentFilters prop changes
  useEffect(() => {
    if (currentFilters) {
      setFilters({
        partnerType: currentFilters.partnerType || "",
        startDate: currentFilters.startDate || "",
        endDate: currentFilters.endDate || "",
        status: currentFilters.status || ""
      });
    }
  }, [currentFilters, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      partnerType: "",
      startDate: "",
      endDate: "",
      status: ""
    };
    setFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter By</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
       
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Partner Type</label>
            <select 
              className="w-full p-2 border rounded"
              name="partnerType"
              value={filters.partnerType}
              onChange={handleInputChange}
            >
              <option value="">All</option>
              <option value="sales_agent">Sales Agent</option>
              <option value="finance_company">Finance Company</option>
              <option value="installer">Installer</option>
            </select>
          </div>
         
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
              />
              <input 
                type="date" 
                className="w-full p-2 border rounded"
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
         
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              className="w-full p-2 border rounded"
              name="status"
              value={filters.status}
              onChange={handleInputChange}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
       
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-teal-500 hover:bg-teal-600"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}