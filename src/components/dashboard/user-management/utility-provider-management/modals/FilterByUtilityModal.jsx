"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { labelClass, inputClass } from "../styles";

export default function FilterByUtilityModal({ isOpen, onClose, filterValues, onFilterChange, onApply, onClear }) {
  if (!isOpen) return null;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onApply();
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-medium mb-4">Filter Utility Providers</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Provider Name</label>
            <input 
              type="text" 
              name="name"
              value={filterValues.name}
              onChange={onFilterChange}
              className={inputClass} 
            />
          </div>
          
          <div>
            <label className={labelClass}>Utility ID</label>
            <input 
              type="text" 
              name="id"
              value={filterValues.id}
              onChange={onFilterChange}
              className={inputClass} 
            />
          </div>
          
          <div>
            <label className={labelClass}>Website</label>
            <input 
              type="text" 
              name="website"
              value={filterValues.website}
              onChange={onFilterChange}
              className={inputClass} 
            />
          </div>
          
          <div>
            <label className={labelClass}>Created Date</label>
            <input 
              type="date" 
              name="createdAt"
              value={filterValues.createdAt}
              onChange={onFilterChange}
              className={inputClass} 
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClear();
                onClose();
              }}
            >
              Clear Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#039994] hover:bg-[#02857f] text-white"
            >
              Apply Filter
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}