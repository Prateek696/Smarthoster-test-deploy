import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getProperties } from '../services/properties.api';
import { apiClient } from '../services/apiClient';
import { Calendar, Download, Calculator, Euro, Users, FileText } from 'lucide-react';
import { RootState } from '../store';

interface Property {
  id: number;
  name: string;
  address: string;
}

interface OwnerStatement {
  id: string;
  propertyId: number;
  propertyName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    grossRevenue: number;
    netRevenue: number;
    vat: number;
  };
  expenses: {
    total: number;
    commission: number;
    fees: number;
    other: number;
    status?: 'available' | 'coming_soon';
  };
  reservations: any[];
  invoices: any[];
  netPayout: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid';
  createdAt: string;
  updatedAt: string;
  attachments?: string[];
  invoiceDetails?: {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalAmount: number;
  };
}

const OwnerStatements: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [statements, setStatements] = useState<OwnerStatement[] | null>(null);

  // Set default dates (last month)
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based (0=Jan, 1=Feb, etc.)
    
    // Calculate previous month
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;
    
    // Handle year rollover (if current month is January, previous month is December of last year)
    if (previousMonth < 0) {
      previousMonth = 11; // December
      previousYear = currentYear - 1;
    }
    
    // First day of previous month
    const firstDay = new Date(previousYear, previousMonth, 1);
    
    // Last day of previous month - use a more reliable approach
    const lastDay = new Date(previousYear, previousMonth + 1, 0);
    
    // Format dates to avoid timezone issues
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
  }, []);

  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getProperties();
        setProperties(response.properties || []);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to fetch properties');
      }
    };

    fetchProperties();
  }, []);

  const generateStatements = async () => {
    if (!selectedProperty || !startDate || !endDate) {
      setError('Please select property and date range');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const params = {
        startDate,
        endDate,
        year: new Date(startDate).getFullYear().toString(),
        month: (new Date(startDate).getMonth() + 1).toString(),
        commissionPercentage: commissionPercentage.toString()
      };

      const data = await apiClient.get(`/owner-statements/property/${selectedProperty}`, { params });
      console.log('API Response:', data);
      setStatements(data);
    } catch (error) {
      console.error('Error generating statements:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate statements');
    } finally {
      setLoading(false);
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-EU');
  };

  const downloadStatements = () => {
    if (!statements || statements.length === 0) return;

    const statement = statements[0];
    
    // Calculate detailed breakdown
    const grossAmount = statement.revenue.total;
    const portalCommission = grossAmount * 0.15; // 15% portal commission
    const cleaningFee = statement.expenses.fees; // From reservation data (varies by property)
    const managementCommission = statement.expenses.commission; // From backend calculation (25% of Gross - Cleaning Fee)
    const finalOwnerAmount = grossAmount - portalCommission - cleaningFee - managementCommission;
    
    const csvContent = [
      // Header
      ['OWNER STATEMENT DETAILED BREAKDOWN'],
      ['Property ID', 'Property Name', 'Period', 'Generated At'],
      [statement.propertyId.toString(), statement.propertyName, `${statement.period.startDate} to ${statement.period.endDate}`, new Date(statement.createdAt).toLocaleString()],
      [],
      
      // Summary Calculations
      ['CALCULATION SUMMARY'],
      ['Gross Amount (sum of all invoices)', formatCurrency(grossAmount)],
      ['Portal Commission (15% of gross)', formatCurrency(portalCommission)],
      ['Cleaning Fee (from reservation API)', formatCurrency(cleaningFee)],
      ['Management Commission (25% of gross-cleaning)', formatCurrency(managementCommission)],
      ['Final Amount to Owner', formatCurrency(finalOwnerAmount)],
      [],
      
      // Reservation Details
      ['RESERVATION BREAKDOWN'],
      ['Reservation Code', 'Guest Name', 'Check-in', 'Check-out', 'Received Amount', 'Host Commission', 'Cleaning Fee', 'Invoiced Value', 'Provider'],
      ...statement.reservations.map((res: any) => [
        res.rcode,
        `${res.firstname} ${res.lastname}`,
        formatDate(new Date(parseInt(res.arrival) * 1000).toISOString()),
        formatDate(new Date(parseInt(res.departure) * 1000).toISOString()),
        formatCurrency(res.received_amount),
        formatCurrency(res.host_commission),
        formatCurrency(res.cleaning_fee), // Actual cleaning fee from reservation data
        formatCurrency(res.invoiced_value),
        res.provider
      ]),
      [],
      
      // Invoice Details (if available)
      ['INVOICE BREAKDOWN'],
      ['Invoice ID', 'Invoice Date', 'Invoice Value', 'Status', 'Type'],
      ...(statement.invoices && statement.invoices.length > 0 ? 
        statement.invoices.map((inv: any) => [
          inv.id || inv.refid || 'N/A',
          inv.date ? formatDate(inv.date) : 'N/A',
          formatCurrency(inv.value || inv.amount || 0),
          inv.status || 'N/A',
          inv.type || 'N/A'
        ]) : 
        [['No invoices available for this period']]
      ),
      [],
      
      // Commission Details
      ['COMMISSION BREAKDOWN'],
      ['Commission Type', 'Percentage', 'Formula', 'Amount'],
      ['Portal Commission', '15%', '15% of Gross', formatCurrency(portalCommission)],
      ['Management Commission', `${commissionPercentage}%`, `${commissionPercentage}% of (Gross - Cleaning Fee)`, formatCurrency(managementCommission)],
      ['Total Commission', `${15 + commissionPercentage}%`, 'Portal + Management', formatCurrency(portalCommission + managementCommission)],
      [],
      
      // Final Summary
      ['FINAL SUMMARY'],
      ['Total Reservations', statement.reservations.length],
      ['Total Revenue (sum of all invoices)', formatCurrency(grossAmount)],
      ['Total Deductions', formatCurrency(portalCommission + cleaningFee + managementCommission)],
      ['Final Amount to Owner', formatCurrency(finalOwnerAmount)]
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owner-statement-detailed-${statement.propertyId}-${statement.period.startDate}-${statement.period.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header - Fixed */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-16 left-0 right-0 z-20 lg:left-64">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center">
            <Calculator className="w-8 h-8 mr-3 text-gray-700" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Owner Statements</h1>
              <p className="text-lg text-gray-600">
                Generate financial statements for property owners
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-48">
        <div className="bg-white shadow rounded-lg">
          <div className="p-6">
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Management Commission Rate (Ignored for admin properties)
                  </label>
                  <select
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10%</option>
                    <option value={25}>25%</option>
                    <option value={30}>30%</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={generateStatements}
                disabled={loading || !selectedProperty || !startDate || !endDate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Generate Statements
                  </>
                )}
              </button>
          </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
        </div>
      )}

            {/* Results */}
            {statements && statements.length > 0 && (
              <div className="space-y-6">
                {/* Calculation Table */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Owner Statement Calculation</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Calculation Base:</span>
                      <span className="font-semibold">Invoices</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Gross Amount (sum of all invoices):</span>
                      <span className="font-semibold">{formatCurrency(statements[0].revenue.total)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Portal Commission (15% of gross):</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(statements[0].revenue.total * 0.15)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Cleaning Fee (from reservation API):</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(statements[0].expenses.fees)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Management Commission (25% of gross-cleaning):</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(statements[0].expenses.commission)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Additional Fees:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(statements[0].expenses.other)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Expenses:</span>
                      <span className="font-semibold text-red-600">-{formatCurrency(0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                      <span className="text-green-600 font-bold text-lg">Final Amount to Owner:</span>
                      <span className="text-green-600 font-bold text-lg">
                        {formatCurrency(
                          statements[0].revenue.total - 
                          (statements[0].revenue.total * 0.15) - 
                          statements[0].expenses.fees - 
                          statements[0].expenses.commission - 
                          statements[0].expenses.other
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Property Name:</span>
                          <span className="font-semibold">{statements[0].propertyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Property ID:</span>
                          <span className="font-semibold">{statements[0].propertyId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-semibold">{statements[0].status}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Period:</span>
                          <span className="font-semibold">{formatDate(statements[0].period.startDate)} - {formatDate(statements[0].period.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-semibold">{formatDate(statements[0].createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Commission Rate:</span>
                          <span className="font-semibold">{commissionPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex justify-end">
                  <button
                    onClick={downloadStatements}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerStatements;