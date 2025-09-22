import React, { useState, useEffect } from 'react';
import { generateOwnerStatement, OwnerStatement } from '../../services/admin.api';
import { getAllProperties } from '../../services/admin.api';
import { Calendar, Download, FileText, Euro, Building, Users, TrendingUp } from 'lucide-react';

interface OwnerStatementProps {
  onClose?: () => void;
}

const OwnerStatementComponent: React.FC<OwnerStatementProps> = ({ onClose }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statement, setStatement] = useState<OwnerStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchProperties();
    // Set default date range (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await getAllProperties();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const handleGenerateStatement = async () => {
    if (!selectedPropertyId || !startDate || !endDate) {
      setError('Please select a property and date range');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const statementData = await generateOwnerStatement(
        parseInt(selectedPropertyId),
        startDate,
        endDate
      );
      setStatement(statementData);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error generating statement');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-EU');
  };

  const downloadCSV = () => {
    if (!statement) return;

    const csvContent = [
      ['Property Statement', ''],
      ['Property ID', statement.property.id],
      ['Property Name', statement.property.name],
      ['Owner', statement.property.owner],
      ['Period', `${statement.period.startDate} to ${statement.period.endDate}`],
      [''],
      ['Calculations', 'Amount (€)'],
      ['Gross Amount', statement.calculations.grossAmount.toFixed(2)],
      ['Portal Commission (15%)', statement.calculations.portalCommission.toFixed(2)],
      ['Cleaning Fee (€75 × invoices)', statement.calculations.cleaningFee.toFixed(2)],
      ['Management Commission', statement.calculations.managementCommission.toFixed(2)],
      ['Final Owner Amount', statement.calculations.finalOwnerAmount.toFixed(2)],
      [''],
      ['Invoice Count', statement.invoiceCount],
      [''],
      ['Invoices', ''],
      ['Invoice ID', 'Name', 'Value (€)', 'Date', 'Series'],
      ...statement.invoices.map(invoice => [
        invoice.id,
        invoice.name,
        invoice.value.toFixed(2),
        invoice.date,
        invoice.series
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owner-statement-${statement.property.id}-${statement.period.startDate}-${statement.period.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Owner Statement</h1>
            <p className="text-gray-600 mt-1">Generate and view property owner financial statements</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Property
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a property...</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name} (ID: {property.id}) - {property.isAdminOwned ? 'Admin' : (property.owner?.name || 'Unassigned')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Management Commission Rate (Ignored for admin properties)
              </label>
              <select
                value={statement?.property?.isAdminOwned ? '0' : '25'}
                disabled={statement?.property?.isAdminOwned}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  statement?.property?.isAdminOwned ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="0">0% (Admin Properties)</option>
                <option value="25">25% (Owner Properties)</option>
              </select>
              {statement?.property?.isAdminOwned && (
                <p className="text-xs text-gray-500 mt-1">Admin-owned property (0% commission)</p>
              )}
              {!statement?.property?.isAdminOwned && statement && (
                <p className="text-xs text-gray-500 mt-1">Owner-owned property (25% commission)</p>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateStatement}
                disabled={loading || !selectedPropertyId || !startDate || !endDate}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Statements
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Statement Display */}
        {statement && (
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
                  <span className="text-gray-600 font-medium">Gross Amount:</span>
                  <span className="font-semibold">{formatCurrency(statement.calculations.grossAmount)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Portal Commission (15%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(statement.calculations.portalCommission)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Cleaning Fee (€75 × {statement.invoiceCount}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(statement.calculations.cleaningFee)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Management Commission ({statement.property.isAdminOwned ? '0%' : '25%'}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(statement.calculations.managementCommission)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Additional Fees:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(0)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600 font-medium">Expenses:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(0)}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                  <span className="text-green-600 font-bold text-lg">Final Owner Amount:</span>
                  <span className="text-green-600 font-bold text-lg">{formatCurrency(statement.calculations.finalOwnerAmount)}</span>
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
                      <span className="font-semibold">{statement.property.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property ID:</span>
                      <span className="font-semibold">{statement.property.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owner:</span>
                      <span className="font-semibold">{statement.property.owner}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Period:</span>
                      <span className="font-semibold">{statement.period.startDate} - {statement.period.endDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Count:</span>
                      <span className="font-semibold">{statement.invoiceCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Property Type:</span>
                      <span className="font-semibold">{statement.property.isAdminOwned ? 'Admin Property' : 'Owner Property'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-end">
              <button
                onClick={downloadCSV}
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
  );
};

export default OwnerStatementComponent;
