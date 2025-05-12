"use client"

import Link from "next/link"
import { ChevronLeft, ChevronDown, SlidersHorizontal, ArrowUpDown, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"

export default function CustomerReportPage() {
  // Sample data for the table
  const customers = [
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recBalance: "20",
      recSold: "20",
      date: "16-03-2025",
    },
  ]

  const [activeTab, setActiveTab] = useState("sales")

  // Sample data for the payouts table
  const payouts = [
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
    {
      name: "Name",
      customerId: "Customer ID",
      address: "Street Address",
      zipcode: "900109",
      avgRecPrice: "$20.00",
      recSold: "20",
      revenueTier: "60%",
      recPayout: "$200.00",
      date: "16-03-2025",
    },
  ]

  return (
    <div className="container mx-auto p-4 max-w-7xl bg-white">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-gray-800 font-medium mb-4">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Customer Report
        </Link>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" className="text-teal-600 font-medium flex items-center">
              Commercial REC Generation
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              Filter by
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              Sort by
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 mb-4">
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${activeTab === "sales" ? "border-teal-600 text-teal-600" : "border-gray-200 text-gray-500"} font-medium`}
          onClick={() => setActiveTab("sales")}
        >
          Commercial REC Sales
        </Button>
        <Button
          variant="ghost"
          className={`rounded-none border-b-2 ${activeTab === "payouts" ? "border-teal-600 text-teal-600" : "border-gray-200 text-gray-500"} font-medium`}
          onClick={() => setActiveTab("payouts")}
        >
          Commercial REC Payouts
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        {activeTab === "sales" ? (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Name</TableHead>
                <TableHead className="font-medium">Customer ID</TableHead>
                <TableHead className="font-medium">Address</TableHead>
                <TableHead className="font-medium">Zipcode</TableHead>
                <TableHead className="font-medium">Avg. REC Price</TableHead>
                <TableHead className="font-medium">REC Balance</TableHead>
                <TableHead className="font-medium">REC Sold</TableHead>
                <TableHead className="font-medium">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, index) => (
                <TableRow key={index} className="border-t border-gray-200">
                  <TableCell className="text-gray-600">{customer.name}</TableCell>
                  <TableCell className="text-gray-600">{customer.customerId}</TableCell>
                  <TableCell className="text-gray-600">{customer.address}</TableCell>
                  <TableCell className="text-gray-600">{customer.zipcode}</TableCell>
                  <TableCell className="text-gray-600">{customer.avgRecPrice}</TableCell>
                  <TableCell className="text-gray-600">{customer.recBalance}</TableCell>
                  <TableCell className="text-gray-600">{customer.recSold}</TableCell>
                  <TableCell className="text-gray-600">{customer.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-medium">Name</TableHead>
                <TableHead className="font-medium">Customer ID</TableHead>
                <TableHead className="font-medium">Address</TableHead>
                <TableHead className="font-medium">Zipcode</TableHead>
                <TableHead className="font-medium">Avg. REC Price</TableHead>
                <TableHead className="font-medium">REC Sold</TableHead>
                <TableHead className="font-medium">Revenue Tier</TableHead>
                <TableHead className="font-medium">REC Payout</TableHead>
                <TableHead className="font-medium">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout, index) => (
                <TableRow key={index} className="border-t border-gray-200">
                  <TableCell className="text-gray-600">{payout.name}</TableCell>
                  <TableCell className="text-gray-600">{payout.customerId}</TableCell>
                  <TableCell className="text-gray-600">{payout.address}</TableCell>
                  <TableCell className="text-gray-600">{payout.zipcode}</TableCell>
                  <TableCell className="text-gray-600">{payout.avgRecPrice}</TableCell>
                  <TableCell className="text-gray-600">{payout.recSold}</TableCell>
                  <TableCell className="text-gray-600">{payout.revenueTier}</TableCell>
                  <TableCell className="text-gray-600">{payout.recPayout}</TableCell>
                  <TableCell className="text-gray-600">{payout.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-6 gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1 mx-2">
          <span className="px-3 py-1 bg-gray-100 rounded-md">1</span>
          <span className="text-gray-500">of</span>
          <span className="text-gray-500">4</span>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
