"use client"
import { useState, useEffect } from "react"
import { Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

const API_URL = "https://services.dcarbon.solutions"

export default function BuyerManagement({ onBack }) {
  const { toast } = useToast()
  const [isNewBuyerModalOpen, setIsNewBuyerModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [buyers, setBuyers] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [filters, setFilters] = useState({
    companyName: '',
    contactName: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  
  const [newBuyerData, setNewBuyerData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    fetchBuyers()
  }, [currentPage])

  const validateForm = () => {
    const errors = {}
    
    if (!newBuyerData.companyName.trim()) {
      errors.companyName = "Company name is required"
    }
    
    if (!newBuyerData.contactName.trim()) {
      errors.contactName = "Contact name is required"
    }
    
    if (!newBuyerData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newBuyerData.email)) {
      errors.email = "Please enter a valid email address"
    }
    
    if (!newBuyerData.address.trim()) {
      errors.address = "Address is required"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const fetchBuyers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/api/rec/buyers?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      if (data.status === 'success') {
        setBuyers(data.data.buyers || [])
        setTotalPages(data.data.totalPages || 1)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch buyers",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Fetch buyers error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch buyers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBuyer = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill all required fields correctly",
        variant: "destructive"
      })
      return
    }

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
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Buyer created successfully"
        })
        fetchBuyers()
        setIsNewBuyerModalOpen(false)
        setNewBuyerData({
          companyName: '',
          contactName: '',
          email: '',
          address: ''
        })
        setFormErrors({})
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create buyer",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Create buyer error:', error)
      toast({
        title: "Error",
        description: "Failed to create buyer",
        variant: "destructive"
      })
    }
  }

  const handleUpdateBuyer = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill all required fields correctly",
        variant: "destructive"
      })
      return
    }

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
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Buyer updated successfully"
        })
        fetchBuyers()
        setIsEditModalOpen(false)
        setFormErrors({})
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update buyer",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Update buyer error:', error)
      toast({
        title: "Error",
        description: "Failed to update buyer",
        variant: "destructive"
      })
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
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  const filteredBuyers = buyers.filter(buyer => {
    return (
      (filters.companyName === '' || (buyer.companyName && buyer.companyName.toLowerCase().includes(filters.companyName.toLowerCase()))) &&
      (filters.contactName === '' || (buyer.contactName && buyer.contactName.toLowerCase().includes(filters.contactName.toLowerCase()))) &&
      (filters.email === '' || (buyer.email && buyer.email.toLowerCase().includes(filters.email.toLowerCase())))
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    )
  }

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
            onClick={() => {
              setNewBuyerData({
                companyName: '',
                contactName: '',
                email: '',
                address: ''
              })
              setFormErrors({})
              setIsNewBuyerModalOpen(true)
            }}
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
              {filteredBuyers.length > 0 ? (
                filteredBuyers.map((buyer, index) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                    No buyers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredBuyers.length > 0 && (
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
                <span className="px-3 py-1">{totalPages}</span>
              </div>
              <button 
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 flex items-center"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <span className="mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isNewBuyerModalOpen} onOpenChange={setIsNewBuyerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Buyer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter company name"
                value={newBuyerData.companyName}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, companyName: e.target.value})
                  if (formErrors.companyName) setFormErrors({...formErrors, companyName: ''})
                }}
              />
              {formErrors.companyName && (
                <p className="text-sm text-red-500">{formErrors.companyName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter contact name"
                value={newBuyerData.contactName}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, contactName: e.target.value})
                  if (formErrors.contactName) setFormErrors({...formErrors, contactName: ''})
                }}
              />
              {formErrors.contactName && (
                <p className="text-sm text-red-500">{formErrors.contactName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email"
                value={newBuyerData.email}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, email: e.target.value})
                  if (formErrors.email) setFormErrors({...formErrors, email: ''})
                }}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter address"
                value={newBuyerData.address}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, address: e.target.value})
                  if (formErrors.address) setFormErrors({...formErrors, address: ''})
                }}
              />
              {formErrors.address && (
                <p className="text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsNewBuyerModalOpen(false)
                  setFormErrors({})
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#039994] hover:bg-[#028a85] text-white"
                onClick={handleCreateBuyer}
              >
                Create Buyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Buyer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter company name"
                value={newBuyerData.companyName}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, companyName: e.target.value})
                  if (formErrors.companyName) setFormErrors({...formErrors, companyName: ''})
                }}
              />
              {formErrors.companyName && (
                <p className="text-sm text-red-500">{formErrors.companyName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Contact Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter contact name"
                value={newBuyerData.contactName}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, contactName: e.target.value})
                  if (formErrors.contactName) setFormErrors({...formErrors, contactName: ''})
                }}
              />
              {formErrors.contactName && (
                <p className="text-sm text-red-500">{formErrors.contactName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter email"
                value={newBuyerData.email}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, email: e.target.value})
                  if (formErrors.email) setFormErrors({...formErrors, email: ''})
                }}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Address <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter address"
                value={newBuyerData.address}
                onChange={(e) => {
                  setNewBuyerData({...newBuyerData, address: e.target.value})
                  if (formErrors.address) setFormErrors({...formErrors, address: ''})
                }}
              />
              {formErrors.address && (
                <p className="text-sm text-red-500">{formErrors.address}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false)
                  setFormErrors({})
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#039994] hover:bg-[#028a85] text-white"
                onClick={handleUpdateBuyer}
              >
                Update Buyer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}