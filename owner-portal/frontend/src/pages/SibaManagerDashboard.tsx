import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Clock,
  Users,
  Calendar,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { RootState, AppDispatch } from '../store';
import { fetchBulkSibaDashboardAsync } from '../store/sibaManager.slice';
import { fetchBookingsAsync } from '../store/bookings.slice';
import { fetchPropertiesAsync } from '../store/propertyManagement.slice';
import { fetchSibaStatusAsync } from '../store/siba.slice';
import { SibaPropertyData } from '../services/sibaManager.api';
// import PropertySelector from '../components/common/PropertySelector';

const SibaManagerDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bulkDashboard } = useSelector((state: RootState) => state.sibaManager);
  const { properties } = useSelector((state: RootState) => state.propertyManagement);
  const { bookings } = useSelector((state: RootState) => state.bookings);
  const { statuses: sibaStatuses } = useSelector((state: RootState) => state.siba);
  
  // const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch all properties data on mount
  useEffect(() => {
    dispatch(fetchPropertiesAsync());
  }, [dispatch]);

  // Fetch SIBA status for properties once they're loaded
  useEffect(() => {
    // Fetch SIBA status for all properties
    if (properties && properties.length > 0) {
      properties.forEach(property => {
        dispatch(fetchSibaStatusAsync(property.id));
      });
    }
  }, [dispatch, properties]);

  // Fetch bookings data for all properties to enable bulk operations
  useEffect(() => {
    // Fetch bookings for all properties to enable bulk SIBA operations
    dispatch(fetchBookingsAsync({
      propertyId: undefined, // Fetch all properties
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }));
  }, [dispatch, dateRange]);

  // Generate real SIBA data from actual bookings and SIBA status
  const generateRealSibaData = (): SibaPropertyData[] => {
    if (!properties || properties.length === 0) return [];

    return properties.map(property => {
      const sibaStatus = sibaStatuses[property.id];
      const propertyBookings = bookings.filter(booking => booking.propertyId === property.id);
      
      // Calculate real metrics from bookings
      const totalReservations = propertyBookings.length;
      const totalGuests = propertyBookings.reduce((sum, booking) => sum + (booking.adults || 0) + (booking.children || 0), 0);
      
      // Calculate pending and overdue submissions based on checkout dates
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      const recentBookings = propertyBookings.filter(booking => {
        const checkout = new Date(booking.checkOut || booking.departureDate || new Date());
        return checkout >= thirtyDaysAgo && checkout <= now;
      });
      
      const pendingSubmissions = recentBookings.length;
      const overdueSubmissions = recentBookings.filter(booking => {
        const checkout = new Date(booking.checkOut || booking.departureDate || new Date());
        const daysSinceCheckout = Math.floor((now.getTime() - checkout.getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCheckout > 7; // SIBA should be submitted within 7 days
      }).length;
      
      const complianceRate = pendingSubmissions > 0 
        ? Math.round(((pendingSubmissions - overdueSubmissions) / pendingSubmissions) * 100)
        : 100;

      // Generate flags based on real data
      const flags = [];
      if (overdueSubmissions > 0) flags.push('overdue');
      else if (pendingSubmissions > 0) flags.push('pending');
      else if (sibaStatus?.status === 'green') flags.push('compliant');
      else if (sibaStatus?.status === 'amber') flags.push('due_soon');
      else if (sibaStatus?.status === 'red') flags.push('overdue');
      
      if (complianceRate < 80) flags.push('low_compliance');

      return {
        propertyId: property.id,
        propertyName: property.name || `Property ${property.id}`,
        sibaStatus: sibaStatus?.status || 'red',
        lastSubmission: sibaStatus?.lastSibaSendDate || null,
        nextDue: sibaStatus?.nextDueDate || null,
        daysUntilDue: sibaStatus?.daysUntilDue || null,
        totalReservations,
        pendingSubmissions,
        overdueSubmissions,
        complianceRate,
        flags
      };
    });
  };

  const realSibaData = generateRealSibaData();

  const handleRefresh = async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    setIsRefreshing(true);
    setNotification({type: 'info', message: 'Refreshing all SIBA data...'});
    
    try {
      // Refresh all properties data
      const propertiesResult = await dispatch(fetchPropertiesAsync());
      
      // Get the updated properties from the result
      const updatedProperties = (propertiesResult.payload as any)?.properties || properties;
      
      // Refresh SIBA status for all properties (only if properties exist)
      if (updatedProperties && updatedProperties.length > 0) {
        const sibaPromises = updatedProperties.map((property: any) => 
          dispatch(fetchSibaStatusAsync(property.id))
        );
        await Promise.all(sibaPromises);
      }
      
      // Refresh bookings for all properties
      await dispatch(fetchBookingsAsync({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }));
      
      setNotification({type: 'success', message: 'Data refreshed successfully!'});
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Refresh error:', error);
      setNotification({type: 'error', message: 'Failed to refresh data. Please try again.'});
    setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };




  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'amber': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'red': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'border-green-200 bg-green-50';
      case 'amber': return 'border-yellow-200 bg-yellow-50';
      case 'red': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'due_soon': return 'bg-yellow-100 text-yellow-800';
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'low_compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Display all properties without filtering or sorting
  const displayData = realSibaData;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate real summary from actual data
  const realSummary = {
    totalProperties: realSibaData.length,
    overdue: realSibaData.filter(p => p.flags.includes('overdue')).length,
    dueSoon: realSibaData.filter(p => p.flags.includes('due_soon')).length,
    compliant: realSibaData.filter(p => p.flags.includes('compliant')).length,
    errors: realSibaData.filter(p => p.flags.includes('error')).length
  };


  if (bulkDashboard.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading SIBA Dashboard</h3>
              <p className="text-gray-500">Fetching compliance data for all properties...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            notification.type === 'success' ? 'bg-green-100 border border-green-300 text-green-800' :
            notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-800' :
            'bg-blue-100 border border-blue-300 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5" />}
              {notification.type === 'info' && <AlertTriangle className="h-5 w-5" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">SIBA Manager Dashboard</h1>
              <p className="text-gray-600">Real-time SIBA compliance monitoring with Hostkit data</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">
                  Data source: Hostkit API • Last updated: {new Date().toLocaleTimeString()}
                </span>
                {realSibaData.length > 0 && (
                  <span className="text-xs text-green-600">✓ Real booking data</span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <PropertySelector
                selectedId={selectedPropertyId}
                onChange={setSelectedPropertyId}
                properties={properties}
                placeholder="All Properties"
              /> */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isRefreshing 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{realSummary.totalProperties}</p>
            <p className="text-sm text-gray-600">Total Properties</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-6 text-center">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl w-fit mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{realSummary.overdue}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-yellow-200 p-6 text-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl w-fit mx-auto mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{realSummary.dueSoon}</p>
            <p className="text-sm text-gray-600">Due Soon</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 p-6 text-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl w-fit mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{realSummary.compliant}</p>
            <p className="text-sm text-gray-600">Compliant</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 text-center">
            <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl w-fit mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{realSummary.errors}</p>
            <p className="text-sm text-gray-600">Errors</p>
          </div>
        </div>


        {/* Properties Table */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-6 text-left text-lg font-semibold text-gray-900">Property</th>
                  <th className="px-8 py-6 text-left text-lg font-semibold text-gray-900">Status</th>
                  <th className="px-8 py-6 text-left text-lg font-semibold text-gray-900">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayData && displayData.length > 0 ? displayData.map((property) => (
                  <tr key={property.propertyId} className="hover:bg-gray-50">
                    <td className="px-8 py-6">
                      <div>
                        <div className="text-lg font-semibold text-gray-900">{property.propertyName}</div>
                        <div className="text-base text-gray-500">ID: {property.propertyId}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(property.sibaStatus)}
                        <span className="text-lg font-semibold capitalize">{property.sibaStatus}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {property.flags.map((flag, index) => (
                          <span
                            key={index}
                            className={`px-3 py-2 text-sm font-medium rounded-full ${getFlagColor(flag)}`}
                          >
                            {flag.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-gray-500">
                      No properties data available. Click refresh to load data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SibaManagerDashboard;
