"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function FilterByModal({ isOpen, onClose }) {
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
            <select className="w-full p-2 border rounded">
              <option value="">All</option>
              <option value="Sales Agent">Sales Agent</option>
              <option value="Finance Company">Finance Company</option>
              <option value="Installer">Installer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <div className="flex gap-2">
              <input type="date" className="w-full p-2 border rounded" />
              <input type="date" className="w-full p-2 border rounded" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full p-2 border rounded">
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-teal-500 hover:bg-teal-600">Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}