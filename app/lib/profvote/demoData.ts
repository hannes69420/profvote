import type { Professor, Review, UniversitySlug } from './types';

export const DEMO_PROFESSORS: Professor[] = [
  {
    id: 'demo-stuttgart-1',
    slug: 'anna-schneider',
    uni: 'stuttgart',
    name: 'Prof. Dr. Anna Schneider',
    faculty: 'Informatik, Elektrotechnik und Informationstechnik',
    title: 'Professorin',
    avgOverall: 4.6,
    reviewCount: 18,
  },
  {
    id: 'demo-stuttgart-2',
    slug: 'maximilian-weber',
    uni: 'stuttgart',
    name: 'Prof. Dr. Maximilian Weber',
    faculty: 'Maschinenbau',
    title: 'Professor',
    avgOverall: 3.9,
    reviewCount: 11,
  },
  {
    id: 'demo-kit-1',
    slug: 'lara-fischer',
    uni: 'kit',
    name: 'Prof. Dr. Lara Fischer',
    faculty: 'Wirtschaftswissenschaften',
    title: 'Professorin',
    avgOverall: 4.3,
    reviewCount: 14,
  },
  {
    id: 'demo-kit-2',
    slug: 'jonas-keller',
    uni: 'kit',
    name: 'Prof. Dr. Jonas Keller',
    faculty: 'Informatik',
    title: 'Professor',
    avgOverall: 4.1,
    reviewCount: 9,
  },
];

export const DEMO_REVIEWS: Review[] = [
  {
    id: 'demo-review-1',
    professorId: 'demo-stuttgart-1',
    uni: 'stuttgart',
    createdAt: '2026-05-20T10:00:00.000Z',
    comment: 'Sehr klare Vorlesung, gute Beispiele und faire Klausurvorbereitung.',
    ratings: {
      insgesamt: 5,
      vorlesung: 5,
      skript: 4,
      klausur: 4,
      organisation: 5,
      schwierigkeit: 2,
    },
    verified: true,
  },
  {
    id: 'demo-review-2',
    professorId: 'demo-stuttgart-2',
    uni: 'stuttgart',
    createdAt: '2026-05-12T10:00:00.000Z',
    comment: 'Inhaltlich stark, aber die Aufgaben ziehen gegen Ende deutlich an.',
    ratings: {
      insgesamt: 4,
      vorlesung: 4,
      skript: 3,
      klausur: 3,
      organisation: 4,
      schwierigkeit: 4,
    },
    verified: true,
  },
  {
    id: 'demo-review-3',
    professorId: 'demo-kit-1',
    uni: 'kit',
    createdAt: '2026-05-04T10:00:00.000Z',
    comment: 'Sehr motivierend und gut strukturiert, besonders die Tutorien helfen.',
    ratings: {
      insgesamt: 4,
      vorlesung: 5,
      skript: 4,
      klausur: 4,
      organisation: 4,
      schwierigkeit: 3,
    },
    verified: true,
  },
  {
    id: 'demo-review-4',
    professorId: 'demo-kit-2',
    uni: 'kit',
    createdAt: '2026-04-26T10:00:00.000Z',
    comment: 'Gute Folien und spannende Projekte, etwas mehr Feedback waere hilfreich.',
    ratings: {
      insgesamt: 4,
      vorlesung: 4,
      skript: 4,
      klausur: 3,
      organisation: 4,
      schwierigkeit: 3,
    },
    verified: true,
  },
];

export function listDemoProfessorsByUni(uni: UniversitySlug) {
  return DEMO_PROFESSORS.filter((p) => p.uni === uni).sort((a, b) =>
    a.name.localeCompare(b.name, 'de'),
  );
}

export function listDemoReviewsForProfessor(uni: UniversitySlug, professorId: string) {
  return DEMO_REVIEWS.filter((r) => r.uni === uni && r.professorId === professorId).sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
}
