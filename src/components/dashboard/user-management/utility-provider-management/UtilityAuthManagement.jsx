"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UtilityAuthManagement({ onBack }) {
  const [auths, setAuths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchAuths = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) throw new Error("Authentication token not found");
        
        const response = await fetch("https://services.dcarbon.solutions/api/auth/utility-auth", {
          method: "GET",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          }
        });
        
        if (!response.ok) throw new Error(`Error fetching utility authorizations: ${response.statusText}`);
        
        const result = await response.json();
        if (result.status === "success") {
          setAuths(result.data || []);
        } else {
          throw new Error(result.message || "Failed to fetch utility authorizations");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching utility authorizations:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAuths();
  }, []);

  const handleDeleteAuth = async (authId, userId, utilityAuthEmail) => {
    try {
      setDeletingId(authId);
      const authToken = localStorage.getItem("authToken");
      if (!authToken) throw new Error("Authentication token not found");
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/auth/utility-auth/${userId}`,
        {
          method: "DELETE",
          headers: { 
            "Authorization": `Bearer ${authToken}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            utilityAuthEmail: utilityAuthEmail
          })
        }
      );
      
      if (!response.ok) throw new Error(`Error deleting utility authorization: ${response.statusText}`);
      
      const result = await response.json();
      if (result.status === "success") {
        toast.success("Utility authorization deleted successfully");
        setAuths(prev => prev.filter(auth => auth.id !== authId));
      } else {
        throw new Error(result.message || "Failed to delete utility authorization");
      }
    } catch (err) {
      toast.error(err.message);
      console.error("Error deleting utility authorization:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-[#039994] font-medium">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Utility Authorization Management
        </button>
        
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
          <span className="ml-3 text-lg text-gray-600">Loading utility authorizations...</span>
        </div>
      )}

      {error && (
        <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-md text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !error && auths.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-lg">No utility authorizations found</p>
        </div>
      )}

      {!isLoading && !error && auths.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y">
                <th className="py-3 px-4 text-left font-medium">S/N</th>
                <th className="py-3 px-4 text-left font-medium">User Email</th>
                <th className="py-3 px-4 text-left font-medium">Utility Auth Email</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
                <th className="py-3 px-4 text-left font-medium">Authorization UID</th>
                <th className="py-3 px-4 text-left font-medium">Created Date</th>
                <th className="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {auths.map((auth, index) => (
                <tr key={auth.id} className="border-b">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{auth.user?.email || "N/A"}</td>
                  <td className="py-3 px-4">{auth.utilityAuthEmail}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      auth.status === 'UPDATED' ? 'bg-green-100 text-green-800' :
                      auth.status === 'UPDATE_ERROR' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {auth.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{auth.authorization_uid || "N/A"}</td>
                  <td className="py-3 px-4">{new Date(auth.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteAuth(auth.id, auth.userId, auth.utilityAuthEmail)}
                      disabled={deletingId === auth.id}
                    >
                      {deletingId === auth.id ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                      )}
                      Delete
                    </Button>
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