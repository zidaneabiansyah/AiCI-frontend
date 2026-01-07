"use client";

import { useEffect, useState } from "react";
import { api, BackendProject, BackendAchievement } from "@/lib/api";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        pendingProjects: 0,
        totalLikes: 0,
        totalAchievements: 0
    });
    const [recentProjects, setRecentProjects] = useState<BackendProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [projectsData, achievementsData] = await Promise.all([
                    api.projects.list(),
                    api.achievements.list()
                ]);

                // Basic stats calculation (In a real app, backend would provide a dashboard endpoint)
                const projects = projectsData.results;
                setRecentProjects(projects.slice(0, 5));
                
                setStats({
                    totalProjects: projectsData.count,
                    pendingProjects: projects.filter((p: any) => p.status === 'PENDING').length,
                    totalLikes: projects.reduce((acc: number, curr: any) => acc + (curr.likes_count || 0), 0),
                    totalAchievements: achievementsData.count
                });
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const statCards = [
        { name: "Total Projects", value: stats.totalProjects, icon: "📁", color: "bg-blue-500" },
        { name: "Pending Approval", value: stats.pendingProjects, icon: "⏳", color: "bg-amber-500" },
        { name: "Total Likes", value: stats.totalLikes, icon: "❤️", color: "bg-rose-500" },
        { name: "Achievements", value: stats.totalAchievements, icon: "🏆", color: "bg-emerald-500" },
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
                        <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-primary/40 text-[10px] font-bold uppercase tracking-widest">{stat.name}</p>
                            <h3 className="text-3xl font-black text-primary leading-none mt-1">{isLoading ? "..." : stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Recent Projects Table */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-primary">Recent Submissions</h3>
                        <Link href="/admin/projects" className="text-secondary text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Project</th>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Student</th>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-5 text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em]">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    [1, 2, 3].map(n => (
                                        <tr key={n}>
                                            <td colSpan={4} className="px-10 py-6 animate-pulse">
                                                <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                                            </td>
                                        </tr>
                                    ))
                                ) : recentProjects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                                    <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className="font-bold text-primary group-hover:text-secondary transition-colors truncate max-w-[200px]">{project.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-primary/60 font-medium">{project.student.full_name}</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${(project as any).status === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                                                {(project as any).status || 'APPROVED'}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 text-sm text-primary/40 font-bold">
                                            {new Date(project.created_at).toLocaleDateString()}
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
                            <Link href="/admin/achievements/new" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col gap-2 transition-all">
                                <span className="text-2xl">✨</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Add Achievement</span>
                            </Link>
                            <Link href="/admin/categories" className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col gap-2 transition-all">
                                <span className="text-2xl">📁</span>
                                <span className="text-xs font-bold uppercase tracking-wider">New Category</span>
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
