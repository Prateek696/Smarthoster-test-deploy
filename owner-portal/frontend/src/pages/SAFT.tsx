import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { Receipt, Download, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface SAFTResponse {
  generated: string;
  sent: string;
  saft: string;
}

const SAFT: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const now = new Date();
    return now.getMonth() === 0 ? 12 : now.getMonth();
  });
  const [invoicingNif, setInvoicingNif] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saftData, setSaftData] = useState<SAFTResponse | null>(null);
  const [error, setError] = useState<string>('');

  // Generate years array (current year ± 2)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  
  // Generate months array
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];


  const getSAFT = async () => {
    if (!invoicingNif) {
      setError('Please enter invoicing VAT ID');
      return;
    }

    setIsLoading(true);
    setError('');
    setSaftData(null);

    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        month: selectedMonth.toString(),
        invoicing_nif: invoicingNif
      });
      
      const response = await fetch(`http://localhost:5000/saft/get?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSaftData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to retrieve SAFT-T');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('SAFT retrieval error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSAFT = () => {
    if (saftData?.saft) {
      // Convert base64 to blob and download
      const byteCharacters = atob(saftData.saft);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/xml' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `saft_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Receipt className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">SAFT-T Retrieval</h1>
        </div>
        <p className="text-gray-600">
          Retrieve existing SAFT (Sistema de Apuramento de Faturas e Transações) files for Portuguese tax compliance.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Invoicing VAT ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoicing VAT ID (NIF)
            </label>
            <input
              type="text"
              value={invoicingNif}
              onChange={(e) => setInvoicingNif(e.target.value)}
              placeholder="e.g., 234567890"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Portuguese VAT identification number (9 digits)
            </p>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Retrieve Button */}
        <div className="mt-6">
          <button
            onClick={getSAFT}
            disabled={isLoading || !invoicingNif}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Retrieving...</span>
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4" />
                <span>Retrieve SAFT-T</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {console.log('Current saftData state:', saftData)}
        {saftData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">SAFT-T Retrieved Successfully</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Generated:</strong> {new Date(saftData.generated).toLocaleString()}</p>
                  <p><strong>Sent:</strong> {new Date(saftData.sent).toLocaleString()}</p>
                </div>
                <button
                  onClick={downloadSAFT}
                  className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download SAFT-T File</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">About SAFT-T</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            SAFT (Sistema de Apuramento de Faturas e Transações) is a Portuguese tax compliance system 
            that requires businesses to submit detailed transaction data to the tax authorities.
          </p>
          <p>
            <strong>Invoicing VAT ID (NIF):</strong> This is your Portuguese tax identification number, 
            typically a 9-digit number used for invoicing and tax purposes.
          </p>
          <p>
            This tool retrieves existing SAFT-T files that have already been generated by Hostkit for the selected period. 
            The SAFT-T file contains all invoice and transaction data and can be submitted directly to the Portuguese tax authorities.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SAFT;
