"use client";
import React from "react";

const CommissionTable = ({ data, tiers, onEdit, onDelete }) => {
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

  const groupedData = data.reduce((acc, item) => {
    const key = `${item.propertyType}_${item.mode}`;
    if (!acc[key]) {
      acc[key] = {
        propertyType: item.propertyType,
        mode: item.mode,
        tiers: {},
        maxDuration: item.maxDuration,
        agreementYrs: item.agreementYrs,
        cancellationFee: item.cancellationFee,
        items: []
      };
    }
    acc[key].tiers[item.tierId] = {
      customerShare: item.customerShare,
      installerShare: item.installerShare,
      salesAgentShare: item.salesAgentShare,
      financeShare: item.financeShare,
      itemId: item.id
    };
    acc[key].items.push(item);
    return acc;
  }, {});

  const headers = buildHeaders();

  const getShareDisplay = (tierData) => {
    if (!tierData) return <span className="text-gray-400">-</span>;
    
    const shares = [];
    if (tierData.customerShare !== null) {
      shares.push(`Customer: ${tierData.customerShare}%`);
    }
    if (tierData.installerShare !== null) {
      shares.push(`Installer: ${tierData.installerShare}%`);
    }
    if (tierData.salesAgentShare !== null) {
      shares.push(`Sales Agent: ${tierData.salesAgentShare}%`);
    }
    if (tierData.financeShare !== null) {
      shares.push(`Finance: ${tierData.financeShare}%`);
    }
    
    if (shares.length === 0) return <span className="text-gray-400">-</span>;
    
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
          {Object.values(groupedData).map((group, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                {group.propertyType} - {group.mode.replace(/_/g, ' ')}
              </td>
              {sortedTiers.map(tier => {
                const tierData = group.tiers[tier.id];
                return (
                  <td key={tier.id} className="px-3 py-4 text-sm">
                    {getShareDisplay(tierData)}
                  </td>
                );
              })}
              <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                {group.maxDuration ? `${group.maxDuration} yrs` : '-'}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                {group.agreementYrs ? `${group.agreementYrs} yrs` : '-'}
              </td>
              <td className="px-3 py-4 text-sm text-gray-900 whitespace-nowrap">
                {group.cancellationFee ? `$${group.cancellationFee}` : '-'}
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap">
                <button
                  onClick={() => onEdit(group.items[0])}
                  className="text-[#039994] hover:text-[#028884] mr-3"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (group.items.length === 1) {
                      onDelete(group.items[0].id);
                    } else {
                      if (window.confirm(`Delete all ${group.items.length} commission structures for this mode?`)) {
                        group.items.forEach(item => onDelete(item.id));
                      }
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;