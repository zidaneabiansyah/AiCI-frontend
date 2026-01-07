"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Skip check for login page itself
        if (pathname === "/admin/login") {
            setIsChecking(false);
            return;
        }

        const token = localStorage.getItem("aici_token");
        if (!token) {
            router.push("/admin/login");
        } else {
            setIsChecking(false);
        }
    }, [pathname, router]);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Don't render sidebar/layout for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <AdminSidebar />
            <div className="ml-80">
                {/* Admin Header / Topbar */}
                <header className="h-24 px-12 flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-30">
                    <h2 className="text-2xl font-bold text-primary tracking-tight">
                        {pathname === "/admin" ? "Overview" : 
                         pathname.includes("/projects") ? "Manage Projects" :
                         pathname.includes("/achievements") ? "Manage Achievements" :
                         pathname.includes("/categories") ? "Categories" : "Admin Console"}
                    </h2>
                    <div className="flex items-center gap-6">
                        <button className="relative w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-primary/40 hover:text-secondary hover:border-secondary transition-all group">
                            <span className="absolute top-3 right-3 w-2 h-2 bg-secondary rounded-full border-2 border-white" />
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-12 pt-4">
                    {children}
                </main>
            </div>
        </div>
    );
}
