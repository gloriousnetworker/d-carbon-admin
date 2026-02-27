"use client";

import React, { useState, useEffect } from "react";
import { FiFilter, FiSearch, FiMessageSquare, FiCheckCircle, FiClock, FiAlertCircle, FiX, FiDownload, FiUser, FiMail } from "react-icons/fi";

const AdminSupport = () => {
  // Dummy tickets data for admin
  const initialDummyTickets = [
    {
      id: '1',
      ticketNumber: 'TKT-001',
      subject: 'Authorization Failed for Facility',
      category: 'AUTHORIZATION',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      lastMessage: 'I tried to authorize the facility but it keeps showing an error message...',
      conversations: [
        {
          id: '1-1',
          senderType: 'USER',
          senderName: 'John Operator',
          message: 'I tried to authorize the facility but it keeps showing an error message. The system says "Connection timed out" when trying to connect to the utility provider.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          attachment: null
        }
      ],
      user: {
        id: 'user-1',
        name: 'John Operator',
        email: 'john.operator@example.com',
        userType: 'COMMERCIAL'
      }
    },
    {
      id: '2',
      ticketNumber: 'TKT-002',
      subject: 'Meter Data Not Syncing',
      category: 'TECHNICAL',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      lastMessage: 'Our engineering team is working on the sync issue...',
      conversations: [
        {
          id: '2-1',
          senderType: 'USER',
          senderName: 'Sarah Facility Manager',
          message: 'My meter data hasn\'t been syncing for the past 3 days. The dashboard shows "Last updated: 3 days ago".',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          attachment: null
        },
        {
          id: '2-2',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'We\'ve identified an issue with the data sync service. Our team is working on a fix. We\'ll update you once resolved.',
          createdAt: new Date(Date.now() - 129600000).toISOString(),
          attachment: null
        },
        {
          id: '2-3',
          senderType: 'USER',
          senderName: 'Sarah Facility Manager',
          message: 'Thank you for the update. Please let me know when it\'s fixed.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          attachment: null
        }
      ],
      user: {
        id: 'user-2',
        name: 'Sarah Facility Manager',
        email: 'sarah.facility@example.com',
        userType: 'COMMERCIAL'
      }
    },
    {
      id: '3',
      ticketNumber: 'TKT-003',
      subject: 'Billing Invoice Question',
      category: 'BILLING',
      priority: 'LOW',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 432000000).toISOString(),
      lastMessage: 'Invoice question has been resolved.',
      conversations: [
        {
          id: '3-1',
          senderType: 'USER',
          senderName: 'Mike Owner',
          message: 'I have a question about the invoice charges from last month. There\'s a $50 service fee that I don\'t understand.',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          attachment: 'invoice.pdf'
        },
        {
          id: '3-2',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'The $50 service fee is for premium support and monitoring services. You can downgrade to the basic plan if you prefer.',
          createdAt: new Date(Date.now() - 518400000).toISOString(),
          attachment: null
        },
        {
          id: '3-3',
          senderType: 'USER',
          senderName: 'Mike Owner',
          message: 'Thanks for explaining. I\'ll keep the premium plan.',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          attachment: null
        },
        {
          id: '3-4',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'Great! Let us know if you have any other questions.',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          attachment: null
        }
      ],
      user: {
        id: 'user-3',
        name: 'Mike Owner',
        email: 'mike.owner@example.com',
        userType: 'COMMERCIAL'
      }
    },
    {
      id: '4',
      ticketNumber: 'TKT-004',
      subject: 'Unable to Login to Dashboard',
      category: 'ACCOUNT',
      priority: 'HIGH',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
      lastMessage: 'I cannot login to my dashboard. It says "Invalid credentials"...',
      conversations: [
        {
          id: '4-1',
          senderType: 'USER',
          senderName: 'Alex Manager',
          message: 'I cannot login to my dashboard. It says "Invalid credentials" but I\'m sure my password is correct.',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          attachment: null
        }
      ],
      user: {
        id: 'user-4',
        name: 'Alex Manager',
        email: 'alex.manager@example.com',
        userType: 'RESIDENTIAL'
      }
    },
    {
      id: '5',
      ticketNumber: 'TKT-005',
      subject: 'Feature Request - Export Reports',
      category: 'FEATURE',
      priority: 'LOW',
      status: 'CLOSED',
      createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      updatedAt: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
      lastMessage: 'Feature implemented in latest release.',
      conversations: [
        {
          id: '5-1',
          senderType: 'USER',
          senderName: 'Jane Analyst',
          message: 'Can we have an option to export reports in Excel format? Currently only PDF is available.',
          createdAt: new Date(Date.now() - 2592000000).toISOString(),
          attachment: null
        },
        {
          id: '5-2',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'Thank you for the suggestion! We\'ve added this to our roadmap and will notify you when it\'s implemented.',
          createdAt: new Date(Date.now() - 2160000000).toISOString(), // 25 days ago
          attachment: null
        },
        {
          id: '5-3',
          senderType: 'ADMIN',
          senderName: 'Support Team',
          message: 'Update: Excel export feature has been added in version 2.3. You can now export reports in Excel format.',
          createdAt: new Date(Date.now() - 1728000000).toISOString(),
          attachment: 'release_notes.pdf'
        }
      ],
      user: {
        id: 'user-5',
        name: 'Jane Analyst',
        email: 'jane.analyst@example.com',
        userType: 'INDUSTRIAL'
      }
    }
  ];

  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    category: "",
    dateFrom: "",
    dateTo: ""
  });

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      setTickets(initialDummyTickets);
      setFilteredTickets(initialDummyTickets);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tickets]);

  const applyFilters = () => {
    let filtered = [...tickets];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.ticketNumber.toLowerCase().includes(searchLower) ||
        ticket.user.name.toLowerCase().includes(searchLower) ||
        ticket.user.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    if (filters.category) {
      filtered = filtered.filter(ticket => ticket.category === filters.category);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(ticket => new Date(ticket.createdAt) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(ticket => new Date(ticket.createdAt) <= new Date(filters.dateTo));
    }

    setFilteredTickets(filtered);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        const updatedTicket = {
          ...ticket,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
        
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
        
        return updatedTicket;
      }
      return ticket;
    });

    setTickets(updatedTickets);
    alert(`Ticket status updated to ${newStatus}`);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    setSendingReply(true);

    // Simulate API delay
    setTimeout(() => {
      const updatedTickets = tickets.map(ticket => {
        if (ticket.id === selectedTicket.id) {
          const newConversation = {
            id: `${Date.now()}-${ticket.conversations.length + 1}`,
            senderType: 'ADMIN',
            senderName: 'Support Team',
            message: replyMessage,
            createdAt: new Date().toISOString(),
            attachment: null
          };

          const updatedTicket = {
            ...ticket,
            status: 'IN_PROGRESS',
            updatedAt: new Date().toISOString(),
            lastMessage: replyMessage.substring(0, 100) + '...',
            conversations: [...ticket.conversations, newConversation]
          };

          setSelectedTicket(updatedTicket);
          return updatedTicket;
        }
        return ticket;
      });

      setTickets(updatedTickets);
      setReplyMessage("");
      setSendingReply(false);
      alert("Reply sent successfully!");
    }, 800);
  };

  const handleCloseTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to close this ticket?")) return;

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: 'CLOSED',
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    });

    setTickets(updatedTickets);
    setSelectedTicket(null);
    alert("Ticket closed successfully!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "OPEN": { color: "bg-yellow-100 text-yellow-800", icon: <FiAlertCircle className="w-3 h-3" /> },
      "IN_PROGRESS": { color: "bg-blue-100 text-blue-800", icon: <FiClock className="w-3 h-3" /> },
      "RESOLVED": { color: "bg-green-100 text-green-800", icon: <FiCheckCircle className="w-3 h-3" /> },
      "CLOSED": { color: "bg-gray-100 text-gray-800", icon: <FiX className="w-3 h-3" /> }
    };
    
    const config = statusConfig[status] || statusConfig.OPEN;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      "LOW": "bg-gray-100 text-gray-800",
      "MEDIUM": "bg-yellow-100 text-yellow-800",
      "HIGH": "bg-orange-100 text-orange-800",
      "URGENT": "bg-red-100 text-red-800"
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityConfig[priority] || priorityConfig.MEDIUM}`}>
        {priority}
      </span>
    );
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "",
      priority: "",
      category: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  const styles = {
    container: "min-h-screen bg-gray-50 p-6",
    header: "flex justify-between items-center mb-6",
    title: "text-2xl font-bold text-[#039994]",
    searchContainer: "flex gap-4 mb-6",
    searchInput: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039994]",
    filterBtn: "flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50",
    ticketsGrid: "grid gap-4",
    ticketCard: "bg-white rounded-lg border border-gray-200 p-4 hover:border-[#039994] transition-all cursor-pointer",
    ticketHeader: "flex justify-between items-start mb-2",
    ticketSubject: "font-semibold text-gray-800",
    ticketMeta: "flex items-center gap-3 text-sm text-gray-600",
    ticketPreview: "text-gray-600 text-sm mt-2 line-clamp-2",
    modalOverlay: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
    modalContent: "bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden",
    modalHeader: "px-6 py-4 border-b border-gray-200 flex justify-between items-center",
    modalTitle: "text-xl font-semibold text-gray-800",
    closeBtn: "text-gray-500 hover:text-gray-700 text-2xl",
    ticketInfo: "grid grid-cols-2 gap-4 px-6 py-4 bg-gray-50",
    infoItem: "text-sm",
    infoLabel: "font-medium text-gray-600",
    infoValue: "text-gray-800",
    conversationContainer: "px-6 py-4 space-y-4 max-h-[400px] overflow-y-auto",
    messageBubble: "max-w-[80%] rounded-lg p-3",
    userMessage: "bg-blue-50 border border-blue-100",
    adminMessage: "bg-gray-100 border border-gray-200 ml-auto",
    replySection: "border-t border-gray-200 px-6 py-4",
    replyInput: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#039994]",
    sendBtn: "ml-2 px-4 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#02857f]",
    actionButtons: "flex gap-2 mt-4",
    actionBtn: "px-4 py-2 rounded-lg text-sm font-medium",
    loadingSpinner: "flex justify-center items-center h-48",
    emptyState: "text-center py-12 text-gray-500",
    filtersModal: "absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 z-10",
    filterInput: "w-full px-3 py-2 border border-gray-300 rounded text-sm",
    applyBtn: "w-full py-2 bg-[#039994] text-white rounded hover:bg-[#02857f]",
    userInfo: "flex items-center gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200",
    userAvatar: "w-10 h-10 bg-[#039994] rounded-full flex items-center justify-center text-white",
    userDetails: "flex-1"
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Support Tickets Dashboard</h1>
        <div className="relative">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={styles.filterBtn}
          >
            <FiFilter />
            Filters
            {(filters.status || filters.priority || filters.category || filters.search) && (
              <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
          
          {showFilters && (
            <div className={styles.filtersModal}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    placeholder="Search tickets..."
                    className={styles.filterInput}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className={styles.filterInput}
                  >
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className={styles.filterInput}
                  >
                    <option value="">All Priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className={styles.filterInput}
                  >
                    <option value="">All Categories</option>
                    <option value="AUTHORIZATION">Authorization</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="BILLING">Billing</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="FEATURE">Feature Request</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleResetFilters}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="flex-1 py-2 bg-[#039994] text-white rounded hover:bg-[#02857f]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.searchContainer}>
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets by subject, ticket number, or user..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className={`${styles.searchInput} pl-10`}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">Filtered by:</span>
          {filters.status && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Status: {filters.status}
            </span>
          )}
          {filters.priority && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
              Priority: {filters.priority}
            </span>
          )}
          {filters.category && (
            <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Category: {filters.category}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingSpinner}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#039994]"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <FiMessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg mb-2">No support tickets found</p>
          <p className="text-gray-600 mb-4">No tickets match your search criteria</p>
          <button 
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#02857f]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className={styles.ticketsGrid}>
          {filteredTickets.map((ticket) => (
            <div 
              key={ticket.id}
              className={styles.ticketCard}
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className={styles.ticketHeader}>
                <div>
                  <h3 className={styles.ticketSubject}>{ticket.subject}</h3>
                  <div className={styles.ticketMeta}>
                    <span className="font-medium text-[#039994]">#{ticket.ticketNumber}</span>
                    <span>{formatDate(ticket.createdAt)}</span>
                    <span className="capitalize">{ticket.category.toLowerCase()}</span>
                    <span className="flex items-center gap-1">
                      <FiUser className="w-3 h-3" />
                      {ticket.user.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(ticket.status)}
                  {getPriorityBadge(ticket.priority)}
                </div>
              </div>
              {ticket.lastMessage && (
                <p className={styles.ticketPreview}>
                  {ticket.lastMessage}
                </p>
              )}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <FiMail className="w-3 h-3" />
                  <span>{ticket.user.email}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded">
                    {ticket.user.userType}
                  </span>
                </div>
                <span>Updated: {formatDate(ticket.updatedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTicket && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>{selectedTicket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-sm text-gray-600">#{selectedTicket.ticketNumber}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTicket(null)}
                className={styles.closeBtn}
              >
                ×
              </button>
            </div>

            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <FiUser className="w-5 h-5" />
              </div>
              <div className={styles.userDetails}>
                <div className="font-medium">{selectedTicket.user.name}</div>
                <div className="text-sm text-gray-600">{selectedTicket.user.email}</div>
                <div className="text-xs text-gray-500">{selectedTicket.user.userType} User</div>
              </div>
              <div className="text-sm text-gray-600">
                <div>Created: {formatDate(selectedTicket.createdAt)}</div>
                <div>Updated: {formatDate(selectedTicket.updatedAt)}</div>
              </div>
            </div>

            <div className={styles.conversationContainer}>
              {selectedTicket.conversations && selectedTicket.conversations.map((msg, index) => (
                <div 
                  key={msg.id || index}
                  className={`${styles.messageBubble} ${
                    msg.senderType === 'USER' ? styles.userMessage : styles.adminMessage
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {msg.senderName}
                      <span className="ml-2 text-xs text-gray-500">
                        ({msg.senderType === 'USER' ? 'User' : 'Admin'})
                      </span>
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{msg.message}</p>
                  {msg.attachment && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-gray-200">
                        <FiDownload className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-700">{msg.attachment}</span>
                        <button className="ml-auto text-xs text-[#039994] hover:text-[#02857f]">
                          Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.replySection}>
              <div className="flex mb-4">
                <input
                  type="text"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className={styles.replyInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyMessage.trim() || selectedTicket.status === 'CLOSED'}
                  className={styles.sendBtn}
                >
                  {sendingReply ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : 'Send Reply'}
                </button>
              </div>

              <div className={styles.actionButtons}>
                <select 
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  className={`${styles.actionBtn} border border-gray-300`}
                  disabled={selectedTicket.status === 'CLOSED'}
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
                
                {selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')}
                    className={`${styles.actionBtn} bg-green-600 text-white hover:bg-green-700`}
                  >
                    Mark as Resolved
                  </button>
                )}
                
                <button
                  onClick={() => handleCloseTicket(selectedTicket.id)}
                  className={`${styles.actionBtn} bg-red-600 text-white hover:bg-red-700`}
                >
                  Close Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupport;