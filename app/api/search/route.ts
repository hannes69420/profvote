import { NextResponse } from 'next/server';
import { listProfessorsByUni } from '@app/lib/profvote/professors';
import { UNI_CONFIG } from '@app/lib/profvote/universities';
import type { Professor, UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';
export const revalidate = 300;

interface Hit {
  id: string;
  slug: string;
  uni: UniversitySlug;
  uniShort: string;
  name: string;
  faculty?: string;
  avgOverall?: number;
  reviewCount?: number;
  score: number;
}

function score(p: Professor, needle: string): number {
  const n = needle.toLowerCase();
  const name = p.name.toLowerCase();
  if (name === n) return 1000;
  if (name.startsWith(n)) return 500;
  if (name.split(/\s+/).some((part) => part.startsWith(n))) return 400;
  if (name.includes(n)) return 200;
  if (p.faculty?.toLowerCase().includes(n)) return 50;
  return 0;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const available = Object.values(UNI_CONFIG).filter((u) => u.available);
  const lists = await Promise.all(
    available.map((u) => listProfessorsByUni(u.slug)),
  );

  const hits: Hit[] = [];
  for (let i = 0; i < available.length; i++) {
    const u = available[i];
    for (const p of lists[i]) {
      const s = score(p, q);
      if (s > 0) {
        hits.push({
          id: p.id,
          slug: p.slug,
          uni: p.uni,
          uniShort: u.shortName,
          name: p.name,
          faculty: p.faculty,
          avgOverall: p.avgOverall,
          reviewCount: p.reviewCount,
          score: s,
        });
      }
    }
  }
  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'de'));

  return NextResponse.json({ hits: hits.slice(0, 12) });
}
