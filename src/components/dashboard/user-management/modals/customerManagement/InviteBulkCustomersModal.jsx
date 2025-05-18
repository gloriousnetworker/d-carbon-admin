import React, { useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { pageTitle, labelClass, inputClass, selectClass, buttonPrimary } from "../../styles";
import Loader from "@/components/loader/Loader.jsx";

export default function InviteCollaboratorModal({ isOpen, onClose }) {
  const [invitees, setInvitees] = useState([
    {
      name: "",
      email: "",
      phoneNumber: "",
      customerType: "RESIDENTIAL",
      role: "OWNER",
      message: ""
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newInvitees = [...invitees];
    newInvitees[index] = {
      ...newInvitees[index],
      [name]: value
    };
    setInvitees(newInvitees);
  };

  const addInvitee = () => {
    setInvitees([
      ...invitees,
      {
        name: "",
        email: "",
        phoneNumber: "",
        customerType: "RESIDENTIAL",
        role: "OWNER",
        message: ""
      }
    ]);
  };

  const removeInvitee = (index) => {
    if (invitees.length === 1) {
      toast.error("At least one invitee is required");
      return;
    }
    const newInvitees = [...invitees];
    newInvitees.splice(index, 1);
    setInvitees(newInvitees);
  };

  const resetForm = () => {
    setInvitees([
      {
        name: "",
        email: "",
        phoneNumber: "",
        customerType: "RESIDENTIAL",
        role: "OWNER",
        message: ""
      }
    ]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setCsvLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target.result;
        const rows = csvData.split('\n');
        const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
        
        // Check for required headers
        const requiredHeaders = ['email', 'name'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }
        
        // Parse data rows
        const newInvitees = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const values = rows[i].split(',').map(val => val.trim());
          if (values.length !== headers.length) {
            toast.warning(`Row ${i} has incorrect format and was skipped`);
            continue;
          }
          
          // Create invitee object from row data
          const invitee = {
            name: "",
            email: "",
            phoneNumber: "",
            customerType: "RESIDENTIAL",
            role: "OWNER",
            message: ""
          };
          
          headers.forEach((header, index) => {
            if (header === 'customertype') {
              // Validate and normalize customer type
              const type = values[index].toUpperCase();
              invitee.customerType = type === 'COMMERCIAL' ? 'COMMERCIAL' : 'RESIDENTIAL';
            } 
            else if (header === 'role') {
              // Validate and normalize role
              const role = values[index].toUpperCase();
              if (['OWNER', 'OPERATOR', 'BOTH'].includes(role)) {
                invitee.role = role;
              } else {
                invitee.role = invitee.customerType === 'COMMERCIAL' ? 'OWNER' : 'OWNER';
              }
            }
            else if (Object.keys(invitee).includes(header)) {
              invitee[header] = values[index];
            }
          });
          
          // Validate email presence
          if (invitee.email) {
            newInvitees.push(invitee);
          }
        }
        
        if (newInvitees.length === 0) {
          throw new Error("No valid invitees found in CSV file");
        }
        
        // Set the new invitees from CSV
        setInvitees(newInvitees);
        toast.success(`Successfully imported ${newInvitees.length} invitees from CSV`);
      } catch (error) {
        console.error("CSV Processing Error:", error);
        toast.error(error.message || "Failed to process CSV file");
      } finally {
        setCsvLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.onerror = () => {
      toast.error("Error reading CSV file");
      setCsvLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    
    reader.readAsText(file);
  };

  const triggerCsvUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken");

    if (!userId || !authToken) {
      toast.error("Authentication required");
      setLoading(false);
      return;
    }

    // Validate all invitees have email
    const invalidInvitees = invitees.filter(invitee => !invitee.email);
    if (invalidInvitees.length > 0) {
      toast.error(`Please enter email address for all invitees`);
      setLoading(false);
      return;
    }

    // Format payload
    const formattedInvitees = invitees.map(({ name, email, phoneNumber, customerType, role, message }) => ({
      name,
      email,
      phoneNumber,
      customerType,
      role,
      ...(message && { message })
    }));

    const payload = {
      invitees: formattedInvitees
    };

    try {
      const response = await axios.post(
        `https://services.dcarbon.solutions/api/user/invite-user/${userId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === "success") {
        toast.success(`Successfully sent ${invitees.length} invitation${invitees.length > 1 ? 's' : ''}`);
        resetForm();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        "Failed to send invitations"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 overflow-y-auto">
      <div className="relative bg-white p-5 rounded-lg w-full max-w-2xl text-sm max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Loader Overlay */}
        {(loading || csvLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <Loader size="large" />
          </div>
        )}

        {/* Modal Content */}
        <div className="flex flex-col items-center">
          {/* Vector Image */}
          <div className="flex justify-center mb-2">
            <img 
              src="/vectors/EmailVector.png" 
              alt="Invite Collaborator"
              className="h-16 w-auto"
            />
          </div>

          <h2 className={`text-base font-semibold ${pageTitle} text-center`}>Invite Customers</h2>
          <p className="text-gray-500 text-xs mb-4">Send invitations to one or multiple customers at once</p>
        </div>

        {/* CSV Upload Section */}
        <div className="mb-6 mt-2 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
          <div className="flex flex-col items-center justify-center text-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-gray-400 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
            <p className="text-sm font-medium mb-1">Import invitees from CSV</p>
            <p className="text-xs text-gray-500 mb-3">CSV should include columns: name, email, phoneNumber, customerType, role, message</p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCsvUpload}
              accept=".csv"
              className="hidden"
              disabled={loading || csvLoading}
            />
            
            <button 
              type="button"
              onClick={triggerCsvUpload}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || csvLoading}
            >
              Upload CSV File
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {invitees.map((invitee, index) => (
            <div key={index} className="border rounded-lg p-3 relative">
              {/* Header with Remove Button */}
              <div className="flex justify-between items-center mb-2 pb-2 border-b">
                <h3 className="font-medium text-sm">Invitee #{index + 1}</h3>
                {invitees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInvitee(index)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Name Input */}
                <div>
                  <label className={`${labelClass} text-xs`}>Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={invitee.name}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs`}
                    placeholder="Enter customer's name"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className={`${labelClass} text-xs`}>Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={invitee.email}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs`}
                    placeholder="Enter customer's email"
                    required
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className={`${labelClass} text-xs`}>Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={invitee.phoneNumber}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs`}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Customer Type */}
                <div>
                  <label className={`${labelClass} text-xs`}>Customer Type <span className="text-red-500">*</span></label>
                  <select
                    name="customerType"
                    value={invitee.customerType}
                    onChange={(e) => handleChange(index, e)}
                    className={`${selectClass} text-xs`}
                    required
                  >
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>

                {/* Role */}
                <div>
                  <label className={`${labelClass} text-xs`}>Role <span className="text-red-500">*</span></label>
                  {invitee.customerType === "COMMERCIAL" ? (
                    <select
                      name="role"
                      value={invitee.role}
                      onChange={(e) => handleChange(index, e)}
                      className={`${selectClass} text-xs`}
                      required
                    >
                      <option value="OWNER">Owner</option>
                      <option value="OPERATOR">Operator</option>
                      <option value="BOTH">Both</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value="Owner"
                      disabled
                      className={`${inputClass} bg-gray-100 text-xs cursor-not-allowed`}  
                    />
                  )}
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className={`${labelClass} text-xs`}>Message</label>
                  <textarea
                    name="message"
                    value={invitee.message}
                    onChange={(e) => handleChange(index, e)}
                    className={`${inputClass} text-xs h-16 resize-none`}
                    placeholder="Add a custom message (optional)"
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Add More Button */}
          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={addInvitee}
              className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none text-xs font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Another Invitee
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex space-x-2 pt-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-gray-300 text-gray-700 font-semibold py-2 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading || csvLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 ${buttonPrimary} flex items-center justify-center py-2 text-xs`}
              disabled={loading || csvLoading}
            >
              {invitees.length > 1 ? 'Send Invitations' : 'Send Invitation'}
            </button>
          </div>
        </form>

        {/* CSV Template Info */}
        <div className="mt-4 pt-4 border-t text-xs text-gray-500 flex items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          CSV should contain columns: name, email, phoneNumber, customerType (RESIDENTIAL/COMMERCIAL), role (OWNER/OPERATOR/BOTH), message
        </div>
      </div>
    </div>
  );
}