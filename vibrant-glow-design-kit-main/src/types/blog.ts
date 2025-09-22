
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
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
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readTime: number;
  isDraft: boolean;
  seoTitle?: string;
  canonicalUrl?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface FAQ {
  question: string;
  answer: string;
}
