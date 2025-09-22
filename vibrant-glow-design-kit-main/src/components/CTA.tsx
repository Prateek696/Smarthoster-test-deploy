
import CalendlyButton from "@/components/CalendlyButton";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTA = () => {
  const { t } = useLanguage();
  
  const benefits = [
    t?.howItWorks?.cta?.benefits?.platform || "Professional property management platform",
    t?.howItWorks?.cta?.benefits?.specialist || "Dedicated onboarding specialist", 
    t?.howItWorks?.cta?.benefits?.expertise || "Local expertise in Portuguese market",
    t?.howItWorks?.cta?.benefits?.compliance || "Comprehensive legal compliance support"
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {t?.howItWorks?.cta?.title || "Ready to Get Started?"}
            </h2>
            
            <p className="text-2xl sm:text-xl lg:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              {t?.howItWorks?.cta?.description || "Join hundreds of successful property owners who trust SmartHoster.io"}
            </p>
            
            <div className="flex flex-col items-start text-left space-y-4 max-w-2xl mx-auto mb-10">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start w-full text-white animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="h-7 w-7 mr-4 mt-1 flex-shrink-0" />
                  <span className="text-xl sm:text-base lg:text-lg font-medium leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col gap-4 justify-center items-center max-w-md mx-auto">
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center w-full h-auto min-h-12"
                utmSource="cta-section"
                utmMedium="website"
                utmCampaign="get-started"
                utmContent="main-cta"
              >
                {t?.header?.cta?.getStartedToday || "Get Started Today"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </CalendlyButton>
              
              <Button 
                asChild
                variant="outline" 
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-gray-900 px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl rounded-lg transition-all duration-300 font-semibold w-full h-auto min-h-12"
              >
                <Link to="/learn-more">
                  <Phone className="mr-2 h-6 w-6" />
                  {t?.hero?.cta?.learnMore || "Learn More"}
                </Link>
              </Button>
            </div>
            
            <p className="text-lg text-white/80 mt-6 font-medium">
              {t?.howItWorks?.cta?.ssl || "SSL Secured Process"} • {t?.howItWorks?.cta?.support || "Professional support included"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
