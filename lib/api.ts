export interface BackendCategory {
    id: string;
    name: string;
    description: string;
}

export interface BackendStudent {
    id: string;
    full_name: string;
    angkatan: string;
    bio: string;
    photo: string | null;
}

export interface BackendProject {
    id: string;
    student?: BackendStudent;
    student_name?: string;
    category: string;
    category_name: string;
    title: string;
    description: string;
    thumbnail: string;
    likes_count: number;
    demo_url?: string;
    video_url?: string;
    created_at: string;
}

export interface BackendAchievement {
    id: string;
    title: string;
    description: string;
    image: string;
    date: string;
    category: 'Competition' | 'Recognition' | 'Partnership';
    link?: string;
}

// Content Types
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
                addRefreshSubscriber(async (token) => {
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
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/admin/enrollments${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/admin/enrollments/${id}`),
            approve: (id: string) => fetcher<any>(`/admin/enrollments/${id}/approve`, { method: 'POST' }),
            cancel: (id: string, reason: string) => fetcher<any>(`/admin/enrollments/${id}/cancel`, {
                method: 'POST',
                body: JSON.stringify({ cancellation_reason: reason }),
            }),
            export: (params?: string) => `${BASE_URL}/admin/enrollments/export${params ? `?${params}` : ''}`,
        },
        // Payments Management
        payments: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/admin/payments${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/admin/payments/${id}`),
            confirmManual: (id: string) => fetcher<any>(`/admin/payments/${id}/confirm`, { method: 'POST' }),
            export: (params?: string) => `${BASE_URL}/admin/payments/export${params ? `?${params}` : ''}`,
        },
        // Students Management
        students: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/admin/students${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/admin/students/${id}`),
            export: (params?: string) => `${BASE_URL}/admin/students/export${params ? `?${params}` : ''}`,
        },
        // Classes Management
        classes: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/admin/classes${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/admin/classes/${id}`),
            create: (data: FormData) => fetcher<any>('/admin/classes', { method: 'POST', body: data }),
            update: (id: string, data: FormData) => fetcher<any>(`/admin/classes/${id}`, { method: 'PATCH', body: data }),
            delete: (id: string) => fetcher<any>(`/admin/classes/${id}`, { method: 'DELETE' }),
        },
        // Placement Tests Management
        placementTests: {
            list: (params?: string) => fetcher<PaginatedResponse<any>>(`/admin/placement-tests${params ? `?${params}` : ''}`),
            get: (id: string) => fetcher<any>(`/admin/placement-tests/${id}`),
            create: (data: any) => fetcher<any>('/admin/placement-tests', { method: 'POST', body: JSON.stringify(data) }),
            update: (id: string, data: any) => fetcher<any>(`/admin/placement-tests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
            delete: (id: string) => fetcher<any>(`/admin/placement-tests/${id}`, { method: 'DELETE' }),
            // Questions
            questions: {
                list: (testId: string) => fetcher<any>(`/admin/placement-tests/${testId}/questions`),
                create: (testId: string, data: any) => fetcher<any>(`/admin/placement-tests/${testId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
                update: (testId: string, questionId: string, data: any) => fetcher<any>(`/admin/placement-tests/${testId}/questions/${questionId}`, { method: 'PATCH', body: JSON.stringify(data) }),
                delete: (testId: string, questionId: string) => fetcher<any>(`/admin/placement-tests/${testId}/questions/${questionId}`, { method: 'DELETE' }),
            },
            // Attempts & Results
            attempts: (params?: string) => fetcher<PaginatedResponse<any>>(`/admin/placement-tests/attempts${params ? `?${params}` : ''}`),
        },
    },
    projects: {
        list: (params?: string) => fetcher<PaginatedResponse<BackendProject>>(`/showcase/projects/${params ? `?${params}` : ''}`),
        get: (id: string) => fetcher<BackendProject>(`/showcase/projects/${id}/`),
        categories: () => fetcher<PaginatedResponse<BackendCategory>>('/showcase/categories/'),
        createCategory: (data: any) => fetcher<BackendCategory>('/showcase/categories/', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
        updateCategory: (id: string, data: any) => fetcher<BackendCategory>(`/showcase/categories/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),
        deleteCategory: (id: string) => fetcher<any>(`/showcase/categories/${id}/`, { method: 'DELETE' }),
        // Admin actions
        listAll: (params?: string) => fetcher<PaginatedResponse<BackendProject>>(`/showcase/projects/${params ? `?${params}` : ''}`),
        approve: (id: string) => fetcher<any>(`/showcase/projects/${id}/approve/`, { method: 'POST' }),
        reject: (id: string) => fetcher<any>(`/showcase/projects/${id}/reject/`, { method: 'POST' }),
        delete: (id: string) => fetcher<any>(`/showcase/projects/${id}/`, { method: 'DELETE' }),
        create: (data: FormData) => fetcher<BackendProject>('/showcase/projects/', {
            method: 'POST',
            body: data,
        }),
        update: (id: string, data: FormData) => fetcher<BackendProject>(`/showcase/projects/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
    },
    users: {
        listStudents: (params?: string) => fetcher<PaginatedResponse<BackendStudent>>(`/users/students/${params ? `?${params}` : ''}`),
    },
    achievements: {
        list: () => fetcher<PaginatedResponse<BackendAchievement>>('/achievements/'),
        create: (data: FormData) => fetcher<BackendAchievement>('/achievements/', {
            method: 'POST',
            body: data,
        }),
        update: (id: string, data: FormData) => fetcher<BackendAchievement>(`/achievements/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
        delete: (id: string) => fetcher<any>(`/achievements/${id}/`, { method: 'DELETE' }),
    },
    interactions: {
        like: (projectId: string) => fetcher<any>('/interactions/likes/', {
            method: 'POST',
            body: JSON.stringify({ project: projectId }),
        }),
    },
    auth: {
        login: (credentials: any) => fetcher<any>('/users/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),
        me: () => fetcher<any>('/users/me/'),
    },
    content: {
        // Programs
        programs: () => fetcher<PaginatedResponse<BackendProgram>>('/content/programs/'),
        reorderPrograms: (ids: string[]) => fetcher<any>('/content/programs/reorder/', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
        
        // Site Settings (Global)
        settings: () => fetcher<BackendSiteSettings>('/content/settings/'),
        
        // Page Content (Static Texts)
        pageContent: (key?: string) => fetcher<PaginatedResponse<BackendPageContent>>(`/content/pages/${key ? `?key=${key}` : ''}`),
        createPageContent: (data: FormData) => fetcher<BackendPageContent>('/content/pages/', {
            method: 'POST',
            body: data,
        }),
        updatePageContent: (key: string, data: FormData) => fetcher<BackendPageContent>(`/content/pages/${key}/`, {
            method: 'PATCH',
            body: data,
        }),
        
        // Testimonials
        testimonials: () => fetcher<PaginatedResponse<BackendTestimonial>>('/content/testimonials/'),
        createTestimonial: (data: FormData) => fetcher<BackendTestimonial>('/content/testimonials/', {
            method: 'POST',
            body: data,
        }),
        updateTestimonial: (id: string, data: FormData) => fetcher<BackendTestimonial>(`/content/testimonials/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
        reorderTestimonials: (ids: string[]) => fetcher<any>('/content/testimonials/reorder/', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
        deleteTestimonial: (id: string) => fetcher<any>(`/content/testimonials/${id}/`, { method: 'DELETE' }),
        
        // Partners
        partners: () => fetcher<PaginatedResponse<BackendPartner>>('/content/partners/'),
        createPartner: (data: FormData) => fetcher<BackendPartner>('/content/partners/', {
            method: 'POST',
            body: data,
        }),
        updatePartner: (id: string, data: FormData) => fetcher<BackendPartner>(`/content/partners/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
        reorderPartners: (ids: string[]) => fetcher<any>('/content/partners/reorder/', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
        deletePartner: (id: string) => fetcher<any>(`/content/partners/${id}/`, { method: 'DELETE' }),
        
        // Facilities
        facilities: (category?: string) => fetcher<PaginatedResponse<BackendFacility>>(`/content/facilities/${category ? `?category=${category}` : ''}`),
        createFacility: (data: FormData) => fetcher<BackendFacility>('/content/facilities/', {
            method: 'POST',
            body: data,
        }),
        updateFacility: (id: string, data: FormData) => fetcher<BackendFacility>(`/content/facilities/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
        reorderFacilities: (ids: string[]) => fetcher<any>('/content/facilities/reorder/', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
        deleteFacility: (id: string) => fetcher<any>(`/content/facilities/${id}/`, { method: 'DELETE' }),
        
        // Team
        team: (roleType?: string) => fetcher<PaginatedResponse<BackendTeamMember>>(`/content/team/${roleType ? `?role_type=${roleType}` : ''}`),
        createTeamMember: (data: FormData) => fetcher<BackendTeamMember>('/content/team/', {
            method: 'POST',
            body: data,
        }),
        updateTeamMember: (id: string, data: FormData) => fetcher<BackendTeamMember>(`/content/team/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
        reorderTeamMembers: (ids: string[]) => fetcher<any>('/content/team/reorder/', {
            method: 'POST',
            body: JSON.stringify({ ids }),
        }),
        deleteTeamMember: (id: string) => fetcher<any>(`/content/team/${id}/`, { method: 'DELETE' }),
        
        // Gallery
        gallery: (params?: string) => fetcher<PaginatedResponse<BackendGalleryImage>>(`/content/gallery/${params ? `?${params}` : ''}`),
        featuredGallery: () => fetcher<PaginatedResponse<BackendGalleryImage>>('/content/gallery/?is_featured=true'),
        createGalleryImage: (data: FormData) => fetcher<BackendGalleryImage>('/content/gallery/', {
            method: 'POST',
            body: data,
        }),
        updateGalleryImage: (id: string, data: FormData) => fetcher<BackendGalleryImage>(`/content/gallery/${id}/`, {
            method: 'PATCH',
            body: data,
        }),
        deleteGalleryImage: (id: string) => fetcher<any>(`/content/gallery/${id}/`, { method: 'DELETE' }),
        
        // Articles
        articles: (params?: string) => fetcher<PaginatedResponse<BackendArticle>>(`/content/articles/${params ? `?${params}` : ''}`),
        articleBySlug: (slug: string) => fetcher<BackendArticle>(`/content/articles/${slug}/`),
        createArticle: (data: FormData) => fetcher<BackendArticle>('/content/articles/', {
            method: 'POST',
            body: data,
        }),
        updateArticle: (slug: string, data: FormData) => fetcher<BackendArticle>(`/content/articles/${slug}/`, {
            method: 'PATCH',
            body: data,
        }),
        deleteArticle: (slug: string) => fetcher<any>(`/content/articles/${slug}/`, { method: 'DELETE' }),
        
        // Contact
        sendContact: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
            fetcher<any>('/content/contact/', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    },
};
