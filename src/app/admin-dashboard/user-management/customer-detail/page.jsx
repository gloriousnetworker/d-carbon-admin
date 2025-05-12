import Link from "next/link"
import { ChevronLeft, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function CustomerDetailPage() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/customers" className="flex items-center text-teal-600 font-medium">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Customer Details
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="mr-2 text-sm font-medium">Status</span>
            <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-md text-sm">Pending</span>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            Choose action
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Customer Information Card */}
      <Card className="p-6 border border-teal-100 rounded-lg">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-700 font-medium">Name</span>
            <span className="text-gray-600">Customer Name</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-700 font-medium">Email Address</span>
            <span className="text-gray-600">name@domain.com</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-700 font-medium">Phone number</span>
            <span className="text-gray-600">+234-000-0000-000</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-700 font-medium">Customer Type</span>
            <span className="text-gray-600">Residential</span>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-gray-700 font-medium">Invite date</span>
            <span className="text-gray-600">16-03-2025</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
