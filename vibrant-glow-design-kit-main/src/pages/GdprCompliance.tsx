
import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, FileText, Database, Users, Lock, Globe, Clock, UserCheck, AlertTriangle, Mail } from 'lucide-react';

const GdprCompliance = () => {
  const { t } = useLanguage();

  const iconMap = {
    "1": Shield,
    "2": FileText,
    "3": Database,
    "4": Lock,
    "5": Users,
    "6": UserCheck,
    "7": Clock,
    "8": Globe,
    "9": AlertTriangle,
    "10": Mail
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="flex items-center justify-center mb-6">
              <Shield className="h-16 w-16 text-[#00CFFF] mr-4" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                {t.gdpr.title}
              </h1>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t.gdpr.lastUpdated}</p>
              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <p><strong>{t.gdpr.companyInfo.entityName}</strong> {t.gdpr.companyInfo.entityNameValue}</p>
                <p><strong>{t.gdpr.companyInfo.operatingAs}</strong> {t.gdpr.companyInfo.operatingAsValue}</p>
                <p><strong>{t.gdpr.companyInfo.vatNipc}</strong> {t.gdpr.companyInfo.vatNipcValue}</p>
                <p><strong>{t.gdpr.companyInfo.registeredOffice}</strong> {t.gdpr.companyInfo.registeredOfficeValue}</p>
                <p><strong>{t.gdpr.companyInfo.contactEmail}</strong> {t.gdpr.companyInfo.contactEmailValue}</p>
              </div>
            </div>
          </div>

          {/* GDPR Sections */}
          <div className="space-y-8 lg:space-y-12">
            {t.gdpr.sections.map((section: any, index: number) => {
              const IconComponent = iconMap[section.number as keyof typeof iconMap] || FileText;
              
              return (
                <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-[#00CFFF]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                      {section.number}. {section.title}
                    </h2>
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    {section.content.map((paragraph: string, pIndex: number) => (
                      <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                    
                    {section.list && (
                      <ul className="space-y-2 mb-4">
                        {section.list.map((item: string, lIndex: number) => (
                          <li key={lIndex} className="flex items-start">
                            <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {section.additional && (
                      <>
                        {Array.isArray(section.additional) ? (
                          section.additional.map((item: string, aIndex: number) => (
                            <p key={aIndex} className="text-gray-700 leading-relaxed mb-2">
                              {item}
                            </p>
                          ))
                        ) : (
                          <p className="text-gray-700 leading-relaxed mb-4">
                            {section.additional}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer Contact */}
          <div className="mt-12 lg:mt-16 text-center">
            <div className="bg-gradient-to-r from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-2xl p-6 sm:p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-700 mb-4">
                If you have questions about this GDPR policy, please contact us at{" "}
                <a href="mailto:admin@smarthoster.io" className="text-[#00CFFF] hover:underline font-medium">
                  admin@smarthoster.io
                </a>
              </p>
              <p className="text-sm text-gray-600">
                Last updated: Sunday, 1 June 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GdprCompliance;
