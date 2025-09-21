import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, ExternalLink, Download, QrCode, Star, MapPin, Clock, Shield, Users } from "lucide-react";
import { toast } from "sonner";

import smartCondoLogo from "@/assets/smartcondo-logo.svg";

// Import QR contact translations
import qrContactEn from "@/data/translations/qrContact/en.json";
import qrContactPt from "@/data/translations/qrContact/pt.json";
import qrContactFr from "@/data/translations/qrContact/fr.json";

const qrContactTranslations = {
  en: qrContactEn,
  pt: qrContactPt,
  fr: qrContactFr
};

const Start = () => {
  const { currentLanguage } = useLanguage();
  const t = qrContactTranslations[currentLanguage];

  const generateVCard = (company: 'smarthoster' | 'smartcondo') => {
    const isSmartHoster = company === 'smarthoster';
    
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${isSmartHoster ? 'SmartHoster.io' : 'SmartCondo.io'}`,
      `ORG:${isSmartHoster ? 'SmartHoster.io' : 'SmartCondo.io'}`,
      `TITLE:${isSmartHoster ? 'Airbnb Management' : 'Condo Management'}`,
      'TEL:+351933683981',
      `EMAIL:${isSmartHoster ? 'info@smarthoster.io' : 'info@smartcondo.io'}`,
      `URL:${isSmartHoster ? 'https://smarthoster.io' : 'https://smartcondo.io'}`,
      'ADR:;;Rua do Molhe 575 1º;Porto;;4150-503;Portugal',
      'END:VCARD'
    ].join('\r\n');

    return vCardData;
  };

  const downloadVCard = (company: 'smarthoster' | 'smartcondo') => {
    try {
      const vCardData = generateVCard(company);
      const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${company}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(t.downloadSuccess);
    } catch (error) {
      console.error('Error downloading vCard:', error);
      toast.error(t.downloadError);
    }
  };

  const seoData = {
    title: t.title,
    description: t.subtitle,
    canonicalUrl: "/start"
  };

  return (
    <Layout customSEO={seoData}>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          {/* QR Code Context */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-primary/20">
                <QrCode className="h-16 w-16 text-primary mx-auto" />
              </div>
            </div>
            <Badge variant="secondary" className="mb-4 text-sm px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              QR Code Scanned Successfully
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">{t.qrCode.title}</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t.qrCode.description}</p>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>SSL Secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 text-blue-600" />
              <span>500+ Happy Clients</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-red-600" />
              <span>Portugal Based</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t.title}</h2>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">{t.subtitle}</p>
          </div>

          {/* Contact Information Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* SmartHoster.io Card */}
            <Card className="border-2 border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:shadow-md transition-all overflow-hidden">
                  <img src="/favicon.svg" alt="SmartHoster.io Logo" className="w-12 h-12 object-contain" />
                </div>
                <CardTitle className="text-2xl text-primary mb-2">{t.smartHoster.title}</CardTitle>
                <Badge variant="outline" className="mx-auto">Airbnb/Short-Term Rental Management</Badge>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground text-sm">{t.smartHoster.tagline}</p>
                </div>
                
                {/* Features */}
                <div className="bg-primary/5 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-sm text-primary mb-3">{t.features.keyFeatures}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t.features.smartHosterFeatures.pricing}</li>
                    <li>• {t.features.smartHosterFeatures.support}</li>
                    <li>• {t.features.smartHosterFeatures.photography}</li>
                    <li>• {t.features.smartHosterFeatures.compliance}</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open(`mailto:${t.contact.smartHosterEmail}`, '_blank')}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    {t.actions.emailSmartHoster}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open('https://smarthoster.io', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    {t.actions.visitSmartHoster}
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    size="lg"
                    onClick={() => downloadVCard('smarthoster')}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {t.actions.downloadSmartHosterCard}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SmartCondo.io Card */}
            <Card className="border-2 border-secondary/20 hover:border-secondary transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:shadow-md transition-all overflow-hidden">
                  <img src={smartCondoLogo} alt="SmartCondo.io Logo" className="w-12 h-12 object-contain" />
                </div>
                <CardTitle className="text-2xl text-secondary mb-2">{t.smartCondo.title}</CardTitle>
                <Badge variant="outline" className="mx-auto">Condo/Property Management</Badge>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground text-sm">{t.smartCondo.tagline}</p>
                </div>
                
                {/* Features */}
                <div className="bg-secondary/5 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-sm text-secondary mb-3">{t.features.keyFeatures}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t.features.smartCondoFeatures.management}</li>
                    <li>• {t.features.smartCondoFeatures.screening}</li>
                    <li>• {t.features.smartCondoFeatures.maintenance}</li>
                    <li>• {t.features.smartCondoFeatures.reporting}</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90" 
                    size="lg"
                    onClick={() => window.open(`mailto:${t.contact.smartCondoEmail}`, '_blank')}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    {t.actions.emailSmartCondo}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    onClick={() => window.open('https://smartcondo.io', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    {t.actions.visitSmartCondo}
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    size="lg"
                    onClick={() => downloadVCard('smartcondo')}
                  >
                    <Download className="mr-2 h-5 w-5" />
                    {t.actions.downloadSmartCondoCard}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose Us Section */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-8">{t.whyChoose.title}</h3>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{t.whyChoose.rating.title}</h4>
                  <p className="text-sm text-muted-foreground">{t.whyChoose.rating.description}</p>
                </CardContent>
              </Card>
              
              <Card className="border border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{t.whyChoose.compliant.title}</h4>
                  <p className="text-sm text-muted-foreground">{t.whyChoose.compliant.description}</p>
                </CardContent>
              </Card>
              
              <Card className="border border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{t.whyChoose.support.title}</h4>
                  <p className="text-sm text-muted-foreground">{t.whyChoose.support.description}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="max-w-lg mx-auto border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground mb-2">{t.cta.title}</CardTitle>
                <p className="text-muted-foreground">{t.cta.description}</p>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="space-y-4">
                  <Button 
                    size="lg" 
                    className="w-full text-lg"
                    onClick={() => window.open(`tel:${t.contact.phone}`, '_blank')}
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    {t.actions.callUs}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`mailto:info@smarthoster.io`, '_blank')}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {t.cta.emailUs}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://calendly.com/smarthoster', '_blank')}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {t.cta.bookCall}
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-border/50 mt-6 pt-4 text-center">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {t.contact.phone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Start;