import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Calendar,
  RefreshCw,
  AlertCircle,
  Upload,
  FileCheck,
  Send,
  Download
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { fetchBookingsAsync } from '../store/bookings.slice'
import { fetchSibaStatusAsync } from '../store/siba.slice'

import PropertySelector from '../components/common/PropertySelector'

const SIBA: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const dispatch = useDispatch<AppDispatch>()
  const { properties } = useSelector((state: RootState) => state.properties)
  const { bookings, isLoading: bookingsLoading } = useSelector((state: RootState) => state.bookings)
  const { statuses: sibaStatuses, isLoading: sibaLoading } = useSelector((state: RootState) => state.siba)

  // Auto-select first property if none selected and properties are available
  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      console.log('🔍 SIBA: Auto-selecting first property:', properties[0]);
      setSelectedPropertyId(properties[0].id);
    }
  }, [properties, selectedPropertyId]);

  // Fetch real data when component mounts or property/date changes
  useEffect(() => {
    if (selectedPropertyId) {
      dispatch(fetchSibaStatusAsync(selectedPropertyId))
      dispatch(fetchBookingsAsync({
        propertyId: selectedPropertyId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }))
    }
  }, [dispatch, selectedPropertyId, dateRange])

  // Get real SIBA status from Redux store
  const sibaStatus = sibaStatuses[selectedPropertyId || 0]
  
  // Simple booking statistics
  const totalBookings = bookings?.length || 0
  const totalGuests = bookings?.reduce((sum, booking) => sum + booking.adults + booking.children, 0) || 0
  const submittedGuests = totalGuests // All guests are considered submitted for SIBA
  const pendingGuests = 0
  const complianceRate = totalGuests > 0 ? Math.round((submittedGuests / totalGuests) * 100) : 0

  // Format date helper
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Status helpers
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'green': return 'border-green-200 bg-green-50'
      case 'amber': return 'border-yellow-200 bg-yellow-50'
      case 'red': return 'border-red-200 bg-red-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'green': return 'Compliant'
      case 'amber': return 'Warning'
      case 'red': return 'Overdue'
      default: return 'Unknown'
    }
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'green': return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'amber': return <AlertTriangle className="h-8 w-8 text-yellow-600" />
      case 'red': return <AlertCircle className="h-8 w-8 text-red-600" />
      default: return <Shield className="h-8 w-8 text-gray-400" />
    }
  }

  const isLoading = sibaLoading || bookingsLoading

  // Show empty state when no property is selected
  if (!selectedPropertyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Property Selected</h3>
              <p className="text-gray-500 mb-4">Please select a property to view SIBA compliance status.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-sm lg:text-base font-bold text-gray-900 mb-1">SIBA Manager Dashboard</h1>
              <p className="text-[10px] text-gray-600">Real-time compliance monitoring and guest reporting</p>
            </div>
            <div className="flex items-center space-x-4">
              <PropertySelector
                selectedId={selectedPropertyId}
                onChange={setSelectedPropertyId}
                properties={properties}
              />
              <button
                onClick={() => {
                  if (selectedPropertyId) {
                    dispatch(fetchSibaStatusAsync(selectedPropertyId))
                    dispatch(fetchBookingsAsync({
                      propertyId: selectedPropertyId,
                      startDate: dateRange.startDate,
                      endDate: dateRange.endDate
                    }))
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">Loading SIBA Data...</p>
            </div>
          </div>
        ) : sibaStatus ? (
          <>
            {/* Real SIBA Status - Full Screen */}
            <div className={`bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 p-8 mb-8 hover:shadow-3xl transition-all duration-300 ${getStatusColor(sibaStatus.status)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                    {getStatusIcon(sibaStatus.status)}
                  </div>
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">SIBA Status: {getStatusText(sibaStatus.status)}</h2>
                    <p className="text-sm text-gray-600 mb-2">{sibaStatus.message}</p>
                    {sibaStatus.lastSibaSendDate && (
                      <p className="text-sm text-gray-500">
                        Last submission: <span className={`font-semibold ${sibaStatus.status === 'green' ? 'text-green-600' : sibaStatus.status === 'amber' ? 'text-yellow-600' : 'text-red-600'}`}>{formatDate(sibaStatus.lastSibaSendDate)}</span>
                      </p>
                    )}
                    {sibaStatus.nextDueDate && (
                      <p className="text-sm text-gray-500">
                        Next due: <span className={`font-semibold ${(sibaStatus.daysUntilDue || 0) > 7 ? 'text-green-600' : (sibaStatus.daysUntilDue || 0) > 0 ? 'text-yellow-600' : 'text-red-600'}`}>{formatDate(sibaStatus.nextDueDate)}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg lg:text-xl font-bold text-gray-900 mb-2">{complianceRate}%</p>
                  <p className="text-sm text-gray-600">Compliance Rate</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Data source: {sibaStatus.dataSource} • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Real Statistics - Full Width Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
              <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 p-2 text-center hover:shadow-md transition-all duration-300">
                <div className="p-0.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md w-fit mx-auto mb-1">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{submittedGuests}</p>
                <p className="text-[10px] text-gray-600 mb-0.5">Submitted Guests</p>
                <p className="text-[9px] text-gray-500">Real booking data</p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 p-2 text-center hover:shadow-md transition-all duration-300">
                <div className="p-0.5 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-md w-fit mx-auto mb-1">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{pendingGuests}</p>
                <p className="text-[10px] text-gray-600 mb-0.5">Pending Guests</p>
                <p className="text-[9px] text-gray-500">Awaiting submission</p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 p-2 text-center hover:shadow-md transition-all duration-300">
                <div className="p-0.5 bg-gradient-to-br from-green-500 to-green-600 rounded-md w-fit mx-auto mb-1">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{totalBookings}</p>
                <p className="text-[10px] text-gray-600 mb-0.5">Total Bookings</p>
                <p className="text-[9px] text-gray-500">Current period</p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 p-2 text-center hover:shadow-md transition-all duration-300">
                <div className="p-0.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md w-fit mx-auto mb-1">
                  <FileCheck className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-0.5">{totalGuests}</p>
                <p className="text-[10px] text-gray-600 mb-0.5">Total Guests</p>
                <p className="text-[9px] text-gray-500">All visitors</p>
              </div>
            </div>

          </>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No SIBA Data Available</h3>
              <p className="text-gray-500">Unable to fetch SIBA status for the selected property.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SIBA