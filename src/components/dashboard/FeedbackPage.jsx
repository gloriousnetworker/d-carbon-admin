import React, { useState, useEffect } from 'react';
import { FiFilter, FiChevronDown, FiChevronUp, FiSearch, FiX, FiArrowLeft } from 'react-icons/fi';
import * as styles from './styles';

const FeedbackPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    userType: '',
    search: ''
  });

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('https://services.dcarbon.solutions/api/feature-suggestion', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filters.status && suggestion.status !== filters.status) return false;
    if (filters.category && suggestion.category !== filters.category) return false;
    if (filters.userType && suggestion.userType !== filters.userType) return false;
    if (filters.search && !suggestion.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !suggestion.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    return 0;
  });

  const statusOptions = ['PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED'];
  const categoryOptions = ['PERFORMANCE', 'SECURITY', 'UI_UX', 'FUNCTIONALITY', 'OTHER'];
  const userTypeOptions = ['RESIDENTIAL', 'COMMERCIAL_OPERATOR', 'PARTNER_INSTALLER', 'PARTNER_FINANCE_COMPANY'];

  if (loading) {
    return (
      <div className={styles.mainContainer}>
        <div className="w-full max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className="w-full max-w-7xl">
        <div className={styles.headingContainer}>
          <h2 className={styles.pageTitle}>Feedback & Suggestions</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative flex-1 max-w-4xl">
              <input
                type="text"
                placeholder="Search feedback and suggestions..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#039994] font-sfpro text-[14px] leading-[100%] tracking-[-0.05em] font-[400] text-[#1E1E1E] placeholder-gray-500"
              />
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 hover:border-[#039994] transition-all duration-200 text-[#1E1E1E] font-sfpro font-[400] text-[14px]"
              >
                <FiFilter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.selectClass}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-sfpro text-[12px] font-[600] text-[#1E1E1E] uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left font-sfpro text-[12px] font-[600] text-[#1E1E1E] uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left font-sfpro text-[12px] font-[600] text-[#1E1E1E] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left font-sfpro text-[12px] font-[600] text-[#1E1E1E] uppercase tracking-wider">Feedback</th>
                  <th className="px-6 py-4 text-left font-sfpro text-[12px] font-[600] text-[#1E1E1E] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left font-sfpro text-[12px] font-[600] text-[#1E1E1E] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedSuggestions.map((suggestion) => (
                  <tr 
                    key={suggestion.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    onClick={() => setSelectedFeedback(suggestion)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#039994] to-[#02857f] rounded-full flex items-center justify-center text-white font-sfpro font-[600] text-sm">
                          {suggestion.user.firstName.charAt(0)}{suggestion.user.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="font-sfpro text-[14px] font-[600] text-[#1E1E1E]">
                            {suggestion.user.firstName} {suggestion.user.lastName}
                          </div>
                          <div className="font-sfpro text-[12px] font-[400] text-[#626060]">{suggestion.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full font-sfpro text-[12px] font-[400] bg-gray-100 text-[#626060]">
                        {suggestion.userType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full font-sfpro text-[12px] font-[400] bg-[#039994]/10 text-[#039994]">
                        {suggestion.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-sfpro text-[14px] font-[600] text-[#1E1E1E] mb-1">{suggestion.title}</div>
                      <div className="font-sfpro text-[12px] font-[400] text-[#626060] line-clamp-2">{suggestion.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-sfpro text-[12px] font-[600] ${
                        suggestion.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        suggestion.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                        suggestion.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-sfpro text-[12px] font-[400] text-[#626060]">
                      {new Date(suggestion.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sortedSuggestions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-[#626060] mb-4">
                  <FiSearch className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="font-sfpro text-[16px] font-[600] text-[#1E1E1E] mb-2">No feedback found</h3>
                <p className="font-sfpro text-[14px] font-[400] text-[#626060]">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>

        {filterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="font-sfpro text-[18px] font-[600] text-[#1E1E1E]">Filter Feedback</h3>
                <button 
                  onClick={() => setFilterModalOpen(false)} 
                  className="text-[#626060] hover:text-[#1E1E1E] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <label className={styles.labelClass}>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className={styles.selectClass}
                  >
                    <option value="">All Status</option>
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={styles.labelClass}>Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className={styles.selectClass}
                  >
                    <option value="">All Categories</option>
                    {categoryOptions.map(option => (
                      <option key={option} value={option}>{option.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={styles.labelClass}>User Type</label>
                  <select
                    value={filters.userType}
                    onChange={(e) => setFilters({...filters, userType: e.target.value})}
                    className={styles.selectClass}
                  >
                    <option value="">All User Types</option>
                    {userTypeOptions.map(option => (
                      <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setFilters({ status: '', category: '', userType: '', search: '' })}
                  className="px-4 py-2 font-sfpro text-[14px] font-[400] text-[#626060] hover:text-[#1E1E1E] transition-colors duration-200"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className={styles.buttonPrimary}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="font-sfpro text-[18px] font-[600] text-[#1E1E1E]">Feedback Details</h3>
                <button 
                  onClick={() => setSelectedFeedback(null)} 
                  className="text-[#626060] hover:text-[#1E1E1E] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#039994] to-[#02857f] rounded-full flex items-center justify-center text-white font-sfpro font-[600]">
                      {selectedFeedback.user.firstName.charAt(0)}{selectedFeedback.user.lastName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-sfpro text-[16px] font-[600] text-[#1E1E1E]">
                        {selectedFeedback.user.firstName} {selectedFeedback.user.lastName}
                      </h4>
                      <p className="font-sfpro text-[14px] font-[400] text-[#626060]">{selectedFeedback.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={styles.labelClass}>User Type</label>
                      <span className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 font-sfpro text-[14px] font-[400] text-[#626060]">
                        {selectedFeedback.userType.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <label className={styles.labelClass}>Category</label>
                      <span className="inline-flex items-center px-3 py-2 rounded-md bg-[#039994]/10 font-sfpro text-[14px] font-[400] text-[#039994]">
                        {selectedFeedback.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className={styles.labelClass}>Title</label>
                    <div className="p-4 border border-gray-300 rounded-md bg-gray-50">
                      <p className="font-sfpro text-[16px] font-[600] text-[#1E1E1E]">{selectedFeedback.title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className={styles.labelClass}>Description</label>
                    <div className="p-4 border border-gray-300 rounded-md bg-gray-50 min-h-[120px]">
                      <p className="font-sfpro text-[14px] font-[400] text-[#1E1E1E] leading-relaxed">{selectedFeedback.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className={styles.labelClass}>Status</label>
                      <span className={`inline-flex items-center px-3 py-2 rounded-full font-sfpro text-[12px] font-[600] ${
                        selectedFeedback.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        selectedFeedback.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                        selectedFeedback.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedFeedback.status}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <label className={styles.labelClass}>Date Submitted</label>
                      <p className="font-sfpro text-[14px] font-[400] text-[#626060]">
                        {new Date(selectedFeedback.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;