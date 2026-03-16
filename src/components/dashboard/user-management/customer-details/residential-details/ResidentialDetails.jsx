import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, Upload, Loader2, CheckCircle, Package, FileSpreadsheet } from "lucide-react";
import { exportDocumentPackage, downloadDocumentsIndividually } from "@/lib/documentExport";
import { exportWregisCoverSheet, exportPreApprovalWorksheet } from "@/lib/exportUtils";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import DocumentsModal from "./DocumentsModal";
import CONFIG from "../../../../../../lib/config";

export default function ResidentialDetails({ customer, onBack }) {
  const [customerDetails, setCustomerDetails] = useState(customer);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [facilitiesError, setFacilitiesError] = useState(null);
  const [facilityDocuments, setFacilityDocuments] = useState({});
  const [verifyingFacility, setVerifyingFacility] = useState(null);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [wregisModalOpen, setWregisModalOpen] = useState(false);
  const [wregisForm, setWregisForm] = useState({
    wregisEligibilityDate: "",
    wregisId: "",
    rpsId: ""
  });
  const [updatingWregis, setUpdatingWregis] = useState(false);
  const [uploadingAck, setUploadingAck] = useState(null);
  const [downloadingDocs, setDownloadingDocs] = useState(null);
  const [currentFacility, setCurrentFacility] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (customer?.id) {
      fetchFacilities();
      fetchCustomerDetails();
    }
  }, [customer?.id]);

  const fetchCustomerDetails = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const email = customer?.email;
      if (!authToken || !email) return;
      const res = await fetch(
        `${CONFIG.API_BASE_URL}/api/admin/customer/${encodeURIComponent(email.trim())}`,
        { headers: { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" } }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.status === "success" && json.data) {
          setCustomerDetails(prev => ({ ...prev, ...json.data }));
        }
      }
    } catch {
      // Non-critical — fall back to the passed customer prop
    }
  };

  const fetchFacilities = async () => {
    setFacilitiesLoading(true);
    setFacilitiesError(null);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/residential-facility/get-user-facilities/${customer.id}`,
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

  const fetchFacilityDocuments = async (facilityId) => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const response = await fetch(
        `${CONFIG.API_BASE_URL}/api/residential-facility/residential-docs/${facilityId}`,
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
      if (data.status === 'success' && data.data) {
        setFacilityDocuments(prev => ({
          ...prev,
          [facilityId]: {
            ...data.data,
            solarInstallationContractStatus: data.data.solarInstallationContractStatus || (data.data.solarInstallationContractUrl ? "SUBMITTED" : "REQUIRED")
          }
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch facility documents');
      }
    } catch (err) {
      console.error(`Error fetching documents for facility ${facilityId}:`, err);
      toast.error(`Failed to load documents for facility ${facilityId}`);
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

  const openVerifyModal = (facility) => {
    setCurrentFacility(facility);
    setVerifyModalOpen(true);
  };

  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    setCurrentFacility(null);
  };

  const openFacilityModal = (facility) => {
    setCurrentFacility(facility);
    if (!facilityDocuments[facility.id]) {
      fetchFacilityDocuments(facility.id);
    }
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

  const openAckModal = (facility) => {
    setCurrentFacility(facility);
    setSelectedFile(null);
    setAckModalOpen(true);
  };

  const closeAckModal = () => {
    setAckModalOpen(false);
    setCurrentFacility(null);
    setSelectedFile(null);
  };

  const handleVerifyFacility = async () => {
    if (!currentFacility) return;
    
    setVerifyingFacility(currentFacility.id);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const endpoint = `${CONFIG.API_BASE_URL}/api/admin/residential-facility/${currentFacility.id}/verify`;

      const requestBody = {
        status: "VERIFIED"
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
      if (data.status === 'success') {
        toast.success(data.message);
        fetchFacilities();
        closeVerifyModal();
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

      const endpoint = `${CONFIG.API_BASE_URL}/api/admin/update-residential-wregis-info/${currentFacility.id}`;

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
        fetchFacilities();
        closeWregisModal();
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

  const handleAckUpload = async () => {
    if (!currentFacility || !selectedFile) return;
    
    setUploadingAck(currentFacility.id);
    
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = `${CONFIG.API_BASE_URL}/api/admin/residential-docs/acknowledgement-of-station-service/${currentFacility.id}`;

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
        fetchFacilityDocuments(currentFacility.id);
        closeAckModal();
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

  const handleDownloadDocPackage = async (facility) => {
    setDownloadingDocs(facility.id);
    try {
      // Ensure docs are loaded
      let docs = facilityDocuments[facility.id];
      if (!docs) {
        await fetchFacilityDocuments(facility.id);
        // Wait briefly for state update
        await new Promise((r) => setTimeout(r, 300));
        docs = facilityDocuments[facility.id] || {};
      }

      const DOCUMENT_TYPES = [
        { name: "WREGIS Assignment", urlField: "wregisAssignmentUrl", statusField: "wregisAssignmentStatus" },
        { name: "Finance Agreement", urlField: "financeAgreementUrl", statusField: "financeAgreementStatus" },
        { name: "Solar Installation Contract", urlField: "solarInstallationContractUrl", statusField: "solarInstallationStatus" },
        { name: "Utility PTO Letter", urlField: "ptoLetterUrl", statusField: "ptoLetterStatus" },
        { name: "Installation Site Plan", urlField: "sitePlanUrl", statusField: "sitePlanStatus" },
        { name: "Panel Inverter Datasheet", urlField: "panelInverterDatasheetUrl", statusField: "panelInverterDatasheetStatus" },
        { name: "Revenue Meter Datasheet", urlField: "revenueMeterDataUrl", statusField: "revenueMeterDataStatus" },
        { name: "Utility Meter Photo", urlField: "utilityMeterPhotoUrl", statusField: "utilityMeterPhotoStatus" },
        { name: "Single Line Diagram", urlField: "singleLineDiagramUrl", statusField: "singleLineDiagramStatus" },
        { name: "Assignment of Registration Right", urlField: "assignmentOfRegistrationRightUrl", statusField: "assignmentOfRegistrationRightStatus" },
        { name: "Acknowledgement of Station Service", urlField: "acknowledgementOfStationServiceUrl", statusField: "acknowledgementOfStationServiceStatus" },
      ];

      const documents = DOCUMENT_TYPES.map((dt) => ({
        name: dt.name,
        url: docs[dt.urlField],
        status: docs[dt.statusField] || (docs[dt.urlField] ? "SUBMITTED" : "REQUIRED"),
      }));

      const result = await exportDocumentPackage(documents, {
        facilityName: facility.facilityName,
        address: facility.address,
        id: facility.id,
        ownerName: customer?.name,
      });

      if (result.corsFallback) {
        const opened = downloadDocumentsIndividually(documents);
        toast.success(`Opening ${opened} document(s) in new tabs for individual download.`);
      } else if (result.failed > 0) {
        toast.error(`Package downloaded. ${result.failed} document(s) failed — see placeholder files in ZIP.`);
      } else {
        toast.success(`Document package downloaded (${result.success} files)`);
      }
    } catch (err) {
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setDownloadingDocs(null);
    }
  };

  const FacilityCard = ({ facility }) => {
    const hasAckDocument = facilityDocuments[facility.id]?.acknowledgementOfStationServiceUrl;
    
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
            <p className="text-sm text-gray-500">Meter ID</p>
            <p className="font-medium">{facility.meterId || 'Not specified'}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openAckModal(facility);
            }}
            className={`${hasAckDocument ? "bg-green-100 text-green-700 border-green-300" : "text-[#039994] border-[#039994] hover:bg-[#03999410]"}`}
          >
            {hasAckDocument ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Uploaded Ack of Station Service
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                Upload Ack of Station Service
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadDocPackage(facility);
            }}
            disabled={downloadingDocs === facility.id}
            className="text-[#039994] border-[#039994] hover:bg-[#03999410]"
          >
            {downloadingDocs === facility.id ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-1" />
                Download Docs
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              exportWregisCoverSheet(facility, customer, facility.documentation || facility.residentialDocumentation, "residential");
            }}
            className="text-[#039994] border-[#039994] hover:bg-[#03999410]"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            WREGIS Cover Sheet
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex flex-col py-8 px-4 bg-white">
      <Dialog open={verifyModalOpen} onOpenChange={closeVerifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Facility</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify this facility?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeVerifyModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyFacility}
              disabled={verifyingFacility === currentFacility?.id}
              className="bg-[#039994] hover:bg-[#02857f]"
            >
              {verifyingFacility === currentFacility?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Verify Facility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={facilityModalOpen} onOpenChange={closeFacilityModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Facility Details</DialogTitle>
          </DialogHeader>
          {currentFacility && (
            <DocumentsModal 
              facility={currentFacility}
              documents={facilityDocuments[currentFacility.id] || {}}
              onVerifyFacility={openVerifyModal}
              verifyingFacility={verifyingFacility}
              fetchFacilityDocuments={fetchFacilityDocuments}
            />
          )}
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
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">WREGIS Eligibility Date</label>
              <Input
                type="date"
                value={wregisForm.wregisEligibilityDate}
                onChange={(e) => setWregisForm({...wregisForm, wregisEligibilityDate: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
              />
            </div>
            <div>
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">WREGIS ID</label>
              <Input
                type="text"
                value={wregisForm.wregisId}
                onChange={(e) => setWregisForm({...wregisForm, wregisId: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
                placeholder="Enter WREGIS ID"
              />
            </div>
            <div>
              <label className="block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]">RPS ID</label>
              <Input
                type="text"
                value={wregisForm.rpsId}
                onChange={(e) => setWregisForm({...wregisForm, rpsId: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]"
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

      <Dialog open={ackModalOpen} onOpenChange={closeAckModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Acknowledgement of Station Service</DialogTitle>
            <DialogDescription>
              Upload document for {currentFacility?.facilityName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAckModal}>
              Cancel
            </Button>
            <Button
              onClick={handleAckUpload}
              disabled={!selectedFile || uploadingAck === currentFacility?.id}
              className="bg-[#039994] hover:bg-[#02857f]"
            >
              {uploadingAck === currentFacility?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {uploadingAck === currentFacility?.id ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <button className="flex items-center text-[#039994] hover:text-[#02857f] pl-0" onClick={onBack}>
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Customer Details</span>
        </button>
        {facilities.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportPreApprovalWorksheet(facilities)}
            className="text-[#039994] border-[#039994] hover:bg-[#03999410]"
          >
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Export Pre-Approval Worksheet
          </Button>
        )}
      </div>

      {/* ─── Registration Progress ───────────────────────────── */}
      {(() => {
        const status = (customerDetails?.status || customer?.status || "Invited").toLowerCase();
        const hasAgreement = !!(customerDetails?.agreementSigned || customerDetails?.agreements?.termsAccepted || customerDetails?.agreement);
        const hasUtilityAuth = !!(customerDetails?.utilityAuthorization || customerDetails?.utilityAuthStatus === "AUTHORIZED" || customerDetails?.utility);
        const hasFacility = facilities.length > 0;
        const facilityVerified = hasFacility && facilities.some(f => f.verificationStatus === "VERIFIED" || f.verificationStatus === "APPROVED");
        const isActive = status === "active";
        const isTerminated = status === "terminated" || status === "inactive";

        const steps = [
          { label: "Registered", done: status !== "invited" },
          { label: "Agreement Signed", done: hasAgreement },
          { label: "Utility Authorized", done: hasUtilityAuth },
          { label: "Facility Added", done: hasFacility },
          { label: "Facility Verified", done: facilityVerified },
          { label: "Active", done: isActive && facilityVerified },
        ];

        return (
          <div className="mb-6 px-5 py-4 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium font-sfpro text-gray-500 uppercase tracking-wide">Registration Progress</div>
              {isTerminated && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sfpro font-medium bg-red-100 text-red-600">
                  Terminated
                </span>
              )}
            </div>
            <div className="flex items-center">
              {steps.map((step, i, arr) => {
                const isDone = !isTerminated && step.done;
                return (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${
                        isDone ? "bg-[#039994] border-[#039994]" : "bg-white border-gray-300"
                      }`} />
                      <span className={`text-[10px] mt-1 font-sfpro whitespace-nowrap ${
                        isDone ? "text-[#039994] font-medium" : "text-gray-400"
                      }`}>{step.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${isDone ? "bg-[#039994]" : "bg-gray-200"}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-200 rounded-lg bg-[#069B960D] p-6">
          <h3 className="text-lg font-semibold text-[#039994] mb-4">Residential Information</h3>
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
              <p className="font-medium">Residential</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Utility Provider</p>
              <p className="font-medium">{customer?.utility || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{customer?.address || "Not specified"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Date Registered</p>
              <p className="font-medium">{formatDate(customer?.date)}</p>
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