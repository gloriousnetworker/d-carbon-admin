import React, { useState, useRef } from "react";
import { Eye, Download, Upload, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import CONFIG from "../../../../../../lib/config";

const DOCUMENT_TYPES = {
  wregisAssignment: { 
    name: "WREGIS Assignment of Registration Rights", 
    type: "wregisAssignment",
    urlField: "wregisAssignmentUrl",
    statusField: "wregisAssignmentStatus",
    rejectionField: "wregisAssignmentRejectionReason",
    mandatory: true
  },
  financeAgreement: { 
    name: "Finance Agreement/PPA", 
    type: "financeAgreement",
    urlField: "financeAgreementUrl",
    statusField: "financeAgreementStatus",
    rejectionField: "financeAgreementRejectionReason",
    mandatory: false
  },
  solarInstallationContract: { 
    name: "Solar Installation Contract", 
    type: "solarInstallationContract",
    urlField: "solarInstallationContractUrl",
    statusField: "solarInstallationStatus",
    rejectionField: "solarInstallationRejectionReason",
    mandatory: true
  },
  utilityPtoLetter: { 
    name: "Utility PTO Email/Letter", 
    type: "ptoLetter",
    urlField: "ptoLetterUrl",
    statusField: "ptoLetterStatus",
    rejectionField: "ptoLetterRejectionReason",
    mandatory: true
  },
  installationSitePlan: { 
    name: "Installation Site Plan", 
    type: "sitePlan",
    urlField: "sitePlanUrl",
    statusField: "sitePlanStatus",
    rejectionField: "sitePlanRejectionReason",
    mandatory: true
  },
  panelInverterDataSheet: { 
    name: "Panel/Inverter Data Sheet", 
    type: "panelInverterDatasheet",
    urlField: "panelInverterDatasheetUrl",
    statusField: "panelInverterDatasheetStatus",
    rejectionField: "panelInverterDatasheetRejectionReason",
    mandatory: false
  },
  revenueMeterDataSheet: { 
    name: "Revenue Meter Data Sheet", 
    type: "revenueMeterData",
    urlField: "revenueMeterDataUrl",
    statusField: "revenueMeterDataStatus",
    rejectionField: "revenueMeterDataRejectionReason",
    mandatory: false
  },
  utilityMeterPhoto: { 
    name: "Utility/Revenue Meter Photo w/Serial ID", 
    type: "utilityMeterPhoto",
    urlField: "utilityMeterPhotoUrl",
    statusField: "utilityMeterPhotoStatus",
    rejectionField: "utilityMeterPhotoRejectionReason",
    mandatory: true
  },
  singleLineDiagram: {
    name: "Single Line Diagram",
    type: "singleLineDiagram",
    urlField: "singleLineDiagramUrl",
    statusField: "singleLineDiagramStatus",
    rejectionField: "singleLineDiagramRejectionReason",
    mandatory: true
  },
  assignmentOfRegistrationRight: {
    name: "Assignment of Registration Right",
    type: "assignmentOfRegistrationRight",
    urlField: "assignmentOfRegistrationRightUrl",
    statusField: "assignmentOfRegistrationRightStatus",
    rejectionField: "assignmentOfRegistrationRightRejectionReason",
    mandatory: true
  },
  acknowledgementOfStationService: {
    name: "Acknowledgement of Station Service",
    type: "acknowledgementOfStationService",
    urlField: "acknowledgementOfStationServiceUrl",
    statusField: "acknowledgementOfStationServiceStatus",
    rejectionField: "acknowledgementOfStationServiceRejectionReason",
    mandatory: true
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED": return "bg-[#DEF5F4] text-[#039994]";
    case "PENDING": return "bg-[#FFF8E6] text-[#FFB200]";
    case "REJECTED": return "bg-[#FFEBEB] text-[#FF0000]";
    case "SUBMITTED": return "bg-[#E6F0FF] text-[#0062FF]";
    case "WREGIS_SUBMITTED": return "bg-[#E8E0F0] text-[#7C3AED]";
    case "REGULATOR_APPROVED": return "bg-[#D1FAE5] text-[#065F46]";
    case "REGULATOR_REJECTED": return "bg-[#FEE2E2] text-[#991B1B]";
    case "Required":
    case "REQUIRED":
      return "bg-[#F2F2F2] text-gray-500";
    default: return "bg-gray-100 text-gray-500";
  }
};

const isInRegulatorTrack = (status) => {
  return ["APPROVED", "WREGIS_SUBMITTED", "REGULATOR_APPROVED", "REGULATOR_REJECTED"].includes(status);
};

const StatusBadge = ({ status }) => {
  let classes = "";
  switch (status) {
    case "ACTIVE":
    case "VERIFIED":
      classes = "bg-teal-500 text-white";
      break;
    case "PENDING":
      classes = "bg-amber-400 text-white";
      break;
    case "TERMINATED":
      classes = "bg-red-500 text-white";
      break;
    case "INACTIVE":
      classes = "bg-gray-400 text-white";
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

const formatDate = (dateString) => {
  if (!dateString || dateString === "Not specified") return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DocumentsModal({ facility, documents, onVerifyFacility, verifyingFacility, fetchFacilityDocuments }) {
  const [approvingDoc, setApprovingDoc] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentDocument, setCurrentDocument] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadTargetDoc, setUploadTargetDoc] = useState(null);

  // Map doc types to their upload endpoint paths (residential endpoints)
  const docUploadEndpoints = {
    wregisAssignment: "update-wregis-assignment",
    financeAgreement: "update-facility-financial-agreement",
    solarInstallationContract: "update-commercial-solar-installation-contract",
    proofOfAddress: "update-facility-proof-of-address",
    infoReleaseAuth: "update-info-release-auth",
    multipleOwnerDecl: "update-multiple-owner-decl",
    sysOpDataAccess: "update-sys-op-data-access",
    ptoLetter: "update-commercial-pto-letter",
    singleLineDiagram: "update-commercial-single-line-diagram",
    sitePlan: "update-facility-site-plan",
    panelInverterDatasheet: "update-facility-inverter-datasheet",
    revenueMeterData: "update-facility-revenue-meter-data",
    utilityMeterPhoto: "update-commercial-utility-meter-photo",
    assignmentOfRegistrationRight: "update-facility-assignment-of-registration-right",
    acknowledgementOfStationService: "update-acknowledgement-of-station-service",
  };

  const handleUploadClick = (doc) => {
    setUploadTargetDoc(doc);
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetDoc) return;

    const endpoint = docUploadEndpoints[uploadTargetDoc.type];
    if (!endpoint) {
      toast.error("Upload not supported for this document type");
      return;
    }

    setUploadingDoc(`${facility.id}-${uploadTargetDoc.type}`);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/facility/${endpoint}/${facility.id}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${authToken}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed: ${response.status}`);
      }

      toast.success(`${uploadTargetDoc.name} uploaded successfully`);

      // Re-fetch facility documents to reflect the upload
      if (fetchFacilityDocuments) {
        await fetchFacilityDocuments(facility.id);
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploadingDoc(null);
      setUploadTargetDoc(null);
      e.target.value = '';
    }
  };

  if (!facility || !documents) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg font-medium">No documents available</p>
        <p className="text-sm mt-1">This facility has not yet uploaded any documents.</p>
      </div>
    );
  }

  const docList = Object.keys(DOCUMENT_TYPES).map(key => {
    const docType = DOCUMENT_TYPES[key];
    const status = documents[docType.statusField] || (documents[docType.urlField] ? "SUBMITTED" : "REQUIRED");
    return {
      name: docType.name,
      type: docType.type,
      url: documents[docType.urlField],
      status: status,
      rejectionReason: documents[docType.rejectionField],
      mandatory: docType.mandatory
    };
  });

  // A mandatory doc passes verification only after regulator approval.
  // Internal approval (APPROVED) and WREGIS submission are intermediate steps — not sufficient for verification.
  // REGULATOR_REJECTED does NOT pass — the doc was rejected by the regulator and needs attention.
  const docPassesVerification = (status) => status === "REGULATOR_APPROVED";

  const mandatoryDocsApproved = docList
    .filter(doc => doc.mandatory)
    .every(doc => docPassesVerification(doc.status));

  const canVerifyFacility = mandatoryDocsApproved && facility.status !== "VERIFIED";

  const getFileExtension = (url) => {
    if (!url) return '';
    return url.split('.').pop().toLowerCase();
  };

  const renderFileContent = () => {
    if (!currentPdfUrl) return <div className="flex items-center justify-center h-full text-gray-500">No document available</div>;
    
    const extension = getFileExtension(currentPdfUrl);
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return (
        <div className="flex items-center justify-center h-full p-4">
          <img 
            src={currentPdfUrl} 
            alt={currentDocument?.name} 
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{display: 'none'}} className="text-center">
            <p className="text-gray-600">Unable to load image</p>
          </div>
        </div>
      );
    } else if (extension === 'pdf') {
      const pdfViewerUrl = currentPdfUrl.includes('drive.google.com') 
        ? currentPdfUrl.replace('/view', '/preview')
        : `https://docs.google.com/viewer?url=${encodeURIComponent(currentPdfUrl)}&embedded=true`;
      
      return (
        <div className="w-full h-full relative">
          <iframe
            src={pdfViewerUrl}
            className="w-full h-full border-0"
            title={`PDF Viewer - ${currentDocument?.name}`}
            frameBorder="0"
            onError={() => {
              console.error('PDF viewer failed to load');
            }}
          />
          <div className="absolute inset-0 pointer-events-none"></div>
        </div>
      );
    } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(currentPdfUrl)}&embedded=true`;
      
      return (
        <div className="w-full h-full">
          <iframe
            src={viewerUrl}
            className="w-full h-full border-0"
            title={currentDocument?.name}
            frameBorder="0"
          />
        </div>
      );
    } else if (['txt', 'csv', 'json', 'xml'].includes(extension)) {
      return (
        <div className="w-full h-full p-4">
          <iframe
            src={currentPdfUrl}
            className="w-full h-full border border-gray-300 rounded"
            title={currentDocument?.name}
            frameBorder="0"
          />
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">📄</div>
            <p className="text-gray-600 mb-2">Preview not available for this file type</p>
            <p className="text-sm text-gray-500 mb-4">File extension: .{extension}</p>
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentPdfUrl;
                link.download = currentDocument?.name || 'document';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Download File
            </Button>
          </div>
        </div>
      );
    }
  };

  const openPdfModal = (pdfUrl, document) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentDocument(document);
    setPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setPdfModalOpen(false);
    setCurrentPdfUrl("");
    setCurrentDocument(null);
  };

  const openStatusModal = (type, document) => {
    setActionType(type);
    setCurrentDocument(document);
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setRejectionReason("");
    setActionType("");
    setCurrentDocument(null);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = currentPdfUrl;
    link.download = currentDocument?.name || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDocumentStatusChange = async () => {
    if (!facility || !currentDocument) return;
    
    const docKey = `${facility.id}-${currentDocument.type}`;
    setApprovingDoc(docKey);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `${CONFIG.API_BASE_URL}/api/admin/residential-facility/${facility.id}/document/${currentDocument.type}/status`;
      
      const statusMap = {
        "APPROVE": "APPROVED",
        "REJECT": "REJECTED",
        "WREGIS_SUBMIT": "WREGIS_SUBMITTED",
        "REG_APPROVE": "REGULATOR_APPROVED",
        "REG_REJECT": "REGULATOR_REJECTED",
      };

      const requestBody = {
        status: statusMap[actionType] || "APPROVED",
        ...((actionType === "REJECT" || actionType === "REG_REJECT") && {
          rejectionReason: rejectionReason || "No reason provided"
        })
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      closeStatusModal();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await fetchFacilityDocuments(facility.id);
      
      if (data.status === 'success' || response.ok) {
        const actionMessages = {
          APPROVE: `${currentDocument.name} approved successfully`,
          REJECT: `${currentDocument.name} rejected successfully`,
          WREGIS_SUBMIT: `${currentDocument.name} submitted to WREGIS`,
          REG_APPROVE: `${currentDocument.name} marked as regulator approved`,
          REG_REJECT: `${currentDocument.name} marked as regulator rejected`,
        };
        const successMessage = actionMessages[actionType] || `${currentDocument.name} updated successfully`;
        
        if (window.toast && typeof window.toast.success === 'function') {
          window.toast.success(successMessage);
        } else {
          console.log(successMessage);
        }
      }
    } catch (err) {
      console.error('Error updating document status:', err);
      
      const errorMessage = err.message || 'Failed to update document status';
      if (window.toast && typeof window.toast.error === 'function') {
        window.toast.error(errorMessage);
      } else {
        console.error(errorMessage);
      }
      
      await fetchFacilityDocuments(facility.id);
    } finally {
      setApprovingDoc(null);
    }
  };

  return (
    <>
      <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 [&>button]:hidden">
          <DialogHeader className="flex-shrink-0 bg-gray-50 px-6 py-4 border-b">
            <div className="flex justify-between items-center gap-4">
              <DialogTitle className="truncate text-base pr-4 flex-1">
                {currentDocument?.name}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs h-9 px-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <button
                  onClick={closePdfModal}
                  className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none p-1.5 hover:bg-gray-200"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {renderFileContent()}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statusModalOpen} onOpenChange={closeStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "APPROVE" && "Approve Document"}
              {actionType === "REJECT" && "Reject Document"}
              {actionType === "WREGIS_SUBMIT" && "Submit to WREGIS"}
              {actionType === "REG_APPROVE" && "Regulator Approved"}
              {actionType === "REG_REJECT" && "Regulator Rejected"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVE" && `Are you sure you want to internally approve ${currentDocument?.name}?`}
              {actionType === "REJECT" && `Please provide a reason for rejecting ${currentDocument?.name}.`}
              {actionType === "WREGIS_SUBMIT" && `Mark ${currentDocument?.name} as submitted to WREGIS for regulator review.`}
              {actionType === "REG_APPROVE" && `Confirm the regulator has approved ${currentDocument?.name}.`}
              {actionType === "REG_REJECT" && `Provide the regulator's rejection reason for ${currentDocument?.name}.`}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "REJECT" || actionType === "REG_REJECT") && (
            <div className="py-4">
              <Input
                placeholder={actionType === "REG_REJECT" ? "Enter regulator rejection reason" : "Enter rejection reason (required)"}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeStatusModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleDocumentStatusChange}
              disabled={
                approvingDoc === `${facility?.id}-${currentDocument?.type}` ||
                ((actionType === "REJECT" || actionType === "REG_REJECT") && !rejectionReason.trim())
              }
              className={
                actionType === "REJECT" || actionType === "REG_REJECT"
                  ? "bg-red-500 hover:bg-red-600"
                  : actionType === "WREGIS_SUBMIT"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-[#039994] hover:bg-[#02857f]"
              }
            >
              {approvingDoc === `${facility?.id}-${currentDocument?.type}` ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionType === "APPROVE" && "Approve"}
              {actionType === "REJECT" && "Reject"}
              {actionType === "WREGIS_SUBMIT" && "Submit to WREGIS"}
              {actionType === "REG_APPROVE" && "Confirm Approved"}
              {actionType === "REG_REJECT" && "Confirm Rejected"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!pdfModalOpen && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-[#039994]">{facility.facilityName}</h4>
              <p className="text-sm text-gray-600">{facility.address}</p>
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
                <p className="text-sm text-gray-500">Meter ID</p>
                <p className="font-medium">{facility.meterId || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Finance Type</p>
                <p className="font-medium capitalize">{facility.financeType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Installer</p>
                <p className="font-medium capitalize">{facility.installer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">WREGIS ID</p>
                <p className="font-medium">{facility.wregisId || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">System Capacity</p>
                <p className="font-medium">{facility.systemCapacity}</p>
              </div>
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
            </div>
          </div>

          <div>
            {/* Document summary bar */}
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-md font-semibold text-[#039994]">Facility Documents</h5>
              <div className="flex items-center gap-3 text-xs font-sfpro">
                <span className="text-gray-500">
                  {docList.filter(d => d.url).length}/{docList.length} uploaded
                </span>
                <span className="text-[#039994]">
                  {docList.filter(d => isInRegulatorTrack(d.status)).length} approved
                </span>
                {docList.some(d => !d.url) && (
                  <span className="text-amber-500">
                    {docList.filter(d => !d.url).length} missing
                  </span>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 p-3 border-b text-xs font-medium text-gray-600 uppercase tracking-wide">
                <div className="col-span-3">Document</div>
                <div className="col-span-2">File</div>
                <div className="col-span-2">Internal Status</div>
                <div className="col-span-2">Regulator Status</div>
                <div className="col-span-3">Actions</div>
              </div>
              
              {docList.map((doc, index) => {
                const docKey = `${facility.id}-${doc.type}`;
                const isApproving = approvingDoc === docKey;
                const inRegTrack = isInRegulatorTrack(doc.status);

                return (
                  <div key={index} className={`grid grid-cols-12 p-3 border-b last:border-b-0 items-center text-sm ${!doc.url ? "bg-amber-50" : ""}`}>
                    <div className="col-span-3">
                      <p className="font-medium text-xs">{doc.name}</p>
                      {(doc.status === "REJECTED" || doc.status === "REGULATOR_REJECTED") && doc.rejectionReason && (
                        <p className="text-xs text-red-500 mt-0.5 leading-tight">Reason: {doc.rejectionReason}</p>
                      )}
                      {!doc.url && (
                        <p className="text-xs text-amber-500 mt-0.5">Not yet uploaded by user</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      {doc.url ? (
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openPdfModal(doc.url, doc)} disabled={isApproving}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>View</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.url;
                                  link.download = doc.name;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }} disabled={isApproving}>
                                  <Download className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Download</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>

                    <div className="col-span-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(inRegTrack ? "APPROVED" : doc.status)}`}>
                        {isApproving ? (
                          <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" /> ...</span>
                        ) : inRegTrack ? "Approved" : (doc.status || "Not Uploaded")}
                      </span>
                    </div>

                    <div className="col-span-2">
                      {inRegTrack ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status === "APPROVED" ? "Pending" : doc.status === "WREGIS_SUBMITTED" ? "Submitted" : doc.status === "REGULATOR_APPROVED" ? "Approved" : "Rejected"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>

                    <div className="col-span-3 flex flex-wrap gap-1">
                      {/* Upload button — for docs not yet uploaded or rejected */}
                      {(!doc.url || doc.status === "REJECTED" || doc.status === "REGULATOR_REJECTED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs px-3 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          onClick={() => handleUploadClick(doc)}
                          disabled={uploadingDoc === `${facility.id}-${doc.type}`}
                        >
                          {uploadingDoc === `${facility.id}-${doc.type}` ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Upload className="h-3 w-3 mr-1" />
                          )}
                          Upload
                        </Button>
                      )}
                      {doc.url && !inRegTrack && doc.status !== "APPROVED" && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 text-xs px-3" onClick={() => openStatusModal("APPROVE", doc)} disabled={isApproving}>Approve</Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => openStatusModal("REJECT", doc)} disabled={isApproving}>Reject</Button>
                        </>
                      )}
                      {doc.status === "APPROVED" && (
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-purple-50 text-purple-700 hover:bg-purple-100" onClick={() => openStatusModal("WREGIS_SUBMIT", doc)} disabled={isApproving}>Submit to WREGIS</Button>
                      )}
                      {doc.status === "WREGIS_SUBMITTED" && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-green-50 text-green-700 hover:bg-green-100" onClick={() => openStatusModal("REG_APPROVE", doc)} disabled={isApproving}>Regulator Approved</Button>
                          <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => openStatusModal("REG_REJECT", doc)} disabled={isApproving}>Regulator Rejected</Button>
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
              <Button 
                onClick={() => onVerifyFacility(facility)} 
                disabled={verifyingFacility === facility.id} 
                className="bg-[#039994] hover:bg-[#02857f]"
              >
                {verifyingFacility === facility.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {verifyingFacility === facility.id ? "Processing..." : "Verify Facility"}
              </Button>
            </div>
          )}
        </div>
      )}
      {/* Hidden file input for document uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
      />
    </>
  );
}