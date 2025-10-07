import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  Search, 
  Filter, 
  Download, 
  Calendar,
  Users,
  MapPin,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  AlertCircle,
  Shield
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { fetchBookingsAsync, setFilters, setBookings, Booking } from '../store/bookings.slice'
import { fetchPropertiesAsync } from '../store/properties.slice'
import PropertySelector from '../components/common/PropertySelector'
import usePropertyRefresh from '../hooks/usePropertyRefresh'
import { getPropertyName } from '../utils/propertyUtils'
import SibaManagerTools from '../components/siba/SibaManagerTools'

const Bookings: React.FC = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<{
    propertyId?: number;
    period?: string;
    startDate?: string;
    endDate?: string;
  } | null>(null)
  const [tempFilters, setTempFilters] = useState({
    propertyId: null as number | null,
    status: '',
    startDate: '',
    endDate: '',
    platform: ''
  })
  const [selectedDateRange, setSelectedDateRange] = useState('')
  
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { bookings, isLoading, error, filters } = useSelector((state: RootState) => state.bookings)
  const { properties } = useSelector((state: RootState) => state.properties)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  // Listen for property deletion events to refresh property lists
  usePropertyRefresh()

  // Fetch properties from database when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPropertiesAsync())
    }
  }, [dispatch, isAuthenticated])

  // Auto-select first property if none selected and properties are available
  useEffect(() => {
    if (properties.length > 0 && !filters.propertyId) {
      console.log('🔍 Bookings: Auto-selecting first property:', properties[0]);
      dispatch(setFilters({ propertyId: properties[0].id }));
    }
  }, [properties, filters.propertyId, dispatch])

  // Function to get current month's date range
  const getCurrentMonthRange = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const year = now.getFullYear()
    
    // Get first and last day of current month
    const startOfCurrentMonth = new Date(year, currentMonth, 1)
    const endOfCurrentMonth = new Date(year, currentMonth + 1, 0)
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      startDate: formatDate(startOfCurrentMonth),
      endDate: formatDate(endOfCurrentMonth)
    }
  }

  // Function to get date range based on selection
  const getDateRange = (range: string) => {
    const now = new Date()
    const endDate = now.toISOString().split('T')[0]
    
    switch (range) {
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          startDate: lastMonth.toISOString().split('T')[0],
          endDate: lastMonthEnd.toISOString().split('T')[0]
        }
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        return {
          startDate: threeMonthsAgo.toISOString().split('T')[0],
          endDate: endDate
        }
      default:
        const defaultStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const defaultEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        return {
          startDate: defaultStart.toISOString().split('T')[0],
          endDate: defaultEnd.toISOString().split('T')[0]
        }
    }
  }


  // Handle URL parameters for property-specific navigation
  useEffect(() => {
    const propertyId = searchParams.get('propertyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const period = searchParams.get('period')

    if (propertyId || startDate || endDate) {
      const newFilters = {
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        startDate: startDate || '',
        endDate: endDate || '',
        status: '',
        platform: ''
      }
      
      setTempFilters({
        propertyId: propertyId ? parseInt(propertyId) : null,
        startDate: startDate || '',
        endDate: endDate || '',
        status: '',
        platform: ''
      })
      dispatch(setFilters({
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
        status: ''
      }))
      
      // Automatically fetch bookings with the applied filters
      if (propertyId) {
        dispatch(fetchBookingsAsync({
          propertyId: parseInt(propertyId),
          startDate: startDate || undefined,
          endDate: endDate || undefined
        }))
      }
      
      // Show a notification about the applied filters
      if (period) {
        const periodText = period === 'thisMonth' ? 'this month' : 
                          period === 'lastMonth' ? 'last month' : period
        console.log(`Applied ${periodText} filters for property ${propertyId}`)
        
        setAppliedFilters({
          propertyId: propertyId ? parseInt(propertyId) : undefined,
          period: periodText,
          startDate: startDate || undefined,
          endDate: endDate || undefined
        })
      }
    } else {
      // Auto-select current month if no date parameters are provided
      const currentMonthRange = getCurrentMonthRange()
      setTempFilters(prev => ({
        ...prev,
        startDate: currentMonthRange.startDate,
        endDate: currentMonthRange.endDate
      }))
      
      // Also set the filters in Redux store
      dispatch(setFilters({
        dateRange: {
          start: currentMonthRange.startDate,
          end: currentMonthRange.endDate
        }
      }))
      
      console.log('Auto-selected current month:', currentMonthRange)
    }
  }, [searchParams, dispatch])

  // Auto-fetch bookings when dates are auto-selected (but no property is selected)
  useEffect(() => {
    if (tempFilters.startDate && tempFilters.endDate && !tempFilters.propertyId && properties.length > 0) {
      // If we have auto-selected dates but no property, fetch for the first property
      const firstProperty = properties[0]
      if (firstProperty) {
        setTempFilters(prev => ({
          ...prev,
          propertyId: firstProperty.id
        }))
        dispatch(fetchBookingsAsync({
          propertyId: firstProperty.id,
          startDate: tempFilters.startDate,
          endDate: tempFilters.endDate
        }))
        console.log(`Auto-fetching bookings for property ${firstProperty.id} (${firstProperty.name}) for current month`)
      }
    }
  }, [tempFilters.startDate, tempFilters.endDate, tempFilters.propertyId, properties, dispatch])

  // Get property name using utility function (dynamic from database)
  const getPropertyNameById = (propertyId: number) => {
    return getPropertyName(propertyId, { properties: { properties } } as RootState)
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Modified': 'bg-blue-100 text-blue-800 border-blue-200',
      'In Enquiry': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'inquiryPreapproved': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      // Legacy support
      'modified': 'bg-blue-100 text-blue-800 border-blue-200',
      'inquiry': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'inquiry-pre-approved': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      // Fallback for unknown statuses
      'Unknown': 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Removed conflicting useEffect - current month logic is handled above

  const handleFilterChange = (key: string, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const filtersToSet = {
      propertyId: tempFilters.propertyId || undefined,
      status: tempFilters.status || undefined,
      dateRange: tempFilters.startDate && tempFilters.endDate ? {
        start: tempFilters.startDate,
        end: tempFilters.endDate
      } : undefined
    }
    dispatch(setFilters(filtersToSet))
    setShowFilters(false)
    
    // Refetch bookings with the new filters
    const propertyId = tempFilters.propertyId
    if (propertyId) {
      dispatch(fetchBookingsAsync({ 
        propertyId,
        startDate: tempFilters.startDate,
        endDate: tempFilters.endDate
      }))
    }
  }

  const clearFilters = () => {
    setTempFilters({
      propertyId: null,
      status: '',
      startDate: '',
      endDate: '',
      platform: ''
    })
    dispatch(setFilters({}))
    
    // Clear bookings when no property is selected
    dispatch(setBookings([]))
  }


  const handleViewBooking = (bookingId: string, propertyId: number) => {
    navigate(`/bookings/${bookingId}?propertyId=${propertyId}`)
  }

  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking)
    setShowBookingDetails(true)
  }

  const handleCloseBookingDetails = () => {
    setShowBookingDetails(false)
    setSelectedBooking(null)
  }

  // Process real bookings data from API
  const processedBookings = bookings.map(booking => ({
    id: booking.id?.toString() || booking.id,
    propertyId: booking.propertyId,
    guestName: booking.guestName || 'Unknown Guest',
    bookingId: booking.id?.toString() || 'N/A',
    checkInDate: booking.arrivalDate || booking.checkIn,
    checkOutDate: booking.departureDate || booking.checkOut,
    totalAmount: booking.totalPrice || 0,
    status: booking.status || 'pending',
    paymentStatus: (booking as any).paymentStatus, // Add payment status
    platform: booking.provider || booking.platform || 'Direct',
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    nights: booking.nights || 1,
    adults: booking.adults || 1,
    children: booking.children || 0,
    specialRequests: '',
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  }))

  const filteredBookings = processedBookings.filter(booking => {
    const matchesSearch = booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.propertyId?.toString().includes(searchTerm) ||
                         booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProperty = !tempFilters.propertyId || booking.propertyId === tempFilters.propertyId
    const matchesStatus = !tempFilters.status || 
      booking.paymentStatus?.toLowerCase() === tempFilters.status.toLowerCase() ||
      booking.status === tempFilters.status
    const matchesPlatform = !tempFilters.platform || booking.platform === tempFilters.platform
    
    return matchesSearch && matchesProperty && matchesStatus && matchesPlatform
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">{t('bookings.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">Error loading bookings</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show empty state when no property is selected
  if (!filters.propertyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Property Selected</h3>
            <p className="text-gray-500 mb-4">{t('bookings.selectProperty')}</p>
            <button
              onClick={() => setShowFilters(true)}
              className="btn btn-primary"
            >
              Select Property
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header Section - Fixed */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-16 left-0 right-0 z-20 lg:left-64">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('bookings.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('bookings.manageReservations')}
              </p>
              {appliedFilters && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-700 font-medium">
                        {t('bookings.showingData').replace('{period}', appliedFilters.period || '')}
                        {appliedFilters.propertyId && ` ${t('bookings.forProperty').replace('{propertyId}', appliedFilters.propertyId.toString())}`}
                        {appliedFilters.startDate && appliedFilters.endDate && 
                          ` ${t('bookings.dateRange').replace('{startDate}', new Date(appliedFilters.startDate).toLocaleDateString()).replace('{endDate}', new Date(appliedFilters.endDate).toLocaleDateString())}`
                        }
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setAppliedFilters(null)
                        setSearchParams({})
                        setTempFilters({
                          propertyId: null,
                          status: '',
                          startDate: '',
                          endDate: '',
                          platform: ''
                        })
                        dispatch(setFilters({
                          propertyId: undefined,
                          dateRange: undefined,
                          status: ''
                        }))
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
{t('bookings.clearFilters')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-6 lg:mt-0">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">{t('bookings.property')}</label>
                <PropertySelector
                  selectedId={tempFilters.propertyId}
                  onChange={(value) => {
                    handleFilterChange('propertyId', value)
                    if (value) {
                      dispatch(fetchBookingsAsync({ propertyId: value }))
                    }
                  }}
                  properties={properties}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4 pt-20">

        {/* Search and Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-all duration-300 flex items-center gap-1 border ${
                showFilters 
                  ? 'bg-blue-500/20 text-gray-900 border-blue-200 hover:bg-blue-500/30' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 opacity-70" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property</label>
                  <PropertySelector
                    selectedId={tempFilters.propertyId}
                    onChange={(value) => handleFilterChange('propertyId', value)}
                    properties={properties}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('bookings.status')}</label>
                      <select
                        value={tempFilters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                      >
                        <option value="">{t('bookings.allStatuses')}</option>
                        <option value="Modified">{t('bookings.modified')}</option>
                        <option value="In Enquiry">{t('bookings.inquiry')}</option>
                        <option value="inquiryPreapproved">{t('bookings.inquiryPreapproved')}</option>
                        <option value="Cancelled">{t('bookings.cancelled')}</option>
                      </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => {
                      setSelectedDateRange(e.target.value)
                      const { startDate: newStartDate, endDate: newEndDate } = getDateRange(e.target.value)
                      setTempFilters(prev => ({
                        ...prev,
                        startDate: newStartDate,
                        endDate: newEndDate
                      }))
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                  >
                    <option value="">{t('bookings.selectDateRange')}</option>
                    <option value="lastMonth">{t('bookings.lastMonth')}</option>
                    <option value="last3Months">{t('bookings.last3Months')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('bookings.checkinFrom')}</label>
                  <input
                    type="date"
                    value={tempFilters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('bookings.checkinTo')}</label>
                  <input
                    type="date"
                    value={tempFilters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold shadow-md"
                >
{t('bookings.clearAll')}
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-500/20 text-gray-900 rounded-lg hover:bg-blue-500/30 transition-all duration-300 font-semibold shadow-sm hover:shadow-md border border-blue-200"
                >
{t('bookings.applyFilters')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.guest')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.property')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.checkin')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.checkout')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('bookings.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shadow-sm border border-blue-200">
                          <span className="text-sm font-bold text-gray-900 opacity-70">
                            {booking.guestName?.charAt(0) || 'G'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{booking.guestName || 'Guest'}</p>
                          <p className="text-xs text-gray-500 font-medium">ID: {booking.bookingId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold text-gray-900 text-sm">{getPropertyNameById(booking.propertyId || 0)}</p>
                      <p className="text-xs text-gray-500 font-medium">Algarve, Portugal</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">{formatDate(booking.checkInDate || '')}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-gray-900">{formatDate(booking.checkOutDate || '')}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-gray-900 text-sm">{formatCurrency(booking.totalAmount || 0)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold shadow-md ${
                        booking.status === 'Modified' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'In Enquiry' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'inquiryPreapproved' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || booking.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewBooking(booking.id, booking.propertyId || 392776)}
                          className="p-2 bg-blue-500/20 text-gray-900 rounded-lg hover:bg-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-md border border-blue-200"
                          title={t('bookings.viewDetails')}
                        >
                          <Eye className="w-4 h-4 opacity-70" />
                        </button>
                        {/* SIBA Manager Button - Commented out as requested */}
                        {/* <button
                          onClick={() => handleViewBookingDetails(booking)}
                          className="p-3 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white rounded-2xl hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all duration-300 shadow-lg hover:shadow-xl"
                          title="SIBA Manager"
                        >
                          <Shield className="w-5 h-5" />
                        </button> */}
                        {/* Download Button - Commented out as requested */}
                        {/* <button
                          onClick={() => {
                            // Download individual booking as PDF using window.print()
                            const bookingData = {
                              guestName: booking.guestName,
                              property: getPropertyNameById(booking.propertyId || 0),
                              checkIn: formatDate(booking.checkInDate || ''),
                              checkOut: formatDate(booking.checkOutDate || ''),
                              amount: formatCurrency(booking.totalAmount || 0),
                              status: booking.status || booking.paymentStatus,
                              platform: booking.platform,
                              bookingId: booking.bookingId,
                              nights: booking.nights,
                              adults: booking.adults,
                              children: booking.children
                            }
                            
                            // Create a new window with the booking details for printing
                            const printWindow = window.open('', '_blank')
                            if (printWindow) {
                              printWindow.document.write(`
                                <html>
                                  <head>
                                    <title>Booking Confirmation - ${bookingData.bookingId}</title>
                                    <style>
                                      * { margin: 0; padding: 0; box-sizing: border-box; }
                                      
                                      body { 
                                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                                        background: #f8fafc;
                                        color: #1a202c;
                                        line-height: 1.6;
                                      }
                                      
                                      .container {
                                        max-width: 800px;
                                        margin: 0 auto;
                                        background: white;
                                        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                                        min-height: 100vh;
                                      }
                                      
                                      .header {
                                        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                                        color: white;
                                        padding: 40px 30px;
                                        text-align: center;
                                        position: relative;
                                        overflow: hidden;
                                      }
                                      
                                      .header::before {
                                        content: '';
                                        position: absolute;
                                        top: -50%;
                                        right: -50%;
                                        width: 200%;
                                        height: 200%;
                                        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                                        animation: float 6s ease-in-out infinite;
                                      }
                                      
                                      @keyframes float {
                                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                                        50% { transform: translateY(-20px) rotate(180deg); }
                                      }
                                      
                                      .logo {
                                        font-size: 28px;
                                        font-weight: 700;
                                        margin-bottom: 8px;
                                        position: relative;
                                        z-index: 1;
                                      }
                                      
                                      .subtitle {
                                        font-size: 16px;
                                        opacity: 0.9;
                                        position: relative;
                                        z-index: 1;
                                      }
                                      
                                      .booking-id {
                                        background: rgba(255,255,255,0.2);
                                        padding: 8px 16px;
                                        border-radius: 20px;
                                        display: inline-block;
                                        margin-top: 15px;
                                        font-weight: 600;
                                        position: relative;
                                        z-index: 1;
                                      }
                                      
                                      .content {
                                        padding: 40px 30px;
                                      }
                                      
                                      .section {
                                        margin-bottom: 35px;
                                      }
                                      
                                      .section-title {
                                        font-size: 20px;
                                        font-weight: 600;
                                        color: #1e40af;
                                        margin-bottom: 20px;
                                        padding-bottom: 10px;
                                        border-bottom: 2px solid #e2e8f0;
                                        position: relative;
                                      }
                                      
                                      .section-title::after {
                                        content: '';
                                        position: absolute;
                                        bottom: -2px;
                                        left: 0;
                                        width: 50px;
                                        height: 2px;
                                        background: #3b82f6;
                                      }
                                      
                                      .details-grid {
                                        display: grid;
                                        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                                        gap: 25px;
                                      }
                                      
                                      .detail-card {
                                        background: #f8fafc;
                                        border: 1px solid #e2e8f0;
                                        border-radius: 12px;
                                        padding: 20px;
                                        transition: all 0.3s ease;
                                        position: relative;
                                        overflow: hidden;
                                      }
                                      
                                      .detail-card::before {
                                        content: '';
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 4px;
                                        height: 100%;
                                        background: linear-gradient(135deg, #3b82f6, #1e40af);
                                      }
                                      
                                      .detail-card:hover {
                                        transform: translateY(-2px);
                                        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
                                      }
                                      
                                      .detail-label {
                                        font-size: 12px;
                                        font-weight: 600;
                                        color: #64748b;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                        margin-bottom: 8px;
                                      }
                                      
                                      .detail-value {
                                        font-size: 16px;
                                        font-weight: 500;
                                        color: #1e2022;
                                      }
                                      
                                      .highlight-card {
                                        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                                        border: 1px solid #0ea5e9;
                                        border-radius: 16px;
                                        padding: 25px;
                                        text-align: center;
                                        margin: 20px 0;
                                      }
                                      
                                      .amount {
                                        font-size: 32px;
                                        font-weight: 700;
                                        color: #0ea5e9;
                                        margin-bottom: 8px;
                                      }
                                      
                                      .status-badge {
                                        display: inline-block;
                                        padding: 8px 16px;
                                        border-radius: 20px;
                                        font-size: 14px;
                                        font-weight: 600;
                                        text-transform: uppercase;
                                        letter-spacing: 0.5px;
                                      }
                                      
                                      .status-confirmed { background: #dcfce7; color: #166534; }
                                      .status-pending { background: #fef3c7; color: #92400e; }
                                      .status-cancelled { background: #fee2e2; color: #991b1b; }
                                      .status-modified { background: #e0e7ff; color: #3730a3; }
                                      
                                      .footer {
                                        background: #f8fafc;
                                        padding: 30px;
                                        text-align: center;
                                        border-top: 1px solid #e2e8f0;
                                        color: #64748b;
                                        font-size: 14px;
                                      }
                                      
                                      .footer-content {
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        flex-wrap: wrap;
                                        gap: 20px;
                                      }
                                      
                                      .company-info {
                                        text-align: left;
                                      }
                                      
                                      .generated-info {
                                        text-align: right;
                                        font-size: 12px;
                                      }
                                      
                                      @media print {
                                        body { background: white; }
                                        .container { box-shadow: none; }
                                        .header::before { display: none; }
                                        .detail-card:hover { transform: none; }
                                      }
                                      
                                      @media (max-width: 600px) {
                                        .details-grid { grid-template-columns: 1fr; }
                                        .footer-content { flex-direction: column; text-align: center; }
                                        .company-info, .generated-info { text-align: center; }
                                      }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="container">
                                      <div class="header">
                                        <div class="logo">🏨 SmartHoster.io</div>
                                        <div class="subtitle">Property Management Portal</div>
                                        <div class="booking-id">Booking #${bookingData.bookingId}</div>
                                      </div>
                                      
                                      <div class="content">
                                        <div class="section">
                                          <h2 class="section-title">Booking Information</h2>
                                          <div class="details-grid">
                                            <div class="detail-card">
                                              <div class="detail-label">Guest Name</div>
                                              <div class="detail-value">${bookingData.guestName}</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Property</div>
                                              <div class="detail-value">${bookingData.property}</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Check-in Date</div>
                                              <div class="detail-value">${bookingData.checkIn}</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Check-out Date</div>
                                              <div class="detail-value">${bookingData.checkOut}</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Duration</div>
                                              <div class="detail-value">${bookingData.nights} nights</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Guests</div>
                                              <div class="detail-value">${bookingData.adults} adults, ${bookingData.children} children</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Platform</div>
                                              <div class="detail-value">${bookingData.platform}</div>
                                            </div>
                                            
                                            <div class="detail-card">
                                              <div class="detail-label">Status</div>
                                              <div class="detail-value">
                                                <span class="status-badge status-${bookingData.status.toLowerCase()}">${bookingData.status}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div class="section">
                                          <div class="highlight-card">
                                            <div class="detail-label">Total Amount</div>
                                            <div class="amount">${bookingData.amount}</div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div class="footer">
                                        <div class="footer-content">
                                          <div class="company-info">
                                            <strong>SmartHoster.io</strong><br>
                                            Property Management Solutions<br>
                                            Algarve, Portugal
                                          </div>
                                          <div class="generated-info">
                                            Generated on ${new Date().toLocaleDateString('en-US', { 
                                              weekday: 'long', 
                                              year: 'numeric', 
                                              month: 'long', 
                                              day: 'numeric' 
                                            })}<br>
                                            at ${new Date().toLocaleTimeString('en-US', { 
                                              hour: '2-digit', 
                                              minute: '2-digit' 
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </body>
                                </html>
                              `)
                              printWindow.document.close()
                              
                              // Wait for content to load, then trigger print
                              setTimeout(() => {
                                printWindow.print()
                                // Close the window after printing
                                setTimeout(() => printWindow.close(), 1000)
                              }, 500)
                            }
                          }}
                          className="p-3 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white rounded-2xl hover:from-[#1d4ed8] hover:to-[#1e40af] transition-all duration-300 shadow-lg hover:shadow-xl"
                          title="Download PDF"
                        >
                          <Download className="w-5 h-5" />
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Details Modal with SIBA Manager Tools */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('bookings.bookingDetails')}</h2>
                <button
                  onClick={handleCloseBookingDetails}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Booking Information */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
{t('bookings.bookingInformation')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.guestName')}</span>
                        <span className="text-gray-900 font-semibold">{selectedBooking.guestName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.propertyLabel')}</span>
                        <span className="text-gray-900 font-semibold">{getPropertyNameById(selectedBooking.propertyId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.checkinLabel')}</span>
                        <span className="text-gray-900 font-semibold">{formatDate(selectedBooking.checkInDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.checkoutLabel')}</span>
                        <span className="text-gray-900 font-semibold">{formatDate(selectedBooking.checkOutDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.adults')}</span>
                        <span className="text-gray-900 font-semibold">{selectedBooking.adults}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.children')}</span>
                        <span className="text-gray-900 font-semibold">{selectedBooking.children}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.totalAmount')}</span>
                        <span className="text-gray-900 font-semibold">{formatCurrency(selectedBooking.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 font-medium">{t('bookings.status')}:</span>
                        <span className={`font-semibold ${
                          selectedBooking.paymentStatus === 'Paid' ? 'text-green-600' : 
                          selectedBooking.paymentStatus === 'Pending' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {selectedBooking.status || selectedBooking.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SIBA Manager Tools */}
                <div className="space-y-6">
                  <SibaManagerTools
                    reservation={selectedBooking}
                    propertyId={selectedBooking.propertyId}
                    onSibaSent={(submissionId) => {
                      console.log('SIBA submitted with ID:', submissionId)
                      // You can add additional logic here, like refreshing the booking data
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bookings
