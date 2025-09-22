
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { t } = useLanguage();
  
  const testimonials = [
    {
      name: "Luis M.",
      role: t?.testimonials?.roles?.villaOwner || "Villa Owner",
      location: "Algarve",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: t?.testimonials?.quotes?.luis || "SmartHoster.io transformed my beachfront villa into a consistent income generator. The automation and local expertise made all the difference - my revenue increased 40% in just 6 months."
    },
    {
      name: "Maria S.",
      role: t?.testimonials?.roles?.apartmentHost || "Apartment Host",
      location: "Porto",
      image: "https://images.unsplash.com/photo-1494790108755-2616b86e8d1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: t?.testimonials?.quotes?.maria || "The legal compliance features are incredible. I never worry about SEF reporting or tax obligations anymore. Everything is handled professionally and automatically."
    },
    {
      name: "Carlos R.",
      role: t?.testimonials?.roles?.propertyInvestor || "Property Investor",
      location: "Lisboa",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: t?.testimonials?.quotes?.carlos || "Managing multiple properties was overwhelming until I found SmartHoster. Now I focus on expanding my portfolio while they handle all operations seamlessly."
    },
    {
      name: "Ana F.",
      role: t?.testimonials?.roles?.vacationRentalHost || "Vacation Rental Host",
      location: "Óbidos",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: t?.testimonials?.quotes?.ana || "The green initiatives and sustainable practices align perfectly with my values. My guests love the eco-friendly approach, and bookings have doubled since switching."
    },
    {
      name: "Pedro L.",
      role: t?.testimonials?.roles?.boutiqueHotelOwner || "Boutique Hotel Owner",
      location: "Coimbra",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: t?.testimonials?.quotes?.pedro || "They integrated my boutique hotel across all major platforms and set up an automated messaging system that actually feels human. It saves me hours every week — and guests love it."
    },
    {
      name: "Sofia T.",
      role: t?.testimonials?.roles?.countrysideVillaHost || "Countryside Villa Host",
      location: "Aveiro",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      rating: 5,
      quote: t?.testimonials?.quotes?.sofia || "With their direct booking setup, I cut commission costs and now earn more from repeat guests."
    }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4 lg:mb-6 tracking-tight">
            {t.testimonials.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            {t.testimonials.description}
          </p>
        </div>
        
        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2">
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200/50 hover:shadow-xl transition-all duration-500 animate-fade-in group hover:-translate-y-1 h-full">
                  {/* Quote Icon */}
                  <div className="w-10 h-10 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Quote className="h-5 w-5 text-[#00CFFF]" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 font-light">
                    "{testimonial.quote}"
                  </p>
                  
                  {/* Author */}
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-3 border-2 border-gray-100">
                      <AvatarImage 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#5FFF56]/20 to-[#00CFFF]/20 text-gray-700 font-semibold text-sm">
                        {getInitials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">
                        {testimonial.name}
                      </div>
                      <div className="text-gray-600 font-medium text-xs">
                        {testimonial.role} • {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default Testimonials;
