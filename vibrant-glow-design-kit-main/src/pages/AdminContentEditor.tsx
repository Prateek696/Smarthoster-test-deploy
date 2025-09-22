import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Calendar as CalendarIcon, 
  User, 
  Image, 
  Tags, 
  FileText,
  Code,
  Globe,
  Clock,
  Target,
  Hash
} from 'lucide-react';
import Layout from '@/components/Layout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  profile_image_url: string;
}

interface ImageOption {
  id: number;
  url: string;
  alt: string;
  prompt: string;
}

interface ContentData {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  tags: string[];
  category: string;
  target_location: string;
  language: string;
  author_id: string;
  featured_image_url: string;
  featured_image_alt: string;
  excerpt: string;
  reading_time: number;
  date_published: string;
  status: string;
  schema_markup: any;
  tone: string;
}

const AdminContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishDate, setPublishDate] = useState<Date>();
  const [imageOptions, setImageOptions] = useState<ImageOption[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [newTag, setNewTag] = useState('');

  const [content, setContent] = useState<ContentData>({
    id: '',
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    keywords: [],
    tags: [],
    category: '',
    target_location: '',
    language: 'en',
    author_id: '',
    featured_image_url: '',
    featured_image_alt: '',
    excerpt: '',
    reading_time: 0,
    date_published: '',
    status: 'draft',
    schema_markup: null,
    tone: ''
  });

  useEffect(() => {
    if (id) {
      fetchContent();
      fetchAuthors();
    }
  }, [id]);

  const fetchAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');

      if (error) throw error;
      setAuthors(data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setContent({
        id: data.id,
        title: data.title || '',
        slug: data.slug || '',
        content: data.content || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        keywords: data.keywords || [],
        tags: data.tags || [],
        category: data.category || '',
        target_location: data.target_location || '',
        language: data.language || 'en',
        author_id: data.author_id || '',
        featured_image_url: data.featured_image_url || '',
        featured_image_alt: data.featured_image_alt || '',
        excerpt: data.excerpt || '',
        reading_time: data.reading_time || 0,
        date_published: data.date_published || '',
        status: data.status || 'draft',
        schema_markup: data.schema_markup,
        tone: data.tone || ''
      });

      if (data.date_published) {
        setPublishDate(new Date(data.date_published));
      }

      // Mock image options for now (in real implementation, you'd store these)
      if (data.featured_image_url) {
        setImageOptions([
          {
            id: 1,
            url: data.featured_image_url,
            alt: data.featured_image_alt || '',
            prompt: 'Current featured image'
          }
        ]);
      }
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

  const handleSave = async (newStatus?: string) => {
    setSaving(true);
    try {
      const updateData = {
        ...content,
        date_published: publishDate ? publishDate.toISOString() : null,
        status: newStatus || content.status,
        updated_at: new Date().toISOString(),
        reading_time: calculateReadingTime(content.content),
        published_at: newStatus === 'published' ? new Date().toISOString() : undefined
      };

      const { error } = await supabase
        .from('generated_content')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Content Updated",
        description: `Content has been ${newStatus === 'published' ? 'published' : 'updated'} successfully.`,
      });
      
      if (newStatus) {
        setContent(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    let previewUrl = `/blog/${content.slug}`;
    if (content.language === 'pt') previewUrl = `/pt/blog/${content.slug}`;
    if (content.language === 'fr') previewUrl = `/fr/blog/${content.slug}`;
    window.open(previewUrl, '_blank');
  };

  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const wordCount = text.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const addTag = () => {
    if (newTag.trim() && !content.tags.includes(newTag.trim())) {
      setContent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setContent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addKeyword = (newKeyword: string) => {
    if (newKeyword.trim() && !content.keywords.includes(newKeyword.trim())) {
      setContent(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setContent(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const selectedAuthor = authors.find(a => a.id === content.author_id);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading content...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            onClick={() => navigate('/admin/content-dashboard')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Content Editor</h1>
            <p className="text-gray-600">Edit your AI-generated content with advanced SEO and metadata controls</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="schema" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Schema
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={content.title}
                        onChange={(e) => {
                          const newTitle = e.target.value;
                          setContent(prev => ({ 
                            ...prev, 
                            title: newTitle,
                            slug: generateSlug(newTitle)
                          }));
                        }}
                        placeholder="Enter content title"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="slug">URL Slug</Label>
                      <Input
                        id="slug"
                        value={content.slug}
                        onChange={(e) => setContent(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="url-friendly-slug"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={content.excerpt}
                        onChange={(e) => setContent(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Brief summary of the content (160 characters max)"
                        rows={3}
                        maxLength={160}
                        className="mt-1"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {content.excerpt.length}/160 characters
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="content">Main Content *</Label>
                      <Textarea
                        id="content"
                        value={content.content}
                        onChange={(e) => setContent(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Your article content..."
                        rows={20}
                        className="mt-1 font-mono text-sm"
                      />
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateReadingTime(content.content)} min read
                        </span>
                        <span>{content.content.split(' ').length} words</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="meta_title">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={content.meta_title}
                        onChange={(e) => setContent(prev => ({ ...prev, meta_title: e.target.value }))}
                        placeholder="SEO optimized title (50-60 characters)"
                        maxLength={60}
                        className="mt-1"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {content.meta_title.length}/60 characters
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="meta_description">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={content.meta_description}
                        onChange={(e) => setContent(prev => ({ ...prev, meta_description: e.target.value }))}
                        placeholder="Compelling description for search results (150-160 characters)"
                        rows={3}
                        maxLength={160}
                        className="mt-1"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {content.meta_description.length}/160 characters
                      </div>
                    </div>

                    <div>
                      <Label>Keywords</Label>
                      <div className="flex gap-2 mt-2 mb-3">
                        <Input
                          placeholder="Add keyword..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addKeyword(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {content.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer">
                            {keyword}
                            <button
                              onClick={() => removeKeyword(keyword)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex gap-2 mt-2 mb-3">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button onClick={addTag} size="sm">Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {content.tags.map((tag, index) => (
                          <Badge key={index} className="cursor-pointer">
                            <Tags className="mr-1 h-3 w-3" />
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-red-200 hover:text-red-100"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {imageOptions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {imageOptions.map((image, index) => (
                            <div
                              key={index}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImageIndex === index 
                                  ? 'border-[#5FFF56] ring-2 ring-[#5FFF56]/20' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedImageIndex(index)}
                            >
                              <img 
                                src={image.url} 
                                alt={image.alt}
                                className="w-full h-40 object-cover"
                              />
                              {selectedImageIndex === index && (
                                <div className="absolute inset-0 bg-[#5FFF56]/20 flex items-center justify-center">
                                  <Eye className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div>
                          <Label htmlFor="featured_image_alt">Alt Text</Label>
                          <Input
                            id="featured_image_alt"
                            value={content.featured_image_alt}
                            onChange={(e) => setContent(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                            placeholder="Descriptive alt text for accessibility"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No featured image available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schema" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schema Markup Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {content.schema_markup ? (
                      <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">
                        {JSON.stringify(content.schema_markup, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No schema markup available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Publish Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-2">
                    <Badge variant={content.status === 'published' ? 'default' : 'secondary'}>
                      {content.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Publish Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-2",
                          !publishDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publishDate ? format(publishDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={publishDate}
                        onSelect={setPublishDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select value={content.language} onValueChange={(value) => setContent(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={content.category} onValueChange={(value) => setContent(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local_guides">Local Guides</SelectItem>
                      <SelectItem value="regulations">Regulations</SelectItem>
                      <SelectItem value="hosting_tips">Hosting Tips</SelectItem>
                      <SelectItem value="area_insights">Area Insights</SelectItem>
                      <SelectItem value="investment_guide">Investment Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSave()}
                    disabled={saving}
                    variant="outline"
                    className="flex-1"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={handlePreview}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                <Button 
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="w-full bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold"
                >
                  {content.status === 'published' ? 'Update Published' : 'Publish Now'}
                </Button>
              </CardContent>
            </Card>

            {/* Author */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Author
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={content.author_id} onValueChange={(value) => setContent(prev => ({ ...prev, author_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAuthor && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {selectedAuthor.profile_image_url && (
                        <img 
                          src={selectedAuthor.profile_image_url} 
                          alt={selectedAuthor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium text-sm">{selectedAuthor.name}</p>
                        <p className="text-xs text-gray-600">{selectedAuthor.bio}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Content Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reading Time:</span>
                  <span>{calculateReadingTime(content.content)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Word Count:</span>
                  <span>{content.content.split(' ').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Character Count:</span>
                  <span>{content.content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Location:</span>
                  <span>{content.target_location || 'None'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminContentEditor;