"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ClipboardCheck, ClipboardList, LogOut, Menu, X, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/lib/store/auth-store";

const menuItems = [
    { name: "Dashboard", href: "/tutor", icon: LayoutDashboard },
    { name: "Absensi", href: "/tutor/attendance", icon: ClipboardCheck },
    { name: "Grades", href: "/tutor/grades", icon: ClipboardList },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const hasHydrated = useAuthStore((state) => state._hasHydrated);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!hasHydrated) return;
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }
        if (isAuthenticated && user?.role && user.role !== "tutor") {
            router.push("/dashboard");
        }
    }, [hasHydrated, isLoading, isAuthenticated, user?.role, router]);

    if (!hasHydrated || isLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#eef2f5] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#255d74]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#eef2f5]">
            <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white rounded-xl shadow-lg text-[#255d74]"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-100 z-40 transition-transform duration-300 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 mb-12">
                        <img src="/icon/aici-logo-otak.png" alt="AICI" className="w-10 h-10" />
                        <div>
                            <h1 className="text-xl font-bold text-[#255d74]">AICI</h1>
                            <p className="text-xs text-[#255d74]/60 font-bold uppercase tracking-wider">
                                Tutor Dashboard
                            </p>
                        </div>
                    </Link>

                    <div className="mb-8 p-4 bg-[#255d74]/5 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#255d74] rounded-full flex items-center justify-center text-white font-bold">
                                {user?.name?.charAt(0).toUpperCase() || "T"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#255d74] truncate">{user?.name || "Tutor"}</p>
                                <p className="text-xs text-[#255d74]/60 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                                        isActive
                                            ? "bg-[#255d74] text-white shadow-lg shadow-[#255d74]/20"
                                            : "text-[#255d74]/60 hover:bg-[#255d74]/5 hover:text-[#255d74]"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <button
                        onClick={() => logout()}
                        className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Keluar
                    </button>
                </div>
            </aside>

            <main className="lg:ml-80 min-h-screen">
                <div className="p-6 lg:p-12">{children}</div>
            </main>

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}
        </div>
    );
}
