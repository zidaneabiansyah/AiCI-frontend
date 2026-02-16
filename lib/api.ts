// Laravel Backend Types
export interface BackendTestimonial {
    id: string;
    name: string;
    role: string;
    quote: string;
    photo: string | null;
    order: number;
}

export interface BackendPartner {
    id: string;
    name: string;
    logo: string;
    website_url: string | null;
    order: number;
}

export interface BackendFacility {
    id: string;
    category: 'RUANGAN' | 'MODUL' | 'MEDIA_KIT' | 'ROBOT';
    category_display: string;
    title: string;
    description: string;
    image: string;
    order: number;
}

export interface BackendTeamMember {
    id: string;
    name: string;
    position: string;
    role_type: 'OPERASIONAL' | 'TUTOR';
    role_type_display: string;
    photo: string;
    order: number;
}

export interface BackendGalleryImage {
    id: string;
    title: string;
    image: string;
    category: string;
    category_display: string;
    description: string;
    date_taken: string | null;
    is_featured: boolean;
}

export interface BackendArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    thumbnail: string;
    author: string;
    published_at: string | null;
    created_at: string;
}

export interface BackendProgram {
    id: string;
    title: string;
    description: string;
    image: string;
    order: number;
}

export interface BackendSiteSettings {
    id: string;
    site_name: string;
    address: string;
    email: string;
    phone: string;
    whatsapp: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;
    facebook_url: string;
}

