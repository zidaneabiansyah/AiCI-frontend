"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const menuItems = [
    // Main Section
    { name: "Overview", href: "/admin", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ), section: "main" },
    { name: "Analytics", href: "/admin/analytics", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ), section: "main" },
    { name: "Reports", href: "/admin/reports", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ), section: "main" },
    // Content Management
    { name: "Programs", href: "/admin/programs", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ), section: "content" },
    { name: "Testimonials", href: "/admin/testimonials", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
    ), section: "content" },
    { name: "Partners", href: "/admin/partners", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ), section: "content" },
    { name: "Facilities", href: "/admin/facilities", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ), section: "content" },
    { name: "Team", href: "/admin/team", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
    ), section: "content" },
    { name: "Gallery", href: "/admin/gallery", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ), section: "content" },
    { name: "Articles", href: "/admin/articles", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    ), section: "content" },
    { name: "Site Settings", href: "/admin/settings", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ), section: "content" },
    { name: "Page Content", href: "/admin/page-content", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ), section: "content" },
    // Student Management
    { name: "Enrollments", href: "/admin/enrollments", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ), section: "student" },
    { name: "Payments", href: "/admin/payments", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ), section: "student" },
    { name: "Students", href: "/admin/students", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    ), section: "student" },
    { name: "Classes", href: "/admin/classes", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    ), section: "student" },
    { name: "Schedules", href: "/admin/schedules", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ), section: "student" },
    { name: "Placement Tests", href: "/admin/placement-tests", icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ), section: "student" },
];

interface AdminSidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.auth.me();
                setUser(data);
            } catch (err: any) {
                console.error("Failed to fetch user:", err);
                // If we get a 401 even after the fetcher's refresh attempt, logout
                if (err.message === "API request failed" || err.message?.includes("401")) {
                    // Only redirect if we're not already on the login page
                    if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
                        logout();
                    }
                }
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
        <aside className={`h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-40 transition-all duration-500 ease-in-out ${
            isOpen ? "w-80 p-8" : "w-24 p-6"
        }`}>
            {/* Top Branding & Toggle */}
            <div className={`mb-12 flex ${isOpen ? "items-center justify-between" : "flex-col items-center gap-6"} transition-all duration-500`}>
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center shrink-0">
                            <img src="/icon/aici-logo-otak.png" alt="AiCi Logo" className="w-full h-full object-contain" />
                        </div>
                        {isOpen && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                                <span className="text-xl font-bold text-primary tracking-tight block leading-none">Admin</span>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Dashboard</span>
                            </div>
                        )}
                    </div>
                </Link>

                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-primary/40 hover:text-secondary hover:bg-gray-50 transition-all group`}
                    title={isOpen ? "Collapse Menu" : "Expand Menu"}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Menu Sections */}
            <div className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-2 -mr-2 scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-200">
                {/* Main Navigation */}
                <p className={`text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-4 transition-all duration-300 ${isOpen ? "ml-4 opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                    Main Navigation
                </p>
                {menuItems.filter(item => item.section === "main").map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            title={!isOpen ? item.name : ""}
                            className={`flex items-center rounded-2xl font-bold transition-all duration-300 group ${
                                isOpen ? "gap-4 px-4 py-4" : "justify-center p-4"
                            } ${
                                isActive 
                                ? "bg-primary text-white shadow-xl shadow-primary/10" 
                                : "text-primary/50 hover:bg-gray-50 hover:text-primary"
                            }`}
                        >
                            <span className={`${isActive ? "text-white" : "text-primary/40 group-hover:text-secondary"} transition-colors shrink-0`}>
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Content Management */}
                <p className={`text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-4 mt-8 transition-all duration-300 ${isOpen ? "ml-4 opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                    Content Management
                </p>
                {menuItems.filter(item => item.section === "content").map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            title={!isOpen ? item.name : ""}
                            className={`flex items-center rounded-2xl font-bold transition-all duration-300 group ${
                                isOpen ? "gap-4 px-4 py-4" : "justify-center p-4"
                            } ${
                                isActive 
                                ? "bg-primary text-white shadow-xl shadow-primary/10" 
                                : "text-primary/50 hover:bg-gray-50 hover:text-primary"
                            }`}
                        >
                            <span className={`${isActive ? "text-white" : "text-primary/40 group-hover:text-secondary"} transition-colors shrink-0`}>
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}

                {/* Student Management */}
                <p className={`text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-4 mt-8 transition-all duration-300 ${isOpen ? "ml-4 opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
                    Student Management
                </p>
                {menuItems.filter(item => item.section === "student").map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            title={!isOpen ? item.name : ""}
                            className={`flex items-center rounded-2xl font-bold transition-all duration-300 group ${
                                isOpen ? "gap-4 px-4 py-4" : "justify-center p-4"
                            } ${
                                isActive 
                                ? "bg-primary text-white shadow-xl shadow-primary/10" 
                                : "text-primary/50 hover:bg-gray-50 hover:text-primary"
                            }`}
                        >
                            <span className={`${isActive ? "text-white" : "text-primary/40 group-hover:text-secondary"} transition-colors shrink-0`}>
                                {item.icon}
                            </span>
                            {isOpen && (
                                <span className="truncate animate-in fade-in slide-in-from-left-2 duration-300">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* User Profile & Logout */}
            <div className={`mt-auto pt-8 border-t border-gray-50 space-y-4 ${!isOpen && "flex flex-col items-center"}`}>
                <div className={`flex items-center transition-all ${isOpen ? "gap-4 px-2" : "justify-center"}`}>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-secondary/10 shrink-0">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : "AD"}
                    </div>
                    {isOpen && (
                        <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                            <span className="text-primary font-bold text-sm truncate max-w-35">{user?.name || "Administrator"}</span>
                            <span className="text-primary/40 text-[10px] font-bold uppercase tracking-wider">Super Admin</span>
                        </div>
                    )}
                </div>
                <button 
                    onClick={logout}
                    title={!isOpen ? "Sign Out" : ""}
                    className={`flex items-center rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all duration-300 group ${
                        isOpen ? "w-full gap-4 px-4 py-4" : "justify-center p-4 w-12 h-12"
                    }`}
                >
                    <svg className={`w-5 h-5 transition-transform group-hover:-translate-x-1 shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {isOpen && <span className="animate-in fade-in slide-in-from-left-2 duration-300">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
