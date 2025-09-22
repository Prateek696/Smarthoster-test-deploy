export interface LearnArticle {
  id: string;
  title: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  ogImage: string;
  featuredImage: string;
  content: string;
  excerpt: string;
  author: {
    name: string;
    bio: string;
    avatar: string;
  };
  publishedAt: string;
  lastModified: string;
  category: string;
  tags: string[];
  readTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  canonicalUrl: string;
  isDraft: boolean;
  faqData?: Array<{
    question: string;
    answer: string;
  }>;
  targetLocations: string[];
}

export interface LearnCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}