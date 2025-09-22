
export const generateSitemap = () => {
  const baseUrl = 'https://smarthoster.io';
  const currentDate = new Date().toISOString();
  
  // Static pages with multilingual support
  const staticPages = [
    // Homepage
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: currentDate },
    
    // Main service pages
    { url: '/about', priority: '0.9', changefreq: 'monthly', lastmod: currentDate },
    { url: '/pricing', priority: '0.9', changefreq: 'monthly', lastmod: currentDate },
    { url: '/integrations', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/learn', priority: '0.8', changefreq: 'weekly', lastmod: currentDate },
    { url: '/learn-more', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    
    // Feature pages
    { url: '/full-service-management', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/enhanced-direct-bookings', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/advanced-automation', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/income-strategy', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/legal-compliance', priority: '0.8', changefreq: 'monthly', lastmod: currentDate },
    { url: '/automated-billing', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/green-pledge', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    { url: '/local-expertise', priority: '0.7', changefreq: 'monthly', lastmod: currentDate },
    
    // Legal pages
    { url: '/privacy', priority: '0.5', changefreq: 'yearly', lastmod: currentDate },
    { url: '/terms', priority: '0.5', changefreq: 'yearly', lastmod: currentDate },
    { url: '/cookie-policy', priority: '0.5', changefreq: 'yearly', lastmod: currentDate },
    { url: '/security-policy', priority: '0.5', changefreq: 'yearly', lastmod: currentDate },
    { url: '/gdpr-compliance', priority: '0.6', changefreq: 'yearly', lastmod: currentDate },
    
    // Career page
    { url: '/jobs', priority: '0.6', changefreq: 'monthly', lastmod: currentDate },
    
    // Blog pages
    { url: '/blog', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/pt/blog', priority: '0.9', changefreq: 'daily', lastmod: currentDate },
    { url: '/fr/blog', priority: '0.9', changefreq: 'daily', lastmod: currentDate }
  ];

  // Dynamic blog posts
  const { allBlogPosts } = require('../data/blogPostsUpdated');
  
  const blogUrls: Array<{url: string, priority: string, changefreq: string, lastmod: string}> = [];
  
  // English blog posts
  allBlogPosts.en?.forEach((post: any) => {
    if (!post.isDraft) {
      blogUrls.push({
        url: `/blog/${post.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: post.updatedAt || post.publishedAt
      });
    }
  });
  
  // Portuguese blog posts
  allBlogPosts.pt?.forEach((post: any) => {
    if (!post.isDraft) {
      blogUrls.push({
        url: `/pt/blog/${post.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: post.updatedAt || post.publishedAt
      });
    }
  });
  
  // French blog posts
  allBlogPosts.fr?.forEach((post: any) => {
    if (!post.isDraft) {
      blogUrls.push({
        url: `/fr/blog/${post.slug}`,
        priority: '0.8',
        changefreq: 'weekly',
        lastmod: post.updatedAt || post.publishedAt
      });
    }
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.url === '/blog' ? `
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/blog"/>
    <xhtml:link rel="alternate" hreflang="pt-pt" href="${baseUrl}/pt/blog"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}/fr/blog"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/blog"/>` : ''}
  </url>`).join('\n')}
${blogUrls.map(post => `  <url>
    <loc>${baseUrl}${post.url}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>${post.changefreq}</changefreq>
    <priority>${post.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemapXml;
};

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-Web
Allow: /

Sitemap: https://smarthoster.io/sitemap.xml
Sitemap: https://smarthoster.io/pt/sitemap.xml
Sitemap: https://smarthoster.io/fr/sitemap.xml

Host: https://smarthoster.io`;
};
