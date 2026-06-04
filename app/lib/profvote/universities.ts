import type { University, UniversitySlug } from './types';

export const UNI_CONFIG: Record<UniversitySlug, Omit<University, 'professorCount'>> = {
  stuttgart: {
    slug: 'stuttgart',
    name: 'Universität Stuttgart',
    shortName: 'Uni Stuttgart',
    shortDescription: 'Über 300 Professor:innen aus 10 Fakultäten.',
    available: true,
    emailDomains: ['stud.uni-stuttgart.de', 'uni-stuttgart.de'],
  },
  kit: {
    slug: 'kit',
    name: 'Karlsruher Institut für Technologie',
    shortName: 'KIT',
    shortDescription: 'Über 360 Professor:innen, Technik & Wirtschaft.',
    available: true,
    emailDomains: ['student.kit.edu', 'kit.edu'],
  },
  tuebingen: {
    slug: 'tuebingen',
    name: 'Universität Tübingen',
    shortName: 'Uni Tübingen',
    shortDescription: 'Bald verfügbar.',
    available: false,
    emailDomains: ['student.uni-tuebingen.de', 'uni-tuebingen.de'],
  },
  tum: {
    slug: 'tum',
    name: 'Technische Universität München',
    shortName: 'TUM',
    shortDescription: 'Bald verfügbar.',
    available: false,
    emailDomains: ['mytum.de', 'tum.de'],
  },
};

export const PROF_COLLECTION: Record<UniversitySlug, string | null> = {
  stuttgart: 'Import1',
  kit: 'Import2',
  tuebingen: null,
  tum: 'Import3',
};

export const REVIEW_COLLECTION: Record<UniversitySlug, string | null> = {
  stuttgart: 'Bewertung_Professoren',
  kit: 'BewertungProfessorenKIT',
  tuebingen: null,
  tum: 'TUProfessorenBewertung',
};

export function listUniversities(): University[] {
  return Object.values(UNI_CONFIG).map((u) => ({ ...u, professorCount: 0 }));
}

export function getUniversity(slug: string): University | null {
  const cfg = UNI_CONFIG[slug as UniversitySlug];
  return cfg ? { ...cfg, professorCount: 0 } : null;
}
