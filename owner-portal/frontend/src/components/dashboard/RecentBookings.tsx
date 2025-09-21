import React from 'react'
import { Calendar, Users, MapPin, ExternalLink } from 'lucide-react'

interface Booking {
  id: string
  guestName: string
  propertyName: string
  checkIn: string
  checkOut: string
  guests: number
  status: 'confirmed' | 'pending' | 'cancelled'
  totalAmount: number
  platform: string
}

interface RecentBookingsProps {
  propertyId: number | null
}

const RecentBookings: React.FC<RecentBookingsProps> = ({ propertyId }) => {
  // TODO: Replace with real API calls to fetch bookings
  const bookings: Booking[] = []

  const getStatusBadge = (status: string) => {
    const classes = {
      confirmed: 'badge-success',
      pending: 'badge-warning',
      cancelled: 'badge-danger'
    }
    return classes[status as keyof typeof classes] || 'badge-gray'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No recent bookings</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {booking.guestName}
                </p>
                <span className={`badge ${getStatusBadge(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{booking.propertyName}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{booking.guests} guests</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(booking.totalAmount)}
              </p>
              <p className="text-xs text-gray-500">{booking.platform}</p>
            </div>
            
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default RecentBookings


