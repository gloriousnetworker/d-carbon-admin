import React, { useState } from "react";
import { Eye, Download, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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

  const handleDocumentStatusChange = async () => {
    if (!facility || !currentDocument) return;

    const docKey = `${facility.id}-${currentDocument.type}`;
    setApprovingDoc(docKey);

    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `https://services.dcarbon.solutions/api/admin/commercial-facility/${facility.id}/document/${currentDocument.type}/status`;

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
          ...facility,
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

  return (
    <>
      <Dialog open={pdfModalOpen} onOpenChange={closePdfModal}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>
                {currentDocument?.name} - {facility.facilityName}
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
              disabled={approvingDoc === `${facility?.id}-${currentDocument?.type}` || (actionType === "REJECT" && !rejectionReason)}
              className={actionType === "APPROVE" ? "bg-[#039994] hover:bg-[#02857f]" : "bg-red-500 hover:bg-red-600"}
            >
              {approvingDoc === `${facility?.id}-${currentDocument?.type}` ? (
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