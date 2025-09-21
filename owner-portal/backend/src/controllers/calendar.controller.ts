import { Request, Response } from "express";
import { 
  getCalendarService, 
  updateCalendarService, 
  getBookingsService 
} from "../services/booking.service";
import { 
  getHostawayCalendarDate, 
  updateHostawayPricing, 
  updateHostawayMinimumStay,
  getHostawayCalendarMonth,
  updateHostawayCalendarAvailability,
  getHostawayDailyCalendar
} from "../integrations/hostaway.api";
import { getReservations } from "../integrations/hostkit.api";
import { sendBlockUnblockNotification } from "../services/notification.service";

// Get bookings + blocked dates for a property
export const getCalendar = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    if (!listingId) {
      return res.status(400).json({ message: "Missing listingId parameter" });
    }

    const calendar = await getCalendarService(listingId, startDate, endDate);
    res.json(calendar);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch calendar data" });
  }
};

// Update calendar (block/unblock dates)
export const updateCalendar = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate, status } = req.body;

    if (!listingId || !startDate || !endDate || !status) {
      return res.status(400).json({ 
        message: "listingId, startDate, endDate, and status are required" 
      });
    }

    if (!["blocked", "available"].includes(status)) {
      return res.status(400).json({ 
        message: "Status must be either 'blocked' or 'available'" 
      });
    }

    const result = await updateCalendarService(listingId, startDate, endDate, status);
    
    // Send notification email
    try {
      await sendBlockUnblockNotification(listingId, startDate, endDate, status);
    } catch (emailError) {
      // Don't fail the request if email fails
      console.warn('Email notification failed:', emailError);
    }

    res.json({ 
      message: `Dates ${status} successfully`, 
      data: result 
    });
  } catch (error: any) {
    console.error('Calendar update error:', {
      error: error.message,
      listingId: req.params.listingId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to update calendar on Hostaway",
      error: error.message,
      details: "Please check your Hostaway API credentials and try again"
    });
  }
};

// Get bookings for a property
export const getBookings = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { dateStart, dateEnd } = req.query as { dateStart: string; dateEnd: string };

    if (!listingId) {
      return res.status(400).json({ message: "Missing listingId parameter" });
    }

    const bookings = await getBookingsService(listingId, dateStart, dateEnd);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

// Get calendar date data with pricing and minimum nights
export const getCalendarDate = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const date = req.params.date;

    if (!listingId || !date) {
      return res.status(400).json({ message: "Missing listingId or date parameter" });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD" });
    }

    const calendarData = await getHostawayCalendarDate(listingId, date);
    
    // Extract relevant data from Hostaway response
    const result = {
      date,
      listingId,
      status: calendarData.data?.[0]?.status || 'available',
      price: calendarData.data?.[0]?.price || null,
      minimumStay: calendarData.data?.[0]?.minimumStay || null,
      checkInAvailable: calendarData.data?.[0]?.checkInAvailable ?? true,
      checkOutAvailable: calendarData.data?.[0]?.checkOutAvailable ?? true,
      reason: calendarData.data?.[0]?.reason || null,
      description: calendarData.data?.[0]?.description || null,
      rawData: calendarData.data?.[0] || null
    };

    res.json(result);
  } catch (error: any) {
    console.error('Calendar date fetch error:', {
      error: error.message,
      listingId: req.params.listingId,
      date: req.params.date,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to fetch calendar date data",
      error: error.message
    });
  }
};

// Update pricing for specific dates
export const updateCalendarPricing = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate, price } = req.body;

    if (!listingId || !startDate || !endDate || price === undefined) {
      return res.status(400).json({ 
        message: "listingId, startDate, endDate, and price are required" 
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ 
        message: "Price must be a positive number" 
      });
    }

    const result = await updateHostawayPricing(listingId, startDate, endDate, price);
    
    res.json({ 
      message: `Pricing updated successfully to €${price}`, 
      data: result 
    });
  } catch (error: any) {
    console.error('Calendar pricing update error:', {
      error: error.message,
      listingId: req.params.listingId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      price: req.body.price,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to update pricing on Hostaway",
      error: error.message
    });
  }
};

// Update minimum stay for specific dates
export const updateCalendarMinimumStay = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const { startDate, endDate, minimumStay } = req.body;

    if (!listingId || !startDate || !endDate || minimumStay === undefined) {
      return res.status(400).json({ 
        message: "listingId, startDate, endDate, and minimumStay are required" 
      });
    }

    if (typeof minimumStay !== 'number' || minimumStay < 1) {
      return res.status(400).json({ 
        message: "Minimum stay must be a positive number (at least 1)" 
      });
    }

    const result = await updateHostawayMinimumStay(listingId, startDate, endDate, minimumStay);
    
    res.json({ 
      message: `Minimum stay updated successfully to ${minimumStay} nights`, 
      data: result 
    });
  } catch (error: any) {
    console.error('Calendar minimum stay update error:', {
      error: error.message,
      listingId: req.params.listingId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      minimumStay: req.body.minimumStay,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to update minimum stay on Hostaway",
      error: error.message
    });
  }
};

