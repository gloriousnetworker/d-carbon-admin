"use client"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronRightIcon, Filter, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const API_BASE_URL = "https://services.dcarbon.solutions/api"

export default function UserSupport() {
  const [contacts, setContacts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [showMessageDetails, setShowMessageDetails] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [status, setStatus] = useState("PENDING")
  const [filters, setFilters] = useState({
    name: "",
    dateFrom: "",
    dateTo: "",
    customerType: "",
    status: ""
  })
  const { toast } = useToast()
  const router = useRouter()

  // Fetch contacts
  const fetchContacts = async (page = 1) => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/contact?page=${page}&limit=10`
      
      // Add filters if they exist
      if (filters.name) url += `&name=${filters.name}`
      if (filters.dateFrom) url += `&dateFrom=${filters.dateFrom}`
      if (filters.dateTo) url += `&dateTo=${filters.dateTo}`
      if (filters.customerType) url += `&customerType=${filters.customerType}`
      if (filters.status) url += `&status=${filters.status}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "success") {
        setContacts(data.data.contacts)
        setTotalPages(data.data.metadata.totalPages)
        setCurrentPage(data.data.metadata.page)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch contacts",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch single contact
  const fetchContact = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/contact/${id}`)
      const data = await response.json()

      if (data.status === "success") {
        setSelectedContact(data.data.contact)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch contact details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle contact click
  const handleContactClick = (contact) => {
    fetchContact(contact.id)
    setShowMessageDetails(true)
  }

  // Handle back to list view
  const handleBack = () => {
    setShowMessageDetails(false)
    setSelectedContact(null)
  }

  // Handle reply submission
  const handleSubmitReply = async () => {
    if (!selectedContact || !replyText) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/contact/${selectedContact.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reply: replyText,
          status: status
        })
      })

      const data = await response.json()

      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Reply sent successfully",
        })
        setReplyText("")
        // Refresh the contact details
        fetchContact(selectedContact.id)
        // Refresh the contacts list
        fetchContacts(currentPage)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reply",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle delete contact
  const handleDeleteContact = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Contact deleted successfully",
        })
        // Go back to list view
        setShowMessageDetails(false)
        // Refresh the contacts list
        fetchContacts(currentPage)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete contact",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    if (!selectedContact) return

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/contact/${selectedContact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      const data = await response.json()

      if (data.status === "success") {
        toast({
          title: "Success",
          description: "Status updated successfully",
        })
        // Refresh the contact details
        fetchContact(selectedContact.id)
        // Refresh the contacts list
        fetchContacts(currentPage)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = () => {
    setShowFilter(false)
    fetchContacts(1) // Reset to first page when applying new filters
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      name: "",
      dateFrom: "",
      dateTo: "",
      customerType: "",
      status: ""
    })
    fetchContacts(1)
    setShowFilter(false)
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Initial fetch
  useEffect(() => {
    fetchContacts()
  }, [])

  return (
    <div className="bg-white min-h-screen p-6">
      {!showMessageDetails ? (
        <Card className="border-gray-200">
          <CardContent className="p-0">
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-xl font-medium text-teal-500">User Messages</h2>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setShowFilter(true)}
              >
                <span>Filter by</span>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Loading state */}
            {loading && (
              <div className="p-4 text-center">Loading messages...</div>
            )}
            
            {/* Empty state */}
            {!loading && contacts.length === 0 && (
              <div className="p-4 text-center text-gray-500">No messages found</div>
            )}
            
            {/* Messages List */}
            {!loading && contacts.length > 0 && (
              <div className="flex flex-col">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-start p-4 border-b hover:bg-gray-50 cursor-pointer bg-teal-50/50"
                    onClick={() => handleContactClick(contact)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 bg-teal-100">
                            {contact.user.profilePicture ? (
                              <AvatarImage src={contact.user.profilePicture} />
                            ) : (
                              <AvatarFallback className="text-teal-700 text-xs">
                                {contact.user.firstName?.charAt(0)}{contact.user.lastName?.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <span className="font-medium">
                            {contact.user.firstName} {contact.user.lastName}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            contact.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            contact.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {contact.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(contact.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900">{contact.subject}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2 mt-3" />
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && contacts.length > 0 && (
              <div className="p-4 flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                    fetchContacts(currentPage - 1)
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    fetchContacts(currentPage + 1)
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="flex items-center text-teal-500">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Messages
            </Button>
          </div>
          
          {selectedContact && (
            <div className="space-y-6">
              {/* User Details Card */}
              <Card className="border border-teal-500" style={{ borderColor: "#039994", backgroundColor: "#069B960D" }}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="font-medium">Name:</div>
                    <div className="text-right">
                      {selectedContact.user.firstName} {selectedContact.user.lastName}
                    </div>
                    
                    <div className="font-medium">Email Address:</div>
                    <div className="text-right">{selectedContact.user.email}</div>
                    
                    <div className="font-medium">Customer Type:</div>
                    <div className="text-right">{selectedContact.user.userType}</div>
                    
                    <div className="font-medium">Status:</div>
                    <div className="text-right">
                      <Select
                        value={selectedContact.status}
                        onValueChange={(value) => {
                          setStatus(value)
                          handleStatusChange(value)
                        }}
                      >
                        <SelectTrigger className="w-[180px] ml-auto">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                          <SelectItem value="RESOLVED">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="font-medium">Date & Time:</div>
                    <div className="text-right">{formatDate(selectedContact.createdAt)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Subject</h3>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700">{selectedContact.subject}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Contact Reason</h3>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700">{selectedContact.contactReason}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Message</h3>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-700">{selectedContact.message}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Reply Section */}
              <div>
                <h3 className="font-medium mb-2">Reply</h3>
                <Textarea 
                  placeholder="Type your reply here..." 
                  className="min-h-24 bg-gray-100 border-gray-200" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="mt-4 flex justify-between">
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this contact?")) {
                        handleDeleteContact(selectedContact.id)
                      }
                    }}
                  >
                    Delete Contact
                  </Button>
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white" 
                    onClick={handleSubmitReply}
                    disabled={!replyText}
                  >
                    Submit Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <Dialog open={showFilter} onOpenChange={setShowFilter}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-teal-500">Filter Messages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="Filter by name" 
                value={filters.name}
                onChange={(e) => setFilters({...filters, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date Range</Label>
              <div className="flex gap-2">
                <Input 
                  id="date-from" 
                  type="date" 
                  className="flex-1" 
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
                <Input 
                  id="date-to" 
                  type="date" 
                  className="flex-1" 
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-type">Customer Type</Label>
              <Select
                value={filters.customerType}
                onValueChange={(value) => setFilters({...filters, customerType: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                  <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilter(false)}>
                Cancel
              </Button>
              <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}