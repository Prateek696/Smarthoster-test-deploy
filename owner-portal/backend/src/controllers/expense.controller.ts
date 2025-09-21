import { Request, Response } from 'express';
import { fetchExpenses } from '../services/expense.service';

export async function getExpenses(req: Request, res: Response) {
  const propertyId = Number(req.query.propertyId);
  const year = Number(req.query.year);
  const month = Number(req.query.month);
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  try {
    const expenses = await fetchExpenses(propertyId, year, month, startDate, endDate);
    res.json({ expenses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
}
