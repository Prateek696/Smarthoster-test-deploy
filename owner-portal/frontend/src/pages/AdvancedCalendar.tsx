import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Clock,
  Euro,
  Users,
  Building2,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Settings
} from 'lucide-react'
import { RootState } from '../store'
import PropertySelector from '../components/common/PropertySelector'
import { apiClient } from '../services/apiClient'

interface CalendarEvent {
  id: string
  propertyId: number
  propertyName: string
  type: 'block' | 'price_update' | 'minimum_stay' | 'maintenance' | 'cleaning'
  title: string
  description?: string
  startDate: string
  endDate: string
  price?: number
  minimumStay?: number
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  createdBy: string
  createdAt: string
  updatedAt: string
  source?: 'hostaway' | 'hostkit' | 'manual'
  externalId?: string
}

interface BulkOperation {
  id: string
  type: 'block_dates' | 'price_update' | 'minimum_stay_update'
  properties: number[]
  dates: string[]
  parameters: {
    price?: number
    minimumStay?: number
    reason?: string
  }
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  results?: {
    success: number
    failed: number
    errors: string[]
  }
}

const AdvancedCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([])
  const [loading, setLoading] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const [sources, setSources] = useState<{ [key: string]: number }>({})
  const [selectedProperty, setSelectedProperty] = useState<number | null>(392776)
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string, end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [bulkPropertySelection, setBulkPropertySelection] = useState<'all' | 'selected'>('all')
  const [selectedBulkProperties, setSelectedBulkProperties] = useState<number[]>([])
  const [eventPropertySelection, setEventPropertySelection] = useState<'single' | 'multiple'>('single')
  const [selectedEventProperties, setSelectedEventProperties] = useState<number[]>([selectedProperty || 392776])
  const [activeTab, setActiveTab] = useState<'events' | 'bulk' | 'templates'>('events')
  
  const { properties } = useSelector((state: RootState) => state.properties)
  const { token, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (token) {
      fetchEvents()
      fetchBulkOperations()
    }
  }, [token, selectedProperty, selectedDateRange])

  const fetchEvents = async () => {
    if (!token || !selectedProperty) {
      console.log('No token or property selected for fetching events')
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        propertyId: selectedProperty.toString(),
        startDate: selectedDateRange.start,
        endDate: selectedDateRange.end
      })

      console.log('Fetching advanced calendar events from:', `/advanced-calendar/events?${params}`)
      console.log('Using token:', token.substring(0, 20) + '...')
      
      const data = await apiClient.get(`/advanced-calendar/events?${params}`)
      console.log('Advanced calendar events data received:', data)
      setEvents(data.events || [])
      setTotalEvents(data.total || 0)
      setSources(data.sources || {})
    } catch (error) {
      console.error('Error fetching advanced calendar events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBulkOperations = async () => {
    if (!token) {
      console.log('No token available for fetching bulk operations')
      return
    }
    
    try {
      console.log('Fetching bulk operations from:', '/advanced-calendar/bulk-operations')
      
      const data = await apiClient.get('/advanced-calendar/bulk-operations')
      console.log('Bulk operations data received:', data)
      setBulkOperations(data.operations || [])
    } catch (error) {
      console.error('Error fetching bulk operations:', error)
      setBulkOperations([])
    }
  }

  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!token || !selectedProperty) return

    try {
      await apiClient.post('/advanced-calendar/events', {
        ...eventData,
        propertyId: selectedProperty
      })

      fetchEvents()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleEditEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!token || !eventData.id) return

    try {
      await apiClient.put(`/advanced-calendar/events/${eventData.id}`, eventData)

      fetchEvents()
      setShowEditModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const handleUpdateEvent = async (eventId: string, eventData: Partial<CalendarEvent>) => {
    if (!token) return

    try {
      await apiClient.put(`/advanced-calendar/events/${eventId}`, eventData)

      fetchEvents()
      setSelectedEvent(null)
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) return

    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await apiClient.delete(`/advanced-calendar/events/${eventId}`)

      fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const handleBulkOperation = async (operationData: Partial<BulkOperation>) => {
    if (!token) return

    try {
      await apiClient.post('/advanced-calendar/bulk-operations', operationData)

      fetchBulkOperations()
      setShowBulkModal(false)
    } catch (error) {
      console.error('Error creating bulk operation:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      'block': 'bg-red-100 text-red-800',
      'price_update': 'bg-blue-100 text-blue-800',
      'minimum_stay': 'bg-yellow-100 text-yellow-800',
      'maintenance': 'bg-orange-100 text-orange-800',
      'cleaning': 'bg-green-100 text-green-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSourceColor = (source?: string) => {
    const colors = {
      'hostaway': 'bg-blue-100 text-blue-800',
      'hostkit': 'bg-purple-100 text-purple-800',
      'manual': 'bg-gray-100 text-gray-800'
    }
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'hostaway':
        return <Building2 className="h-3 w-3" />
      case 'hostkit':
        return <Settings className="h-3 w-3" />
      case 'manual':
        return <Edit className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Advanced Calendar</h1>
          <p className="text-slate-400 mt-1">Manage calendar events, bulk operations, and pricing</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          
          <button 
            onClick={() => setShowBulkModal(true)}
            className="btn-outline btn-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Bulk Operations
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
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
                Start Date
              </label>
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
                className="input"
              />
            </div>
            
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
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
            { id: 'events', name: 'Calendar Events', icon: Calendar },
            { id: 'bulk', name: 'Bulk Operations', icon: Filter },
            { id: 'templates', name: 'Templates', icon: Save }
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

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      {event.source && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceColor(event.source)}`}>
                          {getSourceIcon(event.source)}
                          <span className="ml-1">{event.source}</span>
                        </span>
                      )}
                      <span className="text-sm text-gray-500">{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-gray-700 mb-2">{event.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {event.propertyName}
                      </div>
                      {event.price && (
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-1" />
                          {formatCurrency(event.price)}
                        </div>
                      )}
                      {event.minimumStay && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.minimumStay} nights min
                        </div>
                      )}
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.createdBy}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedEvent(event)
                        setShowEditModal(true)
                      }}
                      className="btn-outline btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="btn-danger btn-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Operations Tab */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          {bulkOperations.map((operation) => (
            <div key={operation.id} className="card">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(operation.type)}`}>
                        {operation.type.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}>
                        {operation.status}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(operation.createdAt)}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Bulk {operation.type.replace('_', ' ')} Operation
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1" />
                        {operation.properties.length} properties
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {operation.dates.length} dates
                      </div>
                      {operation.parameters.price && (
                        <div className="flex items-center">
                          <Euro className="h-4 w-4 mr-1" />
                          {formatCurrency(operation.parameters.price)}
                        </div>
                      )}
                    </div>
                    
                    {operation.results && (
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          {operation.results.success} successful
                        </span>
                        <span className="text-red-600">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          {operation.results.failed} failed
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {operation.status === 'completed' && (
                      <button className="btn-outline btn-sm">
                        <Info className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Event Templates</h3>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Maintenance Block', type: 'block', description: 'Block dates for maintenance work' },
                  { name: 'Cleaning Schedule', type: 'cleaning', description: 'Schedule cleaning between bookings' },
                  { name: 'Price Increase', type: 'price_update', description: 'Increase prices for peak season' },
                  { name: 'Minimum Stay Update', type: 'minimum_stay', description: 'Set minimum stay requirements' },
                  { name: 'Holiday Block', type: 'block', description: 'Block dates for personal use' },
                  { name: 'Seasonal Pricing', type: 'price_update', description: 'Apply seasonal pricing rules' }
                ].map((template, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 cursor-pointer">
                    <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                    <button className="btn-outline btn-sm w-full">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && activeTab === 'events' && !loading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">No events match your current filters.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Event
          </button>
        </div>
      )}

      {bulkOperations.length === 0 && activeTab === 'bulk' && !loading && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk operations found</h3>
          <p className="text-gray-500 mb-4">Create bulk operations to manage multiple properties at once.</p>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bulk Operation
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Event</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              
              // Determine which properties to use
              let targetProperties: number[] = []
              if (eventPropertySelection === 'single') {
                targetProperties = [selectedProperty || 392776]
              } else {
                targetProperties = selectedEventProperties.length > 0 ? selectedEventProperties : [selectedProperty || 392776]
              }
              
              // Create events for each selected property
              targetProperties.forEach(propertyId => {
                const eventData = {
                  propertyId,
                  type: formData.get('type') as any,
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string,
                  price: formData.get('price') ? Number(formData.get('price')) : undefined,
                  minimumStay: formData.get('minimumStay') ? Number(formData.get('minimumStay')) : undefined
                }
                handleCreateEvent(eventData)
              })
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Properties</label>
                  <div className="space-y-2">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventPropertySelection"
                          value="single"
                          checked={eventPropertySelection === 'single'}
                          onChange={(e) => setEventPropertySelection(e.target.value as 'single' | 'multiple')}
                          className="mr-2"
                        />
                        <span className="text-sm">Current Property</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventPropertySelection"
                          value="multiple"
                          checked={eventPropertySelection === 'multiple'}
                          onChange={(e) => setEventPropertySelection(e.target.value as 'single' | 'multiple')}
                          className="mr-2"
                        />
                        <span className="text-sm">Select Properties</span>
                      </label>
                    </div>
                    
                    {eventPropertySelection === 'multiple' && (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedEventProperties(properties.map(p => p.id))}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedEventProperties([])}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Clear All
                          </button>
                          <span className="text-xs text-gray-500 self-center">
                            {selectedEventProperties.length} selected
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                          {properties.map((property) => (
                            <label key={property.id} className="flex items-center mb-1">
                              <input
                                type="checkbox"
                                checked={selectedEventProperties.includes(property.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEventProperties([...selectedEventProperties, property.id])
                                  } else {
                                    setSelectedEventProperties(selectedEventProperties.filter(id => id !== property.id))
                                  }
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm">{property.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="block">Block</option>
                    <option value="price_update">Price Update</option>
                    <option value="minimum_stay">Minimum Stay</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input name="title" type="text" required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input name="startDate" type="date" required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input name="endDate" type="date" required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                  <input name="price" type="number" step="0.01" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stay (nights)</label>
                  <input name="minimumStay" type="number" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCreateModal(false)
                    setEventPropertySelection('single')
                    setSelectedEventProperties([selectedProperty || 392776])
                  }} 
                  className="btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Event</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const eventData = {
                id: selectedEvent.id,
                propertyId: selectedEvent.propertyId, // Keep the original property for editing
                type: formData.get('type') as any,
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                price: formData.get('price') ? Number(formData.get('price')) : undefined,
                minimumStay: formData.get('minimumStay') ? Number(formData.get('minimumStay')) : undefined
              }
              handleEditEvent(eventData)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600">
                    {selectedEvent.propertyName} (ID: {selectedEvent.propertyId})
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select name="type" defaultValue={selectedEvent.type} required className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="block">Block</option>
                    <option value="price_update">Price Update</option>
                    <option value="minimum_stay">Minimum Stay</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input name="title" type="text" defaultValue={selectedEvent.title} required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" defaultValue={selectedEvent.description} className="w-full border border-gray-300 rounded-md px-3 py-2" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input name="startDate" type="date" defaultValue={selectedEvent.startDate} required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input name="endDate" type="date" defaultValue={selectedEvent.endDate} required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                  <input name="price" type="number" step="0.01" defaultValue={selectedEvent.price} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stay (nights)</label>
                  <input name="minimumStay" type="number" defaultValue={selectedEvent.minimumStay} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => {
                  setShowEditModal(false)
                  setSelectedEvent(null)
                }} className="btn-outline btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  Update Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Bulk Operation</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              
              // Determine which properties to use
              let targetProperties: number[] = []
              if (bulkPropertySelection === 'all') {
                targetProperties = properties.map(p => p.id)
              } else {
                targetProperties = selectedBulkProperties.length > 0 ? selectedBulkProperties : [selectedProperty || 392776]
              }
              
              const bulkData = {
                type: formData.get('type') as any,
                properties: targetProperties,
                dates: [formData.get('date') as string],
                parameters: {
                  price: formData.get('price') ? Number(formData.get('price')) : undefined,
                  minimumStay: formData.get('minimumStay') ? Number(formData.get('minimumStay')) : undefined,
                  reason: formData.get('reason') as string,
                  maintenanceType: formData.get('maintenanceType') as string,
                  cleaningType: formData.get('cleaningType') as string,
                  checkInAvailable: formData.get('checkInAvailable') === 'true',
                  checkOutAvailable: formData.get('checkOutAvailable') === 'true'
                }
              }
              handleBulkOperation(bulkData)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    name="type" 
                    required 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    onChange={(e) => {
                      // Hide all conditional fields
                      document.getElementById('price-field')?.classList.add('hidden')
                      document.getElementById('minimum-stay-field')?.classList.add('hidden')
                      document.getElementById('maintenance-field')?.classList.add('hidden')
                      document.getElementById('cleaning-field')?.classList.add('hidden')
                      document.getElementById('coa-cod-field')?.classList.add('hidden')
                      
                      // Show relevant field based on selection
                      const type = e.target.value
                      if (type === 'price_update') {
                        document.getElementById('price-field')?.classList.remove('hidden')
                      } else if (type === 'minimum_stay_update') {
                        document.getElementById('minimum-stay-field')?.classList.remove('hidden')
                      } else if (type === 'maintenance') {
                        document.getElementById('maintenance-field')?.classList.remove('hidden')
                      } else if (type === 'cleaning') {
                        document.getElementById('cleaning-field')?.classList.remove('hidden')
                      } else if (type === 'coa_cod') {
                        document.getElementById('coa-cod-field')?.classList.remove('hidden')
                      }
                    }}
                  >
                    <option value="block_dates">Block Dates</option>
                    <option value="price_update">Price Update</option>
                    <option value="minimum_stay_update">Minimum Stay Update</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="coa_cod">Check-in/Check-out Control</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Properties</label>
                  <div className="space-y-2">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="propertySelection"
                          value="all"
                          checked={bulkPropertySelection === 'all'}
                          onChange={(e) => setBulkPropertySelection(e.target.value as 'all' | 'selected')}
                          className="mr-2"
                        />
                        <span className="text-sm">All Properties ({properties.length})</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="propertySelection"
                          value="selected"
                          checked={bulkPropertySelection === 'selected'}
                          onChange={(e) => setBulkPropertySelection(e.target.value as 'all' | 'selected')}
                          className="mr-2"
                        />
                        <span className="text-sm">Select Properties</span>
                      </label>
                    </div>
                    
                    {bulkPropertySelection === 'selected' && (
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBulkProperties(properties.map(p => p.id))}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedBulkProperties([])}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            Clear All
                          </button>
                          <span className="text-xs text-gray-500 self-center">
                            {selectedBulkProperties.length} selected
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                          {properties.map((property) => (
                            <label key={property.id} className="flex items-center mb-1">
                              <input
                                type="checkbox"
                                checked={selectedBulkProperties.includes(property.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBulkProperties([...selectedBulkProperties, property.id])
                                  } else {
                                    setSelectedBulkProperties(selectedBulkProperties.filter(id => id !== property.id))
                                  }
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm">{property.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input name="date" type="date" required className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                {/* Conditional fields based on operation type */}
                <div id="price-field" className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (€)</label>
                  <input name="price" type="number" step="0.01" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div id="minimum-stay-field" className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stay (nights)</label>
                  <input name="minimumStay" type="number" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div id="maintenance-field" className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                  <input name="maintenanceType" type="text" placeholder="e.g., HVAC, Plumbing, Electrical" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div id="cleaning-field" className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Type</label>
                  <input name="cleaningType" type="text" placeholder="e.g., Deep Clean, Regular Clean, Post-Construction" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
                <div id="coa-cod-field" className="hidden">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Available</label>
                      <select name="checkInAvailable" className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Available</label>
                      <select name="checkOutAvailable" className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason/Description</label>
                  <input name="reason" type="text" placeholder="Optional reason or description" className="w-full border border-gray-300 rounded-md px-3 py-2" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowBulkModal(false)
                    setBulkPropertySelection('all')
                    setSelectedBulkProperties([])
                  }} 
                  className="btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm">
                  Create Bulk Operation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedCalendar