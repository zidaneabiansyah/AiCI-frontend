"use client";

/**
 * Register Page
 * User registration page
 */

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
    message: 'Password tidak cocok',
    path: ['password_confirmation'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { register: registerUser, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = (data: RegisterFormData) => {
        registerUser(data);
    };

    return (
        <div className="min-h-screen flex text-[#255d74]">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 bg-linear-to-br from-[#eef2f5] via-white to-[#eef2f5] flex items-center justify-center p-6 relative">
                {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#255d74]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <img src="/icon/aici-logo-otak.png" alt="AICI Logo" className="w-12 h-12" />
                        <div>
                            <h1 className="text-2xl font-bold text-[#255d74]">AICI</h1>
                            <p className="text-xs text-[#255d74]/60 font-bold uppercase tracking-wider">Student Portal</p>
                        </div>
                    </div>
                </Link>

                {/* Register Card */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#255d74] mb-2">Daftar Akun Baru</h2>
                        <p className="text-[#255d74]/60">Mulai perjalanan belajar AI & Robotika Anda</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-bold text-[#255d74]/80 mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                type="text"
                                {...register('name')}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${errors.name
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-200 focus:border-[#255d74]'
                                    }`}
                                placeholder="John Doe"
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-500">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-bold text-[#255d74]/80 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none ${errors.email
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-200 focus:border-[#255d74]'
                                    }`}
                                placeholder="nama@email.com"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-bold text-[#255d74]/80 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none pr-12 ${errors.password
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-[#255d74]'
                                        }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#255d74]/40 hover:text-[#255d74] transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-bold text-[#255d74]/80 mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('password_confirmation')}
                                    className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none pr-12 ${errors.password_confirmation
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-[#255d74]'
                                        }`}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#255d74]/40 hover:text-[#255d74] transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="mt-2 text-sm text-red-500">{errors.password_confirmation.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-[#e63c1e] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-secondary/20 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Daftar Sekarang
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center">
                        <p className="text-[#255d74]/60">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-[#255d74] hover:underline font-bold">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-6 text-center">
                    <Link href="/" className="text-sm text-[#255d74]/60 hover:text-[#255d74] transition-colors">
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex w-1/2 relative bg-[#1e4a5f] items-center justify-center overflow-hidden border-l border-[#255d74]/10">
                <img 
                    src="https://aekheeeecxjeqwtpfwss.supabase.co/storage/v1/object/public/aici%20asset/leanbot.webp"
                    alt="AICI Register"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0d2a38]/80 via-transparent to-transparent" />
                <div className="relative z-10 text-white p-12 max-w-xl text-center">
                    <h2 className="text-4xl font-bold mb-4 drop-shadow-md tracking-tight">Mulai Perjalanan Anda</h2>
                    <p className="text-lg text-white/90 drop-shadow-sm font-medium leading-relaxed">
                        Bergabunglah dengan AICI dan persiapkan diri Anda bersama program-program unggulan kami untuk menyongsong masa depan teknologi digital.
                    </p>
                </div>
            </div>
        </div>
    );
}
