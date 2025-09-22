import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Users, FileText, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string;
  profile_image_url: string;
  email: string;
  created_at: string;
  post_count?: number;
}

const AdminAuthorsTab = () => {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    email: '',
    profile_image_url: ''
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const { data: authorsData, error } = await supabase
        .from('authors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get post counts for each author
      const authorsWithCounts = await Promise.all(
        (authorsData || []).map(async (author) => {
          const { count } = await supabase
            .from('generated_content')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', author.id);
          
          return { ...author, post_count: count || 0 };
        })
      );

      setAuthors(authorsWithCounts);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch authors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Author name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const slug = generateSlug(formData.name);
      
      if (editingAuthor) {
        // Update existing author
        const { error } = await supabase
          .from('authors')
          .update({
            name: formData.name,
            slug,
            bio: formData.bio,
            email: formData.email,
            profile_image_url: formData.profile_image_url
          })
          .eq('id', editingAuthor.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Author updated successfully.",
        });
      } else {
        // Create new author
        const { error } = await supabase
          .from('authors')
          .insert({
            name: formData.name,
            slug,
            bio: formData.bio,
            email: formData.email,
            profile_image_url: formData.profile_image_url
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Author created successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingAuthor(null);
      setFormData({ name: '', bio: '', email: '', profile_image_url: '' });
      fetchAuthors();
    } catch (error) {
      console.error('Error saving author:', error);
      toast({
        title: "Error",
        description: "Failed to save author. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      name: author.name,
      bio: author.bio || '',
      email: author.email || '',
      profile_image_url: author.profile_image_url || ''
    });
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading authors...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Authors Management</h2>
          <p className="text-gray-600">Manage your content authors and their profiles</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold"
              onClick={() => {
                setEditingAuthor(null);
                setFormData({ name: '', bio: '', email: '', profile_image_url: '' });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Author
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAuthor ? 'Edit Author' : 'Add New Author'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Author name"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="author@example.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Profile Image URL</label>
                <Input
                  value={formData.profile_image_url}
                  onChange={(e) => setFormData({ ...formData, profile_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Author biography..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAuthor ? 'Update' : 'Create'} Author
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <Card key={author.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {author.profile_image_url ? (
                    <img 
                      src={author.profile_image_url} 
                      alt={author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{author.name}</h3>
                    <p className="text-sm text-gray-500">@{author.slug}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(author)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              
              {author.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {author.bio}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3" />
                    <span>{author.post_count} posts</span>
                  </div>
                  {author.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(author.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {authors.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No authors yet</h3>
            <p className="text-gray-500 mb-4">
              Start by adding your first author to manage content creation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminAuthorsTab;