import React from "react";

export default function DocumentationTable({ customer }) {
  const documents = [
    { label: "NEM Agreement (NEM)", status: "Approved", file: "Doc1.jpg" },
    { label: "Meter ID Photo", status: "Required", file: null },
    { label: "Installer Agreement", status: "Pending", file: "Doc1.jpg" },
    { label: "Single Line Diagram", status: "Rejected", file: "Doc1.jpg" },
    { label: "Utility PTO Letter", status: "Approved", file: "Doc1.jpg" },
  ];

  return (
    <table className="w-full mt-4">
      <thead>
        <tr>
          <th className="py-2 px-4 text-left">Document</th>
          <th className="py-2 px-4 text-left">File</th>
          <th className="py-2 px-4 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc, index) => (
          <tr key={index}>
            <td className="py-2 px-4">{doc.label}</td>
            <td className="py-2 px-4">
              {doc.file ? (
                <span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="18" y2="18"></line>
                    <line x1="12" y1="12" x2="16" y2="12"></line>
                  </svg>
                  {doc.file}
                </span>
              ) : (
                "Upload Document"
              )}
            </td>
            <td className="py-2 px-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  doc.status === "Approved"
                    ? "bg-green-200 text-green-800"
                    : doc.status === "Pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {doc.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}