"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const data = await api.auth.login({ username, password });
            localStorage.setItem("aici_token", data.access);
            localStorage.setItem("aici_refresh", data.refresh);
            router.push("/admin");
        } catch (err: any) {
            setError(err.message || "Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-linear-to-br from-[#0B6282] via-[#0B6282] to-[#094d66] flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mt-48 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full -mr-48 -mb-48 blur-3xl" />
            
            <div className="w-full max-w-md relative z-10">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-center gap-3">
                            <img src="/icon/aici-logo-otak.png" alt="AICI Logo" className="w-16 h-16" />
                            <div className="text-left">
                                <span className="block text-3xl font-black text-white tracking-tight leading-none">AiCI</span>
                                <span className="block text-xs font-bold text-white/60 tracking-widest uppercase">Admin Portal</span>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl p-10 md:p-12 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-[#0B6282] mb-2">Welcome Back</h1>
                        <p className="text-gray-500 text-sm mb-8 font-medium">Sign in to access admin dashboard</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-[#0B6282] font-medium placeholder:text-gray-400"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-[#0B6282] font-medium placeholder:text-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-secondary text-white font-bold py-5 rounded-2xl shadow-xl shadow-secondary/20 hover:bg-[#e63c1e] transition-all flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10">{isLoading ? "Signing in..." : "Sign In"}</span>
                                {!isLoading && (
                                    <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-white/80 text-sm font-bold hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group">
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Website
                    </Link>
                </div>
            </div>
        </main>
    );
}
