import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, Send, Plus } from "lucide-react";

export default function HeaderSection() {
  return (
    <div className="flex justify-between mb-6">
      <Button variant="outline" className="gap-2">
        <Filter className="h-4 w-4" />
        Filter by
      </Button>
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2 bg-gray-900 text-white hover:bg-gray-800">
          <Send className="h-4 w-4" />
          Send Reminder
        </Button>
        <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
          <Plus className="h-4 w-4" />
          Invite New Customer
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 ml-1"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </Button>
      </div>
    </div>
  );
}