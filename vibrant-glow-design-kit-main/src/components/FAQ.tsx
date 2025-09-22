
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, DollarSign, FileCheck, Phone, Home, Sparkles, Calendar, CreditCard, FileText, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { t } = useLanguage();

  const faqs = [
    {
      icon: Clock,
      question: t.faq.questions.setup.question,
      answer: t.faq.questions.setup.answer
    },
    {
      icon: DollarSign,
      question: t.faq.questions.fees.question,
      answer: t.faq.questions.fees.answer
    },
    {
      icon: FileCheck,
      question: t.faq.questions.compliance.question,
      answer: t.faq.questions.compliance.answer
    },
    {
      icon: Phone,
      question: t.faq.questions.emergency.question,
      answer: t.faq.questions.emergency.answer
    },
    {
      icon: Home,
      question: t.faq.questions.personal.question,
      answer: t.faq.questions.personal.answer
    },
    {
      icon: Sparkles,
      question: t.faq.questions.cleaningFees.question,
      answer: t.faq.questions.cleaningFees.answer
    },
    {
      icon: Calendar,
      question: t.faq.questions.cancellation.question,
      answer: t.faq.questions.cancellation.answer
    },
    {
      icon: CreditCard,
      question: t.faq.questions.payment.question,
      answer: t.faq.questions.payment.answer
    },
    {
      icon: FileText,
      question: t.faq.questions.contract.question,
      answer: t.faq.questions.contract.answer
    },
    {
      icon: Users,
      question: t.faq.questions.cleaningTeam.question,
      answer: t.faq.questions.cleaningTeam.answer
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-[#5FFF56]/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-[#00CFFF]/3 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 tracking-tight leading-tight">
            {t.faq.title}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light px-4 sm:px-0">
            {t.faq.description}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-left hover:no-underline hover:bg-gray-50/50 transition-colors duration-200 [&[data-state=open]]:bg-gray-50/50">
                  <div className="flex items-center w-full pr-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 lg:mr-6 bg-[#00CFFF]/10 border border-[#00CFFF]/20 flex-shrink-0">
                      <faq.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-[#00CFFF]" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-gray-900 leading-tight">
                      {faq.question}
                    </h3>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
                  <div className="pl-11 sm:pl-14 lg:pl-18">
                    <div className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed space-y-3">
                      {faq.answer.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
