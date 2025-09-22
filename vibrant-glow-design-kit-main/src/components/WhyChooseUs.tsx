
import { CheckCircle, Clock, Shield, Award, HeadphonesIcon, Zap } from "lucide-react";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: CheckCircle,
      title: "Proven Results",
      description: "Average 35% increase in revenue within the first 3 months"
    },
    {
      icon: Clock,
      title: "Save Time",
      description: "Automated processes reduce management time by 80%"
    },
    {
      icon: Shield,
      title: "Full Protection",
      description: "Comprehensive insurance and 24/7 security monitoring"
    },
    {
      icon: Award,
      title: "Industry Leading",
      description: "Award-winning platform trusted by top property managers"
    },
    {
      icon: HeadphonesIcon,
      title: "Expert Support",
      description: "Dedicated account managers and round-the-clock assistance"
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Get your property listed and earning within 24 hours"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose
              <span className="block text-transparent bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] bg-clip-text">
                SmartHoster.io?
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're not just another property management platform. We're your partner in success, 
              providing cutting-edge technology and personalized service to maximize your property's potential.
            </p>
            
            <div className="space-y-6">
              {reasons.map((reason, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0">
                    <reason.icon className="h-6 w-6 text-[#5FFF56]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600">
                      {reason.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Content - Image */}
          <div className="relative animate-fade-in">
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Modern workspace" 
                className="w-full h-[600px] object-cover rounded-3xl shadow-2xl"
              />
              
              {/* Floating metrics cards */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-[#5FFF56]">↗ 35%</div>
                <div className="text-sm text-gray-600">Revenue Increase</div>
              </div>
              
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-[#00CFFF]">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-full h-full bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
