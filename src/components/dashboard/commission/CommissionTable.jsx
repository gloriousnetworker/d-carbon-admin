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

  const isEpcAssistedMode = (mode) => {
    return mode === "EPC_ASSISTED_FINANCE" || mode === "EPC_ASSISTED_INSTALLER";
  };

  const shouldShowMode = (item) => {
    if (propertyType === "ACCOUNT_LEVEL") {
      return item.propertyType === "ACCOUNT_LEVEL";
    }
    
    if (propertyType === "COMMERCIAL" || propertyType === "RESIDENTIAL") {
      if (isEpcAssistedMode(item.mode)) {
        return item.propertyType === propertyType;
      }
      return item.propertyType === propertyType;
    }
    
    return false;
  };

  const filteredData = data.filter(shouldShowMode);

  const findEpcFinanceShare = (propertyType, tierId) => {
    const epcFinance = filteredData.find(item => 
      item.mode === "EPC_ASSISTED_FINANCE" && 
      item.propertyType === propertyType && 
      item.tierId === tierId
    );
    return epcFinance?.financeShare;
  };

  const findEpcInstallerShare = (propertyType, tierId) => {
    const epcInstaller = filteredData.find(item => 
      item.mode === "EPC_ASSISTED_INSTALLER" && 
      item.propertyType === propertyType && 
      item.tierId === tierId
    );
    return epcInstaller?.installerShare;
  };

  const findPartnerFinanceItem = (propertyType, tierId) => {
    return filteredData.find(item => 
      item.mode === "PARTNER_FINANCE" && 
      item.propertyType === propertyType && 
      item.tierId === tierId
    );
  };

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
      dcarbonShare: item.dcarbonShare,
      maxDuration: item.maxDuration,
      agreementYrs: item.agreementYrs,
      cancellationFee: item.cancellationFee,
      itemId: item.id
    };
    acc[key].items.push(item);
    
    return acc;
  }, {});

  const getShareDisplay = (tierData, mode, propertyType, tierId) => {
    if (!tierData) return (
      <div className="text-center">
        <span className="text-gray-300">—</span>
      </div>
    );
    
    const shares = [];
    
    if (mode === "REFERRED_CUSTOMER") {
      if (tierData.customerShare !== null) {
        shares.push(`Referred Customer: ${tierData.customerShare}%`);
      }
    } else if (mode === "PARTNER_INSTALLER") {
      if (tierData.customerShare !== null) {
        shares.push(`Referred Customer: ${tierData.customerShare}%`);
      }
      if (tierData.installerShare !== null) {
        shares.push(`Installer: ${tierData.installerShare}%`);
      }
      if (tierData.dcarbonShare !== null) {
        shares.push(`DCarbon: ${tierData.dcarbonShare}%`);
      }
    } else if (mode === "PARTNER_FINANCE") {
      if (tierData.customerShare !== null) {
        shares.push(`Referred Customer: ${tierData.customerShare}%`);
      }
      if (tierData.financeShare !== null) {
        shares.push(`EPC Finance: ${tierData.financeShare}%`);
      }
      if (tierData.installerShare !== null) {
        shares.push(`EPC Installer: ${tierData.installerShare}%`);
      }
      if (tierData.dcarbonShare !== null) {
        shares.push(`DCarbon: ${tierData.dcarbonShare}%`);
      }
      
      const partnerFinanceTotal = (parseFloat(tierData.financeShare || 0) + parseFloat(tierData.installerShare || 0));
      if (partnerFinanceTotal > 0) {
        shares.push(`Partner Finance Total: ${partnerFinanceTotal}%`);
      }
    } else if (mode === "EPC_ASSISTED_FINANCE") {
      const partnerFinance = findPartnerFinanceItem(propertyType, tierId);
      if (partnerFinance) {
        const epcInstallerShare = findEpcInstallerShare(propertyType, tierId);
        const partnerFinanceTotal = (parseFloat(tierData.financeShare || 0) + parseFloat(epcInstallerShare || 0));
        shares.push(`EPC Finance: ${tierData.financeShare}%`);
        shares.push(`(Part of Partner Finance: ${partnerFinanceTotal}%)`);
      } else {
        shares.push(`EPC Finance: ${tierData.financeShare}%`);
      }
    } else if (mode === "EPC_ASSISTED_INSTALLER") {
      const partnerFinance = findPartnerFinanceItem(propertyType, tierId);
      if (partnerFinance) {
        const epcFinanceShare = findEpcFinanceShare(propertyType, tierId);
        const partnerFinanceTotal = (parseFloat(epcFinanceShare || 0) + parseFloat(tierData.installerShare || 0));
        shares.push(`EPC Installer: ${tierData.installerShare}%`);
        shares.push(`(Part of Partner Finance: ${partnerFinanceTotal}%)`);
      } else {
        shares.push(`EPC Installer: ${tierData.installerShare}%`);
      }
    } else if (mode.includes("SALES_AGENT")) {
      if (tierData.salesAgentShare !== null) {
        shares.push(`Sales Agent: ${tierData.salesAgentShare}%`);
      }
    } else if (mode === "DIRECT_CUSTOMER") {
      if (tierData.customerShare !== null) {
        shares.push(`Customer: ${tierData.customerShare}%`);
      }
    } else {
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

  const handleDelete = (item, group) => {
    const isEpcAssisted = isEpcAssistedMode(group.mode);
    
    if (isEpcAssisted) {
      const partnerFinance = findPartnerFinanceItem(group.propertyType, item.tierId);
      if (partnerFinance) {
        if (window.confirm(`Delete ${group.mode.replace(/_/g, ' ')} structure?\n\nNote: This will affect the Partner Finance structure which includes this share.`)) {
          onDelete(item.id);
        }
      } else {
        if (window.confirm(`Delete ${group.mode.replace(/_/g, ' ')} structure?`)) {
          onDelete(item.id);
        }
      }
    } else if (group.mode === "PARTNER_FINANCE") {
      const allEpcItems = filteredData.filter(dataItem => 
        (dataItem.mode === "EPC_ASSISTED_FINANCE" || dataItem.mode === "EPC_ASSISTED_INSTALLER") && 
        dataItem.propertyType === group.propertyType && 
        dataItem.tierId === item.tierId
      );
      
      const allIds = [item.id, ...allEpcItems.map(epcItem => epcItem.id)];
      
      if (window.confirm(`Delete Partner Finance structure and ${allEpcItems.length} related EPC structures?`)) {
        allIds.forEach(id => onDelete(id));
      }
    } else {
      if (window.confirm("Delete this commission structure?")) {
        onDelete(item.id);
      }
    }
  };

  const handleDeleteAll = (group) => {
    const isEpcAssisted = isEpcAssistedMode(group.mode);
    
    if (isEpcAssisted) {
      if (window.confirm(`Delete all ${group.items.length} ${group.mode.replace(/_/g, ' ')} structures for ${group.propertyType}?`)) {
        group.items.forEach(item => onDelete(item.id));
      }
    } else if (group.mode === "PARTNER_FINANCE") {
      const allIds = [];
      group.items.forEach(item => {
        allIds.push(item.id);
        const epcFinanceItem = filteredData.find(dataItem => 
          dataItem.mode === "EPC_ASSISTED_FINANCE" && 
          dataItem.propertyType === group.propertyType && 
          dataItem.tierId === item.tierId
        );
        const epcInstallerItem = filteredData.find(dataItem => 
          dataItem.mode === "EPC_ASSISTED_INSTALLER" && 
          dataItem.propertyType === group.propertyType && 
          dataItem.tierId === item.tierId
        );
        if (epcFinanceItem) allIds.push(epcFinanceItem.id);
        if (epcInstallerItem) allIds.push(epcInstallerItem.id);
      });
      
      const uniqueIds = [...new Set(allIds)];
      if (window.confirm(`Delete all Partner Finance structures and related EPC structures (${uniqueIds.length} total)?`)) {
        uniqueIds.forEach(id => onDelete(id));
      }
    } else {
      if (window.confirm(`Delete all ${group.items.length} commission structures for ${group.mode}?`)) {
        group.items.forEach(item => onDelete(item.id));
      }
    }
  };

  const getEditFunction = (item, group) => {
    if (group.mode === "EPC_ASSISTED_FINANCE" || group.mode === "EPC_ASSISTED_INSTALLER") {
      const partnerFinance = findPartnerFinanceItem(group.propertyType, item.tierId);
      if (partnerFinance) {
        return () => onEdit(partnerFinance);
      }
    }
    return () => onEdit(item);
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
            <React.Fragment key={groupIndex}>
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span>{group.propertyType === "ACCOUNT_LEVEL" ? "Account Level" : group.propertyType}</span>
                    <span className="text-xs text-gray-500">{group.mode.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                {sortedTiers.map(tier => {
                  const tierData = group.tiers[tier.id];
                  const commissionItem = group.items.find(item => item.tierId === tier.id);
                  const editFunction = commissionItem ? getEditFunction(commissionItem, group) : null;
                  
                  return (
                    <td key={tier.id} className="px-3 py-4 text-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {getShareDisplay(tierData, group.mode, group.propertyType, tier.id)}
                        </div>
                        {commissionItem && editFunction && (
                          <div className="ml-2 flex flex-col space-y-1">
                            <button
                              onClick={editFunction}
                              className="text-[#039994] hover:text-[#028884] p-1 rounded hover:bg-gray-100"
                              title="Edit"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(commissionItem, group)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100"
                              title="Delete"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                        {commissionItem && !editFunction && (
                          <div className="ml-2">
                            <button
                              onClick={() => handleDelete(commissionItem, group)}
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
                      onClick={() => handleDeleteAll(group)}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                    >
                      Delete All
                    </button>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;