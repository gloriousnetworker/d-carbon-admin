import React from "react";

export default function StatusBar() {
  return (
    <>
      <div className="flex h-6 mb-4">
        <div className="bg-red-500 w-[15%]"></div>
        <div className="bg-amber-400 w-[25%]"></div>
        <div className="bg-teal-500 w-[35%]"></div>
        <div className="bg-black w-[25%]"></div>
      </div>
      <div className="px-4 pb-2 flex gap-6 text-xs">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500"></span>
          Terminated customers
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          Invited customers
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-teal-500"></span>
          Active customers
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-black"></span>
          Registered customers
        </div>
      </div>
    </>
  );
}