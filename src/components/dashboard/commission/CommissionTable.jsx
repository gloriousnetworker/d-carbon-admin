"use client";
import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const CommissionTable = ({ data, tiers, propertyType, onEdit, onDelete }) => {
  const sortedTiers = tiers.sort((a, b) => a.order - b.order);

  const buildHeaders = () => {
    const header = [
      'Property + Mode types',
      ...sortedTiers.map(t => `Tier ${t.order}: ${t.label}`),
      'Max Duration',
      'Agreement Years',
      'Cancellation Fee',
      'Actions'
    ];
    return header;
  };

  const filteredData = data.filter(item => {
    if (propertyType === "ACCOUNT_LEVEL") {
      return item.propertyType === "ACCOUNT_LEVEL";
    }
    return item.propertyType === propertyType;
  });

  const groupedData = filteredData.reduce((acc, item) => {
    const key = `${item.propertyType}_${item.mode}`;
    if (!acc[key]) {
      acc[key] = {
        propertyType: item.propertyType,
        mode: item.mode,
        itemsByTier: {},
        items: []
      };
    }
    acc[key].itemsByTier[item.tierId] = item;
    acc[key].items.push(item);
    return acc;
  }, {});

  const getModeDisplayName = (mode) => {
    if (mode === "REFERRED_CUSTOMER") return "REFERRED CUSTOMER";
    return mode.replace(/_/g, " ");
  };

  const getPropertyDisplayName = (property) => {
    if (property === "ACCOUNT_LEVEL") return "Account Level";
    return property;
  };

  const calculateDCarbonRemainder = (item) => {
    if (!item) return "0";
    
    const customer = parseFloat(item.customerShare) || 0;
    const installer = parseFloat(item.installerShare) || 0;
    const salesAgent = parseFloat(item.salesAgentShare) || 0;
    const finance = parseFloat(item.financeShare) || 0;
    
    if (item.mode === "DIRECT_CUSTOMER") {
      const remainder = (100 - customer).toFixed(2);
      return remainder >= 0 ? remainder : "0";
    }
    
    if (item.mode === "REFERRED_CUSTOMER") {
      const total = customer + installer + finance;
      const remainder = (100 - total).toFixed(2);
      return remainder >= 0 ? remainder : "0";
    }
    
    if (item.mode === "PARTNER_INSTALLER") {
      const remainder = (100 - installer).toFixed(2);
      return remainder >= 0 ? remainder : "0";
    }
    
    if (item.mode === "PARTNER_FINANCE") {
      const remainder = (100 - finance).toFixed(2);
      return remainder >= 0 ? remainder : "0";
    }
    
    if (item.mode.includes("SALES_AGENT")) {
      const total = salesAgent + finance;
      const remainder = (100 - total).toFixed(2);
      return remainder >= 0 ? remainder : "0";
    }
    
    return "0";
  };

  const getCommissionDisplay = (item) => {
    if (!item) return null;
    
    const shares = [];
    
    if (item.customerShare !== null && item.customerShare !== undefined) {
      shares.push(`Customer: ${item.customerShare}%`);
    }
    if (item.installerShare !== null && item.installerShare !== undefined) {
      shares.push(`Installer: ${item.installerShare}%`);
    }
    if (item.salesAgentShare !== null && item.salesAgentShare !== undefined) {
      shares.push(`Sales Agent: ${item.salesAgentShare}%`);
    }
    if (item.financeShare !== null && item.financeShare !== undefined) {
      shares.push(`Finance: ${item.financeShare}%`);
    }
    
    if (item.mode === "PARTNER_FINANCE") {
      if (item.epcFinanceShare !== null && item.epcFinanceShare !== undefined) {
        shares.push(`EPC Finance: ${item.epcFinanceShare}%`);
      }
      if (item.epcInstallerShare !== null && item.epcInstallerShare !== undefined) {
        shares.push(`EPC Installer: ${item.epcInstallerShare}%`);
      }
    }
    
    const remainder = calculateDCarbonRemainder(item);
    shares.push(`DCarbon: ${remainder}%`);
    
    return (
      <div className="space-y-1">
        {shares.map((share, index) => (
          <div key={index} className="text-xs">
            {share}
          </div>
        ))}
      </div>
    );
  };

  const headers = buildHeaders();

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-[#E8E8E8]">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Object.values(groupedData).map((group, groupIndex) => (
            <tr key={groupIndex} className="hover:bg-gray-50">
              <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                <div className="flex flex-col">
                  <span>{getPropertyDisplayName(group.propertyType)}</span>
                  <span className="text-xs text-gray-500">{getModeDisplayName(group.mode)}</span>
                </div>
              </td>
              {sortedTiers.map(tier => {
                const item = group.itemsByTier[tier.id];
                return (
                  <td key={tier.id} className="px-3 py-4 text-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {getCommissionDisplay(item)}
                      </div>
                      {item && (
                        <div className="ml-2 flex flex-col space-y-1">
                          <button
                            onClick={() => onEdit(item)}
                            className="text-[#039994] hover:text-[#028884] p-1 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {item && (
                      <div className="text-xs text-gray-500 mt-1">
                        Tier {tier.order}
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                {group.items[0]?.maxDuration ? `${group.items[0].maxDuration} yrs` : '-'}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                {group.items[0]?.agreementYrs ? `${group.items[0].agreementYrs} yrs` : '-'}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                {group.items[0]?.cancellationFee ? `$${group.items[0].cancellationFee}` : '-'}
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap">
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => {
                      const allIds = group.items.map(item => item.id);
                      if (window.confirm(`Delete all ${group.items.length} commission structures for this mode?`)) {
                        allIds.forEach(id => onDelete(id));
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                  >
                    Delete All
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;