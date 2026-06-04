import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL || 'https://profvote.de';
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/bewerten/'] },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
