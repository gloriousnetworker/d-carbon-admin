import React, { useState } from "react";
import { Eye, Download, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import CONFIG from "../../../../../../lib/config";

const getStatusColor = (status) => {
  switch (status) {
    case "APPROVED": return "bg-[#DEF5F4] text-[#039994]";
    case "PENDING": return "bg-[#FFF8E6] text-[#FFB200]";
    case "REJECTED": return "bg-[#FFEBEB] text-[#FF0000]";
    case "SUBMITTED": return "bg-[#E6F7FF] text-[#1890FF]";
    case "WREGIS_SUBMITTED": return "bg-[#E8E0F0] text-[#7C3AED]";
    case "REGULATOR_APPROVED": return "bg-[#D1FAE5] text-[#065F46]";
    case "REGULATOR_REJECTED": return "bg-[#FEE2E2] text-[#991B1B]";
    case "Required":
    case "REQUIRED":
      return "bg-[#F2F2F2] text-gray-500";
    default: return "bg-gray-100 text-gray-500";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "APPROVED": return "Internal Approved";
    case "REJECTED": return "Internal Rejected";
    case "SUBMITTED":
    case "PENDING": return "Pending Review";
    case "WREGIS_SUBMITTED": return "Submitted to WREGIS";
    case "REGULATOR_APPROVED": return "Regulator Approved";
    case "REGULATOR_REJECTED": return "Regulator Rejected";
    case "Required":
    case "REQUIRED":
    default: return status || "Not Uploaded";
  }
};

// Determine if a doc is in the regulator track (internally approved, ready for WREGIS)
const isInRegulatorTrack = (status) => {
  return ["APPROVED", "WREGIS_SUBMITTED", "REGULATOR_APPROVED", "REGULATOR_REJECTED"].includes(status);
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

const formatDate = (dateString) => {
  if (!dateString || dateString === "Not specified") return "Not specified";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function DocumentsModal({ facility, onVerifyFacility, verifyingFacility, updateFacilityFromResponse }) {
  const [approvingDoc, setApprovingDoc] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentDocument, setCurrentDocument] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState("");

  if (!facility) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-lg font-medium">No documents available</p>
        <p className="text-sm mt-1">This facility has not yet uploaded any documents.</p>
      </div>
    );
  }

  const documents = [
    { name: "WREGIS Assignment",                  url: facility.wregisAssignmentUrl,               status: facility.wregisAssignmentStatus,               type: "wregisAssignment",               rejectionReason: facility.wregisAssignmentRejectionReason,               mandatory: true  },
    { name: "Finance Agreement",                  url: facility.financeAgreementUrl,               status: facility.financeAgreementStatus,               type: "financeAgreement",               rejectionReason: facility.financeAgreementRejectionReason,               mandatory: false },
    { name: "Solar Installation Contract",        url: facility.solarInstallationContractUrl,      status: facility.solarInstallationContractStatus,      type: "solarInstallationContract",      rejectionReason: facility.solarInstallationContractRejectionReason,      mandatory: true  },
    { name: "Utility Interconnection Agreement",  url: facility.interconnectionAgreementUrl,       status: facility.interconnectionAgreementStatus,       type: "interconnectionAgreement",       rejectionReason: facility.interconnectionAgreementRejectionReason,       mandatory: false },
    { name: "Utility PTO Letter",                 url: facility.ptoLetterUrl,                      status: facility.ptoLetterStatus,                      type: "ptoLetter",                      rejectionReason: facility.ptoLetterRejectionReason,                      mandatory: true  },
    { name: "Single Line Diagram",                url: facility.singleLineDiagramUrl,              status: facility.singleLineDiagramStatus,              type: "singleLineDiagram",              rejectionReason: facility.singleLineDiagramRejectionReason,              mandatory: true  },
    { name: "Installation Site Plan",             url: facility.sitePlanUrl,                       status: facility.sitePlanStatus,                       type: "sitePlan",                       rejectionReason: facility.sitePlanRejectionReason,                       mandatory: true  },
    { name: "Panel/Inverter Datasheet",           url: facility.panelInverterDatasheetUrl,         status: facility.panelInverterDatasheetStatus,         type: "panelInverterDatasheet",         rejectionReason: facility.panelInverterDatasheetRejectionReason,         mandatory: false },
    { name: "Revenue Meter Datasheet",            url: facility.revenueMeterDataUrl,               status: facility.revenueMeterDataStatus,               type: "revenueMeterData",               rejectionReason: facility.revenueMeterDataRejectionReason,               mandatory: false },
    { name: "Utility Meter Photo",                url: facility.utilityMeterPhotoUrl,              status: facility.utilityMeterPhotoStatus,              type: "utilityMeterPhoto",              rejectionReason: facility.utilityMeterPhotoRejectionReason,              mandatory: true  },
    { name: "Assignment of Registration Right",   url: facility.assignmentOfRegistrationRightUrl,  status: facility.assignmentOfRegistrationRightStatus,  type: "assignmentOfRegistrationRight",  rejectionReason: facility.assignmentOfRegistrationRightRejectionReason,  mandatory: true  },
    { name: "Acknowledgement of Station Service", url: facility.acknowledgementOfStationServiceUrl, status: facility.acknowledgementOfStationServiceStatus, type: "acknowledgementOfStationService", rejectionReason: facility.acknowledgementOfStationServiceRejectionReason, mandatory: true  },
  ];

  // A mandatory document passes verification if it has been internally approved (APPROVED)
  // or has already progressed further into the WREGIS track (WREGIS_SUBMITTED / REGULATOR_APPROVED).
  // Optional documents (Finance Agreement, Interconnection Agreement, Panel Datasheet, Revenue Datasheet)
  // are displayed but never block facility verification.
  const docPassesVerification = (status) =>
    ["APPROVED", "WREGIS_SUBMITTED", "REGULATOR_APPROVED"].includes(status);

  const mandatoryDocsApproved = documents
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

      const endpoint = `${CONFIG.API_BASE_URL}/api/admin/commercial-facility/${facility.id}/document/${currentDocument.type}/status`;

      const statusMap = {
        "APPROVE": "APPROVED",
        "REJECT": "REJECTED",
        "WREGIS_SUBMIT": "WREGIS_SUBMITTED",
        "REG_APPROVE": "REGULATOR_APPROVED",
        "REG_REJECT": "REGULATOR_REJECTED",
      };

      const body = {
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
          "panelInverterDatasheet": "panelInverterDatasheetStatus",
          "revenueMeterData": "revenueMeterDataStatus",
          "utilityMeterPhoto": "utilityMeterPhotoStatus",
          "assignmentOfRegistrationRight": "assignmentOfRegistrationRightStatus",
          "acknowledgementOfStationService": "acknowledgementOfStationServiceStatus"
        };

        const rejectionFieldMap = {
          "wregisAssignment": "wregisAssignmentRejectionReason",
          "financeAgreement": "financeAgreementRejectionReason",
          "solarInstallationContract": "solarInstallationContractRejectionReason",
          "interconnectionAgreement": "interconnectionAgreementRejectionReason",
          "ptoLetter": "ptoLetterRejectionReason",
          "singleLineDiagram": "singleLineDiagramRejectionReason",
          "sitePlan": "sitePlanRejectionReason",
          "panelInverterDatasheet": "panelInverterDatasheetRejectionReason",
          "revenueMeterData": "revenueMeterDataRejectionReason",
          "utilityMeterPhoto": "utilityMeterPhotoRejectionReason",
          "assignmentOfRegistrationRight": "assignmentOfRegistrationRightRejectionReason",
          "acknowledgementOfStationService": "acknowledgementOfStationServiceRejectionReason"
        };

        const updatedFacility = {
          ...facility,
          [statusFieldMap[currentDocument.type]]: statusMap[actionType],
          ...((actionType === "REJECT" || actionType === "REG_REJECT") && {
            [rejectionFieldMap[currentDocument.type]]: rejectionReason || "No reason provided"
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

  return (
    <>
      <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
        <DialogContent className="max-w-5xl h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 bg-gray-50 p-4 -m-6 mb-4 rounded-t-lg">
            <DialogTitle className="flex justify-between items-center">
              <span className="truncate">
                {currentDocument?.name} - {facility.facilityName}
              </span>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-gray-100 -mx-6 -mb-6 rounded-b-lg">
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
              {actionType === "APPROVE" && "Are you sure you want to internally approve this document?"}
              {actionType === "REJECT" && "Please provide a reason for rejecting this document."}
              {actionType === "WREGIS_SUBMIT" && "Mark this document as submitted to WREGIS for regulator review."}
              {actionType === "REG_APPROVE" && "Confirm the regulator has approved this document."}
              {actionType === "REG_REJECT" && "Provide the regulator's rejection reason for this document."}
            </DialogDescription>
          </DialogHeader>

          {(actionType === "REJECT" || actionType === "REG_REJECT") && (
            <div className="py-4">
              <Input
                placeholder={actionType === "REG_REJECT" ? "Enter regulator rejection reason" : "Enter rejection reason"}
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
              disabled={approvingDoc === `${facility?.id}-${currentDocument?.type}` || ((actionType === "REJECT" || actionType === "REG_REJECT") && !rejectionReason)}
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
              ) : actionType === "APPROVE" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              {actionType === "APPROVE" && "Approve"}
              {actionType === "REJECT" && "Reject"}
              {actionType === "WREGIS_SUBMIT" && "Submit to WREGIS"}
              {actionType === "REG_APPROVE" && "Confirm Approved"}
              {actionType === "REG_REJECT" && "Confirm Rejected"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          {/* Document summary bar */}
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-md font-semibold text-[#039994]">Facility Documents</h5>
            <div className="flex items-center gap-3 text-xs font-sfpro">
              <span className="text-gray-500">
                {documents.filter(d => d.url).length}/{documents.length} uploaded
              </span>
              <span className="text-[#039994]">
                {documents.filter(d => d.status === "APPROVED" || d.status === "WREGIS_SUBMITTED" || d.status === "REGULATOR_APPROVED").length} approved
              </span>
              {documents.some(d => !d.url) && (
                <span className="text-amber-500">
                  {documents.filter(d => !d.url).length} missing
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

            {documents.map((doc, index) => {
              const docKey = `${facility.id}-${doc.type}`;
              const isApproving = approvingDoc === docKey;
              const inRegTrack = isInRegulatorTrack(doc.status);

              return (
                <div key={index} className={`grid grid-cols-12 p-3 border-b last:border-b-0 items-center text-sm ${!doc.url ? "bg-amber-50" : ""}`}>
                  {/* Document name + rejection reason */}
                  <div className="col-span-3">
                    <p className="font-medium text-xs">{doc.name}</p>
                    {(doc.status === "REJECTED" || doc.status === "REGULATOR_REJECTED") && doc.rejectionReason && (
                      <p className="text-xs text-red-500 mt-0.5 leading-tight">Reason: {doc.rejectionReason}</p>
                    )}
                    {!doc.url && (
                      <p className="text-xs text-amber-500 mt-0.5">Not yet uploaded by user</p>
                    )}
                  </div>

                  {/* File view/download */}
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

                  {/* Internal Status */}
                  <div className="col-span-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(
                      inRegTrack ? "APPROVED" : doc.status
                    )}`}>
                      {isApproving ? (
                        <span className="flex items-center gap-1">
                          <Loader2 className="h-2.5 w-2.5 animate-spin" /> ...
                        </span>
                      ) : inRegTrack ? (
                        "Approved"
                      ) : (
                        doc.status || "Not Uploaded"
                      )}
                    </span>
                  </div>

                  {/* Regulator Status */}
                  <div className="col-span-2">
                    {inRegTrack ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(doc.status)}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex flex-wrap gap-1">
                    {/* Internal approve/reject — only for uploaded docs not yet internally approved */}
                    {doc.url && !inRegTrack && doc.status !== "APPROVED" && (
                      <>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3" onClick={() => openStatusModal("APPROVE", doc)} disabled={isApproving}>
                          Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => openStatusModal("REJECT", doc)} disabled={isApproving}>
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Regulator track actions — only for internally approved docs */}
                    {doc.status === "APPROVED" && (
                      <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-purple-50 text-purple-700 hover:bg-purple-100" onClick={() => openStatusModal("WREGIS_SUBMIT", doc)} disabled={isApproving}>
                        Submit to WREGIS
                      </Button>
                    )}
                    {doc.status === "WREGIS_SUBMITTED" && (
                      <>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-green-50 text-green-700 hover:bg-green-100" onClick={() => openStatusModal("REG_APPROVE", doc)} disabled={isApproving}>
                          Regulator Approved
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3 bg-red-50 text-red-600 hover:bg-red-100" onClick={() => openStatusModal("REG_REJECT", doc)} disabled={isApproving}>
                          Regulator Rejected
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
            <Button onClick={() => onVerifyFacility(facility.id)} disabled={verifyingFacility === facility.id} className="bg-[#039994] hover:bg-[#02857f]">
              {verifyingFacility === facility.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {verifyingFacility === facility.id ? "Verifying..." : "Verify Facility"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}