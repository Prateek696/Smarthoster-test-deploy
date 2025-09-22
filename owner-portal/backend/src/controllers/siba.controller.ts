import { Request, Response } from "express";
import { 
  getSibaStatusService, 
  sendSibaService, 
  validateSibaService,
  bulkSibaStatusService,
  getSibaLogsService 
} from "../services/siba.service";

export const getSibaStatus = async (req: Request, res: Response) => {
  const propertyId = parseInt(req.params.propertyId);

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  try {
    const result = await getSibaStatusService(propertyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error fetching SIBA status", 
      error: error.message 
    });
  }
};

export const sendSiba = async (req: Request, res: Response) => {
  const propertyId = parseInt(req.params.propertyId);
  const { reservationId } = req.body;

  if (!propertyId || !reservationId) {
    return res.status(400).json({ 
      message: "Property ID and Reservation ID are required" 
    });
  }

  try {
    const result = await sendSibaService(reservationId, propertyId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error sending SIBA", 
      error: error.message 
    });
  }
};

export const validateSiba = async (req: Request, res: Response) => {
  const { reservationId } = req.params;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required" });
  }

  try {
    const result = await validateSibaService(parseInt(reservationId));
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error validating SIBA", 
      error: error.message 
    });
  }
};

export const getBulkSibaStatus = async (req: Request, res: Response) => {
  const { propertyIds } = req.body;

  if (!propertyIds || !Array.isArray(propertyIds)) {
    return res.status(400).json({ 
      message: "Property IDs array is required" 
    });
  }

  try {
    const results = await bulkSibaStatusService(propertyIds);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error fetching bulk SIBA status", 
      error: error.message 
    });
  }
};

export const getSibaLogs = async (req: Request, res: Response) => {
  const { reservationId } = req.params;

  if (!reservationId) {
    return res.status(400).json({ message: "Reservation ID is required" });
  }

  try {
    const logs = await getSibaLogsService(parseInt(reservationId));
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error fetching SIBA logs", 
      error: error.message 
    });
  }
};

// Debug endpoint to test API connections
export const debugSibaApis = async (req: Request, res: Response) => {
  const propertyId = parseInt(req.params.propertyId);

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  try {
    const { getHostkitReservations } = await import("../integrations/hostkit.api");
    const { getHostawayReservations } = await import("../integrations/hostaway.api");
    
    const currentDate = new Date();
    const oneMonthAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
    const startDate = oneMonthAgo.toISOString().split('T')[0];
    const endDate = currentDate.toISOString().split('T')[0];

    // Testing API connections for debugging

    const debugResult: any = {
      propertyId,
      dateRange: { startDate, endDate },
      apis: {}
    };

    // Test Hostkit API
    try {
      const hostkitData = await getHostkitReservations(propertyId, startDate, endDate);
      debugResult.apis.hostkit = {
        success: true,
        dataType: Array.isArray(hostkitData) ? 'array' : typeof hostkitData,
        count: Array.isArray(hostkitData) ? hostkitData.length : 'not-array',
        sampleFields: Array.isArray(hostkitData) && hostkitData.length > 0 ? Object.keys(hostkitData[0]) : [],
        rawSample: Array.isArray(hostkitData) && hostkitData.length > 0 ? hostkitData[0] : null
      };
    } catch (hostkitError: any) {
      debugResult.apis.hostkit = {
        success: false,
        error: hostkitError.message,
        stack: hostkitError.stack
      };
    }

    // Test Hostaway API
    try {
      const hostawayData = await getHostawayReservations(propertyId, startDate, endDate);
      const reservations = hostawayData.result || [];
      debugResult.apis.hostaway = {
        success: true,
        dataType: typeof hostawayData,
        resultType: Array.isArray(hostawayData.result) ? 'array' : typeof hostawayData.result,
        count: Array.isArray(reservations) ? reservations.length : 'not-array',
        sampleFields: Array.isArray(reservations) && reservations.length > 0 ? Object.keys(reservations[0]) : [],
        rawSample: Array.isArray(reservations) && reservations.length > 0 ? reservations[0] : null
      };
    } catch (hostawayError: any) {
      debugResult.apis.hostaway = {
        success: false,
        error: hostawayError.message,
        stack: hostawayError.stack
      };
    }

    // Environment check
    debugResult.environment = {
      HOSTKIT_API_URL: process.env.HOSTKIT_API_URL || 'not-set',
      HOSTKIT_API_KEY: process.env.HOSTKIT_API_KEY ? 'set' : 'not-set',
      HOSTAWAY_API_BASE: process.env.HOSTAWAY_API_BASE || 'not-set',
      HOSTAWAY_API_KEY: process.env.HOSTAWAY_API_KEY ? 'set' : 'not-set'
    };

    res.json(debugResult);
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error debugging SIBA APIs", 
      error: error.message 
    });
  }
};
