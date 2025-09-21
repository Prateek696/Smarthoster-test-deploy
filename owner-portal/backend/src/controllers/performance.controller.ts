import { Request, Response } from "express";
import { getMonthlyPerformanceService } from "../services/performance.service";

export const getPerformance = async (req: Request, res: Response) => {
  const listingId = parseInt(req.params.listingId);
  const { month } = req.query as { month?: string };

  if (!month) {
    return res.status(400).json({ message: "Missing month query parameter" });
  }

  try {
    const performance = await getMonthlyPerformanceService(listingId, month);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching monthly performance" });
  }
};


