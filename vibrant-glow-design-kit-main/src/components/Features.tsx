
import { DollarSign, Home, FileCheck, Zap, CreditCard, MousePointer, User, MapPin, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: DollarSign,
      title: t.features.list.maxIncome.title,
      description: t.features.list.maxIncome.description,
      color: "#5FFF56",
      route: "/income-strategy"
    },
    {
      icon: Home,
      title: t.features.list.fullService.title,
      description: t.features.list.fullService.description,
      color: "#00CFFF",
      route: "/full-service-management"
    },
    {
      icon: FileCheck,
      title: t.features.list.legalCompliance.title,
      description: t.features.list.legalCompliance.description,
      color: "#5FFF56",
      route: "/legal-compliance"
    },
    {
      icon: Zap,
      title: t.features.list.automation.title,
      description: t.features.list.automation.description,
      color: "#00CFFF",
      route: "/advanced-automation"
    },
    {
      icon: CreditCard,
      title: t.features.list.billing.title,
      description: t.features.list.billing.description,
      color: "#5FFF56",
      route: "/automated-billing"
    },
    {
      icon: MousePointer,
      title: t.features.list.directBookings.title,
      description: t.features.list.directBookings.description,
      color: "#00CFFF",
      route: "/enhanced-direct-bookings"
    },
    {
      icon: User,
      title: t.features.list.clientPortal.title,
      description: t.features.list.clientPortal.description,
      color: "#5FFF56",
      route: "/portal"
    },
    {
      icon: MapPin,
      title: t.features.list.localExpertise.title,
      description: t.features.list.localExpertise.description,
      color: "#00CFFF",
      route: "/local-expertise"
    },
    {
      icon: Leaf,
      title: t.features.list.greenPledge.title,
      description: t.features.list.greenPledge.description,
      color: "#5FFF56",
      route: "/green-pledge"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            {t.features.title}
            <span className="block text-transparent bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] bg-clip-text">
              {t.features.subtitle}
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            {t.features.description}
          </p>
        </div>
        
        {/* Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white p-6 rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-500 animate-fade-in hover:border-gray-300/50 hover:-translate-y-1 flex flex-col h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                style={{ backgroundColor: `${feature.color}15`, border: `2px solid ${feature.color}30` }}
              >
                <feature.icon 
                  className="h-6 w-6" 
                  style={{ color: feature.color }}
                />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed mb-4 text-sm flex-grow">
                {feature.description}
              </p>

              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="w-full h-10 border-2 hover:bg-gray-50 transition-all duration-300 font-semibold text-xs mt-auto"
                style={{ borderColor: `${feature.color}50`, color: feature.color }}
              >
                <Link to={feature.route}>
                  {t.features.learnMore}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="lg:hidden">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {features.map((feature, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2">
                  <div className="group bg-white p-6 rounded-2xl border border-gray-200/50 hover:shadow-xl transition-all duration-500 animate-fade-in hover:border-gray-300/50 flex flex-col h-full">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                      style={{ backgroundColor: `${feature.color}15`, border: `2px solid ${feature.color}30` }}
                    >
                      <feature.icon 
                        className="h-6 w-6" 
                        style={{ color: feature.color }}
                      />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm flex-grow">
                      {feature.description}
                    </p>

                    <Button 
                      asChild
                      variant="outline" 
                      size="sm"
                      className="w-full h-10 border-2 hover:bg-gray-50 transition-all duration-300 font-semibold text-xs mt-auto"
                      style={{ borderColor: `${feature.color}50`, color: feature.color }}
                    >
                      <Link to={feature.route}>
                        {t.features.learnMore}
                      </Link>
                    </Button>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Features;
