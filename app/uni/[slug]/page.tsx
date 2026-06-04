import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUniversity } from '@app/lib/profvote/universities';
import { listProfessorsByUni } from '@app/lib/profvote/professors';
import { ProfessorList } from './ProfessorList';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const revalidate = 300;

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const uni = getUniversity(slug);
  if (!uni) return { title: 'Universität nicht gefunden' };
  return {
    title: `${uni.shortName} — Profs bewerten`,
    description: `Bewerte und such alle Professor:innen der ${uni.name} anonym. ${uni.shortDescription ?? ''}`.trim(),
  };
}

export default async function UniPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const uni = getUniversity(slug);
  if (!uni) notFound();

  if (!uni.available) {
    return (
      <div className="container-prose py-24">
        <Link href="/" className="text-sm text-ink-muted hover:text-ink-soft">
          ← Zurück
        </Link>
        <h1 className="mt-4">{uni.name}</h1>
        <p className="mt-6 max-w-2xl text-lg text-ink-muted">
          Diese Uni ist noch in Vorbereitung. Wir füllen die Professor:innen-Liste in Kürze.
        </p>
      </div>
    );
  }

  const profs = await listProfessorsByUni(uni.slug as UniversitySlug);
  const faculties = Array.from(
    new Set(profs.map((p) => p.faculty).filter(Boolean) as string[]),
  ).sort((a, b) => a.localeCompare(b, 'de'));

  return (
    <div className="container-prose py-12 sm:py-16">
      <Link href="/" className="text-sm text-ink-muted hover:text-ink-soft">
        ← Alle Universitäten
      </Link>
      <div className="mt-4 flex items-end justify-between gap-4">
        <h1>{uni.shortName}</h1>
        <span className="pill">{profs.length} Professor:innen</span>
      </div>
      <p className="mt-4 max-w-2xl text-lg text-ink-muted">{uni.name}</p>

      <div className="mt-10">
        <ProfessorList professors={profs} faculties={faculties} uniSlug={uni.slug} />
      </div>
    </div>
  );
}