export interface BackendPageContent {
    key: string;
    title: string;
    content: string;
    image: string | null;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const PUBLIC_ENDPOINTS = [
    '/showcase/projects/',
    '/showcase/categories/',
    '/achievements/',
    '/content/testimonials/',
    '/content/partners/',
    '/content/facilities/',
    '/content/team/',
    '/content/gallery/',
    '/content/articles/',
    '/content/programs/',
    '/content/settings/',
    '/content/pages/',
];

function isPublicEndpoint(endpoint: string): boolean {
    return PUBLIC_ENDPOINTS.some(p => endpoint.startsWith(p));
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const getHeaders = (withAuth = true) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('aici_token') : null;
        const headers: HeadersInit = {
            ...options?.headers,
        };

        if (!(options?.body instanceof FormData)) {
            (headers as any)['Content-Type'] = 'application/json';
        }

        if (token && withAuth) {
            (headers as any)['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    };

    const attemptFetch = async (withAuth = true): Promise<Response> => {
        return fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: getHeaders(withAuth),
        });
    };

    let res = await attemptFetch();

    if (res.status === 401) {
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('aici_refresh') : null;

        if (refreshToken && !isRefreshing) {
            isRefreshing = true;
            try {
                const refreshRes = await fetch(`${BASE_URL}/users/token/refresh/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh: refreshToken }),
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    localStorage.setItem('aici_token', data.access);
                    isRefreshing = false;
                    onTokenRefreshed(data.access);
                    res = await attemptFetch();
                } else {
                    throw new Error("Refresh failed");
                }
            } catch (err) {
                isRefreshing = false;
                localStorage.removeItem('aici_token');
                localStorage.removeItem('aici_refresh');

                // If public, try one last time without auth
                if (isPublicEndpoint(endpoint) && options?.method === 'GET' || !options?.method) {
                    res = await attemptFetch(false);
                } else if (typeof window !== 'undefined' && !endpoint.includes('/users/login/')) {
                    window.location.href = '/admin/login';
                }
            }
        } else if (isRefreshing) {
            // Wait for existing refresh
            return new Promise((resolve) => {
                addRefreshSubscriber(async () => {
                    resolve(await (await attemptFetch()).json());
                });
            }) as any;
        } else {
            // No refresh token or already failed
            if (isPublicEndpoint(endpoint) && (options?.method === 'GET' || !options?.method)) {
                res = await attemptFetch(false);
            } else if (typeof window !== 'undefined' && !endpoint.includes('/users/login/')) {
                window.location.href = '/admin/login';
            }
        }
    }

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        const errorMessage = error.detail || error.message || 'API request failed';
        const err = new Error(errorMessage) as any;
        err.status = res.status;
        err.data = error;
        throw err;
    }

    if (res.status === 204) {
        return {} as T;
    }

    return res.json();
}


// Placement Test API
export const placementTestApi = {
    list: () => fetcher<{ data: any[] }>('/v1/placement-tests'),
    show: (slug: string) => fetcher<{ data: any }>(`/v1/placement-tests/${slug}`),
    start: (testId: string, data: any) => fetcher<{ data: { attempt_id: string } }>(`/v1/placement-tests/${testId}/start`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getAttempt: (attemptId: string) => fetcher<{ data: any }>(`/v1/placement-tests/attempt/${attemptId}`),
    submitAnswer: (attemptId: string, data: any) => fetcher<{ data: any }>(`/v1/placement-tests/attempt/${attemptId}/answer`, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    complete: (attemptId: string) => fetcher<{ data: { attempt_id: string } }>(`/v1/placement-tests/attempt/${attemptId}/complete`, {
        method: 'POST',
    }),
    getResult: (attemptId: string) => fetcher<{ data: any }>(`/v1/placement-tests/result/${attemptId}`),
    downloadResult: (attemptId: string) => `${BASE_URL}/v1/placement-tests/result/${attemptId}/download`,
};

// Classes API
export const classesApi = {
    list: (params?: string) => fetcher<{ data: any[] }>(`/v1/classes${params ? `?${params}` : ''}`),
    show: (slug: string) => fetcher<{ data: any }>(`/v1/classes/${slug}`),
};

// Enrollments API
export const enrollmentsApi = {
    list: (params?: string) => fetcher<{ data: any[] }>(`/v1/enrollments${params ? `?${params}` : ''}`),
    create: (classId: string) => fetcher<{ data: any }>(`/v1/enrollments/create/${classId}`),
    store: (data: any) => fetcher<{ data: { enrollment_id: string } }>('/v1/enrollments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    show: (enrollmentId: string) => fetcher<{ data: any }>(`/v1/enrollments/${enrollmentId}`),
    cancel: (enrollmentId: string, reason: string) => fetcher<{ data: any }>(`/v1/enrollments/${enrollmentId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ cancellation_reason: reason }),
    }),
};

// Payments API
export const paymentsApi = {
    create: (enrollmentId: string) => fetcher<{ data: { payment_id: string; xendit_invoice_url: string } }>(`/v1/payments/create/${enrollmentId}`, {
        method: 'POST',
    }),
    show: (paymentId: string) => fetcher<{ data: any }>(`/v1/payments/${paymentId}`),
    checkStatus: (paymentId: string) => fetcher<{ data: any }>(`/v1/payments/${paymentId}/check`),
    downloadReceipt: (paymentId: string) => `${BASE_URL}/v1/payments/${paymentId}/receipt`,
};

// Auth API (Sanctum)
export const authApi = {
    register: (data: any) => fetcher<{ data: any }>('/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    login: (credentials: any) => fetcher<{ data: { user: any; token: string } }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    logout: () => fetcher<{ data: any }>('/v1/auth/logout', {
        method: 'POST',
    }),
    me: () => fetcher<{ data: any }>('/v1/user'),
    forgotPassword: (data: any) => fetcher<{ data: any }>('/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    resetPassword: (data: any) => fetcher<{ data: any }>('/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};

export const api = {
    // Admin Management APIs
    admin: {
        // Enrollments Management
        enrollments: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/enrollments${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/v1/admin/enrollments/${id}`),
            approve: (id: string) => fetcher<any>(`/v1/admin/enrollments/${id}/approve`, { method: 'POST' }),
            cancel: (id: string, reason: string) => fetcher<any>(`/v1/admin/enrollments/${id}/cancel`, {
                method: 'POST',
                body: JSON.stringify({ cancellation_reason: reason }),
            }),
            export: (params?: string) => `${BASE_URL}/v1/admin/enrollments/export${params ? `?${params}` : ''}`,
        },
        // Payments Management
        payments: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/payments${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/v1/admin/payments/${id}`),
            confirmManual: (id: string) => fetcher<any>(`/v1/admin/payments/${id}/confirm`, { method: 'POST' }),
            export: (params?: string) => `${BASE_URL}/v1/admin/payments/export${params ? `?${params}` : ''}`,
        },
        // Students Management
        students: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/students${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/v1/admin/students/${id}`),
            export: (params?: string) => `${BASE_URL}/v1/admin/students/export${params ? `?${params}` : ''}`,
        },
        // Classes Management
        classes: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/classes${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/v1/admin/classes/${id}`),
            create: (data: FormData) => fetcher<any>('/v1/admin/classes', { method: 'POST', body: data }),
            update: (id: string, data: FormData) => fetcher<any>(`/v1/admin/classes/${id}`, { method: 'PATCH', body: data }),
            delete: (id: string) => fetcher<any>(`/v1/admin/classes/${id}`, { method: 'DELETE' }),
        },
        // Placement Tests Management
        placementTests: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/placement-tests${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/v1/admin/placement-tests/${id}`),
            create: (data: any) => fetcher<any>('/v1/admin/placement-tests', { method: 'POST', body: JSON.stringify(data) }),
            update: (id: string, data: any) => fetcher<any>(`/v1/admin/placement-tests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
            delete: (id: string) => fetcher<any>(`/v1/admin/placement-tests/${id}`, { method: 'DELETE' }),
            // Questions
            questions: {
                list: (testId: string) => fetcher<any>(`/v1/admin/placement-tests/${testId}/questions`),
                create: (testId: string, data: any) => fetcher<any>(`/v1/admin/placement-tests/${testId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
                update: (testId: string, questionId: string, data: any) => fetcher<any>(`/v1/admin/placement-tests/${testId}/questions/${questionId}`, { method: 'PATCH', body: JSON.stringify(data) }),
                delete: (testId: string, questionId: string) => fetcher<any>(`/v1/admin/placement-tests/${testId}/questions/${questionId}`, { method: 'DELETE' }),
            },
            // Attempts & Results
            attempts: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/placement-tests/attempts${params ? `?${params}` : ''}`),
        },
        // Schedules Management
        schedules: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/v1/admin/schedules${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/v1/admin/schedules/${id}`),
            create: (data: any) => fetcher<any>('/v1/admin/schedules', { method: 'POST', body: JSON.stringify(data) }),
            update: (id: string, data: any) => fetcher<any>(`/v1/admin/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
            delete: (id: string) => fetcher<any>(`/v1/admin/schedules/${id}`, { method: 'DELETE' }),
        },
        // Analytics
        analytics: {
            overview: (dateRange?: string) => fetcher<any>(`/v1/admin/analytics/overview${dateRange ? `?range=${dateRange}` : ''}`),
            revenue: (params?: string) => fetcher<any>(`/v1/admin/analytics/revenue${params ? `?${params}` : ''}`),
            enrollments: (params?: string) => fetcher<any>(`/v1/admin/analytics/enrollments${params ? `?${params}` : ''}`),
            students: (params?: string) => fetcher<any>(`/v1/admin/analytics/students${params ? `?${params}` : ''}`),
            tests: (params?: string) => fetcher<any>(`/v1/admin/analytics/tests${params ? `?${params}` : ''}`),
        },
        // Reports
        reports: {
            summary: (params?: string) => fetcher<any>(`/v1/admin/reports/summary${params ? `?${params}` : ''}`),
            exportRevenue: (params?: string) => `${BASE_URL}/v1/admin/reports/export/revenue${params ? `?${params}` : ''}`,
            exportEnrollment: (params?: string) => `${BASE_URL}/v1/admin/reports/export/enrollment${params ? `?${params}` : ''}`,
            exportStudent: (params?: string) => `${BASE_URL}/v1/admin/reports/export/student${params ? `?${params}` : ''}`,
        },
    },
    // Public Content APIs (Laravel endpoints with /v1 prefix)
    programs: {
        list: (params?: string) => fetcher<{ data: BackendProgram[] }>(`/v1/programs${params ? `?${params}` : ''}`),
        show: (slug: string) => fetcher<{ data: BackendProgram }>(`/v1/programs/${slug}`),
    },
    facilities: {
        list: (params?: string) => fetcher<{ data: BackendFacility[] }>(`/v1/facilities${params ? `?${params}` : ''}`),
        show: (id: string) => fetcher<{ data: BackendFacility }>(`/v1/facilities/${id}`),
    },
    galleries: {
        list: (params?: string) => fetcher<{ data: BackendGalleryImage[] }>(`/v1/galleries${params ? `?${params}` : ''}`),
        show: (id: string) => fetcher<{ data: BackendGalleryImage }>(`/v1/galleries/${id}`),
    },
    articles: {
        list: (params?: string) => fetcher<{ data: BackendArticle[] }>(`/v1/articles${params ? `?${params}` : ''}`),
        show: (slug: string) => fetcher<{ data: BackendArticle }>(`/v1/articles/${slug}`),
    },

    // Content Management APIs
    content: {
        // Testimonials
        testimonials: () => fetcher<{
            count: number; success: boolean; results: BackendTestimonial[]
        }>('/v1/content/testimonials'),
        createTestimonial: (data: FormData) => fetcher<any>('/v1/admin/content/testimonials', { method: 'POST', body: data }),
        updateTestimonial: (id: string, data: FormData) => fetcher<any>(`/v1/admin/content/testimonials/${id}`, { method: 'PATCH', body: data }),
        reorderTestimonials: (ids: string[]) => fetcher<any>('/v1/admin/content/testimonials/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
        deleteTestimonial: (id: string) => fetcher<any>(`/v1/admin/content/testimonials/${id}`, { method: 'DELETE' }),

        // Partners
        partners: () => fetcher<{
            count: number; success: boolean; results: BackendPartner[]
        }>('/v1/content/partners'),
        createPartner: (data: FormData) => fetcher<any>('/v1/admin/content/partners', { method: 'POST', body: data }),
        updatePartner: (id: string, data: FormData) => fetcher<any>(`/v1/admin/content/partners/${id}`, { method: 'PATCH', body: data }),
        reorderPartners: (ids: string[]) => fetcher<any>('/v1/admin/content/partners/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
        deletePartner: (id: string) => fetcher<any>(`/v1/admin/content/partners/${id}`, { method: 'DELETE' }),

        // Settings
        settings: () => fetcher<BackendSiteSettings>('/v1/content/settings'),
        updateSettings: (data: any) => fetcher<any>('/v1/admin/content/settings', { method: 'PATCH', body: JSON.stringify(data) }),

        // Team
        team: (roleType?: string) => fetcher<{
            count: number; success: boolean; results: BackendTeamMember[]
        }>(`/v1/content/team${roleType ? `?role_type=${roleType}` : ''}`),
        createTeamMember: (data: FormData) => fetcher<any>('/v1/admin/content/team', { method: 'POST', body: data }),
        updateTeamMember: (id: string, data: FormData) => fetcher<any>(`/v1/admin/content/team/${id}`, { method: 'PATCH', body: data }),
        reorderTeamMembers: (ids: string[]) => fetcher<any>('/v1/admin/content/team/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
        deleteTeamMember: (id: string) => fetcher<any>(`/v1/admin/content/team/${id}`, { method: 'DELETE' }),

        // Page Content
        pageContent: (key?: string) => fetcher<any>(`/v1/content/pages${key ? `?key=${key}` : ''}`),
        createPageContent: (data: FormData) => fetcher<any>('/v1/admin/content/pages', { method: 'POST', body: data }),
        updatePageContent: (key: string, data: FormData) => fetcher<any>(`/v1/admin/content/pages/${key}`, { method: 'PATCH', body: data }),

        // Gallery
        gallery: (params?: string) => fetcher<{
            count: number; success: boolean; results: BackendGalleryImage[]
        }>(`/v1/admin/gallery${params ? `?${params}` : ''}`),
        featuredGallery: () => fetcher<{ data: BackendGalleryImage[] }>('/v1/galleries?is_featured=true'),
        createGalleryImage: (data: FormData) => fetcher<any>('/v1/admin/gallery', { method: 'POST', body: data }),
        updateGalleryImage: (id: string, data: FormData) => fetcher<any>(`/v1/admin/gallery/${id}`, { method: 'PATCH', body: data }),
        deleteGalleryImage: (id: string) => fetcher<any>(`/v1/admin/gallery/${id}`, { method: 'DELETE' }),

        // Articles
        articles: (params?: string) => fetcher<{ success: boolean; count: number; next: string | null; previous: string | null; results: BackendArticle[] }>(`/v1/admin/articles${params ? `?${params}` : ''}`),
        articleBySlug: (slug: string) => fetcher<{ data: BackendArticle }>(`/v1/articles/${slug}`),
        createArticle: (data: FormData) => fetcher<any>('/v1/admin/articles', { method: 'POST', body: data }),
        updateArticle: (slug: string, data: FormData) => fetcher<any>(`/v1/admin/articles/${slug}`, { method: 'PATCH', body: data }),
        deleteArticle: (slug: string) => fetcher<any>(`/v1/admin/articles/${slug}`, { method: 'DELETE' }),

        // Facilities
        facilities: (category?: string) => fetcher<{
            count: number; success: boolean; results: BackendFacility[]
        }>(`/v1/admin/facilities${category ? `?category=${category}` : ''}`),
        createFacility: (data: FormData) => fetcher<any>('/v1/admin/facilities', { method: 'POST', body: data }),
        updateFacility: (id: string, data: FormData) => fetcher<any>(`/v1/admin/facilities/${id}`, { method: 'PATCH', body: data }),
        reorderFacilities: (ids: string[]) => fetcher<any>('/v1/admin/facilities/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),
        deleteFacility: (id: string) => fetcher<any>(`/v1/admin/facilities/${id}`, { method: 'DELETE' }),

        // Programs
        programs: () => fetcher<{
            count: number; success: boolean; results: BackendProgram[]
        }>('/v1/admin/programs'),
        createProgram: (data: FormData) => fetcher<any>('/v1/admin/programs', { method: 'POST', body: data }),
        updateProgram: (id: string, data: FormData) => fetcher<any>(`/v1/admin/programs/${id}`, { method: 'PATCH', body: data }),
        deleteProgram: (id: string) => fetcher<any>(`/v1/admin/programs/${id}`, { method: 'DELETE' }),
        reorderPrograms: (ids: string[]) => fetcher<any>('/v1/admin/programs/reorder', { method: 'POST', body: JSON.stringify({ ids }) }),

        // Contact
        sendContact: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
            fetcher<any>('/v1/content/contact', { method: 'POST', body: JSON.stringify(data) }),
    },
    auth: {
        login: (credentials: any) => fetcher<{ access: string; refresh: string }>('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),
        me: () => fetcher<any>('/v1/user'),
        refresh: (refresh: string) => fetcher<{ access: string }>('/v1/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh }),
        }),
    },
}
