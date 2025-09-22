
import React from 'react';
import CalendlyButton from '@/components/CalendlyButton';
import { Calendar, ArrowRight } from 'lucide-react';

const BlogCTA = () => {
  return (
    <div className="bg-gradient-to-r from-[#5FFF56] to-[#4EE045] rounded-lg p-8 my-12">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-black mb-4">
          Ready to Optimize Your Property?
        </h3>
        <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
          Get personalized advice from our property management experts. Book a free consultation to discover how SmartHoster can maximize your rental income and streamline your operations.
        </p>
        <CalendlyButton
          calendlyUrl="https://calendly.com/admin-smarthoster"
          className="bg-black hover:bg-gray-800 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg transition-colors duration-200 inline-flex items-center h-auto min-h-12"
          utmSource="blog"
          utmMedium="website"
          utmCampaign="consultation"
          utmContent="blog-cta"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Book Free Strategy Call
          <ArrowRight className="w-5 h-5 ml-2" />
        </CalendlyButton>
        <p className="text-sm text-gray-700 mt-4">
          No commitment • Expert insights • Tailored to your property
        </p>
      </div>
    </div>
  );
};

export default BlogCTA;
