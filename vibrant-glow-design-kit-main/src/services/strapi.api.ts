import axios from 'axios';

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://smarthoster-blogs.onrender.com';

const strapiClient = axios.create({
  baseURL: STRAPI_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const strapiApi = {
  // Get all blog posts
  async getBlogs(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: any;
  }) {
    try {
      const { data } = await strapiClient.get('/api/blogs', {
        params: {
          'pagination[page]': params?.page || 1,
          'pagination[pageSize]': params?.pageSize || 50,
          'sort': params?.sort || 'publishedAt:desc',
          'populate': '*',
          ...params?.filters
        }
      });
      return data;
    } catch (error) {
      console.error('Error fetching Strapi blogs:', error);
      return { data: [], meta: {} };
    }
  },

  // Get single blog post by slug
  async getBlogBySlug(slug: string) {
    try {
      const { data } = await strapiClient.get('/api/blogs', {
        params: {
          'filters[slug][$eq]': slug,
          'populate': '*'
        }
      });
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  },

  // Get blog by ID
  async getBlogById(id: string) {
    try {
      const { data } = await strapiClient.get(`/api/blogs/${id}`, {
        params: {
          'populate': '*'
        }
      });
      return data;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      return null;
    }
  },

  // Search blogs by query
  async searchBlogs(query: string) {
    try {
      const { data } = await strapiClient.get('/api/blogs', {
        params: {
          'filters[$or][0][title][$containsi]': query,
          'filters[$or][1][excerpt][$containsi]': query,
          'filters[$or][2][content][$containsi]': query,
          'populate': '*',
          'sort': 'publishedAt:desc'
        }
      });
      return data;
    } catch (error) {
      console.error('Error searching Strapi blogs:', error);
      return { data: [], meta: {} };
    }
  }
};


