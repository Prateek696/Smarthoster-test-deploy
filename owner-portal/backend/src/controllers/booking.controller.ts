import { Request, Response } from "express";
import {
  getCalendarService,
  updateCalendarService,
  getBookingsService,
  getBookingDetailService,
} from "../services/booking.service";

export const getCalendar = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { startDate, endDate } = req.query as { startDate: string; endDate: string };
  try {
    const calendar = await getCalendarService(listingId, startDate, endDate);
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ message: "Error fetching calendar" });
  }
};

export const updateCalendar = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { startDate, endDate, status } = req.body;
  try {
    const result = await updateCalendarService(listingId, startDate, endDate, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating calendar" });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { dateStart, dateEnd } = req.query as { dateStart: string; dateEnd: string };
  try {
    const bookings = await getBookingsService(listingId, dateStart, dateEnd);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error fetching bookings",
      error: error.message,
      propertyId: listingId
    });
  }
};

export const getBookingDetail = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { propertyId } = req.query as { propertyId: string };
  
  try {
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }
    
    const listingId = parseInt(propertyId);
    const booking = await getBookingDetailService(listingId, bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error fetching booking details",
      error: error.message,
      bookingId
    });
  }
};

export const getBookingsDebug = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { dateStart, dateEnd } = req.query as { dateStart: string; dateEnd: string };
  try {
    // Import the API function here to get raw data
    const { getHostawayReservations } = require("../integrations/hostaway.api");
    const rawData = await getHostawayReservations(listingId, dateStart || "2025-07-01", dateEnd || "2025-07-31");
    
    const debugInfo = {
      listingId,
      dateRange: { dateStart: dateStart || "2025-07-01", dateEnd: dateEnd || "2025-07-31" },
      rawApiResponse: rawData,
      firstBookingFields: rawData?.result?.[0] ? Object.keys(rawData.result[0]) : [],
      firstBookingSample: rawData?.result?.[0] || null,
      emailFieldAnalysis: {
        guestEmail: rawData?.result?.[0]?.guestEmail || "NOT_FOUND",
        guestEmailStatus: rawData?.result?.[0]?.guestEmail === null ? "NULL" : rawData?.result?.[0]?.guestEmail === "" ? "EMPTY" : "HAS_VALUE"
      },
      totalCount: rawData?.result?.length || 0
    };
    
    res.json(debugInfo);
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      listingId,
      dateRange: { dateStart, dateEnd }
    });
  }
};

export const debugPropertyApiKeys = async (req: Request, res: Response) => {
  try {
    const { getHostkitApiKey, getHostkitId } = require("../utils/propertyApiKey");
    const { env } = require("../config/env");
    
    const propertyId = parseInt(req.params.propertyId) || 392782;
    
    // Test API key retrieval
    const hostkitId = await getHostkitId(propertyId);
    const apiKey = await getHostkitApiKey(propertyId);
    
    // Test all configured API keys
    const allApiKeys = {
      "10027": env.hostkit.apiKeys["10027"] ? "SET" : "NOT SET",
      "10028": env.hostkit.apiKeys["10028"] ? "SET" : "NOT SET", 
      "10029": env.hostkit.apiKeys["10029"] ? "SET" : "NOT SET",
      "10030": env.hostkit.apiKeys["10030"] ? "SET" : "NOT SET",
      "10031": env.hostkit.apiKeys["10031"] ? "SET" : "NOT SET",
      "10032": env.hostkit.apiKeys["10032"] ? "SET" : "NOT SET",
      "12602": env.hostkit.apiKeys["12602"] ? "SET" : "NOT SET"
    };
    
    const debugInfo = {
      propertyId,
      hostkitId,
      apiKeyStatus: apiKey ? "SET" : "NOT SET",
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 8) + "..." : "N/A",
      allApiKeysStatus: allApiKeys,
      envCheck: {
        hasHostkitUrl: !!env.hostkit.apiUrl,
        hostawayAccountId: env.hostaway.accountId ? "SET" : "NOT SET",
        hostawayToken: env.hostaway.token ? "SET" : "NOT SET"
      }
    };
    
    res.json(debugInfo);
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
};

export const listHostawayProperties = async (req: Request, res: Response) => {
  try {
    const axios = require('axios');
    const { env } = require("../config/env");
    
    // Get all properties from Hostaway
    const response = await axios.get('https://api.hostaway.com/v1/listings', {
      headers: {
        'Authorization': `Bearer ${env.hostaway.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const properties = response.data.result || [];
    
    const debugInfo = {
      totalProperties: properties.length,
      availablePropertyIds: properties.map((prop: any) => ({
        id: prop.id,
        name: prop.name || prop.internalListingName || prop.externalListingName,
        address: prop.address?.full || 'No address',
        status: prop.status
      })),
      configuredPropertyIds: [392776, 392777, 392778, 392779, 392780, 392781, 392782],
      missingProperties: [392776, 392777, 392778, 392779, 392780, 392781, 392782].filter(id => 
        !properties.find((prop: any) => prop.id === id)
      ),
      envCheck: {
        hostawayToken: env.hostaway.token ? `SET (${env.hostaway.token.substring(0, 10)}...)` : "NOT SET",
        hostawayAccountId: env.hostaway.accountId || "NOT SET"
      }
    };
    
    res.json(debugInfo);
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      statusCode: error.response?.status,
      statusText: error.response?.statusText
    });
  }
};