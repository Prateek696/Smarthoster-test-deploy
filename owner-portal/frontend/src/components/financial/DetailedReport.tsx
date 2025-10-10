import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DetailedReportProps {
  data: {
    calculationBasis: string;
    commissionableAmount: number;
    rule: string;
    managementCommissions: number;
    managementCommissionsVAT: number;
    cleaningFees: number;
    hostCommissions: number;
    extraFees: number;
    expenses: number;
    issuer: string;
    issuerDetails: string;
    recipient: string;
    totalToInvoice: number;
    totalToPay: number;
    totalToPayFormula: string;
    isAdminProperty?: boolean;
  };
}

const DetailedReport: React.FC<DetailedReportProps> = ({ data }) => {
  const { t } = useLanguage();
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
        {t('ownerStatements.detailedReport')}
      </h3>
      
      <div className="bg-gray-100 px-3 py-2 mb-3 rounded">
        <p className="text-sm text-gray-700 font-medium">
          {data.recipient} ({t('ownerStatements.propertyOwner')})
        </p>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.calculationBasis')}</span>
          <span className="text-gray-700">{data.calculationBasis}</span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.commissionableAmount')}</span>
          <span className="text-gray-700">{formatCurrency(data.commissionableAmount)}</span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.rule')}</span>
          <span className="text-gray-700">{data.rule}</span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.managementCommissions')}</span>
          <span className="text-gray-700">
            {data.isAdminProperty ? (
              formatCurrency(data.managementCommissions)
            ) : (
              <>
                {formatCurrency(data.managementCommissions - data.managementCommissionsVAT)} + VAT 23% = {formatCurrency(data.managementCommissions)}
              </>
            )}
          </span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.cleaningFees')}</span>
          <span className="text-gray-700">
            {data.isAdminProperty ? (
              formatCurrency(data.cleaningFees)
            ) : (
              <>
                {formatCurrency(data.cleaningFees)} + VAT 23% = {formatCurrency(data.cleaningFees * 1.23)}
              </>
            )}
          </span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.hostCommissions')}</span>
          <span className="text-gray-700">{formatCurrency(data.hostCommissions)}</span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.extraFees')}</span>
          <span className="text-gray-700">
            {formatCurrency(data.extraFees)} ({t('ownerStatements.cleaningFeesNote')})
          </span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.expenses')}</span>
          <span className="text-gray-700">{formatCurrency(data.expenses)}</span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.issuer')}</span>
          <span className="text-gray-700">
            {data.issuer} {data.issuerDetails && (
              <span className="text-gray-500">({data.issuerDetails})</span>
            )}
          </span>
        </div>
        
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.recipient')}</span>
          <span className="text-gray-700">{data.recipient}</span>
        </div>
        
        <div className="border-t border-gray-300 pt-2 mt-3">
        <div className="flex">
          <span className="font-bold text-gray-900 w-48">{t('ownerStatements.totalToInvoice')}</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(data.totalToInvoice)}
          </span>
        </div>
        
        {/* Show VAT note for non-admin properties */}
        {!data.isAdminProperty && (
          <div className="flex mt-2">
            <span className="w-48"></span>
            <span className="text-sm text-gray-600 italic">
              VAT is deductable as a business expense
            </span>
          </div>
        )}
          
          <div className="flex mt-1">
            <span className="font-bold text-gray-900 w-48">{t('ownerStatements.totalToPay')}</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(data.totalToPay)} 
              <span className="text-gray-500 font-normal text-xs ml-2">
                ({data.totalToPayFormula})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedReport;
