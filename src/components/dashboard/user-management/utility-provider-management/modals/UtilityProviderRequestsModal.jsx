"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PenLine, Trash2, ChevronLeft } from "lucide-react";

export default function UtilityProviderDetails({ provider, onBack }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-[#039994] font-medium">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Utility Provider Details
        </button>
        
        <div className="flex gap-2">
          <Button variant="secondary" className="bg-[#1E1E1E] text-white hover:bg-gray-800 flex items-center gap-1">
            <PenLine className="h-4 w-4" />
            Edit Utility Provider
          </Button>
          
          <Button variant="outline" className="text-red-500 border-none">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="p-6 rounded-md bg-[#069B960D] border border-[#039994]">
        <div className="grid grid-cols-2 gap-y-4">
          <div>
            <p className="text-gray-600 text-sm">Name</p>
            <p className="font-medium">{provider.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Utility ID</p>
            <p className="font-medium">{provider.id}</p>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Website</p>
            <a href={provider.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
              {provider.website}
            </a>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Documentation</p>
            <a href={provider.documentation} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
              View Documentation
            </a>
          </div>
          
          <div>
            <p className="text-gray-600 text-sm">Created Date</p>
            <p className="font-medium">{new Date(provider.createdAt).toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Updated Date</p>
            <p className="font-medium">{new Date(provider.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}