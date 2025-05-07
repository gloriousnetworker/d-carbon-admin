import React from "react";

export default function ProgressBar() {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500"></span>
        <span>Invitation sent</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-orange-500"></span>
        <span>Documents Pending</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
        <span>Documents Rejected</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-teal-500"></span>
        <span>Registration Complete</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500"></span>
        <span>Active</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-red-500"></span>
        <span>Terminated</span>
      </div>
    </div>
  );
}