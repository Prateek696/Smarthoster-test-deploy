
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, FileText, Calculator, Building, Laptop, Shield, Receipt, TrendingUp, Calendar } from "lucide-react";
import CalendlyButton from "@/components/CalendlyButton";

const AutomatedBilling = () => {
  const { t } = useLanguage();

  const FeatureSection = ({ icon: Icon, title, description, features, tagline }) => (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center space-x-3 mb-4">
          <Icon className="h-8 w-8 text-[#5FFF56]" />
          <CardTitle className="text-2xl font-bold text-gray-900">{title}</CardTitle>
        </div>
        <p className="text-gray-600 text-lg">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <Check className="h-5 w-5 text-[#5FFF56] mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="bg-[#5FFF56] bg-opacity-10 border border-[#5FFF56] border-opacity-30 rounded-lg p-4">
          <p className="text-gray-800 font-medium">📌 {tagline}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Automated Billing & Legal Reporting
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#5FFF56] mb-8">
              {t.billing?.hero?.title || "Full Automation. Total Confidence."}
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.billing?.hero?.subtitle || "Forget spreadsheets, confusion, and manual reporting. SmartHoster automates every legal and financial aspect of your short-term rental in Portugal—accurately, instantly, and effortlessly."}
            </p>
            <CalendlyButton
              calendlyUrl="https://calendly.com/admin-smarthoster"
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 rounded-lg text-lg font-medium"
              utmSource="automated-billing"
              utmMedium="website"
              utmCampaign="book-consultation"
              utmContent="hero-section"
            >
              {t.billing?.hero?.cta || "Schedule Your Introduction"}
            </CalendlyButton>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Certified Billing */}
            <FeatureSection
              icon={Receipt}
              title={t.billing?.certifiedBilling?.title || "🧾 Certified Billing – No Software Required"}
              description={t.billing?.certifiedBilling?.description}
              features={t.billing?.certifiedBilling?.features || []}
              tagline={t.billing?.certifiedBilling?.tagline}
            />

            {/* AIMA Reporting */}
            <FeatureSection
              icon={Shield}
              title={t.billing?.aimaReporting?.title || "🛂 AIMA/SIBA Guest Reports"}
              description={t.billing?.aimaReporting?.description}
              features={t.billing?.aimaReporting?.features || []}
              tagline={t.billing?.aimaReporting?.tagline}
            />

            {/* Modelo 30 */}
            <FeatureSection
              icon={FileText}
              title={t.billing?.modelo30?.title || "📄 Modelo 30 Reporting"}
              description={t.billing?.modelo30?.description}
              features={t.billing?.modelo30?.features || []}
              tagline={t.billing?.modelo30?.tagline}
            />

            {/* Tourist Tax */}
            <FeatureSection
              icon={Calculator}
              title={t.billing?.touristTax?.title || "🏛️ Municipal Tourist Tax (TMT)"}
              description={t.billing?.touristTax?.description}
              features={t.billing?.touristTax?.features || []}
              tagline={t.billing?.touristTax?.tagline}
            />

            {/* INE Reporting */}
            <FeatureSection
              icon={TrendingUp}
              title={t.billing?.ineReporting?.title || "📊 INE Reporting (IPHH & IPCAMP)"}
              description={t.billing?.ineReporting?.description}
              features={t.billing?.ineReporting?.features || []}
              tagline={t.billing?.ineReporting?.tagline}
            />

            {/* COPE Reporting */}
            <FeatureSection
              icon={Building}
              title={t.billing?.copeReporting?.title || "🏦 COPE Reporting – Banco de Portugal"}
              description={t.billing?.copeReporting?.description}
              features={t.billing?.copeReporting?.features || []}
              tagline={t.billing?.copeReporting?.tagline}
            />

            {/* Airbnb Invoicing */}
            <FeatureSection
              icon={Laptop}
              title={t.billing?.airbnbInvoicing?.title || "🧾 Airbnb Commission Invoicing"}
              description={t.billing?.airbnbInvoicing?.description}
              features={t.billing?.airbnbInvoicing?.features || []}
              tagline={t.billing?.airbnbInvoicing?.tagline}
            />

            {/* Property Types */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {t.billing?.propertyTypes?.title || "Designed for Every Property Type"}
                </CardTitle>
                <p className="text-gray-600 text-lg">
                  {t.billing?.propertyTypes?.description || "SmartHoster's billing engine scales across:"}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {(t.billing?.propertyTypes?.types || []).map((type, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-[#5FFF56]" />
                      <span className="text-gray-700">{type}</span>
                    </li>
                  ))}
                </ul>
                <div className="bg-[#5FFF56] bg-opacity-10 border border-[#5FFF56] border-opacity-30 rounded-lg p-4">
                  <p className="text-gray-800 font-medium">
                    📌 {t.billing?.propertyTypes?.tagline || "Whatever your setup, we handle it."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Daily Operations */}
            <FeatureSection
              icon={Calendar}
              title={t.billing?.dailyOps?.title || "💸 Daily Operations Synced with Compliance"}
              description={t.billing?.dailyOps?.description}
              features={t.billing?.dailyOps?.features || []}
              tagline={t.billing?.dailyOps?.tagline}
            />

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-[#5FFF56] to-[#4EE045] text-black">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  {t.billing?.cta?.title || "Ready to Ditch the Paperwork?"}
                </h3>
                <p className="text-lg mb-6">
                  {t.billing?.cta?.description || "Try SmartHoster free for 14 days. No credit card. No commitment. Full automation."}
                </p>
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 px-8 py-4 rounded-lg text-lg font-medium"
                  utmSource="automated-billing"
                  utmMedium="website"
                  utmCampaign="book-consultation"
                  utmContent="cta-section"
                >
                  👉 {t.billing?.cta?.button || "Book Your Consultation"}
                </CalendlyButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AutomatedBilling;
