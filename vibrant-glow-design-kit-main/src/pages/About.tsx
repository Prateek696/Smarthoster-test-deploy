
import { Shield, Lightbulb, Leaf, Users, Eye, HeartHandshake, Bot, Cog, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import Testimonials from "@/components/Testimonials";
import Layout from "@/components/Layout";
import CalendlyButton from "@/components/CalendlyButton";
import { Link } from "react-router-dom";

// Import team photos
import miguelPhoto from "@/assets/team/miguel-ribeiro.jpg";
import patriciaPhoto from "@/assets/team/patricia-garlini.jpg";
import shubanshuPhoto from "@/assets/team/shubanshu.jpg";
import joseRaimundoPhoto from "@/assets/team/jose-raimundo.jpg";
import carlosPhoto from "@/assets/team/carlos-ferreira.jpg";
import adolfoPhoto from "@/assets/team/adolfo-ferreira-young.jpg";
import sofiaPhoto from "@/assets/team/sofia-mendes.jpg";
import zaraPhoto from "@/assets/team/zara-alam.jpg";

const About = () => {
  const { t } = useLanguage();

  const teamMembers = [
    {
      name: "Miguel Ribeiro",
      role: t.about.team.members.miguel.role,
      description: t.about.team.members.miguel.description,
      image: miguelPhoto
    },
    {
      name: "Patricia Garlini",
      role: t.about.team.members.patricia.role,
      description: t.about.team.members.patricia.description,
      image: patriciaPhoto
    },
    {
      name: "Shubanshu",
      role: t.about.team.members.shubanshu.role,
      description: t.about.team.members.shubanshu.description,
      image: shubanshuPhoto
    },
    {
      name: "José Raimundo",
      role: t.about.team.members.raimundo.role,
      description: t.about.team.members.raimundo.description,
      image: joseRaimundoPhoto
    },
    {
      name: "Carlos Ferreira",
      role: t.about.team.members.carlos.role,
      description: t.about.team.members.carlos.description,
      image: carlosPhoto
    },
    {
      name: "Adolfo Ferreira",
      role: t.about.team.members.adolfo.role,
      description: t.about.team.members.adolfo.description,
      image: adolfoPhoto
    },
    {
      name: "Sofia Mendes",
      role: t.about.team.members.sofia.role,
      description: t.about.team.members.sofia.description,
      image: sofiaPhoto
    },
    {
      name: "Zara Alam",
      role: t.about.team.members.zara.role,
      description: t.about.team.members.zara.description,
      image: zaraPhoto
    }
  ];

  const coreValues = [
    {
      icon: Users,
      title: t.about.values.ownerFirst.title,
      description: t.about.values.ownerFirst.description
    },
    {
      icon: Eye,
      title: t.about.values.transparency.title,
      description: t.about.values.transparency.description
    },
    {
      icon: HeartHandshake,
      title: t.about.values.humanSupport.title,
      description: t.about.values.humanSupport.description
    },
    {
      icon: Cog,
      title: t.about.values.automation.title,
      description: t.about.values.automation.description
    },
    {
      icon: Recycle,
      title: t.about.values.sustainability.title,
      description: t.about.values.sustainability.description
    }
  ];

  const sustainabilityFeatures = [
    { text: t.about.green.features.led },
    { text: t.about.green.features.appliances },
    { text: t.about.green.features.water },
    { text: t.about.green.features.linens },
    { text: t.about.green.features.upgrades }
  ];

  return (
    <Layout>
      {/* Hero Section - About SmartHoster */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#5FFF56]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#00CFFF]/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              {t.about.hero.title}
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {t.about.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mission */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#5FFF56]/20 rounded-2xl mb-6">
                <Shield className="h-8 w-8 text-[#5FFF56]" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {t.about.missionVision.mission.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.about.missionVision.mission.content}
              </p>
            </div>
            
            {/* Vision */}
            <div className="text-center lg:text-left animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00CFFF]/20 rounded-2xl mb-6">
                <Lightbulb className="h-8 w-8 text-[#00CFFF]" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {t.about.missionVision.vision.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.about.missionVision.vision.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50/30 to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
              {t.about.origin.title}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
              {t.about.origin.content}
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {t.about.values.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {coreValues.map((value, index) => (
              <div 
                key={index}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5FFF56]/20 to-[#00CFFF]/20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="h-8 w-8 text-[#00CFFF]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {t.about.team.title}
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t.about.team.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="text-center group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative mb-6 group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 lg:w-40 lg:h-40 rounded-full mx-auto object-cover shadow-lg border-4 border-white"
                  />
                  <div className="absolute inset-0 w-32 h-32 lg:w-40 lg:h-40 rounded-full mx-auto bg-gradient-to-tr from-[#5FFF56]/20 to-[#00CFFF]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-[#00CFFF] font-semibold mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Commitment Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-6">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                {t.about.green.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.about.green.content}
              </p>
              
              <div className="space-y-4 mb-8">
                {sustainabilityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
              
              <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl">
                <Link to="/green-pledge">{t.about.green.cta}</Link>
              </Button>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <img 
                src="https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=600&h=400&fit=crop"
                alt="Sustainable vacation home with solar panels"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#5FFF56]/10 to-[#00CFFF]/10">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Want to Learn More?
            </h2>
            <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
              Discover how SmartHoster can transform your property management experience with our comprehensive services and expert local knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] hover:from-[#4EE045] hover:to-[#00B8E6] text-black font-semibold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-14 flex items-center justify-center"
              >
                <Link to="/learn-more">
                  Learn More About Our Services
                </Link>
              </Button>
              <CalendlyButton
                calendlyUrl="https://calendly.com/admin-smarthoster"
                className="bg-gradient-to-r from-[#5FFF56] to-[#00CFFF] hover:from-[#4EE045] hover:to-[#00B8E6] text-black font-semibold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 h-14 flex items-center justify-center"
                utmSource="about-page"
                utmMedium="website"
                utmCampaign="consultation"
                utmContent="bottom-cta"
              >
                Book a Free Consultation
              </CalendlyButton>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
