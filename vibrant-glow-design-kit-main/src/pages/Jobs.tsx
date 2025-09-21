
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const Jobs = () => {
  const { currentLanguage } = useLanguage();

  const getContent = () => {
    switch (currentLanguage) {
      case 'pt':
        return {
          title: "Junta-te à Nossa Equipa",
          intro: "Estamos a recrutar pessoal de limpeza em regime part-time para Porto, Olhão e Lisboa. Junta-te a uma equipa em crescimento e trabalha com horários flexíveis.",
          jobs: [
            {
              title: "Limpeza Local Alojamento – Olhão",
              type: "Part-time / Recibos Verdes",
              hours: "11h às 16h (dependendo do check-in/check-out)",
              requirements: "Responsabilidade, atenção aos detalhes, preferencialmente com experiência.",
              location: "Olhão",
              email: "jobs@smarthoster.io"
            },
            {
              title: "Limpeza Alojamento Local – Porto", 
              type: "Part-time / Recibos Verdes",
              hours: "11h às 16h (dependendo das reservas)",
              requirements: "Fiabilidade, atenção ao detalhe, experiência preferencial.",
              location: "Porto",
              email: "jobs@smarthoster.io"
            },
            {
              title: "Limpeza Arrendamentos Sazonais – Lisboa",
              type: "Tempo parcial / Independente", 
              hours: "11h às 16h (variável segundo as reservas)",
              requirements: "Sério, pontual, experiência desejada.",
              location: "Lisboa",
              email: "jobs@smarthoster.io"
            }
          ],
          labels: {
            type: "Tipo:",
            hours: "Horário:",
            requirements: "Requisitos:",
            location: "Localização:",
            contact: "Contacto:",
            apply: "Candidatar-me"
          }
        };
      case 'fr':
        return {
          title: "Rejoignez Notre Équipe",
          intro: "Nous recrutons des agents d'entretien à temps partiel à Porto, Olhão et Lisbonne. Rejoignez une équipe dynamique avec des horaires flexibles.",
          jobs: [
            {
              title: "Nettoyage Locations Saisonnières – Olhão",
              type: "Temps partiel / Indépendant",
              hours: "11h à 16h (variable selon les réservations)",
              requirements: "Sérieux, ponctuel, expérience souhaitée.",
              location: "Olhão",
              email: "jobs@smarthoster.io"
            },
            {
              title: "Nettoyage Locations Courtes – Porto",
              type: "Temps partiel / Freelance",
              hours: "11h à 16h (selon les arrivées)",
              requirements: "Fiabilité, attention aux détails, expérience préférée.",
              location: "Porto", 
              email: "jobs@smarthoster.io"
            },
            {
              title: "Nettoyage Locations Saisonnières – Lisbonne",
              type: "Temps partiel / Indépendant",
              hours: "11h à 16h (variable selon les réservations)",
              requirements: "Sérieux, ponctuel, expérience souhaitée.",
              location: "Lisbonne",
              email: "jobs@smarthoster.io"
            }
          ],
          labels: {
            type: "Type:",
            hours: "Horaires:",
            requirements: "Profil:",
            location: "Lieu:",
            contact: "Contact:",
            apply: "Postuler"
          }
        };
      default:
        return {
          title: "Join Our Team",
          intro: "We're hiring part-time cleaners in Porto, Olhão, and Lisbon. Join a fast-growing team, get consistent bookings, and enjoy flexible hours.",
          jobs: [
            {
              title: "Short-Term Rental Cleaner – Olhão",
              type: "Part-time / Freelance",
              hours: "11am to 4pm (depending on check-ins)",
              requirements: "Reliability, attention to detail, prior experience preferred.",
              location: "Olhão",
              email: "jobs@smarthoster.io"
            },
            {
              title: "Short-Term Rental Cleaner – Porto",
              type: "Part-time / Freelance", 
              hours: "11am to 4pm (depending on check-ins)",
              requirements: "Reliability, attention to detail, prior experience preferred.",
              location: "Porto",
              email: "jobs@smarthoster.io"
            },
            {
              title: "Short-Term Rental Cleaner – Lisbon",
              type: "Part-time / Freelance",
              hours: "11am to 4pm (depending on bookings)",
              requirements: "Reliability, attention to detail, prior experience preferred.",
              location: "Lisbon",
              email: "jobs@smarthoster.io"
            }
          ],
          labels: {
            type: "Type:",
            hours: "Hours:",
            requirements: "Requirements:",
            location: "Location:",
            contact: "Contact:",
            apply: "Apply Now"
          }
        };
    }
  };

  const content = getContent();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                {content.title}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {content.intro}
              </p>
            </div>
          </div>
        </section>

        {/* Job Listings */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8">
                {content.jobs.map((job, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {job.title}
                        </h2>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="w-5 h-5 mr-3 text-[#5FFF56]" />
                            <span className="font-medium mr-2">{content.labels.type}</span>
                            <span>{job.type}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-3 text-[#5FFF56]" />
                            <span className="font-medium mr-2">{content.labels.hours}</span>
                            <span>{job.hours}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-5 h-5 mr-3 text-[#5FFF56]" />
                            <span className="font-medium mr-2">{content.labels.location}</span>
                            <span>{job.location}</span>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="font-semibold text-gray-900 mb-2">{content.labels.requirements}</h3>
                          <p className="text-gray-600">{job.requirements}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-gray-100">
                      <div className="flex items-center text-gray-600 mb-4 sm:mb-0">
                        <Mail className="w-5 h-5 mr-2 text-[#5FFF56]" />
                        <span className="font-medium mr-2">{content.labels.contact}</span>
                        <a href={`mailto:${job.email}`} className="text-[#5FFF56] hover:text-[#4EE045] transition-colors">
                          {job.email}
                        </a>
                      </div>
                      
                      <Button asChild className="bg-[#5FFF56] hover:bg-[#4EE045] text-black">
                        <a href={`mailto:${job.email}?subject=Application for ${job.title}`}>
                          {content.labels.apply}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {currentLanguage === 'pt' ? 'Tens Questões?' : 
                 currentLanguage === 'fr' ? 'Des Questions?' : 
                 'Have Questions?'}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {currentLanguage === 'pt' ? 'Contacta-nos directamente para mais informações sobre as nossas oportunidades de emprego.' :
                 currentLanguage === 'fr' ? 'Contactez-nous directement pour plus d\'informations sur nos opportunités d\'emploi.' :
                 'Contact us directly for more information about our job opportunities.'}
              </p>
              <Button asChild size="lg" className="bg-[#5FFF56] hover:bg-[#4EE045] text-black">
                <a href="mailto:jobs@smarthoster.io">
                  {currentLanguage === 'pt' ? 'Contactar Agora' :
                   currentLanguage === 'fr' ? 'Nous Contacter' :
                   'Contact Us Now'}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Jobs;
