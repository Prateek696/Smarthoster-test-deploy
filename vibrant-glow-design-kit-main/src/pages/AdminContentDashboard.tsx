import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Eye, 
  Edit, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  Globe, 
  TrendingUp,
  FileText,
  Users,
  Settings,
  Home,
  MoreHorizontal,
  Copy,
  Languages
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AdminAnalyticsTab from '@/components/AdminAnalyticsTab';
import AdminAuthorsTab from '@/components/AdminAuthorsTab';
import AdminSettingsTab from '@/components/AdminSettingsTab';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  language: string;
  category: string;
  author_name?: string;
  author_image?: string;
  featured_image_url?: string;
  date_published: string;
  view_count: number;
  reading_time: number;
  excerpt: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

const AdminContentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('posts');

  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchContent();
    fetchStats();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_with_author')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match ContentItem interface
      const transformedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'published',
        view_count: item.view_count || 0,
        reading_time: item.reading_time || 0,
        excerpt: item.excerpt || '',
        keywords: item.keywords || []
      }));
      
      setContent(transformedData);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('status, view_count');

      if (error) throw error;

      const totalPosts = data?.length || 0;
      const publishedPosts = data?.filter(item => item.status === 'published').length || 0;
      const draftPosts = data?.filter(item => item.status === 'draft').length || 0;
      const totalViews = data?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;

      setStats({
        totalPosts,
        publishedPosts,
        draftPosts,
        totalViews
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    
    try {
      const { error } = await supabase
        .from('generated_content')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      setContent(prevContent =>
        prevContent.map(item =>
          item.id === id ? { ...item, status: newStatus as 'draft' | 'published' } : item
        )
      );

      toast({
        title: `Content ${newStatus === 'published' ? 'Published' : 'Unpublished'}`,
        description: `The content has been ${newStatus === 'published' ? 'published' : 'moved to draft'} successfully.`,
      });

      fetchStats();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (slug: string, language: string) => {
    let previewUrl = `/blog/${slug}`;
    if (language === 'pt') previewUrl = `/pt/blog/${slug}`;
    if (language === 'fr') previewUrl = `/fr/blog/${slug}`;
    window.open(previewUrl, '_blank');
  };

  const handleClone = async (item: ContentItem) => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('id', item.id)
        .single();

      if (error) throw error;

      const clonedData = {
        ...data,
        id: undefined,
        title: `${data.title} (Copy)`,
        slug: `${data.slug}-copy-${Date.now()}`,
        status: 'draft',
        published_at: null,
        created_at: undefined,
        updated_at: undefined
      };

      const { error: insertError } = await supabase
        .from('generated_content')
        .insert(clonedData);

      if (insertError) throw insertError;

      toast({
        title: "Content Cloned",
        description: "The content has been cloned successfully.",
      });

      fetchContent();
    } catch (error) {
      console.error('Error cloning content:', error);
      toast({
        title: "Error",
        description: "Failed to clone content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      false;

    const matchesLanguage = languageFilter === 'all' || item.language === languageFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesAuthor = authorFilter === 'all' || item.author_name === authorFilter;

    return matchesSearch && matchesLanguage && matchesStatus && matchesCategory && matchesAuthor;
  });

  const uniqueCategories = [...new Set(content.map(item => item.category))];
  const uniqueAuthors = [...new Set(content.map(item => item.author_name).filter(Boolean))];

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case 'en': return '🇬🇧';
      case 'pt': return '🇵🇹';
      case 'fr': return '🇫🇷';
      default: return '🌐';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Dashboard</h1>
            <p className="text-gray-600">Manage your AI-generated content library</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button 
              onClick={() => navigate('/admin/content-generator')}
              className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate Content
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b">
          <Button 
            variant="ghost" 
            className={`border-b-2 rounded-none pb-3 ${
              activeTab === 'posts' 
                ? 'border-[#5FFF56] text-[#5FFF56]' 
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Blog Posts
          </Button>
          <Button 
            variant="ghost" 
            className={`border-b-2 rounded-none pb-3 ${
              activeTab === 'authors' 
                ? 'border-[#5FFF56] text-[#5FFF56]' 
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('authors')}
          >
            <Users className="mr-2 h-4 w-4" />
            Authors
          </Button>
          <Button 
            variant="ghost" 
            className={`border-b-2 rounded-none pb-3 ${
              activeTab === 'analytics' 
                ? 'border-[#5FFF56] text-[#5FFF56]' 
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant="ghost" 
            className={`border-b-2 rounded-none pb-3 ${
              activeTab === 'settings' 
                ? 'border-[#5FFF56] text-[#5FFF56]' 
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Posts</p>
                      <p className="text-2xl font-bold">{stats.totalPosts}</p>
                    </div>
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">{stats.publishedPosts}</p>
                    </div>
                    <Globe className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.draftPosts}</p>
                    </div>
                    <Edit className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalViews}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by title, slug, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={languageFilter} onValueChange={setLanguageFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                        <SelectItem value="fr">🇫🇷 French</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {uniqueCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={authorFilter} onValueChange={setAuthorFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Authors</SelectItem>
                        {uniqueAuthors.map(author => (
                          <SelectItem key={author} value={author || ''}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content List */}
            <div className="space-y-4">
              {filteredContent.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No content found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || languageFilter !== 'all' || statusFilter !== 'all' 
                        ? 'Try adjusting your filters or search terms.'
                        : 'Start by generating your first piece of content.'}
                    </p>
                    <Button 
                      onClick={() => navigate('/admin/content-generator')}
                      className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Content
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredContent.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                              {item.title}
                            </h3>
                            <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                            <span className="text-lg">{getLanguageFlag(item.language)}</span>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.excerpt}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {item.author_name && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {item.author_name}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {item.view_count || 0} views
                            </div>
                            <div>{item.reading_time} min read</div>
                          </div>
                          
                          {item.keywords && item.keywords.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {item.keywords.slice(0, 3).map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {item.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.keywords.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {item.featured_image_url && (
                          <img 
                            src={item.featured_image_url} 
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg ml-4"
                          />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handlePreview(item.slug, item.language)}
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                          <Button
                            onClick={() => navigate(`/admin/content-edit/${item.id}`)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleStatusToggle(item.id, item.status)}
                            variant={item.status === 'published' ? 'secondary' : 'default'}
                            size="sm"
                          >
                            {item.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-50">
                              <DropdownMenuItem onClick={() => handleClone(item)}>
                                <Copy className="mr-2 h-3 w-3" />
                                Clone Content
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Languages className="mr-2 h-3 w-3" />
                                Translate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {filteredContent.length > 0 && (
              <div className="mt-8 text-center text-gray-500">
                Showing {filteredContent.length} of {content.length} posts
              </div>
            )}
          </>
        )}

        {activeTab === 'authors' && <AdminAuthorsTab />}
        {activeTab === 'analytics' && <AdminAnalyticsTab />}
        {activeTab === 'settings' && <AdminSettingsTab />}
      </div>
    </Layout>
  );
};

export default AdminContentDashboard;