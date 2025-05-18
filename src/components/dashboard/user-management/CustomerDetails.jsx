"use client";

import React, { useState } from "react";
import { ChevronLeft, Trash2, Eye, EyeOff, Download, ChevronDown } from "lucide-react";
import * as styles from './styles';

export default function CustomerDetails({ customer, onBack }) {
  const [systemActive, setSystemActive] = useState(false);

  // Mock data for demo purposes
  const customerDetails = {
    name: customer?.name || "Customer Name",
    email: "name@domain.com",
    phone: "+234-000-0000-000",
    type: customer?.type || "Residential",
    utility: customer?.utility || "Utility",
    kWSize: "200",
    meterId: "Meter ID",
    address: customer?.address || "Address",
    dateRegistered: customer?.date || "16-03-2025",
  };

  const documents = [
    { id: 1, name: "NEM Agreement (NEM)", fileName: "Doc1.jpg", status: "Approved" },
    { id: 2, name: "Meter ID Photo", fileName: "", status: "Required" },
    { id: 3, name: "Installer Agreement", fileName: "Doc2.jpg", status: "Pending" },
    { id: 4, name: "Single Line Diagram", fileName: "Doc3.jpg", status: "Rejected" },
    { id: 5, name: "Utility PTO Letter", fileName: "Doc1.jpg", status: "Approved" },
  ];

  // Determine the progress status from customer.status
  const getProgressStatus = () => {
    const currentStatus = customer?.status || "Invited";
    
    switch (currentStatus) {
      case "Active": return 4;
      case "Registered": return 3;
      case "Invited": return 0;
      case "Terminated": return 5;
      default: return 1; // Default to Documents Pending
    }
  };

  const progressStatus = getProgressStatus();

  // Helper function to get status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-[#DEF5F4] text-[#039994]";
      case "Pending": return "bg-[#FFF8E6] text-[#FFB200]";
      case "Rejected": return "bg-[#FFEBEB] text-[#FF0000]";
      case "Required": return "bg-[#F2F2F2] text-gray-500";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col py-8 px-4 bg-white">
      {/* Header with back button, actions, and delete */}
      <div className="flex justify-between items-center mb-6">
        <button
          className="flex items-center text-[#039994] hover:text-[#02857f] pl-0"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Customer Details</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="px-4 py-2 rounded-md border border-gray-300 bg-white flex items-center">
              Choose action
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-normal">Activate System</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                systemActive ? "bg-[#039994]" : "bg-gray-200"
              }`}
              onClick={() => setSystemActive(!systemActive)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  systemActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <button className="text-[#FF0000] hover:text-red-600 p-1">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Program Progress */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Program Progress</p>
        <div className="h-1 w-full bg-gray-200 mb-3 rounded-full">
          <div 
            className="h-full bg-black rounded-full" 
            style={{ width: `${(progressStatus / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-black mr-1.5"></div>
            <span className="text-black">Invitation sent</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#FFB200] mr-1.5"></div>
            <span className="text-[#FFB200]">Documents Pending</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#7CABDE] mr-1.5"></div>
            <span className="text-[#7CABDE]">Documents Rejected</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#056C69] mr-1.5"></div>
            <span className="text-[#056C69]">Registration Complete</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#00B4AE] mr-1.5"></div>
            <span className="text-[#00B4AE]">Active</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-[#FF0000] mr-1.5"></div>
            <span className="text-[#FF0000]">Terminated</span>
          </div>
        </div>
      </div>

      {/* Main Content: Customer Info + Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information Card */}
        <div className="border border-[#FF0000] rounded-lg bg-[#069B960D]">
          <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="font-medium">Name</div>
            <div className="text-right">{customerDetails.name}</div>
            
            <div className="font-medium">Email Address</div>
            <div className="text-right">{customerDetails.email}</div>
            
            <div className="font-medium">Phone number</div>
            <div className="text-right">{customerDetails.phone}</div>
            
            <div className="font-medium">Customer Type</div>
            <div className="text-right">{customerDetails.type}</div>
            
            <div className="font-medium">Utility Provider</div>
            <div className="text-right">{customerDetails.utility}</div>
            
            <div className="font-medium">kW System Size</div>
            <div className="text-right">{customerDetails.kWSize}</div>
            
            <div className="font-medium">Meter ID</div>
            <div className="text-right">{customerDetails.meterId}</div>
            
            <div className="font-medium">Address</div>
            <div className="text-right">{customerDetails.address}</div>
            
            <div className="font-medium">Date Registered</div>
            <div className="text-right">{customerDetails.dateRegistered}</div>
          </div>
        </div>

        {/* User Agreement Card */}
        <div className="border border-black rounded-lg">
          <div className="p-4">
            <h3 className="text-[#039994] font-medium mb-4">User Agreement e-signature</h3>
            
            <div className="space-y-3">
              <button className="w-full rounded-md border border-black py-2 px-3 flex justify-between items-center">
                View User Agreement
                <Eye className="h-4 w-4" />
              </button>
              
              <div className="flex space-x-3">
                <button className="flex-1 rounded-md border border-black py-2 px-3 flex justify-between items-center">
                  View E-Signature
                  <Eye className="h-4 w-4" />
                </button>
                <button className="bg-white p-2 border border-black rounded-md">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Section */}
      <div className="mt-6">
        <h3 className="text-[#039994] font-medium mb-2">Documentation</h3>
        
        <hr className="border-gray-300 my-2" />
        
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="py-2 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{doc.name}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {doc.fileName ? (
                  <>
                    <div className="px-2 py-1 rounded border border-gray-300 flex items-center">
                      <span className="text-xs mr-1">{doc.fileName}</span>
                    </div>
                    <button className="border border-gray-300 rounded-md p-2" title="View Document">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="border border-gray-300 rounded-md p-2" title="Download Document">
                      <Download className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button className="px-3 py-1 border border-gray-300 rounded-md text-xs">
                    Upload Document
                  </button>
                )}
                
                <div className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}