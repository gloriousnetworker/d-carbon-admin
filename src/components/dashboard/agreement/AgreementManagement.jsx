"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function AgreementManagement() {
  const [expandedSection, setExpandedSection] = useState("information")
  const [informationText, setInformationText] = useState("")
  const [servicesText, setServicesText] = useState("")
  const [wregisText, setWregisText] = useState("")

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  const handleUpdate = (type) => {
    console.log(`Update ${type} agreement`)
  }

  const handleCancel = (type) => {
    switch(type) {
      case 'information':
        setInformationText("")
        break
      case 'services':
        setServicesText("")
        break
      case 'wregis':
        setWregisText("")
        break
    }
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="border-b">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("information")}
            >
              <h2 className="text-xl font-medium text-teal-500">Information Release Agreement</h2>
              {expandedSection === "information" ? (
                <ChevronUp className="h-5 w-5 text-teal-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-teal-500" />
              )}
            </div>

            {expandedSection === "information" && (
              <div className="px-4 pb-4">
                <Textarea
                  className="min-h-[200px] border-teal-100 focus-visible:ring-teal-500"
                  value={informationText}
                  onChange={(e) => setInformationText(e.target.value)}
                  placeholder="No content available"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => handleCancel('information')}>Cancel</Button>
                  <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => handleUpdate('information')}>Update</Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-b">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("services")}
            >
              <h2 className="text-xl font-medium text-teal-500">Services Agreement</h2>
              {expandedSection === "services" ? (
                <ChevronUp className="h-5 w-5 text-teal-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-teal-500" />
              )}
            </div>

            {expandedSection === "services" && (
              <div className="px-4 pb-4">
                <Textarea
                  className="min-h-[200px] border-teal-100 focus-visible:ring-teal-500"
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  placeholder="No content available"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => handleCancel('services')}>Cancel</Button>
                  <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => handleUpdate('services')}>Update</Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("wregis")}
            >
              <h2 className="text-xl font-medium text-teal-500">WREGIS Assignment</h2>
              {expandedSection === "wregis" ? (
                <ChevronUp className="h-5 w-5 text-teal-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-teal-500" />
              )}
            </div>

            {expandedSection === "wregis" && (
              <div className="px-4 pb-4">
                <Textarea
                  className="min-h-[200px] border-teal-100 focus-visible:ring-teal-500"
                  value={wregisText}
                  onChange={(e) => setWregisText(e.target.value)}
                  placeholder="No content available"
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => handleCancel('wregis')}>Cancel</Button>
                  <Button className="bg-teal-500 hover:bg-teal-600" onClick={() => handleUpdate('wregis')}>Update</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}