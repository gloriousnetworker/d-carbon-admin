"use client"

import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown, Trash2, Edit, Plus } from "lucide-react"
import toast from "react-hot-toast"

const mainContainer = 'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-white'
const pageTitle = 'mb-4 font-[600] text-[36px] leading-[100%] tracking-[-0.05em] text-[#039994] font-sfpro text-center'
const formWrapper = 'w-full max-w-4xl space-y-6'
const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E]'
const buttonPrimary = 'px-4 py-2 bg-[#039994] text-white font-semibold rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro'
const buttonOutline = 'px-4 py-2 bg-white text-[#039994] font-semibold border border-[#039994] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro'
const spinnerOverlay = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20'
const spinner = 'h-12 w-12 border-4 border-t-4 border-gray-300 border-t-[#039994] rounded-full animate-spin'
const sectionHeader = 'p-4 flex items-center justify-between cursor-pointer bg-gray-50 rounded-md'
const sectionTitle = 'text-lg font-medium text-[#039994] font-sfpro'
const sectionContent = 'p-4 mt-2 border border-gray-200 rounded-md'
const actionButton = 'flex items-center gap-2'

export default function FAQManagement() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [currentFaq, setCurrentFaq] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    videoUrl: '',
    target: 'commercial'
  })

  useEffect(() => {
    fetchFaqs()
  }, [])

  const fetchFaqs = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch('https://services.dcarbon.solutions/api/faq/faqs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.status === 'success') {
        setFaqs(data.data.faqs)
      }
    } catch (error) {
      toast.error('Failed to fetch FAQs')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('authToken')
      const url = editMode 
        ? `https://services.dcarbon.solutions/api/faq/faqs/${currentFaq.id}`
        : 'https://services.dcarbon.solutions/api/faq/faqs'

      const method = editMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.status === 'success') {
        toast.success(data.message)
        fetchFaqs()
        resetForm()
      }
    } catch (error) {
      toast.error('Operation failed')
    }
  }

  const handleEdit = (faq) => {
    setCurrentFaq(faq)
    setEditMode(true)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      videoUrl: faq.videoUrl,
      target: faq.target
    })
    setExpandedSection('create')
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch(`https://services.dcarbon.solutions/api/faq/faqs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.status === 'success') {
          toast.success(data.message)
          fetchFaqs()
        }
      } catch (error) {
        toast.error('Failed to delete FAQ')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      videoUrl: '',
      target: 'commercial'
    })
    setEditMode(false)
    setCurrentFaq(null)
  }

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null)
      if (section === 'create') resetForm()
    } else {
      setExpandedSection(section)
    }
  }

  if (loading) {
    return (
      <div className={spinnerOverlay}>
        <div className={spinner} />
      </div>
    )
  }

  return (
    <div className={mainContainer}>
      <h1 className={pageTitle}>FAQ Management</h1>
      <div className={formWrapper}>
        <div className="mb-8">
          <div 
            className={sectionHeader}
            onClick={() => toggleSection('create')}
          >
            <h2 className={sectionTitle}>
              {editMode ? 'Edit FAQ' : 'Create New FAQ'}
            </h2>
            {expandedSection === 'create' ? (
              <ChevronUp className="h-5 w-5 text-[#039994]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#039994]" />
            )}
          </div>

          {expandedSection === 'create' && (
            <div className={sectionContent}>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 font-sfpro">Question</label>
                  <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-sfpro">Answer</label>
                  <textarea
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    className={`${inputClass} min-h-[100px]`}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-sfpro">Video URL</label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-sfpro">Target Audience</label>
                  <select
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  >
                    <option value="commercial">Commercial</option>
                    <option value="admin">Admin</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      toggleSection('create')
                      resetForm()
                    }}
                    className={buttonOutline}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={buttonPrimary}>
                    {editMode ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-medium text-[#039994] mb-4 font-sfpro">All FAQs</h2>
          {faqs.length === 0 ? (
            <p className="text-gray-500 font-sfpro">No FAQs found</p>
          ) : (
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#039994] font-sfpro">{faq.question}</h3>
                      <p className="text-gray-600 mt-2 font-sfpro">{faq.answer}</p>
                      {faq.videoUrl && (
                        <a 
                          href={faq.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#039994] text-sm mt-2 block font-sfpro"
                        >
                          View Video
                        </a>
                      )}
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-2 font-sfpro">
                        {faq.target}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className={`${actionButton} ${buttonOutline}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className={`${actionButton} bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 font-sfpro`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}