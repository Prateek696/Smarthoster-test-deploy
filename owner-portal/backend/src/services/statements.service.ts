import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { getInvoicesService } from '../services/invoice.service';
import { createStatementPDF, createStatementCSV, StatementData } from '../utils/statementBuilder';

const STATEMENT_DIR = path.join(process.cwd(), 'statements');
const HOSTKIT_API_URL = process.env.HOSTKIT_API_URL!;
const HOSTKIT_API_KEY = process.env.HOSTKIT_API_KEY!;

interface RawInvoice {
  id: string;
  name?: string;
  date?: string;
  value?: string; // gross value or subtotal
  vat?: string | number;
  total?: string | number;
  closed?: boolean;
  invoice_url?: string;
  guestName?: string;
}

interface InvoiceItem {
  id: string;
  date: string;
  guestName?: string;
  grossRevenue: number;
  vat: number;
  total: number;
  invoiceUrl?: string;
  closed?: boolean;
}

interface ExpenseItem {
  id: string;
  date: string;
  vendor: string;
  amount: number;
}

interface CommissionItem {
  id: string;
  date: string;
  amount: number;
}

function monthPad(n: number) {
  return n.toString().padStart(2, '0');
}

/**
 * Fetch invoices using existing getInvoicesService and normalize them.
 */
async function fetchInvoices(propertyId: number, year: number, month: number): Promise<InvoiceItem[]> {
  const startDate = `${year}-${monthPad(month)}-01`;
  const endDate = `${year}-${monthPad(month)}-31`;

  try {
    const invoicesRaw: RawInvoice[] = await getInvoicesService(propertyId, startDate, endDate) as RawInvoice[] || [];

    return invoicesRaw.map((inv) => {
      // DEBUG: Log raw invoice data to see what API provides
      console.log(`[VAT DEBUG] Raw invoice data:`, {
        id: inv.id,
        value: inv.value,
        vat: inv.vat,
        total: inv.total,
        taxLines: (inv as any).taxLines,
        taxes: (inv as any).taxes,
        allFields: Object.keys(inv)
      });

      const grossRevenue =
        typeof inv.value === 'string'
          ? parseFloat(inv.value || '0')
          : (inv.value as any) || 0;

      let vat = 0;
      let total = 0;

      // ✅ Case 1: API provides VAT directly
      if (inv.vat != null) {
        vat = parseFloat(String(inv.vat)) || 0;
      }

      // ✅ Case 2: API provides total
      if (inv.total != null) {
        total = parseFloat(String(inv.total)) || grossRevenue;
        // if VAT not given but total exists → compute from total
        if (vat === 0 && total > grossRevenue) {
          vat = total - grossRevenue;
        }
      }

      // ✅ Case 3: API provides tax lines
      if ((inv as any).taxLines || (inv as any).taxes) {
        const taxes = (inv as any).taxLines || (inv as any).taxes;
        vat = taxes.reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0);
        total = grossRevenue + vat;
      }

      // ✅ Case 4: fallback (room nights default 6%)
      if (vat === 0 && total === 0) {
        vat = grossRevenue * 0.06;
        total = grossRevenue + vat;
      }

      // Calculate actual VAT rate from API data
      const calculatedVatRate = grossRevenue > 0 ? (vat / grossRevenue) * 100 : 0;
      
      // DEBUG: Log calculated VAT rate
      console.log(`[VAT DEBUG] Calculated VAT rate:`, {
        invoiceId: inv.id,
        grossRevenue,
        vat,
        calculatedVatRate: calculatedVatRate.toFixed(2) + '%',
        total
      });

      return {
        id: String(inv.id),
        date: inv.date ?? '',
        guestName: inv.guestName ?? inv.name ?? 'Guest',
        grossRevenue: isNaN(grossRevenue) ? 0 : grossRevenue,
        vat: isNaN(vat) ? 0 : vat,
        total: isNaN(total) ? (grossRevenue + vat) : total,
        invoiceUrl: inv.invoice_url,
        closed: !!inv.closed,
      } as InvoiceItem;
    });
  } catch (err) {
    console.error('fetchInvoices error:', err);
    return [];
  }
}


/**
 * Fetch expenses if the Hostkit expenses module exists; otherwise returns [].
 * Endpoint path may vary depending on your Hostkit setup — update if needed.
 */
