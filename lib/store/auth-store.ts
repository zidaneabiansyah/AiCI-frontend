/**
 * Authentication Store (Zustand)
 * Manages user authentication state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    _hasHydrated: boolean;
    setHasHydrated: (value: boolean) => void;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setHasHydrated: (value) => set({ _hasHydrated: value }),

            setAuth: (user, token) => {
                // Store token in localStorage for API calls
                if (typeof window !== 'undefined') {
                    localStorage.setItem('aici_token', token);
                }
                set({ user, token, isAuthenticated: true });
            },

            clearAuth: () => {
                // Remove token from localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('aici_token');
                    localStorage.removeItem('aici_refresh');
                }
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
        }),
        {
            name: 'aici-auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
