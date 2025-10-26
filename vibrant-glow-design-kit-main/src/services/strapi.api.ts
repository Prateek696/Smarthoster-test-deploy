const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'https://smarthoster-blogs.onrender.com';

export const strapiApi = {
  // Get all blog posts
  async getBlogs(params?: {
    page?: number;
    pageSize?: number;
    sort?: string;
    filters?: any;
  }) {
    try {
      const searchParams = new URLSearchParams({
        'pagination[page]': String(params?.page || 1),
        'pagination[pageSize]': String(params?.pageSize || 50),
        'sort': params?.sort || 'publishedAt:desc',
        'populate': '*',
      });
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Strapi blogs:', error);
      return { data: [], meta: {} };
    }
  },

  // Get single blog post by slug
  async getBlogBySlug(slug: string) {
    try {
      const searchParams = new URLSearchParams({
        'filters[slug][$eq]': slug,
        'populate': '*'
      });
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data?.[0] || null;
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      return null;
    }
  },

  // Get blog by ID
  async getBlogById(id: string) {
    try {
      const response = await fetch(`${STRAPI_URL}/api/blogs/${id}?populate=*`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      return null;
    }
  },

  // Search blogs by query
  async searchBlogs(query: string) {
    try {
      const searchParams = new URLSearchParams({
        'filters[$or][0][title][$containsi]': query,
        'filters[$or][1][excerpt][$containsi]': query,
        'filters[$or][2][content][$containsi]': query,
        'populate': '*',
        'sort': 'publishedAt:desc'
      });
      
      const response = await fetch(`${STRAPI_URL}/api/blogs?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching Strapi blogs:', error);
      return { data: [], meta: {} };
    }
  }
};
