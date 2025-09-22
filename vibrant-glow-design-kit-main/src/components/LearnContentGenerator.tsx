import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const articles = [
  {
    title: 'Alojamento Local Compliance Guide (2025)',
    slug: 'alojamento-local-compliance-guide',
    prompt: 'Write a comprehensive guide about AL compliance requirements in Portugal for 2025, focusing on regulatory updates, municipal requirements, and specific considerations for properties in Olhão, Fuseta, Faro, Almancil, and the Golden Triangle. Include practical steps for staying compliant and avoiding penalties.'
  },
  {
    title: 'How to Get an AL License in Portugal',
    slug: 'how-to-get-al-license-portugal',
    prompt: 'Create a step-by-step guide for obtaining an AL license in Portugal, with specific focus on the application process in Algarve municipalities like Olhão, Faro, and Almancil. Include required documents, timelines, fees, and common challenges.'
  },
  {
    title: 'Short-Term Rental Insurance Requirements',
    slug: 'al-insurance-requirements-portugal',
    prompt: 'Explain the insurance requirements for AL properties in Portugal, including mandatory coverage types, recommended additional insurance, and how requirements differ for luxury properties in areas like the Golden Triangle versus traditional areas like Olhão and Fuseta.'
  },
  {
    title: 'SEF / AIMA Guest Reporting Guide',
    slug: 'sef-guest-reporting-guide',
    prompt: 'Provide a detailed guide on guest reporting obligations for AL owners in Portugal, including the accommodation bulletin system, deadlines, penalties for non-compliance, and practical tips for managing guest registration in high-volume rental areas.'
  },
  {
    title: 'Airbnb vs Alojamento Local in Portugal',
    slug: 'airbnb-vs-alojamento-local-portugal',
    prompt: 'Compare operating on Airbnb versus having an AL license in Portugal, explaining legal requirements, benefits, risks, and why both are typically needed. Include specific examples for different property types in Faro, Almancil, and Vilamoura.'
  },
  {
    title: 'Avoiding Fines as an AL Owner',
    slug: 'how-to-avoid-al-fines',
    prompt: 'Create a comprehensive guide on avoiding common AL violations and fines in Portugal, with specific focus on Algarve enforcement practices, typical penalty amounts, appeal processes, and prevention strategies for properties in different municipalities.'
  },
  {
    title: 'What SmartHoster Actually Does',
    slug: 'what-does-smart-hoster-do',
    prompt: 'Explain SmartHoster\'s services for short-term rental owners in the Algarve, including AL licensing support, guest management, tourist tax handling, full-service management, and how we help properties in Olhão, Faro, Almancil, and the Golden Triangle maximize their rental potential while staying compliant.'
  },
  {
    title: 'Guest Book & Safety Requirements',
    slug: 'al-guest-book-safety',
    prompt: 'Detail the guest book and safety requirements for AL properties in Portugal, including mandatory safety equipment, emergency procedures, guest information requirements, and how these standards are enforced in different Algarve municipalities.'
  }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const targetLocations = ['Olhão', 'Fuseta', 'Faro', 'Almancil', 'Quinta do Lago', 'Vale do Lobo', 'Vilamoura'];

export function LearnContentGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('');

  const generateAllContent = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    const totalArticles = articles.length * languages.length;
    let completed = 0;

    try {
      for (const article of articles) {
        for (const language of languages) {
          setCurrentStatus(`Generating ${article.title} in ${language.name}...`);
          
          try {
            const { data, error } = await supabase.functions.invoke('generate-learn-content', {
              body: {
                prompt: article.prompt,
                articleTitle: article.title,
                slug: article.slug,
                language: language.code,
                targetLocations: targetLocations
              }
            });

            if (error) {
              console.error(`Error generating ${article.slug} in ${language.code}:`, error);
              toast.error(`Failed to generate ${article.title} in ${language.name}`);
            } else {
              console.log(`Generated ${article.slug} in ${language.code}:`, data);
              toast.success(`Generated ${article.title} in ${language.name}`);
            }
          } catch (err) {
            console.error(`Exception generating ${article.slug} in ${language.code}:`, err);
            toast.error(`Error generating ${article.title} in ${language.name}`);
          }

          completed++;
          setProgress((completed / totalArticles) * 100);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setCurrentStatus('Content generation completed!');
      toast.success('All articles have been generated successfully!');
    } catch (error) {
      console.error('Error in content generation:', error);
      toast.error('Failed to complete content generation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Multilingual Learn Content Generator</CardTitle>
        <p className="text-muted-foreground">
          Generate {articles.length} articles in {languages.length} languages ({articles.length * languages.length} total articles)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Articles to Generate:</h3>
            <ul className="text-sm space-y-1">
              {articles.map((article, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  {article.title}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Languages:</h3>
            <ul className="text-sm space-y-1">
              {languages.map((lang, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  {lang.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Target Locations:</h3>
          <p className="text-sm text-muted-foreground">
            {targetLocations.join(', ')}
          </p>
        </div>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStatus}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={generateAllContent} 
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? 'Generating Content...' : 'Generate All Multilingual Content'}
        </Button>
      </CardContent>
    </Card>
  );
}