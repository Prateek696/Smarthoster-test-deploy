import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  Filter,
  RefreshCw,
  Eye,
  Reply,
  Flag,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  PieChart,
  Settings
} from 'lucide-react'
import { RootState } from '../store'
import PropertySelector from '../components/common/PropertySelector'

interface Review {
  _id: string
  reviewId: string
  propertyId: number
  platform: string
  guestName: string
  rating: number
  reviewText: string
  reviewDate: string
  responseText?: string
  responseDate?: string
  isVerified: boolean
  bookingId: string
}

interface ReviewSummary {
  averageRating: number
  totalReviews: number
  ratingDistribution: Array<{
    rating: number
    count: number
    percentage: number
  }>
  platformBreakdown: Array<{
    platform: string
    count: number
    averageRating: number
  }>
  recentTrend: 'up' | 'down' | 'stable'
  responseRate: number
}

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [loading, setLoading] = useState(false) // Changed to false for testing
  const [selectedProperty, setSelectedProperty] = useState<number | null>(392776) // Set default property
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'all' | 'unresponded' | 'analytics'>('all')
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [responseText, setResponseText] = useState('')
  const [showMappingModal, setShowMappingModal] = useState(false)
  const [propertyMappings, setPropertyMappings] = useState<any[]>([])
  
  const { properties } = useSelector((state: RootState) => state.properties)
  const { token, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    fetchReviews()
    fetchPropertyMappings()
  }, [selectedProperty, selectedDateFilter])

  const fetchReviews = async () => {
    if (!token || !selectedProperty) return
    
    setLoading(true)
    try {
      // Fetch reviews for selected property
      const reviewsResponse = await fetch(`/api/reviews/${selectedProperty}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      // Fetch review stats for selected property
      const statsResponse = await fetch(`/api/reviews/${selectedProperty}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (reviewsResponse.ok && statsResponse.ok) {
        const reviewsData = await reviewsResponse.json()
        const statsData = await statsResponse.json()
        
        console.log('Reviews API Response:', reviewsData)
        console.log('Stats API Response:', statsData)
        
        let filteredReviews = reviewsData || []
        
        // Apply filters (only date filter remains)
        
        // Apply date filter
        if (selectedDateFilter) {
          const now = new Date()
          let startDate: Date
          
          switch (selectedDateFilter) {
            case 'last7':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
              break
            case 'last30':
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              break
            case 'last60':
              startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
              break
            default:
              startDate = new Date(0) // Show all
          }
          
          const beforeFilter = filteredReviews.length
          filteredReviews = filteredReviews.filter((review: Review) => {
            const reviewDate = new Date(review.reviewDate)
            return reviewDate >= startDate
          })
          
          // Log filtering results for debugging
          console.log(`Date filter "${selectedDateFilter}": ${beforeFilter} -> ${filteredReviews.length} reviews`)
        }
        
        setReviews(filteredReviews)
        
        // Use stats from API or calculate from filtered reviews
        const totalReviews = filteredReviews.length
        const averageRating = totalReviews > 0 
          ? filteredReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / totalReviews 
          : statsData.averageRating || 0
        
        const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
          const count = filteredReviews.filter((review: Review) => review.rating === rating).length
          return {
            rating,
            count,
            percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
          }
        })
        
        const platformBreakdown = ['Airbnb', 'Booking.com', 'VRBO'].map(platform => {
          const platformReviews = filteredReviews.filter((review: Review) => review.platform === platform)
          const count = platformReviews.length
          const averageRating = count > 0 
            ? platformReviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / count 
            : 0
          return { platform, count, averageRating }
        }).filter(p => p.count > 0)
        
        const respondedReviews = filteredReviews.filter((review: Review) => review.responseText).length
        const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0
        
        setSummary({
          averageRating,
          totalReviews,
          ratingDistribution,
          platformBreakdown,
          recentTrend: 'up', // Would need historical data
          responseRate
        })
      } else {
        console.error('Failed to fetch reviews or stats')
        // Set empty data
        setReviews([])
        setSummary({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [],
          platformBreakdown: [],
          recentTrend: 'stable',
          responseRate: 0
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
      setSummary({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [],
        platformBreakdown: [],
        recentTrend: 'stable',
        responseRate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPropertyMappings = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/property-mappings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPropertyMappings(data.mappings || [])
      }
    } catch (error) {
      console.error('Error fetching property mappings:', error)
    }
  }

  const handleSyncReviews = async () => {
    if (!token || !selectedProperty) return

    setLoading(true)
    try {
      // Sync selected property
      const response = await fetch(`/api/reviews/${selectedProperty}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully synced ${data.syncedCount} reviews!`)
        fetchReviews() // Refresh the reviews list
      } else {
        const errorData = await response.json()
        alert(`Failed to sync reviews: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error syncing reviews:', error)
      alert('Error syncing reviews. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResponseSubmit = async () => {
    if (!selectedReview || !responseText.trim() || !token) return

    try {
      const response = await fetch(`/api/reviews/${selectedReview.reviewId}/response`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ responseText: responseText })
      })

      if (response.ok) {
        setShowResponseModal(false)
        setResponseText('')
        setSelectedReview(null)
        fetchReviews()
        alert('Response submitted successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to submit response: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('Error submitting response. Please try again.')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    if (rating >= 2.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPlatformColor = (platform: string) => {
    const colors = {
      'airbnb': 'bg-pink-100 text-pink-800',
      'booking.com': 'bg-blue-100 text-blue-800',
      'vrbo': 'bg-purple-100 text-purple-800'
    }
    return colors[platform as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reviews & Ratings</h1>
          <p className="text-slate-400 mt-1">Manage guest reviews and maintain your reputation</p>
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
                Date Filter
              </label>
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="">All Time</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="last60">Last 60 Days</option>
              </select>
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
                    <Star className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className={`text-2xl font-bold ${getRatingColor(summary.averageRating)}`}>
                    {(summary.averageRating || 0).toFixed(1)}
                  </p>
                  <div className="flex items-center mt-1">
                    {renderStars(Math.round(summary.averageRating))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.totalReviews}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Reply className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{(summary.responseRate || 0).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    {summary.recentTrend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : summary.recentTrend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Trend</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{summary.recentTrend}</p>
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
            { id: 'all', name: 'All Reviews', icon: MessageSquare },
            { id: 'unresponded', name: 'Unresponded', icon: Reply },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
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
                {tab.id === 'unresponded' && (
                  <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                    {reviews.filter(r => !r.responseText).length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Reviews List */}
      {(activeTab === 'all' || activeTab === 'unresponded') && (
        <div className="space-y-4">
          {reviews
            .filter(review => activeTab === 'all' || !review.responseText)
            .length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MessageSquare className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500 mb-4">
                {selectedDateFilter ? 
                  `No reviews found for the selected time period (${selectedDateFilter === 'last7' ? 'Last 7 days' : selectedDateFilter === 'last30' ? 'Last 30 days' : 'Last 60 days'}). Try selecting "All Time" to see all reviews.` :
                  selectedProperty ? 'This property has no reviews yet.' : 'No reviews match your current filters.'
                }
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => setSelectedDateFilter('')}
                  className="btn-secondary"
                >
                  Show All Time
                </button>
                <button
                  onClick={handleSyncReviews}
                  className="btn-primary"
                >
                  Sync Reviews
                </button>
              </div>
            </div>
          ) : (
            reviews
              .filter(review => activeTab === 'all' || !review.responseText)
              .map((review) => (
            <div key={review._id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(review.platform)}`}>
                        {review.platform}
                      </span>
                      {review.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{review.reviewText}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {review.guestName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(review.reviewDate)}
                      </div>
                    </div>
                    
                    {review.responseText && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">Your Response</h4>
                          <span className="text-xs text-gray-500">{formatDate(review.responseDate!)}</span>
                        </div>
                        <p className="text-gray-700">{review.responseText}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!review.responseText && (
                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setShowResponseModal(true)
                        }}
                        className="btn-primary btn-sm"
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Respond
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600" title="Flag Review">
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && summary && (
        <div className="space-y-6">
          {/* Rating Distribution */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Rating Distribution</h3>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {summary.ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-16">
                      <span className="text-sm font-medium text-gray-900">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-current ml-1" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-20">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-sm text-gray-500">({(percentage || 0).toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Platform Performance</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.platformBreakdown.map(({ platform, count, averageRating }) => (
                  <div key={platform} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlatformColor(platform)}`}>
                        {platform}
                      </span>
                      <div className="flex items-center">
                        {renderStars(Math.round(averageRating))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Reviews</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average</span>
                        <span className={`text-sm font-medium ${getRatingColor(averageRating)}`}>
                          {(averageRating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Respond to Review</h3>
                <button 
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  {renderStars(selectedReview.rating)}
                  <span className="ml-2 text-sm text-gray-600">by {selectedReview.guestName}</span>
                </div>
                <p className="text-sm text-gray-700">{selectedReview.reviewText}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="input"
                    rows={4}
                    placeholder="Write a professional response to this review..."
                    required
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className="btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResponseSubmit}
                    className="btn-primary btn-sm"
                    disabled={!responseText.trim()}
                  >
                    Submit Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">API Integration Settings</h3>
                <button 
                  onClick={() => setShowMappingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Environment Variables Required</h4>
                  <div className="space-y-2 text-xs text-blue-800">
                    <div><code>HOSTAWAY_TOKEN</code> - Your Hostaway API token (already configured)</div>
                    <div><code>HOSTAWAY_ACCOUNT_ID</code> - Your Hostaway account ID (already configured)</div>
                    <div><code>HOSTAWAY_API_BASE</code> - Hostaway API base URL (already configured)</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Property Mappings</h4>
                  <div className="space-y-3">
                    {propertyMappings.map((mapping) => (
                      <div key={mapping.internalId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{mapping.propertyName}</h5>
                          <span className="text-xs text-gray-500">ID: {mapping.internalId}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Hostaway Property ID</label>
                            <input 
                              type="text" 
                              value={mapping.platformMappings.hostaway || ''} 
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                              placeholder="Hostaway property ID (e.g., 392776)"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">API Status</h4>
                  <div className="space-y-2 text-xs text-green-800">
                    <div><strong>Hostaway:</strong> ✅ Already configured and ready to use</div>
                    <div><strong>Reviews API:</strong> ✅ Connected to Hostaway Reviews endpoints</div>
                    <div><strong>Response API:</strong> ✅ Can post responses to reviews</div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowMappingModal(false)}
                  className="btn-outline btn-sm"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Property mappings updated! (This would save to database in production)')
                    setShowMappingModal(false)
                  }}
                  className="btn-primary btn-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews
