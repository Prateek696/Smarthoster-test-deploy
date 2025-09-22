import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { allBlogPosts } from '@/data/blogPostsUpdated';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tag, ArrowLeft, TrendingUp, Hash } from 'lucide-react';
import { BlogPost } from '@/types/blog';

const TagPage = () => {
  const { tagName } = useParams();
  const { currentLanguage } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [generatedPosts, setGeneratedPosts] = useState<BlogPost[]>([]);
  const [tagData, setTagData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tagName) {
      fetchTagData();
      fetchGeneratedPosts();
    }
  }, [tagName, currentLanguage]);

  const fetchTagData = async () => {
    try {
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .eq('slug', tagName)
        .eq('language', currentLanguage)
        .single();

      if (!error && data) {
        setTagData(data);
      }
    } catch (error) {
      console.error('Error fetching tag data:', error);
    }
  };

  const fetchGeneratedPosts = async () => {
    try {
      setLoading(true);
      
      // Fetch generated content that contains this tag
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('status', 'published')
        .eq('language', currentLanguage)
        .contains('keywords', [tagName])
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Transform generated content to match blog post format
      const transformedPosts = (data || []).map(item => ({
        id: `generated-${item.id}`,
        title: item.title,
        slug: item.slug,
        excerpt: item.meta_description || item.ai_snippet || item.content.substring(0, 160) + '...',
        content: item.content,
        author: { name: 'SmartHoster Team', bio: '', avatar: '' },
        category: item.category || 'General',
        tags: item.keywords || [],
        publishedAt: item.published_at || item.created_at,
        readTime: Math.ceil(item.content.length / 1000),
        featuredImage: item.featured_image_url || '/placeholder.svg',
        metaDescription: item.meta_description,
        ogImage: item.featured_image_url || '/placeholder.svg',
        isDraft: false,
        updatedAt: item.updated_at
      }));

      setGeneratedPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching generated posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get static posts for current language and filter by tag
  const staticPosts = allBlogPosts[currentLanguage] || allBlogPosts.en;
  const staticTaggedPosts = staticPosts.filter(post => 
    post.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === tagName)
  );

  // Combine static and generated posts
  const allTaggedPosts = [...staticTaggedPosts, ...generatedPosts];

  const getTitle = () => {
    const displayTag = tagData?.name || tagName?.replace(/-/g, ' ') || '';
    switch (currentLanguage) {
      case 'pt': return `Artigos sobre ${displayTag}`;
      case 'fr': return `Articles sur ${displayTag}`;
      default: return `Articles about ${displayTag}`;
    }
  };

  const getDescription = () => {
    if (tagData?.description) return tagData.description;
    
    const displayTag = tagData?.name || tagName?.replace(/-/g, ' ') || '';
    switch (currentLanguage) {
      case 'pt': return `Descubra insights especializados e estratégias sobre ${displayTag} para otimizar sua gestão de propriedades.`;
      case 'fr': return `Découvrez des conseils d'experts et des stratégies sur ${displayTag} pour optimiser votre gestion immobilière.`;
      default: return `Discover expert insights and strategies about ${displayTag} to optimize your property management.`;
    }
  };

  const getBackLabel = () => {
    switch (currentLanguage) {
      case 'pt': return 'Voltar ao Blog';
      case 'fr': return 'Retour au Blog';
      default: return 'Back to Blog';
    }
  };

  const getResultsText = () => {
    const count = allTaggedPosts.length;
    switch (currentLanguage) {
      case 'pt': return `${count} artigo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
      case 'fr': return `${count} article${count !== 1 ? 's' : ''} trouvé${count !== 1 ? 's' : ''}`;
      default: return `${count} article${count !== 1 ? 's' : ''} found`;
    }
  };

  const getNoResultsText = () => {
    switch (currentLanguage) {
      case 'pt': return {
        title: 'Nenhum artigo encontrado',
        subtitle: 'Não há artigos disponíveis para esta tag no momento.'
      };
      case 'fr': return {
        title: 'Aucun article trouvé',
        subtitle: 'Il n\'y a pas d\'articles disponibles pour ce tag pour le moment.'
      };
      default: return {
        title: 'No articles found',
        subtitle: 'There are no articles available for this tag at the moment.'
      };
    }
  };

  const getBlogUrl = () => {
    return currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to={getBlogUrl()} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {getBackLabel()}
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {getTitle()}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="text-sm">{tagName?.replace(/-/g, ' ')}</span>
              </div>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground max-w-3xl">
            {getDescription()}
          </p>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            {getResultsText()}
          </p>
        </div>

        {/* Blog Grid */}
        {allTaggedPosts.length > 0 ? (
          <BlogGrid posts={allTaggedPosts} />
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-lg inline-block mb-4">
              <Tag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{getNoResultsText().title}</h3>
            <p className="text-muted-foreground mb-6">{getNoResultsText().subtitle}</p>
            <Button asChild>
              <Link to={getBlogUrl()}>
                {getBackLabel()}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TagPage;