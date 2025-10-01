import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { 
  Search, 
  Camera, 
  Calendar, 
  FileText, 
  Sparkles, 
  Cog, 
  MapPin,
  DollarSign,
  Users,
  Shield,
  BarChart3,
  CheckCircle,
  Star
} from "lucide-react";

const FullServiceManagement = () => {
  const { t } = useLanguage();

  const highlights = [
    { icon: Search, key: "alCompliance" },
    { icon: Search, key: "seoAeo" },
    { icon: FileText, key: "keywordRich" },
    { icon: MapPin, key: "googleBusiness" },
    { icon: Camera, key: "photography" },
    { icon: Users, key: "welcomeKits" },
    { icon: Calendar, key: "directBooking" }
  ];

  const services = [
    { icon: Search, key: "aiOptimized" },
    { icon: Users, key: "bookingGuest" },
    { icon: FileText, key: "taxCompliance" },
    { icon: Sparkles, key: "cleaningMaintenance" },
    { icon: Calendar, key: "directBookingSite" },
    { icon: MapPin, key: "googleSeo" }
  ];

  const benefits = [
    { icon: DollarSign, key: "maximizeIncome" },
    { icon: Search, key: "aeoAdvantage" },
    { icon: Shield, key: "fullCompliance" },
    { icon: BarChart3, key: "ownerDashboard" },
    { icon: CheckCircle, key: "guestReady" }
  ];

  const steps = [
    { icon: Users, number: "1", key: "consultation" },
    { icon: Cog, number: "2", key: "liveManagement" },
    { icon: BarChart3, number: "3", key: "growthReporting" }
  ];

  const faqs = [
    { key: "whatIncludes" },
    { key: "howOptimized" },
    { key: "ownCleaner" },
    { key: "platforms" },
    { key: "maintenance" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {t.fullService.hero.headline}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.fullService.hero.subheadline}
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
            >
              <Link to="/contact">{t.fullService.hero.cta}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.fullService.whatWeDo.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {t.fullService.whatWeDo.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {highlights.map((highlight, index) => (
                <Card key={index} className="border-2 border-gray-100 hover:border-[#5FFF56] transition-colors">
                  <CardHeader className="text-center">
                    <highlight.icon className="h-12 w-12 text-[#5FFF56] mx-auto mb-4" />
                    <CardTitle className="text-lg">
                      {t.fullService.whatWeDo.highlights[highlight.key].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-center">
                      {t.fullService.whatWeDo.highlights[highlight.key].description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-Service Includes Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.fullService.includes.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#5FFF56]">
                  <div className="flex items-start space-x-4">
                    <service.icon className="h-8 w-8 text-[#5FFF56] mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {t.fullService.includes.services[service.key].title}
                      </h3>
                      <p className="text-gray-600">
                        {t.fullService.includes.services[service.key].description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.fullService.whyChoose.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                {t.fullService.whyChoose.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <benefit.icon className="h-16 w-16 text-[#5FFF56] mx-auto mb-4" />
                    <CardTitle className="text-xl">
                      {t.fullService.whyChoose.benefits[benefit.key].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t.fullService.whyChoose.benefits[benefit.key].description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.fullService.process.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-black">{step.number}</span>
                    </div>
                    <step.icon className="h-12 w-12 text-gray-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {t.fullService.process.steps[step.key].title}
                  </h3>
                  <p className="text-gray-600">
                    {t.fullService.process.steps[step.key].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.fullService.faqs.title}
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-l-4 border-[#5FFF56]">
                  <CardHeader>
                    <CardTitle className="text-lg text-left">
                      {t.fullService.faqs.questions[faq.key].question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {t.fullService.faqs.questions[faq.key].answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {t.fullService.finalCta.title}
            </h2>
            <Button 
              asChild
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
            >
              <Link to="/contact">{t.fullService.finalCta.button}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FullServiceManagement;
