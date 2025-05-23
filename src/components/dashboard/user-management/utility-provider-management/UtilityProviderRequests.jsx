"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Check, X, Mail } from "lucide-react";
import toast from "react-hot-toast";

export default function UtilityProviderRequests({ onBack }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const response = await fetch("https://services.dcarbon.solutions/api/admin/utility-provider-requests", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error(`Error fetching requests: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === "success") {
        setRequests(result.data?.requests || []);
      } else {
        throw new Error(result.message || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApproveRequest = async (requestId) => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/utility-provider-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error(`Error approving request: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Request approved successfully");
        fetchRequests();
      } else {
        throw new Error(result.message || "Failed to approve request");
      }
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
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) throw new Error(`Error rejecting request: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Request rejected successfully");
        fetchRequests();
      } else {
        throw new Error(result.message || "Failed to reject request");
      }
    } catch (err) {
      toast.error(err.message);
      console.error("Error rejecting request:", err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-[#039994] font-medium">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Utility Provider Requests
        </button>
        
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={fetchRequests}
          disabled={isLoading}
        >
          <Mail className="h-4 w-4" />
          Refresh Requests
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
          <span className="ml-3 text-lg text-gray-600">Loading requests...</span>
        </div>
      )}

      {error && (
        <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            onClick={fetchRequests}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && requests.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-lg">No pending utility provider requests</p>
        </div>
      )}

      {!isLoading && !error && requests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y">
                <th className="py-3 px-4 text-left font-medium">S/N</th>
                <th className="py-3 px-4 text-left font-medium">Provider Name</th>
                <th className="py-3 px-4 text-left font-medium">Website</th>
                <th className="py-3 px-4 text-left font-medium">Requested By</th>
                <th className="py-3 px-4 text-left font-medium">Email</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-left font-medium">Request Date</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => (
                <tr key={request.id} className="border-b">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{request.name || "N/A"}</td>
                  <td className="py-3 px-4">
                    {request.websiteUrl ? (
                      <a 
                        href={request.websiteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {request.websiteUrl}
                      </a>
                    ) : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {request.requestedBy 
                      ? `${request.requestedBy.firstName || ""} ${request.requestedBy.lastName || ""}`.trim() 
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {request.requestedBy?.email || "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      request.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
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
  );
}