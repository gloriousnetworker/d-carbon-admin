"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  PiggyBank,
  Wallet,
  Building,
  Calculator,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import {
  mainContainer,
  headingContainer,
  backArrow,
  pageTitle,
  buttonPrimary,
  inputClass,
  labelClass,
  selectClass
} from "../../styles";
import toast from "react-hot-toast";

// Finance Type Modal Component
const FinanceTypeModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    status: "PENDING"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }
    
    setIsLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/admin/financial-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: formData.name
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Finance type created successfully");
        setFormData({ name: "", status: "PENDING" });
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Failed to create finance type');
      }
    } catch (error) {
      toast.error('Error creating finance type');
      console.error('Error creating finance type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Finance Type</h2>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Finance Type Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter finance type name"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={`flex-1 ${buttonPrimary}`}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Creating..." : "Create Finance Type"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Finance Type Modal Component
const EditFinanceTypeModal = ({ isOpen, onClose, financeType, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: financeType?.name || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (financeType) {
      setFormData({
        name: financeType.name,
      });
    }
  }, [financeType]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a finance type name");
      return;
    }
    
    setIsLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/financial-types/${financeType.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: formData.name
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Finance type updated successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(result.message || 'Failed to update finance type');
      }
    } catch (error) {
      toast.error('Error updating finance type');
      console.error('Error updating finance type:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Finance Type</h2>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Finance Type Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Enter finance type name"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={`flex-1 ${buttonPrimary}`}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Updating..." : "Update Finance Type"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rejection Reason Modal
const RejectionReasonModal = ({ 
  isOpen, 
  onClose, 
  financeTypeId, 
  onReject 
}) => {
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    
    setIsLoading(true);
    await onReject(financeTypeId, reason);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Enter Rejection Reason</h2>
        
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Reason for rejection</label>
            <textarea
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`${inputClass} min-h-[100px]`}
              placeholder="Enter the reason for rejecting this finance type"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Submitting..." : "Submit Rejection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FinanceTypes({ onBack }) {
  const [financeTypes, setFinanceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedFinanceType, setSelectedFinanceType] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Fetch finance types
  const fetchFinanceTypes = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/user/financial-types', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setFinanceTypes(result.data.types || []);
      } else {
        toast.error('Failed to fetch finance types');
      }
    } catch (error) {
      toast.error('Error fetching finance types');
      console.error('Error fetching finance types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceTypes();
  }, []);

  // Handle approval
  const handleApprove = async (id) => {
    try {
      setUpdatingStatus(id);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/financial-types/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: "APPROVED"
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Finance type approved successfully');
        fetchFinanceTypes(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to approve finance type');
      }
    } catch (error) {
      toast.error('Error approving finance type');
      console.error('Error approving finance type:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle rejection
  const handleReject = async (id, reason) => {
    try {
      setUpdatingStatus(id);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/financial-types/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: "DISAPPROVED",
          rejectionReason: reason
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Finance type rejected successfully');
        fetchFinanceTypes(); // Refresh the list
      } else {
        toast.error(result.message || 'Failed to reject finance type');
      }
    } catch (error) {
      toast.error('Error rejecting finance type');
      console.error('Error rejecting finance type:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      setUpdatingStatus(id);
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`https://services.dcarbon.solutions/api/admin/financial-types/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Finance type deleted successfully');
        fetchFinanceTypes(); // Refresh the list
        if (viewMode === "view" && selectedFinanceType?.id === id) {
          setViewMode("list");
          setSelectedFinanceType(null);
        }
      } else {
        toast.error(result.message || 'Failed to delete finance type');
      }
    } catch (error) {
      toast.error('Error deleting finance type');
      console.error('Error deleting finance type:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISAPPROVED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'DISAPPROVED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleView = (financeType) => {
    setSelectedFinanceType(financeType);
    setViewMode("view");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedFinanceType(null);
  };

  const handleEdit = (financeType) => {
    setSelectedFinanceType(financeType);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className={mainContainer}>
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={mainContainer}>
      <div className={headingContainer}>
        <ArrowLeft 
          className={backArrow} 
          size={24} 
          onClick={viewMode === "list" ? onBack : handleBackToList}
        />
        <h1 className={pageTitle}>
          {viewMode === "list" ? "Finance Types" : "Finance Type Details"}
        </h1>
      </div>

      <div className="w-full max-w-7xl">
        {viewMode === "list" && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Types</p>
                    <p className="text-2xl font-bold text-[#039994]">{financeTypes.length}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#039994]" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {financeTypes.filter(ft => ft.status === 'APPROVED').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {financeTypes.filter(ft => ft.status === 'PENDING').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disapproved</p>
                    <p className="text-2xl font-bold text-red-600">
                      {financeTypes.filter(ft => ft.status === 'DISAPPROVED').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Header with Add Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Finance Type Listings</h2>
              <Button
                className="gap-2 text-white"
                style={{ backgroundColor: '#039994' }}
                onClick={() => setShowModal(true)}
              >
                <Plus className="h-4 w-4" />
                Add Finance Type
              </Button>
            </div>

            {/* Finance Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {financeTypes.map((financeType) => (
                <div key={financeType.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#039994] bg-opacity-10 rounded-lg flex items-center justify-center text-[#039994]">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{financeType.name}</h3>
                        <p className="text-xs text-gray-500">Code: {financeType.namingCode}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(financeType.status)}`}>
                      {getStatusIcon(financeType.status)}
                      {financeType.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">{formatDate(financeType.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium text-gray-900">{formatDate(financeType.updatedAt)}</span>
                    </div>
                    {financeType.rejectionReason && (
                      <div className="text-sm">
                        <span className="text-gray-600">Rejection Reason:</span>
                        <p className="text-red-600 text-xs mt-1">{financeType.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(financeType)}
                      className="text-[#039994] hover:text-[#02857f]"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {financeType.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(financeType.id)}
                            disabled={updatingStatus === financeType.id}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFinanceType(financeType);
                              setShowRejectModal(true);
                            }}
                            disabled={updatingStatus === financeType.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(financeType)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(financeType.id)}
                        disabled={updatingStatus === financeType.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {financeTypes.length === 0 && (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No finance types found. Create your first finance type to get started.</p>
              </div>
            )}
          </>
        )}

        {viewMode === "view" && selectedFinanceType && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-[#039994] bg-opacity-10 rounded-lg flex items-center justify-center text-[#039994]">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedFinanceType.name}</h2>
                <p className="text-gray-600">Finance Type Code: {selectedFinanceType.namingCode}</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedFinanceType.status)}`}>
                  {getStatusIcon(selectedFinanceType.status)}
                  {selectedFinanceType.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium text-sm">{selectedFinanceType.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{selectedFinanceType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Naming Code:</span>
                    <span className="font-medium">{selectedFinanceType.namingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFinanceType.status)}`}>
                      {getStatusIcon(selectedFinanceType.status)}
                      {selectedFinanceType.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatDate(selectedFinanceType.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(selectedFinanceType.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedFinanceType.rejectionReason && (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h3>
                <p className="text-red-700">{selectedFinanceType.rejectionReason}</p>
              </div>
            )}

            <div className="flex gap-4 pt-8">
              <Button
                variant="outline"
                onClick={handleBackToList}
              >
                Back to List
              </Button>
              
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  onClick={() => handleEdit(selectedFinanceType)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(selectedFinanceType.id)}
                  disabled={updatingStatus === selectedFinanceType.id}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                
                {selectedFinanceType.status === 'PENDING' && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(selectedFinanceType.id)}
                      disabled={updatingStatus === selectedFinanceType.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        setShowRejectModal(true);
                      }}
                      disabled={updatingStatus === selectedFinanceType.id}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Finance Type Creation Modal */}
      <FinanceTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchFinanceTypes}
      />

      {/* Finance Type Edit Modal */}
      <EditFinanceTypeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        financeType={selectedFinanceType}
        onSuccess={fetchFinanceTypes}
      />

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        financeTypeId={selectedFinanceType?.id}
        onReject={handleReject}
      />
    </div>
  );
}