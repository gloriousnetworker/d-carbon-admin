"use client";

import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EditPartnerModal({ isOpen, onClose, partner }) {
  const [formData, setFormData] = useState({
    name: partner?.name || "",
    email: partner?.email || "",
    contact: partner?.contact || "",
    type: partner?.type || "",
    address: partner?.address || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Partner</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input 
              type="text" 
              name="contact" 
              value={formData.contact} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Partner Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="Sales Agent">Sales Agent</option>
              <option value="Finance Company">Finance Company</option>
              <option value="Installer">Installer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea 
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-teal-500 hover:bg-teal-600">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}