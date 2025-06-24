"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Pencil, Trash2, Eye, Loader2, Mail, Phone, MapPin, Calendar, User } from "lucide-react";
import EditPartnerModal from "./partnerManagementModal/EditPartnerModal";
import { useToast } from "@/components/ui/use-toast";

export default function PartnerDetails({ partner, onBack }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        if (!partner || !partner.email) {
          throw new Error("Partner data is incomplete");
        }

        const partnerEmail = partner.email.trim();
        if (!partnerEmail.includes("@") || !partnerEmail.includes(".")) {
          throw new Error("Invalid email format");
        }

        const encodedEmail = encodeURIComponent(partnerEmail);
        const apiUrl = `https://services.dcarbon.solutions/api/admin/customer/${encodedEmail}`;

        const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
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

        if (!data || data.status !== "success") {
          throw new Error(data?.message || "Invalid response format");
        }

        // Combine partner data with user details
        setPartnerDetails({
          ...partner,
          ...data.data,
          // Preserve the original partner type
          partnerType: partner.partnerType,
          // Preserve the address from partner if not in user details
          address: partner.address || data.data.address
        });
        setUserDetails(data.data);
      } catch (error) {
        console.error("Fetch error details:", error);
        
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

  const formatPartnerType = (type) => {
    if (!type) return "N/A";
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!partnerDetails) {
    return (
      <div className="w-full text-center py-10">
        <div className="space-y-4">
          <p className="font-medium">Failed to load partner details</p>
          <p className="text-sm text-gray-500">
            Email used: {partner?.email || "No email provided"}
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={onBack}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Partners
        </Button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-[#039994] rounded-md p-6 bg-[#069B960D]">
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <div className="text-sm font-medium">Name</div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                {partnerDetails.name || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Partner Type</div>
              <div>{formatPartnerType(partnerDetails.partnerType)}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Email Address</div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-gray-500" />
                {partnerDetails.email || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Phone number</div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-gray-500" />
                {partnerDetails.phoneNumber || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Address</div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                {partnerDetails.address || "N/A"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Date Registered</div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                {formatDate(partnerDetails.createdAt)}
              </div>
            </div>
            {userDetails?.firstName && (
              <div>
                <div className="text-sm font-medium">First Name</div>
                <div>{userDetails.firstName}</div>
              </div>
            )}
            {userDetails?.lastName && (
              <div>
                <div className="text-sm font-medium">Last Name</div>
                <div>{userDetails.lastName}</div>
              </div>
            )}
          </div>
        </div>

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

      <EditPartnerModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        partner={partnerDetails}
      />
    </div>
  );
}