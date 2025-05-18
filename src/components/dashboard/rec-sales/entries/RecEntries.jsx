"use client"
import { useState } from "react"
import { Filter, ChevronDown, ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import BuyerManagement from "./BuyerManagement"

export default function RecEntries() {
  const [activeTab, setActiveTab] = useState("rec-entries")
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const tableData = [
    { type: "Sale", transferDate: "16-03-2023", vintageDate: "05-03-2021", recs: "3,321", cec: "Yes", price: "$500", total: "$500.00", party: "3Degrees", beginningInventory: "1,437", endingInventory: "1,437" },
    { type: "Sale", transferDate: "16-03-2023", vintageDate: "05-03-2021", recs: "3,321", cec: "Yes", price: "$500", total: "$500.00", party: "Enron", beginningInventory: "1,437", endingInventory: "1,437" },
    { type: "Sale", transferDate: "16-03-2023", vintageDate: "05-03-2021", recs: "3,321", cec: "Yes", price: "$500", total: "$500.00", party: "Enron", beginningInventory: "1,437", endingInventory: "1,437" },
    { type: "Deposit", transferDate: "16-03-2023", vintageDate: "05-03-2021", recs: "3,321", cec: "Yes", price: "$500", total: "$500.00", party: "WREGIS", beginningInventory: "1,437", endingInventory: "1,437" },
  ]

  return (
    <div className="space-y-6">
      {activeTab === "rec-entries" ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium text-[#039994]">REC Entries</h2>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex items-center bg-white">
                <Filter className="h-4 w-4 mr-2" /> Filter by
              </Button>
              <Button 
                className="bg-[#039994] hover:bg-[#028a85] text-white"
                onClick={() => setIsNewRecModalOpen(true)}
              >
                New REC Sale
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-md shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Transfer Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vintage</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RECs</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">CEC</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Party</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Beginning Inventory</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ending Inventory</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{row.type}</td>
                      <td className="px-4 py-3 text-sm">{row.transferDate}</td>
                      <td className="px-4 py-3 text-sm">{row.vintageDate}</td>
                      <td className="px-4 py-3 text-sm">{row.recs}</td>
                      <td className="px-4 py-3 text-sm">{row.cec}</td>
                      <td className="px-4 py-3 text-sm">{row.price}</td>
                      <td className="px-4 py-3 text-sm">{row.total}</td>
                      <td className="px-4 py-3 text-sm">{row.party}</td>
                      <td className="px-4 py-3 text-sm">{row.beginningInventory}</td>
                      <td className="px-4 py-3 text-sm">{row.endingInventory}</td>
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
          
          <button
            onClick={() => setActiveTab("buyer-management")}
            className="mt-6 text-[#039994] font-medium flex items-center"
          >
            Buyer Management <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </>
      ) : (
        <BuyerManagement onBack={() => setActiveTab("rec-entries")} />
      )}
      
      <NewRecSaleModal
        isOpen={isNewRecModalOpen}
        onClose={() => setIsNewRecModalOpen(false)}
      />
    </div>
  )
}

function NewRecSaleModal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#039994]">New REC Sale</DialogTitle>
        </DialogHeader>
        <div className="border-t border-gray-200 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Date
                </label>
                <div className="relative">
                  <Input placeholder="Input Date" className="pl-3 pr-8" />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vintage Date:
                </label>
                <div className="relative">
                  <Input placeholder="Input Date" className="pl-3 pr-8" />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount of RECs
              </label>
              <Input placeholder="200" defaultValue="200" className="bg-gray-100" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEC?
              </label>
              <Select defaultValue="yes">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="relative">
                <Input placeholder="$200" defaultValue="$200" className="pl-7" />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                REC Buyers
              </label>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose buyer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3degrees">3Degrees</SelectItem>
                  <SelectItem value="enron">Enron</SelectItem>
                  <SelectItem value="wregis">WREGIS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <div className="bg-[#039994] text-white py-3 px-4 rounded-md">
                $200
              </div>
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