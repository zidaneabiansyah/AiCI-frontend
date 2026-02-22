"use client";

import { useEffect, useState, useMemo } from "react";
import { api, BackendArticle } from "@/lib/api";
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalPrograms: 0,
        totalTestimonials: 0,
        totalPartners: 0,
        totalFacilities: 0,
        totalTeam: 0,
        totalGallery: 0,
        totalArticles: 0,
        totalPages: 0,
    });
    const [recentArticles, setRecentArticles] = useState<BackendArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [
                    programsData, testimonialsData, partnersData, facilitiesData,
                    teamData, galleryData, articlesData, pagesData
                ] = await Promise.all([
                    api.programs.list(),
                    api.content.testimonials(),
                    api.content.partners(),
                    api.content.facilities(),
                    api.content.team(),
                    api.content.gallery(),
                    api.content.articles(),
                    api.content.pageContent()
                ]);

                // Get recent articles
                const articles = articlesData.results || [];
                setRecentArticles(articles.slice(0, 5));
                
                setStats({
                    totalPrograms: programsData.data.length,
                    totalTestimonials: testimonialsData.results.length,
                    totalPartners: partnersData.results.length,
                    totalFacilities: facilitiesData.results.length,
                    totalTeam: teamData.results.length,
                    totalGallery: galleryData.results.length,
                    totalArticles: articles.length,
                    totalPages: (pagesData.data || []).length,
                });
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const chartData = useMemo(() => {
        if (!recentArticles.length) return { monthly: [], status: [] };

        // 1. Monthly Trends (last 6 months)
        const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
        const monthlyArticles: Record<string, number> = {};
        
        // Initialize last 6 months
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            monthlyArticles[`${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`] = 0;
        }

        // Fill data from articles
        recentArticles.forEach(a => {
            const d = new Date(a.created_at);
            const key = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
            if (monthlyArticles[key] !== undefined) {
                monthlyArticles[key]++;
            }
        });

        const monthly = Object.entries(monthlyArticles).map(([name, total]) => ({ name, total }));

        // 2. Content Status Distribution
        const published = recentArticles.filter(a => a.published_at).length;
        const draft = recentArticles.length - published;
        const status = [
            { name: 'Published', value: published },
            { name: 'Draft', value: draft }
        ];

        return { monthly, status };
    }, [recentArticles]);

    const COLORS = ['#255d74', '#ff4d30', '#fbbf24', '#10b981', '#6366f1', '#f472b6'];

    const statCards = [
        { 
            name: "Programs", 
            value: stats.totalPrograms, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ), 
            color: "bg-blue-500" 
        },
        { 
            name: "Testimonials", 
            value: stats.totalTestimonials, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ), 
            color: "bg-purple-500" 
        },
        { 
            name: "Partners", 
            value: stats.totalPartners, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ), 
            color: "bg-indigo-500" 
        },
        { 
            name: "Facilities", 
            value: stats.totalFacilities, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ), 
            color: "bg-sky-500" 
        },
        { 
            name: "Team Members", 
            value: stats.totalTeam, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
            ), 
            color: "bg-orange-500" 
        },
        { 
            name: "Gallery Images", 
            value: stats.totalGallery, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ), 
            color: "bg-pink-500" 
        },
        { 
            name: "Articles", 
            value: stats.totalArticles, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
            ), 
            color: "bg-teal-500" 
        },
        { 
            name: "Static Pages", 
            value: stats.totalPages, 
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ), 
            color: "bg-emerald-500" 
        },
    ];

    return (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {statCards.map((stat, i) => (
                    <div 
                        key={i} 
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                    >
                        <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-primary/40 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
                            {isLoading ? (
                                <Skeleton className="h-9 w-12 mt-1" />
                            ) : (
                                <h3 className="text-3xl font-black text-primary leading-none mt-1">{stat.value}</h3>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-primary">Article Trends</h3>
                        <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Last 6 Months</span>
                    </div>
                    <div className="h-75 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.monthly}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#255d74" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#255d74" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#255d74" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-primary">Content Status</h3>
                        <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Distribution</span>
                    </div>
                    <div className="h-75 w-full flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData.status}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.status.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-1/3 space-y-2">
                            {chartData.status.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-bold text-primary/60 truncate">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Articles Table */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-primary">Recent Articles</h3>
                        <Link href="/admin/articles" className="text-secondary text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Article</th>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Author</th>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(n => (
                                        <tr key={n}>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                                    <Skeleton className="h-4 w-32" />
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <Skeleton className="h-4 w-24" />
                                            </td>
                                            <td className="px-10 py-6">
                                                <Skeleton className="h-4 w-16 ml-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : recentArticles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    <img src={article.thumbnail} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-primary group-hover:text-secondary transition-colors truncate max-w-50">{article.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-primary/60 font-medium">{article.author}</span>
                                        </td>
                                        <td className="px-10 py-6 text-sm text-primary/40 font-bold">
                                            {new Date(article.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="space-y-8">
                    <div className="bg-primary rounded-[3rem] p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-lg font-bold mb-4 relative z-10">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <Link href="/admin/articles" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl flex flex-col gap-3 transition-all group/btn">
                                <div className="p-2 w-10 h-10 bg-white/10 rounded-xl group-hover/btn:bg-white/20 transition-colors">
                                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">New Article</span>
                            </Link>
                            <Link href="/admin/gallery" className="bg-white/10 hover:bg-white/20 p-6 rounded-2xl flex flex-col gap-3 transition-all group/btn">
                                <div className="p-2 w-10 h-10 bg-white/10 rounded-xl group-hover/btn:bg-white/20 transition-colors">
                                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Upload Images</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                        <h4 className="text-lg font-bold text-primary mb-6">System Status</h4>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-primary">API Backend</p>
                                    <p className="text-xs text-primary/40">Connected and healthy</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-primary">Database</p>
                                    <p className="text-xs text-primary/40">Syncing complete</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
