import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getProperties } from '../services/properties.api';
import { apiClient } from '../services/apiClient';
import { Calendar, Filter, Download } from 'lucide-react';
import { RootState } from '../store';
import FinancialDetailsTable from '../components/financial/FinancialDetailsTable';

interface Property {
  id: number;
  name: string;
  address: string;
}

interface FinancialData {
  property: string;
  invoice: string;
  reservation: {
    guestName: string;
    reservationId: string;
    date: string;
  };
  receivedAmount: number;
  hostCommission: number;
  cleaningFee: number;
  mgmtCommission: number;
}


const FinancialDetails: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [financialData, setFinancialData] = useState<FinancialData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Check if user has permission to access financial details
    if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'accountant')) {
      setError('You do not have permission to access financial details.');
      return;
    }
    
    fetchProperties();
    
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, [user]);

  const fetchProperties = async () => {
    try {
      console.log('🔍 Fetching properties for user:', user?.role, user?.id);
      const data = await getProperties();
      console.log('✅ Properties fetched successfully:', data);
      
      const propertiesList = data.properties || data;
      setProperties(propertiesList);
      
      if (propertiesList.length > 0) {
        setSelectedProperty(propertiesList[0]);
        console.log('✅ Selected first property:', propertiesList[0]);
      } else {
        setError('No properties found for your account.');
      }
    } catch (error: any) {
      console.error('❌ Error fetching properties:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.response?.status === 403) {
        if (error.response?.data?.message === 'Invalid or expired token') {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Access denied. You do not have permission to view properties.');
        }
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Failed to fetch properties: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const generateFinancialData = async () => {
    if (!selectedProperty || !startDate || !endDate) {
      setError('Please select a property and date range');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch owner statements data
      const response = await apiClient.get(
        `/owner-statements/property/${selectedProperty.id}?startDate=${startDate}&endDate=${endDate}&commissionPercentage=25`
      );

      if (response.data && response.data.length > 0) {
        const statement = response.data[0];
        
        
        // Transform the data to match our table format
        const transformedData: FinancialData[] = statement.reservations.map((res: any) => ({
          property: statement.propertyName,
          invoice: res.invoiced_value > 0 
            ? `FR ${statement.propertyName.replace(/\s+/g, '').toUpperCase()}${new Date().getFullYear()}/${new Date().getMonth() + 1}` 
            : 'N/A',
          reservation: {
            guestName: `${res.firstname} ${res.lastname}`,
            reservationId: res.rcode,
            date: new Date(parseInt(res.arrival) * 1000).toISOString().split('T')[0]
          },
          receivedAmount: res.received_amount || 0,
          hostCommission: res.host_commission || 0,
          cleaningFee: res.cleaning_fee || 0,
          mgmtCommission: statement.isAdminOwned ? 0 : Math.max(0, 0.25 * ((res.received_amount + res.host_commission) - res.cleaning_fee))
        }));

        setFinancialData(transformedData);
      } else {
        setError('No financial data found for the selected period');
        setFinancialData([]);
      }
    } catch (error: any) {
      console.error('Error generating financial data:', error);
      setError(error.response?.data?.message || 'Failed to generate financial data');
      setFinancialData([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (financialData.length === 0) return;

    const csvContent = [
      ['Property', 'Invoice', 'Guest Name', 'Reservation ID', 'Date', 'Received Amount', 'Host Commission', 'Cleaning Fee', 'Mgmt Commission'],
      ...financialData.map(item => [
        item.property,
        item.invoice,
        item.reservation.guestName,
        item.reservation.reservationId,
        item.reservation.date,
        item.receivedAmount.toFixed(2),
        item.hostCommission.toFixed(2),
        item.cleaningFee.toFixed(2),
        item.mgmtCommission.toFixed(2)
      ])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-details-${selectedProperty?.name}-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Details</h1>
          <p className="mt-2 text-gray-600">
            View detailed financial breakdown by property and invoice
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property
              </label>
              <select
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = properties.find(p => p.id === parseInt(e.target.value));
                  setSelectedProperty(property || null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={generateFinancialData}
              disabled={loading || !selectedProperty || !startDate || !endDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Financial Table */}
        {financialData.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Financial Breakdown for {selectedProperty?.name}
              </h2>
              <button
                onClick={downloadCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </button>
            </div>
            <FinancialDetailsTable data={financialData} />
          </div>
        )}

        {/* No Data Message */}
        {!loading && financialData.length === 0 && !error && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Financial Data</h3>
            <p className="text-gray-600">
              Select a property and date range, then click "Generate Report" to view financial details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDetails;
