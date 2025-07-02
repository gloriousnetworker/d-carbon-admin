"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Trash2, Eye, Download, ChevronDown, AlertTriangle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function CommercialDetails({ customer, onBack }) {
  const [systemActive, setSystemActive] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState(null);
  const [approvingDoc, setApprovingDoc] = useState(null);
  const [verifyingFacility, setVerifyingFacility] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentDocument, setCurrentDocument] = useState(null);
  const [currentFacility, setCurrentFacility] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);

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

  const updateFacilityDocumentStatus = (facilityId, docType, newStatus, rejectionReason = null) => {
    setFacilities(prev => prev.map(facility => {
      if (facility.id !== facilityId) return facility;
      
      const docField = `${docType}Status`;
      const reasonField = `${docType}RejectionReason`;
      
      return {
        ...facility,
        [docField]: newStatus,
        ...(rejectionReason && { [reasonField]: rejectionReason })
      };
    }));

    if (currentFacility?.id === facilityId) {
      setCurrentFacility(prev => ({
        ...prev,
        [docField]: newStatus,
        ...(rejectionReason && { [reasonField]: rejectionReason })
      }));
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

  const openPdfModal = (pdfUrl, document, facility) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentDocument(document);
    setCurrentFacility(facility);
    setPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setCurrentPdfUrl("");
    setCurrentDocument(null);
    setCurrentFacility(null);
  };

  const openStatusModal = (type, document, facility) => {
    setActionType(type);
    setCurrentDocument(document);
    setCurrentFacility(facility);
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setRejectionReason("");
    setActionType("");
  };

  const openFacilityModal = (facility) => {
    setCurrentFacility(facility);
    setFacilityModalOpen(true);
  };

  const closeFacilityModal = () => {
    setFacilityModalOpen(false);
    setCurrentFacility(null);
  };

  const handleDocumentStatusChange = async () => {
    if (!currentFacility || !currentDocument) return;
    
    const docKey = `${currentFacility.id}-${currentDocument.type}`;
    setApprovingDoc(docKey);
    
    const newStatus = actionType === "APPROVE" ? "APPROVED" : "REJECTED";
    updateFacilityDocumentStatus(
      currentFacility.id,
      currentDocument.type,
      newStatus,
      actionType === "REJECT" ? rejectionReason || "No reason provided" : null
    );
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `https://services.dcarbon.solutions/api/admin/commercial-facility/${currentFacility.id}/document/${currentDocument.type}/status`;
      
      const body = {
        status: newStatus,
        ...(actionType === "REJECT" && { 
          rejectionReason: rejectionReason || "No reason provided" 
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
        closeStatusModal();
      } else {
        throw new Error(data.message || 'Failed to update document status');
      }
    } catch (err) {
      console.error('Error updating document status:', err);
      toast.error(err.message || 'Failed to update document status');
      fetchFacilities();
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
        closeFacilityModal();
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
    return (
      <div 
        className="border border-gray-200 rounded-lg p-6 mb-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => openFacilityModal(facility)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-semibold text-[#039994]">{facility.facilityName}</h4>
            <p className="text-sm text-gray-600">{facility.address}</p>
            <p className="text-xs text-gray-500 mt-1">Facility ID: {facility.id}</p>
          </div>
          <StatusBadge status={facility.status} />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Utility Provider</p>
            <p className="font-medium">{facility.utilityProvider}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Meter IDs</p>
            <p className="font-medium">{facility.meterIds?.join(', ') || 'Not specified'}</p>
          </div>
        </div>
      </div>
    );
  };

  const FacilityModalContent = ({ facility }) => {
    const documents = [
      { name: "Finance Agreement", url: facility.financeAgreementUrl, status: facility.financeAgreementStatus, type: "financeAgreement", rejectionReason: facility.financeAgreementRejectionReason },
      { name: "Proof of Address", url: facility.proofOfAddressUrl, status: facility.proofOfAddressStatus, type: "proofOfAddress", rejectionReason: facility.proofOfAddressRejectionReason },
      { name: "Info Release Authorization", url: facility.infoReleaseAuthUrl, status: facility.infoReleaseAuthStatus, type: "infoReleaseAuth", rejectionReason: facility.infoReleaseAuthRejectionReason },
      { name: "WREGIS Assignment", url: facility.wregisAssignmentUrl, status: facility.wregisAssignmentStatus, type: "wregisAssignment", rejectionReason: facility.wregisAssignmentRejectionReason },
      { name: "Multiple Owner Declaration", url: facility.multipleOwnerDeclUrl, status: facility.multipleOwnerDeclStatus, type: "multipleOwnerDecl", rejectionReason: facility.multipleOwnerDeclRejectionReason },
      { name: "System Operator Data Access", url: facility.sysOpDataAccessUrl, status: facility.sysOpDataAccessStatus, type: "sysOpDataAccess", rejectionReason: facility.sysOpDataAccessRejectionReason },
    ];

    const allDocumentsApproved = documents.every(doc => doc.status === "APPROVED" || doc.status === "Not required");
    const canVerifyFacility = allDocumentsApproved && facility.status !== "VERIFIED";

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg font-semibold text-[#039994]">{facility.facilityName}</h4>
            <p className="text-sm text-gray-600">{facility.address}</p>
            <p className="text-xs text-gray-500 mt-1">Facility ID: {facility.id}</p>
          </div>
          <StatusBadge status={facility.status} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              const isApproving = approvingDoc === docKey;
              
              return (
                <div key={index} className="grid grid-cols-12 p-3 border-b last:border-b-0 items-center text-sm">
                  <div className="col-span-5">
                    <p className="font-medium">{doc.name}</p>
                    {doc.status === "REJECTED" && doc.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1">Reason: {doc.rejectionReason}</p>
                    )}
                  </div>
                  
                  <div className="col-span-3">
                    {doc.url ? (
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => openPdfModal(doc.url, doc, facility)}
                                disabled={isApproving}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.url;
                                  link.download = doc.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                disabled={isApproving}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Download document</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No document uploaded</span>
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                      {isApproving ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        doc.status || 'Required'
                      )}
                    </span>
                  </div>
                  
                  <div className="col-span-2 flex gap-2">
                    {doc.url && doc.status !== "APPROVED" && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs" 
                          onClick={() => openStatusModal("APPROVE", doc, facility)} 
                          disabled={isApproving}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs bg-red-50 text-red-600 hover:bg-red-100" 
                          onClick={() => openStatusModal("REJECT", doc, facility)}
                          disabled={isApproving}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
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
      <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>
                {currentDocument?.name} - {currentFacility?.facilityName}
              </span>
              <Button variant="ghost" size="icon" onClick={closePdfModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="h-full w-full">
            {currentPdfUrl && (
              <iframe 
                src={currentPdfUrl} 
                className="w-full h-full border rounded" 
                frameBorder="0"
                title={`PDF Viewer - ${currentDocument?.name}`}
              />
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentPdfUrl;
                link.download = currentDocument?.name || "document";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statusModalOpen} onOpenChange={closeStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVE" ? "Approve Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVE" 
                ? "Are you sure you want to approve this document?"
                : "Please provide a reason for rejecting this document"}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === "REJECT" && (
            <div className="py-4">
              <Input
                placeholder="Enter rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeStatusModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleDocumentStatusChange}
              disabled={approvingDoc === `${currentFacility?.id}-${currentDocument?.type}` || (actionType === "REJECT" && !rejectionReason)}
              className={actionType === "APPROVE" ? "bg-[#039994] hover:bg-[#02857f]" : "bg-red-500 hover:bg-red-600"}
            >
              {approvingDoc === `${currentFacility?.id}-${currentDocument?.type}` ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : actionType === "APPROVE" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              {actionType === "APPROVE" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={facilityModalOpen} onOpenChange={closeFacilityModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Facility Details</span>
              <Button variant="ghost" size="icon" onClick={closeFacilityModal}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {currentFacility && <FacilityModalContent facility={currentFacility} />}
        </DialogContent>
      </Dialog>

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