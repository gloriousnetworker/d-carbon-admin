"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function AgreementManagement() {
  const loremText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur ad`

  const [expandedSection, setExpandedSection] = useState("information")
  const [informationText, setInformationText] = useState(loremText)
  const [servicesText, setServicesText] = useState(loremText)
  const [wregisText, setWregisText] = useState(loremText)

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  return (
    <div className="bg-white min-h-screen p-6">
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {/* Information Release Agreement Section */}
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
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-teal-500 hover:bg-teal-600">Update</Button>
                </div>
              </div>
            )}
          </div>

          {/* Services Agreement Section */}
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
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-teal-500 hover:bg-teal-600">Update</Button>
                </div>
              </div>
            )}
          </div>

          {/* WREGIS Assignment Section */}
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
                />
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline">Cancel</Button>
                  <Button className="bg-teal-500 hover:bg-teal-600">Update</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
