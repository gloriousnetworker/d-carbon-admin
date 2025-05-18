"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CommercialRECGeneration from "./CommercialRECGeneration"
import ResidentialRECGeneration from "./ResidentialRECGeneration"
import RECGenerationReport from "./RECGenerationReport"

export default function ManagementContent() {
  const [activeView, setActiveView] = useState("commercial")
  
  const views = [
    { id: "commercial", label: "Commercial REC Generation" },
    { id: "residential", label: "Residential REC Generation" },
    { id: "report", label: "REC Generation Report CA Vintage" }
  ]

  return (
    <div className="space-y-6">
      {/* Dropdown Selector wrapped in Card */}
      <Card className="bg-white">
        <CardContent className="flex items-center justify-start px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-xl font-medium text-[#039994] hover:bg-transparent hover:text-[#039994] px-0"
              >
                {views.find(view => view.id === activeView)?.label}
                <ChevronDown className="h-5 w-5 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 bg-white shadow-lg">
              {views.map((view) => (
                <DropdownMenuItem 
                  key={view.id}
                  className="bg-white text-lg p-3 hover:bg-gray-100"
                  onClick={() => setActiveView(view.id)}
                >
                  {view.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Content based on selection */}
      <div className="mt-4">
        {activeView === "commercial" && <CommercialRECGeneration />}
        {activeView === "residential" && <ResidentialRECGeneration />}
        {activeView === "report" && <RECGenerationReport />}
      </div>
    </div>
  )
}
