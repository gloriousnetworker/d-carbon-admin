"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Trash2, Eye, Download, ChevronDown, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";

export default function CommercialDetails({ customer, onBack }) {
  const [systemActive, setSystemActive] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState(null);
  const [approvingDoc, setApprovingDoc] = useState(null);
  const [verifyingFacility, setVerifyingFacility] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [showRejectionInput, setShowRejectionInput] = useState({});

  useEffect(() => {
    if (customer?.id) fetchFacilities();
  }, [customer?.id]);

  const fetchFacilities = async () => {
    setFacilitiesLoading(true);
    setFacilitiesError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const response = await fetch(
        `https://services.dcarbon.solutions/api/facility/get-user-facilities-by-userId/${customer.id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.status === 'success' && data.data?.facilities) {
        setFacilities(data.data.facilities);
      } else {
        throw new Error(data.message || 'Failed to fetch facilities');
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setFacilitiesError(err.message);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Not specified") return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProgressStatus = () => {
    const currentStatus = customer?.status || "Invited";
    switch (currentStatus) {
      case "Active": return 4;
      case "Registered": return 3;
      case "Invited": return 0;
      case "Terminated": return 5;
      default: return 1;
    }
  };

  const progressStatus = getProgressStatus();

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-[#DEF5F4] text-[#039994]";
      case "PENDING": return "bg-[#FFF8E6] text-[#FFB200]";
      case "REJECTED": return "bg-[#FFEBEB] text-[#FF0000]";
      case "Required": 
      case "REQUIRED": 
        return "bg-[#F2F2F2] text-gray-500";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const StatusBadge = ({ status }) => {
    let classes = "";
    switch (status) {
      case "Active":
      case "ACTIVE":
      case "VERIFIED":
        classes = "bg-teal-500 text-white";
        break;
      case "Invited":
        classes = "bg-amber-400 text-white";
        break;
      case "Registered":
        classes = "bg-black text-white";
        break;
      case "Terminated":
        classes = "bg-red-500 text-white";
        break;
      case "Inactive":
      case "INACTIVE":
        classes = "bg-gray-400 text-white";
        break;
      case "PENDING":
        classes = "bg-amber-400 text-white";
        break;
      default:
        classes = "bg-gray-300 text-black";
    }
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${classes}`}>
        {status}
      </span>
    );
  };

  const handleDocumentStatusChange = async (facilityId, docType, status) => {
    const docKey = `${facilityId}-${docType}`;
    setApprovingDoc(docKey);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `https://services.dcarbon.solutions/api/admin/commercial-facility/${facilityId}/document/${docType}/status`;
      
      const body = {
        status,
        ...(status === "REJECTED" && { 
          reason: rejectionReasons[docKey] || "No reason provided" 
        })
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        toast.success(data.message);
        fetchFacilities();
        setShowRejectionInput(prev => ({ ...prev, [docKey]: false }));
      } else {
        throw new Error(data.message || 'Failed to update document status');
      }
    } catch (err) {
      console.error('Error updating document status:', err);
      toast.error(err.message || 'Failed to update document status');
    } finally {
      setApprovingDoc(null);
    }
  };

  const handleVerifyFacility = async (facilityId) => {
    setVerifyingFacility(facilityId);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `https://services.dcarbon.solutions/api/admin/commercial-facility/${facilityId}/verify`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        toast.success(data.message);
        fetchFacilities();
      } else {
        throw new Error(data.message || 'Failed to verify facility');
      }
    } catch (err) {
      console.error('Error verifying facility:', err);
      toast.error(err.message || 'Failed to verify facility');
    } finally {
      setVerifyingFacility(null);
    }
  };

  const FacilityCard = ({ facility }) => {
    const documents = [
      { name: "Finance Agreement", url: facility.financeAgreementUrl, status: facility.financeAgreementStatus, type: "financeAgreement" },
      { name: "Proof of Address", url: facility.proofOfAddressUrl, status: facility.proofOfAddressStatus, type: "proofOfAddress" },
      { name: "Info Release Authorization", url: facility.infoReleaseAuthUrl, status: facility.infoReleaseAuthStatus, type: "infoReleaseAuth" },
      { name: "WREGIS Assignment", url: facility.wregisAssignmentUrl, status: facility.wregisAssignmentStatus, type: "wregisAssignment" },
      { name: "Multiple Owner Declaration", url: facility.multipleOwnerDeclUrl, status: facility.multipleOwnerDeclStatus, type: "multipleOwnerDecl" },
      { name: "System Operator Data Access", url: facility.sysOpDataAccessUrl, status: facility.sysOpDataAccessStatus, type: "sysOpDataAccess" },
    ];

    const allDocumentsApproved = documents.every(doc => doc.status === "APPROVED" || doc.status === "Not required");
    const canVerifyFacility = allDocumentsApproved && facility.status !== "VERIFIED";

    return (
      <div className="border border-gray-200 rounded-lg p-6 mb-6 bg-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-semibold text-[#039994]">{facility.facilityName}</h4>
            <p className="text-sm text-gray-600">{facility.address}</p>
          </div>
          <StatusBadge status={facility.status} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Utility Provider</p>
              <p className="font-medium">{facility.utilityProvider}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Meter IDs</p>
              <p className="font-medium">{facility.meterIds?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Commercial Role</p>
              <p className="font-medium capitalize">{facility.commercialRole}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Entity Type</p>
              <p className="font-medium capitalize">{facility.entityType}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Total RECs</p>
              <p className="font-medium">{facility.totalRecs}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last REC Calculation</p>
              <p className="font-medium">{formatDate(facility.lastRecCalculation)}</p>
            </div>
            {facility.name && (
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium">{facility.name}</p>
              </div>
            )}
            {facility.website && (
              <div>
                <p className="text-sm text-gray-500">Website</p>
                <a href={facility.website} target="_blank" rel="noopener noreferrer" className="font-medium text-[#039994] hover:underline">
                  {facility.website}
                </a>
              </div>
            )}
          </div>
        </div>

        <div>
          <h5 className="text-md font-semibold text-[#039994] mb-3">Facility Documents</h5>
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 p-3 border-b text-sm">
              <div className="col-span-5 font-medium">Document Name</div>
              <div className="col-span-3 font-medium">File</div>
              <div className="col-span-2 font-medium">Status</div>
              <div className="col-span-2 font-medium">Actions</div>
            </div>
            
            {documents.map((doc, index) => {
              const docKey = `${facility.id}-${doc.type}`;
              return (
                <React.Fragment key={index}>
                  <div className="grid grid-cols-12 p-3 border-b last:border-b-0 items-center text-sm">
                    <div className="col-span-5">
                      <p className="font-medium">{doc.name}</p>
                    </div>
                    
                    <div className="col-span-3">
                      {doc.url ? (
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(doc.url, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.url;
                            link.download = doc.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No document uploaded</span>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                        {doc.status || 'Required'}
                      </span>
                    </div>
                    
                    <div className="col-span-2 flex gap-2">
                      {doc.url && doc.status !== "APPROVED" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs" 
                            onClick={() => handleDocumentStatusChange(facility.id, doc.type, "APPROVED")} 
                            disabled={approvingDoc === docKey}
                          >
                            {approvingDoc === docKey ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-red-50 text-red-600 hover:bg-red-100" 
                            onClick={() => setShowRejectionInput(prev => ({
                              ...prev,
                              [docKey]: !prev[docKey]
                            }))}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {showRejectionInput[docKey] && (
                    <div className="p-3 border-b bg-gray-50">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter rejection reason" 
                          className="flex-1 border rounded px-2 py-1 text-sm" 
                          value={rejectionReasons[docKey] || ''} 
                          onChange={(e) => setRejectionReasons(prev => ({ 
                            ...prev, 
                            [docKey]: e.target.value 
                          }))} 
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs" 
                          onClick={() => {
                            if (rejectionReasons[docKey]) {
                              handleDocumentStatusChange(facility.id, doc.type, "REJECTED");
                            } else {
                              toast.error("Please enter a rejection reason");
                            }
                          }} 
                          disabled={approvingDoc === docKey}
                        >
                          {approvingDoc === docKey ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                        </Button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {canVerifyFacility && (
          <div className="mt-4 flex justify-end">
            <Button onClick={() => handleVerifyFacility(facility.id)} disabled={verifyingFacility === facility.id} className="bg-[#039994] hover:bg-[#02857f]">
              {verifyingFacility === facility.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {verifyingFacility === facility.id ? "Verifying..." : "Verify Facility"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col py-8 px-4 bg-white">
      <div className="flex justify-between items-center mb-6">
        <button className="flex items-center text-[#039994] hover:text-[#02857f] pl-0" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Customer Details</span>
        </button>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              Choose action
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-normal">Activate System</span>
            <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${systemActive ? "bg-[#039994]" : "bg-gray-200"}`} onClick={() => setSystemActive(!systemActive)}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${systemActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <button className="text-[#FF0000] hover:text-red-600 p-1">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Program Progress</p>
        <div className="h-1 w-full bg-gray-200 mb-3 rounded-full">
          <div className="h-full bg-black rounded-full" style={{ width: `${(progressStatus / 5) * 100}%` }} />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 rounded-lg bg-[#069B960D] p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4">Customer Information</h3>
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
              <p className="font-medium">{customer?.userType || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Utility Provider</p>
              <p className="font-medium">{customer?.utility || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Finance Company</p>
              <p className="font-medium">{customer?.financeCompany || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{customer?.address || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Date Registered</p>
              <p className="font-medium">{formatDate(customer?.date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">
                <StatusBadge status={customer?.status || "Not specified"} />
              </p>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4">System Information</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Facilities</p>
              <p className="font-medium">{facilities.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Active Facilities</p>
              <p className="font-medium">{facilities.filter(f => f.status === 'VERIFIED' || f.status === 'ACTIVE').length}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm text-gray-500">System Status</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{systemActive ? "Active" : "Inactive"}</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${systemActive ? "bg-[#039994]" : "bg-gray-200"}`} onClick={() => setSystemActive(!systemActive)}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${systemActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
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

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#039994]">Facilities</h3>
          {facilitiesLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading facilities...
            </div>
          )}
        </div>
        
        {facilitiesError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">Error loading facilities: {facilitiesError}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchFacilities}>
              Retry
            </Button>
          </div>
        )}
        
        {!facilitiesLoading && !facilitiesError && facilities.length === 0 && (
          <div className="border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500">No facilities found for this customer.</p>
          </div>
        )}
        
        {facilities.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>
    </div>
  );
}