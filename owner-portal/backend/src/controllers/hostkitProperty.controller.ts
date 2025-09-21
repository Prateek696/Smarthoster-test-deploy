import { Request, Response } from "express";
import { getPropertyService } from "../services/hostkitProperty.service";

export const getProperty = async (req: Request, res: Response) => {
  try {
    const propertyId = req.params.propertyId;

    // Validate input
    if (!propertyId) {
      return res.status(400).json({ 
        message: "Missing required parameter: propertyId" 
      });
    }

    const result = await getPropertyService({
      propertyId
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Property retrieval error:', error);
    res.status(500).json({ 
      message: error.message || "Property retrieval failed" 
    });
  }
};



