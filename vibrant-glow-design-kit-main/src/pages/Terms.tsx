
import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t.terms.title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.terms.lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
            <div className="prose prose-lg max-w-none">
              {/* Company Information */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.terms.companyInfo.title}</h3>
                <div className="text-gray-700 space-y-2">
                  <p><strong>{t.terms.companyInfo.effectiveDate}</strong> {t.terms.companyInfo.effectiveDateValue}</p>
                  <p><strong>{t.terms.companyInfo.legalEntity}</strong> {t.terms.companyInfo.legalEntityValue}</p>
                  <p><strong>{t.terms.companyInfo.businessName}</strong> {t.terms.companyInfo.businessNameValue}</p>
                  <p><strong>{t.terms.companyInfo.registeredOffice}</strong> {t.terms.companyInfo.registeredOfficeValue}</p>
                  <p><strong>{t.terms.companyInfo.contactEmail}</strong> {t.terms.companyInfo.contactEmailValue}</p>
                </div>
              </div>

              {/* Introduction */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">
                  {t.terms.introduction}
                </p>
              </div>

              {/* Sections */}
              {t.terms.sections.map((section: any, index: number) => (
                <div key={index} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {section.number}. {section.title}
                  </h2>
                  {section.content.map((paragraph: string, pIndex: number) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                      {section.list.map((item: string, lIndex: number) => (
                        <li key={lIndex}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {/* Contact */}
              <div className="bg-blue-50 p-6 rounded-lg mt-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.terms.contact.title}</h3>
                <p className="text-gray-700">
                  {t.terms.contact.description} <a href="mailto:admin@smarthoster.io" className="text-[#00CFFF] hover:underline">admin@smarthoster.io</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
