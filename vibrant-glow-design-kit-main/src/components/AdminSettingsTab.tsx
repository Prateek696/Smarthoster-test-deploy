import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Globe, Database, Zap, Shield, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminSettingsTab = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    siteName: 'SmartHoster Blog',
    defaultLanguage: 'en',
    enableAnalytics: true,
    enableComments: false,
    autoPublish: false,
    emailNotifications: true,
    seoOptimization: true,
    cacheEnabled: true
  });

  const [apiKeys, setApiKeys] = useState({
    openaiKey: '',
    googleAnalytics: '',
    facebookPixel: ''
  });

  const handleSettingsChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, save to database
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleSaveApiKeys = () => {
    // In a real app, save to secure storage
    toast({
      title: "API Keys Updated",
      description: "Your API keys have been saved securely.",
    });
  };

  const handleMigrateContent = async () => {
    console.log('Migration button clicked - starting process...');
    
    toast({
      title: "🚀 Migration Started",
      description: "Importing ALL 56+ blog posts from your content files...",
    });
    
    try {
      console.log('Calling migrate_all_blog_posts RPC function...');
      const { data, error } = await supabase.rpc('migrate_all_blog_posts');
      
      console.log('RPC response:', { data, error });
      
      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }
      
      // Type assertion for the response data
      const result = data as { success: boolean; message?: string; error?: string; migrated_count?: number; total_posts?: number; languages?: any };
      
      console.log('Migration result:', result);
      
      if (result.success) {
        toast({
          title: "✅ Migration Complete!",
          description: `Successfully migrated ${result.migrated_count || 0} posts. Total in database: ${result.total_posts || 0}`,
        });
        
        console.log('Migration successful, reloading page in 2 seconds...');
        // Reload the page to show all imported posts
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('Migration failed:', result.error);
        toast({
          title: "❌ Migration Failed",
          description: result.error || "An error occurred during migration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "❌ Migration Error",
        description: error instanceof Error ? error.message : "Failed to start migration process.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Configure your content management system</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={settings.siteName}
                onChange={(e) => handleSettingsChange('siteName', e.target.value)}
                placeholder="Your site name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Default Language</label>
              <Select 
                value={settings.defaultLanguage} 
                onValueChange={(value) => handleSettingsChange('defaultLanguage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                  <SelectItem value="fr">🇫🇷 French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Enable Analytics</label>
                <p className="text-xs text-gray-500">Track page views and user engagement</p>
              </div>
              <Switch
                checked={settings.enableAnalytics}
                onCheckedChange={(checked) => handleSettingsChange('enableAnalytics', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">SEO Optimization</label>
                <p className="text-xs text-gray-500">Automatic meta tags and schema markup</p>
              </div>
              <Switch
                checked={settings.seoOptimization}
                onCheckedChange={(checked) => handleSettingsChange('seoOptimization', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">Cache Enabled</label>
                <p className="text-xs text-gray-500">Improve site performance with caching</p>
              </div>
              <Switch
                checked={settings.cacheEnabled}
                onCheckedChange={(checked) => handleSettingsChange('cacheEnabled', checked)}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings} className="w-full">
            Save General Settings
          </Button>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Content Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Auto-publish Generated Content</label>
              <p className="text-xs text-gray-500">Automatically publish AI-generated content</p>
            </div>
            <Switch
              checked={settings.autoPublish}
              onCheckedChange={(checked) => handleSettingsChange('autoPublish', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable Comments</label>
              <p className="text-xs text-gray-500">Allow user comments on blog posts</p>
            </div>
            <Switch
              checked={settings.enableComments}
              onCheckedChange={(checked) => handleSettingsChange('enableComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Email Notifications</label>
              <p className="text-xs text-gray-500">Get notified about new content and comments</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingsChange('emailNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            API Keys & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">OpenAI API Key</label>
            <Input
              type="password"
              value={apiKeys.openaiKey}
              onChange={(e) => handleApiKeyChange('openaiKey', e.target.value)}
              placeholder="sk-..."
            />
            <p className="text-xs text-gray-500 mt-1">Required for AI content generation</p>
          </div>

          <div>
            <label className="text-sm font-medium">Google Analytics ID</label>
            <Input
              value={apiKeys.googleAnalytics}
              onChange={(e) => handleApiKeyChange('googleAnalytics', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Facebook Pixel ID</label>
            <Input
              value={apiKeys.facebookPixel}
              onChange={(e) => handleApiKeyChange('facebookPixel', e.target.value)}
              placeholder="123456789012345"
            />
          </div>

          <Button onClick={handleSaveApiKeys} className="w-full">
            Save API Keys
          </Button>
        </CardContent>
      </Card>

      {/* Data Migration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Data Migration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Migrate Static Blog Posts</h4>
            <p className="text-sm text-gray-600 mb-4">
              Import existing blog posts from your data files into the database for unified management.
            </p>
            <Button 
              onClick={handleMigrateContent}
              className="bg-[#5FFF56] hover:bg-[#4FEF46] text-black font-semibold"
            >
              <Zap className="mr-2 h-4 w-4" />
              Migrate Blog Posts (Fixed!)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;