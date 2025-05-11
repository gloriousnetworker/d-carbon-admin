"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronRightIcon, Filter, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

// Sample data for user messages
const userMessages = Array(5).fill(null).map((_, i) => ({
  id: i + 1,
  user: "Awele Francis",
  email: "name@domain.com",
  phone: "+234-000-0000-000",
  customerType: "Residential",
  message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus eleifend posuere justo, ut fermentum quam pharetra a. Nunc a sapien nec massa efficitur placerat sed non ipsum. Curabitur luctus vestibulum est non laoreet. Aliquam leo lectus.",
  timestamp: "12-02-2023 | 12:32AM",
}))

export default function UserSupport() {
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilter, setShowFilter] = useState(false)
  const [showMessageDetails, setShowMessageDetails] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState("")
  const totalPages = 4

  const handleMessageClick = (message) => {
    setSelectedMessage(message)
    setShowMessageDetails(true)
  }

  const handleBack = () => {
    setShowMessageDetails(false)
    setSelectedMessage(null)
  }

  const handleSubmitReply = () => {
    // Handle reply submission logic here
    console.log("Reply submitted:", replyText)
    setReplyText("")
    // Optionally close the details view
    // setShowMessageDetails(false)
  }

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
            {/* Messages List */}
            <div className="flex flex-col">
              {userMessages.map((message, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 border-b hover:bg-gray-50 cursor-pointer bg-teal-50/50"
                  onClick={() => handleMessageClick(message)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-teal-100">
                          <AvatarFallback className="text-teal-700 text-xs">AF</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{message.user}</span>
                      </div>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-2 mt-3" />
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="p-4 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="mb-4">
            <Button variant="ghost" onClick={handleBack} className="flex items-center text-teal-500">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Message Details
            </Button>
          </div>
          
          {selectedMessage && (
            <div className="space-y-6">
              {/* User Details Card */}
              <Card className="border border-teal-500" style={{ borderColor: "#039994", backgroundColor: "#069B960D" }}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="font-medium">Name:</div>
                    <div className="text-right">{selectedMessage.user}</div>
                    
                    <div className="font-medium">Email Address:</div>
                    <div className="text-right">{selectedMessage.email}</div>
                    
                    <div className="font-medium">Phone number:</div>
                    <div className="text-right">{selectedMessage.phone}</div>
                    
                    <div className="font-medium">Customer Type:</div>
                    <div className="text-right">{selectedMessage.customerType}</div>
                    
                    <div className="font-medium">Date & Time:</div>
                    <div className="text-right">{selectedMessage.timestamp}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Description */}
              <div>
                <h3 className="font-medium mb-2">Message Description</h3>
                <Card className="border border-gray-200">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-700">{selectedMessage.message}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Reply Section */}
              <div>
                <h3 className="font-medium mb-2">Reply</h3>
                <Textarea 
                  placeholder="Message" 
                  className="min-h-24 bg-gray-100 border-gray-200" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <div className="mt-4">
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white" 
                    onClick={handleSubmitReply}
                  >
                    Submit
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
              <Input id="name" placeholder="Filter by name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date Range</Label>
              <div className="flex gap-2">
                <Input id="date-from" type="date" className="flex-1" />
                <Input id="date-to" type="date" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-type">Customer Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowFilter(false)}>
              Cancel
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600 text-white">
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}