async function fetchExpenses(propertyId: number, year: number, month: number): Promise<ExpenseItem[]> {
  const startDate = `${year}-${monthPad(month)}-01`;
  const endDate = `${year}-${monthPad(month)}-31`;

  try {
    const url = `${HOSTKIT_API_URL.replace(/\/$/, '')}/expenses`;
    const { data } = await axios.get(url, {
      params: { propertyId, startDate, endDate },
      headers: {
        'X-Api-Key': HOSTKIT_API_KEY,
        Accept: 'application/json',
      },
      timeout: 10_000,
    });

    const expenses = data?.expenses || data || [];
    return (expenses || []).map((exp: any) => ({
      id: exp.expenseId ?? exp.id ?? String(Math.random()).slice(2),
      date: exp.dateIncurred ?? exp.date ?? '',
      vendor: exp.vendorName ?? exp.vendor ?? 'Unknown',
      amount: parseFloat(String(exp.amount ?? 0)) || 0,
    }));
  } catch (err: any) {
    // 404 or module not enabled — return empty and continue
    if (err?.response?.status === 404) {
      console.info('Expenses endpoint not found (ok if module not subscribed).');
      return [];
    }
    console.error('fetchExpenses error:', err?.message ?? err);
    return [];
  }
}

/**
 * Fetch commission invoices for the property/period.
 * The exact endpoint name might vary. Adjust path if your Hostkit uses a different route.
 */
async function fetchCommissions(propertyId: number, year: number, month: number): Promise<CommissionItem[]> {
  const startDate = `${year}-${monthPad(month)}-01`;
  const endDate = `${year}-${monthPad(month)}-31`;

  try {
    const url = `${HOSTKIT_API_URL.replace(/\/$/, '')}/commissions`;
    const { data } = await axios.get(url, {
      params: { propertyId, startDate, endDate },
      headers: {
        'X-Api-Key': HOSTKIT_API_KEY,
        Accept: 'application/json',
      },
      timeout: 10_000,
    });

    const commissions = data?.commissions || data || [];
    return (commissions || []).map((c: any) => ({
      id: c.commissionId ?? c.id ?? String(Math.random()).slice(2),
      date: c.date ?? c.emittedAt ?? '',
      amount: parseFloat(String(c.amount ?? c.total ?? 0)) || 0,
    }));
  } catch (err: any) {
    if (err?.response?.status === 404) {
      console.info('Commissions endpoint not found (ok until module emits invoices).');
      return [];
    }
    console.error('fetchCommissions error:', err?.message ?? err);
    return [];
  }
}

/**
 * Main exported function to generate the statement.
 * - fetches invoices, expenses, commissions
 * - computes totals
 * - builds PDF and CSV
 */
export async function generateStatement(propertyId: number, year: number, month: number, options?: { propertyName?: string }) {
  const invoices = await fetchInvoices(propertyId, year, month);
  const expenses = await fetchExpenses(propertyId, year, month);
  const commissions = await fetchCommissions(propertyId, year, month);

  console.log('Invoices fetched:', invoices.length);
  console.log('Expenses fetched:', expenses.length);
  console.log('Commissions fetched:', commissions.length);

  // Compute totals
  const gross = invoices.reduce((s, i) => s + (i.grossRevenue || 0), 0);
  const vat = invoices.reduce((s, i) => s + (i.vat || 0), 0);
  const invoicedTotal = invoices.reduce((s, i) => s + (i.total || (i.grossRevenue + (i.vat || 0))), 0);
  const expensesTotal = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const commissionsTotal = commissions.reduce((s, c) => s + (c.amount || 0), 0);
  const netPayout = invoicedTotal - commissionsTotal - expensesTotal;

  const period = `${year}-${monthPad(month)}`;

  const statementData: StatementData = {
    propertyId,
    propertyName: options?.propertyName,
    period,
    invoices,
    expenses,
    commissions,
    summary: {
      gross,
      vat,
      invoicedTotal,
      expensesTotal,
      commissionsTotal,
      netPayout,
    },
  };

  // Build files
  const pdfBuffer = await createStatementPDF(statementData);
  const csvString = createStatementCSV(statementData);

  await fs.mkdir(STATEMENT_DIR, { recursive: true });

  const pdfFilename = `statement_${propertyId}_${year}_${monthPad(month)}.pdf`;
  const csvFilename = `statement_${propertyId}_${year}_${monthPad(month)}.csv`;
  const pdfFilePath = path.join(STATEMENT_DIR, pdfFilename);
  const csvFilePath = path.join(STATEMENT_DIR, csvFilename);

  try {
    await fs.writeFile(pdfFilePath, pdfBuffer);
    await fs.writeFile(csvFilePath, csvString, 'utf8');
    console.log('Files written successfully:', pdfFilePath, csvFilePath);
  } catch (err) {
    console.error('Error writing statement files:', err);
    throw err;
  }

  return { pdfFilename, csvFilename, pdfFilePath, csvFilePath };
}
