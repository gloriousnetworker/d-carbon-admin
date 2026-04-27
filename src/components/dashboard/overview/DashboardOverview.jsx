import React from "react";
import QuickActions from "./QuickActions";
import Graph from "./Graph";
import RecentRecSales from "./CustomerCards";
import DcarbonEarningsCard from "./DcarbonEarningsCard";

export default function DashboardOverview() {
  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      {/* Quick Actions */}
      <QuickActions />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* DCarbon Platform Earnings — residual cut from each commission run.
          Backed by GET /api/admin/dcarbon-earnings, which aggregates the
          Commission rows the calc writes with userType='DCARBON'. */}
      <DcarbonEarningsCard />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Graphs & Side Cards */}
      <Graph />

      {/* Separator */}
      <hr className="border-gray-300" />

      {/* Recent REC Sales Table */}
      <RecentRecSales />
    </div>
  );
}
