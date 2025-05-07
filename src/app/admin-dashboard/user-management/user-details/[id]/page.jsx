"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // For dynamic routing
import CustomerDetails from "@/components/dashboard/user-management/UserDetails/CustomerDetails";
import ProgressBar from "@/components/dashboard/user-management/UserDetails/ProgressBar";
import DocumentationTable from "@/components/dashboard/user-management/UserDetails/DocumentationTable";
import { lazy, Suspense } from "react"; // Import lazy and Suspense

// Dynamically import customer data
const customersData = lazy(() => import("@/components/dashboard/user-management/customersData"));

export default function UserDetails() {
  const { id } = useParams(); // Get the user ID from the URL
  const [customer, setCustomer] = useState(null);

  // Fetch customer data based on the ID
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        // Dynamically load customer data
        const { default: customers } = await customersData();

        // Find the customer based on the ID
        const selectedCustomer = customers.find((c) => c.id === parseInt(id));
        if (selectedCustomer) {
          setCustomer(selectedCustomer);
        } else {
          console.error(`Customer with ID ${id} not found.`);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    if (id) {
      fetchCustomer();
    }
  }, [id]);

  return (
    <div className="flex flex-col h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between mb-6 items-center">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-gray-500"
          >
            <path d="M19 19L5 5"></path>
            <path d="M19 5v9a2 2 0 0 1-2 2H5"></path>
          </svg>
          <h1 className="text-xl font-medium text-teal-500">Customer Details</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md">
            Choose action
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 ml-2"
            >
              <path d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <label className="flex items-center gap-2">
            <span>Activate System</span>
            <input type="checkbox" className="form-checkbox h-5 w-5" />
          </label>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-red-500"
          >
            <path d="M21 4H3"></path>
            <path d="M21 12H3"></path>
            <path d="M21 20H3"></path>
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Customer Details */}
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        {customer && <CustomerDetails customer={customer} />}
      </Suspense>

      {/* User Agreement e-signature */}
      <div className="mt-6">
        <h2 className="text-lg font-medium">User Agreement e-signature</h2>
        <div className="mt-2">
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md flex items-center justify-between w-full">
            View User Agreement
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
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md flex items-center justify-between w-full mt-2">
            View E-Signature
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
          </button>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-6">
        <h2 className="text-lg font-medium">Documentation</h2>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          {customer && <DocumentationTable customer={customer} />}
        </Suspense>
      </div>
    </div>
  );
}