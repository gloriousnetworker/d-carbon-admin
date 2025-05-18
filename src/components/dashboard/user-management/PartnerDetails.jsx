"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, Trash2, Eye } from "lucide-react";
import EditPartnerModal from "./modals/partnerManagement/EditPartnerModal";

export default function PartnerDetails({ partner, onBack }) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <div className="w-full">
      {/* Back Button and Header Row */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Partner Details
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mb-6">
        <Button 
          variant="outline"
          className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2"
          onClick={() => setShowEditModal(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit Partner Details
        </Button>
        <Button variant="ghost" className="text-red-500">
          <Trash2 className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <span>Activate System</span>
          <div className="w-10 h-5 bg-gray-200 rounded-full relative">
            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5"></div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="font-medium mb-1">Program Progress</div>
        <div className="w-full h-2 bg-black rounded-full mb-1"></div>
        <div className="flex justify-between text-xs">
          <span>Invitation sent</span>
          <span style={{ color: "#FFB200" }}>Documents Pending</span>
          <span style={{ color: "#7CABDE" }}>Documents Rejected</span>
          <span style={{ color: "#056C69" }}>Registration Complete</span>
          <span style={{ color: "#00B4AE" }}>Active</span>
          <span style={{ color: "#FF0000" }}>Terminated</span>
        </div>
      </div>

      {/* Partner Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-[#039994] rounded-md p-6 bg-[#069B960D]">
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <div className="text-sm font-medium">Name</div>
              <div>{partner.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Partner Name</div>
              <div>{partner.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Email Address</div>
              <div>{partner.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Phone number</div>
              <div>{partner.contact}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Customer Type</div>
              <div>{partner.type}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Address</div>
              <div>{partner.address}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Date Registered</div>
              <div>{partner.date}</div>
            </div>
          </div>
        </div>

        {/* E-signature Section */}
        <div>
          <h3 className="text-[#039994] font-medium mb-4">User Agreement e-signature</h3>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gray-100 text-gray-800"
            >
              View User Agreement
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gray-100 text-gray-800"
            >
              View E-Signature
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditPartnerModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        partner={partner}
      />
    </div>
  );
}