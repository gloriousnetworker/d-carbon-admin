import React, { useState } from "react";
import { Eye, Download, Loader2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
    case "Required": 
    case "REQUIRED": 
      return "bg-[#F2F2F2] text-gray-500";
    default: return "bg-gray-100 text-gray-500";
  }
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

  const mandatoryDocsApproved = docList
    .filter(doc => doc.mandatory)
    .every(doc => doc.status === "APPROVED");

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

      const endpoint = `https://services.dcarbon.solutions/api/admin/residential-facility/${facility.id}/document/${currentDocument.type}/status`;
      
      const requestBody = {
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
        const successMessage = actionType === "APPROVE" 
          ? `${currentDocument.name} approved successfully` 
          : `${currentDocument.name} rejected successfully`;
        
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
              {actionType === "APPROVE" ? "Approve Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "APPROVE" 
                ? `Are you sure you want to approve ${currentDocument?.name}?`
                : `Please provide a reason for rejecting ${currentDocument?.name}`}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === "REJECT" && (
            <div className="py-4">
              <Input
                placeholder="Enter rejection reason (required)"
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
                (actionType === "REJECT" && !rejectionReason.trim())
              }
              className={actionType === "APPROVE" ? "bg-[#039994] hover:bg-[#02857f]" : "bg-red-500 hover:bg-red-600"}
            >
              {approvingDoc === `${facility?.id}-${currentDocument?.type}` ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionType === "APPROVE" ? "Approve" : "Reject"}
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
            <h5 className="text-md font-semibold text-[#039994] mb-3">Facility Documents</h5>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-50 p-3 border-b text-sm">
                <div className="col-span-5 font-medium">Document Name</div>
                <div className="col-span-3 font-medium">File</div>
                <div className="col-span-2 font-medium">Status</div>
                <div className="col-span-2 font-medium">Actions</div>
              </div>
              
              {docList.map((doc, index) => {
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
                                  onClick={() => openPdfModal(doc.url, doc)}
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
                          doc.status
                        )}
                      </span>
                    </div>
                    
                    <div className="col-span-2 flex gap-2">
                      {doc.url && (doc.status === "SUBMITTED" || doc.status === "REJECTED") && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs" 
                            onClick={() => openStatusModal("APPROVE", doc)} 
                            disabled={isApproving}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-red-50 text-red-600 hover:bg-red-100" 
                            onClick={() => openStatusModal("REJECT", doc)}
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
    </>
  );
}