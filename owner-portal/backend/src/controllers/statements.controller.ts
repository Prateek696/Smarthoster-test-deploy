import { Request, Response } from 'express';
import { generateStatement } from '../services/statements.service';

export async function generateStatementHandler(req: Request, res: Response) {
  const propertyId = Number(req.params.propertyId);
  const { year, month, propertyName } = req.body;

  if (!propertyId || !year || !month) {
    return res.status(400).json({ error: 'Missing parameters. Required: propertyId (param), year, month (body).' });
  }

  try {
    const result = await generateStatement(propertyId, Number(year), Number(month), { propertyName });
    res.status(201).json({
      message: 'Statement generated successfully',
      pdfFilename: result.pdfFilename,
      csvFilename: result.csvFilename,
    });
  } catch (error) {
    console.error('Statement generation failed:', error);
    res.status(500).json({ error: 'Failed to generate statement' });
  }
}
