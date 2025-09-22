
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import CalendlyButton from "@/components/CalendlyButton";
import { 
  Shield, 
  CreditCard, 
  FileText, 
  Brush, 
  TrendingUp, 
  Smartphone, 
  Car,
  Lock,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Integrations = () => {
  const { t } = useLanguage();

  const integrationCategories = [
    {
      title: t.integrations.categories.smartLocks.title,
      icon: Lock,
      description: t.integrations.categories.smartLocks.description,
      platforms: ["Nuki", "TTLock", "Igloohome", "KeyNest", "Salto", "Homeit"]
    },
    {
      title: t.integrations.categories.payments.title,
      icon: CreditCard,
      description: t.integrations.categories.payments.description,
      platforms: ["Stripe", "Rebvoice", "VATInvoice"]
    },
    {
      title: t.integrations.categories.compliance.title,
      icon: FileText,
      description: t.integrations.categories.compliance.description,
      platforms: ["AT", "SEF", "Banco de Portugal", "eFatura"]
    },
    {
      title: t.integrations.categories.cleaning.title,
      icon: Brush,
      description: t.integrations.categories.cleaning.description,
      platforms: ["Doinn", "Swikly", "Bounce"]
    },
    {
      title: t.integrations.categories.pricing.title,
      icon: TrendingUp,
      description: t.integrations.categories.pricing.description,
      platforms: ["Duve", "hostyAI", "PriceLabs"]
    },
    {
      title: t.integrations.categories.guestExperience.title,
      icon: Smartphone,
      description: t.integrations.categories.guestExperience.description,
      platforms: ["TouchStay", "Enso Connect"]
    },
    {
      title: t.integrations.categories.travel.title,
      icon: Car,
      description: t.integrations.categories.travel.description,
      platforms: ["Welcome Pickups", "GetYourGuide", "LUGGit"]
    },
    {
      title: t.integrations.categories.insurance.title,
      icon: Shield,
      description: t.integrations.categories.insurance.description,
      platforms: ["Superhog", "Know Your Guest", "Safely.com"]
    }
  ];

  const benefits = [
    t.integrations.benefits.optional,
    t.integrations.benefits.coreHandled,
    t.integrations.benefits.extendable,
    t.integrations.benefits.autoCommissions,
    t.integrations.benefits.noContracts,
    t.integrations.benefits.cleaningSupport
  ];

  const bottomLinePoints = [
    t.integrations.bottomLine.sync,
    t.integrations.bottomLine.noBreaks,
    t.integrations.bottomLine.performance,
    t.integrations.bottomLine.control,
    t.integrations.bottomLine.accountability,
    t.integrations.bottomLine.seamlessExperience
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {t.integrations.hero.title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {t.integrations.hero.description}
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  {t.integrations.hero.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Integrations Matter */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-blue-50 rounded-2xl p-8 mb-12">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t.integrations.whyMatter.title}
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {t.integrations.whyMatter.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Categories */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.integrations.ecosystem.title}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {integrationCategories.map((category, index) => (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-xl flex items-center justify-center mr-4">
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.platforms.map((platform, platformIndex) => (
                        <span key={platformIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {platform}
                        </span>
                      ))}
                    </div>
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
                {t.integrations.whyWorks.title}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-[#5FFF56] mr-3 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Flexibility Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t.integrations.flexibility.title}
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                {t.integrations.flexibility.description}
              </p>
              
              <div className="bg-gradient-to-r from-[#00CFFF]/10 to-[#5FFF56]/10 rounded-2xl p-8">
                <p className="text-gray-700 italic text-lg leading-relaxed">
                  {t.integrations.flexibility.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Line */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                {t.integrations.bottomLine.title}
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {bottomLinePoints.map((point, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-gray-700 font-medium">{point}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-[#00CFFF]/10 to-[#5FFF56]/10 rounded-2xl p-8">
                <p className="text-gray-900 text-lg font-medium italic text-center leading-relaxed">
                  {t.integrations.bottomLine.scaling}
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
                {t.integrations.cta.title}
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {t.integrations.cta.description}
              </p>
              <p className="text-lg text-white/80 mb-10">
                {t.integrations.cta.subtitle}
              </p>
              
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-10 py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105"
                size="lg"
                utmSource="integrations-page"
                utmMedium="cta-button"
                utmCampaign="consultation"
              >
                {t.integrations.cta.button}
                <ArrowRight className="ml-2 h-5 w-5" />
              </CalendlyButton>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Integrations;
