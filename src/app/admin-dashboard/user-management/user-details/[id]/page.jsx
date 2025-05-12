import Link from "next/link"
import { ChevronLeft, Eye, Download, Trash2, ChevronDown, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"

export default function CustomerDetailsPage() {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/customers" className="flex items-center text-teal-600 font-medium">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Customer Details
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center gap-2">
            <span>Choose action</span>
            <ChevronDown className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2">
            <span>Activate System</span>
            <Switch />
          </div>
          <Button variant="ghost" size="icon" className="text-red-500">
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full w-full">
          <div className="h-2 bg-black rounded-full w-[20%]"></div>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-black mr-1"></div>
            <span>Invitation sent</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1"></div>
            <span>Documents Pending</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
            <span>Documents Rejected</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span>Registration Complete</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
            <span>Active</span>
          </div>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-red-500 mr-1"></div>
            <span>Terminated</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card className="p-6 border border-teal-100 rounded-lg">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Name</span>
              <span className="text-gray-500">Customer Name</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Email Address</span>
              <span className="text-gray-500">name@domain.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Phone number</span>
              <span className="text-gray-500">+234-000-0000-000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Customer Type</span>
              <span className="text-gray-500">Residential</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Utility Provider</span>
              <span className="text-gray-500">Utility</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">kW System Size</span>
              <span className="text-gray-500">200</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Meter ID</span>
              <span className="text-gray-500">Meter ID</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Address</span>
              <span className="text-gray-500">Address</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Date Registered</span>
              <span className="text-gray-500">16-03-2025</span>
            </div>
          </div>
        </Card>

        {/* User Agreement */}
        <div className="space-y-4">
          <h3 className="text-teal-600 font-medium text-lg">User Agreement e-signature</h3>

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-between">
              <span>View User Agreement</span>
              <Eye className="h-4 w-4" />
            </Button>

            <Button variant="outline" className="w-full justify-between">
              <span>View E-Signature</span>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                <Download className="h-4 w-4" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Documentation */}
      <div className="mt-8">
        <h3 className="text-teal-600 font-medium text-lg mb-4">Documentation</h3>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-3 py-4 border-b border-gray-200">
            <div className="text-gray-700">NEM Agreement (NEM)</div>
            <div className="flex items-center">
              <Button variant="outline" className="mr-2">
                <span className="mr-2">Doc1.jpg</span>
                <Eye className="h-4 w-4" />
              </Button>
              <Download className="h-4 w-4 cursor-pointer" />
            </div>
            <div className="flex justify-end">
              <span className="bg-teal-100 text-teal-600 px-3 py-1 rounded-md text-sm">Approved</span>
            </div>
          </div>

          <div className="grid grid-cols-3 py-4 border-b border-gray-200">
            <div className="text-gray-700">Meter ID Photo</div>
            <div className="flex items-center">
              <Button variant="outline" className="mr-2">
                <span className="mr-2">Upload Document</span>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm">Required</span>
            </div>
          </div>

          <div className="grid grid-cols-3 py-4 border-b border-gray-200">
            <div className="text-gray-700">Installer Agreement</div>
            <div className="flex items-center">
              <Button variant="outline" className="mr-2">
                <span className="mr-2">Doc1.jpg</span>
                <Eye className="h-4 w-4" />
              </Button>
              <Download className="h-4 w-4 cursor-pointer" />
            </div>
            <div className="flex justify-end">
              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-md text-sm">Pending</span>
            </div>
          </div>

          <div className="grid grid-cols-3 py-4 border-b border-gray-200">
            <div className="text-gray-700">Single Line Diagram</div>
            <div className="flex items-center">
              <Button variant="outline" className="mr-2">
                <span className="mr-2">Doc1.jpg</span>
                <Eye className="h-4 w-4" />
              </Button>
              <Download className="h-4 w-4 cursor-pointer" />
            </div>
            <div className="flex justify-end">
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-md text-sm">Rejected</span>
            </div>
          </div>

          <div className="grid grid-cols-3 py-4 border-b border-gray-200">
            <div className="text-gray-700">Utility PTO Letter</div>
            <div className="flex items-center">
              <Button variant="outline" className="mr-2">
                <span className="mr-2">Doc1.jpg</span>
                <Eye className="h-4 w-4" />
              </Button>
              <Download className="h-4 w-4 cursor-pointer" />
            </div>
            <div className="flex justify-end">
              <span className="bg-teal-100 text-teal-600 px-3 py-1 rounded-md text-sm">Approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
