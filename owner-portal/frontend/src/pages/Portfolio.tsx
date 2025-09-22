import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Euro, 
  Calendar,
  Users,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  Eye
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { fetchPropertiesAsync } from '../store/propertyManagement.slice'
import PropertySelector from '../components/common/PropertySelector'

interface PortfolioOverview {
  totalRevenue: number
  totalBookings: number
  totalNights: number
  averageOccupancy: number
  averageDailyRate: number
  revenueGrowth: number
  occupancyGrowth: number
  properties: Array<{
    id: number
    name: string
    revenue: number
    bookings: number
    occupancy: number
    adr: number
  }>
}

interface PortfolioTrends {
  monthlyData: Array<{
    month: string
    revenue: number
    bookings: number
    occupancy: number
    adr: number
  }>
  propertyComparison: Array<{
    propertyId: number
    propertyName: string
    performance: number
    trend: 'up' | 'down' | 'stable'
  }>
}

const Portfolio: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedProperties, setSelectedProperties] = useState<number[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('2025-01')
  const [overview, setOverview] = useState<PortfolioOverview | null>(null)
  const [trends, setTrends] = useState<PortfolioTrends | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'comparison'>('overview')
  
  const { properties, isLoading: propertiesLoading } = useSelector((state: RootState) => state.propertyManagement)
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchPortfolioData()
  }, [selectedProperties, selectedMonth])

  const fetchPortfolioData = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      // Fetch overview data
      const overviewResponse = await fetch(`/api/portfolio/overview?propertyIds=${selectedProperties.join(',')}&month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        setOverview(overviewData)
      }

      // Fetch trends data
      const trendsResponse = await fetch(`/api/portfolio/trends?propertyIds=${selectedProperties.join(',')}&months=2024-12,2025-01,2025-02`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json()
        setTrends(trendsData)
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value: number | undefined) => {
    if (value === undefined || value === null) return '0.0%'
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Management</h1>
          <p className="text-slate-400 mt-1">Multi-property performance overview and analytics</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          
          <button 
            onClick={fetchPortfolioData}
            className="btn-primary btn-sm"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Properties
              </label>
              <PropertySelector
                properties={properties}
                selectedId={selectedProperties[0]}
                onChange={(id) => setSelectedProperties(id ? [id] : [])}
                placeholder="Select Properties"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'trends', name: 'Trends', icon: TrendingUp },
            { id: 'comparison', name: 'Comparison', icon: PieChart }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {!overview ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Portfolio Data</h3>
              <p className="text-gray-500">Select a property and month to view portfolio metrics.</p>
            </div>
          ) : (
            <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <Euro className="h-4 w-4 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue || 0)}</p>
                    <div className="flex items-center mt-1">
                      {(overview.revenueGrowth || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${(overview.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(overview.revenueGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-success-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-success-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{overview.totalBookings || 0}</p>
                    <p className="text-sm text-gray-500">{overview.totalNights || 0} nights</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-warning-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-warning-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Occupancy</p>
                    <p className="text-2xl font-bold text-gray-900">{(overview.averageOccupancy || 0).toFixed(1)}%</p>
                    <div className="flex items-center mt-1">
                      {(overview.occupancyGrowth || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${(overview.occupancyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(overview.occupancyGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Euro className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Daily Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.averageDailyRate || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Performance */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
            </div>
            <div className="card-content">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Property</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Occupancy</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ADR</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(overview.properties || []).map((property) => (
                      <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium text-gray-900">{property.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{formatCurrency(property.revenue || 0)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{property.bookings || 0}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{(property.occupancy || 0).toFixed(1)}%</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{formatCurrency(property.adr || 0)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="p-1 text-blue-400 hover:text-blue-600" title="View Details">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && trends && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            </div>
            <div className="card-content">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Month</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Occupancy</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">ADR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(trends.monthlyData || []).map((month, index) => (
                      <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{month.month}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{formatCurrency(month.revenue || 0)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{month.bookings || 0}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{(month.occupancy || 0).toFixed(1)}%</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gray-900">{formatCurrency(month.adr || 0)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && trends && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Property Comparison</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(trends.propertyComparison || []).map((property) => (
                  <div key={property.propertyId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{property.propertyName}</h4>
                      <div className="flex items-center">
                        {property.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {property.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                        {property.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Performance Score</span>
                        <span className="text-sm font-medium text-gray-900">{(property.performance || 0).toFixed(1)}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${((property.performance || 0) / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio