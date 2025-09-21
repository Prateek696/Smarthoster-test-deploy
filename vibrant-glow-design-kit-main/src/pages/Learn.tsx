import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBlogLanguageVariants } from '@/utils/blogLanguageVariants';
import { allLearnArticles, allLearnCategories } from '@/data/learnArticles';
import { Button } from '@/components/ui/button';
import { Search, Filter, BookOpen, Clock, User, Globe, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { SafeHTML } from '@/utils/sanitize';

// Individual article component
const LearnArticleView = ({ article }: { article: any }) => {
  const { currentLanguage } = useLanguage();
  const languageVariants = getBlogLanguageVariants(article.slug);

  return (
    <div className="container mx-auto px-4 py-16">
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
                      to={variant.url.replace('/blog/', '/learn/')}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-md transition-colors"
                    >
                      <span>{flags[variant.language]}</span>
                      <span className="font-medium">{labels[variant.language]}</span>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Article Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>Algarve Focus: {article.targetLocations?.join(', ')}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        
        <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{article.author.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{article.readTime} min read</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="capitalize">{article.difficulty}</span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <SafeHTML 
        content={article.content.replace(/\n/g, '<br />').replace(/#{1,6}\s(.+)/g, (match, title) => {
          const level = match.match(/^#{1,6}/)[0].length;
          return `<h${level}>${title}</h${level}>`;
        })}
        className="prose prose-lg max-w-none"
      />
    </div>
  );
};

const Learn = () => {
  const { slug } = useParams();
  const { currentLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get articles and categories for current language
  const currentArticles = allLearnArticles[currentLanguage] || [];
  const currentCategories = allLearnCategories[currentLanguage] || [];

  // Build canonical URL based on language
  const getCanonicalUrl = () => {
    if (currentLanguage === 'en') {
      return slug ? `/learn/${slug}` : '/learn';
    } else {
      return slug ? `/${currentLanguage}/learn/${slug}` : `/${currentLanguage}/learn`;
    }
  };

  const getPageTitle = () => {
    switch (currentLanguage) {
      case 'pt': return 'Centro de Aprendizagem SmartHoster';
      case 'fr': return 'Centre d\'Apprentissage SmartHoster';
      default: return 'SmartHoster Learning Center';
    }
  };

  const getPageDescription = () => {
    switch (currentLanguage) {
      case 'pt': return 'Aprenda a gerir a sua propriedade de aluguer de curta duração com os nossos guias especializados, tutoriais e recursos completos.';
      case 'fr': return 'Apprenez à gérer votre propriété de location à court terme avec nos guides d\'experts, tutoriels et ressources complètes.';
      default: return 'Learn to manage your short-term rental property with our expert guides, tutorials, and comprehensive resources.';
    }
  };

  const getComingSoonMessage = () => {
    switch (currentLanguage) {
      case 'pt': return {
        title: 'Centro de Aprendizagem em Breve',
        subtitle: 'Estamos a preparar conteúdo educacional completo para o ajudar a ter sucesso na gestão de propriedades.',
        cta: 'Voltar ao Blog'
      };
      case 'fr': return {
        title: 'Centre d\'Apprentissage Bientôt Disponible',
        subtitle: 'Nous préparons un contenu éducatif complet pour vous aider à réussir dans la gestion immobilière.',
        cta: 'Retour au Blog'
      };
      default: return {
        title: 'Learning Center Coming Soon',
        subtitle: 'We\'re preparing comprehensive educational content to help you succeed in property management.',
        cta: 'Back to Blog'
      };
    }
  };

  // Individual article view
  if (slug) {
    const article = currentArticles.find(a => a.slug === slug);
    
    if (!article) {
      return (
        <Layout>
          <SEO
            title={`Article Not Found - ${getPageTitle()}`}
            description="The learning article you're looking for doesn't exist."
            canonicalUrl={getCanonicalUrl()}
          />
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {currentLanguage === 'pt' ? 'Artigo Não Encontrado' 
                : currentLanguage === 'fr' ? 'Article Non Trouvé' 
                : 'Article Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {currentLanguage === 'pt' ? 'O artigo que procura não existe.' 
                : currentLanguage === 'fr' ? 'L\'article que vous cherchez n\'existe pas.' 
                : 'The learning article you\'re looking for doesn\'t exist.'}
            </p>
            <Button asChild>
              <a href={currentLanguage === 'en' ? '/learn' : `/${currentLanguage}/learn`}>
                {currentLanguage === 'pt' ? 'Voltar ao Centro de Aprendizagem' 
                  : currentLanguage === 'fr' ? 'Retour au Centre d\'Apprentissage' 
                  : 'Back to Learning Center'}
              </a>
            </Button>
          </div>
        </Layout>
      );
    }

    // Individual article display
    return (
      <Layout>
        <SEO
          title={article.seoTitle}
          description={article.metaDescription}
          canonicalUrl={getCanonicalUrl()}
          ogImage={article.ogImage}
          faqData={article.faqData}
        />
        <LearnArticleView article={article} />
      </Layout>
    );
  }

  // Filter articles
  const filteredArticles = currentArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory && !article.isDraft;
  });

  // Show articles if we have them, otherwise show coming soon
  if (currentArticles.length === 0) {

    return (
      <Layout>
        <SEO
          title={getPageTitle()}
          description={getPageDescription()}
          canonicalUrl={getCanonicalUrl()}
          ogImage="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop"
        />
        
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {getComingSoonMessage().title}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {getComingSoonMessage().subtitle}
            </p>
            
            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium mb-8">
              <Clock className="w-4 h-4" />
              {currentLanguage === 'pt' ? 'Em Desenvolvimento' 
                : currentLanguage === 'fr' ? 'En Développement' 
                : 'In Development'}
            </div>
          </div>

          {/* Categories Preview */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {currentLanguage === 'pt' ? 'Categorias Planeadas' 
                : currentLanguage === 'fr' ? 'Catégories Prévues' 
                : 'Planned Categories'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {currentCategories.map(category => (
                <div key={category.id} className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${category.color}`}>
                    {category.name}
                  </div>
                  <p className="text-gray-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button asChild size="lg">
              <a href={currentLanguage === 'en' ? '/blog' : `/${currentLanguage}/blog`}>
                {getComingSoonMessage().cta}
              </a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Learning center with articles
  return (
    <Layout>
      <SEO
        title={getPageTitle()}
        description={getPageDescription()}
        canonicalUrl={getCanonicalUrl()}
        ogImage="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&h=630&fit=crop"
      />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getPageTitle()}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getPageDescription()}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={currentLanguage === 'pt' ? 'Pesquisar artigos...' 
                : currentLanguage === 'fr' ? 'Rechercher des articles...' 
                : 'Search articles...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">
                {currentLanguage === 'pt' ? 'Todas as Categorias' 
                  : currentLanguage === 'fr' ? 'Toutes les Catégories' 
                  : 'All Categories'}
              </option>
              {currentCategories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map(article => (
            <Link
              key={article.id}
              to={currentLanguage === 'en' ? `/learn/${article.slug}` : `/${currentLanguage}/learn/${article.slug}`}
              className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" />
                  <span>{article.targetLocations?.slice(0, 3).join(', ')}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime} min
                    </span>
                    <span className="capitalize">{article.difficulty}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentCategories.find(c => c.name === article.category)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {article.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {currentLanguage === 'pt' ? 'Nenhum artigo encontrado' 
                : currentLanguage === 'fr' ? 'Aucun article trouvé' 
                : 'No articles found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentLanguage === 'pt' ? 'Tente ajustar seus critérios de pesquisa.' 
                : currentLanguage === 'fr' ? 'Essayez d\'ajuster vos critères de recherche.' 
                : 'Try adjusting your search criteria.'}
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              variant="outline"
            >
              {currentLanguage === 'pt' ? 'Limpar Filtros' 
                : currentLanguage === 'fr' ? 'Effacer les Filtres' 
                : 'Clear Filters'}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Learn;