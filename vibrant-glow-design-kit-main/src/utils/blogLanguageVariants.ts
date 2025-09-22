import { allBlogPosts } from '@/data/blogPostsUpdated';

interface LanguageVariant {
  language: 'en' | 'pt' | 'fr';
  url: string;
  title: string;
  exists: boolean;
}

interface BlogLanguageVariants {
  slug: string;
  variants: LanguageVariant[];
}

// Create mapping of blog articles and their language variants
export const getBlogLanguageVariants = (currentSlug: string): BlogLanguageVariants => {
  const variants: LanguageVariant[] = [];
  
  // Check each language for this slug
  const languages = [
    { code: 'en' as const, posts: allBlogPosts.en, urlPrefix: '' },
    { code: 'pt' as const, posts: allBlogPosts.pt, urlPrefix: '/pt' },
    { code: 'fr' as const, posts: allBlogPosts.fr, urlPrefix: '/fr' }
  ];

  languages.forEach(({ code, posts, urlPrefix }) => {
    const post = posts?.find(p => p.slug === currentSlug);
    variants.push({
      language: code,
      url: `${urlPrefix}/blog/${currentSlug}`,
      title: post?.title || '',
      exists: !!post
    });
  });

  return {
    slug: currentSlug,
    variants
  };
};

// Get all blog articles that exist across all languages
export const getAllBlogVariantsMap = (): Record<string, BlogLanguageVariants> => {
  const variantsMap: Record<string, BlogLanguageVariants> = {};
  
  // Get all unique slugs from all languages
  const allSlugs = new Set<string>();
  
  if (allBlogPosts.en) allBlogPosts.en.forEach(post => allSlugs.add(post.slug));
  if (allBlogPosts.pt) allBlogPosts.pt.forEach(post => allSlugs.add(post.slug));
  if (allBlogPosts.fr) allBlogPosts.fr.forEach(post => allSlugs.add(post.slug));

  // Map each slug to its variants
  allSlugs.forEach(slug => {
    variantsMap[slug] = getBlogLanguageVariants(slug);
  });

  return variantsMap;
};

// Audit function to return missing variants
export const auditBlogLanguageVariants = () => {
  const variantsMap = getAllBlogVariantsMap();
  const complete: string[] = [];
  const missing: Array<{slug: string; missingLanguages: string[]}> = [];
  
  Object.entries(variantsMap).forEach(([slug, variants]) => {
    const existingLanguages = variants.variants.filter(v => v.exists).map(v => v.language);
    const missingLanguages = variants.variants.filter(v => !v.exists).map(v => v.language);
    
    if (missingLanguages.length === 0) {
      complete.push(slug);
    } else {
      missing.push({
        slug,
        missingLanguages
      });
    }
  });

  return { complete, missing };
};