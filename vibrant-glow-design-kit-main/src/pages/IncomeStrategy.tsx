
import Layout from "@/components/Layout";
import CalendlyButton from "@/components/CalendlyButton";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  TrendingUp, 
  Target, 
  MapPin, 
  Star, 
  Search, 
  RotateCcw, 
  Shield,
  ChevronRight,
  DollarSign
} from "lucide-react";

const IncomeStrategy = () => {
  const { t } = useLanguage();

  const features = [
    { icon: TrendingUp, title: t.income.dynamicPricing.title, content: t.income.dynamicPricing },
    { icon: Target, title: t.income.directBookings.title, content: t.income.directBookings },
    { icon: MapPin, title: t.income.localStrategy.title, content: t.income.localStrategy },
    { icon: Star, title: t.income.reviews.title, content: t.income.reviews },
    { icon: Search, title: t.income.visibility.title, content: t.income.visibility },
    { icon: RotateCcw, title: t.income.repeatGuests.title, content: t.income.repeatGuests },
    { icon: Shield, title: t.income.fullService.title, content: t.income.fullService }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                {t.income.hero.headline}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.income.hero.subheadline}
              </p>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-colors duration-200"
                size="lg"
                utmSource="income-strategy-page"
                utmMedium="website"
                utmCampaign="income-review"
                utmContent="hero-cta"
              >
                {t.income.hero.cta}
              </CalendlyButton>
            </div>
          </div>
        </section>

        {/* Features Grid */}
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
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#5FFF56] flex-shrink-0 mt-0.5" />
                                <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {feature.content.strategy && (
                          <p className="text-sm sm:text-base text-gray-600 leading-relaxed mt-4">
                            {feature.content.strategy}
                          </p>
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

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-8 sm:mb-12">
                {t.income.faqs.title}
              </h2>
              
              <div className="grid gap-6 sm:gap-8">
                {Object.entries(t.income.faqs.questions).map(([key, faq]) => (
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
                {t.income.finalCta.headline}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-800 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
                {t.income.finalCta.description}
              </p>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-colors duration-200"
                size="lg"
                utmSource="income-strategy-page"
                utmMedium="website"
                utmCampaign="income-review"
                utmContent="final-cta"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                {t.income.finalCta.cta}
              </CalendlyButton>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default IncomeStrategy;
