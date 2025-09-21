import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { isOwner, isAccountant } from '../utils/roleUtils'
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  Edit,
  Check,
  X,
  Calendar,
  Euro,
  User,
  FileText,
  AlertCircle,
  Clock,
  Building2
} from 'lucide-react'
import { RootState } from '../store'
import PropertySelector from '../components/common/PropertySelector'

interface CreditNote {
  id: string
  propertyId: number
  propertyName: string
  bookingId: string
  guestName: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  requestedBy: string
  requestedDate: string
  approvedBy?: string
  approvedDate?: string
  notes?: string
  invoiceId?: string
}

interface CreditNoteSummary {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalAmount: number
  pendingAmount: number
}

const CreditNotes: React.FC = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([])
  const [summary, setSummary] = useState<CreditNoteSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<number | null>(392776)
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNote | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  const { properties } = useSelector((state: RootState) => state.properties)
  const { token, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchCreditNotes()
  }, [selectedProperty, selectedStatus, startDate, endDate])

  const fetchCreditNotes = async () => {
    if (!token || !selectedProperty) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('propertyId', selectedProperty.toString())
      
      if (selectedStatus) {
        params.append('status', selectedStatus)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }
      
      const response = await fetch(`/api/credit-notes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCreditNotes(data.creditNotes || [])
        
        // Calculate summary
        const totalPending = data.creditNotes?.filter((cn: CreditNote) => cn.status === 'pending').length || 0
        const totalApproved = data.creditNotes?.filter((cn: CreditNote) => cn.status === 'approved').length || 0
        const totalRejected = data.creditNotes?.filter((cn: CreditNote) => cn.status === 'rejected').length || 0
        const totalAmount = data.creditNotes?.reduce((sum: number, cn: CreditNote) => sum + cn.amount, 0) || 0
        const pendingAmount = data.creditNotes?.filter((cn: CreditNote) => cn.status === 'pending').reduce((sum: number, cn: CreditNote) => sum + cn.amount, 0) || 0
        
        setSummary({
          totalPending,
          totalApproved,
          totalRejected,
          totalAmount,
          pendingAmount
        })
      }
    } catch (error) {
      console.error('Error fetching credit notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (creditNoteId: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/credit-notes/${creditNoteId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchCreditNotes()
        setShowDetailsModal(false)
      }
    } catch (error) {
      console.error('Error approving credit note:', error)
    }
  }

  const handleReject = async (creditNoteId: string, reason: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/credit-notes/${creditNoteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        fetchCreditNotes()
        setShowDetailsModal(false)
      }
    } catch (error) {
      console.error('Error rejecting credit note:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDateRangeStart = (range: string) => {
    const now = new Date()
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      case '1y':
        return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split('T')[0]
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'processed': 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredCreditNotes = creditNotes.filter(cn => {
    const matchesSearch = searchTerm === '' || 
      cn.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cn.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTab = activeTab === 'all' || cn.status === activeTab
    
    return matchesSearch && matchesTab
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading credit notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Credit Notes</h1>
          <p className="text-slate-400 mt-1">Manage credit note requests and approvals</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <PropertySelector
                properties={properties}
                selectedId={selectedProperty}
                onChange={setSelectedProperty}
                placeholder="Select Property"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            
            <div className="w-full lg:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="w-full lg:w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by guest name or booking ID..."
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => {
                    setStartDate(getDateRangeStart('7d'))
                    setEndDate(new Date().toISOString().split('T')[0])
                  }}
                  className="btn-outline btn-xs"
                >
                  7D
                </button>
                <button
                  onClick={() => {
                    setStartDate(getDateRangeStart('30d'))
                    setEndDate(new Date().toISOString().split('T')[0])
                  }}
                  className="btn-outline btn-xs"
                >
                  30D
                </button>
                <button
                  onClick={() => {
                    setStartDate(getDateRangeStart('90d'))
                    setEndDate(new Date().toISOString().split('T')[0])
                  }}
                  className="btn-outline btn-xs"
                >
                  90D
                </button>
                <button
                  onClick={() => {
                    setStartDate(getDateRangeStart('1y'))
                    setEndDate(new Date().toISOString().split('T')[0])
                  }}
                  className="btn-outline btn-xs"
                >
                  1Y
                </button>
              </div>
              
              <button
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setSelectedStatus('')
                  setSearchTerm('')
                }}
                className="btn-outline btn-sm"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalPending}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(summary.pendingAmount)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalApproved}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalRejected}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Euro className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', name: 'All Credit Notes', count: creditNotes.length },
            { id: 'pending', name: 'Pending', count: summary?.totalPending || 0 },
            { id: 'approved', name: 'Approved', count: summary?.totalApproved || 0 },
            { id: 'rejected', name: 'Rejected', count: summary?.totalRejected || 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Credit Notes List */}
      <div className="space-y-4">
        {filteredCreditNotes.map((creditNote) => (
          <div key={creditNote.id} className="card">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(creditNote.status)}`}>
                      {creditNote.status}
                    </span>
                    <span className="text-sm text-gray-500">#{creditNote.bookingId}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatDate(creditNote.requestedDate)}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{creditNote.guestName}</h3>
                  <p className="text-gray-700 mb-2">{creditNote.reason}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Euro className="h-4 w-4 mr-1" />
                      {formatCurrency(creditNote.amount)}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {creditNote.requestedBy}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-1" />
                      {creditNote.propertyName}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedCreditNote(creditNote)
                      setShowDetailsModal(true)
                    }}
                    className="btn-outline btn-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  
                  {creditNote.status === 'pending' && user?.role && (isOwner(user.role) || isAccountant(user.role)) && (
                    <>
                      <button
                        onClick={() => handleApprove(creditNote.id)}
                        className="btn-success btn-sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(creditNote.id, 'Rejected by manager')}
                        className="btn-danger btn-sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCreditNotes.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No credit notes found</h3>
          <p className="text-gray-500 mb-4">No credit notes are currently available for this property.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Credit notes are fetched from the Hostkit API. 
              If you need to create credit notes, please use the Hostkit system directly.
            </p>
          </div>
        </div>
      )}

      {/* Credit Note Details Modal */}
      {showDetailsModal && selectedCreditNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Credit Note Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCreditNote.status)}`}>
                        {selectedCreditNote.status}
                      </span>
                      <span className="text-sm text-gray-500">#{selectedCreditNote.bookingId}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedCreditNote.amount)}</p>
                      <p className="text-sm text-gray-500">Total Amount</p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedCreditNote.guestName}</h4>
                  <p className="text-gray-700">{selectedCreditNote.reason}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credit Note ID</label>
                      <p className="text-sm text-gray-900">{selectedCreditNote.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID</label>
                      <p className="text-sm text-gray-900">{selectedCreditNote.bookingId}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                      <p className="text-sm text-gray-900">{selectedCreditNote.propertyName}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                      <p className="text-sm text-gray-900 font-semibold">{formatCurrency(selectedCreditNote.amount)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCreditNote.status)}`}>
                        {selectedCreditNote.status}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requested By</label>
                      <p className="text-sm text-gray-900">{selectedCreditNote.requestedBy}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requested Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedCreditNote.requestedDate)}</p>
                    </div>
                    
                    {selectedCreditNote.approvedBy && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                        <p className="text-sm text-gray-900">{selectedCreditNote.approvedBy}</p>
                      </div>
                    )}
                    
                    {selectedCreditNote.approvedDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Approved Date</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedCreditNote.approvedDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Notes */}
                {selectedCreditNote.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-900">{selectedCreditNote.notes}</p>
                    </div>
                  </div>
                )}

                {/* Invoice Reference */}
                {selectedCreditNote.invoiceId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Original Invoice ID</label>
                    <p className="text-sm text-gray-900">{selectedCreditNote.invoiceId}</p>
                  </div>
                )}

                {/* Credit Note URL */}
                {(selectedCreditNote as any).creditNoteUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Note URL</label>
                    <a 
                      href={(selectedCreditNote as any).creditNoteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Credit Note
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Close
                </button>
                
                {selectedCreditNote.status === 'pending' && user?.role && (isOwner(user.role) || isAccountant(user.role)) && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedCreditNote.id)}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                    >
                      <Check className="h-4 w-4 mr-2 inline" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedCreditNote.id, 'Rejected by manager')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                    >
                      <X className="h-4 w-4 mr-2 inline" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreditNotes