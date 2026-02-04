"use client";
import React, { useState, useEffect } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { toast } from "react-hot-toast";

const ContractTermsTab = () => {
  const [contractTerms, setContractTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [formData, setFormData] = useState({
    propertyType: "COMMERCIAL",
    mode: "DIRECT_CUSTOMER",
    maxDuration: "",
    agreementYrs: "",
    cancellationFee: ""
  });

  useEffect(() => {
    fetchContractTerms();
  }, []);

  const fetchContractTerms = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken");
      const response = await fetch("https://services.dcarbon.solutions/api/commission-contract-terms", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setContractTerms(data);
      }
    } catch (error) {
      console.error("Failed to fetch contract terms:", error);
      toast.error("Failed to load contract terms");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTerm(null);
    setFormData({
      propertyType: "COMMERCIAL",
      mode: "DIRECT_CUSTOMER",
      maxDuration: "",
      agreementYrs: "",
      cancellationFee: ""
    });
    setShowModal(true);
  };

  const handleEdit = (term) => {
    setEditingTerm(term);
    setFormData({
      propertyType: term.propertyType,
      mode: term.mode,
      maxDuration: term.maxDuration || "",
      agreementYrs: term.agreementYrs || "",
      cancellationFee: term.cancellationFee || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contract term?")) return;
    
    try {
      const authToken = localStorage.getItem("authToken");
      const response = await fetch(`https://services.dcarbon.solutions/api/commission-contract-terms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (response.ok) {
        toast.success("Contract term deleted successfully");
        fetchContractTerms();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Failed to delete contract term:", error);
      toast.error("Failed to delete contract term");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      propertyType: formData.propertyType,
      mode: formData.mode,
      maxDuration: formData.maxDuration ? parseInt(formData.maxDuration) : null,
      agreementYrs: formData.agreementYrs ? parseInt(formData.agreementYrs) : null,
      cancellationFee: formData.cancellationFee ? parseFloat(formData.cancellationFee) : null,
    };

    try {
      const authToken = localStorage.getItem("authToken");
      let response;
      
      if (editingTerm) {
        response = await fetch(`https://services.dcarbon.solutions/api/commission-contract-terms/${editingTerm.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch("https://services.dcarbon.solutions/api/commission-contract-terms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
      }
      
      if (response.ok) {
        toast.success(editingTerm ? "Contract term updated successfully" : "Contract term created successfully");
        setShowModal(false);
        fetchContractTerms();
      } else {
        const error = await response.json();
        throw new Error(error.message || "Operation failed");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const availableModes = [
    "DIRECT_CUSTOMER",
    "REFERRED_CUSTOMER",
    "PARTNER_INSTALLER",
    "PARTNER_FINANCE",
    "EPC_ASSISTED_FINANCE",
    "EPC_ASSISTED_INSTALLER",
    "SALES_AGENT_REFERRED_RESIDENTIAL",
    "SALES_AGENT_REFERRED_COMMERCIAL",
    "ACCOUNT_LEVEL"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Commission Contract Terms</h3>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884]"
        >
          Create New Contract Term
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">
                  {editingTerm ? "Edit Contract Term" : "Create Contract Term"}
                </h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="COMMERCIAL">COMMERCIAL</option>
                    <option value="RESIDENTIAL">RESIDENTIAL</option>
                    <option value="ACCOUNT_LEVEL">ACCOUNT LEVEL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Mode
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {availableModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Duration (Years)
                    </label>
                    <input
                      type="number"
                      name="maxDuration"
                      value={formData.maxDuration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agreement Years
                    </label>
                    <input
                      type="number"
                      name="agreementYrs"
                      value={formData.agreementYrs}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cancellation Fee
                    </label>
                    <input
                      type="number"
                      name="cancellationFee"
                      value={formData.cancellationFee}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#039994] rounded-md hover:bg-[#028884]"
                  >
                    {editingTerm ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading contract terms...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  Property Type
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  Mode
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  Max Duration
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  Agreement Years
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  Cancellation Fee
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {contractTerms.map((term) => (
                <tr key={term.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-150">
                  <td className="px-4 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {term.propertyType === "ACCOUNT_LEVEL" ? "Account Level" : term.propertyType}
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-900">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {term.mode.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-900 whitespace-nowrap font-medium">
                    {term.maxDuration ? (
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">{term.maxDuration} yrs</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-900 whitespace-nowrap font-medium">
                    {term.agreementYrs ? (
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md">{term.agreementYrs} yrs</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-5 text-sm text-gray-900 whitespace-nowrap font-medium">
                    {term.cancellationFee ? (
                      <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md">${term.cancellationFee}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-5 text-sm whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(term)}
                        className="text-[#039994] hover:text-[#028884] p-1.5 rounded-md hover:bg-[#039994]/10 transition-colors duration-150"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(term.id)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-150"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {contractTerms.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No contract terms found. Create your first contract term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContractTermsTab;