"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
            <div className="w-full max-w-md">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block transform hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                <span className="text-white font-black text-2xl tracking-tighter">Ai</span>
                            </div>
                            <span className="text-2xl font-bold text-primary tracking-tight">Showcase<span className="text-secondary">.</span></span>
                        </div>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/5 p-10 md:p-12 border border-gray-100 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
                        <p className="text-primary/40 text-sm mb-8 font-medium">Please sign in to your admin account.</p>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-500 text-sm p-4 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-primary/40 uppercase tracking-widest ml-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-primary font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="relative z-10">{isLoading ? "Signing in..." : "Sign In"}</span>
                                {!isLoading && (
                                    <svg className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link href="/" className="text-primary/40 text-sm font-bold hover:text-secondary transition-colors uppercase tracking-widest">
                        Back to Website
                    </Link>
                </div>
            </div>
        </main>
    );
}
