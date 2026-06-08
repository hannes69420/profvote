import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUniversity, UNI_CONFIG } from '@app/lib/profvote/universities';
import { getProfessor } from '@app/lib/profvote/professors';
import { ReviewForm } from './ReviewForm';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const dynamic = 'force-dynamic';

type PageParams = Promise<{ uni: string; slug: string }>;

export default async function BewertenPage({
  params,
}: {
  params: PageParams;
}) {
  const { uni: uniSlug, slug } = await params;
  const uni = getUniversity(uniSlug);
  if (!uni) notFound();
  if (!uni.available) {
    return (
      <div className="container-prose py-24">
        <h1>{uni.name}</h1>
        <p className="mt-4 text-ink-muted">Bewertungen für diese Uni sind noch nicht aktiv.</p>
      </div>
    );
  }

  const prof = await getProfessor(uni.slug as UniversitySlug, slug);
  if (!prof) notFound();

  const domains = UNI_CONFIG[uni.slug as UniversitySlug].emailDomains;

  return (
    <div className="container-prose py-12 sm:py-16">
      <Link
        href={`/prof/${uni.slug}/${prof.slug}`}
        className="text-sm text-ink-muted hover:text-ink-soft"
      >
        ← {prof.name}
      </Link>
      <h1 className="mt-4">Bewertung abgeben</h1>
      <p className="mt-3 text-lg text-ink-muted">
        Für <span className="text-ink-soft">{prof.name}</span> · {uni.shortName}
      </p>

      <div className="mt-10">
        <ReviewForm
          uni={uni.slug as UniversitySlug}
          professorId={prof.id}
          professorName={prof.name}
          allowedDomains={domains}
        />
      </div>

      <p className="mt-8 text-xs text-ink-muted">
        Wir verschicken eine Bestätigungs-Email an deine Uni-Adresse. Bewertungen sind anonym —
        deine Email wird nicht öffentlich angezeigt und nach der Bestätigung nur noch zur
        Doppelt-Vermeidung gespeichert.
      </p>
    </div>
  );
}
