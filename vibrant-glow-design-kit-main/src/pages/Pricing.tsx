import Layout from "@/components/Layout";
import { CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendlyButton from "@/components/CalendlyButton";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t.pricing.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t.pricing.subtitle}
            </p>
          </div>
        </section>

        {/* Three-Tier Pricing Grid */}
        <section className="py-12 md:py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {/* Basic Plan */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{t.pricing.plans.basic.name}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-[#00CFFF] mb-2">{t.pricing.plans.basic.fee}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {t.pricing.plans.basic.description}
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                  {t.pricing.features.basic.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  className="w-full py-3 md:py-4 bg-[#00CFFF] hover:bg-[#00ACE8] text-white font-semibold rounded-lg transition-colors duration-300 mt-auto h-auto min-h-12"
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign="basic-plan"
                  utmContent="lets-start-simple"
                >
                  👉 {t.pricing.plans.basic.buttonText}
                </CalendlyButton>
              </div>

              {/* Premium Plan */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#5FFF56] relative flex flex-col h-full md:col-span-2 lg:col-span-1">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#5FFF56] text-black px-6 py-2 rounded-full text-sm font-bold">
                  {t.pricing.plans.premium.popular}
                </div>
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{t.pricing.plans.premium.name}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-[#5FFF56] mb-2">{t.pricing.plans.premium.fee}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {t.pricing.plans.premium.description}
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                  {t.pricing.features.premium.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  className="w-full py-3 md:py-4 bg-[#5FFF56] hover:bg-[#4EE045] text-black font-semibold rounded-lg transition-colors duration-300 mt-auto h-auto min-h-12"
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign="premium-plan"
                  utmContent="full-management"
                >
                  👉 {t.pricing.plans.premium.buttonText}
                </CalendlyButton>
              </div>

              {/* Super Premium Plan */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full md:col-span-2 lg:col-span-1">
                <div className="text-center mb-6 md:mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{t.pricing.plans.superPremium.name}</h3>
                  <div className="text-2xl md:text-3xl font-bold text-[#007FC4] mb-2">{t.pricing.plans.superPremium.fee}</div>
                  <p className="text-gray-600 leading-relaxed">
                    {t.pricing.plans.superPremium.description}
                  </p>
                </div>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                  {t.pricing.features.superPremium.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  className="w-full py-3 md:py-4 bg-[#007FC4] hover:bg-[#0095D5] text-white font-semibold rounded-lg transition-colors duration-300 mt-auto h-auto min-h-12"
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign="super-premium-plan"
                  utmContent="vip-experience"
                >
                  👉 {t.pricing.plans.superPremium.buttonText}
                </CalendlyButton>
              </div>
            </div>
          </div>
        </section>

        {/* Full Setup Package */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.pricing.sections.setup.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t.pricing.sections.setup.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  {t.pricing.sections.setup.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-center">
                  <CalendlyButton
                    calendlyUrl="https://calendly.com/admin-smarthoster"
                    className="w-full py-4 md:py-6 bg-[#00CFFF] hover:bg-[#00ACE8] text-white font-semibold rounded-lg transition-colors duration-300 text-base md:text-lg h-auto min-h-12"
                    utmSource="pricing"
                    utmMedium="website"
                    utmCampaign="setup-package"
                    utmContent="full-setup"
                  >
                    👉 {t.pricing.sections.setup.button}
                  </CalendlyButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upgrade Package */}
        <section className="py-12 md:py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.pricing.sections.upgrade.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {t.pricing.sections.upgrade.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  {t.pricing.sections.upgrade.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-center">
                  <CalendlyButton
                    calendlyUrl="https://calendly.com/admin-smarthoster"
                    className="w-full py-3 md:py-4 bg-[#5FFF56] hover:bg-[#4EE045] text-black font-semibold rounded-lg transition-colors duration-300 h-auto min-h-12"
                    utmSource="pricing"
                    utmMedium="website"
                    utmCampaign="upgrade-package"
                    utmContent="apartment-upgrade"
                  >
                    👉 {t.pricing.sections.upgrade.button}
                  </CalendlyButton>
                </div>
              </div>
            </div>
            
            <div className="bg-[#5FFF56]/10 rounded-xl p-6 border border-[#5FFF56]/20">
              <p className="text-gray-700 font-medium">
                {t.pricing.sections.upgrade.note}
              </p>
            </div>
          </div>
        </section>

        {/* Compliance Package */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.pricing.sections.compliance.title}
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                {t.pricing.sections.compliance.subtitle}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg mb-6 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4">
                  {t.pricing.sections.compliance.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col justify-center">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-[#007FC4] mb-2">{t.pricing.sections.compliance.setupFee}</div>
                    <p className="text-sm text-gray-600">*{t.pricing.sections.compliance.note}</p>
                  </div>
                  <CalendlyButton
                    calendlyUrl="https://calendly.com/admin-smarthoster"
                    className="w-full py-3 md:py-4 bg-[#007FC4] hover:bg-[#0095D5] text-white font-semibold rounded-lg transition-colors duration-300 h-auto min-h-12"
                    utmSource="pricing"
                    utmMedium="website"
                    utmCampaign="compliance-package"
                    utmContent="book-compliance-setup"
                  >
                    👉 {t.pricing.sections.compliance.button}
                  </CalendlyButton>
                </div>
              </div>
            </div>
            
            <div className="bg-[#007FC4]/10 rounded-xl p-6 border border-[#007FC4]/20">
              <p className="text-gray-700 font-medium">
                {t.pricing.sections.compliance.note}
              </p>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 md:py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              {t.pricing.trust.title}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {t.pricing.trust.points.map((point, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-[#5FFF56] rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-black" />
                  </div>
                  <p className="text-gray-700 font-medium">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-12 md:py-20 px-4 bg-white">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-2xl p-6 md:p-8 lg:p-12 border border-gray-200">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {t.pricing.footer.title}
              </h2>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="py-3 md:py-4 px-6 md:px-8 bg-[#00CFFF] hover:bg-[#00ACE8] text-white font-semibold rounded-lg transition-colors duration-300 text-base md:text-lg h-auto min-h-12"
                utmSource="pricing"
                utmMedium="website"
                utmCampaign="footer-cta"
                utmContent="talk-to-real-person"
              >
                👉 {t.pricing.footer.button}
              </CalendlyButton>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Pricing;