import React from 'react';
// COMMENTED OUT - All original imports and functionality
// import { useState, useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
import { 
  Shield
  // CheckCircle, 
  // AlertTriangle, 
  // AlertCircle, 
  // Clock,
  // Users,
  // Calendar,
  // FileCheck,
  // RefreshCw,
  // Construction
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
// import { RootState, AppDispatch } from '../store';
// import { fetchBulkSibaDashboardAsync } from '../store/sibaManager.slice';
// import { fetchBookingsAsync } from '../store/bookings.slice';
// import { fetchPropertiesAsync } from '../store/propertyManagement.slice';
// import { fetchSibaStatusAsync } from '../store/siba.slice';
// import { SibaPropertyData } from '../services/sibaManager.api';
// import usePropertyRefresh from '../hooks/usePropertyRefresh';
// import PropertySelector from '../components/common/PropertySelector';

const SibaManagerDashboard: React.FC = () => {
  const { t } = useLanguage();
  // COMMENTED OUT - All original SIBA Manager functionality
  // const dispatch = useDispatch<AppDispatch>();
  // const { bulkDashboard } = useSelector((state: RootState) => state.sibaManager);
  // const { properties } = useSelector((state: RootState) => state.propertyManagement);
  // const { bookings } = useSelector((state: RootState) => state.bookings);
  // const { statuses: sibaStatuses } = useSelector((state: RootState) => state.siba);
  // const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  // const [dateRange, setDateRange] = useState({
  //   startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  //   endDate: new Date().toISOString().split('T')[0]
  // });
  // const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  // const [isRefreshing, setIsRefreshing] = useState(false);

  // // Listen for property deletion events to refresh property lists
  // usePropertyRefresh();

  // // Auto-refresh data when component mounts and user is authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     handleRefresh();
  //   }
  // }, [isAuthenticated]);

  // // Fetch all properties data on mount when authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     dispatch(fetchPropertiesAsync());
  //   }
  // }, [dispatch, isAuthenticated]);

  // // Fetch SIBA status for properties once they're loaded
  // useEffect(() => {
  //   // Fetch SIBA status for all properties
  //   if (properties && properties.length > 0) {
  //     properties.forEach(property => {
  //       dispatch(fetchSibaStatusAsync(property.id));
  //     });
  //   }
  // }, [dispatch, properties]);

  // // Fetch bookings data for all properties to enable bulk operations
  // useEffect(() => {
  //   // Fetch bookings for all properties to enable bulk SIBA operations
  //   dispatch(fetchBookingsAsync({
  //     propertyId: undefined, // Fetch all properties
  //     startDate: dateRange.startDate,
  //     endDate: dateRange.endDate
  //   }));
  // }, [dispatch, dateRange]);

  // // Fetch bulk SIBA dashboard data
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     dispatch(fetchBulkSibaDashboardAsync());
  //   }
  // }, [dispatch, isAuthenticated]);

  // const handleRefresh = async () => {
  //   if (!isAuthenticated) return;
    
  //   setIsRefreshing(true);
  //   setNotification(null);
    
  //   try {
  //     // Fetch all data in parallel
  //     await Promise.all([
  //       dispatch(fetchBulkSibaDashboardAsync()),
  //       dispatch(fetchBookingsAsync({
  //         propertyId: undefined,
  //         startDate: dateRange.startDate,
  //         endDate: dateRange.endDate
  //       })),
  //       dispatch(fetchPropertiesAsync()),
  //       ...properties.map(property => dispatch(fetchSibaStatusAsync(property.id)))
  //     ]);
      
  //     setNotification({
  //       type: 'success',
  //       message: 'Dashboard data refreshed successfully'
  //     });
  //   } catch (error) {
  //     console.error('Error refreshing dashboard:', error);
  //     setNotification({
  //       type: 'error',
  //       message: 'Failed to refresh dashboard data'
  //     });
  //   } finally {
  //     setIsRefreshing(false);
  //   }
  // };

  // // Get real SIBA data from bookings
  // const realSibaData = bookings.filter(booking => 
  //   booking.arrivalDate && 
  //   booking.departureDate && 
  //   booking.totalPrice > 0
  // );

  // // Get properties with SIBA data
  // const propertiesWithSibaData = properties.filter(property => 
  //   realSibaData.some(booking => booking.listingId === property.id)
  // );

  // // Calculate SIBA compliance metrics
  // const totalBookings = realSibaData.length;
  // const compliantBookings = realSibaData.filter(booking => 
  //   booking.status === 'confirmed' || booking.status === 'completed'
  // ).length;
  // const complianceRate = totalBookings > 0 ? (compliantBookings / totalBookings) * 100 : 0;

  // // Get recent SIBA submissions
  // const recentSubmissions = bulkDashboard?.submissions?.slice(0, 5) || [];

  // // Get SIBA status summary
  // const statusSummary = {
  //   total: sibaStatuses.length,
  //   active: sibaStatuses.filter(status => status.status === 'active').length,
  //   pending: sibaStatuses.filter(status => status.status === 'pending').length,
  //   expired: sibaStatuses.filter(status => status.status === 'expired').length
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Under Development Message */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('sibaManager.title')}</h1>
            <h2 className="text-lg font-semibold text-blue-600 mb-4">{t('sibaManager.underDevelopment')}</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {t('sibaManager.description')}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>{t('sibaManager.comingSoon')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SibaManagerDashboard;