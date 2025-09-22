
import Layout from "@/components/Layout";
import CalendlyButton from "@/components/CalendlyButton";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Smartphone, 
  Lock, 
  Building, 
  Shield, 
  Users, 
  Zap,
  Settings,
  Globe,
  CheckCircle,
  ChevronRight
} from "lucide-react";

const AdvancedAutomation = () => {
  const { t } = useLanguage();

  const features = [
    { 
      icon: Lock, 
      title: t.automation.multiLayeredAccess.title, 
      content: t.automation.multiLayeredAccess 
    },
    { 
      icon: Smartphone, 
      title: t.automation.smartLocks.title, 
      content: t.automation.smartLocks 
    },
    { 
      icon: Building, 
      title: t.automation.buildingAccess.title, 
      content: t.automation.buildingAccess 
    },
    { 
      icon: Shield, 
      title: t.automation.lockboxes.title, 
      content: t.automation.lockboxes 
    },
    { 
      icon: Users, 
      title: t.automation.humanOversight.title, 
      content: t.automation.humanOversight 
    },
    { 
      icon: Zap, 
      title: t.automation.smartTag.title, 
      content: t.automation.smartTag 
    },
    { 
      icon: Settings, 
      title: t.automation.portfolioManagement.title, 
      content: t.automation.portfolioManagement 
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                {t.automation.hero.headline}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.automation.hero.subheadline}
              </p>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-colors duration-200"
                size="lg"
                utmSource="automation-page"
                utmMedium="website"
                utmCampaign="automation-demo"
                utmContent="hero-cta"
              >
                {t.automation.hero.cta}
              </CalendlyButton>
            </div>
          </div>
        </section>

        {/* Features Sections */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-8 sm:gap-10 lg:gap-12">
              {features.map((feature, index) => (
                <Card key={index} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#5FFF56]/10 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#5FFF56]" />
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-4 lg:space-y-6">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                          {feature.title}
                        </h3>
                        
                        <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                          {feature.content.description}
                        </p>
                        
                        {feature.content.features && (
                          <ul className="space-y-2 sm:space-y-3">
                            {feature.content.features.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#5FFF56] flex-shrink-0 mt-0.5" />
                                <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {feature.content.conclusion && (
                          <p className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed mt-4">
                            {feature.content.conclusion}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why It Works Section - Improved formatting */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
                  {t.automation.whyItWorks.title}
                </h2>
                
                <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  {t.automation.whyItWorks.description}
                </p>
              </div>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8 lg:p-10">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 text-center">
                    {t.automation.whyItWorks.subtitle}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                    {t.automation.whyItWorks.features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <CheckCircle className="w-5 h-5 text-[#5FFF56] flex-shrink-0" />
                        <span className="text-sm sm:text-base text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed bg-[#5FFF56]/10 p-4 rounded-lg">
                      {t.automation.whyItWorks.conclusion}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
                {t.automation.faqs.title}
              </h2>
              
              <div className="grid gap-6 sm:gap-8">
                {Object.entries(t.automation.faqs.questions).map(([key, faq]) => (
                  <Card key={key} className="border-0 shadow-md">
                    <CardContent className="p-6 sm:p-8">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 leading-tight">
                        {(faq as any).question}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {(faq as any).answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#5FFF56] to-[#4EE045]">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-black mb-4 sm:mb-6 leading-tight">
                {t.automation.finalCta.headline}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-800 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.automation.finalCta.description}
              </p>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-colors duration-200"
                size="lg"
                utmSource="automation-page"
                utmMedium="website"
                utmCampaign="automation-demo"
                utmContent="final-cta"
              >
                <Settings className="w-5 h-5 mr-2" />
                {t.automation.finalCta.cta}
              </CalendlyButton>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdvancedAutomation;
