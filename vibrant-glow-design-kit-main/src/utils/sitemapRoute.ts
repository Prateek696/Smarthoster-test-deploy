import { generateSitemap } from './sitemapGenerator';

export const handleSitemapRequest = (): Response => {
  const sitemap = generateSitemap();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};

// For static generation
export const generateSitemapFile = () => {
  const sitemap = generateSitemap();
  
  // This would be used in a build process to generate static sitemap.xml
  return sitemap;
};