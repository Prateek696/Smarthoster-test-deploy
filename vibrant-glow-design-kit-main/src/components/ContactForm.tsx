
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, Shield, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const ContactForm = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
    consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.message || !formData.consent) {
      toast({
        title: t?.contact?.form?.validation?.title || "Please fill in all required fields",
        description: t?.contact?.form?.validation?.description || "Make sure to fill in your name, email, message, and accept the privacy policy.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create mailto link for now - in production this would be an API call
      const subject = encodeURIComponent(t?.contact?.form?.emailSubject || "Contact Form Submission from SmartHoster.io");
      const body = encodeURIComponent(`
Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone || t?.contact?.form?.notProvided || 'Not provided'}

Message:
${formData.message}

Consent: ${t?.contact?.form?.consentConfirmation || 'User has agreed to receive communications.'}
      `);
      
      const mailtoLink = `mailto:contact@smarthoster.io?subject=${subject}&body=${body}`;
      window.location.href = mailtoLink;

      // Show success modal
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        message: "",
        consent: false
      });

    } catch (error) {
      toast({
        title: t?.contact?.form?.error?.title || "Error sending message",
        description: t?.contact?.form?.error?.description || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 animate-scale-in shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{t?.contact?.form?.success?.title || "Message Sent Successfully!"}</h3>
          <p className="text-gray-600 mb-6">
            {t?.contact?.form?.success?.description || "Thank you for contacting us. We'll get back to you within 24 hours."}
          </p>
          <Button 
            onClick={() => setShowSuccessModal(false)}
            className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold px-6 py-2 rounded-lg"
          >
            {t?.contact?.form?.success?.button || "Close"}
          </Button>
        </div>
        <button
          onClick={() => setShowSuccessModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" data-section="contact-form">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-[#5FFF56]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-[#00CFFF]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="animate-fade-in">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">
                {t?.contact?.getInTouch || "Get in Touch"}
              </h3>
              
              <div className="space-y-6 mb-8 lg:mb-12">
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[#00CFFF]/10 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-6">
                    <Mail className="h-5 w-5 lg:h-6 lg:w-6 text-[#00CFFF]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{t?.contact?.email?.label || "Email"}</div>
                    <div className="text-gray-600">contact@smarthoster.io</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[#5FFF56]/10 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-6">
                    <Phone className="h-5 w-5 lg:h-6 lg:w-6 text-[#5FFF56]" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{t?.contact?.phone?.label || "Phone"}</div>
                    <div className="text-gray-600">+351 933 683 981</div>
                  </div>
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 mr-3" />
                  <span className="text-sm font-semibold text-gray-800">{t?.contact?.trust?.ssl || "SSL Secured Communication"}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 lg:h-5 lg:w-5 text-green-600 mr-3" />
                  <span className="text-sm font-semibold text-gray-800">{t?.contact?.trust?.gdpr || "GDPR Compliant"}</span>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-200/50">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t?.contact?.form?.fullName?.label || "Full Name"} *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-gray-200 rounded-xl focus:border-[#00CFFF] focus:outline-none transition-colors"
                      placeholder={t?.contact?.form?.fullName?.placeholder || "Your full name"}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t?.contact?.form?.email?.label || "Email Address"} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-gray-200 rounded-xl focus:border-[#00CFFF] focus:outline-none transition-colors"
                      placeholder={t?.contact?.form?.email?.placeholder || "your@email.com"}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t?.contact?.form?.phone?.label || "Phone Number"} ({t?.contact?.form?.optional || "Optional"})
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-gray-200 rounded-xl focus:border-[#00CFFF] focus:outline-none transition-colors"
                      placeholder={t?.contact?.form?.phone?.placeholder || "+351 XXX XXX XXX"}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                      {t?.contact?.form?.message?.label || "Message"} *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 lg:px-6 py-3 lg:py-4 border-2 border-gray-200 rounded-xl focus:border-[#00CFFF] focus:outline-none transition-colors resize-none"
                      placeholder={t?.contact?.form?.message?.placeholder || "Tell us about your property and how we can help..."}
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="consent"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      required
                      className="mt-1 mr-3 h-4 w-4 lg:h-5 lg:w-5 text-[#00CFFF] border-2 border-gray-300 rounded focus:ring-[#00CFFF]"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-700 leading-relaxed">
                      {t?.contact?.form?.consent?.text || "I consent to receive updates and communications from"}{" "}
                      <span className="font-semibold text-[#00CFFF]">SmartHoster.io</span>.{" "}
                      {t?.contact?.form?.consent?.unsubscribe || "You can unsubscribe at any time. View our"}{" "}
                      <a href="#" className="text-[#00CFFF] hover:underline font-semibold">{t?.contact?.form?.consent?.privacy || "Privacy Policy"}</a>. *
                    </label>
                  </div>
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting || !formData.fullName || !formData.email || !formData.message || !formData.consent}
                    className="w-full bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-bold py-4 lg:py-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                    {isSubmitting ? (t?.contact?.form?.sending || "Sending...") : (t?.contact?.form?.submit || "Send Message")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && <SuccessModal />}
    </>
  );
};

export default ContactForm;
