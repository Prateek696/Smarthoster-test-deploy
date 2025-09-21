
import CalendlyButton from "@/components/CalendlyButton";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Shield, Award, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Hero = () => {
  const { t } = useLanguage();
  
  console.log("Hero component is rendering, t object:", t);
  console.log("Hero title:", t?.hero?.title);
  
  return (
    <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center bg-gradient-to-br from-white via-gray-50 to-blue-50/30 overflow-hidden pt-2 sm:pt-4">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-[#00CFFF]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-[#5FFF56]/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in text-center lg:text-left">
            {/* Trust badge */}
            <div className="inline-flex items-center px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-[#5FFF56]/30 shadow-lg">
              <Award className="w-4 h-4 text-[#5FFF56] mr-2" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800">{t?.hero?.trustBadge || "Trusted by Property Owners throughout Portugal"}</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                {t?.hero?.title?.empowering || "Empowering"}
                <span className="block text-transparent bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] bg-clip-text">
                  {t?.hero?.title?.hosts || "Hosts"}
                </span>
                <span className="block text-gray-900">
                  {t?.hero?.title?.simplifying || "Simplifying"}
                </span>
                <span className="block text-[#00CFFF]">
                  {(t?.hero?.title?.stays || "Stays").replace('™', '')}<span className="text-xs align-super text-[#00CFFF]">™</span>
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
                {t?.hero?.description || "Professional property management platform that maximizes rental income while minimizing workload"}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-bold px-8 py-4 h-auto text-base rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                utmSource="hero"
                utmMedium="website"
                utmCampaign="get-started"
                utmContent="primary-cta"
              >
                {t?.header?.cta?.getStartedToday || "Get Started Today"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </CalendlyButton>
              
              <Button asChild variant="outline" className="border-2 border-[#00CFFF] text-[#00CFFF] hover:bg-[#00CFFF] hover:text-white px-8 py-4 h-auto text-base rounded-xl transition-all duration-300 group font-semibold">
                <Link to="/learn-more">
                  <Play className="mr-2 h-5 w-5" />
                  {t?.hero?.cta?.learnMore || "Learn More"}
                </Link>
              </Button>
            </div>
            
            {/* Trust badges */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pt-4 justify-center lg:justify-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs font-semibold text-gray-900">{t?.hero?.trustBadges?.sslCertified || "SSL Certified"}</div>
                  <div className="text-xs text-gray-600">{t?.hero?.trustBadges?.bankLevel || "Bank-level Security"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-xs font-semibold text-gray-900">{t?.hero?.trustBadges?.googleVerified || "Google Verified"}</div>
                  <div className="text-xs text-gray-600">{t?.hero?.trustBadges?.trustedBusiness || "Trusted Business"}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Hero Image */}
          <div className="relative animate-fade-in order-first lg:order-last">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Modern luxury apartment" 
                className="w-full h-[280px] sm:h-[350px] lg:h-[450px] xl:h-[500px] object-cover rounded-2xl shadow-2xl border border-white/20"
              />
              
              {/* Floating metrics */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/20">
                <div className="text-lg sm:text-xl font-bold text-[#5FFF56] mb-1">{t?.hero?.metrics?.incomeIncrease || "+35%"}</div>
                <div className="text-xs text-gray-600 font-medium">{t?.hero?.metrics?.incomeLabel || "Income Increase"}</div>
              </div>
              
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/20">
                <div className="text-lg sm:text-xl font-bold text-[#00CFFF] mb-1">{t?.hero?.metrics?.compliance || "100%"}</div>
                <div className="text-xs text-gray-600 font-medium">{t?.hero?.metrics?.complianceLabel || "Legal Compliance"}</div>
              </div>
              
              <div className="absolute top-1/2 right-0 transform translate-x-2 bg-white/95 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/20">
                <div className="text-sm font-bold text-gray-900 mb-1">{t?.hero?.metrics?.support || "24/7"}</div>
                <div className="text-xs text-gray-600 font-medium">{t?.hero?.metrics?.supportLabel || "Support"}</div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#5FFF56]/10 via-transparent to-[#00CFFF]/10 rounded-2xl transform rotate-2 scale-105 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
