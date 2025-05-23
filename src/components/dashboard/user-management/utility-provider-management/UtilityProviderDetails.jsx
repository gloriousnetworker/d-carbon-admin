"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function UtilityProviderRequestsModal({ isOpen, onClose, requests, isLoading, onRefresh }) {
  const handleApproveRequest = async (requestId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/utility-provider-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error(`Error approving request: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Request approved successfully");
        onRefresh();
      } else throw new Error(result.message || "Failed to approve request");
    } catch (err) {
      toast.error(err.message);
      console.error("Error approving request:", err);
    }
  };
  
  const handleRejectRequest = async (requestId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/utility-provider-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}`, "Content-Type": "application/json" }
      });
      
      if (!response.ok) throw new Error(`Error rejecting request: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Request rejected successfully");
        onRefresh();
      } else throw new Error(result.message || "Failed to reject request");
    } catch (err) {
      toast.error(err.message);
      console.error("Error rejecting request:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl my-8 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Utility Provider Requests</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
            <span className="ml-3 text-lg text-gray-600">Loading requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-lg">No pending utility provider requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y">
                  <th className="py-3 px-4 text-left font-medium">S/N</th>
                  <th className="py-3 px-4 text-left font-medium">Provider Name</th>
                  <th className="py-3 px-4 text-left font-medium">Website</th>
                  <th className="py-3 px-4 text-left font-medium">Contact Email</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Request Date</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request, index) => (
                  <tr key={request.id} className="border-b">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">{request.name}</td>
                    <td className="py-3 px-4">
                      <a href={request.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {request.website}
                      </a>
                    </td>
                    <td className="py-3 px-4">{request.contactEmail}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApproveRequest(request.id)}>
                            <Check className="h-3 w-3 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectRequest(request.id)}>
                            <X className="h-3 w-3 mr-1" /> Reject
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}