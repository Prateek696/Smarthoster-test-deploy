import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  Euro, 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Download,
  RefreshCw,
  MapPin,
  Baby,
  User
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { CityTaxData } from '../store/touristTax.slice'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}
import { RootState, AppDispatch } from '../store'
import { fetchCityTaxAsync } from '../store/touristTax.slice'
import { fetchPropertiesAsync } from '../store/properties.slice'
import PropertySelector from '../components/common/PropertySelector'
import StatCard from '../components/dashboard/StatCard'

const TouristTax: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(392776) // Default to first property
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [filterType, setFilterType] = useState<'checkin' | 'checkout'>('checkin')

  const dispatch = useDispatch<AppDispatch>()
  const touristTaxState = useSelector((state: RootState) => state.touristTax)
  const { data, isLoading, error } = touristTaxState
  const { properties, isLoading: propertiesLoading } = useSelector((state: RootState) => state.properties)
  

  // Use real data from API or fallback to sample data
  const displayData = data ? {
    propertyId: data.propertyId || selectedPropertyId || 392776,
    startDate: data.startDate || dateRange.startDate,
    endDate: data.endDate || dateRange.endDate,
    // City Tax Report Data (matching Hostkit format)
    cityTaxCalculated: data.cityTaxCalculated || 0,
    cityTaxCalculatedFormatted: data.cityTaxCalculatedFormatted || "€0,00",
    cityTaxNights: data.cityTaxNights || 0,
    childrenNights: data.childrenNights || 0,
    nightsBeyond: data.nightsBeyond || 0,
    totalNights: data.totalNights || 0,
    hostkitTotalNights: data.hostkitTotalNights || 0,
    cityTaxInvoiced: data.cityTaxInvoiced || 0,
    cityTaxInvoicedFormatted: data.cityTaxInvoicedFormatted || "€0,00",
    cityTaxInvoicedNights: data.cityTaxInvoicedNights || 0,
    // Legacy fields for compatibility (using flat structure from API)
    totalTax: data.totalTax || 0,
    totalTaxFormatted: data.totalTaxFormatted || "€0,00",
    totalBookings: data.totalBookings || 0,
    totalGuests: data.totalGuests || 0,
    adultNights: data.adultNights || 0,
    exemptNights: data.exemptNights || 0,
    taxableNights: data.taxableNights || 0,
    averageTaxPerNight: data.averageTaxPerNight || 0,
    averageTaxPerNightFormatted: data.averageTaxPerNightFormatted || "€0,00",
    averageTaxPerGuest: data.averageTaxPerGuest || 0,
    averageTaxPerGuestFormatted: data.averageTaxPerGuestFormatted || "€0,00",
    bookingsPlatforms: data.bookingsPlatforms || {},
    taxStatus: data.taxStatus || "not_implemented",
    dataSource: data.dataSource || "api",
    futureReady: data.futureReady || true,
    currency: "EUR"
  } : {
    propertyId: selectedPropertyId || 392776,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    totalTax: 0,
    totalTaxFormatted: "€0,00",
    totalBookings: 0,
    totalGuests: 0,
    totalNights: 0,
    adultNights: 0,
    childrenNights: 0,
    exemptNights: 0,
    taxableNights: 0,
    averageTaxPerNight: 0,
    averageTaxPerNightFormatted: "€0,00",
    averageTaxPerGuest: 0,
    averageTaxPerGuestFormatted: "€0,00",
    bookingsPlatforms: {},
    taxStatus: "not_implemented" as const,
    dataSource: "fallback",
    futureReady: true,
    currency: "EUR"
  }
  

  // Fetch properties when component mounts
  useEffect(() => {
    if (properties.length === 0 && !propertiesLoading) {
      dispatch(fetchPropertiesAsync())
    }
  }, [dispatch, properties.length, propertiesLoading])

  // Debug Redux state
  useEffect(() => {
    if (selectedPropertyId) {
      dispatch(fetchCityTaxAsync({
        propertyId: selectedPropertyId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        filterType: filterType
      }))
    }
  }, [dispatch, selectedPropertyId, dateRange, filterType])

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  const handleRefresh = () => {
    if (selectedPropertyId) {
      dispatch(fetchCityTaxAsync({
        propertyId: selectedPropertyId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        filterType: filterType
      }))
    }
  }

  const handleExportPDF = () => {
    console.log('Export PDF button clicked')
    console.log('Data available:', !!data)
    console.log('Selected property ID:', selectedPropertyId)
    console.log('Display data:', displayData)
    
    if (!data || !selectedPropertyId) {
      alert('No data available to export')
      return
    }

    try {
      console.log('Creating PDF document...')
      const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Get property name
    const propertyName = properties?.find(p => p.id === selectedPropertyId)?.name || `Property ID: ${selectedPropertyId}`
    
    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Tourist Tax Report', pageWidth / 2, 20, { align: 'center' })
    
    // Property and Date Range Info
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Property: ${propertyName}`, 20, 35)
    doc.text(`Date Range: ${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`, 20, 45)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 55)
    
    let yPosition = 70
    
    // Summary Section
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Summary data
    const summaryData = [
      ['Tax Status', getStatusText(displayData.taxStatus)],
      ['Current Tax Collected', data?.totalTaxFormatted || "€0,00"],
      ['Estimated Tax Potential', data?.totalTaxFormatted || "€0,00"],
      ['Total Bookings', displayData.totalBookings.toString()],
      ['Total Guests', displayData.totalGuests.toString()],
      ['Total Nights', displayData.totalNights.toString()],
      ['Adult Nights', displayData.adultNights.toString()],
      ['Children Nights', displayData.childrenNights.toString()],
      ['Taxable Nights', displayData.taxableNights.toString()],
      ['Exempt Nights', displayData.exemptNights.toString()],
      ['Average Tax per Night', displayData.averageTaxPerNightFormatted],
      ['Average Tax per Guest', displayData.averageTaxPerGuestFormatted],
      ['Tax Rate per Adult Night', data?.averageTaxPerGuestFormatted || "€0,00"]
    ]
    
    summaryData.forEach(([label, value]) => {
      doc.text(`${label}:`, 25, yPosition)
      doc.text(`${value}`, 100, yPosition)
      yPosition += 6
    })
    
    yPosition += 10
    
    // Platform Breakdown
    if (Object.keys(displayData.bookingsPlatforms).length > 0) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Bookings by Platform', 20, yPosition)
      yPosition += 10
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      Object.entries(displayData.bookingsPlatforms).forEach(([platform, count]) => {
        const bookingCount = typeof count === 'number' ? count : (count as any)?.bookings || 0
        const percentage = (bookingCount / displayData.totalBookings * 100).toFixed(1)
        doc.text(`${platform}: ${bookingCount} bookings (${percentage}%)`, 25, yPosition)
        yPosition += 6
      })
      
      yPosition += 10
    }
    
    // Detailed Bookings Table - Not available in City Tax data
    // City Tax focuses on summary data rather than individual booking details
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text('Generated by OwnerPortal Tourist Tax System', pageWidth / 2, pageHeight - 10, { align: 'center' })
    }
    
      // Save the PDF
      const fileName = `TouristTax_${propertyName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateRange.startDate}_to_${dateRange.endDate}.pdf`
      console.log('Saving PDF with filename:', fileName)
      doc.save(fileName)
      console.log('PDF export completed successfully')
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Error generating PDF: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-blue-800 bg-blue-100'
      case 'not_implemented':
        return 'text-yellow-800 bg-yellow-100'
      case 'exempt':
        return 'text-gray-800 bg-gray-100'
      default:
        return 'text-gray-800 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active Collection'
      case 'not_implemented':
        return 'Not Implemented'
      case 'exempt':
        return 'Tax Exempt'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tourist Tax</h1>
              {selectedPropertyId && properties && (
                <p className="text-sm text-gray-600 mb-2">
                  Property: {properties.find(p => p.id === selectedPropertyId)?.name || `ID: ${selectedPropertyId}`}
                </p>
              )}
              <p className="text-gray-500">Monitor and manage tourist tax collection and reporting</p>
              {data && (
                <p className="text-xs text-gray-400 mt-2">
                  Data source: {typeof data.dataSource === 'string' ? data.dataSource : 'api'} • Last updated: {new Date().toLocaleTimeString()}
                  <br />
                  <span className="text-xs text-gray-400">
                    Note: Shows all bookings overlapping with selected date range. The API may return data for a broader period, but we filter to show only relevant bookings.
                  </span>
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <button 
                onClick={handleExportPDF}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                disabled={!data || isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF Report
              </button>
              
              <button 
                onClick={handleRefresh}
                className="px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white rounded-lg hover:from-[#1d4ed8] hover:to-[#1e40af] focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              {propertiesLoading ? (
                <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500">
                  Loading properties...
                </div>
              ) : (
                <>
                  {console.log('Properties for selector:', properties)}
              <PropertySelector
                properties={properties}
                selectedId={selectedPropertyId}
                onChange={setSelectedPropertyId}
                placeholder="Select Property"
              />
                </>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'checkin' | 'checkout')}
                className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="checkout">Check-out</option>
                <option value="checkin">Check-in</option>
              </select>
            </div>
          </div>
        </div>

      {selectedPropertyId ? (
        <>

          
        {isLoading ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading City Tax Data</h3>
            <p className="text-gray-500">Fetching city tax information...</p>
          </div>
        ) : data ? (
            <>
            {/* Status and Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Tax Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(displayData.taxStatus)}`}>
                      {getStatusText(displayData.taxStatus)}
                    </span>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Current Tax Collected</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.totalTaxFormatted || "€0,00"}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-xl">
                    <Euro className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{displayData.totalBookings}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Guests</p>
                    <p className="text-2xl font-bold text-gray-900">{displayData.totalGuests}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Estimated Tax Potential</p>
                    <p className="text-2xl font-bold text-gray-900">{data?.totalTaxFormatted || "€0,00"}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
          </div>

          {/* City Tax Report Data (matching Hostkit format) */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">City Tax Report Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-3">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.cityTaxCalculatedFormatted}</p>
                <p className="text-sm text-gray-600 mb-1">City Tax Calculated</p>
                <p className="text-xs text-gray-500">Current tax amount</p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-xl w-fit mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.cityTaxNights}</p>
                <p className="text-sm text-gray-600 mb-1">City Tax Nights</p>
                <p className="text-xs text-gray-500">Taxable nights</p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl w-fit mx-auto mb-3">
                  <Baby className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.childrenNights}</p>
                <p className="text-sm text-gray-600 mb-1">Children Nights</p>
                <p className="text-xs text-gray-500">Often exempt</p>
              </div>

              <div className="text-center">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.hostkitTotalNights}</p>
                <p className="text-sm text-gray-600 mb-1">Total Nights</p>
                <p className="text-xs text-gray-500">Guest nights (Hostkit format)</p>
              </div>
            </div>
            
            {(displayData.nightsBeyond || 0) > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Long-stay Exemptions</p>
                    <p className="text-xs text-yellow-600">{displayData.nightsBeyond} nights beyond 30-day threshold (typically exempt)</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.adultNights}</p>
              <p className="text-sm text-gray-600 mb-1">Adult Nights</p>
              <p className="text-xs text-gray-500">Taxable: {displayData.taxableNights}</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl w-fit mx-auto mb-4">
                <Baby className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.childrenNights}</p>
              <p className="text-sm text-gray-600 mb-1">Children Nights</p>
              <p className="text-xs text-gray-500">Exempt: {displayData.exemptNights}</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-xl w-fit mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.averageTaxPerNightFormatted}</p>
              <p className="text-sm text-gray-600 mb-1">Avg per Night</p>
              <p className="text-xs text-gray-500">Taxable nights only</p>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center hover:shadow-2xl transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{displayData.averageTaxPerGuestFormatted}</p>
              <p className="text-sm text-gray-600 mb-1">Avg per Guest</p>
              <p className="text-xs text-gray-500">All guests included</p>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Platform</h3>
              <div className="space-y-4">
                {Object.entries(displayData.bookingsPlatforms).map(([platform, count]) => {
                  const bookingCount = typeof count === 'number' ? count : (count as any)?.bookings || 0
                  const percentage = (bookingCount / displayData.totalBookings * 100).toFixed(1)
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-sm mr-3"></div>
                        <span className="font-medium text-gray-900 capitalize">{platform}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900">{bookingCount}</span>
                        <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">City Tax Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Current Tax Collected</span>
                  <span className="font-semibold text-gray-900">{data?.totalTaxFormatted || "€0,00"}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Estimated Tax Potential</span>
                  <span className="font-semibold text-green-600">{data?.totalTaxFormatted || "€0,00"}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Tax Rate per Adult Night</span>
                  <span className="font-semibold text-blue-600">{data?.averageTaxPerGuestFormatted || "€0,00"}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Taxable Nights</span>
                  <span className="font-semibold text-purple-600">{data?.adultNights || 0}</span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Implementation Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${data?.taxStatus === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {data?.taxStatus === 'active' ? 'Active' : 'Not Implemented'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* City Tax Summary - Individual booking details not available */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">City Tax Summary</h3>
            <p className="text-sm text-gray-500 mb-6">City Tax data focuses on aggregated metrics rather than individual booking details</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900">Total City Tax Nights</h4>
                <p className="text-2xl font-bold text-blue-600">{displayData.cityTaxNights}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900">Children Nights</h4>
                <p className="text-2xl font-bold text-green-600">{displayData.childrenNights}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900">Hostkit Total Nights</h4>
                <p className="text-2xl font-bold text-purple-600">{displayData.hostkitTotalNights}</p>
              </div>
            </div>
          </div>

          {/* Future Ready Notice */}
          {displayData.futureReady && displayData.taxStatus !== 'active' ? (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200 p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Future-Ready City Tax</h3>
                  <p className="text-gray-600 mt-1">
                    While city tax is not currently active for this property, all booking data is being tracked and analyzed. 
                    When tax collection is implemented, historical data will be available for reporting and compliance.
                  </p>
                  <div className="mt-3 text-sm text-blue-600">
                    <p>✓ Booking data collected: <strong className="text-gray-900">{displayData.totalBookings} bookings</strong></p>
                    <p>✓ Guest tracking: <strong className="text-gray-900">{displayData.totalGuests} guests</strong></p>
                    <p>✓ Night analysis: <strong className="text-gray-900">{displayData.totalNights} nights</strong></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12 text-center mb-8">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No City Tax Data Available</h3>
              <p className="text-gray-500">No tax data found for the selected property and date range.</p>
            </div>
          )}
            </>
          ) : (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12 text-center mb-8">
              <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500">No city tax data found for the selected property and date range.</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-12 text-center mb-8">
          <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Property</h3>
          <p className="text-gray-500">Choose a property from the dropdown above to view city tax analytics.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <RefreshCw className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default TouristTax
