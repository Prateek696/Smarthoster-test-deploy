import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Eye, FileText, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminAnalyticsTab = () => {
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalPosts: 0,
    avgReadTime: 0,
    topPosts: [],
    viewsOverTime: [],
    categoryBreakdown: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all content for analytics
      const { data: content, error } = await supabase
        .from('content_with_author')
        .select('*')
        .eq('status', 'published');

      if (error) throw error;

      // Calculate analytics
      const totalViews = content?.reduce((sum, item) => sum + (item.view_count || 0), 0) || 0;
      const totalPosts = content?.length || 0;
      const avgReadTime = content?.reduce((sum, item) => sum + (item.reading_time || 0), 0) / totalPosts || 0;

      // Top performing posts
      const topPosts = (content || [])
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 5)
        .map(post => ({
          title: post.title,
          views: post.view_count || 0,
          readTime: post.reading_time || 0
        }));

      // Category breakdown
      const categoryMap = new Map();
      content?.forEach(post => {
        const category = post.category || 'Unknown';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([name, count]) => ({
        name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      }));

      // Simulated views over time (in a real app, you'd track this)
      const viewsOverTime = [
        { date: '2024-01', views: 1200 },
        { date: '2024-02', views: 1500 },
        { date: '2024-03', views: 1800 },
        { date: '2024-04', views: 2200 },
        { date: '2024-05', views: 2800 },
        { date: '2024-06', views: 3200 }
      ];

      setAnalytics({
        totalViews,
        totalPosts,
        avgReadTime: Math.round(avgReadTime),
        topPosts,
        viewsOverTime,
        categoryBreakdown
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Published Posts</p>
                <p className="text-2xl font-bold">{analytics.totalPosts}</p>
              </div>
              <FileText className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Read Time</p>
                <p className="text-2xl font-bold">{analytics.avgReadTime} min</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">8.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#5FFF56" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Posts by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00CFFF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPosts.map((post, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h4>
                  <p className="text-sm text-gray-600">{post.readTime} min read</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{post.views.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">views</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsTab;