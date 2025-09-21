import Layout from "@/components/Layout";
import CalendlyButton from "@/components/CalendlyButton";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Users, Shield, Globe, Calendar, ArrowRight, Phone, Signature, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LearnMore = () => {
  const { t } = useLanguage();

  const learnMore = t.learnMore || {};
  
  const locations = [
    "Lisbon", "Porto", "Algarve", 
    "Cascais", "Coimbra", "Braga", "…and more"
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {learnMore.hero?.title || "Why Property Owners Across Portugal Trust SmartHoster"}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {learnMore.hero?.description || "We don't just list your property. We build and operate a profitable rental business for you — legally compliant, fully optimized, and stress-free."}
            </p>
            <CalendlyButton
              calendlyUrl="https://calendly.com/admin-smarthoster"
              className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
              utmSource="learn-more"
              utmMedium="website"
              utmCampaign="free-consultation"
              utmContent="hero-cta"
            >
              <Phone className="mr-2 h-5 w-5" />
              {learnMore.cta?.button || "Book a Free 30-Min Consultation"}
            </CalendlyButton>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
              {learnMore.overview?.title || "What does SmartHoster do for property owners in Portugal?"}
            </h2>
            <p className="text-lg text-gray-600 mb-12 text-center leading-relaxed">
              {learnMore.overview?.description || "SmartHoster is a full-service, tech-powered rental management company. We take over everything: licensing, setup, automation, communication, cleaning, and reporting — so you earn more with less work."}
            </p>
          </div>
        </div>
      </section>

      {/* Setup Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {learnMore.services?.title || "We Handle Everything — Start to Finish"}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {learnMore.services?.subtitle || "Especially if you've just purchased a property, we'll guide you through every step of setup — and execute the majority of it on your behalf."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {(learnMore.services?.setupServices || []).map((service, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="h-6 w-6 text-[#5FFF56] mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{service}</span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-blue-900 mb-2">{learnMore.services?.important?.title || "Important:"}</p>
                  <p className="text-blue-800">
                    {learnMore.services?.important?.description || "While these setup and legalization services are part of our management process, they are negotiated separately during onboarding based on your property's needs. No two setups are the same — and we tailor everything to your situation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ongoing Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {learnMore.technology?.title || "What happens after setup?"}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {learnMore.technology?.description || "Once setup is complete, SmartHoster takes over the day-to-day management of your rental — combining automation, human support, and proven systems."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {(learnMore.technology?.ongoingServices || []).map((service, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  {index === 9 ? (
                    <TrendingUp className="h-6 w-6 text-[#00CFFF] mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-[#00CFFF] mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-gray-700">{service}</span>
                    {index === 9 && (
                      <p className="text-gray-600 text-sm mt-1">
                        {learnMore.technology?.optimizationNote || "We regularly test headlines, descriptions, and photos to improve your rankings and maximize bookings across platforms."}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900 mb-2">
                {learnMore.technology?.slogans?.automation || "If it can be automated — we automate it."}
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {learnMore.technology?.slogans?.manual || "If it needs hands-on care — we handle it."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              {learnMore.results?.title || "Where is SmartHoster available?"}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {learnMore.results?.description || "SmartHoster operates across all major cities in Portugal:"}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 p-4 bg-white rounded-lg shadow-sm">
                  <MapPin className="h-5 w-5 text-[#5FFF56]" />
                  <span className="text-gray-700 font-medium">{location}</span>
                </div>
              ))}
            </div>

            <p className="text-lg font-semibold text-gray-900">
              {learnMore.locations?.tagline || "Local teams. National infrastructure."}
            </p>
          </div>
        </div>
      </section>

      {/* Differentiators Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
                {learnMore.differentiators?.title || "What makes SmartHoster different from other property managers?"}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {learnMore.differentiators?.subtitle || "SmartHoster is the only service in Portugal offering:"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {(learnMore.differentiators?.items || []).map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-6 bg-gradient-to-r from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-lg border border-[#5FFF56]/20">
                  <CheckCircle className="h-6 w-6 text-[#5FFF56] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                </div>
              ))}
              
              {/* Data Optimization Item */}
              <div className="flex items-start space-x-3 p-6 bg-gradient-to-r from-[#5FFF56]/10 to-[#00CFFF]/10 rounded-lg border border-[#5FFF56]/20">
                <TrendingUp className="h-6 w-6 text-[#5FFF56] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-medium">{learnMore.differentiators?.dataOptimization?.title || "Data-Driven Pricing & Optimization"}</span>
                  <p className="text-gray-600 text-sm mt-1">{learnMore.differentiators?.dataOptimization?.description || "We constantly analyze market trends to adjust pricing and boost bookings — so your property stays competitive all year."}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xl font-semibold text-gray-900">
                {learnMore.differentiators?.tagline || "Most companies rent your apartment. We run your rental like a business."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Living Abroad Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                {learnMore.abroad?.title || "I live abroad. Can I still use SmartHoster?"}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {learnMore.abroad?.subtitle || "Absolutely. Many of our clients live abroad."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {(learnMore.abroad?.benefits || []).map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <Globe className="h-6 w-6 text-[#00CFFF] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                </div>
              ))}
              
              {/* Digital contracting item */}
              <div className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                <Signature className="h-6 w-6 text-[#00CFFF] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-700">{learnMore.abroad?.digitalContracting?.title || "Fully digital contracting"}</span>
                  <p className="text-gray-600 text-sm mt-1">{learnMore.abroad?.digitalContracting?.description || "We handle all legal and financial paperwork remotely — no printing, mailing, or Portuguese address required."}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {learnMore.abroad?.tagline || "You stay in control. We stay on the ground."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-16 text-center">
              {learnMore.testimonials?.title || "What do SmartHoster clients say?"}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {(learnMore.testimonials?.items || []).map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-start mb-4">
                    <Users className="h-6 w-6 text-[#5FFF56] mr-3 mt-1 flex-shrink-0" />
                    <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">— {testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="py-20 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
              {learnMore.cta?.title || "What happens on the free call?"}
            </h2>
            <p className="text-lg text-white/90 mb-8">
              {learnMore.cta?.description || "We'll walk you through:"}
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {(learnMore.consultation?.points || []).map((point, index) => (
                <div key={index} className="flex items-start space-x-3 text-left">
                  <CheckCircle className="h-6 w-6 text-white mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white">{point}</span>
                    {index === 5 && learnMore.consultation?.finalNote && (
                      <p className="text-white/90 text-sm mt-1">{learnMore.consultation.finalNote}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <CalendlyButton
              calendlyUrl="https://calendly.com/admin-smarthoster"
              className="bg-white hover:bg-gray-100 text-gray-900 font-bold px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:scale-105 mb-8"
              utmSource="learn-more"
              utmMedium="website"
              utmCampaign="free-consultation"
              utmContent="bottom-cta"
            >
              <Phone className="mr-2 h-5 w-5" />
              {learnMore.cta?.button || "Book Your Free 30-Minute Consultation"}
            </CalendlyButton>
            
            <p className="text-white text-xl font-bold mt-6">
              {learnMore.cta?.guarantee || "It's a strategy session — not a sales pitch."}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LearnMore;