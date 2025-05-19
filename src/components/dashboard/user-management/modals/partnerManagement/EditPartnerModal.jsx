"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function EditPartnerModal({ isOpen, onClose, partner }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    userType: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form data when partner data changes
  useEffect(() => {
    if (partner) {
      setFormData({
        firstName: partner.firstName || "",
        lastName: partner.lastName || "",
        email: partner.email || "",
        phoneNumber: partner.phoneNumber || "",
        userType: partner.userType || "PARTNER"
      });
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      // Assuming there's an update endpoint - adjust this based on your actual API
      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/customer/${partner.id}`, 
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update partner details");
      }

      const result = await response.json();
      if (result.status === "success") {
        setSuccess(true);
        // Wait a moment to show success message before closing
        setTimeout(() => {
          onClose();
          // Refresh data - this should be handled by the parent component
          window.location.reload(); // Use a more elegant method in production
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to update partner details");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error updating partner details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Partner</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
       
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4">
            Partner details updated successfully!
          </div>
        )}
       
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>
         
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-100"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
          </div>
         
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="+1234567890"
            />
          </div>
         
          <div>
            <label className="block text-sm font-medium mb-1">User Type</label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="PARTNER">PARTNER</option>
              <option value="INSTALLER">INSTALLER</option>
              <option value="FINANCIER">FINANCIER</option>
              <option value="SALES_AGENT">SALES AGENT</option>
            </select>
          </div>
         
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-teal-500 hover:bg-teal-600 text-white"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}