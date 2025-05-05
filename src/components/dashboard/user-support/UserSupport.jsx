"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronRightIcon, Filter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Sample data for user messages
const userMessages = Array(5).fill({
  id: 1,
  user: "Awele Francis",
  message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Lorem ipsum dolor sit amet,",
  timestamp: "12-02-2023 | 12:32AM",
})

export default function UserSupport() {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 4

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-medium text-teal-500">User Messages</h2>
            <Button variant="outline" className="gap-2">
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
                  <p className="text-sm text-gray-600">{message.message}</p>
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
    </div>
  )
}
