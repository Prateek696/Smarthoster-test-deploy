import { Request, Response } from "express";
import { getSaftService } from "../services/saft.service";
import Property from "../models/property.model";

export const getSaft = async (req: Request, res: Response) => {
  try {
    const { year, month, invoicing_nif } = req.query;

    // Validate input
    if (!year || !month || !invoicing_nif) {
      return res.status(400).json({ 
        message: "Missing required parameters: year, month, invoicing_nif" 
      });
    }

    // Get the first available property with Hostkit configuration
    const property = await Property.findOne({ 
      hostkitId: { $exists: true, $ne: null },
      hostkitApiKey: { $exists: true, $ne: null }
    });

    if (!property) {
      return res.status(400).json({ 
        message: "No property with Hostkit configuration found" 
      });
    }

    const result = await getSaftService({
      propertyId: property.id.toString(),
      year: parseInt(year as string),
      month: parseInt(month as string),
      invoicingNif: invoicing_nif as string
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('SAFT retrieval error:', error);
    res.status(500).json({ 
      message: error.message || "SAFT retrieval failed" 
    });
  }
};
