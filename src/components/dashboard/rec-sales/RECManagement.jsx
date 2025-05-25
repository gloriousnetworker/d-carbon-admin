"use client"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OverviewCards from "./overview/OverviewCards"
import Graphs from "./overview/Graphs"
import ListOfBuyersCard from "./overview/ListOfBuyersCard"
import ManagementContent from "./management/ManagementContent"
import RecEntries from "./entries/RecEntries"

export default function RECManagement() {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#039994] data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-[#039994]"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="management"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#039994] data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-[#039994]"
          >
            Management
          </TabsTrigger>
          <TabsTrigger
            value="entries"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#039994] data-[state=active]:shadow-none px-4 py-2 text-gray-600 data-[state=active]:text-[#039994]"
          >
            Entries
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            <div className="flex justify-end mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Yearly</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
                <span className="ml-4 text-sm text-gray-600">2025</span>
                <ChevronDown className="h-4 w-4 text-gray-600" />
              </div>
            </div>
           
            <OverviewCards />
           
            <hr className="my-6 border-gray-200" />
           
            <Graphs />
           
            <hr className="my-6 border-gray-200" />
           
            <ListOfBuyersCard />
          </div>
        </TabsContent>
        <TabsContent value="management" className="mt-0">
          <ManagementContent />
        </TabsContent>
        <TabsContent value="entries" className="mt-0">
          <RecEntries />
        </TabsContent>
      </Tabs>
    </div>
  )
}
