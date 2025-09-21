
import { MessageSquare, Search, UserPlus, Rocket, Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: MessageSquare,
      title: t.howItWorks.steps.reachOut.title,
      description: t.howItWorks.steps.reachOut.description,
      color: "#5FFF56"
    },
    {
      icon: Search,
      title: t.howItWorks.steps.evaluation.title,
      description: t.howItWorks.steps.evaluation.description,
      color: "#00CFFF"
    },
    {
      icon: UserPlus,
      title: t.howItWorks.steps.onboarding.title,
      description: t.howItWorks.steps.onboarding.description,
      color: "#5FFF56"
    },
    {
      icon: Rocket,
      title: t.howItWorks.steps.goLive.title,
      description: t.howItWorks.steps.goLive.description,
      color: "#00CFFF"
    },
    {
      icon: Heart,
      title: t.howItWorks.steps.enjoy.title,
      description: t.howItWorks.steps.enjoy.description,
      color: "#5FFF56"
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#5FFF56]/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00CFFF]/8 rounded-full blur-3xl"></div>
        <div className="absolute top-2/3 left-2/3 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 lg:mb-6 tracking-tight">
            {t.howItWorks.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            {t.howItWorks.description}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4 animate-fade-in">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="text-center group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Step number and icon */}
              <div className="relative mb-6">
                <div 
                  className="w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-2xl lg:rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl border-2"
                  style={{ 
                    backgroundColor: `${step.color}20`,
                    borderColor: `${step.color}40`
                  }}
                >
                  <step.icon 
                    className="h-8 w-8 lg:h-10 lg:w-10" 
                    style={{ color: step.color }}
                  />
                </div>
                <div 
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  {index + 1}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 lg:top-10 left-full w-full h-0.5 bg-gradient-to-r from-gray-600 to-gray-700 opacity-50"></div>
                )}
              </div>
              
              <h3 className="text-lg lg:text-xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
                {step.title}
              </h3>
              
              <p className="text-sm lg:text-base text-gray-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
