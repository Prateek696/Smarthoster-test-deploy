import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Eye, Save, Send, Calendar, User, Image, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SafeHTML } from '@/utils/sanitize';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';

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

interface GeneratedContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  aiSnippet: string;
  content: string;
  keywords: string[];
  slug: string;
  tags: string[];
  schemaMarkup: any;
  internalLinks: Array<{anchor: string, url: string, type: string}>;
  externalLinks: Array<{anchor: string, url: string, type: string}>;
  imageOptions: ImageOption[];
  selectedImageIndex: number;
  featuredImageUrl: string;
  featuredImageAlt: string;
  authorId: string;
  authorName: string;
  authorBio: string;
  authorImage: string;
  datePublished: string;
  excerpt: string;
  readingTime: number;
  language: string;
  tone: string;
  category: string;
  targetLocation: string;
}

const AdminContentGenerator = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [formData, setFormData] = useState({
    prompt: '',
    tone: 'conversational',
    language: 'en',
    category: 'hosting_tips',
    targetLocation: '',
    authorId: '',
    publishDate: new Date().toISOString().split('T')[0]
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');

      if (error) throw error;
      setAuthors(data || []);
      
      // Set random default author
      if (data && data.length > 0) {
        const randomAuthor = data[Math.floor(Math.random() * data.length)];
        setFormData(prev => ({ ...prev, authorId: randomAuthor.id }));
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleGenerate = async () => {
    if (!formData.prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a keyword or prompt to generate content.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const response = await supabase.functions.invoke('generate-content', {
        body: {
          ...formData,
          user_id: user.id,
          author_id: formData.authorId || null,
          publish_date: formData.publishDate
        }
      });

      if (response.error) {
        throw response.error;
      }

      setGeneratedContent(response.data);
      setSelectedImageIndex(0);
      toast({
        title: "Content Generated!",
        description: "Your SEO-optimized content with multiple image options has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
    if (generatedContent) {
      setGeneratedContent({
        ...generatedContent,
        selectedImageIndex: index,
        featuredImageUrl: generatedContent.imageOptions[index].url,
        featuredImageAlt: generatedContent.imageOptions[index].alt
      });
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!generatedContent) return;

    setIsSaving(true);
    try {
      const selectedImage = generatedContent.imageOptions[selectedImageIndex];
      
      const { error } = await supabase
        .from('generated_content')
        .insert({
          title: generatedContent.title,
          slug: generatedContent.slug,
          content: generatedContent.content,
          meta_title: generatedContent.metaTitle,
          meta_description: generatedContent.metaDescription,
          ai_snippet: generatedContent.aiSnippet,
          schema_markup: generatedContent.schemaMarkup,
          language: formData.language,
          category: formData.category,
          target_location: formData.targetLocation,
          tone: formData.tone,
          keywords: generatedContent.keywords,
          tags: generatedContent.tags,
          status: status,
          internal_links: generatedContent.internalLinks,
          external_links: generatedContent.externalLinks,
          featured_image_url: selectedImage?.url || null,
          featured_image_alt: selectedImage?.alt || null,
          author_id: formData.authorId || null,
          date_published: status === 'published' ? new Date(formData.publishDate).toISOString() : null,
          excerpt: generatedContent.excerpt,
          reading_time: generatedContent.readingTime,
          published_at: status === 'published' ? new Date().toISOString() : null
        });

      if (error) throw error;

      toast({
        title: status === 'published' ? "Content Published!" : "Draft Saved!",
        description: `Your content has been ${status === 'published' ? 'published' : 'saved as draft'} successfully.`,
      });

      // Reset form
      setGeneratedContent(null);
      setFormData({
        prompt: '',
        tone: 'conversational',
        language: 'en',
        category: 'hosting_tips',
        targetLocation: '',
        authorId: authors.length > 0 ? authors[Math.floor(Math.random() * authors.length)].id : '',
        publishDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const selectedAuthor = authors.find(a => a.id === formData.authorId);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Content Generator
            </h1>
            <p className="text-gray-600">
              Generate world-class, AEO-optimized content with author management, multiple image options, and advanced SEO features.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-[#5FFF56]" />
                Content Configuration
              </CardTitle>
              <CardDescription>
                Configure your content parameters for AI-powered, SEO-optimized blog generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prompt">Keyword or Prompt *</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., 'Airbnb rules in Faro', 'Property management tips for Algarve', 'Best neighborhoods in Lisbon for Airbnb'"
                  value={formData.prompt}
                  onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({...formData, tone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="authoritative">Authoritative</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="informative">Informative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({...formData, language: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="pt">🇵🇹 Portuguese (Portugal)</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local_guides">Local Guides</SelectItem>
                    <SelectItem value="regulations">Regulations & Compliance</SelectItem>
                    <SelectItem value="hosting_tips">Hosting Tips</SelectItem>
                    <SelectItem value="area_insights">Area Insights</SelectItem>
                    <SelectItem value="investment_guide">Investment Guide</SelectItem>
                    <SelectItem value="market_analysis">Market Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetLocation">Target Location (Optional)</Label>
                <Input
                  id="targetLocation"
                  placeholder="e.g., Faro, Algarve, Lisbon, Porto"
                  value={formData.targetLocation}
                  onChange={(e) => setFormData({...formData, targetLocation: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="authorId" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Author
                  </Label>
                  <Select value={formData.authorId} onValueChange={(value) => setFormData({...formData, authorId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">Random Author</SelectItem>
                      {authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedAuthor && (
                    <p className="text-xs text-gray-500 mt-1">{selectedAuthor.bio}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="publishDate" className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Publish Date
                  </Label>
                  <Input
                    id="publishDate"
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !formData.prompt.trim()}
                className="w-full bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Enhanced Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Content with Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5 text-[#00CFFF]" />
                Enhanced Content Preview
              </CardTitle>
              <CardDescription>
                Preview your generated content with multiple image options and enhanced metadata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedContent ? (
                <div className="text-center text-gray-500 py-12">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Generate content to see enhanced preview here</p>
                  <p className="text-sm mt-2">Includes multiple image options, author info, and SEO metadata</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Selection */}
                  {generatedContent.imageOptions && generatedContent.imageOptions.length > 0 && (
                    <div>
                      <Label className="flex items-center mb-3">
                        <Image className="mr-2 h-4 w-4" />
                        Choose Featured Image
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {generatedContent.imageOptions.map((image, index) => (
                          <div
                            key={index}
                            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index 
                                ? 'border-[#5FFF56] ring-2 ring-[#5FFF56]/20' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleImageSelect(index)}
                          >
                            <img 
                              src={image.url} 
                              alt={image.alt}
                              className="w-full h-20 object-cover"
                            />
                            {selectedImageIndex === index && (
                              <div className="absolute inset-0 bg-[#5FFF56]/20 flex items-center justify-center">
                                <Eye className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Alt text: {generatedContent.imageOptions[selectedImageIndex]?.alt}
                      </p>
                    </div>
                  )}

                  {/* Author Info */}
                  {generatedContent.authorName && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Author Information
                      </h3>
                      <div className="flex items-center space-x-3">
                        {generatedContent.authorImage && (
                          <img 
                            src={generatedContent.authorImage} 
                            alt={generatedContent.authorName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{generatedContent.authorName}</p>
                          <p className="text-sm text-gray-600">{generatedContent.authorBio}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SEO Overview */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">SEO & Metadata Overview</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Title:</strong> {generatedContent.title}</div>
                      <div><strong>Meta Description:</strong> {generatedContent.metaDescription}</div>
                      <div><strong>Keywords:</strong> {generatedContent.keywords.join(', ')}</div>
                      <div><strong>Tags:</strong> {generatedContent.tags?.join(', ')}</div>
                      <div><strong>Slug:</strong> /{generatedContent.slug}</div>
                      <div><strong>Reading Time:</strong> {generatedContent.readingTime} min</div>
                      <div><strong>Excerpt:</strong> {generatedContent.excerpt}</div>
                    </div>
                  </div>

                  {/* AI Snippet */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">AI Answer Engine Snippet</h3>
                    <p className="text-sm">{generatedContent.aiSnippet}</p>
                  </div>

                  {/* Content Preview */}
                  <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
                    <SafeHTML 
                      content={generatedContent.content}
                      className="prose prose-sm max-w-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSave('draft')}
                      disabled={isSaving}
                      variant="outline"
                      className="flex-1"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => handleSave('published')}
                      disabled={isSaving}
                      className="flex-1 bg-[#00CFFF] hover:bg-[#00BFEF] text-white"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Publish Now
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminContentGenerator;