import { getMonthlyPerformanceService } from './performance.service';
import { getBookingsService } from './booking.service';
import { getCityTaxService } from './touristTax.service';

export const getPortfolioOverview = async (propertyIds: number[], month: string) => {
  try {
    const portfolioData = await Promise.all(
      propertyIds.map(async (propertyId) => {
        try {
          // Get performance data for each property
          const performance = await getMonthlyPerformanceService(propertyId, month);
          
          // Get booking data for occupancy calculation
          const startDate = `${month}-01`;
          const endDate = `${month}-31`;
          const bookings = await getBookingsService(propertyId, startDate, endDate);
          
          // Get tourist tax data
          const touristTax = await getCityTaxService(propertyId, startDate, endDate);
          
          // Calculate occupancy rate
          const totalNights = bookings.summary?.totalNights || 0;
          const daysInMonth = new Date(month + '-01').getDate();
          const occupancyRate = (totalNights / daysInMonth) * 100;
          
          // Calculate ADR (Average Daily Rate)
          const totalRevenue = performance.grossRevenue || 0;
          const adr = totalNights > 0 ? totalRevenue / totalNights : 0;
          
          return {
            propertyId,
            propertyName: `Property ${propertyId}`, // You might want to get this from property service
            occupancyRate: Math.round(occupancyRate * 10) / 10,
            adr: Math.round(adr * 100) / 100,
            totalRevenue: performance.grossRevenue || 0,
            netPayout: performance.netPayout || 0,
            bookingCount: bookings.total || 0,
            touristTax: touristTax.totalTax || 0,
            commission: performance.commissionTotal || 0,
            cleaningFees: performance.cleaningFees || 0
          };
        } catch (error) {
          console.error(`Error fetching data for property ${propertyId}:`, error);
          return {
            propertyId,
            propertyName: `Property ${propertyId}`,
            occupancyRate: 0,
            adr: 0,
            totalRevenue: 0,
            netPayout: 0,
            bookingCount: 0,
            touristTax: 0,
            commission: 0,
            cleaningFees: 0,
            error: 'Failed to fetch data'
          };
        }
      })
    );
    
    // Calculate portfolio totals
    const totals = portfolioData.reduce((acc, property) => ({
      totalRevenue: acc.totalRevenue + property.totalRevenue,
      totalNetPayout: acc.totalNetPayout + property.netPayout,
      totalBookings: acc.totalBookings + property.bookingCount,
      totalTouristTax: acc.totalTouristTax + property.touristTax,
      totalCommission: acc.totalCommission + property.commission,
      totalCleaningFees: acc.totalCleaningFees + property.cleaningFees
    }), {
      totalRevenue: 0,
      totalNetPayout: 0,
      totalBookings: 0,
      totalTouristTax: 0,
      totalCommission: 0,
      totalCleaningFees: 0
    });
    
    // Calculate portfolio averages
    const validProperties = portfolioData.filter(p => !p.error);
    const averageOccupancy = validProperties.length > 0 
      ? validProperties.reduce((sum, p) => sum + p.occupancyRate, 0) / validProperties.length 
      : 0;
    const averageADR = validProperties.length > 0 
      ? validProperties.reduce((sum, p) => sum + p.adr, 0) / validProperties.length 
      : 0;
    
    return {
      month,
      properties: portfolioData,
      portfolioTotals: totals,
      portfolioAverages: {
        averageOccupancy: Math.round(averageOccupancy * 10) / 10,
        averageADR: Math.round(averageADR * 100) / 100
      },
      summary: {
        totalProperties: propertyIds.length,
        activeProperties: validProperties.length,
        totalRevenue: totals.totalRevenue,
        totalNetPayout: totals.totalNetPayout,
        averageOccupancy: Math.round(averageOccupancy * 10) / 10,
        averageADR: Math.round(averageADR * 100) / 100
      }
    };
  } catch (error: any) {
    throw new Error(`Portfolio overview failed: ${error.message}`);
  }
};

export const getPortfolioTrends = async (propertyIds: number[], months: string[]) => {
  try {
    const trendsData = await Promise.all(
      months.map(async (month) => {
        const portfolioData = await getPortfolioOverview(propertyIds, month);
        return {
          month,
          totalRevenue: portfolioData.portfolioTotals.totalRevenue,
          totalBookings: portfolioData.portfolioTotals.totalBookings,
          averageOccupancy: portfolioData.portfolioAverages.averageOccupancy,
          averageADR: portfolioData.portfolioAverages.averageADR
        };
      })
    );
    
    return {
      trends: trendsData,
      summary: {
        monthsAnalyzed: months.length,
        totalProperties: propertyIds.length,
        revenueGrowth: trendsData.length > 1 
          ? ((trendsData[trendsData.length - 1].totalRevenue - trendsData[0].totalRevenue) / trendsData[0].totalRevenue * 100)
          : 0,
        occupancyGrowth: trendsData.length > 1 
          ? (trendsData[trendsData.length - 1].averageOccupancy - trendsData[0].averageOccupancy)
          : 0
      }
    };
  } catch (error: any) {
    throw new Error(`Portfolio trends failed: ${error.message}`);
  }
};






