
import { useLanguage } from "@/contexts/LanguageContext";
import Layout from "@/components/Layout";
import { Shield, Lock, FileText, Users, Globe, Eye, Database, UserCheck, Building2, Clock, Cpu, RefreshCw, Mail } from "lucide-react";

const Privacy = () => {
  const { t } = useLanguage();

  const iconMap = {
    purpose: Shield,
    controller: Building2,
    dataCollection: Database,
    lawfulBases: FileText,
    dataUse: Users,
    dataSharing: Globe,
    retention: Clock,
    rights: UserCheck,
    security: Lock,
    minors: Users,
    cookies: Eye,
    automated: Cpu,
    changes: RefreshCw,
    contact: Mail
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
                {t.privacy.title}
              </h1>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
              <p className="text-sm sm:text-base text-gray-600 mb-4">{t.privacy.effectiveDate}</p>
              <div className="space-y-2 text-sm sm:text-base text-gray-700">
                <p><strong>{t.privacy.entityName}</strong></p>
                <p>{t.privacy.operatingAs}</p>
                <p>{t.privacy.vat}</p>
                <p>{t.privacy.address}</p>
                <p>{t.privacy.email}</p>
              </div>
            </div>
          </div>

          {/* Policy Sections */}
          <div className="space-y-8 lg:space-y-12">
            {Object.entries(t.privacy.sections).map(([key, section], index) => {
              const IconComponent = iconMap[key as keyof typeof iconMap] || FileText;
              const sectionData = section as any; // Type assertion to fix TypeScript errors
              
              return (
                <div key={key} className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-[#00CFFF]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                      {sectionData.title}
                    </h2>
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                      {sectionData.content}
                    </p>
                    
                    {/* Render lists if they exist */}
                    {sectionData.categories && (
                      <ul className="space-y-2 mb-4">
                        {sectionData.categories.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {sectionData.bases && (
                      <ul className="space-y-2 mb-4">
                        {sectionData.bases.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {sectionData.purposes && (
                      <ul className="space-y-2 mb-4">
                        {sectionData.purposes.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {sectionData.parties && (
                      <>
                        <ul className="space-y-2 mb-4">
                          {sectionData.parties.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mb-4">{sectionData.noSale}</p>
                        <p className="text-gray-700 mb-4">{sectionData.transfers}</p>
                      </>
                    )}
                    
                    {sectionData.periods && (
                      <>
                        <ul className="space-y-2 mb-4">
                          {sectionData.periods.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mb-4">{sectionData.erasure}</p>
                      </>
                    )}
                    
                    {sectionData.list && (
                      <>
                        <ul className="space-y-2 mb-4">
                          {sectionData.list.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mb-4">{sectionData.contact}</p>
                      </>
                    )}
                    
                    {sectionData.measures && (
                      <>
                        <ul className="space-y-2 mb-4">
                          {sectionData.measures.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mb-4">{sectionData.breach}</p>
                      </>
                    )}
                    
                    {sectionData.types && (
                      <>
                        <ul className="space-y-2 mb-4">
                          {sectionData.types.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mb-4">{sectionData.disclosure}</p>
                      </>
                    )}
                    
                    {sectionData.uses && (
                      <>
                        <ul className="space-y-2 mb-4">
                          {sectionData.uses.map((item: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="w-2 h-2 bg-[#5FFF56] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-700 mb-4">{sectionData.impact}</p>
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
                If you have questions about this Privacy Policy, please contact us at{" "}
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

export default Privacy;
