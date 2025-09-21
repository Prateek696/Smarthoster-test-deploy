import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { allBlogPosts } from '@/data/blogPostsUpdated';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const Posts = () => {
  const [searchParams] = useSearchParams();
  const [response, setResponse] = useState<ApiResponse>({ success: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleApiRequest();
  }, [searchParams]);

  const handleApiRequest = async () => {
    try {
      setLoading(true);
      
      // Parse query parameters
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100 items
      const language = searchParams.get('language') || 'en';
      const category = searchParams.get('category');
      const tag = searchParams.get('tag');
      const author = searchParams.get('author');
      const search = searchParams.get('search');
      const status = searchParams.get('status') || 'published';
      const sort = searchParams.get('sort') || 'published_at';
      const order = searchParams.get('order') || 'desc';

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query for generated content
      let query = supabase
        .from('content_with_author')
        .select('*', { count: 'exact' })
        .eq('language', language)
        .eq('status', status);

      // Apply filters
      if (category) {
        query = query.eq('category', category);
      }
      
      if (tag) {
        query = query.contains('keywords', [tag]);
      }
      
      if (author) {
        query = query.eq('author_slug', author);
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%, content.ilike.%${search}%, meta_description.ilike.%${search}%`);
      }

      // Apply sorting and pagination
      query = query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data: generatedData, error, count } = await query;

      if (error) throw error;

      // Get static posts for the language
      const staticPosts = allBlogPosts[language] || allBlogPosts.en || [];
      
      // Filter static posts based on criteria
      let filteredStaticPosts = staticPosts.filter(post => !post.isDraft);
      
      if (category) {
        filteredStaticPosts = filteredStaticPosts.filter(post => post.category === category);
      }
      
      if (tag) {
        filteredStaticPosts = filteredStaticPosts.filter(post => 
          post.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredStaticPosts = filteredStaticPosts.filter(post =>
          post.title.toLowerCase().includes(searchLower) ||
          post.excerpt.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower)
        );
      }

      // Transform generated content to API format
      const transformedGenerated = (generatedData || []).map(item => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        excerpt: item.meta_description || item.ai_snippet || item.content?.substring(0, 160) + '...',
        content: item.content,
        author: {
          name: item.author_name,
          slug: item.author_slug,
          bio: item.author_bio,
          avatar: item.author_image
        },
        category: item.category,
        tags: item.keywords || [],
        publishedAt: item.published_at || item.created_at,
        updatedAt: item.updated_at,
        readTime: item.reading_time,
        featuredImage: item.featured_image_url,
        metaTitle: item.meta_title,
        metaDescription: item.meta_description,
        language: item.language,
        status: item.status,
        type: 'generated'
      }));

      // Transform static posts to API format
      const transformedStatic = filteredStaticPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        category: post.category,
        tags: post.tags,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        readTime: post.readTime,
        featuredImage: post.featuredImage,
        metaTitle: post.metaTitle || post.title,
        metaDescription: post.metaDescription || post.excerpt,
        language: language,
        status: 'published',
        type: 'static'
      }));

      // Combine and sort all posts
      const allPosts = [...transformedGenerated, ...transformedStatic];
      
      // Apply sorting to combined results
      allPosts.sort((a, b) => {
        const aValue = a[sort as keyof typeof a] || '';
        const bValue = b[sort as keyof typeof b] || '';
        
        if (order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      // Apply pagination to combined results
      const paginatedPosts = allPosts.slice(offset, offset + limit);
      const totalCount = allPosts.length;

      setResponse({
        success: true,
        data: paginatedPosts,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });

    } catch (error: any) {
      setResponse({
        success: false,
        error: error.message || 'Failed to fetch posts'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render JSON response
  return (
    <div style={{ fontFamily: 'monospace', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Posts API Endpoint</h1>
        
        {loading ? (
          <div style={{ color: '#666' }}>Loading...</div>
        ) : (
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px', 
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.4'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '10px', color: '#495057' }}>Available Query Parameters:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li><strong>page</strong>: Page number (default: 1)</li>
            <li><strong>limit</strong>: Items per page (default: 10, max: 100)</li>
            <li><strong>language</strong>: Content language (en, pt, fr - default: en)</li>
            <li><strong>category</strong>: Filter by category</li>
            <li><strong>tag</strong>: Filter by tag/keyword</li>
            <li><strong>author</strong>: Filter by author slug</li>
            <li><strong>search</strong>: Search in title, content, and description</li>
            <li><strong>status</strong>: Content status (default: published)</li>
            <li><strong>sort</strong>: Sort field (default: published_at)</li>
            <li><strong>order</strong>: Sort order (asc, desc - default: desc)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Posts;