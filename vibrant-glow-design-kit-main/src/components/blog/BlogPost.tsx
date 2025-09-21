
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Share2, Facebook, Linkedin, Globe } from 'lucide-react';
import { BlogPost as BlogPostType } from '@/types/blog';
import { formatDate, generateTableOfContents } from '@/utils/blogUtils';
import { getBlogLanguageVariants } from '@/utils/blogLanguageVariants';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import BlogSEO from './BlogSEO';
import BlogCTA from './BlogCTA';
import { SafeHTML } from '@/utils/sanitize';

interface BlogPostProps {
  post: BlogPostType;
  relatedPosts: BlogPostType[];
}

const BlogPost = ({ post, relatedPosts }: BlogPostProps) => {
  const [toc, setToc] = useState<any[]>([]);
  const { currentLanguage } = useLanguage();
  const languageVariants = getBlogLanguageVariants(post.slug);

  useEffect(() => {
    const headings = generateTableOfContents(post.content);
    setToc(headings);

    // Add hreflang tags for existing language variants only
    const addHreflangTags = () => {
      // Remove existing hreflang tags
      const existingTags = document.querySelectorAll('link[hreflang]');
      existingTags.forEach(tag => tag.remove());

      // Add hreflang tags only for existing variants
      languageVariants.variants.forEach(variant => {
        if (variant.exists) {
          const link = document.createElement('link');
          link.rel = 'alternate';
          link.hreflang = variant.language === 'pt' ? 'pt-pt' : variant.language;
          link.href = `https://smarthoster.io${variant.url}`;
          document.head.appendChild(link);
        }
      });

      // Add x-default to English if it exists
      const englishVariant = languageVariants.variants.find(v => v.language === 'en');
      if (englishVariant?.exists) {
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = `https://smarthoster.io${englishVariant.url}`;
        document.head.appendChild(defaultLink);
      }
    };

    addHreflangTags();

    return () => {
      // Cleanup hreflang tags on unmount
      const hreflangTags = document.querySelectorAll('link[hreflang]');
      hreflangTags.forEach(tag => tag.remove());
    };
  }, [post.content, post.slug, languageVariants]);

  const shareOnWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`Check out this article: ${post.title}`);
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const renderContent = (content: string) => {
    // Convert markdown-style content to HTML with proper heading IDs for SEO
    return content
      .replace(/^# (.+)$/gm, (match, p1) => {
        const id = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h1 id="${id}" class="text-3xl font-bold text-gray-900 mb-6 mt-8">${p1}</h1>`;
      })
      .replace(/^## (.+)$/gm, (match, p1) => {
        const id = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h2 id="${id}" class="text-2xl font-bold text-gray-900 mb-4 mt-8">${p1}</h2>`;
      })
      .replace(/^### (.+)$/gm, (match, p1) => {
        const id = p1.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `<h3 id="${id}" class="text-xl font-semibold text-gray-900 mb-3 mt-6">${p1}</h3>`;
      })
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="mb-2">$1</li>')
      .replace(/(<li.*<\/li>)/s, '<ul class="list-disc list-inside mb-4 space-y-2 ml-4">$1</ul>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="mb-2">$2</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^(?!<[h|u|l])/gm, '<p class="mb-4">')
      .replace(/(<p class="mb-4">.*?)<\/p>$/gm, '$1</p>');
  };

  return (
    <>
      <BlogSEO post={post} />
      <article className="max-w-4xl mx-auto" itemScope itemType="https://schema.org/Article">
        {/* Breadcrumb with structured data */}
        <nav className="mb-8" itemScope itemType="https://schema.org/BreadcrumbList">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-[#5FFF56] hover:text-[#4EE045] transition-colors"
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span itemProp="name">Back to Blog</span>
            <meta itemProp="position" content="1" />
          </Link>
        </nav>

        {/* Header with structured data */}
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight" itemProp="headline">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2" itemScope itemType="https://schema.org/Person">
              <User className="w-5 h-5" />
              <span className="font-medium" itemProp="author">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={post.publishedAt} itemProp="datePublished">
                {formatDate(post.publishedAt)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime} min read</span>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-gray-600 font-medium">Share:</span>
            <Button variant="outline" size="sm" onClick={() => {
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent(`Check out this article: ${post.title}`);
              window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
            }} className="gap-2">
              <Share2 className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const url = encodeURIComponent(window.location.href);
              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
            }} className="gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const url = encodeURIComponent(window.location.href);
              window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
            }} className="gap-2">
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              const url = encodeURIComponent(window.location.href);
              const text = encodeURIComponent(post.title);
              window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
            }} className="gap-2">
              <Share2 className="w-4 h-4" />
              X
            </Button>
          </div>
        </header>

        {/* Language Variants Switcher */}
        {languageVariants.variants.some(v => v.exists) && (
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 flex-wrap">
              <Globe className="w-5 h-5 text-blue-600" />
              <span className="text-blue-900 font-medium">This article is also available in:</span>
              <div className="flex items-center gap-3 flex-wrap">
                {languageVariants.variants.map(variant => {
                  const flags = { en: '🇺🇸', pt: '🇵🇹', fr: '🇫🇷' };
                  const labels = { en: 'English', pt: 'Português', fr: 'Français' };
                  
                  if (variant.exists && variant.language !== currentLanguage) {
                    return (
                      <Link
                        key={variant.language}
                        to={variant.url}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors"
                      >
                        <span>{flags[variant.language]}</span>
                        <span className="font-medium">{labels[variant.language]}</span>
                      </Link>
                    );
                  }
                  
                  if (!variant.exists && variant.language !== currentLanguage) {
                    return (
                      <span
                        key={variant.language}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                        title="Coming soon"
                      >
                        <span>{flags[variant.language]}</span>
                        <span className="font-medium">{labels[variant.language]}</span>
                        <span className="text-xs">(Soon)</span>
                      </span>
                    );
                  }
                  
                  return null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Featured Image with proper alt text */}
        <div className="mb-8">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            itemProp="image"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          {toc.length > 2 && (
            <aside className="lg:col-span-1">
              <div className="sticky top-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h3>
                <nav>
                  <ul className="space-y-2">
                    {toc.map((heading, index) => (
                      <li key={index}>
                        <a
                          href={`#${heading.id}`}
                          className={`block text-sm hover:text-[#5FFF56] transition-colors ${
                            heading.level === 2 ? 'font-medium' : 'ml-4 text-gray-600'
                          }`}
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}

          {/* Content */}
          <div className={toc.length > 2 ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <SafeHTML 
              content={renderContent(post.content)}
              className="prose prose-lg max-w-none"
            />

            {/* Blog CTA */}
            <BlogCTA />

            {/* Author Bio with structured data */}
            <div className="mt-12 p-6 bg-gray-50 rounded-lg" itemScope itemType="https://schema.org/Person">
              <div className="flex items-start gap-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-16 h-16 rounded-full"
                  itemProp="image"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    About <span itemProp="name">{post.author.name}</span>
                  </h3>
                  <p className="text-gray-600" itemProp="description">{post.author.bio}</p>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.slice(0, 2).map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to={`/blog/${relatedPost.slug}`}
                      className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={relatedPost.featuredImage}
                        alt={relatedPost.title}
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#5FFF56] transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h4>
                        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Structured data for article */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.metaDescription,
            "image": post.featuredImage,
            "author": {
              "@type": "Person",
              "name": post.author.name,
              "description": post.author.bio
            },
            "publisher": {
              "@type": "Organization",
              "name": "SmartHoster",
              "logo": {
                "@type": "ImageObject",
                "url": "https://smarthoster.io/favicon.ico"
              }
            },
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt,
            "articleSection": post.category,
            "keywords": post.tags.join(", "),
            "url": `https://smarthoster.io${post.canonicalUrl}`,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://smarthoster.io${post.canonicalUrl}`
            }
          })
        }} />
      </article>
    </>
  );
};

export default BlogPost;
