// src/components/modals/CurrentStatementModal.jsx

import React from "react";
import { backArrow, pageTitle } from "../styles";

export default function CurrentStatementModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
      <div className="relative bg-white p-8 rounded-lg w-full max-w-md">
        <div className={backArrow} onClick={onClose}>
          &#8592; Back
        </div>
        <h2 className={pageTitle}>Current Statement</h2>
        <div>
          <p className="text-sm text-gray-700">
            Content for current statement.
          </p>
          {/* Add your content here */}
        </div>
      </div>
    </div>
  );
}
