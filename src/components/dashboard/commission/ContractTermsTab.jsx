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
    mode: "",
    maxDuration: "",
    agreementYrs: "",
    cancellationFee: ""
  });
  const [formErrors, setFormErrors] = useState({});

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

  const commercialModes = [
    "DIRECT_CUSTOMER",
    "REFERRED_CUSTOMER",
    "PARTNER_INSTALLER",
    "PARTNER_FINANCE",
    "EPC_ASSISTED_FINANCE",
    "EPC_ASSISTED_INSTALLER"
  ];

  const residentialModes = [
    "DIRECT_CUSTOMER",
    "REFERRED_CUSTOMER",
    "PARTNER_INSTALLER",
    "PARTNER_FINANCE",
    "EPC_ASSISTED_FINANCE",
    "EPC_ASSISTED_INSTALLER",
    "SALES_AGENT_REFERRED_RESIDENTIAL"
  ];

  const accountLevelModes = [
    "ACCOUNT_LEVEL"
  ];

  const getAvailableModes = () => {
    switch(formData.propertyType) {
      case "COMMERCIAL":
        return commercialModes;
      case "RESIDENTIAL":
        return residentialModes;
      case "ACCOUNT_LEVEL":
        return accountLevelModes;
      default:
        return [];
    }
  };

  const handleCreateNew = () => {
    setEditingTerm(null);
    setFormData({
      propertyType: "COMMERCIAL",
      mode: "",
      maxDuration: "",
      agreementYrs: "",
      cancellationFee: ""
    });
    setFormErrors({});
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
    setFormErrors({});
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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.mode) {
      errors.mode = "Commission mode is required";
    }
    
    if (!formData.maxDuration) {
      errors.maxDuration = "Max Duration is required";
    } else if (isNaN(formData.maxDuration) || parseFloat(formData.maxDuration) <= 0) {
      errors.maxDuration = "Max Duration must be a positive number";
    }
    
    if (!formData.agreementYrs) {
      errors.agreementYrs = "Agreement Years is required";
    } else if (isNaN(formData.agreementYrs) || parseFloat(formData.agreementYrs) <= 0) {
      errors.agreementYrs = "Agreement Years must be a positive number";
    }
    
    if (!formData.cancellationFee) {
      errors.cancellationFee = "Cancellation Fee is required";
    } else if (isNaN(formData.cancellationFee) || parseFloat(formData.cancellationFee) <= 0) {
      errors.cancellationFee = "Cancellation Fee must be a positive number";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const payload = {
      propertyType: formData.propertyType,
      mode: formData.mode,
      maxDuration: parseInt(formData.maxDuration),
      agreementYrs: parseInt(formData.agreementYrs),
      cancellationFee: parseFloat(formData.cancellationFee)
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
    const { name, value } = e.target;
    
    if (name === "propertyType") {
      setFormData({
        ...formData,
        propertyType: value,
        mode: "" 
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const commercialTerms = contractTerms.filter(term => term.propertyType === "COMMERCIAL");
  const residentialTerms = contractTerms.filter(term => term.propertyType === "RESIDENTIAL");
  const accountLevelTerms = contractTerms.filter(term => term.propertyType === "ACCOUNT_LEVEL");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Commission Contract Terms</h3>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#028884] transition-colors"
        >
          Create New Contract Term
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTerm ? "Edit Contract Term" : "Create New Contract Term"}
                </h2>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Property Type
                  </label>
                  <div className="flex space-x-3">
                    {["COMMERCIAL", "RESIDENTIAL", "ACCOUNT_LEVEL"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleChange({ target: { name: "propertyType", value: type } })}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          formData.propertyType === type
                            ? "bg-[#039994] text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {type === "ACCOUNT_LEVEL" ? "Account Level" : type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">
                    Commission Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mode"
                    value={formData.mode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition-all ${
                      formErrors.mode ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value="">Select a commission mode</option>
                    {getAvailableModes().map((mode) => (
                      <option key={mode} value={mode}>
                        {mode.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  {formErrors.mode && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.mode}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Max Duration (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxDuration"
                      value={formData.maxDuration}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition-all ${
                        formErrors.maxDuration ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      min="1"
                      step="1"
                      placeholder="Enter years"
                      required
                    />
                    {formErrors.maxDuration && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.maxDuration}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Agreement Years <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="agreementYrs"
                      value={formData.agreementYrs}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition-all ${
                        formErrors.agreementYrs ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      min="1"
                      step="1"
                      placeholder="Enter years"
                      required
                    />
                    {formErrors.agreementYrs && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.agreementYrs}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Cancellation Fee ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="cancellationFee"
                      value={formData.cancellationFee}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#039994] focus:border-[#039994] transition-all ${
                        formErrors.cancellationFee ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      required
                    />
                    {formErrors.cancellationFee && (
                      <p className="text-sm text-red-600 mt-1">{formErrors.cancellationFee}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-[#039994] rounded-lg hover:bg-[#028884] transition-colors shadow-md"
                  >
                    {editingTerm ? "Update Contract Term" : "Create Contract Term"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#039994]"></div>
          <p className="mt-3 text-gray-600">Loading contract terms...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-blue-900">Commercial Property Terms</h4>
            </div>
            {commercialTerms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Max Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Agreement Years
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cancellation Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commercialTerms.map((term) => (
                      <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{term.mode.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {term.maxDuration} years
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {term.agreementYrs} years
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                            ${term.cancellationFee}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(term)}
                              className="text-[#039994] hover:text-[#028884] transition-colors p-1.5 rounded-md hover:bg-[#039994]/10"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(term.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded-md hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No commercial property contract terms found.</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-2 px-4 py-2 text-sm text-[#039994] hover:text-[#028884] font-medium"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-100 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-green-900">Residential Property Terms</h4>
            </div>
            {residentialTerms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Max Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Agreement Years
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cancellation Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {residentialTerms.map((term) => (
                      <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{term.mode.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {term.maxDuration} years
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {term.agreementYrs} years
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                            ${term.cancellationFee}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(term)}
                              className="text-[#039994] hover:text-[#028884] transition-colors p-1.5 rounded-md hover:bg-[#039994]/10"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(term.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded-md hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No residential property contract terms found.</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-2 px-4 py-2 text-sm text-[#039994] hover:text-[#028884] font-medium"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-violet-100 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-purple-900">Account Level Terms</h4>
            </div>
            {accountLevelTerms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Mode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Max Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Agreement Years
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Cancellation Fee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accountLevelTerms.map((term) => (
                      <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{term.mode.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {term.maxDuration} years
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {term.agreementYrs} years
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                            ${term.cancellationFee}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(term)}
                              className="text-[#039994] hover:text-[#028884] transition-colors p-1.5 rounded-md hover:bg-[#039994]/10"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(term.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1.5 rounded-md hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No account level contract terms found.</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-2 px-4 py-2 text-sm text-[#039994] hover:text-[#028884] font-medium"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractTermsTab;
