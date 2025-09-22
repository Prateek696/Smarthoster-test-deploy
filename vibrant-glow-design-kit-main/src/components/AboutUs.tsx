import { Building2, Leaf, Users, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useEffect, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const AboutUs = () => {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Partner logo data with updated sizing
  const partners = [
    { 
      name: "Airbnb", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg",
      alt: "Airbnb Logo",
      size: "h-14 w-auto"
    },
    { 
      name: "Booking.com", 
      logo: "/lovable-uploads/91571bb7-a88d-4f8a-8980-48c8676a5f88.png",
      alt: "Booking.com Logo",
      size: "h-14 w-auto"
    },
    { 
      name: "VRBO", 
      logo: "/lovable-uploads/1e97073c-0f4b-4342-9f49-6c2316e60d01.png",
      alt: "VRBO Logo",
      size: "h-12 w-auto"
    },
    { 
      name: "Stripe", 
      logo: "/lovable-uploads/5c3b06b9-ea77-4c5d-8c5c-899ae19979da.png",
      alt: "Stripe Logo",
      size: "h-16 w-auto"
    },
    { 
      name: "Expedia", 
      logo: "/lovable-uploads/aebc5b43-e284-4860-864f-a60cde1e2cbb.png",
      alt: "Expedia Logo",
      size: "h-25 w-auto"
    },
    { 
      name: "Perplexity", 
      logo: "/lovable-uploads/4772273a-ae5f-422f-bb7c-a90090d2b7a4.png",
      alt: "Perplexity Logo",
      size: "h-14 w-auto"
    },
    { 
      name: "Autoridade Tributária", 
      logo: "/lovable-uploads/72305543-aec9-4d45-8662-1218d37a01d8.png",
      alt: "Autoridade Tributária Logo",
      size: "h-12 w-auto"
    },
    { 
      name: "Banco de Portugal", 
      logo: "/lovable-uploads/5bc2db7d-a98b-437e-8693-70c180504369.png",
      alt: "Banco de Portugal Logo",
      size: "h-20 w-auto"
    },
    { 
      name: "ChatGPT", 
      logo: "/lovable-uploads/e9a367ae-6416-4c61-bb99-1dfc3eba5e9a.png",
      alt: "ChatGPT Logo",
      size: "h-14 w-auto"
    },
    { 
      name: "e-fatura", 
      logo: "/lovable-uploads/c9364e8b-3349-43cc-ae6c-51f0019f7ce4.png",
      alt: "e-fatura Logo",
      size: "h-14 w-auto"
    },
    { 
      name: "European Commission", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg",
      alt: "European Commission Logo",
      size: "h-14 w-auto"
    },
    { 
      name: "Google Vacation Rentals", 
      logo: "/lovable-uploads/b461c622-c85d-4a0a-87fd-a42456390745.png",
      alt: "Google Vacation Rentals Logo",
      size: "h-14 w-auto"
    }
  ];

  // Values Grid - Premium Features for Maximum Success
  const values = [
    {
      icon: Building2,
      title: t.aboutUs.values.technology.title,
      description: t.aboutUs.values.technology.description,
      link: "/advanced-automation"
    },
    {
      icon: Users,
      title: t.aboutUs.values.expertise.title,
      description: t.aboutUs.values.expertise.description,
      link: "/full-service-management"
    },
    {
      icon: Leaf,
      title: t.aboutUs.values.sustainability.title,
      description: t.aboutUs.values.sustainability.description,
      link: "/green-pledge"
    },
    {
      icon: Globe,
      title: t.aboutUs.values.standards.title,
      description: t.aboutUs.values.standards.description,
      link: "/legal-compliance"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-blue-50/30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 tracking-tight">
            {t.aboutUs.title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed font-light px-4 sm:px-0">
            {t.aboutUs.description}
          </p>
        </div>
        
        {/* Values Grid - Premium Features for Maximum Success */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 lg:mb-20">
          {values.map((value, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl lg:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group animate-fade-in text-center"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-xl lg:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-200/50">
                <value.icon className="h-6 w-6 sm:h-7 sm:w-7 text-[#00CFFF]" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                {value.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3 sm:mb-4">
                {value.description}
              </p>
              <Button 
                asChild
                variant="outline" 
                size="sm"
                className="border-[#5FFF56] text-[#5FFF56] hover:bg-[#5FFF56] hover:text-black text-sm px-4 py-2 rounded-lg transition-all duration-300 w-full"
              >
                <Link to={value.link}>
                  Learn More
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        {/* Trusted Partner Network */}
        <div className="text-center animate-fade-in">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 lg:mb-12">
            {t.aboutUs.partners.title}
          </h3>
          
          <div className="relative max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                }) as any,
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {partners.map((partner, index) => (
                  <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-500 group h-[140px] sm:h-[160px] w-full flex items-center justify-center">
                      <div className="w-full h-full flex items-center justify-center p-4 transition-all duration-500 ease-in-out">
                        <img 
                          src={partner.logo} 
                          alt={partner.alt}
                          className={`${partner.size} max-w-full object-contain filter grayscale transition-all duration-500 ease-in-out logo-breathe`}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-gray-600 font-semibold text-sm sm:text-base text-center">${partner.name}</span>`;
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex -left-12 border-2 border-gray-200 hover:border-[#00CFFF] hover:bg-[#00CFFF] hover:text-white transition-all duration-300" />
              <CarouselNext className="hidden sm:flex -right-12 border-2 border-gray-200 hover:border-[#00CFFF] hover:bg-[#00CFFF] hover:text-white transition-all duration-300" />
            </Carousel>
          </div>
          
          {/* Trust Badge */}
          <div className="mt-8 sm:mt-12 inline-flex items-center px-4 sm:px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-[#5FFF56]/30 shadow-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#5FFF56] mr-3" />
            <span className="text-sm sm:text-base font-semibold text-gray-800">{t.hero.trustBadge}</span>
          </div>
        </div>
        
        {/* Learn More CTA */}
        <div className="mt-16 text-center animate-fade-in">
          <Button 
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] hover:from-[#4EE045] hover:to-[#00B8E6] text-black font-semibold px-8 py-6 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <Link to="/learn-more">
              Learn More About Our Services
            </Link>
          </Button>
        </div>
      </div>

      {/* Custom CSS for breathing animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes logo-breathe {
            0% { 
              transform: scale(1);
              filter: grayscale(100%);
            }
            50% { 
              transform: scale(1.1);
              filter: grayscale(0%);
            }
            100% { 
              transform: scale(1);
              filter: grayscale(100%);
            }
          }
          
          .logo-breathe {
            animation: logo-breathe 4s ease-in-out infinite;
          }
        `
      }} />
    </section>
  );
};

export default AboutUs;
