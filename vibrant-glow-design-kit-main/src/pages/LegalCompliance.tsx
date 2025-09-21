
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, FileText, Users, AlertTriangle, Gavel } from "lucide-react";

const LegalCompliance = () => {
  const { t } = useLanguage();
  const compliance = t.compliance || {};

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16 sm:py-20 lg:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Shield className="h-12 w-12 sm:h-16 sm:w-16 text-blue-300 animate-glow-pulse hover:scale-110 transition-all duration-300" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              {compliance.hero?.title || "Stay Compliant. Stay Confident."}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
              {compliance.hero?.subtitle || "Automated legal compliance, tax reporting, and seamless integration with Portuguese authorities."}
            </p>
            <Button 
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {compliance.hero?.cta || "Learn More About Our Compliance Services"}
            </Button>
          </div>
        </div>
      </section>

      {/* SEF/AIMA Understanding Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {compliance.sefAima?.title || "Understanding SEF/AIMA Reporting Obligations"}
              </h2>
              <h3 className="text-lg sm:text-xl text-blue-600 font-semibold mb-4">
                {compliance.sefAima?.subtitle || "Legal Requirements for Short-Term Rentals in Portugal"}
              </h3>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-base sm:text-lg">
                {compliance.sefAima?.description || "Operating a short-term rental in Portugal entails specific legal obligations..."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Important Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              {compliance.whyImportant?.title || "Why SEF/AIMA Reporting Is Important"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Gavel className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {compliance.whyImportant?.legalCompliance?.title || "Legal Compliance"}
                  </h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">
                      {compliance.whyImportant?.legalCompliance?.mandatory || "Mandatory requirement text"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">
                      {compliance.whyImportant?.legalCompliance?.security || "National security text"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">
                      {compliance.whyImportant?.legalCompliance?.transparency || "Transparency text"}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    {compliance.whyImportant?.professionalism?.title || "Professionalism"}
                  </h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">
                      {compliance.whyImportant?.professionalism?.credibility || "Credibility text"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-700">
                      {compliance.whyImportant?.professionalism?.trust || "Trust building text"}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges and Solutions */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              {compliance.challenges?.title || "Challenges and Our Solution"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-red-50 p-6 sm:p-8 rounded-xl border border-red-200">
                <div className="flex items-center mb-4 sm:mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-red-900">
                    {compliance.challenges?.complexity?.title || "Complexity of Compliance"}
                  </h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="text-sm sm:text-base text-red-800">
                    • {compliance.challenges?.complexity?.understanding || "Understanding requirements"}
                  </li>
                  <li className="text-sm sm:text-base text-red-800">
                    • {compliance.challenges?.complexity?.hesitation || "Guest hesitation"}
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-6 sm:p-8 rounded-xl border border-green-200">
                <div className="flex items-center mb-4 sm:mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-xl sm:text-2xl font-semibold text-green-900">
                    {compliance.challenges?.solution?.title || "How SmartHoster Assists"}
                  </h3>
                </div>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="text-sm sm:text-base text-green-800">
                    • {compliance.challenges?.solution?.streamlined || "Streamlined process"}
                  </li>
                  <li className="text-sm sm:text-base text-green-800">
                    • {compliance.challenges?.solution?.communication || "Clear communication"}
                  </li>
                  <li className="text-sm sm:text-base text-green-800">
                    • {compliance.challenges?.solution?.security || "Secure data handling"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Penalties Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              {compliance.penalties?.title || "Penalties for Non-Compliance"}
            </h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-l-4 border-red-500">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {compliance.penalties?.financial?.title || "Financial Penalties"}
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                  <li>• {compliance.penalties?.financial?.individuals || "Individual fines"}</li>
                  <li>• {compliance.penalties?.financial?.corporations || "Corporate fines"}</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-l-4 border-orange-500">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {compliance.penalties?.legal?.title || "Legal Consequences"}
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                  <li>• {compliance.penalties?.legal?.criminal || "Criminal charges"}</li>
                  <li>• {compliance.penalties?.legal?.imprisonment || "Imprisonment"}</li>
                  <li>• {compliance.penalties?.legal?.restrictions || "Operational restrictions"}</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-l-4 border-yellow-500">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  {compliance.penalties?.condominium?.title || "Condominium Impact"}
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                  <li>• {compliance.penalties?.condominium?.intervention || "Condominium intervention"}</li>
                  <li>• {compliance.penalties?.condominium?.grounds || "Legal grounds"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Manage Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 sm:mb-12">
              {compliance.management?.title || "How SmartHoster Manages SEF/AIMA Reporting"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white/10 p-6 sm:p-8 rounded-xl backdrop-blur-sm">
                <FileText className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base">
                  {compliance.management?.inclusive || "Inclusive service description"}
                </p>
              </div>
              <div className="bg-white/10 p-6 sm:p-8 rounded-xl backdrop-blur-sm">
                <Users className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base">
                  {compliance.management?.expert || "Expert team description"}
                </p>
              </div>
              <div className="bg-white/10 p-6 sm:p-8 rounded-xl backdrop-blur-sm">
                <Shield className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base">
                  {compliance.management?.systems || "Advanced systems description"}
                </p>
              </div>
              <div className="bg-white/10 p-6 sm:p-8 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-sm sm:text-base">
                  {compliance.management?.security || "Data security description"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tourist Tax Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
              {compliance.touristTax?.title || "Tourist Tax Collection"}
            </h2>
            <p className="text-base sm:text-lg text-gray-700 text-center mb-8 sm:mb-12">
              {compliance.touristTax?.description || "Tourist tax collection description"}
            </p>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">€</span>
                </div>
                <p className="text-sm sm:text-base text-gray-700">
                  {compliance.touristTax?.support?.calculation || "Automated calculation"}
                </p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm sm:text-base text-gray-700">
                  {compliance.touristTax?.support?.collection || "Transparent collection"}
                </p>
              </div>
              <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-sm sm:text-base text-gray-700">
                  {compliance.touristTax?.support?.remittance || "Timely remittance"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#5FFF56] to-[#4EE045]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6">
              {compliance.cta?.title || "Get Started with SmartHoster"}
            </h2>
            <p className="text-base sm:text-lg text-black/80 mb-6 sm:mb-8">
              {compliance.cta?.description || "Contact us to learn more about our services"}
            </p>
            <Button 
              size="lg"
              className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {compliance.cta?.button || "Schedule a Free Compliance Consultation"}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LegalCompliance;
