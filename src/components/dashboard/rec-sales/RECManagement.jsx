"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OverviewCards from "./overview/OverviewCards"
import Graphs from "./overview/Graphs"
import ListOfBuyersCard from "./overview/ListOfBuyersCard"
import ManagementContent from "./management/ManagementContent"
import RecEntries from "./entries/RecEntries"

export default function RECManagement() {
  return (
    <div className="min-h-screen w-full bg-white p-6">
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
        {/* FIX-07: Overview shows aggregate KPIs + charts only */}
        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 font-sfpro uppercase tracking-wide mb-4">
                REC Sales Summary — Aggregate
              </h2>
            </div>
            <OverviewCards />
            <hr className="my-6 border-gray-200" />
            <Graphs />
          </div>
        </TabsContent>
        <TabsContent value="management" className="mt-0">
          <ManagementContent />
        </TabsContent>
        {/* FIX-07: Entries tab now includes REC buyers list */}
        <TabsContent value="entries" className="mt-0">
          <div className="space-y-6">
            <RecEntries />
            <hr className="my-6 border-gray-200" />
            <ListOfBuyersCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
