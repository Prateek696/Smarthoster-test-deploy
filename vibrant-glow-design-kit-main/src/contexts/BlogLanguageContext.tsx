
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLanguage } from './LanguageContext';

type BlogLanguage = 'en' | 'pt' | 'fr';

interface BlogLanguageContextType {
  currentBlogLanguage: BlogLanguage;
  setBlogLanguage: (language: BlogLanguage) => void;
  getBlogPath: (slug: string, language?: BlogLanguage) => string;
  getCurrentBlogPosts: () => any[];
  getCurrentBlogCategories: () => any[];
}

const BlogLanguageContext = createContext<BlogLanguageContextType | undefined>(undefined);

export const BlogLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentLanguage } = useLanguage();
  const [currentBlogLanguage, setCurrentBlogLanguage] = useState<BlogLanguage>(currentLanguage as BlogLanguage);

  const setBlogLanguage = (language: BlogLanguage) => {
    setCurrentBlogLanguage(language);
  };

  const getBlogPath = (slug: string, language?: BlogLanguage) => {
    const lang = language || currentBlogLanguage;
    if (lang === 'en') return `/blog/${slug}`;
    return `/${lang}/blog/${slug}`;
  };

  const getCurrentBlogPosts = () => {
    // Dynamic import based on language
    switch (currentBlogLanguage) {
      case 'pt':
        return require('../data/blogPostsPt').blogPostsPt;
      case 'fr':
        return require('../data/blogPostsFr').blogPostsFr;
      default:
        return require('../data/newBlogPosts').newBlogPosts;
    }
  };

  const getCurrentBlogCategories = () => {
    switch (currentBlogLanguage) {
      case 'pt':
        return require('../data/blogPostsPt').blogCategoriesPt;
      case 'fr':
        return require('../data/blogPostsFr').blogCategoriesFr;
      default:
        return require('../data/blogPostsUpdated').blogCategories;
    }
  };

  return (
    <BlogLanguageContext.Provider value={{
      currentBlogLanguage,
      setBlogLanguage,
      getBlogPath,
      getCurrentBlogPosts,
      getCurrentBlogCategories
    }}>
      {children}
    </BlogLanguageContext.Provider>
  );
};

export const useBlogLanguage = () => {
  const context = useContext(BlogLanguageContext);
  if (context === undefined) {
    throw new Error('useBlogLanguage must be used within a BlogLanguageProvider');
  }
  return context;
};
