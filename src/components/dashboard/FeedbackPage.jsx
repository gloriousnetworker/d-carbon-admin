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
    );
  }

  return (
    <div className={styles.mainContainer}>
      <div className="w-full max-w-6xl">
        <div className={styles.headingContainer}>
          <h2 className={styles.pageTitle}>Feedback & Suggestions</h2>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search feedback..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className={styles.inputClass}
              />
              <FiSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={() => setFilterModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FiFilter />
              <span>Filter</span>
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSuggestions.map((suggestion) => (
                  <tr 
                    key={suggestion.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedFeedback(suggestion)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {suggestion.user.firstName} {suggestion.user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{suggestion.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {suggestion.userType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {suggestion.category}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{suggestion.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">{suggestion.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        suggestion.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        suggestion.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                        suggestion.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filterModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filter Feedback</h3>
                <button onClick={() => setFilterModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
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
                      <option key={option} value={option}>{option}</option>
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
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setFilters({ status: '', category: '', userType: '', search: '' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Feedback Details</h3>
                <button onClick={() => setSelectedFeedback(null)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={styles.labelClass}>User</label>
                  <p className={styles.inputClass}>{selectedFeedback.user.firstName} {selectedFeedback.user.lastName} ({selectedFeedback.user.email})</p>
                </div>
                
                <div>
                  <label className={styles.labelClass}>User Type</label>
                  <p className={styles.inputClass}>{selectedFeedback.userType}</p>
                </div>
                
                <div>
                  <label className={styles.labelClass}>Category</label>
                  <p className={styles.inputClass}>{selectedFeedback.category}</p>
                </div>
                
                <div>
                  <label className={styles.labelClass}>Title</label>
                  <p className={styles.inputClass}>{selectedFeedback.title}</p>
                </div>
                
                <div>
                  <label className={styles.labelClass}>Description</label>
                  <p className={styles.inputClass}>{selectedFeedback.description}</p>
                </div>
                
                <div>
                  <label className={styles.labelClass}>Status</label>
                  <p className={styles.inputClass}>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedFeedback.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedFeedback.status === 'REVIEWED' ? 'bg-blue-100 text-blue-800' :
                      selectedFeedback.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedFeedback.status}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className={styles.labelClass}>Date Submitted</label>
                  <p className={styles.inputClass}>{new Date(selectedFeedback.createdAt).toLocaleDateString()}</p>
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