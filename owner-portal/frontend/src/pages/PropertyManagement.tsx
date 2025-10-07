import React from 'react';
import PropertyManagement from '../components/property/PropertyManagement';
import { useLanguage } from '../contexts/LanguageContext';

const PropertyManagementPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header - Fixed */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm fixed top-16 left-0 right-0 z-20 lg:left-64">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{t('nav.properties')}</h1>
              <p className="text-lg text-gray-600">
                {t('dashboard.managePortfolio')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-48">
        <PropertyManagement />
      </div>
    </div>
  );
};

export default PropertyManagementPage;
