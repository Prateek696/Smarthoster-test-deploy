
import { useState } from "react";
import CalendlyButton from "@/components/CalendlyButton";
import { Button } from "@/components/ui/button";
import { Menu, X, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user, isAdmin, profile } = useAuth();

  const servicesItems = [
    { name: t.header?.services?.enhancedDirectBookings || "Enhanced Direct Bookings", href: "/enhanced-direct-bookings" },
    { name: t.header?.services?.fullServiceManagement || "Full-Service Management", href: "/full-service-management" },
    { name: t.header?.services?.advancedAutomation || "Advanced Automation & Smart Tech", href: "/advanced-automation" },
    { name: t.header?.services?.localExpertise || "Local Expertise", href: "/local-expertise" },
    { name: t.header?.services?.incomeStrategy || "Income Strategy", href: "/income-strategy" },
    { name: t.header?.services?.legalCompliance || "Legal Compliance & SEF/AIMA Reporting", href: "/legal-compliance" },
    { name: t.header?.services?.automatedBilling || "Automated Billing & Legal Reporting", href: "/automated-billing" },
    { name: t.header?.services?.greenPledge || "Green Pledge", href: "/green-pledge" },
  ];

  const mainNavItems = [
    { name: t.header?.nav?.home || "Home", href: "/" },
    { name: t.header?.nav?.about || "About Us", href: "/about" },
    { name: t.header?.nav?.pricing || "Pricing", href: "/pricing" },
    { name: t.header?.nav?.blog || "Blog", href: "/blog" },
  ];
  
  // Debug what we're actually getting
  console.log('Header Debug - user:', !!user, 'isAdmin:', isAdmin, 'profile:', profile);
  console.log('Main nav items:', mainNavItems.map(item => `${item.name}: ${item.href}`));
  console.log('Translation for blog:', t.header?.nav?.blog);
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const isServicesActive = () => {
    return servicesItems.some(item => isActiveLink(item.href));
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-[70px] sm:top-12 left-0 right-0 z-40 overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-none">
        <div className="flex items-center justify-between h-16 sm:h-20 w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <svg
              width="28"
              height="24"
              viewBox="0 0 67 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-auto sm:h-8 mr-3 flex-shrink-0"
            >
              <path d="M35.0266 14.7486C36.9557 14.2329 38.5616 12.9916 39.5594 11.2537C40.5573 9.51586 40.8138 7.49153 40.3007 5.56268C39.7875 3.63384 38.5521 2.01055 36.8226 1.00793C35.0931 0.00531467 33.0785 -0.26205 31.1589 0.263131C29.2393 0.778763 27.6238 2.0201 26.626 3.75797C25.6282 5.49584 25.3621 7.52017 25.8753 9.44902C26.3884 11.3779 27.6238 13.0011 29.3533 14.0038C31.0829 15.0064 33.088 15.2738 35.0171 14.7581L35.0266 14.7486Z" fill="#00ACE8"/>
              <path d="M60.6555 29.6186C62.5846 29.1029 64.1906 27.8616 65.1884 26.1237C67.241 22.543 66.0151 17.95 62.4515 15.8779C60.722 14.8753 58.7169 14.608 56.7878 15.1236C54.8587 15.6488 53.2527 16.8901 52.2549 18.6184C50.2023 22.1992 51.4282 26.7922 54.9823 28.8642C56.7118 29.8668 58.7169 30.1438 60.6555 29.6186Z" fill="#0095D5"/>
              <path d="M3.73273 28.8631C5.46226 29.8753 7.47687 30.1331 9.40596 29.6175C11.3255 29.1019 12.941 27.8605 13.9293 26.1227C14.9366 24.3848 15.1932 22.37 14.6706 20.4316C14.1574 18.4932 12.9315 16.8795 11.1925 15.8673C9.47248 14.8647 7.45787 14.5973 5.52878 15.1225C3.59969 15.6381 1.99371 16.889 0.995902 18.6173C0.00760197 20.3552 -0.258479 22.37 0.26418 24.3084C0.777336 26.2468 2.01271 27.8605 3.73273 28.8631Z" fill="#00BDF2"/>
              <path d="M54.9727 58.5858C56.7023 59.598 58.7169 59.8558 60.646 59.3401C62.5656 58.8245 64.1811 57.5832 65.1789 55.8453C66.1767 54.1074 66.4427 52.0927 65.9201 50.1543C65.4069 48.2159 64.181 46.6021 62.442 45.59C60.722 44.5873 58.7074 44.32 56.7783 44.8452C54.8492 45.3608 53.2432 46.6117 52.2549 48.34C51.2571 50.0779 50.991 52.0927 51.5042 54.0311C52.0269 55.9694 53.2527 57.5832 54.9727 58.5858Z" fill="#007FC4"/>
              <path d="M14.6711 50.154C15.1842 52.0924 14.9181 54.1167 13.9298 55.845C12.932 57.5829 11.3165 58.8147 9.39695 59.3399C7.47737 59.8555 5.46275 59.5977 3.73323 58.5951C2.0037 57.5924 0.768327 55.9691 0.255171 54.0403C-0.257985 52.1115 0.00809622 50.0871 1.0059 48.3493C2.0037 46.6114 3.61919 45.37 5.53878 44.8544C7.45836 44.3388 9.47297 44.6061 11.2025 45.5992C12.9225 46.6018 14.1674 48.2156 14.6806 50.154H14.6711Z" fill="#4EC9F5"/>
              <path d="M49.3665 41.7898H41.2415V53.4392H24.9345V41.7898H16.8096L33.088 21.0117L49.3665 41.7898Z" fill="#5FFF56"/>
            </svg>
            <span className="text-xl sm:text-2xl font-bold">
              <span className="text-gray-900">Smart</span>
              <span className="text-[#5FFF56]">Hoster</span>
              <span className="text-[#00CFFF]">.io</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex overflow-visible">
            <NavigationMenuList className="space-x-1 flex-nowrap">
              {mainNavItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <Link
                    to={item.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                      isActiveLink(item.href)
                        ? "text-[#5FFF56] font-semibold bg-gray-50"
                        : "text-gray-700 hover:text-[#5FFF56] hover:bg-gray-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                </NavigationMenuItem>
              ))}
              
              <NavigationMenuItem key="services">
              <NavigationMenuTrigger 
                className={`text-sm font-medium px-4 py-2 ${
                  isServicesActive()
                    ? "text-[#5FFF56] font-semibold"
                    : "text-gray-700 hover:text-[#5FFF56]"
                }`}
                >
                  {t.header?.nav?.services || "Services"}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-2 p-6 w-96 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                    {servicesItems.map((item) => (
                      <NavigationMenuLink key={item.name} asChild>
                        <Link
                          to={item.href}
                          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 ${
                            isActiveLink(item.href)
                              ? "bg-gray-50 text-gray-900 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="text-sm font-medium leading-none">
                            {item.name}
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Admin Menu - Only show for admin users */}
              {user && isAdmin && (
                <NavigationMenuItem key="admin">
                  <NavigationMenuTrigger 
                    className={`text-sm font-medium transition-colors duration-200 px-4 py-2 ${
                      location.pathname.startsWith('/admin')
                        ? "text-[#5FFF56] font-semibold"
                        : "text-gray-700 hover:text-[#5FFF56]"
                    }`}
                  >
                    <Settings className="mr-1 h-4 w-4" />
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-80 p-4 bg-white border border-gray-200 shadow-xl rounded-lg z-50">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/admin/content-dashboard"
                          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 ${
                            isActiveLink('/admin/content-dashboard')
                              ? "bg-gray-50 text-gray-900 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="text-sm font-medium leading-none">
                            Content Dashboard
                          </div>
                          <div className="text-xs text-gray-500">
                            Manage generated content
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/admin/content-generator"
                          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 ${
                            isActiveLink('/admin/content-generator')
                              ? "bg-gray-50 text-gray-900 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          <div className="text-sm font-medium leading-none">
                            Content Generator
                          </div>
                          <div className="text-xs text-gray-500">
                            Generate AI content
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {isAdmin ? 'Administrator' : 'Client'}
                </span>
                <Button 
                  onClick={() => window.location.href = '/auth?action=logout'}
                  variant="ghost" 
                  className="text-gray-700 hover:text-gray-900 text-sm px-4 py-2"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  asChild
                  variant="ghost" 
                  className="text-gray-700 hover:text-gray-900 text-sm px-4 py-2"
                >
                  <a href={import.meta.env.VITE_OWNER_PORTAL_URL || "http://localhost:3000/auth/login"}>{t.header.cta.signIn}</a>
                </Button>
                <CalendlyButton
                  calendlyUrl="https://calendly.com/admin-smarthoster"
                  size="sm"
                  className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-6 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                  utmSource="header"
                  utmMedium="website"
                  utmCampaign="get-started"
                  utmContent="header-cta"
                >
                  {t.header.cta.getStartedToday || "Get Started Today"}
                </CalendlyButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 max-h-[70vh] overflow-y-auto">
            <nav className="flex flex-col space-y-3">

              {mainNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-base font-medium transition-colors duration-200 py-2 ${
                    isActiveLink(item.href)
                      ? "text-[#5FFF56] font-semibold"
                      : "text-gray-700 hover:text-[#5FFF56]"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="border-l-2 border-gray-200 pl-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.header?.nav?.services || "Services"}</h3>
                <div className="space-y-2">
                  {servicesItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-sm font-medium py-2 transition-colors duration-200 ${
                        isActiveLink(item.href)
                          ? "text-[#5FFF56] font-semibold"
                          : "text-gray-600 hover:text-[#5FFF56]"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Admin Menu - Only show for admin users */}
              {user && isAdmin && (
                <div className="border-l-2 border-gray-200 pl-4 mt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Admin</h3>
                  <div className="space-y-2">
                    <Link
                      to="/admin/content-dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-sm font-medium py-2 transition-colors duration-200 ${
                        isActiveLink('/admin/content-dashboard')
                          ? "text-[#5FFF56] font-semibold"
                          : "text-gray-600 hover:text-[#5FFF56]"
                      }`}
                    >
                      Content Dashboard
                    </Link>
                    <Link
                      to="/admin/content-generator"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block text-sm font-medium py-2 transition-colors duration-200 ${
                        isActiveLink('/admin/content-generator')
                          ? "text-[#5FFF56] font-semibold"
                          : "text-gray-600 hover:text-[#5FFF56]"
                      }`}
                    >
                      Content Generator
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                {user ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-700">
                      Welcome, {isAdmin ? 'Administrator' : 'Client'}
                    </span>
                    <Button 
                      onClick={() => {
                        window.location.href = '/auth?action=logout';
                        setIsMenuOpen(false);
                      }}
                      variant="ghost" 
                      className="text-gray-700 hover:text-gray-900 justify-start px-0 text-sm"
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button 
                      asChild
                      variant="ghost" 
                      className="text-gray-700 hover:text-gray-900 justify-start px-0 text-sm"
                    >
                      <a href={import.meta.env.VITE_OWNER_PORTAL_URL || "http://localhost:3000/auth/login"} onClick={() => setIsMenuOpen(false)}>
                        {t.header.cta.signIn}
                      </a>
                    </Button>
                    <CalendlyButton
                      calendlyUrl="https://calendly.com/admin-smarthoster"
                      className="bg-[#5FFF56] hover:bg-[#4EE045] text-black px-6 py-3 rounded-lg transition-colors duration-200 text-sm font-medium w-full"
                      utmSource="mobile-header"
                      utmMedium="website"
                      utmCampaign="get-started"
                      utmContent="mobile-header-cta"
                    >
                      {t.header.cta.getStartedToday || "Get Started Today"}
                    </CalendlyButton>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
