
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import AboutUs from "@/components/AboutUs";
import Features from "@/components/Features";
import Integrations from "@/components/Integrations";
import Testimonials from "@/components/Testimonials";
import SuccessStories from "@/components/SuccessStories";
import HowItWorks from "@/components/HowItWorks";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import ContactForm from "@/components/ContactForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

const Index = () => {
  const { t } = useLanguage();
  
  // Check for password recovery and error parameters and redirect
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const hash = window.location.hash;
        
        // Handle recovery flow
        if (hash.includes('type=recovery')) {
          console.log('Recovery parameters detected on home page, redirecting to /auth/reset');
          window.location.href = '/auth/reset' + hash;
          return;
        }
        
        // Handle password reset errors (expired links, etc.)
        if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
          console.log('Password reset error detected, redirecting to auth with error info');
          // Extract error info and redirect to auth page
          const urlParams = new URLSearchParams(hash.substring(1));
          const error = urlParams.get('error');
          const errorCode = urlParams.get('error_code');
          const errorDescription = urlParams.get('error_description');
          
          // Redirect to auth page and show error
          window.location.href = `/auth?error=${error}&error_code=${errorCode}&error_description=${encodeURIComponent(errorDescription || '')}`;
          return;
        }
      }
    } catch (error) {
      console.error('Error checking recovery/error parameters:', error);
    }
  }, []);
  
  // Define FAQ data for schema
  const faqData = [
    {
      question: t.faq?.questions?.[0]?.question || "What is SmartHoster.io?",
      answer: t.faq?.questions?.[0]?.answer || "SmartHoster.io is a comprehensive vacation rental management platform that automates guest communication, optimizes pricing, and integrates with major booking platforms."
    },
    {
      question: t.faq?.questions?.[1]?.question || "How much does SmartHoster.io cost?",
      answer: t.faq?.questions?.[1]?.answer || "We offer flexible pricing plans from 12% to 20% commission-based fees, with no upfront costs. Our pricing scales with your property's performance."
    },
    {
      question: t.faq?.questions?.[2]?.question || "Which platforms does SmartHoster.io integrate with?",
      answer: t.faq?.questions?.[2]?.answer || "We integrate with over 50 booking platforms including Airbnb, Booking.com, VRBO, Expedia, and many more for seamless property management."
    }
  ];
  
  const customSEO = {
    title: "SmartHoster | Airbnb & Short-Term Rental Management (AL) in Portugal",
    description: "Local, full-service property management for Alojamento Local (AL) in Portugal. Cleaning, linens, check-ins, compliance & guest support – all included.",
    faqData,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SmartHoster",
      "url": "https://smarthoster.io",
      "logo": "https://smarthoster.io/favicon.ico",
      "description": "SmartHoster provides professional short-term rental management in Portugal, handling everything from listings to compliance.",
      "sameAs": [
        "https://www.instagram.com/smarthoster.io",
        "https://www.facebook.com/smarthoster.io"
      ]
    }
  };
  
  return (
    <Layout customSEO={customSEO}>
      <Hero />
      <AboutUs />
      <Features />
      <Integrations />
      <Testimonials />
      <SuccessStories />
      <HowItWorks />
      <FAQ />
      <CTA />
      <div id="contact">
        <ContactForm />
      </div>
    </Layout>
  );
};

export default Index;
