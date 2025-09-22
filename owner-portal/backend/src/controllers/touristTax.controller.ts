import { Request, Response } from "express";
import { getCityTaxService, getTouristTaxDetailedService } from "../services/touristTax.service";
import { getChannelBookings, getHostkitReservations } from "../integrations/hostkit.api";

export const getCityTax = async (req: Request, res: Response) => {
  const propertyId = parseInt(req.params.propertyId);
  const { startDate, endDate, filterType } = req.query as { 
    startDate?: string; 
    endDate?: string; 
    filterType?: 'checkin' | 'checkout';
  };

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required" });
  }

  try {
    const cityTaxData = await getCityTaxService(propertyId, startDate, endDate, filterType || 'checkin');
    res.json(cityTaxData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching city tax data." });
  }
};

export const getAllPropertiesCityTax = async (req: Request, res: Response) => {
  const { startDate, endDate, filterType } = req.query as { 
    startDate?: string; 
    endDate?: string; 
    filterType?: 'checkin' | 'checkout';
  };

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required" });
  }

  try {
    // Get all properties from the mapping
    const PROPERTY_ID_MAPPING: { [key: number]: string } = {
      392776: "10026", // Piece of Heaven
      392777: "10027", // Lote 16 Pt 1 3-B
      392778: "10028", // Lote 8 4-B
      392779: "10029", // Lote 12 4-A
      392780: "10030", // Lote 16 Pt1 4-B
      392781: "10031", // Lote 7 3-A
      414661: "10032"  // Waterfront Pool Penthouse View
    };

    const allPropertiesData = [];
    
    for (const [propertyId, hostkitApid] of Object.entries(PROPERTY_ID_MAPPING)) {
      try {
        const cityTaxData = await getCityTaxService(parseInt(propertyId), startDate, endDate, filterType || 'checkin');
        allPropertiesData.push({
          hostkitApid,
          ...cityTaxData
        });
      } catch (error) {
        console.error(`Error fetching data for property ${propertyId}:`, error);
        // Add error entry for this property
        allPropertiesData.push({
          propertyId: parseInt(propertyId),
          hostkitApid,
          error: 'Failed to fetch data',
          cityTaxNights: 0,
          childrenNights: 0,
          totalNights: 0,
          totalBookings: 0,
          totalGuests: 0
        });
      }
    }

    res.json({
      startDate,
      endDate,
      filterType: filterType || 'checkin',
      properties: allPropertiesData,
      totals: {
        totalCityTaxNights: allPropertiesData.reduce((sum, p) => sum + (p.cityTaxNights || 0), 0),
        totalChildrenNights: allPropertiesData.reduce((sum, p) => sum + (p.childrenNights || 0), 0),
        totalNights: allPropertiesData.reduce((sum, p) => sum + ((p as any).hostkitTotalNights || 0), 0),
        totalBookings: allPropertiesData.reduce((sum, p) => sum + (p.totalBookings || 0), 0),
        totalGuests: allPropertiesData.reduce((sum, p) => sum + (p.totalGuests || 0), 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all properties city tax data." });
  }
};

export const getTouristTaxDetailed = async (req: Request, res: Response) => {
  const propertyId = parseInt(req.params.propertyId);
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  if (!startDate || !endDate) {
    return res.status(400).json({ message: "startDate and endDate are required" });
  }

  try {
    const detailedTax = await getTouristTaxDetailedService(propertyId, startDate, endDate);
    res.json(detailedTax);
  } catch (error) {
    res.status(500).json({ message: "Error fetching detailed tourist tax." });
  }
};

// Debug endpoint to test raw booking data
export const debugTouristTax = async (req: Request, res: Response) => {
  const propertyId = parseInt(req.params.propertyId);
  const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

  // Test with different date ranges
  const testRanges = [
    { name: "provided", start: startDate || "2025-07-01", end: endDate || "2025-07-31" },
    { name: "current_year", start: "2024-01-01", end: "2024-12-31" },
    { name: "last_30_days", start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
    { name: "recent_past", start: "2024-07-01", end: "2024-07-31" }
  ];

  const results: any = {
    propertyId,
    environment: {
      HOSTKIT_API_URL: process.env.HOSTKIT_API_URL || 'NOT SET',
      HOSTKIT_API_KEY: process.env.HOSTKIT_API_KEY ? 'SET' : 'NOT SET',
      HOSTAWAY_ACCOUNT_ID: process.env.HOSTAWAY_ACCOUNT_ID ? 'SET' : 'NOT SET'
    },
    testResults: {}
  };

  for (const range of testRanges) {
    try {
      console.log(`[DEBUG] Testing tourist tax for ${range.name}: ${range.start} to ${range.end}`);
      console.log(`[DEBUG] Property ID: ${propertyId}`);
      
      // Test both APIs to compare
      let reservationsData: any[] = [];
      let bookingsData: any[] = [];
      let reservationsError: string | null = null;
      let bookingsError: string | null = null;
      
      // Test reservations API (working for SIBA/invoices)
      try {
        const reservationsResponse = await getHostkitReservations(propertyId, range.start, range.end);
        reservationsData = Array.isArray(reservationsResponse) ? reservationsResponse : reservationsResponse.reservations || [];
        
        // Analyze the data to see if it's actually filtered
        const propertyAnalysis: { [key: string]: number } = {};
        const dateAnalysis: { [key: string]: number } = {};
        
        reservationsData.forEach((reservation: any) => {
          // Check property distribution
          const propId = reservation.apid || reservation.property_id || reservation.listing_id || 'unknown';
          propertyAnalysis[propId] = (propertyAnalysis[propId] || 0) + 1;
          
          // Check date distribution
          let reservationDate = 'unknown';
          if (reservation.in_date) {
            reservationDate = new Date(reservation.in_date * 1000).toISOString().split('T')[0];
          } else if (reservation.arrivalDate) {
            reservationDate = reservation.arrivalDate;
          }
          dateAnalysis[reservationDate] = (dateAnalysis[reservationDate] || 0) + 1;
        });
        
        results.testResults[range.name] = {
          ...results.testResults[range.name],
          reservationsAnalysis: {
            totalCount: reservationsData.length,
            propertyDistribution: propertyAnalysis,
            dateDistribution: Object.keys(dateAnalysis).slice(0, 5), // First 5 dates
            requestedProperty: propertyId,
            requestedDateRange: `${range.start} to ${range.end}`,
            isProperlyFiltered: {
              byProperty: Object.keys(propertyAnalysis).length === 1 && Object.keys(propertyAnalysis)[0] === propertyId.toString(),
              byDate: Object.keys(dateAnalysis).every(date => date >= range.start && date <= range.end)
            }
          }
        };
        
      } catch (err: any) {
        reservationsError = err.message;
      }
      
      // Test bookings API
      try {
        const bookingsResponse = await getChannelBookings(propertyId, range.start, range.end);
        bookingsData = Array.isArray(bookingsResponse) ? bookingsResponse : bookingsResponse.bookings || [];
      } catch (err: any) {
        bookingsError = err.message;
      }
      
      results.testResults[range.name] = {
        dateRange: { startDate: range.start, endDate: range.end },
        
        // Reservations API (working for SIBA)
        reservationsAPI: {
          count: reservationsData.length,
          type: typeof reservationsData,
          isArray: Array.isArray(reservationsData),
          sampleReservation: reservationsData.length > 0 ? reservationsData[0] : null,
          error: reservationsError
        },
        
        // Bookings API (problematic)
        bookingsAPI: {
          count: bookingsData.length,
          type: typeof bookingsData,
          isArray: Array.isArray(bookingsData),
          sampleBooking: bookingsData.length > 0 ? bookingsData[0] : null,
          error: bookingsError
        },
        
        // Which API has data?
        dataSource: reservationsData.length > 0 ? 'reservations' : (bookingsData.length > 0 ? 'bookings' : 'none')
      };
      
      // Test service
      try {
        const serviceResult = await getCityTaxService(propertyId, range.start, range.end);
        results.testResults[range.name].serviceResult = serviceResult;
      } catch (serviceError: any) {
        results.testResults[range.name].serviceError = serviceError.message;
      }
      
    } catch (error: any) {
      results.testResults[range.name] = {
        dateRange: { startDate: range.start, endDate: range.end },
        error: error.message,
        errorCode: error.code,
        errorStatus: error.response?.status
      };
    }
  }

  res.json(results);
};
