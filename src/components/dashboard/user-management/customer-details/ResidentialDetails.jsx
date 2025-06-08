"use client";

import React from "react";
import { ChevronLeft, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { StatusBadge } from "@/components/StatusBadge";

export default function ResidentialDetails({ customer, onBack }) {
  return (
    <div className="min-h-screen w-full flex flex-col py-8 px-4 bg-white">
      <div className="flex justify-between items-center mb-6">
        <button className="flex items-center text-[#039994] hover:text-[#02857f] pl-0" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Customer Details</span>
        </button>

        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center gap-2">
            Choose action
          </Button>
          <button className="text-[#FF0000] hover:text-red-600 p-1">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 rounded-lg bg-[#069B960D] p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4">Residential Information</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{customer?.id || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{customer?.name || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Customer Type</p>
              <p className="font-medium">Residential</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Utility Provider</p>
              <p className="font-medium">{customer?.utility || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{customer?.address || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Date Registered</p>
              <p className="font-medium">{new Date(customer?.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">System Status</p>
              <p className="font-medium">Active</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#039994] mb-4">User Agreement</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full flex justify-between items-center">
                View User Agreement
                <Eye className="h-4 w-4" />
              </Button>
              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1 flex justify-between items-center">
                  View E-Signature
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}