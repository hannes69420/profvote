export type UniversitySlug = 'stuttgart' | 'kit' | 'tuebingen' | 'tum';

export interface University {
  slug: UniversitySlug;
  name: string;
  shortName: string;
  image?: string;
  shortDescription?: string;
  available: boolean;
  emailDomains: string[];
  professorCount: number;
}

export interface Professor {
  id: string;
  slug: string;
  uni: UniversitySlug;
  name: string;
  faculty?: string;
  facultyNumber?: number;
  title?: string;
  avgOverall?: number;
  reviewCount?: number;
}

export interface RatingBreakdown {
  insgesamt: number;
  vorlesung: number;
  skript: number;
  klausur: number;
  organisation: number;
  schwierigkeit: number;
}

export interface Review {
  id: string;
  professorId: string;
  uni: UniversitySlug;
  createdAt: string;
  comment?: string;
  ratings: RatingBreakdown;
  verified: boolean;
}

export interface AggregatedRatings extends RatingBreakdown {
  count: number;
}
