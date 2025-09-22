
import LanguageBand from "@/components/LanguageBand";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { generatePageSEO } from "@/data/seoConfig";

interface LayoutProps {
  children: ReactNode;
  customSEO?: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    structuredData?: object;
    faqData?: Array<{
      question: string;
      answer: string;
    }>;
  };
}

const Layout = ({ children, customSEO }: LayoutProps) => {
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  
  // Extract the base path without language prefix
  const getBasePath = (pathname: string) => {
    if (pathname.startsWith('/pt/')) {
      return pathname.replace('/pt', '');
    }
    if (pathname.startsWith('/fr/')) {
      return pathname.replace('/fr', '');
    }
    return pathname;
  };
  
  const basePath = getBasePath(location.pathname);
  const seoData = generatePageSEO(basePath, currentLanguage);
  
  // Check if we should show WhatsApp widget (exclude auth pages and dashboard)
  const shouldShowWhatsApp = !location.pathname.startsWith('/auth') && 
                            !location.pathname.startsWith('/portal') &&
                            !location.pathname.startsWith('/admin');
  
  // Merge custom SEO with default SEO
  const finalSEO = {
    ...seoData,
    ...customSEO,
    canonicalUrl: customSEO?.canonicalUrl || basePath,
    lastModified: new Date().toISOString()
  };
  
  return (
    <div className="min-h-screen">
      <SEO {...finalSEO} />
      <LanguageBand />
      <Header />
      <main className="pt-36 sm:pt-32">
        {children}
      </main>
      <Footer />
      {shouldShowWhatsApp && <WhatsAppWidget />}
    </div>
  );
};

export default Layout;
