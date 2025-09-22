
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Import common translations
import commonEn from '../data/translations/common/en.json';
import commonPt from '../data/translations/common/pt.json';
import commonFr from '../data/translations/common/fr.json';

// Import integrations translations
import integrationsEn from '../data/translations/integrations/en.json';
import integrationsPt from '../data/translations/integrations/pt.json';
import integrationsFr from '../data/translations/integrations/fr.json';

// Import learn more translations
import learnMoreEn from '../data/translations/learnMore/en.json';
import learnMorePt from '../data/translations/learnMore/pt.json';
import learnMoreFr from '../data/translations/learnMore/fr.json';

// Import direct bookings translations
import directBookingsEn from '../data/translations/directBookings/en.json';
import directBookingsPt from '../data/translations/directBookings/pt.json';
import directBookingsFr from '../data/translations/directBookings/fr.json';

// Import full service translations
import fullServiceEn from '../data/translations/fullService/en.json';
import fullServicePt from '../data/translations/fullService/pt.json';
import fullServiceFr from '../data/translations/fullService/fr.json';

// Import green pledge translations
import greenPledgeEn from '../data/translations/greenPledge/en.json';
import greenPledgePt from '../data/translations/greenPledge/pt.json';
import greenPledgeFr from '../data/translations/greenPledge/fr.json';

// Import local expertise translations
import localExpertiseEn from '../data/translations/localExpertise/en.json';
import localExpertisePt from '../data/translations/localExpertise/pt.json';
import localExpertiseFr from '../data/translations/localExpertise/fr.json';

// Import income strategy translations
import incomeEn from '../data/translations/income/en.json';
import incomePt from '../data/translations/income/pt.json';
import incomeFr from '../data/translations/income/fr.json';

// Import automation translations
import automationEn from '../data/translations/automation/en.json';
import automationPt from '../data/translations/automation/pt.json';
import automationFr from '../data/translations/automation/fr.json';

// Import compliance translations
import complianceEn from '../data/translations/compliance/en.json';
import compliancePt from '../data/translations/compliance/pt.json';
import complianceFr from '../data/translations/compliance/fr.json';

// Import billing translations
import billingEn from '../data/translations/billing/en.json';
import billingPt from '../data/translations/billing/pt.json';
import billingFr from '../data/translations/billing/fr.json';

// Import privacy translations
import privacyEn from '../data/translations/privacy/en.json';
import privacyPt from '../data/translations/privacy/pt.json';
import privacyFr from '../data/translations/privacy/fr.json';

// Import terms translations
import termsEn from '../data/translations/terms/en.json';
import termsPt from '../data/translations/terms/pt.json';
import termsFr from '../data/translations/terms/fr.json';

// Import cookie policy translations
import cookiePolicyEn from '../data/translations/cookiePolicy/en.json';
import cookiePolicyPt from '../data/translations/cookiePolicy/pt.json';
import cookiePolicyFr from '../data/translations/cookiePolicy/fr.json';

// Import about translations
import aboutEn from '../data/translations/about/en.json';
import aboutPt from '../data/translations/about/pt.json';
import aboutFr from '../data/translations/about/fr.json';

// Import original translations (for backwards compatibility)
import originalEn from '../data/translations/en.json';
import originalPt from '../data/translations/pt.json';
import originalFr from '../data/translations/fr.json';

// Import gdpr translations
import gdprEn from '../data/translations/gdpr/en.json';
import gdprPt from '../data/translations/gdpr/pt.json';
import gdprFr from '../data/translations/gdpr/fr.json';

// Import pricing translations
import pricingEn from '../data/translations/pricing/en.json';
import pricingPt from '../data/translations/pricing/pt.json';
import pricingFr from '../data/translations/pricing/fr.json';

// Import auth translations
import authEn from '../data/translations/auth/en.json';
import authPt from '../data/translations/auth/pt.json';
import authFr from '../data/translations/auth/fr.json';

// Import portal translations
import portalEn from '../data/translations/portal/en.json';
import portalPt from '../data/translations/portal/pt.json';
import portalFr from '../data/translations/portal/fr.json';

type Language = 'en' | 'fr' | 'pt';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: any;
}

// Merge all translations
const translations = {
  en: {
    ...originalEn,
    ...commonEn,
    ...integrationsEn,
    ...learnMoreEn,
    ...directBookingsEn,
    ...fullServiceEn,
    ...greenPledgeEn,
    ...privacyEn,
    ...termsEn,
    ...aboutEn,
    cookiePolicy: cookiePolicyEn,
    localExpertise: localExpertiseEn,
    income: incomeEn,
    automation: automationEn,
    compliance: complianceEn,
    billing: billingEn,
    gdpr: gdprEn,
    pricing: pricingEn,
    auth: authEn,
    portal: portalEn,
    languageBand: {
      tagline: "Empowering Hosts, Simplifying Stays"
    }
  },
  fr: {
    ...originalFr,
    ...commonFr,
    ...integrationsFr,
    ...learnMoreFr,
    ...directBookingsFr,
    ...fullServiceFr,
    ...greenPledgeFr,
    ...privacyFr,
    ...termsFr,
    ...aboutFr,
    cookiePolicy: cookiePolicyFr,
    localExpertise: localExpertiseFr,
    income: incomeFr,
    automation: automationFr,
    compliance: complianceFr,
    billing: billingFr,
    gdpr: gdprFr,
    pricing: pricingFr,
    auth: authFr,
    portal: portalFr,
    languageBand: {
      tagline: "Autonomiser les Hôtes, Simplifier les Séjours"
    }
  },
  pt: {
    ...originalPt,
    ...commonPt,
    ...integrationsPt,
    ...learnMorePt,
    ...directBookingsPt,
    ...fullServicePt,
    ...greenPledgePt,
    ...privacyPt,
    ...termsPt,
    ...aboutPt,
    cookiePolicy: cookiePolicyPt,
    localExpertise: localExpertisePt,
    income: incomePt,
    automation: automationPt,
    compliance: compliancePt,
    billing: billingPt,
    gdpr: gdprPt,
    pricing: pricingPt,
    auth: authPt,
    portal: portalPt,
    languageBand: {
      tagline: "Ajudamos Anfitriões, Facilitamos Estadias"
    }
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Function to detect browser language and return supported language
const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Map browser language to supported languages
  switch (langCode) {
    case 'pt':
      return 'pt';
    case 'fr':
      return 'fr';
    case 'en':
    default:
      return 'en';
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Detect browser language on mount
  useEffect(() => {
    const detectedLanguage = detectBrowserLanguage();
    setCurrentLanguage(detectedLanguage);
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  const t = translations[currentLanguage];

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
