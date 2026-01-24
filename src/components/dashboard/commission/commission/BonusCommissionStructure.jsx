"use client";
import React, { useState, useEffect } from "react";
import { IoSettingsSharp } from "react-icons/io5";
import { FiEdit, FiTrash2, FiSave, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

const BonusCommissionStructure = ({ onSetupStructure, refreshTrigger }) => {
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchBonusStructure();
  }, [refreshTrigger]);

  const fetchBonusStructure = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch("https://services.dcarbon.solutions/api/bonus-structure", {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bonus structure");
      }

      const result = await response.json();
      
      if (result.success) {
        setTableData(result.data);
      } else {
        throw new Error("Failed to load bonus structure");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      minValue: item.minValue,
      maxValue: item.maxValue,
      percent: item.percent,
      flatValue: item.flatValue
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateEditForm = (bonusType) => {
    const fields = getFieldsForTarget(bonusType);
    
    if (fields.showMin && (!editForm.minValue || editForm.minValue === "")) {
      toast.error("Minimum value is required", { position: 'top-center', duration: 3000 });
      return false;
    }

    if (fields.showMax && fields.showMax !== false && (!editForm.maxValue || editForm.maxValue === "")) {
      toast.error("Maximum value is required", { position: 'top-center', duration: 3000 });
      return false;
    }

    if (fields.showPercent && (!editForm.percent || editForm.percent === "")) {
      toast.error("Percent value is required", { position: 'top-center', duration: 3000 });
      return false;
    }

    if (fields.showFlat && (!editForm.flatValue || editForm.flatValue === "")) {
      toast.error("Flat value is required", { position: 'top-center', duration: 3000 });
      return false;
    }

    if (fields.showMin && fields.showMax && fields.showMax !== false) {
      const min = parseFloat(editForm.minValue);
      const max = parseFloat(editForm.maxValue);
      if (min >= max) {
        toast.error("Minimum value must be less than maximum value", { position: 'top-center', duration: 3000 });
        return false;
      }
    }

    if (fields.showPercent && (editForm.percent < 0 || editForm.percent > 100)) {
      toast.error("Percent must be between 0 and 100", { position: 'top-center', duration: 3000 });
      return false;
    }

    if (fields.showFlat && editForm.flatValue < 0) {
      toast.error("Flat value cannot be negative", { position: 'top-center', duration: 3000 });
      return false;
    }

    return true;
  };

  const handleUpdate = async (id, bonusType) => {
    if (!validateEditForm(bonusType)) {
      return;
    }

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const payload = {
        minValue: editForm.minValue ? parseFloat(editForm.minValue) : null,
        maxValue: editForm.maxValue ? parseFloat(editForm.maxValue) : null,
        percent: editForm.percent ? parseFloat(editForm.percent) : null,
        flatValue: editForm.flatValue ? parseFloat(editForm.flatValue) : null
      };

      const response = await fetch(`https://services.dcarbon.solutions/api/bonus-structure/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Failed to update bonus structure");
      }

      toast.success("Bonus structure updated successfully", {
        position: 'top-center',
        duration: 3000,
      });

      setEditingId(null);
      setEditForm({});
      fetchBonusStructure();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this bonus structure?")) {
      return;
    }

    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`https://services.dcarbon.solutions/api/bonus-structure/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error("Failed to delete bonus structure");
      }

      toast.success("Bonus structure deleted successfully", {
        position: 'top-center',
        duration: 3000,
      });

      fetchBonusStructure();
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`, {
        position: 'top-center',
        duration: 5000,
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const formatBonusType = (bonusType) => {
    return bonusType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFieldsForTarget = (targetType) => {
    switch (targetType) {
      case "COMMERCIAL_MW_QUARTERLY":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false };
      case "RESIDENTIAL_REFERRAL_QUARTERLY":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false };
      case "SALES_AGENT_FLAT":
        return { showMin: true, showMax: true, showPercent: false, showFlat: true };
      case "PARTNER_RESIDENTIAL_MW_ANNUAL":
        return { showMin: true, showMax: false, showPercent: true, showFlat: false };
      case "PARTNER_COMMERCIAL_MW_ANNUAL":
        return { showMin: true, showMax: false, showPercent: true, showFlat: false };
      case "PARTNER_RESIDENTIAL_MW_QUARTER":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false };
      case "PARTNER_COMMERCIAL_MW_QUARTER":
        return { showMin: true, showMax: true, showPercent: true, showFlat: false };
      default:
        return { showMin: true, showMax: true, showPercent: true, showFlat: false };
    }
  };

  const groupDataByBonusType = (data) => {
    const grouped = {
      COMMERCIAL_MW_QUARTERLY: [],
      RESIDENTIAL_REFERRAL_QUARTERLY: [],
      SALES_AGENT_FLAT: [],
      PARTNER_RESIDENTIAL_MW_ANNUAL: [],
      PARTNER_COMMERCIAL_MW_ANNUAL: [],
      PARTNER_RESIDENTIAL_MW_QUARTER: [],
      PARTNER_COMMERCIAL_MW_QUARTER: []
    };

    data.forEach(item => {
      if (grouped[item.bonusType]) {
        grouped[item.bonusType].push(item);
      }
    });

    return grouped;
  };

  const renderTable = (bonusType, data) => {
    if (!data || data.length === 0) return null;

    const getHeaders = () => {
      switch (bonusType) {
        case "COMMERCIAL_MW_QUARTERLY":
          return ["MW Range", "Bonus (%)", "Actions"];
        case "RESIDENTIAL_REFERRAL_QUARTERLY":
          return ["Referral Range", "Bonus (%)", "Actions"];
        case "SALES_AGENT_FLAT":
          return ["Range", "Flat Bonus ($)", "Actions"];
        case "PARTNER_RESIDENTIAL_MW_ANNUAL":
          return ["Min MW", "Bonus (%)", "Actions"];
        case "PARTNER_COMMERCIAL_MW_ANNUAL":
          return ["Min MW", "Bonus (%)", "Actions"];
        case "PARTNER_RESIDENTIAL_MW_QUARTER":
          return ["MW Range", "Bonus (%)", "Actions"];
        case "PARTNER_COMMERCIAL_MW_QUARTER":
          return ["MW Range", "Bonus (%)", "Actions"];
        default:
          return ["Range", "Value", "Actions"];
      }
    };

    const getFieldsForTarget = (targetType) => {
      switch (targetType) {
        case "COMMERCIAL_MW_QUARTERLY":
          return { showMin: true, showMax: true, showPercent: true, showFlat: false };
        case "RESIDENTIAL_REFERRAL_QUARTERLY":
          return { showMin: true, showMax: true, showPercent: true, showFlat: false };
        case "SALES_AGENT_FLAT":
          return { showMin: true, showMax: true, showPercent: false, showFlat: true };
        case "PARTNER_RESIDENTIAL_MW_ANNUAL":
          return { showMin: true, showMax: false, showPercent: true, showFlat: false };
        case "PARTNER_COMMERCIAL_MW_ANNUAL":
          return { showMin: true, showMax: false, showPercent: true, showFlat: false };
        case "PARTNER_RESIDENTIAL_MW_QUARTER":
          return { showMin: true, showMax: true, showPercent: true, showFlat: false };
        case "PARTNER_COMMERCIAL_MW_QUARTER":
          return { showMin: true, showMax: true, showPercent: true, showFlat: false };
        default:
          return { showMin: true, showMax: true, showPercent: true, showFlat: false };
      }
    };

    const headers = getHeaders();
    const fields = getFieldsForTarget(bonusType);

    return (
      <div className="mb-8">
        <h3 className="text-[#039994] font-medium mb-3">{formatBonusType(bonusType)}</h3>
        <div className="w-full overflow-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="text-left py-3 px-4 font-medium text-sm text-black border-b border-gray-200"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, rowIndex) => (
                <tr 
                  key={item.id} 
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
                >
                  {editingId === item.id ? (
                    <>
                      <td className="py-3 px-4 text-sm border-b border-gray-200">
                        <input
                          type="number"
                          value={editForm.minValue || ""}
                          onChange={(e) => handleEditChange("minValue", e.target.value)}
                          className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                          step="0.1"
                          required
                        />
                      </td>
                      {fields.showMax && fields.showMax !== false && (
                        <td className="py-3 px-4 text-sm border-b border-gray-200">
                          <input
                            type="number"
                            value={editForm.maxValue || ""}
                            onChange={(e) => handleEditChange("maxValue", e.target.value)}
                            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                            step="0.1"
                            required
                          />
                        </td>
                      )}
                      {fields.showPercent && (
                        <td className="py-3 px-4 text-sm border-b border-gray-200">
                          <input
                            type="number"
                            value={editForm.percent || ""}
                            onChange={(e) => handleEditChange("percent", e.target.value)}
                            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                            step="0.1"
                            min="0"
                            max="100"
                            required
                          />
                        </td>
                      )}
                      {fields.showFlat && (
                        <td className="py-3 px-4 text-sm border-b border-gray-200">
                          <input
                            type="number"
                            value={editForm.flatValue || ""}
                            onChange={(e) => handleEditChange("flatValue", e.target.value)}
                            className="w-full rounded bg-[#F1F1F1] border border-gray-300 py-1 px-2 text-xs"
                            step="0.01"
                            min="0"
                            required
                          />
                        </td>
                      )}
                      <td className="py-3 px-4 text-sm border-b border-gray-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdate(item.id, item.bonusType)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Save"
                          >
                            <FiSave size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Cancel"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-sm border-b border-gray-200">
                        {bonusType === "PARTNER_RESIDENTIAL_MW_ANNUAL" || bonusType === "PARTNER_COMMERCIAL_MW_ANNUAL" 
                          ? `${item.minValue}+ MW` 
                          : `${item.minValue} - ${item.maxValue} ${bonusType === "RESIDENTIAL_REFERRAL_QUARTERLY" ? "Referrals" : "MW"}`
                        }
                      </td>
                      <td className="py-3 px-4 text-sm border-b border-gray-200">
                        {bonusType === "SALES_AGENT_FLAT" ? `$${item.flatValue}` : `${item.percent}%`}
                      </td>
                      <td className="py-3 px-4 text-sm border-b border-gray-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-[#039994]">Loading commission data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="text-gray-500">No bonus structure data available</div>
      </div>
    );
  }

  const groupedData = groupDataByBonusType(tableData);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-[#039994] font-semibold text-lg">
          Bonus Commission Structure
        </h2>
        <button
          className="flex items-center bg-[#039994] text-white px-4 py-2 rounded-full text-sm hover:bg-[#028B86] transition-colors"
          onClick={onSetupStructure}
        >
          <IoSettingsSharp className="mr-2" size={16} />
          Setup Structure
        </button>
      </div>

      {renderTable("COMMERCIAL_MW_QUARTERLY", groupedData.COMMERCIAL_MW_QUARTERLY)}
      {renderTable("RESIDENTIAL_REFERRAL_QUARTERLY", groupedData.RESIDENTIAL_REFERRAL_QUARTERLY)}
      {renderTable("SALES_AGENT_FLAT", groupedData.SALES_AGENT_FLAT)}
      {renderTable("PARTNER_RESIDENTIAL_MW_ANNUAL", groupedData.PARTNER_RESIDENTIAL_MW_ANNUAL)}
      {renderTable("PARTNER_COMMERCIAL_MW_ANNUAL", groupedData.PARTNER_COMMERCIAL_MW_ANNUAL)}
      {renderTable("PARTNER_RESIDENTIAL_MW_QUARTER", groupedData.PARTNER_RESIDENTIAL_MW_QUARTER)}
      {renderTable("PARTNER_COMMERCIAL_MW_QUARTER", groupedData.PARTNER_COMMERCIAL_MW_QUARTER)}

      <div className="text-xs text-gray-500 mt-2">
        All bonuses are calculated based on the specified ranges and criteria.
      </div>
    </div>
  );
};

export default BonusCommissionStructure;