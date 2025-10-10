import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FinancialData {
  property: string;
  invoice: string;
  reservation: {
    guestName: string;
    reservationId: string;
    date: string;
  };
  receivedAmount: number;
  hostCommission: number;
  cleaningFee: number;
  mgmtCommission: number;
}

interface FinancialDetailsTableProps {
  data: FinancialData[];
  title?: string;
}

const FinancialDetailsTable: React.FC<FinancialDetailsTableProps> = ({ 
  data, 
  title = "Financial Details"
}) => {
  const { t } = useLanguage();
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FinancialData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSort = (key: keyof FinancialData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue: any = a[sortConfig.key!];
      let bValue: any = b[sortConfig.key!];

      // Handle nested objects
      if (sortConfig.key === 'reservation') {
        aValue = a.reservation.guestName;
        bValue = b.reservation.guestName;
      }

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [data, sortConfig]);

  const getSortIcon = (key: keyof FinancialData) => {
    if (sortConfig.key !== key) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  // Calculate totals
  const totals = {
    receivedAmount: data.reduce((sum, item) => sum + item.receivedAmount, 0),
    hostCommission: data.reduce((sum, item) => sum + item.hostCommission, 0),
    cleaningFee: data.reduce((sum, item) => sum + item.cleaningFee, 0),
    mgmtCommission: data.reduce((sum, item) => sum + item.mgmtCommission, 0),
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('property')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableProperty')}</span>
                  {getSortIcon('property')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('invoice')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableInvoice')}</span>
                  {getSortIcon('invoice')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reservation')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableReservation')}</span>
                  {getSortIcon('reservation')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('receivedAmount')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableReceivedAmount')}</span>
                  {getSortIcon('receivedAmount')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('hostCommission')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableHostCommission')}</span>
                  {getSortIcon('hostCommission')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cleaningFee')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableCleaningFee')}</span>
                  {getSortIcon('cleaningFee')}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('mgmtCommission')}
              >
                <div className="flex items-center space-x-1">
                  <span>{t('ownerStatements.tableMgmtCommission')}</span>
                  {getSortIcon('mgmtCommission')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.property}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.invoice}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{item.reservation.guestName}</div>
                    <div className="text-gray-500 text-xs">
                      ({item.reservation.reservationId} | {item.reservation.date})
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(item.receivedAmount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>
                    <div>{formatCurrency(item.hostCommission)}</div>
                    {(item.receivedAmount + item.hostCommission) > 0 && (
                      <div className="text-xs text-gray-500">
                        ({(item.hostCommission / (item.receivedAmount + item.hostCommission) * 100).toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(item.cleaningFee)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {formatCurrency(item.mgmtCommission)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr className="font-semibold">
              <td className="px-4 py-3 text-sm text-gray-900">{t('ownerStatements.tableTotal')}</td>
              <td className="px-4 py-3 text-sm text-gray-900"></td>
              <td className="px-4 py-3 text-sm text-gray-900"></td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatCurrency(totals.receivedAmount)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                <div>
                  <div>{formatCurrency(totals.hostCommission)}</div>
                  {(totals.receivedAmount + totals.hostCommission) > 0 && (
                    <div className="text-xs text-gray-500">
                      ({(totals.hostCommission / (totals.receivedAmount + totals.hostCommission) * 100).toFixed(1)}%)
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatCurrency(totals.cleaningFee)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {formatCurrency(totals.mgmtCommission)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default FinancialDetailsTable;
