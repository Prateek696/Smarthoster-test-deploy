
import { useEffect } from 'react';
import { BlogPost } from '@/types/blog';
import { generateMetaTags } from '@/utils/blogUtils';

interface BlogSEOProps {
  post: BlogPost;
}

const BlogSEO = ({ post }: BlogSEOProps) => {
  useEffect(() => {
    const meta = generateMetaTags(post);
    
    // Update document title
    document.title = meta.title;
    
    // Update meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', meta.description);
    updateMeta('author', meta.articleAuthor);
    
    // Open Graph tags
    updateMeta('og:title', meta.ogTitle, true);
    updateMeta('og:description', meta.ogDescription, true);
    updateMeta('og:image', meta.ogImage, true);
    updateMeta('og:url', meta.ogUrl, true);
    updateMeta('og:type', 'article', true);
    
    // Article specific meta
    updateMeta('article:author', meta.articleAuthor, true);
    updateMeta('article:published_time', meta.articlePublishedTime, true);
    updateMeta('article:modified_time', meta.articleModifiedTime, true);
    updateMeta('article:section', meta.articleSection, true);
    updateMeta('article:tag', meta.articleTags, true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', meta.ogTitle);
    updateMeta('twitter:description', meta.ogDescription);
    updateMeta('twitter:image', meta.ogImage);
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://smarthoster.io${meta.canonicalUrl}`);

    // JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.metaDescription,
      "image": post.ogImage,
      "author": {
        "@type": "Person",
        "name": post.author.name
      },
      "publisher": {
        "@type": "Organization",
        "name": "SmartHoster.io",
        "logo": {
          "@type": "ImageObject",
          "url": "https://smarthoster.io/favicon.ico"
        }
      },
      "datePublished": post.publishedAt,
      "dateModified": post.updatedAt,
      "articleSection": post.category,
      "keywords": post.tags.join(", ")
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

  }, [post]);

  return null;
};

export default BlogSEO;
