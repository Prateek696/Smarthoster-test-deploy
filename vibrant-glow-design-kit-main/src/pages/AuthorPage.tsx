import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Calendar, Globe, Mail, MapPin } from 'lucide-react';
import { BlogPost } from '@/types/blog';

const AuthorPage = () => {
  const { authorSlug } = useParams();
  const { currentLanguage } = useLanguage();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authorSlug) {
      fetchAuthorData();
    }
  }, [authorSlug, currentLanguage]);

  const fetchAuthorData = async () => {
    try {
      setLoading(true);
      
      // Fetch author data
      const { data: authorData, error: authorError } = await supabase
        .from('authors')
        .select('*')
        .eq('slug', authorSlug)
        .single();

      if (authorError) throw authorError;
      setAuthor(authorData);

      // Fetch posts by this author
      const { data: postsData, error: postsError } = await supabase
        .from('content_with_author')
        .select('*')
        .eq('author_slug', authorSlug)
        .eq('status', 'published')
        .eq('language', currentLanguage)
        .order('published_at', { ascending: false });

      if (postsError) throw postsError;

      // Transform posts to match blog post format
      const transformedPosts = (postsData || []).map(item => ({
        id: `generated-${item.id}`,
        title: item.title,
        slug: item.slug,
        excerpt: item.meta_description || item.ai_snippet || item.content?.substring(0, 160) + '...',
        content: item.content,
        author: {
          name: item.author_name || authorData.name,
          bio: item.author_bio || authorData.bio,
          avatar: item.author_image || authorData.profile_image_url || '/placeholder.svg'
        },
        category: item.category || 'General',
        tags: item.keywords || [],
        publishedAt: item.published_at || item.created_at,
        readTime: item.reading_time || Math.ceil((item.content?.length || 0) / 1000),
        featuredImage: item.featured_image_url || '/placeholder.svg',
        metaDescription: item.meta_description,
        ogImage: item.featured_image_url || '/placeholder.svg',
        isDraft: false,
        updatedAt: item.updated_at
      }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching author data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (currentLanguage) {
      case 'pt': return 'Artigos do Autor';
      case 'fr': return 'Articles de l\'Auteur';
      default: return 'Author Articles';
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
    const count = posts.length;
    switch (currentLanguage) {
      case 'pt': return `${count} artigo${count !== 1 ? 's' : ''} publicado${count !== 1 ? 's' : ''}`;
      case 'fr': return `${count} article${count !== 1 ? 's' : ''} publié${count !== 1 ? 's' : ''}`;
      default: return `${count} article${count !== 1 ? 's' : ''} published`;
    }
  };

  const getJoinedLabel = () => {
    switch (currentLanguage) {
      case 'pt': return 'Membro desde';
      case 'fr': return 'Membre depuis';
      default: return 'Member since';
    }
  };

  const getBlogUrl = () => {
    return currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`;
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'pt' ? 'pt-BR' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="flex gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-96 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
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

  if (!author) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Author Not Found</h1>
          <p className="text-muted-foreground mb-8">The author you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to={getBlogUrl()}>
              {getBackLabel()}
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <Button asChild variant="ghost" className="mb-8">
          <Link to={getBlogUrl()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {getBackLabel()}
          </Link>
        </Button>

        {/* Author Info */}
        <div className="bg-card rounded-lg p-8 mb-12 border">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={author.profile_image_url || '/placeholder.svg'}
                alt={author.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary/20"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {author.name}
              </h1>
              
              {author.bio && (
                <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                  {author.bio}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{getJoinedLabel()} {formatJoinDate(author.created_at)}</span>
                </div>
                
                {author.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{author.email}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{getResultsText()}</span>
                </div>
              </div>

              {/* Social Links */}
              {author.social_links && Object.keys(author.social_links).length > 0 && (
                <div className="flex gap-3 mt-4">
                  {Object.entries(author.social_links).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {getTitle()}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {getResultsText()}
          </p>
        </div>

        {/* Blog Grid */}
        {posts.length > 0 ? (
          <BlogGrid posts={posts} />
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-lg inline-block mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {currentLanguage === 'pt' ? 'Nenhum artigo encontrado' 
                : currentLanguage === 'fr' ? 'Aucun article trouvé' 
                : 'No articles found'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {currentLanguage === 'pt' ? 'Este autor ainda não publicou nenhum artigo.' 
                : currentLanguage === 'fr' ? 'Cet auteur n\'a pas encore publié d\'article.' 
                : 'This author hasn\'t published any articles yet.'}
            </p>
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

export default AuthorPage;