import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogPost from '@/components/blog/BlogPost';
import { useLanguage } from '@/contexts/LanguageContext';
import { allBlogPosts, blogCategories } from '@/data/blogPostsUpdated';
import { blogCategoriesPt } from '@/data/blogPostsPt';
import { blogCategoriesFr } from '@/data/blogPostsFr';
import { runBlogLanguageAudit } from '@/utils/auditBlogLanguages';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { analytics, useScrollDepthTracking } from '@/utils/analytics';

const Blog = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatedPosts, setGeneratedPosts] = useState([]);

  // Track page analytics
  useScrollDepthTracking(location.pathname);

  // Fetch generated content from database
  useEffect(() => {
    fetchGeneratedContent();
    
    // Track page view
    analytics.trackPageView(location.pathname, `Blog - ${currentLanguage.toUpperCase()}`);
  }, [currentLanguage, location.pathname]);

  const fetchGeneratedContent = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('status', 'published')
        .eq('language', currentLanguage)
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Transform generated content to match blog post format
      const transformedPosts = (data || []).map(item => ({
        id: `generated-${item.id}`,
        title: item.title,
        slug: item.slug,
        excerpt: item.meta_description || item.ai_snippet || item.content.substring(0, 160) + '...',
        content: item.content,
        author: 'SmartHoster Team',
        date: item.published_at || item.created_at,
        category: item.category || 'General',
        tags: item.keywords || [],
        readTime: Math.ceil(item.content.length / 1000) + ' min read',
        image: item.featured_image_url || '/placeholder.svg',
        metaTitle: item.meta_title,
        metaDescription: item.meta_description,
        schemaMarkup: item.schema_markup,
        isDraft: false,
        isGenerated: true
      }));

      setGeneratedPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching generated content:', error);
    }
  };

  // Get posts and categories for current language
  const staticPosts = allBlogPosts[currentLanguage] || allBlogPosts.en;
  
  // Combine static and generated posts
  const currentPosts = [...staticPosts, ...generatedPosts];
  
  const currentCategories = currentLanguage === 'pt' ? blogCategoriesPt 
    : currentLanguage === 'fr' ? blogCategoriesFr 
    : blogCategories;

  console.log('Blog - current language:', currentLanguage);
  console.log('Blog - available posts:', currentPosts.length);
  console.log('Blog - post titles:', currentPosts.map(p => p.title));
  
  // Run audit in development
  React.useEffect(() => {
    if (import.meta.env.DEV && !slug) {
      runBlogLanguageAudit();
    }
  }, [slug]);

  // If slug is provided, show individual blog post
  if (slug) {
    const post = currentPosts.find(p => p.slug === slug);
    if (!post) {
      return (
        <Layout>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {currentLanguage === 'pt' ? 'Artigo Não Encontrado' 
                : currentLanguage === 'fr' ? 'Article Non Trouvé' 
                : 'Post Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {currentLanguage === 'pt' ? 'O artigo que procura não existe.' 
                : currentLanguage === 'fr' ? 'L\'article que vous cherchez n\'existe pas.' 
                : 'The blog post you\'re looking for doesn\'t exist.'}
            </p>
            <Button asChild>
              <a href={currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`}>
                {currentLanguage === 'pt' ? 'Voltar ao Blog' 
                  : currentLanguage === 'fr' ? 'Retour au Blog' 
                  : 'Back to Blog'}
              </a>
            </Button>
          </div>
        </Layout>
      );
    }

    // Get related posts from same category
    const relatedPosts = currentPosts
      .filter(p => p.category === post.category && p.id !== post.id)
      .slice(0, 2);

    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <BlogPost post={post} relatedPosts={relatedPosts} />
        </div>
      </Layout>
    );
  }

  // Filter posts based on search and category
  const filteredPosts = currentPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory && !post.isDraft;
  });

  const getTitle = () => {
    switch (currentLanguage) {
      case 'pt': return 'Blog SmartHoster';
      case 'fr': return 'Blog SmartHoster';
      default: return 'SmartHoster Blog';
    }
  };

  const getSubtitle = () => {
    switch (currentLanguage) {
      case 'pt': return 'Insights especializados, dicas e estratégias para gestão de propriedades bem-sucedida e otimização da hospitalidade.';
      case 'fr': return 'Conseils d\'experts, astuces et stratégies pour une gestion immobilière réussie et l\'optimisation de l\'hospitalité.';
      default: return 'Expert insights, tips, and strategies for successful property management and hospitality optimization.';
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentLanguage) {
      case 'pt': return 'Pesquisar artigos...';
      case 'fr': return 'Rechercher des articles...';
      default: return 'Search articles...';
    }
  };

  const getAllCategoriesLabel = () => {
    switch (currentLanguage) {
      case 'pt': return 'Todas as Categorias';
      case 'fr': return 'Toutes les Catégories';
      default: return 'All Categories';
    }
  };

  const getAllArticlesLabel = () => {
    switch (currentLanguage) {
      case 'pt': return 'Todos os Artigos';
      case 'fr': return 'Tous les Articles';
      default: return 'All Articles';
    }
  };

  const getResultsText = () => {
    const count = filteredPosts.length;
    const article = count !== 1 ? 's' : '';
    switch (currentLanguage) {
      case 'pt': return `${count} artigo${article} encontrado${article}`;
      case 'fr': return `${count} article${article} trouvé${article}`;
      default: return `${count} article${article} found`;
    }
  };

  const getNoResultsText = () => {
    switch (currentLanguage) {
      case 'pt': return {
        title: 'Nenhum artigo encontrado',
        subtitle: 'Tente ajustar seus critérios de pesquisa ou filtro.',
        button: 'Limpar Filtros'
      };
      case 'fr': return {
        title: 'Aucun article trouvé',
        subtitle: 'Essayez d\'ajuster vos critères de recherche ou de filtrage.',
        button: 'Effacer les Filtres'
      };
      default: return {
        title: 'No articles found',
        subtitle: 'Try adjusting your search or filter criteria.',
        button: 'Clear Filters'
      };
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getTitle()}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getSubtitle()}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.length > 2) {
                  analytics.trackSearch(e.target.value, filteredPosts.length, currentLanguage);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                analytics.trackFilter('category', e.target.value, currentLanguage);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5FFF56] focus:border-transparent"
            >
              <option value="all">{getAllCategoriesLabel()}</option>
              {currentCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#5FFF56] text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getAllArticlesLabel()}
          </button>
          {currentCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-[#5FFF56] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {getResultsText()}
          </p>
        </div>

        {/* Blog Grid */}
        {filteredPosts.length > 0 ? (
          <BlogGrid posts={filteredPosts} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{getNoResultsText().title}</h3>
            <p className="text-gray-600 mb-6">{getNoResultsText().subtitle}</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              {getNoResultsText().button}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
