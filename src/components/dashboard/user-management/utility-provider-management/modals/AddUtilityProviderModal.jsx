"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { labelClass, inputClass } from "../styles";

export default function AddUtilityProviderModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({ name: "", website: "", documentation: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate(formData);
      onClose();
      setFormData({
        name: "",
        website: "",
        documentation: ""
      });
    } catch (error) {
      console.error("Error creating provider:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl my-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Add Utility Provider</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Provider Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass} 
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className={labelClass}>Website</label>
            <input 
              type="url" 
              name="website"
              value={formData.website}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://example.com"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className={labelClass}>Documentation URL</label>
            <input 
              type="url" 
              name="documentation"
              value={formData.documentation}
              onChange={handleChange}
              className={inputClass}
              placeholder="https://docs.example.com"
              required
            />
          </div>
          
          <div className="md:col-span-2 flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#039994] hover:bg-[#02857f] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Provider"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}