
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { formatDate } from '@/utils/blogUtils';
import { useLanguage } from '@/contexts/LanguageContext';
import { analytics } from '@/utils/analytics';

interface BlogGridProps {
  posts: BlogPost[];
}

const BlogGrid = ({ posts }: BlogGridProps) => {
  const { currentLanguage } = useLanguage();
  
  const getPostUrl = (slug: string) => {
    if (currentLanguage === 'en') return `/blog/${slug}`;
    return `/${currentLanguage}/blog/${slug}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <Link 
            to={getPostUrl(post.slug)} 
            className="block"
            onClick={() => analytics.trackContentView({
              content_id: post.id,
              content_title: post.title,
              content_category: post.category,
              content_author: post.author?.name,
              content_language: currentLanguage,
              content_type: post.id.startsWith('generated-') ? 'generated' : 'static'
            })}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <div className="p-6">
              {/* Category badge */}
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-[#5FFF56] text-black rounded-full">
                  {post.category}
                </span>
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-[#5FFF56] transition-colors">
                {post.title}
              </h2>
              
              {/* Excerpt */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              {/* Meta information */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <Link 
                      to={`${currentLanguage === 'en' ? '/authors' : `/${currentLanguage}/authors`}/${post.author?.name?.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => analytics.trackAuthorClick(post.author?.name || '', currentLanguage)}
                      className="hover:text-primary transition-colors"
                    >
                      {post.author.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} min</span>
                </div>
              </div>
              
              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link
                    key={tag}
                    to={`${currentLanguage === 'en' ? '/tags' : `/${currentLanguage}/tags`}/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => analytics.trackTagClick(tag, currentLanguage)}
                    className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
};

export default BlogGrid;
