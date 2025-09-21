
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { 
  DollarSign, 
  Brain, 
  RotateCcw, 
  Globe, 
  Bot, 
  Settings, 
  TrendingUp, 
  Phone,
  ArrowRight,
  CheckCircle,
  Search,
  Calendar,
  CreditCard,
  Mail,
  Repeat,
  MapPin
} from "lucide-react";

const EnhancedDirectBookings = () => {
  const { t } = useLanguage();

  const whyDirectBookingsMatter = [
    {
      icon: DollarSign,
      title: t.directBookings.whyMatter.commission.title,
      description: t.directBookings.whyMatter.commission.description,
      highlight: "15%+"
    },
    {
      icon: TrendingUp,
      title: t.directBookings.whyMatter.profit.title,
      description: t.directBookings.whyMatter.profit.description,
      highlight: "100%"
    }
  ];

  const howItWorks = [
    {
      icon: Globe,
      title: t.directBookings.howItWorks.brandedUrl.title,
      description: t.directBookings.howItWorks.brandedUrl.description
    },
    {
      icon: Search,
      title: t.directBookings.howItWorks.mobileFirst.title,
      description: t.directBookings.howItWorks.mobileFirst.description
    },
    {
      icon: Calendar,
      title: t.directBookings.howItWorks.builtIn.title,
      description: t.directBookings.howItWorks.builtIn.description
    },
    {
      icon: CreditCard,
      title: t.directBookings.howItWorks.directBooking.title,
      description: t.directBookings.howItWorks.directBooking.description
    }
  ];

  const lifetimeValue = [
    {
      icon: Mail,
      title: t.directBookings.lifetimeValue.captures.title,
      description: t.directBookings.lifetimeValue.captures.description
    },
    {
      icon: Repeat,
      title: t.directBookings.lifetimeValue.followUp.title,
      description: t.directBookings.lifetimeValue.followUp.description
    },
    {
      icon: TrendingUp,
      title: t.directBookings.lifetimeValue.newsletters.title,
      description: t.directBookings.lifetimeValue.newsletters.description
    }
  ];

  const googleFeatures = [
    t.directBookings.google.features.findInSearch,
    t.directBookings.google.features.bookWithoutAirbnb,
    t.directBookings.google.features.discoverProperty
  ];

  const aiStrategies = [
    t.directBookings.aiOptimization.strategies.structured,
    t.directBookings.aiOptimization.strategies.fastAnswers,
    t.directBookings.aiOptimization.strategies.semantic,
    t.directBookings.aiOptimization.strategies.aiDirectories,
    t.directBookings.aiOptimization.strategies.llmReadable
  ];

  const includedFeatures = [
    t.directBookings.included.seoOptimized,
    t.directBookings.included.googleBusiness,
    t.directBookings.included.integratedPayments,
    t.directBookings.included.liveCalendar,
    t.directBookings.included.guestData,
    t.directBookings.included.automatedFollowUp,
    t.directBookings.included.repeatGuest,
    t.directBookings.included.otaSync,
    t.directBookings.included.brandFirst,
    t.directBookings.included.totalControl
  ];

  const whyItWorks = [
    t.directBookings.whyItWorks.higherEarnings,
    t.directBookings.whyItWorks.noCommission,
    t.directBookings.whyItWorks.calendarControl,
    t.directBookings.whyItWorks.googleAI,
    t.directBookings.whyItWorks.repeatBookings,
    t.directBookings.whyItWorks.longTerm
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t.directBookings.hero.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t.directBookings.hero.description}
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {t.directBookings.hero.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Direct Bookings Matter */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 rounded-2xl p-8 mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mr-4">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t.directBookings.whyMatter.title}
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.directBookings.whyMatter.description}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {t.directBookings.whyMatter.solution}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.howItWorks.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {howItWorks.map((item, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-xl flex items-center justify-center mr-4">
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-[#00CFFF]/10 to-[#5FFF56]/10 rounded-2xl p-8">
                <p className="text-gray-700 text-center italic text-lg leading-relaxed">
                  {t.directBookings.howItWorks.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lifetime Value */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.lifetimeValue.title}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {lifetimeValue.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {t.directBookings.lifetimeValue.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Google Visibility */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.google.title}
              </h2>
              
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.directBookings.google.description}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {googleFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-6 w-6 text-[#5FFF56] mr-3 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {t.directBookings.google.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Optimization */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.aiOptimization.title}
              </h2>
              
              <div className="bg-blue-50 rounded-2xl p-8 mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.directBookings.aiOptimization.description}
                </p>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Our AEO approach includes:</h4>
                  <div className="space-y-3">
                    {aiStrategies.map((strategy, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 text-sm">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  {t.directBookings.aiOptimization.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.included.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {includedFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <CheckCircle className="h-5 w-5 text-[#5FFF56] mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why It Works */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.directBookings.whyItWorks.title}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {whyItWorks.map((point, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final Statement */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-[#00CFFF]/10 to-[#5FFF56]/10 rounded-2xl p-8 mb-8">
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {t.directBookings.finalStatement.main}
                </p>
                <p className="text-gray-600 font-medium">
                  {t.directBookings.finalStatement.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56]">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                {t.directBookings.cta.title}
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {t.directBookings.cta.description}
              </p>
              <p className="text-lg text-white/80 mb-10">
                {t.directBookings.cta.subtitle}
              </p>
              
              <Button 
                asChild
                size="lg"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-10 py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                <Link to="/learn-more">
                  <Phone className="mr-2 h-5 w-5" />
                  {t.directBookings.cta.button}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default EnhancedDirectBookings;
