import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { 
  Recycle, 
  Sun, 
  Wind,
  Car,
  Lightbulb,
  Droplets,
  Leaf,
  Thermometer,
  Zap,
  Heart,
  CheckCircle,
  Users,
  Globe
} from "lucide-react";

const GreenPledge = () => {
  const { t } = useLanguage();

  const initiatives = [
    { icon: Car, key: "electricVehicles" },
    { icon: Users, key: "tailoredBedding" },
    { icon: Lightbulb, key: "ledLighting" },
    { icon: Droplets, key: "waterSaving" },
    { icon: Leaf, key: "ecoFriendlyCleaning" },
    { icon: Recycle, key: "reusableDispensers" },
    { icon: Recycle, key: "recyclingProgram" },
    { icon: Zap, key: "energyEfficient" },
    { icon: Thermometer, key: "smartThermostats" },
    { icon: Sun, key: "solarPower" }
  ];

  const guestActions = [
    { icon: Recycle, key: "recycle" },
    { icon: Droplets, key: "conserveWater" },
    { icon: Zap, key: "turnOffElectricity" },
    { icon: Leaf, key: "useEcoAmenities" },
    { icon: Users, key: "supportTailoredBedding" },
    { icon: Lightbulb, key: "mindfulEnergy" }
  ];

  const faqs = [
    { key: "ledLighting" },
    { key: "tailoredBedding" },
    { key: "energyConservation" },
    { key: "solarPanels" },
    { key: "guestContribution" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              {t.greenPledge.hero.headline}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t.greenPledge.hero.subheadline}
            </p>
            <div className="flex justify-center space-x-8 mb-8">
              <Sun className="h-16 w-16 text-[#5FFF56]" />
              <Wind className="h-16 w-16 text-blue-500" />
              <Leaf className="h-16 w-16 text-green-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Green Pledge Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.greenPledge.pledge.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t.greenPledge.pledge.description}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <Car className="h-12 w-12 text-[#5FFF56] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t.greenPledge.pledge.icons.electric}</p>
                </div>
                <div className="text-center">
                  <Recycle className="h-12 w-12 text-[#5FFF56] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t.greenPledge.pledge.icons.recycling}</p>
                </div>
                <div className="text-center">
                  <Sun className="h-12 w-12 text-[#5FFF56] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t.greenPledge.pledge.icons.solar}</p>
                </div>
                <div className="text-center">
                  <Wind className="h-12 w-12 text-[#5FFF56] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t.greenPledge.pledge.icons.wind}</p>
                </div>
                <div className="text-center">
                  <Droplets className="h-12 w-12 text-[#5FFF56] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t.greenPledge.pledge.icons.water}</p>
                </div>
                <div className="text-center">
                  <Leaf className="h-12 w-12 text-[#5FFF56] mx-auto mb-2" />
                  <p className="text-sm text-gray-600">{t.greenPledge.pledge.icons.eco}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Green Initiatives Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.greenPledge.initiatives.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {initiatives.map((initiative, index) => (
                <Card key={index} className="border-l-4 border-[#5FFF56] hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start space-y-0 space-x-4">
                    <initiative.icon className="h-8 w-8 text-[#5FFF56] mt-1 flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">
                        {t.greenPledge.initiatives.items[initiative.key].title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600">
                      {t.greenPledge.initiatives.items[initiative.key].description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Green Initiatives Matter */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  {t.greenPledge.whyGreen.title}
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {t.greenPledge.whyGreen.description}
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-32 w-32 text-[#5FFF56] mx-auto mb-4" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Heart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">{t.greenPledge.whyGreen.benefits.health}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Droplets className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-800">{t.greenPledge.whyGreen.benefits.conservation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Guests Can Help Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t.greenPledge.guestHelp.title}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                {t.greenPledge.guestHelp.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {guestActions.map((action, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                  <action.icon className="h-12 w-12 text-[#5FFF56] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t.greenPledge.guestHelp.actions[action.key].title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t.greenPledge.guestHelp.actions[action.key].description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button 
                asChild
                size="lg"
                className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
              >
                <Link to="/learn-more">{t.greenPledge.guestHelp.cta}</Link>
              </Button>
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
                {t.greenPledge.faqs.title}
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-l-4 border-[#5FFF56]">
                  <CardHeader>
                    <CardTitle className="text-lg text-left flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#5FFF56] mr-3 mt-1 flex-shrink-0" />
                      {t.greenPledge.faqs.questions[faq.key].question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 ml-8">
                      {t.greenPledge.faqs.questions[faq.key].answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {t.greenPledge.joinUs.title}
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {t.greenPledge.joinUs.description}
            </p>
            <Button 
              asChild
              size="lg"
              className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-8 py-4 text-lg rounded-lg"
            >
              <Link to="/contact">{t.greenPledge.joinUs.cta}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GreenPledge;
