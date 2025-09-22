import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, RefreshCw } from 'lucide-react';
import { usePerformance } from '../../hooks/usePerformance';
import PropertySelector from '../common/PropertySelector';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';

interface PerformanceCardProps {
  propertyId?: number;
  month?: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ 
  propertyId: initialPropertyId,
  month: initialMonth 
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(initialPropertyId || 392776);
  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth || new Date().toISOString().slice(0, 7));

  const properties = useSelector((state: RootState) => state.propertyManagement.properties);
  const { token } = useSelector((state: RootState) => state.auth);

  const { performanceData, isLoading, error, refreshData } = usePerformance({
    propertyId: selectedPropertyId || 392776,
    month: selectedMonth
  });



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate options for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Error loading performance data</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={refreshData}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!performanceData) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <p className="font-medium">No performance data available</p>
            <p className="text-sm">Select a property and month to view performance metrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Monthly Performance</h2>
          <p className="text-sm text-gray-600">Revenue, commission, and payout overview</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <PropertySelector
            properties={properties}
            selectedId={selectedPropertyId}
            onChange={setSelectedPropertyId}
          />
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={refreshData}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Refresh data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {performanceData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gross Revenue */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gross Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(performanceData.grossRevenue)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Commission</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(performanceData.commissionTotal)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {performanceData.commissionPercent}% of gross
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Cleaning Fees */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cleaning Fees</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(performanceData.cleaningFees)}
                  </p>
                  <p className="text-sm text-gray-500">Deducted from gross</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Net Payout */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Payout</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(performanceData.netPayout)}
                  </p>
                  <p className="text-sm text-gray-500">Your earnings</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 gap-6">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Gross Revenue</span>
                  <span className="font-medium">{formatCurrency(performanceData.grossRevenue)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Commission ({performanceData.commissionPercent}%)</span>
                  <span className="font-medium">-{formatCurrency(performanceData.commissionTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>Cleaning Fees</span>
                  <span className="font-medium">-{formatCurrency(performanceData.cleaningFees)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center font-bold text-lg">
                  <span>Net Payout</span>
                  <span className="text-green-600">{formatCurrency(performanceData.netPayout)}</span>
                </div>
              </div>
            </div>

          </div>

        </>
      ) : (
        <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No performance data available for the selected month</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceCard;
