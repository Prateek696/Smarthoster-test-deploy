import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PerformanceCard from '../components/dashboard/PerformanceCard';
import { useLanguage } from '../contexts/LanguageContext';

const Performance: React.FC = () => {
  const { t } = useLanguage();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [searchParams] = useSearchParams();
  const [performanceProps, setPerformanceProps] = useState({
    propertyId: propertyId ? parseInt(propertyId) : undefined,
    month: undefined as string | undefined
  });
  const [appliedFilters, setAppliedFilters] = useState<{
    propertyId?: number;
    period?: string;
    month?: string;
  } | null>(null);

  // Handle URL parameters for property-specific navigation
  useEffect(() => {
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period');

    if (startDate) {
      const date = new Date(startDate);
      const month = date.toISOString().slice(0, 7); // Format as YYYY-MM
      setPerformanceProps({
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        month: month
      });
    }

    // Show a notification about the applied filters
    if (period) {
      const periodText = period === 'thisMonth' ? 'this month' : 
                        period === 'lastMonth' ? 'last month' : period;
      console.log(`Applied ${periodText} performance filters for property ${propertyId}`);
      
      setAppliedFilters({
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        period: periodText,
        month: startDate ? new Date(startDate).toISOString().slice(0, 7) : undefined
      });
    }
  }, [searchParams, propertyId]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('nav.performance')}</h1>
        <p className="text-slate-400 mt-2">
          Track your monthly performance metrics and revenue breakdown
          {propertyId && ` for Property ${propertyId}`}
        </p>
        {appliedFilters && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700 font-medium">
                Showing {appliedFilters.period} data
                {appliedFilters.propertyId && ` for Property ${appliedFilters.propertyId}`}
                {appliedFilters.month && ` (${appliedFilters.month})`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Performance Section */}
      <div>
        <PerformanceCard 
          propertyId={performanceProps.propertyId}
          month={performanceProps.month}
        />
      </div>
    </div>
  );
};

export default Performance;


