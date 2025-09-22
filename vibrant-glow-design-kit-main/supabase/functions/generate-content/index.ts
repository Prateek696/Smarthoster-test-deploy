import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to generate multiple SEO-optimized image options
async function generateImageOptions(prompt: string, title: string, openAIApiKey: string) {
  const imagePrompts = [
    `Professional blog header image for: ${title}. Modern, clean, web-optimized design. High quality, suitable for SEO`,
    `Premium featured image illustrating: ${prompt}. Contemporary style, blog-ready, optimized for social sharing`,
    `Elegant visual representation of: ${title}. Professional photography style, perfect for article headers`
  ];

  const images = [];
  
  for (let i = 0; i < imagePrompts.length; i++) {
    try {
      const imagePrompt = imagePrompts[i];
      
      const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-1',
          prompt: imagePrompt,
          n: 1,
          size: '1792x1024',
          quality: 'high',
          output_format: 'webp'
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const base64Image = imageData.data[0].b64_json;
        
        // Generate SEO-optimized alt text
        const altTextResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Generate a concise, SEO-optimized alt text (max 125 characters) for this image.' },
              { role: 'user', content: `Alt text for image with prompt: ${imagePrompt}` }
            ],
            max_tokens: 50
          }),
        });

        const altData = await altTextResponse.json();
        const altText = altData.choices[0].message.content.trim().replace(/['"]/g, '');

        images.push({
          id: i + 1,
          url: `data:image/webp;base64,${base64Image}`,
          alt: altText,
          prompt: imagePrompt
        });
      }
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error);
    }
  }
  
  return images;
}

// Helper function to select random author or get specific author
async function getAuthor(supabase: any, authorId: string | null = null) {
  if (authorId) {
    const { data: author, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .single();
    
    if (!error && author) return author;
  }
  
  // Fallback to random author
  const { data: authors, error } = await supabase
    .from('authors')
    .select('*')
    .limit(5);
  
  if (error || !authors || authors.length === 0) {
    console.error('Error fetching authors:', error);
    return null;
  }
  
  return authors[Math.floor(Math.random() * authors.length)];
}

// Helper function to calculate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(' ').length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Helper function to extract excerpt from content
function generateExcerpt(content: string, maxLength: number = 160): string {
  // Remove HTML tags and get first paragraph
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (textContent.length <= maxLength) return textContent;
  
  // Find the last complete sentence within the limit
  const truncated = textContent.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      prompt, 
      language = 'en', 
      tone = 'professional', 
      category = 'blog', 
      target_location = 'Portugal', 
      user_id,
      author_id = null,
      publish_date = null
    } = await req.json();

    if (!prompt || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating enhanced content for prompt:', prompt);

    // Get author information
    const author = await getAuthor(supabase, author_id);
    const authorInfo = author ? `Written by ${author.name}, ${author.bio}` : '';

    // Create comprehensive prompt for content generation
    const systemPrompt = `You are an expert SEO content writer specializing in property management and vacation rentals in Portugal. Generate comprehensive, AEO-optimized blog content that will rank well in search engines and be featured in AI overviews.

IMPORTANT: Return ONLY a valid JSON object with these exact keys:
{
  "title": "SEO-optimized H1 title (50-60 characters)",
  "metaTitle": "Meta title for search engines (50-60 characters)", 
  "metaDescription": "Meta description (150-160 characters)",
  "aiSnippet": "Concise answer for AI overviews and featured snippets (2-3 sentences)",
  "content": "Full HTML blog post with h2/h3 headings, paragraphs, lists, structured for readability",
  "keywords": ["primary keyword", "secondary keyword", "long-tail keyword", "related keyword"],
  "slug": "url-friendly-slug-with-primary-keyword",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "schemaMarkup": {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [FAQ items with questions and answers]
  },
  "internalLinks": [{"anchor": "text", "url": "/page", "type": "service_page"}],
  "externalLinks": [{"anchor": "text", "url": "https://example.com", "type": "authority"}]
}

Write in ${language === 'pt' ? 'Portuguese (Portugal)' : language === 'fr' ? 'French' : 'English'} with a ${tone} tone.
Focus on ${category} content for ${target_location}.
${authorInfo ? `Author context: ${authorInfo}` : ''}
Include practical advice, local insights, and clear calls-to-action.`;

    const userPrompt = `Generate comprehensive blog content about: ${prompt}

Requirements:
- Target answer engines (Google AI Overviews, ChatGPT, Claude)
- Include detailed FAQ section with schema markup (minimum 5 questions)
- Add 3-5 internal links to SmartHoster services (/services, /contact, /local-expertise, /compliance, /automation, /pricing)
- Include 2-3 authoritative external links to government sites or industry authorities
- Structure with clear H2/H3 headings for readability
- Target long-tail keywords and semantic variations
- Include actionable tips and local Portuguese insights
- End with clear call-to-action to SmartHoster services
- Optimize for featured snippets and voice search
- Include numbered lists and bullet points for scanability`;

    console.log('Making API call to OpenAI for content generation...');

    const contentResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!contentResponse.ok) {
      throw new Error(`OpenAI API error: ${contentResponse.statusText}`);
    }

    const contentData = await contentResponse.json();
    const generatedContent = contentData.choices[0].message.content;

    console.log('Content generated, parsing response...');

    // Parse the JSON response
    let contentResult;
    try {
      contentResult = JSON.parse(generatedContent);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', generatedContent);
      throw new Error('AI response was not valid JSON');
    }

    console.log('Generating multiple image options...');

    // Generate multiple image options
    const imageOptions = await generateImageOptions(prompt, contentResult.title, openAIApiKey);

    // Calculate additional metadata
    const readingTime = calculateReadingTime(contentResult.content);
    const excerpt = generateExcerpt(contentResult.content);
    const publishDate = publish_date ? new Date(publish_date) : new Date();

    // Enhanced response with all the new features
    const enhancedResult = {
      ...contentResult,
      imageOptions: imageOptions,
      selectedImageIndex: 0, // Default to first image
      featuredImageUrl: imageOptions.length > 0 ? imageOptions[0].url : null,
      featuredImageAlt: imageOptions.length > 0 ? imageOptions[0].alt : null,
      authorId: author?.id || null,
      authorName: author?.name || null,
      authorBio: author?.bio || null,
      authorImage: author?.profile_image_url || null,
      datePublished: publishDate.toISOString(),
      dateModified: new Date().toISOString(),
      excerpt: excerpt,
      readingTime: readingTime,
      language: language,
      tone: tone,
      category: category,
      targetLocation: target_location,
      viewCount: 0,
      status: 'draft'
    };

    console.log('Enhanced content generation completed successfully');

    return new Response(JSON.stringify(enhancedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Content generation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});