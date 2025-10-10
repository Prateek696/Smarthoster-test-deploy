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
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Download
} from 'lucide-react'
import { RootState, AppDispatch } from '../store'
import { fetchInvoicesAsync } from '../store/invoices.slice'
import { fetchPropertiesAsync } from '../store/properties.slice'
import PropertySelector from '../components/common/PropertySelector'
import { getPropertyName } from '../utils/propertyUtils'
import { apiClient } from '../services/apiClient'
import { useLanguage } from '../contexts/LanguageContext'

const Invoices: React.FC = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [selectedDateRange, setSelectedDateRange] = useState('lastMonth')
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null)
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false)
  
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

  // Auto-select first property if none selected
  useEffect(() => {
    if (properties.length > 0 && !selectedPropertyId) {
      const firstProperty = properties[0]
      setSelectedPropertyId(firstProperty.id)
      console.log('Auto-selected first property:', firstProperty.name)
    }
  }, [properties, selectedPropertyId])

  // Get property name using utility function (dynamic from database)
  const getPropertyNameById = (propertyId: number) => {
    return getPropertyName(propertyId, { properties: { properties } } as RootState)
  }

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

  // Function to download invoice - Direct download using invoice URL
  const handleViewInvoice = async (invoice: any) => {
    // Check both possible URL field names (invoice_url from API, invoiceUrl from Redux)
    const invoiceUrl = invoice.invoice_url || invoice.invoiceUrl;
    
    console.log('🔍 Invoice data for download:', {
      id: invoice.id,
      invoice_url: invoice.invoice_url,
      invoiceUrl: invoice.invoiceUrl,
      finalUrl: invoiceUrl
    });
    
    if (invoiceUrl && invoiceUrl !== '#') {
      setDownloadingInvoiceId(invoice.id)
      try {
        // Use Vercel API route to download external files (no CORS issues, same domain)
        console.log(`🔄 Downloading invoice ${invoice.id} via Vercel API proxy with URL: ${invoiceUrl}`);
        
        // Use local Vercel API route that handles external URLs
        const proxyUrl = `/api/invoice-proxy?url=${encodeURIComponent(invoiceUrl)}`;
        
        // Fetch from same domain (no CORS issues)
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        window.URL.revokeObjectURL(url);
        
        console.log(`✅ Download initiated for invoice ${invoice.id}`);
      } catch (error) {
        console.error('Error downloading invoice:', error)
        alert('Failed to download invoice. Please try again.')
      } finally {
        setDownloadingInvoiceId(null)
      }
    } else {
      console.log('❌ No valid invoice URL found:', { invoice_url: invoice.invoice_url, invoiceUrl: invoice.invoiceUrl });
      alert('Invoice URL not available for download')
    }
  }

  // Function to download all invoices
  const handleDownloadAll = async () => {
    if (!invoices || invoices.length === 0) {
      alert('No invoices available to download')
      return
    }

    setIsDownloadingAll(true)
    
    try {
      // Download invoices with a small delay between each to avoid overwhelming the server
      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i]
        
        // Check if invoice has valid URL
        const invoiceUrl = invoice.invoiceUrl || (invoice as any).invoice_url
        if (invoiceUrl && invoiceUrl !== '#') {
          console.log(`🔄 Downloading invoice ${i + 1}/${invoices.length}: ${invoice.id}`)
          
          try {
            // Use Vercel API route to download external files
            const proxyUrl = `/api/invoice-proxy?url=${encodeURIComponent(invoiceUrl)}`
            
            const response = await fetch(proxyUrl)
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            
            // Create download link
            const link = document.createElement('a')
            link.href = url
            link.download = `invoice_${invoice.id}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            // Clean up
            window.URL.revokeObjectURL(url)
            
            // Small delay between downloads to prevent browser from blocking multiple downloads
            if (i < invoices.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          } catch (error) {
            console.error(`Error downloading invoice ${invoice.id}:`, error)
            // Continue with next invoice even if one fails
          }
        } else {
          console.log(`⚠️ Skipping invoice ${invoice.id} - no valid URL`)
        }
      }
      
      console.log(`✅ Download all completed for ${invoices.length} invoices`)
    } catch (error) {
      console.error('Error in download all:', error)
      alert('Some invoices failed to download. Please check the console for details.')
    } finally {
      setIsDownloadingAll(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">{t('invoices.loading')}</p>
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
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('invoices.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('invoices.manageGuestInvoices')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4 pt-20">
        {/* Filters */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 p-4 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row gap-3">
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
                {t('invoices.filters')}
              </button>

              {/* Download All Button */}
              {invoices && invoices.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-all duration-300 flex items-center gap-1 border ${
                    isDownloadingAll
                      ? 'bg-green-500/40 text-gray-900 border-green-200 cursor-not-allowed'
                      : 'bg-green-500/20 text-gray-900 border-green-200 hover:bg-green-500/30'
                  }`}
                >
                  {isDownloadingAll ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      Downloading All...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 opacity-70" />
                      Download All ({invoices.length})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-lg border border-gray-100/50 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('invoices.property')}</label>
                  <PropertySelector
                    selectedId={selectedPropertyId}
                    onChange={setSelectedPropertyId}
                    properties={properties}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('invoices.dateRange')}</label>
                  <select
                    value={selectedDateRange}
                    onChange={(e) => {
                      setSelectedDateRange(e.target.value)
                      const { startDate: newStartDate, endDate: newEndDate } = getDateRange(e.target.value)
                      setStartDate(newStartDate)
                      setEndDate(newEndDate)
                    }}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                  >
                    <option value="lastMonth">{t('invoices.lastMonth')}</option>
                    <option value="last3Months">{t('invoices.last3Months')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('invoices.fromDate')}</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('invoices.toDate')}</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-[#5FFF56] text-gray-900 shadow-md"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end mt-8">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold shadow-md"
                  >
{t('invoices.clearAll')}
                  </button>
                  <button
                    onClick={fetchInvoices}
                    className="px-4 py-2 bg-blue-500/20 text-gray-900 rounded-lg hover:bg-blue-500/30 transition-all duration-300 font-semibold shadow-sm hover:shadow-md border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!selectedPropertyId}
                  >
{t('invoices.applyFilters')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Invoices Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('invoices.noInvoicesFound')}</h3>
                <p className="text-lg text-gray-600 mb-6">{t('invoices.noInvoicesAvailable')}</p>
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.invoice')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.guest')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.property')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.date')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.amount')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.status')}</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('invoices.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={`${invoice.id}-${invoice.propertyId}-${index}`} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 group">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center shadow-sm border border-blue-200">
                            <FileText className="h-4 w-4 text-gray-900 opacity-70" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{invoice.id}</p>
                            <p className="text-xs text-gray-500 font-medium">
                              {invoice.closed ? t('invoices.closed') : t('invoices.open')}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-sm">{invoice.guestName}</p>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-sm">{getPropertyNameById(invoice.propertyId || 0)}</p>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="font-semibold text-gray-900">{formatDate(invoice.date)}</span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-sm">{invoice.valueFormatted}</span>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold shadow-md ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => handleViewInvoice(invoice)}
                            disabled={downloadingInvoiceId === invoice.id}
                            className={`p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-blue-200 ${
                              downloadingInvoiceId === invoice.id 
                                ? 'bg-blue-500/40 text-gray-900 cursor-not-allowed' 
                                : 'bg-blue-500/20 text-gray-900 hover:bg-blue-500/30'
                            }`}
                            title={downloadingInvoiceId === invoice.id ? t('invoices.downloading') : t('invoices.downloadInvoice')}
                          >
                            {downloadingInvoiceId === invoice.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                            ) : (
                              <Download className="w-4 h-4 opacity-70" />
                            )}
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


