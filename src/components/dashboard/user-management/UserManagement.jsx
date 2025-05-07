"use client"

import React, { useState } from "react";
import HeaderSection from "./HeaderSection";
import StatusBar from "./StatusBar";
import CustomerTable from "./CustomerTable";
import Pagination from "./Pagination";
import customers from "./customersData";

export default function UserManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Calculate the index range for the current page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = customers.slice(indexOfFirstUser, indexOfLastUser);

  // Calculate total pages
  const totalPages = Math.ceil(customers.length / usersPerPage);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-10">
          {/* Header Section */}
          <HeaderSection />

          {/* Card Content */}
          <div className="mb-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-teal-500">Customer Management</h2>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-teal-500"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
            </div>

            {/* Status Bar */}
            <StatusBar />

            {/* Customer Table */}
            <CustomerTable customers={currentUsers} />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}