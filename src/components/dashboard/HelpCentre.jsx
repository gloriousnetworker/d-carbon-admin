"use client"

import { useState, useEffect } from "react"
import { ChevronDown, X, Loader2 } from "lucide-react"
import CONFIG from "@/lib/config"

export default function DashboardHelpCentre() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const res = await fetch(`${CONFIG.API_BASE_URL}/api/faq/faqs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.status === "success") {
        const allFaqs = data.data?.faqs || data.data || []
        setFaqs(allFaqs.filter((f) => f.target === "GENERAL" || f.target === "ADMIN"))
      }
    } catch {
      // FAQ fetch is non-critical
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (index) => {
    setOpenIndex(index === openIndex ? null : index)
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <h2 className="mb-6 font-sfpro font-semibold text-2xl text-[#039994] text-center">
        Frequently Asked Questions
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#039994]" />
        </div>
      ) : faqs.length === 0 ? (
        <p className="text-center text-sm text-gray-500 font-sfpro py-8">No FAQs available.</p>
      ) : (
        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <div
                  onClick={() => handleToggle(index)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <p className="font-sfpro font-medium text-sm text-[#1E1E1E]">{faq.question}</p>
                  {isOpen ? (
                    <X className="h-4 w-4 text-[#039994] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#039994] shrink-0 ml-2" />
                  )}
                </div>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <p className="font-sfpro text-sm text-[#626060]">{faq.answer}</p>
                    {faq.videoUrl && (
                      <a
                        href={faq.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#039994] text-xs mt-2 inline-block font-sfpro hover:underline"
                      >
                        Watch Video
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
