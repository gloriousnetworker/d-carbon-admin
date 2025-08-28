import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Trash2, Eye, Download, ChevronDown, AlertTriangle, CheckCircle, Loader2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white';
export const headingContainer = 'relative w-full flex flex-col items-center mb-2';
export const backArrow = 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10';
export const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center';
export const progressContainer = 'w-full max-w-md flex items-center justify-between mb-6';
export const progressBarWrapper = 'flex-1 h-1 bg-gray-200 rounded-full mr-4';
export const progressBarActive = 'h-1 bg-[#039994] w-2/3 rounded-full';
export const progressStepText = 'text-sm font-medium text-gray-500 font-sfpro';
export const formWrapper = 'w-full max-w-md space-y-6';
export const labelClass = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
export const selectClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060]';
export const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
export const fileInputWrapper = 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro';
export const noteText = 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]';
export const rowWrapper = 'flex space-x-4';
export const halfWidth = 'w-1/2';
export const grayPlaceholder = 'bg-[#E8E8E8]';
export const buttonPrimary = 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
export const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20';
export const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin';
export const termsTextContainer = 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]';
export const uploadHeading = 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]';
export const uploadFieldWrapper = 'flex items-center space-x-3';
export const uploadInputLabel = 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro';
export const uploadIconContainer = 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400';
export const uploadButtonStyle = 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro';
export const uploadNoteStyle = 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]';