// Get monthly pricing data for calendar display
export const getCalendarMonthPricing = async (req: Request, res: Response) => {
  try {
    const listingId = parseInt(req.params.listingId);
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (!listingId || !year || month === undefined) {
      return res.status(400).json({ message: "Missing listingId, year, or month parameter" });
    }

    // Validate month (0-11 for JavaScript Date)
    if (month < 0 || month > 11) {
      return res.status(400).json({ message: "Invalid month. Use 0-11 (0=January, 11=December)" });
    }

    // Calculate start and end dates for the month
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    console.log('Fetching real-time calendar data from Hostaway:', {
      listingId,
      year,
      month,
      startDate,
      endDate
    });

    // Use the correct Hostaway API endpoint for daily calendar data
    const calendarData = await getHostawayDailyCalendar(listingId, startDate, endDate);
    
    // Process the data to extract pricing and minimum stay for each date
    const pricingData: {[key: string]: {price: number, minimumStay: number, status: string}} = {};
    
    if (calendarData.result && Array.isArray(calendarData.result)) {
      console.log('Processing Hostaway data, total days:', calendarData.result.length);
      console.log('First few dates from Hostaway:', calendarData.result.slice(0, 3).map(d => d.date));
      console.log('Last few dates from Hostaway:', calendarData.result.slice(-3).map(d => d.date));
      
      calendarData.result.forEach((dayData: any) => {
        if (dayData.date) {
          // Use the actual status from Hostaway (available, reserved, blocked)
          let status = 'available';
          if (dayData.status === 'reserved') {
            status = 'reserved';
          } else if (dayData.status === 'blocked' || dayData.isAvailable === 0) {
            status = 'blocked';
          }
          
          pricingData[dayData.date] = {
            price: dayData.price || 0,
            minimumStay: dayData.minimumStay || 1,
            status: status
          };
          
          if (dayData.date === '2025-10-31') {
            console.log('Found October 31st in Hostaway data:', dayData);
          }
        }
      });
    }

    // Fill in missing dates with default data (for dates not returned by Hostaway)
    const lastDay = new Date(year, month + 1, 0).getDate();
    console.log(`Checking for missing dates from day 1 to ${lastDay}`);
    
    for (let day = 1; day <= lastDay; day++) {
      // Use string formatting to avoid timezone issues
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      if (!pricingData[dateStr]) {
        console.log(`Adding fallback data for missing date: ${dateStr}`);
        pricingData[dateStr] = {
          price: 289, // Default price
          minimumStay: 2, // Default minimum stay
          status: 'available'
        };
      } else {
        console.log(`Date ${dateStr} already has data:`, pricingData[dateStr]);
      }
    }
    
    console.log(`Final pricing data has ${Object.keys(pricingData).length} days`);
    console.log('Last few dates in final data:', Object.keys(pricingData).sort().slice(-5));
    
    console.log('Processed pricing data:', {
      totalDays: Object.keys(pricingData).length,
      sampleData: Object.keys(pricingData).slice(0, 3).map(date => ({
        date,
        ...pricingData[date]
      }))
    });

    res.json({
      listingId,
      year,
      month,
      pricingData,
      rawData: calendarData.result || []
    });
  } catch (error: any) {
    console.error('Calendar month pricing fetch error:', {
      error: error.message,
      listingId: req.params.listingId,
      year: req.params.year,
      month: req.params.month,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to fetch monthly pricing data",
      error: error.message
    });
  }
};

// Block/Unblock dates via Hostaway API
export const updateCalendarAvailability = async (req: Request, res: Response) => {
  try {
    const { listingId, startDate, endDate, isAvailable } = req.body;

    // Validate required fields
    if (!listingId || !startDate || !endDate || isAvailable === undefined) {
      return res.status(400).json({ 
        message: "Missing required fields: listingId, startDate, endDate, isAvailable" 
      });
    }

    // Validate isAvailable (0 = Block, 1 = Unblock)
    if (isAvailable !== 0 && isAvailable !== 1) {
      return res.status(400).json({ 
        message: "isAvailable must be 0 (block) or 1 (unblock)" 
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        message: "Dates must be in YYYY-MM-DD format" 
      });
    }

    // Validate that startDate is not after endDate
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ 
        message: "startDate cannot be after endDate" 
      });
    }

    console.log('Updating calendar availability:', {
      listingId,
      startDate,
      endDate,
      isAvailable: isAvailable === 1 ? 'unblock' : 'block'
    });

    const result = await updateHostawayCalendarAvailability(listingId, startDate, endDate, isAvailable);
    
    const action = isAvailable === 1 ? 'unblocked' : 'blocked';
    res.json({ 
      message: `Dates ${action} successfully`,
      data: result,
      action: action,
      dateRange: `${startDate} to ${endDate}`
    });
  } catch (error: any) {
    console.error('Calendar availability update error:', {
      error: error.message,
      listingId: req.body.listingId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      isAvailable: req.body.isAvailable,
      stack: error.stack
    });
    res.status(500).json({ 
      message: "Failed to update calendar availability on Hostaway",
      error: error.message
    });
  }
};
