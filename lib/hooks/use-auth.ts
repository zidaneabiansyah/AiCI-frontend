/**
 * Authentication Hook
 * Provides auth state and methods
 */

import { useAuthStore } from '@/lib/store/auth-store';
import { authApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import type { LoginCredentials, RegisterData, User } from '@/lib/types/auth';

function asRecord(value: unknown): Record<string, unknown> | null {
    if (typeof value !== 'object' || value === null) return null;
    return value as Record<string, unknown>;
}

function extractAuthData(response: unknown): Record<string, unknown> {
    const root = asRecord(response);
    const nested = asRecord(root?.data);
    return nested ?? {};
}

function normalizeRole(role: unknown): User['role'] {
    if (role === 'admin' || role === 'student' || role === 'tutor') {
        return role;
    }
    return 'student';
}

function resolveUserPayload(payload: unknown): User | null {
    const candidate = asRecord(payload);
    if (!candidate) return null;

    const nested = asRecord(candidate.data);
    const userRecord = nested ?? candidate;

    const idValue = userRecord.id;
    const nameValue = userRecord.name;
    const emailValue = userRecord.email;

    if ((typeof idValue !== 'string' && typeof idValue !== 'number') || typeof nameValue !== 'string' || typeof emailValue !== 'string') {
        return null;
    }

    const createdAt = userRecord.created_at;
    const updatedAt = userRecord.updated_at;
    const emailVerifiedAt = userRecord.email_verified_at;

    return {
        id: String(idValue),
        name: nameValue,
        email: emailValue,
        role: normalizeRole(userRecord.role),
        email_verified_at: typeof emailVerifiedAt === 'string' ? emailVerifiedAt : null,
        created_at: typeof createdAt === 'string' ? createdAt : '',
        updated_at: typeof updatedAt === 'string' ? updatedAt : '',
    };
}

function extractToken(authData: Record<string, unknown>): string | null {
    const candidates = ['token', 'access', 'access_token'] as const;
    for (const key of candidates) {
        const value = authData[key];
        if (typeof value === 'string' && value.trim() !== '') {
            return value;
        }
    }
    return null;
}

function extractRefreshToken(authData: Record<string, unknown>): string | null {
    const value = authData.refresh;
    return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    const record = asRecord(error);
    const message = record?.message;
    return typeof message === 'string' && message ? message : fallback;
}

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, token, isAuthenticated, isHydrated, setAuth, clearAuth, updateUser } = useAuthStore();
    const safeToken = token && token !== 'undefined' && token !== 'null' ? token : null;
    const hasSession = isHydrated && isAuthenticated && !!safeToken;
    const shouldFetchCurrentUser = hasSession && !user;

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (response) => {
            const token = (response.data.access_token || response.data.token) as string;
            setAuth(response.data.user, token);
            toast.success('Login berhasil!');
            router.replace('/dashboard');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Login gagal. Periksa email dan password Anda.'));
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: (data: RegisterData) => authApi.register(data),
        onSuccess: (response) => {
            const token = (response.data.access_token || response.data.token) as string;
            setAuth(response.data.user, token);
            toast.success('Registrasi berhasil! Selamat datang!');
            router.replace('/dashboard');
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, 'Registrasi gagal. Silakan coba lagi.'));
        },
    });

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            toast.success('Logout berhasil!');
            router.push('/');
        },
        onError: () => {
            clearAuth();
            queryClient.clear();
            router.push('/');
        },
    });

    // Fetch current user to keep session alive and get the latest profile data
    const { data: currentUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => authApi.me(),
        enabled: shouldFetchCurrentUser,
        retry: false,
        staleTime: Infinity,
        throwOnError: false,
    });

    useEffect(() => {
        const profile = resolveUserPayload(currentUser);
        if (profile) {
            updateUser(profile);
        }
    }, [currentUser, updateUser]);

    const resolvedCurrentUser = resolveUserPayload(currentUser);

    return {
        user: resolvedCurrentUser || user,
        token: safeToken,
        isHydrated,
        isAuthenticated: hasSession,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
    };
}
