/**
 * Server-side fetch utility for public data endpoints.
 *
 * - Uses `next.revalidate` so Next.js re-renders the page in the background
 *   at most once per TTL, while the Laravel layer answers from Cache::remember.
 * - TTLs below mirror the Laravel CacheKeys constants so both layers expire
 *   roughly at the same time.
 *
 * Usage (Server Component):
 *   const programs = await fetchPrograms();
 *   return <ProgramClient initialPrograms={programs} />;
 */

import type {
    BackendProgram,
    BackendArticle,
    BackendFacility,
    BackendGalleryImage,
    BackendTestimonial,
    BackendPartner,
    BackendTeamMember,
    BackendSiteSettings,
} from '@/lib/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

async function safeFetch<T>(
    path: string,
    revalidate: number,
    fallback: T
): Promise<T> {
    try {
        // Use the internal base URL for server-to-server calls
        const url = `${BASE_URL}${path}`;
        const res = await fetch(url, {
            next: { revalidate },
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return fallback;
        const json = await res.json();
        // Support both `results` and `data` shaped responses
        return (json.results ?? json.data ?? json) as T;
    } catch {
        return fallback;
    }
}

// ── Public fetch helpers ────────────────────────────────────────────────────

/** Programs list (1 hour ISR) */
export const fetchPrograms = (): Promise<BackendProgram[]> =>
    safeFetch<BackendProgram[]>('/v1/programs', 3600, []);

/** Single program by slug (1 hour ISR) */
export const fetchProgram = (slug: string): Promise<BackendProgram | null> =>
    safeFetch<BackendProgram | null>(`/v1/programs/${slug}`, 3600, null);

/** Articles list – page 1 used on public listing page (30 min) */
export const fetchArticles = (
    page = 1,
    perPage = 15
): Promise<{ data: BackendArticle[]; pagination: unknown }> =>
    safeFetch<{ data: BackendArticle[]; pagination: unknown }>(
        `/v1/articles?page=${page}&per_page=${perPage}`,
        1800,
        { data: [], pagination: {} }
    );

/** Single article by slug (30 min) */
export const fetchArticle = (slug: string): Promise<BackendArticle | null> =>
    safeFetch<BackendArticle | null>(`/v1/articles/${slug}`, 1800, null);

/** Facilities (1 hour) */
export const fetchFacilities = (): Promise<BackendFacility[]> =>
    safeFetch<BackendFacility[]>('/v1/facilities', 3600, []);

/** Gallery – no filter, public listing page (30 min) */
export const fetchGalleries = (): Promise<BackendGalleryImage[]> =>
    safeFetch<BackendGalleryImage[]>('/v1/galleries', 1800, []);

/** Testimonials (1 hour) */
export const fetchTestimonials = (): Promise<BackendTestimonial[]> =>
    safeFetch<BackendTestimonial[]>('/v1/content/testimonials', 3600, []);

/** Partners (1 hour) */
export const fetchPartners = (): Promise<BackendPartner[]> =>
    safeFetch<BackendPartner[]>('/v1/content/partners', 3600, []);

/** Team members (1 hour) */
export const fetchTeam = (roleType?: string): Promise<BackendTeamMember[]> => {
    const qs = roleType ? `?role_type=${roleType}` : '';
    return safeFetch<BackendTeamMember[]>(`/v1/content/team${qs}`, 3600, []);
};

/** Site settings (24 hours) */
export const fetchSettings = (): Promise<Partial<BackendSiteSettings>> =>
    safeFetch<Partial<BackendSiteSettings>>('/v1/content/settings', 86400, {});
