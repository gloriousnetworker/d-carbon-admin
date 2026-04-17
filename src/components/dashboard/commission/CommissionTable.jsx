"use client";
/**
 * Single-view Commission Table.
 *
 * Consumes data ALREADY filtered by property type upstream (by the parent
 * CommissionStructure). Groups the rows by `mode` so that each commission
 * mode (Direct Customer, Referred Customer, Partner Installer, Partner
 * Finance, EPC Assisted Finance, EPC Assisted Installer, Sales Agent …)
 * renders as a single row — no mode-dropdown required.
 *
 * First column: Mode (was "Property + Mode" in the old table).
 * Tier columns: unchanged — reuse the per-mode share display.
 * Actions: per-row Edit / Delete / Delete All (unchanged behavior).
 */
import React from "react";
import { Pencil, Trash2 } from "lucide-react";

/**
 * Format USD and MW range lines for a tier column header.
 *
 * New schema (post-Francis refactor): each tier has separate USD and MW
 * value sets — minAmountUSD / maxAmountUSD and minAmountMW / maxAmountMW.
 * Both lines will always have real values.
 */
const formatUsdRange = (tier) => {
  const fmt = (v) => `$${Number(v).toLocaleString()}`;
  const min = tier.minAmountUSD != null ? fmt(tier.minAmountUSD) : "$0";
  const max = tier.maxAmountUSD != null ? fmt(tier.maxAmountUSD) : "∞";
  return `Min ${min} – Max ${max}`;
};

const formatMwRange = (tier) => {
  const min = tier.minAmountMW != null ? `${tier.minAmountMW} MW` : "0 MW";
  const max = tier.maxAmountMW != null ? `${tier.maxAmountMW} MW` : "∞";
  return `Min ${min} – Max ${max}`;
};

