
import { useCallback } from 'react';

// Function to set up Calendly event listeners for Google Ads conversion tracking
const setupCalendlyEventListeners = () => {
  // Only set up listeners once
  if (window.calendlyListenersSetup) {
    console.log('Calendly event listeners already set up');
    return;
  }
  
  console.log('Setting up Calendly event listeners...');
  
  // Listen for all messages to debug
  window.addEventListener('message', function(e) {
    console.log('Received message:', e.data, 'from origin:', e.origin);
    
    if (e.origin === 'https://calendly.com' && e.data.event === 'calendly.event_scheduled') {
      console.log('Calendly event_scheduled detected!');
      
      // Fire Google Ads conversion with correct conversion label
      if (window.gtag) {
        console.log('Firing Google Ads conversion...');
        window.gtag('event', 'conversion', {
          'send_to': 'AW-17146702361/dthNCM7ciO4aEJnUl_A_',
          'value': 1.0,
          'currency': 'USD'
        });
      } else {
        console.log('gtag not available');
      }
      
      // Push to dataLayer for GTM
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 
        'event': 'calendly.event_scheduled',
        'calendly_booking_completed': true,
        'conversion_id': 'AW-17146702361'
      });
      
      console.log('Calendly booking completed - Google Ads conversion fired with correct label');
    }
  });
  
  window.calendlyListenersSetup = true;
  console.log('Calendly event listeners setup completed');
};

export interface CalendlyConfig {
  url: string;
  prefill?: {
    name?: string;
    email?: string;
    customAnswers?: Record<string, string>;
  };
  utm?: {
    utmCampaign?: string;
    utmSource?: string;
    utmMedium?: string;
    utmContent?: string;
    utmTerm?: string;
  };
}

export const useCalendly = () => {
  const openCalendlyPopup = useCallback((config: CalendlyConfig) => {
    // Load Calendly script if not already loaded
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        if (window.Calendly) {
          setupCalendlyEventListeners();
          window.Calendly.initPopupWidget({
            url: config.url,
            ...config.prefill,
            ...config.utm,
          });
        }
      };
      document.head.appendChild(script);
    } else {
      setupCalendlyEventListeners();
      window.Calendly.initPopupWidget({
        url: config.url,
        ...config.prefill,
        ...config.utm,
      });
    }
  }, []);

  const openCalendlyInline = useCallback((elementId: string, config: CalendlyConfig) => {
    if (!window.Calendly) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        if (window.Calendly) {
          window.Calendly.initInlineWidget({
            url: config.url,
            parentElement: document.getElementById(elementId),
            ...config.prefill,
            ...config.utm,
          });
        }
      };
      document.head.appendChild(script);
    } else {
      window.Calendly.initInlineWidget({
        url: config.url,
        parentElement: document.getElementById(elementId),
        ...config.prefill,
        ...config.utm,
      });
    }
  }, []);

  return {
    openCalendlyPopup,
    openCalendlyInline,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (config: any) => void;
      initInlineWidget: (config: any) => void;
      closePopupWidget: () => void;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    calendlyListenersSetup?: boolean;
  }
}
