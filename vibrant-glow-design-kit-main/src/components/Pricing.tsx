
import { CheckCircle, Star, Zap } from "lucide-react";
import CalendlyButton from "@/components/CalendlyButton";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const Pricing = () => {
  const { t } = useLanguage();

  const plans = [
    {
      name: t.pricing.plans.essential.name,
      fee: t.pricing.plans.essential.fee,
      description: t.pricing.plans.essential.description,
      features: t.pricing.features.essential,
      icon: CheckCircle,
      color: "#00CFFF",
      popular: false,
      calendlyUrl: "https://calendly.com/admin-smarthoster"
    },
    {
      name: t.pricing.plans.premium.name,
      fee: t.pricing.plans.premium.fee,
      description: t.pricing.plans.premium.description,
      features: t.pricing.features.premium,
      icon: Star,
      color: "#5FFF56",
      popular: true,
      calendlyUrl: "https://calendly.com/admin-smarthoster"
    }
  ];

  const scrollToContact = () => {
    const contactSection = document.querySelector('[data-section="contact-form"]');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-[#5FFF56]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 lg:w-96 lg:h-96 bg-[#00CFFF]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 tracking-tight leading-tight">
            {t.pricing.title}
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light px-4">
            {t.pricing.description}
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative group animate-fade-in flex flex-col ${
                plan.popular 
                  ? 'bg-gradient-to-br from-white to-gray-50 border-2 lg:scale-105 shadow-xl lg:shadow-2xl' 
                  : 'bg-white border border-gray-200 shadow-lg'
              } rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 hover:shadow-xl transition-all duration-500`}
              style={{ 
                animationDelay: `${index * 200}ms`,
                borderColor: plan.popular ? plan.color : undefined
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div 
                  className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-black font-bold text-xs sm:text-sm shadow-lg"
                  style={{ backgroundColor: plan.color }}
                >
                  {t.pricing.plans.premium.popular}
                </div>
              )}
              
              {/* Plan header */}
              <div className="text-center mb-6 sm:mb-8">
                <div 
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${plan.color}15`, border: `2px solid ${plan.color}30` }}
                >
                  <plan.icon 
                    className="h-6 w-6 sm:h-8 sm:w-8" 
                    style={{ color: plan.color }}
                  />
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {plan.name}
                </h3>
                
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {plan.fee}
                  <span className="text-base sm:text-lg lg:text-xl text-gray-600 font-normal block sm:inline"> {t.pricing.managementFee}</span>
                </div>
                
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2 sm:px-0">
                  {plan.description}
                </p>
              </div>
              
              {/* Features */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* CTA Button - Now positioned at bottom */}
              <div className="mt-auto">
                <CalendlyButton
                  calendlyUrl={plan.calendlyUrl}
                  className={`w-full py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    plan.popular 
                      ? 'text-black hover:opacity-90' 
                      : 'border-2 text-white hover:opacity-90'
                  }`}
                  style={{ 
                    backgroundColor: plan.color,
                    borderColor: plan.popular ? undefined : plan.color
                  }}
                  variant={plan.popular ? "default" : "outline"}
                  utmSource="pricing"
                  utmMedium="website"
                  utmCampaign={`get-started-${plan.name.toLowerCase()}`}
                  utmContent={`${plan.name.toLowerCase()}-plan`}
                >
                  {t.pricing.getStarted} {plan.name}
                </CalendlyButton>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center animate-fade-in">
          <div className="bg-gradient-to-r from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-gray-200/50 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t?.pricing?.cta?.title || "Need a Custom Solution?"}
            </h3>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed px-4 sm:px-0">
              {t?.pricing?.cta?.description || "We offer tailored pricing for large portfolios and unique requirements"}
            </p>
            <Button 
              onClick={scrollToContact}
              variant="outline" 
              className="border-2 border-[#00CFFF] text-[#00CFFF] hover:bg-[#00CFFF] hover:text-white px-6 sm:px-10 py-4 sm:py-6 text-base sm:text-lg rounded-xl sm:rounded-2xl font-semibold transition-all duration-300"
            >
              {t?.pricing?.cta?.button || "Contact Us"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
