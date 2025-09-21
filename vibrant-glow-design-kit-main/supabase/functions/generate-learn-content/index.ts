import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, articleTitle, slug, language, targetLocations } = await req.json();

    const systemPrompt = `You are a Portuguese short-term rental and Alojamento Local (AL) expert writing for SmartHoster.io. 

CRITICAL REQUIREMENTS:
- Write in ${language === 'pt' ? 'formal European Portuguese (not Brazilian)' : language === 'fr' ? 'formal French' : 'professional English'}
- Reference specific Algarve locations: ${targetLocations.join(', ')}
- Include real regulatory references (Decreto-Lei 128/2014, Portaria 517/2008)
- Use Question-based H2/H3 headings for AEO optimization
- Include 3-5 FAQ items in Q&A format
- Mention local realities: seasonal demand, municipal enforcement, tourist tax
- Include internal links to related topics
- End with a localized CTA for SmartHoster services
- Target 1500-2000 words
- Write for AL owners, foreign investors, and Airbnb hosts

STRUCTURE:
1. Hook paragraph with direct answer
2. 4-6 main sections with question-based headings
3. FAQ section (3-5 Q&As)
4. Conclusion with CTA

TONE: Professional, authoritative, helpful - not sales-heavy`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      content: generatedContent,
      title: articleTitle,
      slug: slug,
      language: language 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-learn-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});