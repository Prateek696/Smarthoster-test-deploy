
export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const generateTableOfContents = (content: string) => {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    headings.push({
      level,
      text,
      id
    });
  }

  return headings;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

export const generateMetaTags = (post: any) => {
  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription,
    ogTitle: post.title,
    ogDescription: post.metaDescription,
    ogImage: post.ogImage,
    ogUrl: `https://smarthoster.io/blog/${post.slug}`,
    canonicalUrl: post.canonicalUrl || `/blog/${post.slug}`,
    articleAuthor: post.author.name,
    articlePublishedTime: post.publishedAt,
    articleModifiedTime: post.updatedAt,
    articleSection: post.category,
    articleTags: post.tags.join(', ')
  };
};
