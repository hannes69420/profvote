import type { MetadataRoute } from 'next';
import { listProfessorsByUni } from '@app/lib/profvote/professors';
import { UNI_CONFIG } from '@app/lib/profvote/universities';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL || 'https://profvote.de';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/vergleich`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const unis = Object.values(UNI_CONFIG).filter((u) => u.available);
  const uniRoutes: MetadataRoute.Sitemap = unis.map((u) => ({
    url: `${base}/uni/${u.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const profRoutes: MetadataRoute.Sitemap = [];
  for (const u of unis) {
    try {
      const profs = await listProfessorsByUni(u.slug);
      for (const p of profs) {
        profRoutes.push({
          url: `${base}/prof/${u.slug}/${p.slug}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    } catch {
      // ignore failures for sitemap generation
    }
  }

  return [...staticRoutes, ...uniRoutes, ...profRoutes];
}
