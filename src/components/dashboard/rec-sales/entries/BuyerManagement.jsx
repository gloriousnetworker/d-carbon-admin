"use client"
import { useState } from "react"
import { Filter, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function BuyerManagement({ onBack }) {
  const [isNewBuyerModalOpen, setIsNewBuyerModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const tableData = [
    { sn: 1, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 2, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 3, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 4, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 5, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 6, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 7, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 8, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 9, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 10, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
    { sn: 11, companyName: "Name", address: "Address", contactName: "Contact Name", contactEmail: "name@domain.com", recPrice: "$500", recsSold: "3,321" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-[#039994] flex items-center">
          <button onClick={onBack} className="mr-2">
            <ChevronDown className="h-5 w-5 transform rotate-90" />
          </button>
          Buyer Management
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center bg-white">
            <Filter className="h-4 w-4 mr-2" /> Filter by
          </Button>
          <Button 
            className="bg-[#039994] hover:bg-[#028a85] text-white"
            onClick={() => setIsNewBuyerModalOpen(true)}
          >
            New Buyer
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-md shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">S/N</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Company Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">REC Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RECs Sold</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.sn} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{row.sn}</td>
                  <td className="px-4 py-3 text-sm">{row.companyName}</td>
                  <td className="px-4 py-3 text-sm">{row.address}</td>
                  <td className="px-4 py-3 text-sm">{row.contactName}</td>
                  <td className="px-4 py-3 text-sm">{row.contactEmail}</td>
                  <td className="px-4 py-3 text-sm">{row.recPrice}</td>
                  <td className="px-4 py-3 text-sm">{row.recsSold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 rounded-md hover:bg-gray-100 text-gray-500 flex items-center"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Previous</span>
            </button>
            <div className="flex items-center">
              <span className="px-3 py-1">{currentPage}</span>
              <span className="text-gray-500">of</span>
              <span className="px-3 py-1">4</span>
            </div>
            <button 
              className="p-2 rounded-md hover:bg-gray-100 text-[#039994] flex items-center"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, 4))}
            >
              <span className="mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <NewBuyerModal 
        isOpen={isNewBuyerModalOpen}
        onClose={() => setIsNewBuyerModalOpen(false)}
      />
    </div>
  )
}

function NewBuyerModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#039994]">New Buyer</DialogTitle>
          <button 
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <Input placeholder="Company Name" className="bg-gray-100" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <Input placeholder="Contact Name" className="bg-gray-100" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email address
              </label>
              <Input placeholder="name@domain.com" className="bg-gray-100" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input placeholder="Input Address" className="bg-gray-100" />
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Back
            </Button>
            <Button 
              className="bg-[#039994] hover:bg-[#028a85] text-white"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}