export default function CommercialDetails({ customer, onBack }) {
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
  const [wregisModalOpen, setWregisModalOpen] = useState(false);
  const [wregisForm, setWregisForm] = useState({
    wregisEligibilityDate: "",
    wregisId: "",
    rpsId: ""
  });
  const [updatingWregis, setUpdatingWregis] = useState(false);
  const [uploadingAck, setUploadingAck] = useState(null);
  const fileInputRef = useRef(null);

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

  const updateFacilityFromResponse = (responseData) => {
    setFacilities(prev => prev.map(facility => {
      if (facility.id !== responseData.id) return facility;
      return { ...facility, ...responseData };
    }));

    if (currentFacility?.id === responseData.id) {
      setCurrentFacility(prev => ({ ...prev, ...responseData }));
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
      case "SUBMITTED": return "bg-[#E6F7FF] text-[#1890FF]";
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
      case "SUBMITTED":
        classes = "bg-blue-400 text-white";
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

  const openWregisModal = (facility) => {
    setCurrentFacility(facility);
    setWregisForm({
      wregisEligibilityDate: facility.wregisEligibilityDate ? facility.wregisEligibilityDate.split('T')[0] : "",
      wregisId: facility.wregisId || "",
      rpsId: facility.rpsId || ""
    });
    setWregisModalOpen(true);
  };

  const closeWregisModal = () => {
    setWregisModalOpen(false);
    setCurrentFacility(null);
    setWregisForm({
      wregisEligibilityDate: "",
      wregisId: "",
      rpsId: ""
    });
  };

  const handleDocumentStatusChange = async () => {
    if (!currentFacility || !currentDocument) return;

    const docKey = `${currentFacility.id}-${currentDocument.type}`;
    setApprovingDoc(docKey);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `https://services.dcarbon.solutions/api/admin/commercial-facility/${currentFacility.id}/document/${currentDocument.type}/status`;

      const body = {
        status: actionType === "APPROVE" ? "APPROVED" : "REJECTED",
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
        
        const statusFieldMap = {
          "wregisAssignment": "wregisAssignmentStatus",
          "financeAgreement": "financeAgreementStatus",
          "solarInstallationContract": "solarInstallationContractStatus",
          "interconnectionAgreement": "interconnectionAgreementStatus",
          "ptoLetter": "ptoLetterStatus",
          "singleLineDiagram": "singleLineDiagramStatus",
          "sitePlan": "sitePlanStatus",
          "panelInverterDatasheet": "inverterDatasheetStatus",
          "revenueMeterData": "revenueMeterDataStatus",
          "utilityMeterPhoto": "utilityMeterPhotoStatus",
          "assignmentOfRegistrationRight": "assignmentOfRegistrationRightStatus",
          "acknowledgementOfStationService": "acknowledgementOfStationServiceStatus"
        };

        const updatedFacility = {
          ...currentFacility,
          [statusFieldMap[currentDocument.type]]: actionType === "APPROVE" ? "APPROVED" : "REJECTED",
          ...(actionType === "REJECT" && {
            [`${currentDocument.type}RejectionReason`]: rejectionReason || "No reason provided"
          })
        };

        updateFacilityFromResponse(updatedFacility);
        closeStatusModal();
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
        updateFacilityFromResponse(data.data);
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

  const handleWregisUpdate = async () => {
    if (!currentFacility) return;
    setUpdatingWregis(true);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `https://services.dcarbon.solutions/api/admin/update-wregis-info/${currentFacility.id}`;

      const body = {
        wregisEligibilityDate: wregisForm.wregisEligibilityDate ? `${wregisForm.wregisEligibilityDate}T00:00:00Z` : null,
        wregisId: wregisForm.wregisId || null,
        rpsId: wregisForm.rpsId || null
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
        updateFacilityFromResponse(data.data);
        closeWregisModal();
        fetchFacilities();
      } else {
        throw new Error(data.message || 'Failed to update WREGIS information');
      }
    } catch (err) {
      console.error('Error updating WREGIS information:', err);
      toast.error(err.message || 'Failed to update WREGIS information');
    } finally {
      setUpdatingWregis(false);
    }
  };

  const handleAckUpload = async (facilityId, file) => {
    setUploadingAck(facilityId);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('file', file);

      const endpoint = `https://services.dcarbon.solutions/api/admin/update-acknowledgement-of-station-service/${facilityId}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        toast.success(data.message);
        updateFacilityFromResponse(data.data);
      } else {
        throw new Error(data.message || 'Failed to upload document');
      }
    } catch (err) {
      console.error('Error uploading Acknowledgement of Station Service:', err);
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploadingAck(null);
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

        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              openWregisModal(facility);
            }}
            className="text-[#039994] border-[#039994] hover:bg-[#03999410]"
          >
            Update WREGIS Information
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                handleAckUpload(facility.id, file);
              }
            }}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={uploadingAck === facility.id}
            className="text-[#039994] border-[#039994] hover:bg-[#03999410]"
          >
            {uploadingAck === facility.id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Upload className="h-4 w-4 mr-1" />
            )}
            Upload Ack of Station Service
          </Button>
        </div>
      </div>
    );
  };

  const FacilityModalContent = ({ facility }) => {
    const documents = [
      { name: "WREGIS Assignment", url: facility.wregisAssignmentUrl, status: facility.wregisAssignmentStatus, type: "wregisAssignment", rejectionReason: facility.wregisAssignmentRejectionReason },
      { name: "Finance Agreement", url: facility.financeAgreementUrl, status: facility.financeAgreementStatus, type: "financeAgreement", rejectionReason: facility.financeAgreementRejectionReason },
      { name: "Solar Installation Contract", url: facility.solarInstallationContractUrl, status: facility.solarInstallationContractStatus, type: "solarInstallationContract", rejectionReason: facility.solarInstallationContractRejectionReason },
      { name: "Utility Interconnection Agreement", url: facility.interconnectionAgreementUrl, status: facility.interconnectionAgreementStatus, type: "interconnectionAgreement", rejectionReason: facility.interconnectionAgreementRejectionReason },
      { name: "Utility PTO Letter", url: facility.ptoLetterUrl, status: facility.ptoLetterStatus, type: "ptoLetter", rejectionReason: facility.ptoLetterRejectionReason },
      { name: "Single Line Diagram", url: facility.singleLineDiagramUrl, status: facility.singleLineDiagramStatus, type: "singleLineDiagram", rejectionReason: facility.singleLineDiagramRejectionReason },
      { name: "Installation Site Plan", url: facility.sitePlanUrl, status: facility.sitePlanStatus, type: "sitePlan", rejectionReason: facility.sitePlanRejectionReason },
      { name: "Panel/Inverter Datasheet", url: facility.inverterDatasheetUrl, status: facility.inverterDatasheetStatus, type: "panelInverterDatasheet", rejectionReason: facility.inverterDatasheetRejectionReason },
      { name: "Revenue Meter Datasheet", url: facility.revenueMeterDataUrl, status: facility.revenueMeterDataStatus, type: "revenueMeterData", rejectionReason: facility.revenueMeterDataRejectionReason },
      { name: "Utility Meter Photo", url: facility.utilityMeterPhotoUrl, status: facility.utilityMeterPhotoStatus, type: "utilityMeterPhoto", rejectionReason: facility.utilityMeterPhotoRejectionReason },
      { name: "Assignment of Registration Right", url: facility.assignmentOfRegistrationRightUrl, status: facility.assignmentOfRegistrationRightStatus, type: "assignmentOfRegistrationRight", rejectionReason: facility.assignmentOfRegistrationRightRejectionReason },
      { name: "Acknowledgement of Station Service", url: facility.acknowledgementOfStationServiceUrl, status: facility.acknowledgementOfStationServiceStatus, type: "acknowledgementOfStationService", rejectionReason: facility.acknowledgementOfStationServiceRejectionReason }
    ];

    const allDocumentsApproved = documents.every(doc => doc.status === "APPROVED");
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
            <div>
              <p className="text-sm text-gray-500">WREGIS ID</p>
              <p className="font-medium">{facility.wregisId || 'Not specified'}</p>
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
            <div>
              <p className="text-sm text-gray-500">WREGIS Eligibility Date</p>
              <p className="font-medium">{formatDate(facility.wregisEligibilityDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">RPS ID</p>
              <p className="font-medium">{facility.rpsId || 'Not specified'}</p>
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
    <div className={mainContainer}>
      <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>
                {currentDocument?.name} - {currentFacility?.facilityName}
              </span>
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
            </DialogTitle>
          </DialogHeader>
          {currentFacility && <FacilityModalContent facility={currentFacility} />}
        </DialogContent>
      </Dialog>

      <Dialog open={wregisModalOpen} onOpenChange={closeWregisModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update WREGIS Information</DialogTitle>
            <DialogDescription>
              Update WREGIS details for {currentFacility?.facilityName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>WREGIS Eligibility Date</label>
              <Input
                type="date"
                value={wregisForm.wregisEligibilityDate}
                onChange={(e) => setWregisForm({...wregisForm, wregisEligibilityDate: e.target.value})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WREGIS ID</label>
              <Input
                type="text"
                value={wregisForm.wregisId}
                onChange={(e) => setWregisForm({...wregisForm, wregisId: e.target.value})}
                className={inputClass}
                placeholder="Enter WREGIS ID"
              />
            </div>
            <div>
              <label className={labelClass}>RPS ID</label>
              <Input
                type="text"
                value={wregisForm.rpsId}
                onChange={(e) => setWregisForm({...wregisForm, rpsId: e.target.value})}
                className={inputClass}
                placeholder="Enter RPS ID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeWregisModal}>
              Cancel
            </Button>
            <Button
              onClick={handleWregisUpdate}
              disabled={updatingWregis}
              className="bg-[#039994] hover:bg-[#02857f]"
            >
              {updatingWregis ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {updatingWregis ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <button className="flex items-center text-[#039994] hover:text-[#02857f] pl-0" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Customer Details</span>
        </button>
      </div>

      <div className="mb-6 w-full max-w-7xl">
        <p className={labelClass}>Program Progress</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-7xl">
        <div className="border border-gray-200 rounded-lg bg-[#069B960D] p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4">Customer Information</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div className="space-y-1">
              <p className={labelClass}>User ID</p>
              <p className="font-medium">{customer?.id || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Name</p>
              <p className="font-medium">{customer?.name || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Customer Type</p>
              <p className="font-medium">{customer?.userType || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Utility Provider</p>
              <p className="font-medium">{customer?.utility || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Finance Company</p>
              <p className="font-medium">{customer?.financeCompany || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Address</p>
              <p className="font-medium">{customer?.address || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Date Registered</p>
              <p className="font-medium">{formatDate(customer?.date)}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Status</p>
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
              <p className={labelClass}>Total Facilities</p>
              <p className="font-medium">{facilities.length}</p>
            </div>
            <div className="space-y-1">
              <p className={labelClass}>Active Facilities</p>
              <p className="font-medium">{facilities.filter(f => f.status === 'VERIFIED' || f.status === 'ACTIVE').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 w-full max-w-7xl">
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