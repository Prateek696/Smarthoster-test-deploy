import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  FileText,
  Euro,
  Calendar,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { fetchInvoicesAsync } from '../store/invoices.slice'
import { fetchPropertiesAsync } from '../store/properties.slice'
import PropertySelector from '../components/common/PropertySelector'

const Invoices: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState('30d')
  
  const dispatch = useDispatch<AppDispatch>()
  const { invoices, isLoading, summary } = useSelector((state: RootState) => state.invoices)
  const { properties } = useSelector((state: RootState) => state.properties)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Fetch properties from database when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPropertiesAsync())
    }
  }, [dispatch, isAuthenticated])

  // State for filters
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Function to get last month's date range
  const getLastMonthRange = () => {
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    
    // Get first and last day of last month
    const startOfLastMonth = new Date(year, lastMonth, 1)
    const endOfLastMonth = new Date(year, lastMonth + 1, 0)
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      startDate: formatDate(startOfLastMonth),
      endDate: formatDate(endOfLastMonth)
    }
  }

  // Handle URL parameters for property-specific navigation
  useEffect(() => {
    const propertyId = searchParams.get('propertyId')
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')
    const period = searchParams.get('period')

    if (propertyId || startDateParam || endDateParam) {
      setSelectedPropertyId(propertyId ? parseInt(propertyId) : null)
      setStartDate(startDateParam || '')
      setEndDate(endDateParam || '')
      
      // Automatically fetch invoices with the applied filters
      if (propertyId) {
        dispatch(fetchInvoicesAsync({ 
          propertyId: parseInt(propertyId),
          startDate: startDateParam || undefined,
          endDate: endDateParam || undefined
        }))
      }
      
      // Show a notification about the applied filters
      if (period) {
        const periodText = period === 'thisMonth' ? 'this month' : 
                          period === 'lastMonth' ? 'last month' : period
        console.log(`Applied ${periodText} filters for property ${propertyId}`)
      }
    } else {
      // Auto-select last month if no date parameters are provided
      const lastMonthRange = getLastMonthRange()
      setStartDate(lastMonthRange.startDate)
      setEndDate(lastMonthRange.endDate)
      console.log('Auto-selected last month:', lastMonthRange)
    }
  }, [searchParams])

  // Auto-fetch invoices when dates are auto-selected (but no property is selected)
  useEffect(() => {
    if (startDate && endDate && !selectedPropertyId && properties.length > 0) {
      // If we have auto-selected dates but no property, fetch for the first property
      const firstProperty = properties[0]
      if (firstProperty) {
        setSelectedPropertyId(firstProperty.id)
        dispatch(fetchInvoicesAsync({ 
          propertyId: firstProperty.id,
          startDate: startDate,
          endDate: endDate
        }))
        console.log(`Auto-fetching invoices for property ${firstProperty.id} (${firstProperty.name}) for last month`)
      }
    }
  }, [startDate, endDate, selectedPropertyId, properties, dispatch])
  

  // Function to fetch invoices
  const fetchInvoices = () => {
    if (selectedPropertyId) {
      console.log('🔍 fetchInvoices called with propertyId:', selectedPropertyId)
      dispatch(fetchInvoicesAsync({ 
        propertyId: selectedPropertyId,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }))
    }
  }

  // Function to view invoice
  const handleViewInvoice = (invoice: any) => {
    if (invoice.invoiceUrl && invoice.invoiceUrl !== '#') {
      window.open(invoice.invoiceUrl, '_blank')
    } else {
      alert('Invoice URL not available')
    }
  }




  // Auto-fetch for first property on load
  useEffect(() => {
    console.log('🔍 Properties loaded:', properties.map(p => ({ id: p.id, name: p.name })))
    if (properties.length > 0 && !selectedPropertyId) {
      console.log('🔍 Setting selectedPropertyId to first property:', properties[0].id, properties[0].name)
      setSelectedPropertyId(properties[0].id)
    }
  }, [properties, selectedPropertyId])

  useEffect(() => {
    if (selectedPropertyId) {
      fetchInvoices()
    }
  }, [selectedPropertyId])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-danger-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const classes = {
      paid: 'badge-success',
      pending: 'badge-warning',
      overdue: 'badge-danger'
    }
    return classes[status as keyof typeof classes] || 'badge-gray'
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

  // First, remove duplicates based on invoice ID and property ID
  const uniqueInvoices = invoices.reduce((acc, invoice) => {
    const key = `${invoice.id}-${invoice.propertyId}`;
    if (!acc.has(key)) {
      acc.set(key, invoice);
    }
    return acc;
  }, new Map()).values();

  const uniqueInvoicesArray = Array.from(uniqueInvoices);
  console.log(`[INVOICE DEDUP] Removed ${invoices.length - uniqueInvoicesArray.length} duplicate invoices. Original: ${invoices.length}, Unique: ${uniqueInvoicesArray.length}`);

  const filteredInvoices = uniqueInvoicesArray.filter(invoice => {
    // First filter by selected property ID to fix the backend bug
    const matchesProperty = !selectedPropertyId || invoice.propertyId === selectedPropertyId
    
    if (!matchesProperty) {
      console.log(`[INVOICE FILTER] Filtering out invoice ${invoice.id} from property ${invoice.propertyId} (selected: ${selectedPropertyId})`);
    }
    
    const matchesSearch = invoice.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesProperty && matchesSearch
  })
  
  console.log(`[INVOICE FILTER] Final result: ${filteredInvoices.length} invoices for property ${selectedPropertyId}`);

  const calculatedSummary = {
    totalAmount: filteredInvoices.reduce((sum, inv) => sum + inv.total, 0),
    paidAmount: filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0),
    overdueAmount: filteredInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header Section */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoices</h1>
              <p className="text-lg text-gray-600">
                Manage guest invoices and billing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(calculatedSummary.totalAmount)}
                </p>
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <Euro className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Paid</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(calculatedSummary.paidAmount)}
                </p>
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(calculatedSummary.pendingAmount)}
                </p>
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2">Overdue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(calculatedSummary.overdueAmount)}
                </p>
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices, guests, properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 placeholder-gray-500 shadow-lg"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl font-semibold shadow-lg transition-all duration-300 flex items-center gap-2 ${
                showFilters 
                  ? 'bg-gradient-to-r from-[#5FFF56] to-[#4FEF46] text-white hover:from-[#4FEF46] hover:to-[#5FFF56]' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-8 p-8 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl border border-gray-100/50 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property</label>
                  <PropertySelector
                    properties={properties}
                    selectedId={selectedPropertyId}
                    onChange={(propertyId) => setSelectedPropertyId(propertyId)}
                    placeholder="Select Property"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-lg"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-lg"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-lg"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-lg">
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Range</label>
                  <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-lg">
                    <option value="">All Amounts</option>
                    <option value="0-100">€0 - €100</option>
                    <option value="100-500">€100 - €500</option>
                    <option value="500-1000">€500 - €1000</option>
                    <option value="1000+">€1000+</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={fetchInvoices}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                    disabled={!selectedPropertyId || isLoading}
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={fetchInvoices}
                    className="px-6 py-3 bg-gradient-to-r from-[#5FFF56] to-[#4FEF46] text-white rounded-2xl hover:from-[#4FEF46] hover:to-[#5FFF56] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    disabled={!selectedPropertyId}
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoices Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 animate-spin text-[#5FFF56] mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-700">Loading invoices...</p>
                </div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No invoices found</h3>
                <p className="text-lg text-gray-600 mb-6">No invoices are currently available for this property.</p>
                <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 max-w-md mx-auto">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Invoices are fetched from the Hostkit API. 
                    If you need to create invoices, please use the Hostkit system directly.
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Guest</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Property</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={`${invoice.id}-${invoice.propertyId}-${index}`} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 group">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg group-hover:text-[#5FFF56] transition-colors">{invoice.id}</p>
                            <p className="text-sm text-gray-500 font-medium">
                              {invoice.closed ? 'Closed' : 'Open'}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-lg">{invoice.guestName}</p>
                      </td>
                      
                      <td className="px-8 py-6 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-lg">{invoice.propertyName}</p>
                      </td>
                      
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-semibold text-gray-900">{formatDate(invoice.date)}</span>
                        </div>
                      </td>
                      
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-lg">{invoice.valueFormatted}</span>
                      </td>
                      
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-bold shadow-lg ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleViewInvoice(invoice)}
                            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            title="View Invoice"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Invoices


