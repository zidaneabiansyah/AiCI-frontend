/**
 * Authentication Hook
 * Provides auth state and methods
 */

import { useAuthStore } from '@/lib/store/auth-store';
import { authApi } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { LoginCredentials, RegisterData } from '@/lib/types/auth';

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
        onSuccess: (response) => {
            const token = (response.data.access_token || response.data.token) as string;
            setAuth(response.data.user, token);
            toast.success('Login berhasil!');
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Login gagal. Periksa email dan password Anda.');
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: (data: RegisterData) => authApi.register(data),
        onSuccess: (response) => {
            const token = (response.data.access_token || response.data.token) as string;
            setAuth(response.data.user, token);
            toast.success('Registrasi berhasil! Selamat datang!');
            router.push('/dashboard');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Registrasi gagal. Silakan coba lagi.');
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
        enabled: isAuthenticated && !!token,
        retry: false,
        staleTime: Infinity,
        throwOnError: false,
    });

    return {
        user: currentUser?.data || user,
        token,
        isAuthenticated,
        isLoading: loginMutation.isPending || registerMutation.isPending || isLoadingUser,
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        logout: logoutMutation.mutate,
    };
}
