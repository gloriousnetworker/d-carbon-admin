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
        tiers: {},
        items: []
      };
    }
    acc[key].tiers[item.tierId] = {
      customerShare: item.customerShare,
      installerShare: item.installerShare,
      salesAgentShare: item.salesAgentShare,
      financeShare: item.financeShare,
      maxDuration: item.maxDuration,
      agreementYrs: item.agreementYrs,
      cancellationFee: item.cancellationFee,
      itemId: item.id
    };
    acc[key].items.push(item);
    return acc;
  }, {});

  const headers = buildHeaders();

  const calculateDCarbonRemainder = (tierData) => {
    if (!tierData) return null;
    
    let total = 0;
    if (tierData.customerShare !== null && tierData.customerShare !== undefined) {
      total += parseFloat(tierData.customerShare);
    }
    if (tierData.installerShare !== null && tierData.installerShare !== undefined) {
      total += parseFloat(tierData.installerShare);
    }
    if (tierData.salesAgentShare !== null && tierData.salesAgentShare !== undefined) {
      total += parseFloat(tierData.salesAgentShare);
    }
    if (tierData.financeShare !== null && tierData.financeShare !== undefined) {
      total += parseFloat(tierData.financeShare);
    }
    
    const remainder = 100 - total;
    return remainder >= 0 ? remainder : 0;
  };

  const getShareDisplay = (tierData) => {
    if (!tierData) return (
      <div className="text-center">
        <span className="text-gray-300">—</span>
      </div>
    );
    
    const shares = [];
    if (tierData.customerShare !== null && tierData.customerShare !== undefined) {
      shares.push(`Customer: ${tierData.customerShare}%`);
    }
    if (tierData.installerShare !== null && tierData.installerShare !== undefined) {
      shares.push(`Installer: ${tierData.installerShare}%`);
    }
    if (tierData.salesAgentShare !== null && tierData.salesAgentShare !== undefined) {
      shares.push(`Sales Agent: ${tierData.salesAgentShare}%`);
    }
    if (tierData.financeShare !== null && tierData.financeShare !== undefined) {
      shares.push(`Finance: ${tierData.financeShare}%`);
    }
    
    const dcarbonRemainder = calculateDCarbonRemainder(tierData);
    if (dcarbonRemainder !== null && dcarbonRemainder !== undefined) {
      shares.push(`DCarbon: ${dcarbonRemainder.toFixed(1)}%`);
    }
    
    if (shares.length === 0) return (
      <div className="text-center">
        <span className="text-gray-300">—</span>
      </div>
    );
    
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
                  <span>{group.propertyType === "ACCOUNT_LEVEL" ? "Account Level" : group.propertyType}</span>
                  <span className="text-xs text-gray-500">{group.mode.replace(/_/g, ' ')}</span>
                </div>
              </td>
              {sortedTiers.map(tier => {
                const tierData = group.tiers[tier.id];
                const commissionItem = group.items.find(item => item.tierId === tier.id);
                return (
                  <td key={tier.id} className="px-3 py-4 text-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {getShareDisplay(tierData)}
                      </div>
                      {commissionItem && (
                        <div className="ml-2 flex flex-col space-y-1">
                          <button
                            onClick={() => onEdit(commissionItem)}
                            className="text-[#039994] hover:text-[#028884] p-1 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(commissionItem.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    {commissionItem && (
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