
import React from 'react';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

const CookiePolicy = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {t.cookiePolicy.title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t.cookiePolicy.lastUpdated}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
            <div className="prose prose-lg max-w-none">
              {/* Company Information */}
              <div className="bg-gray-50 p-6 rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.cookiePolicy.companyInfo.title}</h3>
                <div className="text-gray-700 space-y-2">
                  <p><strong>{t.cookiePolicy.companyInfo.effectiveDate}</strong> {t.cookiePolicy.companyInfo.effectiveDateValue}</p>
                  <p><strong>{t.cookiePolicy.companyInfo.entityName}</strong> {t.cookiePolicy.companyInfo.entityNameValue}</p>
                  <p><strong>{t.cookiePolicy.companyInfo.operatingAs}</strong> {t.cookiePolicy.companyInfo.operatingAsValue}</p>
                  <p><strong>{t.cookiePolicy.companyInfo.vatNipc}</strong> {t.cookiePolicy.companyInfo.vatNipcValue}</p>
                  <p><strong>{t.cookiePolicy.companyInfo.registeredOffice}</strong> {t.cookiePolicy.companyInfo.registeredOfficeValue}</p>
                  <p><strong>{t.cookiePolicy.companyInfo.contactEmail}</strong> {t.cookiePolicy.companyInfo.contactEmailValue}</p>
                </div>
              </div>

              {/* Sections */}
              {t.cookiePolicy.sections.map((section: any, index: number) => (
                <div key={index} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {section.number}. {section.title}
                  </h2>
                  {section.content && section.content.map((paragraph: string, pIndex: number) => (
                    <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                  {section.subsections && section.subsections.map((subsection: any, sIndex: number) => (
                    <div key={sIndex} className="mb-6 ml-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {subsection.title}
                      </h3>
                      {subsection.content && subsection.content.map((paragraph: string, pIndex: number) => (
                        <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                      {subsection.list && (
                        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                          {subsection.list.map((item: string, lIndex: number) => (
                            <li key={lIndex}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t.cookiePolicy.contact.title}</h3>
                <div className="text-gray-700 space-y-2">
                  <p>{t.cookiePolicy.contact.description}</p>
                  <div className="mt-4">
                    <p className="font-medium">{t.cookiePolicy.contact.companyName}</p>
                    <p>{t.cookiePolicy.contact.address}</p>
                    <p>{t.cookiePolicy.contact.city}</p>
                    <p>Email: <a href="mailto:admin@smarthoster.io" className="text-[#00CFFF] hover:underline">admin@smarthoster.io</a></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CookiePolicy;
