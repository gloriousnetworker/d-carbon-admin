import React from "react";

export default function StatusBadge({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case "Registered":
        return "bg-black text-white";
      case "Active":
        return "bg-teal-500 text-white";
      case "Invited":
        return "bg-amber-400 text-black";
      case "Terminated":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles()}`}>{status}</span>;
}