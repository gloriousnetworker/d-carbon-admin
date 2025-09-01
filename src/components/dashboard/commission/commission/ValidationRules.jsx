"use client";
import React from "react";
import { pageTitle, labelClass, noteText } from "../styles";

const ValidationRules = () => {
  return (
    <div className="w-full">
      <h2 className={pageTitle}>Validation Rules (global)</h2>
      
      <div className="space-y-4">
        <ul className="list-disc list-inside space-y-2">
          <li className={labelClass}>All <strong>% fields</strong>: <code>0.0 – 100.0</code> (1 decimal).</li>
          <li className={labelClass}><strong>Remainder fields</strong> are <strong>read-only</strong>, computed per tier as <code>100 − sum(other splits)</code>.</li>
          <li className={labelClass}><strong>Referral scenario (Commercial/Residential)</strong> per tier: <code>customer + salesAgent + installerEPC + financeCompany ≤ 100</code>.</li>
          <li className={labelClass}><strong>No referral</strong> per tier: <code>customer ≤ 100</code>.</li>
          <li className={labelClass}><strong>EPC-Assisted</strong> per tier: <code>finance + epc ≤ 100</code>.</li>
          <li className={labelClass}>If <strong>Upline</strong> is enabled, its payouts do <strong>not</strong> reduce customer/partner splits—only DCarbon share.</li>
          <li className={labelClass}>Durations: integer ≥ 0; fees/cap: currency ≥ 0.</li>
        </ul>

        <div className="mt-6">
          <h3 className={`${labelClass} font-semibold text-lg mb-2`}>Quick JSON-ish key map (for engineering)</h3>
          <div className={noteText}>
            <p><code>tiers: {"{ A: \"<$500k\", B: \"$500k–$2.5M\", C: \">$2.5M\" }"}</code></p>
            <p><code>commercial.referral.{'{customer,sa,epc,fin}'}.{"{A,B,C}"}</code></p>
            <p><code>commercial.no_referral.customer.{"{A,B,C}"}</code></p>
            <p><code>commercial.meta.{'{maxYears,agreementYears,cancelFee}'}</code></p>
            <p><code>residential.referral.{'{customer,sa,epc,fin}'}.{"{A,B,C}"}</code></p>
            <p><code>residential.no_referral.customer.{"{A,B,C}"}</code></p>
            <p><code>partner.upline.{'{onSalesAgent,onEPC,onFinance}'}.{"{A,B,C,annualCap}"}</code></p>
            <p><code>partner.epcAssisted.{'{finance,epc}'}.{"{A,B,C}"}</code> (+ computed remainder)</p>
            <p><code>bonuses.{'{quarterlyCommercial,residential,annual}'}.{"{A,B,C,maxYears,agreementYears}"}</code></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationRules;