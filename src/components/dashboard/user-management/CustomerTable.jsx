import React from "react";
import { Link } from "react-router-dom"; // Import for navigation
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function CustomerTable({ customers }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-y text-sm">
          <th className="py-3 px-4 text-left font-medium">S/N</th>
          <th className="py-3 px-4 text-left font-medium">Name</th>
          <th className="py-3 px-4 text-left font-medium">Cus. Type</th>
          <th className="py-3 px-4 text-left font-medium flex items-center gap-1">
            Utility
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </th>
          <th className="py-3 px-4 text-left font-medium">Finance Com.</th>
          <th className="py-3 px-4 text-left font-medium">Address</th>
          <th className="py-3 px-4 text-left font-medium">Date Reg.</th>
          <th className="py-3 px-4 text-left font-medium flex items-center gap-1">
            Cus. Status
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </th>
          <th className="py-3 px-4 text-left font-medium">Doc. Status</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr
            key={customer.id}
            className="border-b text-sm cursor-pointer"
            onClick={() => window.location.href = `/admin-dashboard/user-management/user-details/${customer.id}`} // Navigate to UserDetails
          >
            <td className="py-3 px-4">{customer.id}</td>
            <td className="py-3 px-4">{customer.name}</td>
            <td className="py-3 px-4">{customer.type}</td>
            <td className="py-3 px-4">{customer.utility}</td>
            <td className="py-3 px-4">{customer.finance}</td>
            <td className="py-3 px-4">{customer.address}</td>
            <td className="py-3 px-4">{customer.date}</td>
            <td className="py-3 px-4">
              <StatusBadge status={customer.status} />
            </td>
            <td className="py-3 px-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {customer.hasIssue ? (
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-teal-500" />
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {customer.hasIssue ? "Document issue" : "Documents verified"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}