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
    student: BackendStudent;
    category: string;
    category_name: string;
    title: string;
    description: string;
    thumbnail: string;
    likes_count: number;
    github_url?: string;
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

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aici_token') : null;
    
    const headers: HeadersInit = {
        ...options?.headers,
    };

    // Only set Content-Type to JSON if body is not FormData
    if (!(options?.body instanceof FormData)) {
        (headers as any)['Content-Type'] = 'application/json';
    }

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || 'API request failed');
    }

    // Handle 204 No Content
    if (res.status === 204) {
        return {} as T;
    }

    return res.json();
}

// Specific API calls
export const api = {
    projects: {
        list: (params?: string) => fetcher<PaginatedResponse<BackendProject>>(`/showcase/projects/${params ? `?${params}` : ''}`),
        get: (id: string) => fetcher<BackendProject>(`/showcase/projects/${id}/`),
        categories: () => fetcher<PaginatedResponse<BackendCategory>>('/showcase/categories/'),
        // Admin actions
        listAll: (params?: string) => fetcher<PaginatedResponse<BackendProject>>(`/showcase/projects/${params ? `?${params}` : ''}`),
        approve: (id: string) => fetcher<any>(`/showcase/projects/${id}/approve/`, { method: 'POST' }),
        reject: (id: string) => fetcher<any>(`/showcase/projects/${id}/reject/`, { method: 'POST' }),
        delete: (id: string) => fetcher<any>(`/showcase/projects/${id}/`, { method: 'DELETE' }),
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
};
