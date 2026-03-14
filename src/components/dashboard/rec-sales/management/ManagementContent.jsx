"use client"

import { useState } from "react"
import { ChevronDown, Download, Loader2 } from "lucide-react"
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
import CONFIG from "@/lib/config"
import { exportToCSV, WREGIS_COLUMNS, transformToWregisFormat } from "@/lib/exportUtils"

export default function ManagementContent() {
  const [activeView, setActiveView] = useState("commercial")
  const [wregisExporting, setWregisExporting] = useState(false)

  const handleWregisExport = async () => {
    setWregisExporting(true)
    try {
      const authToken = localStorage.getItem("authToken")
      const headers = { Authorization: `Bearer ${authToken}`, "Content-Type": "application/json" }

      // Fetch all commercial and residential meter records
      const fetchAll = async (type) => {
        let all = [], page = 1, hasMore = true
        while (hasMore) {
          const res = await fetch(`${CONFIG.API_BASE_URL}/api/admin/meter-records/${type}?page=${page}&limit=100`, { headers })
          if (!res.ok) break
          const json = await res.json()
          if (json.status === "success") {
            all = [...all, ...json.data.records]
            hasMore = json.data.metadata.hasNextPage
            page++
          } else { hasMore = false }
        }
        return all
      }

      const [commercial, residential] = await Promise.all([
        fetchAll("commercial"),
        fetchAll("residential"),
      ])

      const wregisRows = [
        ...transformToWregisFormat(commercial, "commercial"),
        ...transformToWregisFormat(residential, "residential"),
      ]

      if (wregisRows.length === 0) {
        alert("No meter records found to export")
        return
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "_")
      exportToCSV(wregisRows, WREGIS_COLUMNS, `WREGIS_Generation_Data_${dateStr}`)
    } catch (err) {
      console.error("WREGIS export error:", err)
      alert("Failed to generate WREGIS export")
    } finally {
      setWregisExporting(false)
    }
  }
  
  const views = [
    { id: "commercial", label: "Commercial REC Generation" },
    { id: "residential", label: "Residential REC Generation" },
    { id: "report", label: "REC Generation Report CA Vintage" }
  ]

  return (
    <div className="space-y-6">
      {/* Dropdown Selector wrapped in Card */}
      <Card className="bg-white">
        <CardContent className="flex items-center justify-between px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-sm font-semibold text-[#039994] font-sfpro hover:bg-transparent hover:text-[#039994] px-0"
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
          <Button
            variant="outline"
            className="gap-2 text-sm font-sfpro"
            onClick={handleWregisExport}
            disabled={wregisExporting}
          >
            {wregisExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{wregisExporting ? "Exporting..." : "Export WREGIS CSV"}</span>
          </Button>
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
