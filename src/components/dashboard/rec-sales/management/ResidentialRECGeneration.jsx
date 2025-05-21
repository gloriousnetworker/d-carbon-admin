"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Filter, Calendar, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ResidentialMeterRecords() {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [records, setRecords] = useState([])
  
  // State for filters
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [facilityId, setFacilityId] = useState("")
  const [utilityProvider, setUtilityProvider] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Format date for API
  const formatDateForApi = (date) => {
    if (!date) return undefined
    return format(date, "yyyy-MM-dd")
  }

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Get auth token from local storage
      const authToken = localStorage.getItem("authToken")
      
      if (!authToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue.",
          variant: "destructive"
        })
        return
      }
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append("page", currentPage)
      params.append("limit", 10)
      
      if (startDate) params.append("startDate", formatDateForApi(startDate))
      if (endDate) params.append("endDate", formatDateForApi(endDate))
      if (facilityId) params.append("facilityId", facilityId)
      if (utilityProvider) params.append("utilityProvider", utilityProvider)
      
      // Make the API call
      const response = await fetch(
        `https://services.dcarbon.solutions/api/admin/meter-records/residential?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.status === "success") {
        setRecords(data.data.records)
        setTotalPages(data.data.metadata.totalPages)
      } else {
        throw new Error(data.message || "Failed to fetch data")
      }
    } catch (error) {
      console.error("Error fetching meter records:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load residential meter records",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Calculate points and RECs values
  const calculatePointsValue = (points) => {
    return `$${(points * 0.1).toFixed(2)}`
  }
  
  // Format a date from ISO to readable format
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd-MM-yy")
    } catch (e) {
      return dateString
    }
  }
  
  // Effect to fetch data when page or filters change
  useEffect(() => {
    fetchData()
  }, [currentPage, startDate, endDate, facilityId, utilityProvider])
  
  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }
  
  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying filters
    setIsFilterOpen(false)
    fetchData()
  }
  
  // Reset filters
  const resetFilters = () => {
    setStartDate(null)
    setEndDate(null)
    setFacilityId("")
    setUtilityProvider("")
    setCurrentPage(1)
  }

  return (
    <Card className="border-gray-200 mb-6">
      <CardContent className="p-0">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-medium text-[#039994] flex items-center">
            Residential Meter Records
            <ChevronDown className="h-5 w-5 ml-2 text-[#039994]" />
          </h2>
          
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <span>Filter by</span>
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Filter Options</h3>
                
                <div className="space-y-2">
                  <label className="text-sm">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Facility ID</label>
                  <Input 
                    placeholder="Enter facility ID" 
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm">Utility Provider</label>
                  <Select value={utilityProvider} onValueChange={setUtilityProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Providers</SelectItem>
                      <SelectItem value="Pacific Gas & Electric">Pacific Gas & Electric</SelectItem>
                      <SelectItem value="Southern California Edison">Southern California Edison</SelectItem>
                      <SelectItem value="San Diego Gas & Electric">San Diego Gas & Electric</SelectItem>
                      <SelectItem value="Duke Energy">Duke Energy</SelectItem>
                      <SelectItem value="Florida Power & Light">Florida Power & Light</SelectItem>
                      <SelectItem value="Dominion Energy">Dominion Energy</SelectItem>
                      <SelectItem value="Xcel Energy">Xcel Energy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>Reset</Button>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y text-sm">
                <th className="py-3 px-2 text-left font-medium">ID</th>
                <th className="py-3 px-2 text-left font-medium">Meter UID</th>
                <th className="py-3 px-2 text-left font-medium">Utility</th>
                <th className="py-3 px-2 text-left font-medium">Address</th>
                <th className="py-3 px-2 text-left font-medium">User</th>
                <th className="py-3 px-2 text-left font-medium">Start Date</th>
                <th className="py-3 px-2 text-left font-medium">End Date</th>
                <th className="py-3 px-2 text-left font-medium">Interval kWh</th>
                <th className="py-3 px-2 text-left font-medium">Points</th>
                <th className="py-3 px-2 text-left font-medium">RECs</th>
                <th className="py-3 px-2 text-left font-medium">Points Value</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center">Loading data...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-8 text-center">No records found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b text-sm hover:bg-gray-50">
                    <td className="py-3 px-2">{record.id.substring(0, 8)}...</td>
                    <td className="py-3 px-2">{record.meterUid}</td>
                    <td className="py-3 px-2">{record.utility}</td>
                    <td className="py-3 px-2">{record.residentialFacility?.address || record.utilityServiceAddress}</td>
                    <td className="py-3 px-2">
                      {record.residentialFacility?.user ? 
                        `${record.residentialFacility.user.firstName} ${record.residentialFacility.user.lastName}` : 
                        "N/A"}
                    </td>
                    <td className="py-3 px-2">{formatDate(record.intervalStart)}</td>
                    <td className="py-3 px-2">{formatDate(record.intervalEnd)}</td>
                    <td className="py-3 px-2">{record.intervalKWh.toFixed(2)}</td>
                    <td className="py-3 px-2">{record.points.toFixed(2)}</td>
                    <td className="py-3 px-2">{record.recs.toFixed(8)}</td>
                    <td className="py-3 px-2">{calculatePointsValue(record.points)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === 1 || isLoading}
              onClick={handlePrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              disabled={currentPage === totalPages || isLoading}
              onClick={handleNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}