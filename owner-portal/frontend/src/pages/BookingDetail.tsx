import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Users, 
  Euro, 
  MapPin, 
  Building,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useLanguage } from '../contexts/LanguageContext'
import { apiClient } from '../services/apiClient'
import RealLogo from '../assets/Real-logo.jpg'

const BookingDetail: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [searchParams] = useSearchParams()
  const propertyId = searchParams.get('propertyId')
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { token } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    const fetchBookingDetail = async () => {
      if (!bookingId || !propertyId) {
        setError('Missing booking ID or property ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const bookingData = await apiClient.get(`/bookings/detail/${bookingId}?propertyId=${propertyId}`)
        setBooking(bookingData)
      } catch (err: any) {
        console.error('Error fetching booking detail:', err)
        setError(err.message || 'Failed to fetch booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetail()
  }, [bookingId, propertyId, token])

  const handleDownloadPDF = () => {
    if (!booking) return
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    
    if (!printWindow) {
      alert('Please allow popups to download PDF')
      return
    }
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Detail Report - ${booking.id}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          .header .logo {
            height: 60px;
            width: auto;
          }
          .header .title-section {
            flex: 1;
          }
          .header h1 { 
            margin: 0; 
            color: #333; 
            font-size: 24px;
          }
          .header p { 
            margin: 5px 0 0 0; 
            color: #666; 
            font-size: 14px;
          }
          .section { 
            margin-bottom: 25px; 
            page-break-inside: avoid;
          }
          .section h3 { 
            color: #333; 
            border-bottom: 1px solid #ccc; 
            padding-bottom: 8px; 
            margin-bottom: 15px;
            font-size: 18px;
          }
          .info-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            padding: 5px 0;
          }
          .label { 
            font-weight: bold; 
            color: #333;
            flex: 1;
          }
          .value { 
            color: #666; 
            flex: 1;
            text-align: right;
          }
          .financial { 
            background-color: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            border: 1px solid #e9ecef;
          }
          .financial .info-row {
            border-bottom: 1px solid #e9ecef;
            padding: 8px 0;
          }
          .financial .info-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            color: #333;
          }
          .special-requests {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #007bff;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${RealLogo}" alt="Company Logo" class="logo" />
          <div class="title-section">
            <h1>${t('bookingDetail.reportTitle')}</h1>
            <p>${t('bookingDetail.generatedOn')} ${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div class="section">
          <h3>${t('bookingDetail.basicInformation')}</h3>
          <div class="info-row">
            <span class="label">${t('bookingDetail.hostawayReservationId')}</span>
            <span class="value">${booking.hostawayReservationId || booking.id || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.channelReservationId')}</span>
            <span class="value">${booking.channelReservationId || booking.reservationId || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.property')}</span>
            <span class="value">${booking.propertyName}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.guestName')}</span>
            <span class="value">${booking.guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.guestEmail')}</span>
            <span class="value">${booking.guestEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.guestPhone')}</span>
            <span class="value">${booking.guestPhone || t('bookingDetail.notProvided')}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>${t('bookingDetail.datesDuration')}</h3>
          <div class="info-row">
            <span class="label">${t('bookingDetail.checkin')}</span>
            <span class="value">${new Date(booking.arrivalDate).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.checkout')}</span>
            <span class="value">${new Date(booking.departureDate).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.totalNights')}</span>
            <span class="value">${booking.nights}</span>
          </div>
          ${booking.checkInTime ? `
          <div class="info-row">
            <span class="label">${t('bookingDetail.checkinTime')}</span>
            <span class="value">${booking.checkInTime}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.checkoutTime')}</span>
            <span class="value">${booking.checkOutTime}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="section">
          <h3>${t('bookingDetail.guestInformation')}</h3>
          <div class="info-row">
            <span class="label">${t('bookingDetail.adults')}</span>
            <span class="value">${booking.adults}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.children')}</span>
            <span class="value">${booking.children}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.totalGuests')}</span>
            <span class="value">${booking.totalGuests}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>${t('bookingDetail.bookingDetails')}</h3>
          <div class="info-row">
            <span class="label">${t('bookingDetail.platform')}</span>
            <span class="value">${booking.provider}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.status')}</span>
            <span class="value">${booking.status}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('bookingDetail.paymentStatus')}</span>
            <span class="value">${booking.paymentStatus}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>${t('bookingDetail.financialBreakdown')}</h3>
          <div class="financial">
            <div class="info-row">
              <span class="label">${t('bookingDetail.totalRevenue')}</span>
              <span class="value">€${booking.totalPrice?.toFixed(2)}</span>
            </div>
            <div class="info-row" style="background-color: #f8f9fa; padding: 8px; border-radius: 4px;">
              <span class="label" style="font-style: italic;">Note:</span>
              <span class="value" style="font-style: italic;">${t('bookingDetail.finalAmountNote')}</span>
            </div>
            ${booking.cityTax ? `
            <div class="info-row">
              <span class="label">${t('bookingDetail.cityTax')}</span>
              <span class="value">€${booking.cityTax?.toFixed(2)}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        ${booking.specialRequests ? `
        <div class="section">
          <h3>${t('bookingDetail.specialRequests')}</h3>
          <div class="special-requests">
            <p>${booking.specialRequests}</p>
          </div>
        </div>
        ` : ''}
        
        <script>
          // Auto-print when window loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              // Close window after printing
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `
    
    // Write content to new window
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Booking</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/bookings')}
            className="btn-primary"
          >
{t('bookingDetail.backToBookings')}
          </button>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The requested booking could not be found.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="btn-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
{t('bookingDetail.backToBookings')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/bookings')}
                className="btn-outline btn-sm mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
    {t('bookingDetail.backToBookings')}
              </button>
              <h1 className="text-xl font-semibold text-white">
                Booking Details - {booking.id}
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownloadPDF}
                className="btn-outline btn-sm"
              >
                <Download className="h-4 w-4 mr-2" />
{t('bookingDetail.printPdf')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">{t('bookingDetail.basicInformation')}</h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
{t('bookingDetail.hostawayReservationId')}
                    </label>
                    <input 
                      type="text" 
                      value={booking.hostawayReservationId || booking.id || 'N/A'} 
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
{t('bookingDetail.channelReservationId')}
                    </label>
                    <input 
                      type="text" 
                      value={booking.channelReservationId || booking.reservationId || 'N/A'} 
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.guestName')}</label>
                    <p className="text-sm text-gray-900">{booking.guestName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.platform')}</label>
                    <p className="text-sm text-gray-900 capitalize">{booking.provider}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.status')}</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates and Duration */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">{t('bookingDetail.datesDuration')}</h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.checkin')}</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{new Date(booking.arrivalDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.checkout')}</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{new Date(booking.departureDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.totalNights')}</label>
                    <p className="text-2xl font-bold text-primary-600">{booking.nights}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">{t('bookingDetail.guestInformation')}</h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.guestEmail')}</label>
                    <p className="text-sm text-gray-900">{booking.guestEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.guestPhone')}</label>
                    <p className="text-sm text-gray-900">{booking.guestPhone || t('bookingDetail.notProvided')}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.adults')}</label>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{booking.adults}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.children')}</label>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-900">{booking.children}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.totalGuests')}</label>
                    <p className="text-2xl font-bold text-primary-600">{booking.totalGuests}</p>
                  </div>
                </div>
                {booking.specialRequests && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bookingDetail.specialRequests')}</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{booking.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Tax & Financial */}
          <div className="space-y-6">
            {/* Tax Information */}
            {booking.currentTaxFormatted && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Tax Information</h3>
                </div>
                <div className="card-content space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Tax</label>
                    <p className="text-2xl font-bold text-gray-900">{booking.currentTaxFormatted}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Tax</label>
                    <p className="text-2xl font-bold text-success-600">{booking.estimatedTotalTaxFormatted}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax per Night</label>
                    <p className="text-sm text-gray-900">{booking.estimatedTaxPerNightFormatted}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxable Nights:</span>
                      <span className="font-medium">{booking.taxableNights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exempt Nights:</span>
                      <span className="font-medium">{booking.exemptNights}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">{t('bookingDetail.financialBreakdown')}</h3>
              </div>
              <div className="card-content space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('bookingDetail.totalRevenue')}</label>
                  <p className="text-2xl font-bold text-primary-600">€{booking.totalPrice?.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">{t('bookingDetail.finalAmountNote')}</p>
                </div>
                {booking.checkInTime && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('bookingDetail.checkinTime')}</span>
                      <span className="font-medium">{booking.checkInTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t('bookingDetail.checkoutTime')}</span>
                      <span className="font-medium">{booking.checkOutTime}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tax Implementation Status */}
            {booking.taxImplemented !== undefined && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900">Tax Status</h3>
                </div>
                <div className="card-content">
                  <div className="flex items-center">
                    {booking.taxImplemented ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {booking.taxImplemented ? 'Tax Implemented' : 'Tax Not Implemented'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetail
