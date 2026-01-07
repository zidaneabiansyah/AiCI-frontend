"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const menuItems = [
    { name: "Overview", href: "/admin", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    )},
    { name: "Projects", href: "/admin/projects", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
    )},
    { name: "Achievements", href: "/admin/achievements", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    )},
    { name: "Categories", href: "/admin/categories", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 11h.01M7 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01" />
        </svg>
    )},
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.auth.me();
                setUser(data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };
        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem("aici_token");
        localStorage.removeItem("aici_refresh");
        router.push("/admin/login");
    };

    return (
        <aside className="w-80 h-screen bg-white border-r border-gray-100 flex flex-col p-8 fixed left-0 top-0">
            {/* Logo Section */}
            <Link href="/" className="mb-12 block">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                        <span className="text-white font-black text-xl tracking-tighter">Ai</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold text-primary tracking-tight block leading-none">Showcase</span>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Dashboard</span>
                    </div>
                </div>
            </Link>

            {/* Menu Sections */}
            <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-4 ml-4">Main Navigation</p>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all duration-300 group ${
                                isActive 
                                ? "bg-primary text-white shadow-xl shadow-primary/10" 
                                : "text-primary/50 hover:bg-gray-50 hover:text-primary"
                            }`}
                        >
                            <span className={`${isActive ? "text-white" : "text-primary/40 group-hover:text-secondary"} transition-colors`}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            {/* User Profile & Logout */}
            <div className="mt-auto pt-8 border-t border-gray-50 space-y-4">
                <div className="flex items-center gap-4 px-2">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-secondary/10">
                        {user ? user.username.substring(0, 2).toUpperCase() : "AD"}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-primary font-bold text-sm truncate max-w-[140px]">{user ? user.username : "Administrator"}</span>
                        <span className="text-primary/40 text-[10px] font-bold uppercase tracking-wider">Super Admin</span>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all duration-300 group"
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
