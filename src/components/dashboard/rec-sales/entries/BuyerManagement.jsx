"use client"
import { useState, useEffect } from "react"
import { Filter, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"

const API_URL = "https://services.dcarbon.solutions"

export default function BuyerManagement({ onBack }) {
  const [isNewBuyerModalOpen, setIsNewBuyerModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [buyers, setBuyers] = useState([])
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [filters, setFilters] = useState({
    companyName: '',
    contactName: '',
    email: ''
  })
  
  const [newBuyerData, setNewBuyerData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    fetchBuyers()
  }, [currentPage])

  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/buyers?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.status === 'success') {
        setBuyers(data.data.buyers)
      }
    } catch (error) {
      toast.error('Failed to fetch buyers')
    }
  }

  const handleCreateBuyer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/buyers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBuyerData)
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast.success('Buyer created successfully')
        fetchBuyers()
        setIsNewBuyerModalOpen(false)
        setNewBuyerData({
          companyName: '',
          contactName: '',
          email: '',
          address: ''
        })
      } else {
        toast.error(data.message || 'Failed to create buyer')
      }
    } catch (error) {
      toast.error('Failed to create buyer')
    }
  }

  const handleUpdateBuyer = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/buyers/${selectedBuyer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBuyerData)
      })
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast.success('Buyer updated successfully')
        fetchBuyers()
        setIsEditModalOpen(false)
      } else {
        toast.error(data.message || 'Failed to update buyer')
      }
    } catch (error) {
      toast.error('Failed to update buyer')
    }
  }

  const handleEditBuyer = (buyer) => {
    setSelectedBuyer(buyer)
    setNewBuyerData({
      companyName: buyer.companyName,
      contactName: buyer.contactName,
      email: buyer.email,
      address: buyer.address
    })
    setIsEditModalOpen(true)
  }

  const filteredBuyers = buyers.filter(buyer => {
    return (
      (filters.companyName === '' || buyer.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) &&
      (filters.contactName === '' || buyer.contactName.toLowerCase().includes(filters.contactName.toLowerCase())) &&
      (filters.email === '' || buyer.email.toLowerCase().includes(filters.email.toLowerCase()))
    )
  })

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
        <div className="p-4 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <Input 
                placeholder="Filter by company" 
                value={filters.companyName}
                onChange={(e) => setFilters({...filters, companyName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <Input 
                placeholder="Filter by contact" 
                value={filters.contactName}
                onChange={(e) => setFilters({...filters, contactName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input 
                placeholder="Filter by email" 
                value={filters.email}
                onChange={(e) => setFilters({...filters, email: e.target.value})}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">S/N</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Company Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Address</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer, index) => (
                <tr key={buyer.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">{buyer.companyName}</td>
                  <td className="px-4 py-3 text-sm">{buyer.address}</td>
                  <td className="px-4 py-3 text-sm">{buyer.contactName}</td>
                  <td className="px-4 py-3 text-sm">{buyer.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditBuyer(buyer)}
                    >
                      Edit
                    </Button>
                  </td>
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
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1">Previous</span>
            </button>
            <div className="flex items-center">
              <span className="px-3 py-1">{currentPage}</span>
              <span className="text-gray-500">of</span>
              <span className="px-3 py-1">{Math.ceil(filteredBuyers.length / 10)}</span>
            </div>
            <button 
              className="p-2 rounded-md hover:bg-gray-100 text-[#039994] flex items-center"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredBuyers.length / 10)))}
              disabled={currentPage === Math.ceil(filteredBuyers.length / 10)}
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
        buyerData={newBuyerData}
        setBuyerData={setNewBuyerData}
        onSubmit={handleCreateBuyer}
        mode="create"
      />
      
      <NewBuyerModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        buyerData={newBuyerData}
        setBuyerData={setNewBuyerData}
        onSubmit={handleUpdateBuyer}
        mode="edit"
      />
    </div>
  )
}

function NewBuyerModal({ isOpen, onClose, buyerData, setBuyerData, onSubmit, mode }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#039994]">
            {mode === "create" ? "New Buyer" : "Edit Buyer"}
          </DialogTitle>
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
              <Input 
                placeholder="Company Name" 
                value={buyerData.companyName}
                onChange={(e) => setBuyerData({...buyerData, companyName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <Input 
                placeholder="Contact Name" 
                value={buyerData.contactName}
                onChange={(e) => setBuyerData({...buyerData, contactName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email address
              </label>
              <Input 
                placeholder="name@domain.com" 
                type="email"
                value={buyerData.email}
                onChange={(e) => setBuyerData({...buyerData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input 
                placeholder="Input Address" 
                value={buyerData.address}
                onChange={(e) => setBuyerData({...buyerData, address: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Back
            </Button>
            <Button 
              className="bg-[#039994] hover:bg-[#028a85] text-white"
              onClick={onSubmit}
              disabled={!buyerData.companyName || !buyerData.contactName || !buyerData.email}
            >
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}