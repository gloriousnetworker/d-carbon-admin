import React from "react";
import QuickActions from "./QuickActions";
import Graph from "./Graph";
import RecentRecSales from "./CustomerCards";

export default function DashboardOverview() {
  return (
    <div className="w-full min-h-screen space-y-8 p-4">
      {/* Quick Actions */}
      <QuickActions />

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
