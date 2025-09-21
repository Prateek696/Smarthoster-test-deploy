import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  lastModified?: string;
  structuredData?: object;
  faqData?: Array<{
    question: string;
    answer: string;
  }>;
}

const SEO = ({
  title,
  description,
  canonicalUrl = '',
  ogImage = 'https://smarthoster.io/og-image.jpg',
  ogType = 'website',
  lastModified = new Date().toISOString(),
  structuredData,
  faqData
}: SEOProps) => {
  const { currentLanguage } = useLanguage();
  
  // Default multilingual content
  const getDefaultContent = () => {
    switch (currentLanguage) {
      case 'pt':
        return {
          title: 'SmartHoster | Gestão de Alojamento Local em Portugal',
          description: 'Gestão profissional de Alojamento Local (AL) em Portugal. Inclui limpezas, lavandaria, check-ins, apoio ao hóspede e conformidade legal.',
          ogTitle: 'SmartHoster | Gestão de AL em Portugal',
          ogDescription: 'Gestão completa de Alojamento Local com check-ins, lavandaria, limpeza e conformidade legal.',
          twitterTitle: 'SmartHoster | Gestão de AL em Portugal',
          twitterDescription: 'Serviço completo de gestão de Alojamento Local. Tratamos de tudo – para que não tenha de se preocupar.'
        };
      case 'fr':
        return {
          title: 'SmartHoster | Gestion de locations de courte durée au Portugal',
          description: 'Gestion professionnelle des locations Airbnb et AL au Portugal. Nettoyage, linge, accueil des invités et conformité légale inclus.',
          ogTitle: 'SmartHoster | Gestion de locations Airbnb au Portugal',
          ogDescription: 'Gestion complète de votre location au Portugal. Nous nous occupons de tout – accueil, ménage, linge, et conformité.',
          twitterTitle: 'SmartHoster | Gestion de location au Portugal',
          twitterDescription: 'Service clé en main pour la gestion de votre location de courte durée au Portugal.'
        };
      default:
        return {
          title: 'SmartHoster | Airbnb & Short-Term Rental Management in Portugal',
          description: 'Local, full-service property management for Alojamento Local (AL) in Portugal. Cleaning, linens, check-ins, compliance & guest support – all included.',
          ogTitle: 'SmartHoster | Airbnb & AL Property Management Portugal',
          ogDescription: 'SmartHoster handles listings, guests, check-ins, linens, cleaning & AL compliance. Full-service property management in Portugal.',
          twitterTitle: 'SmartHoster | Airbnb Property Management Portugal',
          twitterDescription: 'Trusted AL property management in Portugal. We handle it all – so you don\'t have to.'
        };
    }
  };
  
  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  
  useEffect(() => {
    // Set document title
    document.title = finalTitle;
    
    // Set lang attribute on html element
    document.documentElement.lang = currentLanguage === 'pt' ? 'pt-PT' : currentLanguage === 'fr' ? 'fr' : 'en';
    
    // Update meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', finalDescription);
    updateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMeta('author', 'SmartHoster.io');
    updateMeta('last-modified', lastModified);
    
    // Open Graph tags
    updateMeta('og:title', defaultContent.ogTitle, true);
    updateMeta('og:description', defaultContent.ogDescription, true);
    updateMeta('og:image', ogImage, true);
    updateMeta('og:type', ogType, true);
    
    // Build proper OG URL based on language
    const ogUrl = currentLanguage === 'en' 
      ? `https://smarthoster.io${canonicalUrl}` 
      : `https://smarthoster.io/${currentLanguage}${canonicalUrl}`;
    updateMeta('og:url', ogUrl, true);
    updateMeta('og:site_name', 'SmartHoster', true);
    updateMeta('og:locale', currentLanguage === 'pt' ? 'pt_PT' : currentLanguage === 'fr' ? 'fr_FR' : 'en_US', true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', defaultContent.twitterTitle);
    updateMeta('twitter:description', defaultContent.twitterDescription);
    updateMeta('twitter:image', ogImage);
    
    // Language alternates
    const updateHreflang = (hreflang: string, href: string) => {
      let element = document.querySelector(`link[hreflang="${hreflang}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'alternate');
        element.setAttribute('hreflang', hreflang);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };
    
    // Remove existing hreflang tags
    const existingHreflang = document.querySelectorAll('link[hreflang]');
    existingHreflang.forEach(el => el.remove());
    
    // Add hreflang for all languages - only add if variants exist
    const blogMatch = canonicalUrl.match(/^\/blog\/(.+)$/);
    const isStaticPage = !blogMatch;
    
    if (isStaticPage) {
      // For static pages, add all language variants
      updateHreflang('en', `https://smarthoster.io${canonicalUrl}`);
      updateHreflang('pt-pt', `https://smarthoster.io/pt${canonicalUrl}`);
      updateHreflang('fr', `https://smarthoster.io/fr${canonicalUrl}`);
      updateHreflang('x-default', `https://smarthoster.io${canonicalUrl}`);
    } else {
      // For blog posts, only add hreflang if variants exist (handled by BlogPost component)
      updateHreflang('x-default', `https://smarthoster.io${canonicalUrl}`);
    }
    
    // Canonical URL - language-specific
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    
    // Build language-specific canonical URL
    const getCanonicalUrl = () => {
      if (currentLanguage === 'en') {
        return `https://smarthoster.io${canonicalUrl}`;
      } else {
        return `https://smarthoster.io/${currentLanguage}${canonicalUrl}`;
      }
    };
    
    canonical.setAttribute('href', getCanonicalUrl());

    // Organization Schema
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SmartHoster.io",
      "url": "https://smarthoster.io",
      "logo": "https://smarthoster.io/favicon.ico",
      "description": "Complete vacation rental management platform with automated guest communication, dynamic pricing, and integrated booking systems.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+351-xxx-xxx-xxx",
        "contactType": "Customer Service",
        "availableLanguage": ["English", "Portuguese", "French"]
      },
      "sameAs": [
        "https://www.facebook.com/SmartHoster",
        "https://www.instagram.com/smarthoster",
        "https://www.linkedin.com/company/smarthoster"
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "PT",
        "addressLocality": "Lisbon"
      }
    };

    // Combine with custom structured data
    const combinedSchema = structuredData ? [baseSchema, structuredData] : baseSchema;
    
    // Add FAQ schema if provided
    let finalSchema = combinedSchema;
    if (faqData && faqData.length > 0) {
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      };
      
      finalSchema = Array.isArray(combinedSchema) ? [...combinedSchema, faqSchema] : [combinedSchema, faqSchema];
    }

    // Update JSON-LD structured data
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(finalSchema);

  }, [finalTitle, finalDescription, canonicalUrl, ogImage, ogType, lastModified, currentLanguage, structuredData, faqData]);

  return null;
};

export default SEO;