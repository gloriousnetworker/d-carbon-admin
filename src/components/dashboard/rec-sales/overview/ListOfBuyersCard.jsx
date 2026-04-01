"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import CONFIG from "../../../../../lib/config";

export default function ListOfBuyersCard() {
  const [buyers, setBuyers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/rec/buyers`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          throw new Error(`Server responded ${res.status}`);
        }

        const body = await res.json();
        if (body.status === "success" && body.data) {
          setBuyers(body.data.buyers);
          setTotal(body.data.metadata.total);
        } else {
          throw new Error(body.message || "Unknown API error");
        }
      } catch (err) {
        console.error("Error fetching buyers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  return (
    <div className="w-full">
      <Card className="w-full p-4 border border-gray-200 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 8C17 10.2091 14.9853 12 12.5 12C10.0147 12 8 10.2091 8 8C8 5.79086 10.0147 4 12.5 4C14.9853 4 17 5.79086 17 8Z"
                stroke="#039994"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.5 15C8.0815 15 4.5 18.5815 4.5 23H20.5C20.5 18.5815 16.9185 15 12.5 15Z"
                stroke="#039994"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h3 className="text-sm font-semibold text-[#039994] font-sfpro">
              List of Buyers
            </h3>
          </div>
          <span className="text-xs text-[#039994] font-medium font-sfpro">
            ({total}) Buyers
          </span>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center py-4">Error: {error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {buyers.map((buyer) => (
              <div
                key={buyer.id}
                className="flex items-center gap-3 border-b border-gray-100 pb-2"
              >
                <div className="h-2 w-2 rounded-full bg-[#039994]"></div>
                <span className="text-sm text-gray-700">
                  {buyer.companyName}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <button
            className="w-full px-4 py-2 text-sm border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white font-sfpro transition-colors"
          >
            View more
          </button>
        </div>
      </Card>
    </div>
  );
}