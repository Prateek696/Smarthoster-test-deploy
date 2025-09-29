import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  Calendar,
  Euro,
  Users,
  Home,
  BarChart3,
  Settings,
  Plus,
  BookOpen,
  FileText,
  Eye
} from 'lucide-react'
import { RootState, AppDispatch } from '../../store'
import { fetchDashboardMetricsAsync, fetchPropertiesAsync } from '../../store/propertyManagement.slice'
import { fetchPropertiesAsync as fetchPropertiesFromDB } from '../../store/properties.slice'
import { useLanguage } from '../../contexts/LanguageContext'
import usePropertyRefresh from '../../hooks/usePropertyRefresh'
import { getImageUrl } from '../../utils/imageUtils'

const OwnerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { t } = useLanguage()
  const { dashboardMetrics, properties, isLoading } = useSelector((state: RootState) => state.propertyManagement)
  const [dataMode, setDataMode] = useState<'real' | 'static'>('real')
  
  // Listen for property deletion events to refresh property lists
  usePropertyRefresh()

  // Fetch properties from database when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPropertiesFromDB())
    }
  }, [dispatch, isAuthenticated])

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

  useEffect(() => {
    // Fetch properties first
    dispatch(fetchPropertiesAsync())
    
    // Fetch real dashboard metrics for current year
    const currentYear = new Date().getFullYear()
    const startDate = `${currentYear}-01-01`
    const endDate = `${currentYear}-12-31`
    
    dispatch(fetchDashboardMetricsAsync({ 
      startDate, 
      endDate 
    }))
  }, [dispatch])


  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return t('greeting.morning')
    if (hour < 18) return t('greeting.afternoon')
    return t('greeting.evening')
  }

  const getLastMonth = () => {
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    return { month: lastMonth, year }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }



  const getLastMonthRange = () => {
    const now = new Date()
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
    
    // Format dates in local timezone to avoid UTC conversion issues
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

  const handlePropertyClick = (propertyId: number, action: string) => {
    switch (action) {
      case 'bookings':
        // Navigate to bookings with this month's date range
        const currentMonth = getCurrentMonthRange()
        navigate(`/bookings?propertyId=${propertyId}&startDate=${currentMonth.startDate}&endDate=${currentMonth.endDate}&period=thisMonth`)
        break
      case 'invoices':
        // Navigate to invoices with past month's date range
        const lastMonth = getLastMonthRange()
        navigate(`/invoices?propertyId=${propertyId}&startDate=${lastMonth.startDate}&endDate=${lastMonth.endDate}&period=lastMonth`)
        break
      case 'calendar':
        // Navigate to calendar with this month's date range
        const currentMonthCal = getCurrentMonthRange()
        navigate(`/calendar?propertyId=${propertyId}&startDate=${currentMonthCal.startDate}&endDate=${currentMonthCal.endDate}&period=thisMonth`)
        break
      default:
        navigate(`/properties/${propertyId}`)
    }
  }

  // Use real data from dashboard metrics and properties
  const displayData = {
    totalRevenue: dashboardMetrics?.totalRevenue || 0,
    totalBookings: dashboardMetrics?.totalBookings || 0,
    occupancyRate: dashboardMetrics?.averageOccupancy || 0,
    avgDailyRate: dashboardMetrics?.averageDailyRate || 0,
    recentBookings: dashboardMetrics?.recentBookings || [],
    properties: properties || []
  }

  // Show loading state if data is being fetched
  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 mb-6 shadow-lg">
                <div className="w-2 h-2 bg-[#0ea5e9] rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">{t('dashboard.title')}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {getGreeting()}, <span className="gradient-text">{user?.firstName || user?.name || user?.email}</span>! 👋
              </h1>
              <p className="text-lg lg:text-xl text-gray-700 mb-8 leading-relaxed">
                {t('dashboard.description')}
              </p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-4 h-4 bg-[#0ea5e9] rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-800">Live Data</span>
                </div>
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Home className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-800">{displayData.properties.length} {t('dashboard.properties')}</span>
                </div>
              </div>
            </div>
            
            {/* COMMENTED OUT - Mobile Total Revenue card removed per user request */}
            {/* <div className="hidden lg:block">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#5FFF56] to-[#4FEF46] rounded-3xl flex items-center justify-center shadow-lg ">
                    <Euro className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(displayData.totalRevenue)}</p>
                    {displayData.totalRevenue > 0 ? (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-green-600 font-semibold">Real-time data</p>
                    </div>
                    ) : (
                      <p className="text-sm text-gray-500">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {/* Enhanced Quick Stats */}
        {/* COMMENTED OUT - KPI cards removed per user request */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-12 relative z-10"> */}
          {/* COMMENTED OUT - Total Revenue KPI card removed per user request */}
          {/* <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{formatCurrency(displayData.totalRevenue)}</p>
                {displayData.totalRevenue > 0 ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600 font-semibold">Real-time data</p>
                </div>
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Euro className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-4/5 transition-all duration-1000"></div>
            </div>
          </div> */}
          
          {/* COMMENTED OUT - Bookings KPI card removed per user request */}
          {/* <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group -delayed">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{displayData.totalBookings}</p>
                {displayData.totalBookings > 0 ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600 font-semibold">Real-time data</p>
                </div>
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
            </div>
          </div> */}
          
          {/* COMMENTED OUT - Occupancy Rate KPI card removed per user request */}
          {/* <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group ">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Occupancy Rate</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{displayData.occupancyRate.toFixed(1)}%</p>
                {displayData.occupancyRate > 0 ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600 font-semibold">Real-time data</p>
                </div>
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Home className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full w-5/6 transition-all duration-1000"></div>
            </div>
          </div> */}
          
          {/* COMMENTED OUT - Avg. Daily Rate KPI card removed per user request */}
          {/* <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 group -delayed">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">Avg. Daily Rate</p>
                <p className="text-3xl font-bold text-gray-900 mb-3">{formatCurrency(displayData.avgDailyRate)}</p>
                {displayData.avgDailyRate > 0 ? (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600 font-semibold">Real-time data</p>
                </div>
                ) : (
                  <p className="text-sm text-gray-500">No data available</p>
                )}
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-4/5 transition-all duration-1000"></div>
            </div>
          </div> */}
        {/* </div> */}


        {/* Quick Actions - Full Width Row */}
        <div className="mt-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('dashboard.quickActions')}</h3>
                <p className="text-sm text-gray-600">{t('dashboard.manageEfficiently')}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center shadow-md">
                <Settings className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <a href="/calendar" className="group flex flex-col items-center p-3 bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0ea5e9] to-[#0284c7] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 text-center">{t('dashboard.viewCalendar')}</span>
              </a>
              
              <a href="/bookings" className="group flex flex-col items-center p-3 bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 rounded-xl hover:from-emerald-100 hover:to-emerald-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 text-center">{t('dashboard.manageBookings')}</span>
              </a>
              
              <a href="/invoices" className="group flex flex-col items-center p-3 bg-gradient-to-br from-purple-50/80 to-purple-100/80 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Euro className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 text-center">{t('dashboard.viewInvoices')}</span>
              </a>
              
              <button 
                onClick={() => {
                  const { month, year } = getLastMonth();
                  navigate(`/saft?month=${month}&year=${year}`);
                }}
                className="group flex flex-col items-center p-3 bg-gradient-to-br from-orange-50/80 to-orange-100/80 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 hover:scale-105 hover:shadow-md w-full"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-900 text-center">{t('dashboard.getSAFT')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Properties Overview */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{t('dashboard.yourProperties')}</h2>
              <p className="text-sm text-gray-600">{t('dashboard.managePortfolio')}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-md">
              <div className="w-2 h-2 bg-[#2563eb] rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-gray-800">{displayData.properties.length} {t('dashboard.activePropertiesCount')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.properties.length > 0 ? (
              displayData.properties.map((property, index) => {
              return (
                <div key={property._id || property.id || index} className="group bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={getImageUrl(property.images[0])}
                      alt={property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Dashboard image failed to load:', e.currentTarget.src);
                        }}
                        onLoad={(e) => {
                          console.log('✅ Dashboard image loaded successfully:', e.currentTarget.src);
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">Property Image</p>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                        property.status === 'active' ? 'bg-green-500' : 
                        property.status === 'inactive' ? 'bg-gray-500' : 'bg-yellow-500'
                      }`}>
                        {property.status || 'Active'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-black/70 backdrop-blur-sm rounded px-1 py-0.5">
                        <h3 className="font-bold mb-0 text-white" style={{fontSize: '7px'}}>{property.name}</h3>
                        <p className="text-white/90" style={{fontSize: '9px'}}>{property.address || 'Algarve, Portugal'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 font-semibold">Type</p>
                        <p className="text-sm font-bold text-gray-900">{property.type}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 font-semibold">Bedrooms</p>
                        <p className="text-sm font-bold text-gray-900">{property.bedrooms}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1 font-semibold">Max Guests</p>
                        <p className="text-sm font-bold text-gray-900">{property.maxGuests}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePropertyClick(property.id, 'bookings')
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-lg hover:from-[#059669] hover:to-[#047857] transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-xs"
                      >
                        <BookOpen className="h-3 w-3" />
                        Bookings
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePropertyClick(property.id, 'invoices')
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-lg hover:from-[#7c3aed] hover:to-[#6d28d9] transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-xs"
                      >
                        <FileText className="h-3 w-3" />
                        Invoices
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePropertyClick(property.id, 'calendar')
                        }}
                        className="flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-lg hover:from-[#0284c7] hover:to-[#0369a1] transition-all duration-300 font-semibold shadow-md hover:shadow-lg text-xs"
                      >
                        <Calendar className="h-3 w-3" />
                        Calendar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
            ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Home className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-500 mb-6">Add your first property to start tracking bookings and revenue</p>
                <button className="px-6 py-3 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] text-white rounded-2xl hover:from-[#0284c7] hover:to-[#0369a1] transition-all duration-300 font-bold shadow-lg hover:shadow-xl">
                  Add Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-10 h-10 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group">
          <Settings className="h-4 w-4 text-white group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      {/* Enhanced Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-[#0ea5e9]/10 rounded-full blur-3xl "></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-[#10b981]/10 rounded-full blur-3xl -delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-[#8b5cf6]/10 rounded-full blur-2xl "></div>
        <div className="absolute top-3/4 left-1/3 w-20 h-20 bg-[#f97316]/10 rounded-full blur-2xl -delayed"></div>
        <div className="absolute top-1/6 left-1/2 w-16 h-16 bg-[#0ea5e9]/10 rounded-full blur-xl "></div>
      </div>
    </div>
  )
}

export default OwnerDashboard