"use client";

/**
 * Dashboard Layout
 * Protected layout for authenticated users
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import { Home, FileText, BookOpen, CreditCard, User, LogOut, Menu, X, Loader2, BarChart3 } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard',   href: '/dashboard',            icon: Home       },
    { name: 'Analitik',    href: '/dashboard/analytics',  icon: BarChart3  },
    { name: 'Test Saya',   href: '/dashboard/tests',      icon: FileText   },
    { name: 'Pendaftaran', href: '/dashboard/enrollments', icon: BookOpen  },
    { name: 'Pembayaran',  href: '/dashboard/payments',   icon: CreditCard },
    { name: 'Profil',      href: '/dashboard/profile',    icon: User       },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout, isLoading } = useAuth();
    const _hasHydrated = useAuthStore((s) => s._hasHydrated);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!_hasHydrated) return;
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [_hasHydrated, isAuthenticated, isLoading, router]);

    if (!_hasHydrated || isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#eef2f5]">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white rounded-xl shadow-lg text-[#255d74]"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="p-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <img src="/icon/aici-logo-otak.png" alt="AICI" className="w-10 h-10" />
                        <div>
                            <h1 className="text-xl font-bold text-[#255d74]">AICI</h1>
                            <p className="text-xs text-[#255d74]/60 font-bold uppercase tracking-wider">Dashboard</p>
                        </div>
                    </Link>

                    {/* User Info */}
                    <div className="mb-8 p-4 bg-[#255d74]/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#255d74] rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#255d74] truncate">{user?.name}</p>
                                <p className="text-xs text-[#255d74]/60 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu */}
                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive
                                            ? 'bg-[#255d74] text-white shadow-lg shadow-[#255d74]/20'
                                            : 'text-[#255d74]/60 hover:bg-[#255d74]/5 hover:text-[#255d74]'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <button
                        onClick={() => logout()}
                        className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-80 min-h-screen">
                <div className="p-6 lg:p-12">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}
        </div>
    );
}
