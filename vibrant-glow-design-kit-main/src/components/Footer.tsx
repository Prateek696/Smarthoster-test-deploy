
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Footer = () => {
  const { t } = useLanguage();

  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 67 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mr-3"
              >
                <path d="M35.0266 14.7486C36.9557 14.2329 38.5616 12.9916 39.5594 11.2537C40.5573 9.51586 40.8138 7.49153 40.3007 5.56268C39.7875 3.63384 38.5521 2.01055 36.8226 1.00793C35.0931 0.00531467 33.0785 -0.26205 31.1589 0.263131C29.2393 0.778763 27.6238 2.0201 26.626 3.75797C25.6282 5.49584 25.3621 7.52017 25.8753 9.44902C26.3884 11.3779 27.6238 13.0011 29.3533 14.0038C31.0829 15.0064 33.088 15.2738 35.0171 14.7581L35.0266 14.7486Z" fill="#00ACE8"/>
                <path d="M60.6555 29.6186C62.5846 29.1029 64.1906 27.8616 65.1884 26.1237C67.241 22.543 66.0151 17.95 62.4515 15.8779C60.722 14.8753 58.7169 14.608 56.7878 15.1236C54.8587 15.6488 53.2527 16.8901 52.2549 18.6184C50.2023 22.1992 51.4282 26.7922 54.9823 28.8642C56.7118 29.8668 58.7169 30.1438 60.6555 29.6186Z" fill="#0095D5"/>
                <path d="M3.73273 28.8631C5.46226 29.8753 7.47687 30.1331 9.40596 29.6175C11.3255 29.1019 12.941 27.8605 13.9293 26.1227C14.9366 24.3848 15.1932 22.37 14.6706 20.4316C14.1574 18.4932 12.9315 16.8795 11.1925 15.8673C9.47248 14.8647 7.45787 14.5973 5.52878 15.1225C3.59969 15.6381 1.99371 16.889 0.995902 18.6173C0.00760197 20.3552 -0.258479 22.37 0.26418 24.3084C0.777336 26.2468 2.01271 27.8605 3.73273 28.8631Z" fill="#00BDF2"/>
                <path d="M54.9727 58.5858C56.7023 59.598 58.7169 59.8558 60.646 59.3401C62.5656 58.8245 64.1811 57.5832 65.1789 55.8453C66.1767 54.1074 66.4427 52.0927 65.9201 50.1543C65.4069 48.2159 64.181 46.6021 62.442 45.59C60.722 44.5873 58.7074 44.32 56.7783 44.8452C54.8492 45.3608 53.2432 46.6117 52.2549 48.34C51.2571 50.0779 50.991 52.0927 51.5042 54.0311C52.0269 55.9694 53.2527 57.5832 54.9727 58.5858Z" fill="#007FC4"/>
                <path d="M14.6711 50.154C15.1842 52.0924 14.9181 54.1167 13.9298 55.845C12.932 57.5829 11.3165 58.8147 9.39695 59.3399C7.47737 59.8555 5.46275 59.5977 3.73323 58.5951C2.0037 57.5924 0.768327 55.9691 0.255171 54.0403C-0.257985 52.1115 0.00809622 50.0871 1.0059 48.3493C2.0037 46.6114 3.61919 45.37 5.53878 44.8544C7.45836 44.3388 9.47297 44.6061 11.2025 45.5992C12.9225 46.6018 14.1674 48.2156 14.6806 50.154H14.6711Z" fill="#4EC9F5"/>
                <path d="M49.3665 41.7898H41.2415V53.4392H24.9345V41.7898H16.8096L33.088 21.0117L49.3665 41.7898Z" fill="#5FFF56"/>
              </svg>
              <span className="text-xl font-bold">
                <span className="text-white">Smart</span>
                <span className="text-[#5FFF56]">Hoster</span>
                <span className="text-[#00CFFF]">.io</span>
              </span>
            </div>
            
            {/* Color Bar */}
            <div className="w-24 h-1 bg-gradient-to-r from-[#00CFFF] to-[#5FFF56] rounded-full mb-4"></div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t.footer.description}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              <p>{t.footer.contact.email}</p>
              <p>+351 933 683 981</p>
            </div>
          </div>

          {/* Offices Section */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {t.footer.offices.title}
            </h3>
            <div className="space-y-4">
              {/* Porto Office */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Porto</div>
                  <div className="text-gray-400">Rua do Molhe 575 1º</div>
                  <div className="text-gray-400">4150-503 Porto</div>
                  <div className="text-blue-400">porto@smarthoster.io</div>
                </div>
              </div>
              
              {/* Lisbon Office */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Lisboa</div>
                  <div className="text-gray-400">Praça Pastor, Nº 1, 5° Dto</div>
                  <div className="text-gray-400">1000-239 Lisboa</div>
                  <div className="text-blue-400">lisbon@smarthoster.io</div>
                </div>
              </div>
              
              {/* Algarve Office */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">Algarve</div>
                  <div className="text-gray-400">R. Domingos Xavier Perreira 10, 4A</div>
                  <div className="text-gray-400">8700-408 Olhão</div>
                  <div className="text-blue-400">algarve@smarthoster.io</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Platform */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {t.footer.sections.platform.title}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/pricing"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.sections.platform.links[1]}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/integrations" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.sections.platform.links[2]}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/portal" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Client Portal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {t.footer.sections.company.title}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/about" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.sections.company.links[0]}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/blog" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.sections.company.links[3]}
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-left block"
                    >
                      {t.footer.sections.company.links[4]}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/jobs" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.sections.company.links[1]}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal & Security */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {t.footer.sections.legal.title}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      to="/privacy" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.legal.privacy}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/terms" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.legal.terms}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/cookie-policy" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.legal.cookies}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/gdpr-compliance" 
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {t.footer.legal.gdpr}
                    </Link>
                  </li>
                  <li>
                    <a 
                      href="https://www.livroreclamacoes.pt/inicio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center group"
                    >
                      <img 
                        src="/lovable-uploads/981eee93-e02d-44c9-8c83-584ea2e2ef70.png" 
                        alt="Livro de Reclamações" 
                        className="h-6 w-auto mr-2 transition-opacity duration-200 group-hover:opacity-80"
                      />
                      {t.footer.complaintsBook}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-sm text-gray-400 text-center">
            © {currentYear} SmartHoster.io. {t.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
