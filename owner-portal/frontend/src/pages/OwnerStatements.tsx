import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getProperties } from '../services/properties.api';
import { apiClient } from '../services/apiClient';
import { Calendar, Download, Calculator, Euro, Users, FileText } from 'lucide-react';
import { RootState } from '../store';
import FinancialDetailsTable from '../components/financial/FinancialDetailsTable';
import DetailedReport from '../components/financial/DetailedReport';
import { useLanguage } from '../contexts/LanguageContext';
import RealLogo from '../assets/Real-logo.jpg';

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
  isAdminOwned?: boolean;
  summary?: {
    management_commission_vat?: number;
  };
  invoiceDetails?: {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalAmount: number;
  };
}

const OwnerStatements: React.FC = () => {
  const { t } = useLanguage();
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

  const handleDownloadPDF = () => {
    if (!statements || statements.length === 0) return;

    const statement = statements[0];
    
    // Calculate values for PDF
    const totalReceivedAmount = statement.reservations.reduce((sum: number, res: any) => sum + res.received_amount, 0);
    
    // Management commission is already VAT-inclusive from backend
    const managementCommissionsVATInclusive = statement.expenses.commission;
    
    // For admin properties, don't add VAT to cleaning fees
    // For regular properties, add 23% VAT to cleaning fees
    const isAdminProperty = statement.isAdminOwned;
    const cleaningFeesVATInclusive = isAdminProperty 
      ? statement.expenses.fees  // No VAT for admin properties
      : statement.expenses.fees * 1.23;  // Add 23% VAT for regular properties
    
    // Total to invoice = VAT-inclusive management + cleaning fees (with or without VAT)
    const totalToInvoice = managementCommissionsVATInclusive + cleaningFeesVATInclusive;
    
    // Debug logging
    console.log('PDF Generation Debug:', {
      isAdminProperty,
      managementCommissionsVATInclusive,
      cleaningFeesNet: statement.expenses.fees,
      cleaningFeesVATInclusive,
      totalToInvoice
    });
    const totalToPay = totalReceivedAmount - totalToInvoice;
    const commissionableAmount = statement.reservations.reduce((sum: number, res: any) => 
      sum + ((res.received_amount + res.host_commission) - res.cleaning_fee), 0
    );

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to download PDF');
      return;
    }
    
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Owner Statement - ${statement.propertyId}</title>
        <style>
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 2px solid #333; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          .header .logo {
            height: 60px;
            width: auto;
          }
          .header .title-section {
            flex: 1;
          }
          .header h1 { 
            margin: 0; 
            color: #333; 
            font-size: 24px;
          }
          .header p { 
            margin: 5px 0 0 0; 
            color: #666; 
            font-size: 14px;
          }
          .property-header {
            background-color: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          .property-header h2 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }
          .report-section {
            margin-bottom: 25px;
          }
          .report-section h3 {
            color: #333;
            border-bottom: 1px solid #ccc;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .label {
            font-weight: bold;
            color: #333;
            flex: 1;
          }
          .value {
            color: #666;
            flex: 1;
            text-align: right;
          }
          .total-section {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
            margin-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 8px 0;
            font-weight: bold;
            font-size: 16px;
            color: #333;
          }
          .total-row:last-child {
            border-top: 2px solid #333;
            padding-top: 12px;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${RealLogo}" alt="Company Logo" class="logo" />
          <div class="title-section">
            <h1>${t('ownerStatements.detailedReport')}</h1>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div class="property-header">
          <h2>${statement.propertyId} (« ${statement.propertyName} ») (${t('ownerStatements.propertyOwner')})</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
            ${t('ownerStatements.period')}: ${new Date(statement.period.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <!-- Financial Table Section -->
        <div class="report-section">
          <h3>${t('ownerStatements.detailedFinancialBreakdown')}</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead style="background-color: #f5f5f5;">
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableProperty')}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableInvoice')}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableReservation')}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableReceivedAmount')}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableHostCommission')}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableCleaningFee')}</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">${t('ownerStatements.tableMgmtCommission')}</th>
              </tr>
            </thead>
            <tbody>
              ${statement.reservations.map((res: any) => {
                const hostCommissionPercentage = (res.received_amount + res.host_commission) > 0 ? ((res.host_commission / (res.received_amount + res.host_commission)) * 100).toFixed(1) : '0.0';
                return `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${statement.propertyName}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">FR ${statement.propertyName.replace(/\s+/g, '').toUpperCase()}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                      <div style="font-weight: bold;">${res.firstname} ${res.lastname}</div>
                      <div style="font-size: 12px; color: #666;">(${res.rcode} | ${new Date(parseInt(res.arrival) * 1000).toISOString().split('T')[0]})</div>
                    </td>
                    <td style="border: 1px solid #ddd; padding: 8px;">€${res.received_amount.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                      <div>€${res.host_commission.toFixed(2)}</div>
                      <div style="font-size: 12px; color: #666;">(${hostCommissionPercentage}%)</div>
                    </td>
                    <td style="border: 1px solid #ddd; padding: 8px;">€${res.cleaning_fee.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">€${statement.isAdminOwned ? 0 : Math.max(0, 0.25 * ((res.received_amount + res.host_commission) - res.cleaning_fee)).toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
            <tfoot style="background-color: #f0f0f0; font-weight: bold;">
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${t('ownerStatements.tableTotal')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;"></td>
                <td style="border: 1px solid #ddd; padding: 8px;"></td>
                <td style="border: 1px solid #ddd; padding: 8px;">€${totalReceivedAmount.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                  <div>€${statement.reservations.reduce((sum: number, res: any) => sum + res.host_commission, 0).toFixed(2)}</div>
                  <div style="font-size: 12px; color: #666;">(${totalReceivedAmount > 0 ? ((statement.reservations.reduce((sum: number, res: any) => sum + res.host_commission, 0) / (totalReceivedAmount + statement.reservations.reduce((sum: number, res: any) => sum + res.host_commission, 0))) * 100).toFixed(1) : '0.0'}%)</div>
                </td>
                <td style="border: 1px solid #ddd; padding: 8px;">€${statement.reservations.reduce((sum: number, res: any) => sum + res.cleaning_fee, 0).toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">€${statement.reservations.reduce((sum: number, res: any) => sum + (statement.isAdminOwned ? 0 : Math.max(0, 0.25 * ((res.received_amount + res.host_commission) - res.cleaning_fee))), 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="report-section">
          <div class="info-row">
            <span class="label">${t('ownerStatements.calculationBasis')}</span>
            <span class="value">Invoices</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.commissionableAmount')}</span>
            <span class="value">€${commissionableAmount.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.rule')}</span>
            <span class="value">(Received amount + Host commission) - Cleaning fee + VAT 23%</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.managementCommissions')}</span>
            <span class="value">${isAdminProperty ? '€' + managementCommissionsVATInclusive.toFixed(2) : '€' + (managementCommissionsVATInclusive / 1.23).toFixed(2) + ' + VAT 23% = €' + managementCommissionsVATInclusive.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.cleaningFees')}</span>
            <span class="value">€${statement.expenses.fees.toFixed(2)}${isAdminProperty ? '' : ' + VAT 23% = €' + cleaningFeesVATInclusive.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.hostCommissions')}</span>
            <span class="value">€0.00</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.extraFees')}</span>
            <span class="value">€0.00 (${t('ownerStatements.cleaningFeesNote')})</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.expenses')}</span>
            <span class="value">€0.00</span>
          </div>
        </div>
        
        <div class="report-section">
          <div class="info-row">
            <span class="label">${t('ownerStatements.issuer')}</span>
            <span class="value">514142057 (series: FR COMMLT14 | product: GEST)</span>
          </div>
          <div class="info-row">
            <span class="label">${t('ownerStatements.recipient')}</span>
            <span class="value">${statement.propertyId} (« ${statement.propertyName} »)</span>
          </div>
        </div>
        
        <div class="total-section">
          <div class="total-row">
            <span>${t('ownerStatements.totalToInvoice')}</span>
            <span>€${totalToInvoice.toFixed(2)}</span>
          </div>
          ${!statement.isAdminOwned ? `
          <div class="info-row" style="margin-top: 2px;">
            <span class="label"></span>
            <span class="value" style="font-style: italic; font-size: 12px; color: #666;">VAT is deductable as a business expense</span>
          </div>
          ` : ''}
          <div class="total-row">
            <span>${t('ownerStatements.totalToPay')}</span>
            <span>€${totalToPay.toFixed(2)}</span>
          </div>
          <div class="info-row">
            <span class="label"></span>
            <span class="value" style="font-style: italic; font-size: 12px;">${t('ownerStatements.totalToPayNote')}</span>
          </div>
        </div>
        
        <script>
          // Auto-print when window loads
          window.onload = function() {
            setTimeout(function() {
              window.print();
              // Close window after printing
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `;
    
    // Write content to new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header - Fixed */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-16 left-0 right-0 z-20 lg:left-64">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center">
            <Calculator className="w-8 h-8 mr-3 text-gray-700" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('ownerStatements.title')}</h1>
              <p className="text-lg text-gray-600">
                {t('ownerStatements.description')}
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
                  {t('ownerStatements.property')}
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('ownerStatements.selectProperty')}</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ownerStatements.startDate')}
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
                  {t('ownerStatements.endDate')}
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
                    {t('ownerStatements.managementCommissionRate')}
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
{t('ownerStatements.generating')}
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
{t('ownerStatements.generateStatements')}
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

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-semibold text-gray-700">{t('ownerStatements.generatingStatements')}</p>
                </div>
        </div>
      )}

            {/* Results */}
            {!loading && statements && statements.length > 0 && (
              <div className="space-y-6">

                {/* Property Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('ownerStatements.propertyInformation')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('ownerStatements.propertyName')}</span>
                          <span className="font-semibold">{statements[0].propertyName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('ownerStatements.propertyId')}</span>
                          <span className="font-semibold">{statements[0].propertyId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('ownerStatements.status')}</span>
                          <span className="font-semibold">{statements[0].status}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('ownerStatements.period')}</span>
                          <span className="font-semibold">{formatDate(statements[0].period.startDate)} - {formatDate(statements[0].period.endDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('ownerStatements.created')}</span>
                          <span className="font-semibold">{formatDate(statements[0].createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('ownerStatements.commissionRate')}</span>
                          <span className="font-semibold">{commissionPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Financial Table */}
                {statements[0].reservations && statements[0].reservations.length > 0 && (
                  <div className="mt-6">
                    <FinancialDetailsTable
                      title={t('ownerStatements.detailedFinancialBreakdown')}
                      data={statements[0].reservations.map((res: any) => ({
                        property: statements[0].propertyName,
                        invoice: res.invoiced_value > 0 ? `FR ${statements[0].propertyName.replace(/\s+/g, '').toUpperCase()}` : 'N/A',
                        reservation: {
                          guestName: `${res.firstname} ${res.lastname}`,
                          reservationId: res.rcode,
                          date: new Date(parseInt(res.arrival) * 1000).toISOString().split('T')[0]
                        },
                        receivedAmount: res.received_amount || 0,
                        hostCommission: res.host_commission || 0,
                        cleaningFee: res.cleaning_fee || 0,
                        mgmtCommission: statements[0].isAdminOwned ? 0 : Math.max(0, 0.25 * ((res.received_amount + res.host_commission) - res.cleaning_fee))
                      }))}
                    />
                  </div>
                )}

                {/* Detailed Report */}
                {statements[0].reservations && statements[0].reservations.length > 0 && (() => {
                  // Management commission is already VAT-inclusive from backend
                  const managementCommissionsVATInclusive = statements[0].expenses.commission;
                  
                  // For admin properties, don't add VAT to cleaning fees
                  // For regular properties, add 23% VAT to cleaning fees
                  const isAdminProperty = statements[0].isAdminOwned;
                  const cleaningFeesVATInclusive = isAdminProperty 
                    ? statements[0].expenses.fees  // No VAT for admin properties
                    : statements[0].expenses.fees * 1.23;  // Add 23% VAT for regular properties
                  
                  // Total to invoice = VAT-inclusive management + cleaning fees (with or without VAT)
                  const totalToInvoice = managementCommissionsVATInclusive + cleaningFeesVATInclusive;
                  const totalReceivedAmount = statements[0].reservations.reduce((sum, res) => sum + res.received_amount, 0);
                  return (
                    <div className="mt-6">
                      <DetailedReport
                        data={{
                          calculationBasis: 'Invoices',
                          commissionableAmount: statements[0].reservations.reduce((sum, res) => sum + ((res.received_amount + res.host_commission) - res.cleaning_fee), 0),
                          rule: '(Received amount + Host commission) - Cleaning fee + VAT 23%',
                          managementCommissions: statements[0].expenses.commission,
                          managementCommissionsVAT: statements[0].summary?.management_commission_vat || 0,
                          cleaningFees: statements[0].expenses.fees,
                          hostCommissions: 0,
                          extraFees: statements[0].expenses.other,
                          expenses: 0,
                          issuer: '514142057',
                          issuerDetails: 'series: FR COMMLT14 | product: GEST',
                          recipient: `${statements[0].propertyId} (${statements[0].propertyName})`,
                          totalToInvoice: totalToInvoice,
                          totalToPay: totalReceivedAmount - totalToInvoice,
                          totalToPayFormula: 'Received amounts - Total to invoice',
                          isAdminProperty: statements[0].isAdminOwned
                        }}
                      />
                    </div>
                  );
                })()}

                {/* Download Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t('ownerStatements.downloadPdf')}
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