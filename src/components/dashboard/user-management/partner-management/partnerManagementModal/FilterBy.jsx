"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import * as styles from "../../styles";

export default function FilterByModal({ isOpen, onClose, onApplyFilters, currentFilters }) {
  const [filters, setFilters] = useState({
    partnerType: "",
    startDate: "",
    endDate: "",
    status: ""
  });

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`${styles.formWrapper} bg-white rounded-lg p-6 max-w-md w-full`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={styles.pageTitle}>Filter By</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
       
        <div className="space-y-4">
          <div>
            <label className={styles.labelClass}>Partner Type</label>
            <select 
              className={styles.selectClass}
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
            <label className={styles.labelClass}>Date Range</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className={styles.inputClass}
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
              />
              <input 
                type="date" 
                className={styles.inputClass}
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
         
          <div>
            <label className={styles.labelClass}>Status</label>
            <select 
              className={styles.selectClass}
              name="status"
              value={filters.status}
              onChange={handleInputChange}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="invited">Invited</option>
              <option value="registered">Registered</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
       
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="font-sfpro"
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-sfpro"
          >
            Cancel
          </Button>
          <Button 
            className={`${styles.buttonPrimary} font-sfpro`}
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}