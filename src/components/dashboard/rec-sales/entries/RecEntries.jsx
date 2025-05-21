"use client"
import { useState, useEffect } from "react"
import { Filter, ChevronDown, ChevronLeft, ChevronRight, CalendarIcon, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import BuyerManagement from "./BuyerManagement"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { DatePicker } from "@/components/ui/date-picker"
import toast from "react-hot-toast"

const API_URL = "https://services.dcarbon.solutions"

export default function RecEntries() {
  const [activeTab, setActiveTab] = useState("rec-entries")
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [recEntries, setRecEntries] = useState([])
  const [buyers, setBuyers] = useState([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [filters, setFilters] = useState({
    type: '',
    party: '',
    vintageDate: ''
  })
  const [loading, setLoading] = useState(true)
  const [buyersLoading, setBuyersLoading] = useState(true)
  
  const [newRecData, setNewRecData] = useState({
    transferDate: new Date(),
    vintageDate: new Date(),
    amountOfRecs: 0,
    cec: false,
    recBuyer: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        if (!token) {
          throw new Error('No authentication token found')
        }
        
        await Promise.all([
          fetchRecEntries(),
          fetchCurrentPrice()
        ])
      } catch (error) {
        console.error('Fetch error:', error)
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (isNewRecModalOpen) {
      fetchAllBuyers()
    }
  }, [isNewRecModalOpen])

  const fetchRecEntries = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.status === 'success') {
        setRecEntries(data.data?.entries || [])
      } else {
        setRecEntries([])
        toast.error(data.message || 'Failed to fetch REC entries')
      }
    } catch (error) {
      console.error('Fetch REC entries error:', error)
      setRecEntries([])
      toast.error('Failed to fetch REC entries')
    }
  }

  const fetchAllBuyers = async () => {
    try {
      setBuyersLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/buyers/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.status === 'success') {
        setBuyers(data.data?.buyers || [])
      } else {
        setBuyers([])
        toast.error(data.message || 'Failed to fetch buyers')
      }
    } catch (error) {
      console.error('Fetch buyers error:', error)
      setBuyers([])
      toast.error('Failed to fetch buyers')
    } finally {
      setBuyersLoading(false)
    }
  }

  const fetchCurrentPrice = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/price/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.status === 'success') {
        setCurrentPrice(data.data?.price || 0)
      } else {
        setCurrentPrice(0)
        toast.error(data.message || 'Failed to fetch current price')
      }
    } catch (error) {
      console.error('Fetch current price error:', error)
      setCurrentPrice(0)
      toast.error('Failed to fetch current price')
    }
  }

  const handleCreateRecSale = async () => {
    try {
      if (!newRecData.recBuyer || !newRecData.amountOfRecs) {
        toast.error('Please fill all required fields')
        return
      }

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newRecData,
          transferDate: newRecData.transferDate.toISOString(),
          vintageDate: newRecData.vintageDate.toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast.success('REC sale created successfully')
        fetchRecEntries()
        setIsNewRecModalOpen(false)
        setNewRecData({
          transferDate: new Date(),
          vintageDate: new Date(),
          amountOfRecs: 0,
          cec: false,
          recBuyer: ''
        })
      } else {
        toast.error(data.message || 'Failed to create REC sale')
      }
    } catch (error) {
      console.error('Create REC sale error:', error)
      toast.error('Failed to create REC sale')
    }
  }

  const handleSetPrice = async (price) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/rec/price/set`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ price })
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast.success('Price set successfully')
        setCurrentPrice(price)
      } else {
        toast.error(data.message || 'Failed to set price')
      }
    } catch (error) {
      console.error('Set price error:', error)
      toast.error('Failed to set price')
    }
  }

  const filteredEntries = recEntries.filter(entry => {
    return (
      (filters.type === '' || (entry.type && entry.type.toLowerCase().includes(filters.type.toLowerCase()))) &&
      (filters.party === '' || (entry.party && entry.party.toLowerCase().includes(filters.party.toLowerCase()))) &&
      (filters.vintageDate === '' || (entry.vintageDate && entry.vintageDate.includes(filters.vintageDate)))
    )
  })

  const entriesPerPage = 10
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#039994]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeTab === "rec-entries" ? (
        <>
          <div className="flex justify-between items-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-xl font-medium text-[#039994] focus:outline-none">
                REC Entries <ChevronDown className="ml-2 h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setActiveTab("rec-entries")}
                >
                  REC Entries
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setActiveTab("buyer-management")}
                >
                  Buyer Management
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <div className="p-4 border-b">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <Input 
                    placeholder="Filter by type" 
                    value={filters.type}
                    onChange={(e) => {
                      setFilters({...filters, type: e.target.value})
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                  <Input 
                    placeholder="Filter by party" 
                    value={filters.party}
                    onChange={(e) => {
                      setFilters({...filters, party: e.target.value})
                      setCurrentPage(1)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vintage Date</label>
                  <Input 
                    placeholder="Filter by vintage date (YYYY-MM-DD)" 
                    value={filters.vintageDate}
                    onChange={(e) => {
                      setFilters({...filters, vintageDate: e.target.value})
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </div>
            </div>
            
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
                  {paginatedEntries.length > 0 ? (
                    paginatedEntries.map((entry, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{entry.type || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.transferDate ? format(new Date(entry.transferDate), 'dd-MM-yyyy') : 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.vintageDate ? format(new Date(entry.vintageDate), 'dd-MM-yyyy') : 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.amountOfRecs?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-3 text-sm">{entry.cec ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-sm">${entry.price?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm">${((entry.amountOfRecs || 0) * (entry.price || 0)).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{entry.party || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.beginningInventory?.toLocaleString() || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.endingInventory?.toLocaleString() || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="px-4 py-6 text-center text-sm text-gray-500">
                        No REC entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {filteredEntries.length > 0 && (
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
                    className="p-2 rounded-md hover:bg-gray-100 text-[#039994] flex items-center"
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
        </>
      ) : (
        <BuyerManagement onBack={() => setActiveTab("rec-entries")} />
      )}
      
      <NewRecSaleModal
        isOpen={isNewRecModalOpen}
        onClose={() => setIsNewRecModalOpen(false)}
        buyers={buyers}
        buyersLoading={buyersLoading}
        currentPrice={currentPrice}
        newRecData={newRecData}
        setNewRecData={setNewRecData}
        handleCreateRecSale={handleCreateRecSale}
        handleSetPrice={handleSetPrice}
      />
    </div>
  )
}

function NewRecSaleModal({ 
  isOpen, 
  onClose, 
  buyers, 
  buyersLoading,
  currentPrice,
  newRecData,
  setNewRecData,
  handleCreateRecSale,
  handleSetPrice
}) {
  const [priceInput, setPriceInput] = useState(currentPrice.toString())

  useEffect(() => {
    setPriceInput(currentPrice.toString())
  }, [currentPrice])

  const handlePriceChange = (e) => {
    const value = e.target.value
    if (/^\d*\.?\d*$/.test(value)) {
      setPriceInput(value)
    }
  }

  const handleSavePrice = () => {
    const price = parseFloat(priceInput)
    if (!isNaN(price)) {
      handleSetPrice(price)
    } else {
      toast.error('Please enter a valid price')
    }
  }

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
                <DatePicker
                  selected={newRecData.transferDate}
                  onChange={(date) => setNewRecData({...newRecData, transferDate: date})}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vintage Date
                </label>
                <DatePicker
                  selected={newRecData.vintageDate}
                  onChange={(date) => setNewRecData({...newRecData, vintageDate: date})}
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount of RECs *
              </label>
              <Input 
                placeholder="200" 
                type="number"
                min="0"
                step="0.01"
                value={newRecData.amountOfRecs || ''}
                onChange={(e) => setNewRecData({...newRecData, amountOfRecs: parseFloat(e.target.value) || 0})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEC?
              </label>
              <Select 
                value={newRecData.cec ? "yes" : "no"}
                onValueChange={(value) => setNewRecData({...newRecData, cec: value === "yes"})}
              >
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
                Current REC Price
              </label>
              <div className="flex items-center gap-2">
                <Input 
                  value={priceInput}
                  onChange={handlePriceChange}
                  className="flex-1"
                />
                <Button 
                  className="bg-[#039994] hover:bg-[#028a85] text-white"
                  onClick={handleSavePrice}
                >
                  Set Price
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                REC Buyers *
              </label>
              {buyersLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#039994]"></div>
                </div>
              ) : (
                <Select
                  value={newRecData.recBuyer}
                  onValueChange={(value) => setNewRecData({...newRecData, recBuyer: value})}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.length > 0 ? (
                      buyers.map((buyer) => (
                        <SelectItem key={buyer.id} value={buyer.id.toString()}>
                          {buyer.companyName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-buyers" disabled>
                        No buyers available. Please add buyers first.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <div className="bg-[#039994] text-white py-3 px-4 rounded-md">
                ${((newRecData.amountOfRecs || 0) * currentPrice).toFixed(2)}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Back
            </Button>
            <Button 
              className="bg-[#039994] hover:bg-[#028a85] text-white"
              onClick={handleCreateRecSale}
              disabled={!newRecData.recBuyer || !newRecData.amountOfRecs || buyersLoading}
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}