"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Sample data for the payout table
const payoutData = [
  { id: 1, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 2, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 3, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 4, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Completed" },
  { id: 5, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 6, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 7, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 8, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 9, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 10, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 11, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
  { id: 12, name: "Name", residentId: "Resident ID", paymentId: "Payment ID", pointRedeemed: "3000", totalAmount: "$200.00", date: "16-03-2025", status: "Pending" },
]

export default function PayoutProcessing() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  // Status badge component with appropriate colors
  const StatusBadge = ({ status }) => {
    const getStatusStyles = () => {
      switch (status) {
        case "Completed":
          return "text-teal-500"
        case "Pending":
          return "text-amber-500"
        default:
          return "text-gray-500"
      }
    }

    return <span className={`font-medium ${getStatusStyles()}`}>{status}</span>
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-medium text-teal-500 flex items-center">
              Residential Redemption Payout
              <ChevronDown className="h-5 w-5 ml-2 text-teal-500" />
            </h2>
            <Button variant="outline" className="gap-2">
              <span>Filter by</span>
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-y text-sm">
                  <th className="py-3 px-4 text-left font-medium">S/N</th>
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Resident ID</th>
                  <th className="py-3 px-4 text-left font-medium">Payment ID</th>
                  <th className="py-3 px-4 text-left font-medium">Point Redeemed</th>
                  <th className="py-3 px-4 text-left font-medium">Total Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Payout status</th>
                </tr>
              </thead>
              <tbody>
                {payoutData.map((item) => (
                  <tr key={item.id} className="border-b text-sm hover:bg-gray-50">
                    <td className="py-3 px-4">{item.id}</td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">{item.residentId}</td>
                    <td className="py-3 px-4">{item.paymentId}</td>
                    <td className="py-3 px-4">{item.pointRedeemed}</td>
                    <td className="py-3 px-4">{item.totalAmount}</td>
                    <td className="py-3 px-4">{item.date}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
