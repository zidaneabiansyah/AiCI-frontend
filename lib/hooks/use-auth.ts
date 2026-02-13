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
            setAuth(response.data.user, response.data.token);
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
            setAuth(response.data.user, response.data.token);
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
            router.push('/login');
        },
        onError: () => {
            // Even if API fails, clear local auth
            clearAuth();
            queryClient.clear();
            router.push('/login');
        },
    });

    // Fetch current user
    const { data: currentUser, isLoading: isLoadingUser } = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => authApi.me(),
        enabled: isAuthenticated && !!token,
        retry: false,
        staleTime: Infinity,
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