const CommissionTable = ({ data, tiers, propertyType, onEdit, onDelete, onDeleteMany }) => {
  // Delete many items in one server round-trip + single refetch. Falls back to
  // looping onDelete if the parent hasn't wired onDeleteMany — keeps the
  // component usable standalone, but the fallback path has the per-item
  // refetch flicker described in CommissionStructure.handleDeleteCommissions.
  const deleteMany = (ids) => {
    if (!ids || ids.length === 0) return;
    if (typeof onDeleteMany === "function") {
      onDeleteMany(ids);
    } else {
      ids.forEach((id) => onDelete(id));
    }
  };
  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  const isEpcAssistedMode = (mode) =>
    mode === "EPC_ASSISTED_FINANCE" || mode === "EPC_ASSISTED_INSTALLER";

  const findEpcFinanceShare = (tierId) => {
    const epcFinance = data.find(
      (item) => item.mode === "EPC_ASSISTED_FINANCE" && item.tierId === tierId
    );
    return epcFinance?.financeShare;
  };

  const findEpcInstallerShare = (tierId) => {
    const epcInstaller = data.find(
      (item) => item.mode === "EPC_ASSISTED_INSTALLER" && item.tierId === tierId
    );
    return epcInstaller?.installerShare;
  };

  const findPartnerFinanceItem = (tierId) =>
    data.find((item) => item.mode === "PARTNER_FINANCE" && item.tierId === tierId);

  // Group rows by mode only (property type is already scoped by the parent).
  const groupedData = data.reduce((acc, item) => {
    const key = item.mode;
    if (!acc[key]) {
      acc[key] = {
        propertyType: item.propertyType,
        mode: item.mode,
        tiers: {},
        items: [],
      };
    }

    acc[key].tiers[item.tierId] = {
      customerShare: item.customerShare,
      installerShare: item.installerShare,
      salesAgentShare: item.salesAgentShare,
      financeShare: item.financeShare,
      dcarbonShare: item.dcarbonShare,
      itemId: item.id,
    };
    acc[key].items.push(item);

    return acc;
  }, {});

  const getShareDisplay = (tierData, mode, tierId) => {
    if (!tierData)
      return (
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
            <span className="ml-1 text-[#039994] font-semibold">
              {tierData.customerShare}%
            </span>
          </div>
        );
        shares.push(
          <div key="dcarbon" className="py-1">
            <span className="font-medium text-gray-700">DCarbon Remainder:</span>
            <span className="ml-1 text-gray-600">
              {dcarbonRemainder.toFixed(2)}%
            </span>
          </div>
        );
      }
    } else if (mode === "PARTNER_INSTALLER") {
      if (tierData.customerShare !== null) {
        shares.push(
          <div key="referred" className="py-1">
            <span className="font-medium text-gray-900">Referred Customer:</span>
            <span className="ml-1 text-[#039994] font-semibold">
              {tierData.customerShare}%
            </span>
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
      const partnerFinanceTotal =
        100 - referredCustomerValue - dcarbonRemainderValue;

      if (tierData.customerShare !== null) {
        shares.push(
          <div
            key="referred"
            className="py-1.5 px-2 bg-gradient-to-r from-[#039994]/5 to-transparent rounded"
          >
            <span className="font-semibold text-gray-900">Referred Customer:</span>
            <span className="ml-2 text-[#039994] font-bold text-sm">
              {tierData.customerShare}%
            </span>
          </div>
        );
      }

      if (partnerFinanceTotal > 0) {
        shares.push(
          <div key="partner-total" className="py-1.5 px-2 bg-[#03999415] rounded">
            <span className="font-semibold text-[#039994]">
              Partner Finance Total:
            </span>
            <span className="ml-2 text-[#039994] font-bold text-sm">
              {partnerFinanceTotal.toFixed(2)}%
            </span>
          </div>
        );
      }

      if (tierData.dcarbonShare !== null) {
        shares.push(
          <div key="dcarbon" className="py-1.5 px-2 bg-gray-50 rounded mb-2">
            <span className="font-medium text-gray-800">DCarbon Remainder:</span>
            <span className="ml-2 text-gray-700 font-semibold text-sm">
              {tierData.dcarbonShare}%
            </span>
          </div>
        );
      }

      shares.push(
        <div
          key="divider"
          className="border-t-2 border-dashed border-gray-300 pt-2 mt-2"
        >
          <div className="px-2 py-1 bg-gray-50 rounded-md">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              EPC Assisted Modes
            </div>
          </div>
        </div>
      );

      const epcFinanceShare = findEpcFinanceShare(tierId);
      const epcInstallerShare = findEpcInstallerShare(tierId);
      if (epcFinanceShare != null) {
        shares.push(
          <div
            key="epc-finance"
            className="py-1.5 pl-4 pr-2 ml-1 border-l-2 border-gray-300 bg-gray-50 rounded-r"
          >
            <span className="font-medium text-gray-700 text-xs">EPC Finance:</span>
            <span className="ml-2 text-gray-600 font-semibold text-xs">
              {epcFinanceShare}%
            </span>
          </div>
        );
      }
      if (epcInstallerShare != null) {
        shares.push(
          <div
            key="epc-installer"
            className="py-1.5 pl-4 pr-2 ml-1 border-l-2 border-gray-300 bg-gray-50 rounded-r"
          >
            <span className="font-medium text-gray-700 text-xs">EPC Installer:</span>
            <span className="ml-2 text-gray-600 font-semibold text-xs">
              {epcInstallerShare}%
            </span>
          </div>
        );
      }
    } else if (mode === "EPC_ASSISTED_FINANCE") {
      const partnerFinance = findPartnerFinanceItem(tierId);
      shares.push(
        <div key="epc-finance" className="py-1">
          <span className="font-medium text-gray-700">EPC Finance:</span>
          <span className="ml-1 text-gray-600 font-semibold">
            {tierData.financeShare}%
          </span>
        </div>
      );
      if (partnerFinance) {
        const referredCustomerValue = parseFloat(partnerFinance.customerShare || 0);
        const dcarbonRemainderValue = parseFloat(partnerFinance.dcarbonShare || 0);
        const partnerFinanceTotal =
          100 - referredCustomerValue - dcarbonRemainderValue;
        shares.push(
          <div key="part-of" className="text-xs text-gray-500 italic pl-2">
            (Part of Partner Finance: {partnerFinanceTotal.toFixed(2)}%)
          </div>
        );
      }
    } else if (mode === "EPC_ASSISTED_INSTALLER") {
      const partnerFinance = findPartnerFinanceItem(tierId);
      shares.push(
        <div key="epc-installer" className="py-1">
          <span className="font-medium text-gray-700">EPC Installer:</span>
          <span className="ml-1 text-gray-600 font-semibold">
            {tierData.installerShare}%
          </span>
        </div>
      );
      if (partnerFinance) {
        const referredCustomerValue = parseFloat(partnerFinance.customerShare || 0);
        const dcarbonRemainderValue = parseFloat(partnerFinance.dcarbonShare || 0);
        const partnerFinanceTotal =
          100 - referredCustomerValue - dcarbonRemainderValue;
        shares.push(
          <div key="part-of" className="text-xs text-gray-500 italic pl-2">
            (Part of Partner Finance: {partnerFinanceTotal.toFixed(2)}%)
          </div>
        );
      }
    } else if (mode.includes("SALES_AGENT")) {
      if (tierData.salesAgentShare !== null) {
        shares.push(
          <div key="sales-agent" className="py-1">
            <span className="font-medium text-gray-900">Sales Agent:</span>
            <span className="ml-1 text-[#039994] font-semibold">
              {tierData.salesAgentShare}%
            </span>
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
            <span className="ml-1 text-[#039994] font-semibold">
              {tierData.customerShare}%
            </span>
          </div>
        );
        shares.push(
          <div key="dcarbon" className="py-1">
            <span className="font-medium text-gray-700">DCarbon Remainder:</span>
            <span className="ml-1 text-gray-600">
              {dcarbonRemainder.toFixed(2)}%
            </span>
          </div>
        );
      }
    } else {
      if (tierData.customerShare !== null) {
        shares.push(
          <div key="customer" className="py-1">
            <span className="font-medium text-gray-900">Customer:</span>
            <span className="ml-1 text-[#039994] font-semibold">
              {tierData.customerShare}%
            </span>
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

    if (shares.length === 0)
      return (
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
      const partnerFinance = findPartnerFinanceItem(item.tierId);
      if (partnerFinance) {
        if (
          window.confirm(
            `Delete ${group.mode.replace(/_/g, " ")} structure?\n\nNote: This will affect the Partner Finance structure which includes this share.`
          )
        ) {
          onDelete(item.id);
        }
      } else if (window.confirm(`Delete ${group.mode.replace(/_/g, " ")} structure?`)) {
        onDelete(item.id);
      }
    } else if (group.mode === "PARTNER_FINANCE") {
      const allEpcItems = data.filter(
        (dataItem) =>
          (dataItem.mode === "EPC_ASSISTED_FINANCE" ||
            dataItem.mode === "EPC_ASSISTED_INSTALLER") &&
          dataItem.tierId === item.tierId
      );

      const allIds = [item.id, ...allEpcItems.map((epcItem) => epcItem.id)];

      if (
        window.confirm(
          `Delete Partner Finance structure and ${allEpcItems.length} related EPC structures?`
        )
      ) {
        deleteMany(allIds);
      }
    } else if (window.confirm("Delete this commission structure?")) {
      onDelete(item.id);
    }
  };

  const handleDeleteAll = (group) => {
    const isEpcAssisted = isEpcAssistedMode(group.mode);
    const modeLabel = group.mode.replace(/_/g, " ");

    if (isEpcAssisted) {
      if (
        window.confirm(
          `Delete all ${group.items.length} ${modeLabel} structures for ${propertyType}? This will only remove ${modeLabel} rows — other modes on the table stay intact.`
        )
      ) {
        deleteMany(group.items.map((item) => item.id));
      }
    } else if (group.mode === "PARTNER_FINANCE") {
      const allIds = [];
      group.items.forEach((item) => {
        allIds.push(item.id);
        const epcFinanceItem = data.find(
          (dataItem) =>
            dataItem.mode === "EPC_ASSISTED_FINANCE" &&
            dataItem.tierId === item.tierId
        );
        const epcInstallerItem = data.find(
          (dataItem) =>
            dataItem.mode === "EPC_ASSISTED_INSTALLER" &&
            dataItem.tierId === item.tierId
        );
        if (epcFinanceItem) allIds.push(epcFinanceItem.id);
        if (epcInstallerItem) allIds.push(epcInstallerItem.id);
      });

      const uniqueIds = [...new Set(allIds)];
      if (
        window.confirm(
          `Delete all Partner Finance structures and their ${uniqueIds.length - group.items.length} related EPC Assisted children (${uniqueIds.length} total)? This only affects the Partner Finance row — other modes stay intact.`
        )
      ) {
        deleteMany(uniqueIds);
      }
    } else if (
      window.confirm(
        `Delete all ${group.items.length} ${modeLabel} structures? This only affects the ${modeLabel} row — other modes on the table stay intact.`
      )
    ) {
      deleteMany(group.items.map((item) => item.id));
    }
  };

  const getEditFunction = (item, group) => {
    if (
      group.mode === "EPC_ASSISTED_FINANCE" ||
      group.mode === "EPC_ASSISTED_INSTALLER"
    ) {
      const partnerFinance = findPartnerFinanceItem(item.tierId);
      if (partnerFinance) {
        return () => onEdit(partnerFinance);
      }
    }
    return () => onEdit(item);
  };

  // Stable sort so Partner Finance precedes its EPC-assisted children and
  // Direct / Referred appear consistently at the top of the table.
  const modeOrder = [
    "DIRECT_CUSTOMER",
    "REFERRED_CUSTOMER",
    "PARTNER_INSTALLER",
    "PARTNER_FINANCE",
    "EPC_ASSISTED_FINANCE",
    "EPC_ASSISTED_INSTALLER",
  ];
  // QA 2026-04-15: EPC_ASSISTED_FINANCE and EPC_ASSISTED_INSTALLER are already
  // rendered inline inside the PARTNER_FINANCE row under the "EPC Assisted Modes"
  // sub-section, so standalone rows for them would duplicate the same numbers
  // admins just read in the parent row. Hide them from the table but keep the
  // data in the raw `data` array — edit/delete cascades from the Partner Finance
  // row handle them (see getEditFunction and handleDelete for PARTNER_FINANCE).
  const sortedGroups = Object.values(groupedData)
    .filter(
      (g) =>
        g.mode !== "EPC_ASSISTED_FINANCE" && g.mode !== "EPC_ASSISTED_INSTALLER"
    )
    .sort((a, b) => {
      const ai = modeOrder.indexOf(a.mode);
      const bi = modeOrder.indexOf(b.mode);
      if (ai === -1 && bi === -1) return a.mode.localeCompare(b.mode);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

  if (sortedGroups.length === 0) {
    return (
      <div className="border border-gray-200 rounded-xl p-10 text-center text-sm text-gray-500 font-sfpro">
        No commission structures set up for{" "}
        {propertyType === "ACCOUNT_LEVEL" ? "Account Level" : propertyType} yet.
        Use <span className="font-semibold">Create Commission Structure</span> to
        add one.
      </div>
    );
  }

  return (
    // QA 2026-04-15: the outer `overflow-hidden` was clipping tier columns
    // beyond viewport width. Switch to `overflow-x-auto` so the table can
    // scroll horizontally when there are more tiers than the viewport fits.
    <div className="border border-gray-200 rounded-xl overflow-x-auto">
      <table className="min-w-max divide-y divide-gray-200">
        <thead>
          <tr className="border-y text-sm align-top">
            <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">
              Mode
            </th>
            {sortedTiers.map((tier) => (
              /*
                2026-04-15 meeting (Phillip / Chimdinma): each column is
                "Tier N" only — no label suffix. Both USD and MW ranges are
                shown as sub-rows. Until Francis's backend refactor lands,
                one row will show "—" (the tier is currently either USD or
                MW, not both). After the refactor, both rows will have data
                with no rendering changes needed here.
              */
              <th
                key={tier.id}
                className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E] whitespace-nowrap min-w-[180px]"
              >
                <div className="text-sm font-semibold text-[#1E1E1E]">
                  Tier {tier.order}
                </div>
                <div className="mt-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-normal">
                    <span className="font-semibold text-[#039994]">USD</span>
                    <span className="text-gray-500">{formatUsdRange(tier)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-normal">
                    <span className="font-semibold text-amber-600">MW</span>
                    <span className="text-gray-500">{formatMwRange(tier)}</span>
                  </div>
                </div>
              </th>
            ))}
            <th className="py-3 px-4 text-left font-medium font-sfpro text-[#1E1E1E]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedGroups.map((group, groupIndex) => (
            <tr
              key={groupIndex}
              className="hover:bg-gray-50 transition-colors duration-100"
            >
              <td className="px-4 py-5 text-sm font-medium text-gray-900 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-gray-900">
                    {group.mode.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block w-fit">
                    {propertyType === "ACCOUNT_LEVEL"
                      ? "Account Level"
                      : propertyType}
                  </span>
                  {/*
                    tierUnit badge — shows which range type (USD/MW) is used
                    when this mode is matched to a tier at payout time.
                    Populated once Francis's refactor lands (CommissionStructure
                    gets a `tierUnit` field).
                  */}
                  {group.items[0]?.tierUnit && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block w-fit border ${
                        group.items[0].tierUnit === "SYSTEM_CAPACITY"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-[#03999415] text-[#039994] border-[#03999430]"
                      }`}
                    >
                      {group.items[0].tierUnit === "SYSTEM_CAPACITY" ? "MW" : "USD"}
                    </span>
                  )}
                </div>
              </td>
              {sortedTiers.map((tier) => {
                const tierData = group.tiers[tier.id];
                const commissionItem = group.items.find(
                  (item) => item.tierId === tier.id
                );
                const editFunction = commissionItem
                  ? getEditFunction(commissionItem, group)
                  : null;

                return (
                  <td key={tier.id} className="px-4 py-5 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {getShareDisplay(tierData, group.mode, tier.id)}
                      </div>
                      {commissionItem && editFunction && (
                        <div className="ml-2 flex flex-col space-y-1.5">
                          <button
                            onClick={editFunction}
                            className="text-[#039994] hover:text-[#028884] p-1.5 rounded-md hover:bg-[#039994]/10 transition-colors duration-150"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(commissionItem, group)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-md hover:bg-red-50 transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
                            <Trash2 size={16} />
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CommissionTable;
