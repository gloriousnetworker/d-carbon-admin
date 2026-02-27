"use client";
import React from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const CommissionTable = ({ data, tiers, propertyType, onEdit, onDelete }) => {
  const sortedTiers = tiers.sort((a, b) => a.order - b.order);

  const buildHeaders = () => {
    const header = [
      'Property + Mode types',
      ...sortedTiers.map(t => `Tier ${t.order}: ${t.label}`),
      'Label',
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
      label: item.label,
      itemId: item.id
    };
    acc[key].items.push(item);
    
    return acc;
  }, {});

  const getShareDisplay = (tierData, mode, propertyType, tierId) => {
    if (!tierData) return (
      <div className="text-center">
        <span className="text-gray-400">—</span>
      </div>
    );
    
    const shares = [];
    
    if (mode === "REFERRED_CUSTOMER") {
      if (tierData.customerShare !== null) {
        const referredCustomerValue = parseFloat(tierData.customerShare || 0);
        const dcarbonRemainder = 100 - referredCustomerValue;
        shares.push(
          <div key="referred" className="py-1">
            <span className="font-medium text-gray-900">Referred Customer:</span>
            <span className="ml-1 text-[#039994] font-semibold">{tierData.customerShare}%</span>
          </div>
        );
        shares.push(
          <div key="dcarbon" className="py-1">
            <span className="font-medium text-gray-700">DCarbon Remainder:</span>
            <span className="ml-1 text-gray-600">{dcarbonRemainder.toFixed(2)}%</span>
          </div>
        );
      }
    } else if (mode === "PARTNER_INSTALLER") {
      if (tierData.customerShare !== null) {
        shares.push(
          <div key="referred" className="py-1">
            <span className="font-medium text-gray-900">Referred Customer:</span>
            <span className="ml-1 text-[#039994] font-semibold">{tierData.customerShare}%</span>
          </div>
        );
      }
      if (tierData.installerShare !== null) {
        shares.push(
          <div key="installer" className="py-1">
            <span className="font-medium text-gray-700">Installer:</span>
            <span className="ml-1 text-gray-600">{tierData.installerShare}%</span>
          </div>
        );
      }
      if (tierData.dcarbonShare !== null) {
        shares.push(
          <div key="dcarbon" className="py-1">
            <span className="font-medium text-gray-700">DCarbon:</span>
            <span className="ml-1 text-gray-600">{tierData.dcarbonShare}%</span>
          </div>
        );
      }
    } else if (mode === "PARTNER_FINANCE") {
      const referredCustomerValue = parseFloat(tierData.customerShare || 0);
      const dcarbonRemainderValue = parseFloat(tierData.dcarbonShare || 0);
      const partnerFinanceTotal = 100 - referredCustomerValue - dcarbonRemainderValue;
      
      if (tierData.customerShare !== null) {
        shares.push(
          <div key="referred" className="py-1.5 px-2 bg-gradient-to-r from-[#039994]/5 to-transparent rounded">
            <span className="font-semibold text-gray-900">Referred Customer:</span>
            <span className="ml-2 text-[#039994] font-bold text-sm">{tierData.customerShare}%</span>
          </div>
        );
      }
      
      if (partnerFinanceTotal > 0) {
        shares.push(
          <div key="partner-total" className="py-1.5 px-2 bg-blue-50 rounded">
            <span className="font-semibold text-blue-900">Partner Finance Total:</span>
            <span className="ml-2 text-blue-700 font-bold text-sm">{partnerFinanceTotal.toFixed(2)}%</span>
          </div>
        );
      }
      
      if (tierData.dcarbonShare !== null) {
        shares.push(
          <div key="dcarbon" className="py-1.5 px-2 bg-gray-50 rounded mb-2">
            <span className="font-medium text-gray-800">DCarbon Remainder:</span>
            <span className="ml-2 text-gray-700 font-semibold text-sm">{tierData.dcarbonShare}%</span>
          </div>
        );
      }
      
      shares.push(
        <div key="divider" className="border-t-2 border-dashed border-gray-300 pt-2 mt-2">
          <div className="px-2 py-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-md">
            <div className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
              </svg>
              EPC Assisted Modes
            </div>
          </div>
        </div>
      );
      
      if (tierData.financeShare !== null) {
        shares.push(
          <div key="epc-finance" className="py-1.5 pl-4 pr-2 ml-1 border-l-2 border-purple-200 bg-purple-50/50 rounded-r">
            <span className="font-medium text-purple-900 text-xs">EPC Finance:</span>
            <span className="ml-2 text-purple-700 font-semibold text-xs">{tierData.financeShare}%</span>
          </div>
        );
      }
      
      if (tierData.installerShare !== null) {
        shares.push(
          <div key="epc-installer" className="py-1.5 pl-4 pr-2 ml-1 border-l-2 border-pink-200 bg-pink-50/50 rounded-r">
            <span className="font-medium text-pink-900 text-xs">EPC Installer:</span>
            <span className="ml-2 text-pink-700 font-semibold text-xs">{tierData.installerShare}%</span>
          </div>
        );
      }
    } else if (mode === "EPC_ASSISTED_FINANCE") {
      const partnerFinance = findPartnerFinanceItem(propertyType, tierId);
      if (partnerFinance) {
        const epcInstallerShare = findEpcInstallerShare(propertyType, tierId);
        const referredCustomerValue = parseFloat(partnerFinance.customerShare || 0);
        const dcarbonRemainderValue = parseFloat(partnerFinance.dcarbonShare || 0);
        const partnerFinanceTotal = 100 - referredCustomerValue - dcarbonRemainderValue;
        shares.push(
          <div key="epc-finance" className="py-1">
            <span className="font-medium text-purple-900">EPC Finance:</span>
            <span className="ml-1 text-purple-700 font-semibold">{tierData.financeShare}%</span>
          </div>
        );
        shares.push(
          <div key="part-of" className="text-xs text-gray-500 italic pl-2">
            (Part of Partner Finance: {partnerFinanceTotal.toFixed(2)}%)
          </div>
        );
      } else {
        shares.push(
          <div key="epc-finance" className="py-1">
            <span className="font-medium text-purple-900">EPC Finance:</span>
            <span className="ml-1 text-purple-700 font-semibold">{tierData.financeShare}%</span>
          </div>
        );
      }
    } else if (mode === "EPC_ASSISTED_INSTALLER") {
      const partnerFinance = findPartnerFinanceItem(propertyType, tierId);
      if (partnerFinance) {
        const epcFinanceShare = findEpcFinanceShare(propertyType, tierId);
        const referredCustomerValue = parseFloat(partnerFinance.customerShare || 0);
        const dcarbonRemainderValue = parseFloat(partnerFinance.dcarbonShare || 0);
        const partnerFinanceTotal = 100 - referredCustomerValue - dcarbonRemainderValue;
        shares.push(
          <div key="epc-installer" className="py-1">
            <span className="font-medium text-pink-900">EPC Installer:</span>
            <span className="ml-1 text-pink-700 font-semibold">{tierData.installerShare}%</span>
          </div>
        );
        shares.push(
          <div key="part-of" className="text-xs text-gray-500 italic pl-2">
            (Part of Partner Finance: {partnerFinanceTotal.toFixed(2)}%)
          </div>
        );
      } else {
        shares.push(
          <div key="epc-installer" className="py-1">
            <span className="font-medium text-pink-900">EPC Installer:</span>
            <span className="ml-1 text-pink-700 font-semibold">{tierData.installerShare}%</span>
          </div>
        );
      }
    } else if (mode.includes("SALES_AGENT")) {
      if (tierData.salesAgentShare !== null) {
        shares.push(
          <div key="sales-agent" className="py-1">
            <span className="font-medium text-gray-900">Sales Agent:</span>
            <span className="ml-1 text-[#039994] font-semibold">{tierData.salesAgentShare}%</span>
          </div>
        );
      }
    } else if (mode === "DIRECT_CUSTOMER") {
      if (tierData.customerShare !== null) {
        const directCustomerValue = parseFloat(tierData.customerShare || 0);
        const dcarbonRemainder = 100 - directCustomerValue;
        shares.push(
          <div key="customer" className="py-1">
            <span className="font-medium text-gray-900">Customer:</span>
            <span className="ml-1 text-[#039994] font-semibold">{tierData.customerShare}%</span>
          </div>
        );
        shares.push(
          <div key="dcarbon" className="py-1">
            <span className="font-medium text-gray-700">DCarbon Remainder:</span>
            <span className="ml-1 text-gray-600">{dcarbonRemainder.toFixed(2)}%</span>
          </div>
        );
      }
    } else {
      if (tierData.customerShare !== null) {
        shares.push(
          <div key="customer" className="py-1">
            <span className="font-medium text-gray-900">Customer:</span>
            <span className="ml-1 text-[#039994] font-semibold">{tierData.customerShare}%</span>
          </div>
        );
      }
      if (tierData.installerShare !== null) {
        shares.push(
          <div key="installer" className="py-1">
            <span className="font-medium text-gray-700">Installer:</span>
            <span className="ml-1 text-gray-600">{tierData.installerShare}%</span>
          </div>
        );
      }
      if (tierData.salesAgentShare !== null) {
        shares.push(
          <div key="sales-agent" className="py-1">
            <span className="font-medium text-gray-700">Sales Agent:</span>
            <span className="ml-1 text-gray-600">{tierData.salesAgentShare}%</span>
          </div>
        );
      }
      if (tierData.financeShare !== null) {
        shares.push(
          <div key="finance" className="py-1">
            <span className="font-medium text-gray-700">Finance:</span>
            <span className="ml-1 text-gray-600">{tierData.financeShare}%</span>
          </div>
        );
      }
    }
    
    if (shares.length === 0) return (
      <div className="text-center">
        <span className="text-gray-400">—</span>
      </div>
    );
    
    return (
      <div className="space-y-0.5">
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
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {Object.values(groupedData).map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              <tr className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-150">
                <td className="px-4 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-gray-900">{group.propertyType === "ACCOUNT_LEVEL" ? "Account Level" : group.propertyType}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">{group.mode.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                {sortedTiers.map(tier => {
                  const tierData = group.tiers[tier.id];
                  const commissionItem = group.items.find(item => item.tierId === tier.id);
                  const editFunction = commissionItem ? getEditFunction(commissionItem, group) : null;
                  
                  return (
                    <td key={tier.id} className="px-4 py-5 text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {getShareDisplay(tierData, group.mode, group.propertyType, tier.id)}
                        </div>
                        {commissionItem && editFunction && (
                          <div className="ml-2 flex flex-col space-y-1.5">
                            <button
                              onClick={editFunction}
                              className="text-[#039994] hover:text-[#028884] p-1.5 rounded-md hover:bg-[#039994]/10 transition-colors duration-150"
                              title="Edit"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(commissionItem, group)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-150"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        )}
                        {commissionItem && !editFunction && (
                          <div className="ml-2">
                            <button
                              onClick={() => handleDelete(commissionItem, group)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-150"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      {commissionItem && (
                        <div className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 px-2 py-1 rounded inline-block">
                          Tier {tier.order}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-5 text-sm text-gray-900 whitespace-nowrap font-medium">
                  {group.items[0]?.label ? (
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md font-medium">{group.items[0].label}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-5 text-sm whitespace-nowrap">
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleDeleteAll(group)}
                      className="text-xs text-red-600 hover:text-white hover:bg-red-600 px-3 py-2 border border-red-300 rounded-md transition-all duration-150 font-medium"
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