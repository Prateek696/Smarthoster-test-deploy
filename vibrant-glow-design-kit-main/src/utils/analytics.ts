import ReactGA from 'react-ga4';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface ContentAnalytics {
  content_id: string;
  content_title: string;
  content_category: string;
  content_author?: string;
  content_language: string;
  content_type: 'static' | 'generated';
}

class Analytics {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window !== 'undefined' && !this.initialized) {
      ReactGA.initialize("G-0LH860VBV3");
      this.initialized = true;
    }
  }

  // Track page views
  trackPageView(page: string, title?: string) {
    if (!this.initialized) return;
    
    ReactGA.send({
      hitType: "pageview",
      page,
      title
    });
  }

  // Track custom events
  trackEvent({ action, category, label, value, custom_parameters }: AnalyticsEvent) {
    if (!this.initialized) return;
    
    ReactGA.event(action, {
      event_category: category,
      event_label: label,
      value,
      ...custom_parameters
    });
  }

  // Track content interactions
  trackContentView(content: ContentAnalytics) {
    this.trackEvent({
      action: 'content_view',
      category: 'Content',
      label: content.content_title,
      custom_parameters: {
        content_id: content.content_id,
        content_category: content.content_category,
        content_author: content.content_author,
        content_language: content.content_language,
        content_type: content.content_type
      }
    });
  }

  trackContentShare(content: ContentAnalytics, platform: string) {
    this.trackEvent({
      action: 'content_share',
      category: 'Content',
      label: `${content.content_title} - ${platform}`,
      custom_parameters: {
        content_id: content.content_id,
        share_platform: platform,
        content_category: content.content_category,
        content_language: content.content_language
      }
    });
  }

  trackContentRead(content: ContentAnalytics, readPercentage: number) {
    this.trackEvent({
      action: 'content_read',
      category: 'Content',
      label: content.content_title,
      value: readPercentage,
      custom_parameters: {
        content_id: content.content_id,
        read_percentage: readPercentage,
        content_category: content.content_category,
        content_language: content.content_language
      }
    });
  }

  // Track search interactions
  trackSearch(query: string, resultsCount: number, language: string) {
    this.trackEvent({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_term: query,
        results_count: resultsCount,
        language
      }
    });
  }

  // Track filter usage
  trackFilter(filterType: string, filterValue: string, language: string) {
    this.trackEvent({
      action: 'filter_use',
      category: 'Filter',
      label: `${filterType}: ${filterValue}`,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
        language
      }
    });
  }

  // Track tag interactions
  trackTagClick(tagName: string, language: string) {
    this.trackEvent({
      action: 'tag_click',
      category: 'Navigation',
      label: tagName,
      custom_parameters: {
        tag_name: tagName,
        language
      }
    });
  }

  // Track author interactions
  trackAuthorClick(authorName: string, language: string) {
    this.trackEvent({
      action: 'author_click',
      category: 'Navigation',
      label: authorName,
      custom_parameters: {
        author_name: authorName,
        language
      }
    });
  }

  // Track newsletter signups
  trackNewsletterSignup(language: string) {
    this.trackEvent({
      action: 'newsletter_signup',
      category: 'Engagement',
      label: 'Newsletter',
      custom_parameters: {
        language
      }
    });
  }

  // Track contact form submissions
  trackContactForm(formType: string, language: string) {
    this.trackEvent({
      action: 'contact_form_submit',
      category: 'Engagement',
      label: formType,
      custom_parameters: {
        form_type: formType,
        language
      }
    });
  }

  // Track content generation requests (admin)
  trackContentGeneration(category: string, language: string, tone: string) {
    this.trackEvent({
      action: 'content_generation',
      category: 'Admin',
      label: category,
      custom_parameters: {
        generation_category: category,
        generation_language: language,
        generation_tone: tone
      }
    });
  }

  // Track scroll depth
  trackScrollDepth(depth: number, page: string) {
    this.trackEvent({
      action: 'scroll_depth',
      category: 'Engagement',
      label: page,
      value: depth,
      custom_parameters: {
        scroll_depth: depth
      }
    });
  }

  // Track time on page
  trackTimeOnPage(timeInSeconds: number, page: string) {
    this.trackEvent({
      action: 'time_on_page',
      category: 'Engagement',
      label: page,
      value: timeInSeconds,
      custom_parameters: {
        time_spent: timeInSeconds
      }
    });
  }

  // Track external link clicks
  trackExternalLink(url: string, context: string) {
    this.trackEvent({
      action: 'external_link_click',
      category: 'Outbound',
      label: url,
      custom_parameters: {
        external_url: url,
        link_context: context
      }
    });
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Hook for scroll depth tracking
export const useScrollDepthTracking = (page: string) => {
  if (typeof window === 'undefined') return;

  let maxScrollDepth = 0;
  let timeOnPageStart = Date.now();
  let scrollDepthTracked = false;

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

    if (scrollPercentage > maxScrollDepth) {
      maxScrollDepth = scrollPercentage;
    }

    // Track scroll milestones
    if (!scrollDepthTracked && (scrollPercentage >= 75 || scrollPercentage >= 100)) {
      analytics.trackScrollDepth(scrollPercentage, page);
      scrollDepthTracked = true;
    }
  };

  const handleBeforeUnload = () => {
    const timeSpent = Math.round((Date.now() - timeOnPageStart) / 1000);
    if (timeSpent > 10) { // Only track if user spent more than 10 seconds
      analytics.trackTimeOnPage(timeSpent, page);
    }
  };

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};