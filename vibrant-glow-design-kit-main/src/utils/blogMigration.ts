import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { blogPosts } from '@/data/blogPostsUpdated';
import { blogPostsPt } from '@/data/blogPostsPt';
import { blogPostsFr } from '@/data/blogPostsFr';

interface AuthorMapping {
  [key: string]: string;
}

export const migrateBlogPosts = async () => {
  try {
    // Create admin client that can bypass RLS for migration
    const adminClient = createClient(
      'https://vbfvlcuqoinkafqknysp.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiZnZsY3Vxb2lua2FmcWtueXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODU2NDUxMSwiZXhwIjoyMDY0MTQwNTExfQ.p5_EMPxPHTSjGKjhpxNSIj3Pf8rFsROiXZmx4YxQ2VI',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Combine all blog posts from different languages
    const allPosts = [
      ...blogPosts.map(post => ({ ...post, language: 'en' })),
      ...blogPostsPt.map(post => ({ ...post, language: 'pt' })),
      ...blogPostsFr.map(post => ({ ...post, language: 'fr' }))
    ];

    console.log(`Starting migration of ${allPosts.length} blog posts...`);

    // First, create authors if they don't exist
    const authorMapping: AuthorMapping = {};
    
    for (const post of allPosts) {
      if (post.author && !authorMapping[post.author.name]) {
        const authorSlug = post.author.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if author already exists
        const { data: existingAuthor } = await adminClient
          .from('authors')
          .select('id')
          .eq('slug', authorSlug)
          .maybeSingle();

        if (!existingAuthor) {
          // Create new author
          const { data: newAuthor, error } = await adminClient
            .from('authors')
            .insert({
              name: post.author.name,
              slug: authorSlug,
              bio: post.author.bio || '',
              profile_image_url: post.author.avatar || null
            })
            .select('id')
            .single();

          if (error) {
            console.error('Error creating author:', error);
            continue;
          }

          authorMapping[post.author.name] = newAuthor.id;
          console.log(`Created author: ${post.author.name}`);
        } else {
          authorMapping[post.author.name] = existingAuthor.id;
          console.log(`Found existing author: ${post.author.name}`);
        }
      }
    }

    // Now migrate blog posts
    const migratedPosts = [];
    
    for (const post of allPosts) {
      // Create unique slug for each language version
      const languageSlug = post.language === 'en' ? post.slug : `${post.slug}-${post.language}`;
      
      // Check if post already exists
      const { data: existingPost } = await adminClient
        .from('generated_content')
        .select('id')
        .eq('slug', languageSlug)
        .eq('language', post.language)
        .maybeSingle();

      if (existingPost) {
        console.log(`Post already exists: ${languageSlug} (${post.language})`);
        continue;
      }

      const authorId = post.author ? authorMapping[post.author.name] : null;
      
      // Calculate reading time (average 200 words per minute)
      const wordCount = post.content.split(' ').length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const contentData = {
        title: post.title,
        slug: languageSlug,
        content: post.content,
        meta_title: post.seoTitle || post.title,
        meta_description: post.metaDescription,
        excerpt: post.excerpt,
        featured_image_url: post.featuredImage || null,
        featured_image_alt: post.title,
        author_id: authorId,
        language: post.language,
        category: mapCategory(post.category),
        tags: post.tags || [],
        keywords: extractKeywords(post.content, post.tags),
        status: post.isDraft ? 'draft' : 'published',
        reading_time: readingTime,
        published_at: post.isDraft ? null : new Date(post.publishedAt || post.updatedAt).toISOString(),
        date_published: post.isDraft ? null : new Date(post.publishedAt || post.updatedAt).toISOString(),
        view_count: Math.floor(Math.random() * 50) + 10 // Add some random view counts for demo
      };

      console.log(`Migrating post: ${post.title} (${post.language})`);

      const { data, error } = await adminClient
        .from('generated_content')
        .insert(contentData)
        .select('id, title, language')
        .single();

      if (error) {
        console.error(`Error migrating post ${languageSlug}:`, error);
        console.error('Content data:', contentData);
        continue;
      }

      migratedPosts.push(data);
      console.log(`✅ Migrated: ${data.title} (${data.language})`);
    }

    console.log(`Migration completed: ${migratedPosts.length}/${allPosts.length} posts migrated`);

    return {
      success: true,
      migratedCount: migratedPosts.length,
      totalCount: allPosts.length
    };

  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Helper function to map categories
const mapCategory = (category: string): string => {
  const categoryMapping: { [key: string]: string } = {
    'Automation': 'automation',
    'Legal Compliance': 'regulations',
    'Income Strategy': 'income_strategy',
    'Hosting Tips': 'hosting_tips',
    'Local Guides': 'local_guides',
    'Area Insights': 'area_insights',
    'Market Analysis': 'market_analysis',
    'Investment Guide': 'investment_guide',
    'Market Insights': 'market_analysis',
    'Guest Experience': 'hosting_tips',
    'Sustainability': 'hosting_tips',
    'Conformité Légale': 'regulations',
    'Stratégie de Revenus': 'income_strategy',
    'Expérience Client': 'hosting_tips',
    'Durabilité': 'hosting_tips',
    'Estratégia de Rendimento': 'income_strategy',
    'Conformidade Legal': 'regulations',
    'Experiência do Hóspede': 'hosting_tips',
    'Sustentabilidade': 'hosting_tips'
  };

  return categoryMapping[category] || 'hosting_tips';
};

// Helper function to extract keywords from content and tags
const extractKeywords = (content: string, tags: string[] = []): string[] => {
  // Simple keyword extraction - in a real app, you might use NLP
  const keywords = [...tags];
  
  // Add some common terms from content
  const commonTerms = ['portugal', 'airbnb', 'hosting', 'property', 'rental', 'guest'];
  const contentLower = content.toLowerCase();
  
  commonTerms.forEach(term => {
    if (contentLower.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  });

  return keywords.slice(0, 10); // Limit to 10 keywords
};