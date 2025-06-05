"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import EditPartnerModal from "./partnerManagementModal/EditPartnerModal";
import { useToast } from "@/components/ui/use-toast";

export default function PartnerDetails({ partner, onBack }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        // Verify the partner object and email
        if (!partner || !partner.email) {
          throw new Error("Partner data is incomplete");
        }

        const partnerEmail = partner.email.trim();
        if (!partnerEmail.includes("@") || !partnerEmail.includes(".")) {
          throw new Error("Invalid email format");
        }

        console.log("Attempting to fetch details for:", partnerEmail);
        const encodedEmail = encodeURIComponent(partnerEmail);
        console.log("Encoded email for URL:", encodedEmail);

        const apiUrl = `https://services.dcarbon.solutions/api/admin/customer/${encodedEmail}`;
        console.log("Final API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        
        if (!response.ok) {
          // Try to get error details from response
          let errorDetails = {};
          try {
            errorDetails = await response.json();
          } catch (e) {
            console.warn("Couldn't parse error response", e);
          }
          
          throw new Error(
            errorDetails.message || 
            `Server responded with status ${response.status}`
          );
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (!data || data.status !== "success") {
          throw new Error(data?.message || "Invalid response format");
        }

        setPartnerDetails(data.data);
      } catch (error) {
        console.error("Fetch error details:", {
          error: error.message,
          partner: partner,
          time: new Date().toISOString()
        });
        
        toast({
          variant: "destructive",
          title: "Loading Failed",
          description: `Could not load partner details: ${error.message}`,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();
  }, [partner, toast]);

  // Test function using hardcoded email
  const testWithHardcodedEmail = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const testEmail = "mocimoy187@neuraxo.com"; // Your working test email
      
      console.log("Testing with hardcoded email:", testEmail);
      
      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/customer/${encodeURIComponent(testEmail)}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const data = await response.json();
      console.log("Hardcoded test response:", data);
      
      if (response.ok && data.status === "success") {
        setPartnerDetails(data.data);
        toast({
          title: "Test Successful",
          description: "Loaded data using hardcoded email",
        });
      } else {
        throw new Error(data.message || "Failed with hardcoded email");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hardcoded Test Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!partnerDetails) {
    return (
      <div className="w-full text-center py-10">
        <div className="space-y-4">
          <p>Failed to load partner details</p>
          <p className="text-sm text-gray-500">
            Email used: {partner?.email || "No email provided"}
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
            <Button 
              variant="secondary" 
              onClick={testWithHardcodedEmail}
            >
              Test With Working Email
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
              partnerDetails.isActive ? "left-5 bg-green-500" : "left-1"
            }`}></div>
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
              <div>{partnerDetails.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Partner Type</div>
              <div>{partnerDetails.partnerType}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Email Address</div>
              <div>{partnerDetails.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Phone number</div>
              <div>{partnerDetails.phoneNumber}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Address</div>
              <div>{partnerDetails.address}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Date Registered</div>
              <div>{new Date(partnerDetails.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* E-signature Section */}
        <div>
          <h3 className="text-[#039994] font-medium mb-4">User Agreement e-signature</h3>
          
          <div className="space-y-3">
            {partnerDetails.agreements ? (
              <>
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-gray-100 text-gray-800"
                  onClick={() => window.open(partnerDetails.agreements.signature, "_blank")}
                >
                  View User Agreement
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between bg-gray-100 text-gray-800"
                  onClick={() => window.open(partnerDetails.agreements.signature, "_blank")}
                >
                  View E-Signature
                  <Eye className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <p className="text-sm text-gray-500">No agreement documents available</p>
            )}
          </div>

          {/* Referrals Section */}
          {partnerDetails.referrals?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-[#039994] font-medium mb-4">Referrals</h3>
              <div className="space-y-2">
                {partnerDetails.referrals.map((referral) => (
                  <div key={referral.id} className="border p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium">{referral.name}</span>
                      <span className="text-sm capitalize">{referral.status.toLowerCase()}</span>
                    </div>
                    <div className="text-sm text-gray-600">{referral.inviteeEmail}</div>
                    <div className="text-sm text-gray-600">{referral.phoneNumber}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditPartnerModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        partner={partnerDetails}
      />
    </div>
  );
}