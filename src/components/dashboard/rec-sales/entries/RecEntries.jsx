"use client"
import { useState, useEffect } from "react"
import { Filter, ChevronDown, ChevronLeft, ChevronRight, CalendarIcon, X, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BuyerManagement from "./BuyerManagement"
import { format } from "date-fns"
import toast from "react-hot-toast"
import CONFIG from "@/lib/config"

const styles = {
  mainContainer: 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white',
  headingContainer: 'relative w-full flex flex-col items-center mb-2',
  backArrow: 'absolute left-4 top-0 text-[#039994] cursor-pointer z-10',
  pageTitle: 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center',
  progressContainer: 'w-full max-w-md flex items-center justify-between mb-6',
  progressBarWrapper: 'flex-1 h-1 bg-gray-200 rounded-full mr-4',
  progressBarActive: 'h-1 bg-[#039994] w-2/3 rounded-full',
  progressStepText: 'text-sm font-medium text-gray-500 font-sfpro',
  formWrapper: 'w-full max-w-md space-y-6',
  labelClass: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  selectClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#626060] bg-white',
  inputClass: 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  fileInputWrapper: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  noteText: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  rowWrapper: 'flex space-x-4',
  halfWidth: 'w-1/2',
  grayPlaceholder: 'bg-[#E8E8E8]',
  buttonPrimary: 'w-full rounded-md bg-[#039994] text-white font-semibold py-2 hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  spinnerOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20',
  spinner: 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin',
  termsTextContainer: 'mt-6 text-center font-sfpro text-[10px] font-[800] leading-[100%] tracking-[-0.05em] underline text-[#1E1E1E]',
  uploadHeading: 'block mb-2 font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]',
  uploadFieldWrapper: 'flex items-center space-x-3',
  uploadInputLabel: 'relative flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#039994] cursor-pointer font-sfpro',
  uploadIconContainer: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400',
  uploadButtonStyle: 'px-4 py-2 bg-[#039994] text-white rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro',
  uploadNoteStyle: 'mt-2 font-sfpro text-[12px] leading-[100%] tracking-[-0.05em] font-[300] italic text-[#1E1E1E]',
  totalAmountBox: 'bg-[#039994] text-white py-3 px-4 rounded-md font-sfpro text-[14px] leading-[100%] tracking-[-0.05em]'
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-10 bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

function CustomSelect({ value, onValueChange, placeholder, children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")

  useEffect(() => {
    const findLabel = (children) => {
      if (Array.isArray(children)) {
        for (const child of children) {
          if (child.props?.value === value) {
            return child.props.children
          }
        }
      } else if (children?.props?.value === value) {
        return children.props.children
      }
      return ""
    }
    setSelectedLabel(findLabel(children))
  }, [value, children])

  return (
    <div className="relative">
      <button
        type="button"
        className={`${styles.selectClass} ${className} flex items-center justify-between`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedLabel ? "text-[#1E1E1E]" : "text-[#626060]"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {Array.isArray(children) ? 
            children.map((child, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none font-sfpro"
                onClick={() => {
                  onValueChange(child.props.value)
                  setIsOpen(false)
                }}
                disabled={child.props.disabled}
              >
                {child.props.children}
              </button>
            )) :
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none font-sfpro"
              onClick={() => {
                onValueChange(children.props.value)
                setIsOpen(false)
              }}
              disabled={children.props.disabled}
            >
              {children.props.children}
            </button>
          }
        </div>
      )}
    </div>
  )
}

function CustomDatePicker({ selected, onChange, className = "" }) {
  const formatDate = (date) => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  const handleDateChange = (e) => {
    const dateValue = e.target.value
    if (dateValue) {
      onChange(new Date(dateValue))
    }
  }

  return (
    <div className="relative">
      <input
        type="date"
        value={formatDate(selected)}
        onChange={handleDateChange}
        className={`${styles.inputClass} ${className}`}
      />
      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  )
}

function CustomDropdownMenu({ trigger, children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-48">
            {children.map((child, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none font-sfpro"
                onClick={() => {
                  child.props.onClick()
                  setIsOpen(false)
                }}
              >
                {child.props.children}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function RecEntries() {
  const [activeTab, setActiveTab] = useState("rec-entries")
  const [isNewRecModalOpen, setIsNewRecModalOpen] = useState(false)
  const [recEntries, setRecEntries] = useState([])
  const [metadata, setMetadata] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [buyers, setBuyers] = useState([])
  const [currentPrice, setCurrentPrice] = useState(0)
  const [filters, setFilters] = useState({
    type: '',
    party: '',
    vintageDate: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)
  const [buyersLoading, setBuyersLoading] = useState(true)
  const [buyerNames, setBuyerNames] = useState({})
  
  const [newRecData, setNewRecData] = useState({
    transferDate: new Date(),
    vintageDate: new Date(),
    salesDate: new Date(),
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
          fetchRecEntries(1),
          fetchCurrentPrice(),
          fetchBuyers()
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
      fetchBuyers()
    }
  }, [isNewRecModalOpen])

  useEffect(() => {
    const names = {}
    buyers.forEach(buyer => {
      names[buyer.id] = buyer.companyName
    })
    setBuyerNames(names)
  }, [buyers])

  const fetchRecEntries = async (page = 1) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/rec`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.status === 'success') {
        setRecEntries(data.data?.recSales || [])
        setMetadata(data.data?.metadata || {
          total: 0,
          page: page,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      } else {
        setRecEntries([])
        setMetadata({
          total: 0,
          page: page,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
        toast.error(data.message || 'Failed to fetch REC entries')
      }
    } catch (error) {
      console.error('Fetch REC entries error:', error)
      setRecEntries([])
      toast.error('Failed to fetch REC entries')
    }
  }

  const fetchBuyers = async () => {
    try {
      setBuyersLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/rec/buyers`, {
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
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/rec/price/current`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        setCurrentPrice(0)
        return
      }
      const data = await response.json()
      if (data.status === 'success') {
        setCurrentPrice(data.data?.price || 0)
      } else {
        setCurrentPrice(0)
      }
    } catch (error) {
      console.error('Fetch current price error:', error)
      setCurrentPrice(0)
    }
  }

  const handleCreateRecSale = async () => {
    try {
      if (!newRecData.recBuyer || !newRecData.amountOfRecs) {
        toast.error('Please fill all required fields')
        return
      }

      const token = localStorage.getItem('authToken')
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/rec/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newRecData,
          transferDate: newRecData.transferDate.toISOString(),
          vintageDate: newRecData.vintageDate.toISOString(),
          createdAt: newRecData.salesDate.toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()
      
      if (data.status === 'success') {
        toast.success('REC sale created successfully')
        fetchRecEntries(metadata.page)
        setIsNewRecModalOpen(false)
        setNewRecData({
          transferDate: new Date(),
          vintageDate: new Date(),
          salesDate: new Date(),
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
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/rec/price/set`, {
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

  const handlePageChange = (newPage) => {
    fetchRecEntries(newPage)
  }

  const filteredEntries = recEntries.filter(entry => {
    const buyerName = buyerNames[entry.recBuyer] || ''
    return (
      (filters.type === '' || (entry.status && entry.status.toLowerCase().includes(filters.type.toLowerCase()))) &&
      (filters.party === '' || buyerName.toLowerCase().includes(filters.party.toLowerCase())) &&
      (filters.vintageDate === '' || (entry.vintageDate && entry.vintageDate.includes(filters.vintageDate)))
    )
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border border-gray-200 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#039994]" />
        <span className="text-sm text-gray-500 font-sfpro mt-3">Loading REC entries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeTab === "rec-entries" ? (
        <>
          <div className="flex justify-between items-center">
            <CustomDropdownMenu
              trigger={
                <div className="flex items-center text-sm font-semibold text-[#039994] font-sfpro cursor-pointer focus:outline-none">
                  REC Entries <ChevronDown className="ml-2 h-4 w-4" />
                </div>
              }
            >
              <div onClick={() => setActiveTab("rec-entries")}>
                REC Entries
              </div>
              <div onClick={() => setActiveTab("buyer-management")}>
                Buyer Management
              </div>
            </CustomDropdownMenu>
            <div className="flex space-x-2">
              <button
                className={`flex items-center gap-2 px-3 py-2 text-sm border border-[#039994] rounded-md font-sfpro transition-colors ${showFilters ? "bg-[#039994] text-white" : "text-[#039994] hover:bg-[#039994] hover:text-white"}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" /> Filter by
              </button>
              <button
                className="px-4 py-2 bg-[#039994] hover:bg-[#02857f] text-white text-sm rounded-md font-sfpro transition-colors"
                onClick={() => setIsNewRecModalOpen(true)}
              >
                New REC Sale
              </button>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            {showFilters && (
              <div className="p-4 border-b">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={styles.labelClass}>Type</label>
                    <Input
                      placeholder="Filter by status"
                      value={filters.type}
                      onChange={(e) => {
                        setFilters({...filters, type: e.target.value})
                      }}
                      className={styles.inputClass}
                    />
                  </div>
                  <div>
                    <label className={styles.labelClass}>Party</label>
                    <Input
                      placeholder="Filter by buyer"
                      value={filters.party}
                      onChange={(e) => {
                        setFilters({...filters, party: e.target.value})
                      }}
                      className={styles.inputClass}
                    />
                  </div>
                  <div>
                    <label className={styles.labelClass}>Vintage Date</label>
                    <Input
                      placeholder="Filter by vintage date (YYYY-MM-DD)"
                      value={filters.vintageDate}
                      onChange={(e) => {
                        setFilters({...filters, vintageDate: e.target.value})
                      }}
                      className={styles.inputClass}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Transfer Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Vintage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">RECs Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">CEC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Price per REC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Total Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Balance Before</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Balance After</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">% Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium font-sfpro text-[#1E1E1E]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors duration-100">
                        <td className="px-4 py-3 text-sm">SALE</td>
                        <td className="px-4 py-3 text-sm">{entry.transferDate ? format(new Date(entry.transferDate), 'dd-MM-yyyy') : 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.vintageDate ? format(new Date(entry.vintageDate), 'dd-MM-yyyy') : 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.totalSoldRecs?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-3 text-sm">{entry.cec ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-sm">${entry.pricePerRec?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm">${entry.price?.toFixed(2) || '0.00'}</td>
                        <td className="px-4 py-3 text-sm">{buyerNames[entry.recBuyer] || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{entry.recBalanceBeforeSales?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-3 text-sm">{entry.recBalanceAfterSales?.toLocaleString() || '0'}</td>
                        <td className="px-4 py-3 text-sm">{entry.percentageSold?.toFixed(2) || '0'}%</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium font-sfpro ${entry.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {entry.status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="px-4 py-6 text-center text-sm text-gray-500">
                        No REC entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {metadata.total > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-600">
                  Showing {((metadata.page - 1) * metadata.limit) + 1} to {Math.min(metadata.page * metadata.limit, metadata.total)} of {metadata.total} entries
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="flex items-center px-3 py-1 text-sm border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white font-sfpro disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(metadata.page - 1)}
                    disabled={!metadata.hasPrevPage}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 font-sfpro px-1">
                    {metadata.page} of {metadata.totalPages}
                  </span>
                  <button
                    className="flex items-center px-3 py-1 text-sm border border-[#039994] text-[#039994] rounded-md hover:bg-[#039994] hover:text-white font-sfpro disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(metadata.page + 1)}
                    disabled={!metadata.hasNextPage}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#1E1E1E] font-sfpro">New REC Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className={styles.rowWrapper}>
            <div className={styles.halfWidth}>
              <label className={styles.labelClass}>
                Transfer Date
              </label>
              <CustomDatePicker
                selected={newRecData.transferDate}
                onChange={(date) => setNewRecData({...newRecData, transferDate: date})}
              />
            </div>
            <div className={styles.halfWidth}>
              <label className={styles.labelClass}>
                Vintage Date
              </label>
              <CustomDatePicker
                selected={newRecData.vintageDate}
                onChange={(date) => setNewRecData({...newRecData, vintageDate: date})}
              />
            </div>
          </div>

          <div className={styles.rowWrapper}>
            <div className={styles.halfWidth}>
              <label className={styles.labelClass}>
                Sales Date
              </label>
              <CustomDatePicker
                selected={newRecData.salesDate}
                onChange={(date) => setNewRecData({...newRecData, salesDate: date})}
              />
            </div>
            <div className={styles.halfWidth}>
              <label className={styles.labelClass}>
                Amount of RECs *
              </label>
              <Input 
                placeholder="200" 
                type="number"
                min="0"
                step="1"
                value={newRecData.amountOfRecs || ''}
                onChange={(e) => setNewRecData({...newRecData, amountOfRecs: parseInt(e.target.value, 10) || 0})}
                className={styles.inputClass}
              />
            </div>
          </div>
          
          <div>
            <label className={styles.labelClass}>
              CEC?
            </label>
            <CustomSelect 
              value={newRecData.cec ? "yes" : "no"}
              onValueChange={(value) => setNewRecData({...newRecData, cec: value === "yes"})}
              placeholder="Select"
            >
              <div value="yes">Yes</div>
              <div value="no">No</div>
            </CustomSelect>
          </div>
          
          <div>
            <label className={styles.labelClass}>
              Current REC Price
            </label>
            <div className="flex items-center gap-2">
              <Input 
                value={priceInput}
                onChange={handlePriceChange}
                className={`${styles.inputClass} flex-1`}
              />
              <button 
                className={styles.uploadButtonStyle}
                onClick={handleSavePrice}
              >
                Set Price
              </button>
            </div>
          </div>
          
          <div>
            <label className={styles.labelClass}>
              REC Buyers *
            </label>
            {buyersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
              </div>
            ) : (
              <CustomSelect
                value={newRecData.recBuyer}
                onValueChange={(value) => setNewRecData({...newRecData, recBuyer: value})}
                placeholder="Choose buyer"
              >
                {buyers.length > 0 ? (
                  buyers.map((buyer) => (
                    <div key={buyer.id} value={buyer.id}>
                      {buyer.companyName}
                    </div>
                  ))
                ) : (
                  <div value="no-buyers" disabled>
                    No buyers available. Please add buyers first.
                  </div>
                )}
              </CustomSelect>
            )}
          </div>
          
          <div>
            <label className={styles.labelClass}>
              Total Amount
            </label>
            <div className={styles.totalAmountBox}>
              ${((newRecData.amountOfRecs || 0) * currentPrice).toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="font-sfpro"
            >
              Back
            </Button>
            <Button 
              className="bg-[#039994] hover:bg-[#028a85] text-white font-sfpro"
              onClick={handleCreateRecSale}
              disabled={!newRecData.recBuyer || !newRecData.amountOfRecs || buyersLoading}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}