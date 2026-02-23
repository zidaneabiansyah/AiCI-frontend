"use client";

/**
 * Login Page
 * User authentication page
 */

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/hooks/use-auth';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            remember: false,
        },
    });

    const onSubmit = (data: LoginFormData) => {
        login(data);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 relative bg-[#1e4a5f] items-center justify-center overflow-hidden border-r border-[#255d74]/10">
                <img 
                    src="https://aekheeeecxjeqwtpfwss.supabase.co/storage/v1/object/public/aici%20asset/alpa-mini.webp"
                    alt="AICI Login"
                    className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#0d2a38]/80 via-transparent to-transparent" />
                <div className="relative z-10 text-white p-12 max-w-xl text-center">
                    <h2 className="text-4xl font-bold mb-4 drop-shadow-md tracking-tight">Selamat Datang Kembali!</h2>
                    <p className="text-lg text-white/90 drop-shadow-sm font-medium leading-relaxed">
                        Mari lanjutkan perjalanan eksplorasi inovasi AI dan Robotika modern bersama Artificial Intelligence Center Indonesia.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 bg-linear-to-br from-[#eef2f5] via-white to-[#eef2f5] flex items-center justify-center p-6 relative">
                {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#255d74]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
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

                {/* Login Card */}
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#255d74] mb-2">Selamat Datang Kembali</h2>
                        <p className="text-[#255d74]/60">Masuk ke akun Anda untuk melanjutkan</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                        {/* Remember & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register('remember')}
                                    className="w-4 h-4 rounded border-gray-300 text-[#255d74] focus:ring-[#255d74]"
                                    disabled={isLoading}
                                />
                                <span className="text-sm text-[#255d74]/60">Ingat saya</span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-secondary hover:underline font-medium"
                            >
                                Lupa password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#255d74] text-white py-3 rounded-xl font-bold hover:bg-[#1e4a5f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#255d74]/20"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-8 text-center">
                        <p className="text-[#255d74]/60">
                            Belum punya akun?{' '}
                            <Link href="/register" className="text-secondary hover:underline font-bold">
                                Daftar sekarang
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
        </div>
    );
}
