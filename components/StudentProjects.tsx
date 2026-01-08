"use client";

import { useEffect, useState } from "react";
import { api, BackendProject } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "./Skeleton";

const StudentProjects = () => {
    const [projects, setProjects] = useState<BackendProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.projects.list();
                // Show only first 3 projects
                setProjects(data.results.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch featured projects:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <section className="py-16 md:py-24 px-6 bg-primary text-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Students Project</h2>
                <p className="text-base md:text-lg text-white/70 max-w-3xl mx-auto mb-12 md:mb-16 px-4">
                    Kumpulan proyek inovatif hasil karya peserta didik AiCi yang menggabungkan kreativitas dengan teknologi kecerdasan artifisial dan robotika untuk solusi masa depan.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-0">
                    {isLoading ? (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/5 rounded-4xl p-6 border border-white/10">
                                <Skeleton className="aspect-square rounded-2xl mb-6 bg-white/10" />
                                <Skeleton className="h-6 w-3/4 mx-auto rounded-full bg-white/10" />
                            </div>
                        ))
                    ) : (
                        projects.map((project) => (
                            <Link 
                                href={`/projects/${project.id}`} 
                                key={project.id} 
                                className="bg-white rounded-3xl md:rounded-4xl p-6 shadow-xl transition-all duration-500 hover:scale-105 hover:bg-gray-50 group block"
                            >
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-6 border border-gray-100">
                                    {project.thumbnail ? (
                                        <Image 
                                            src={project.thumbnail} 
                                            alt={project.title} 
                                            fill 
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#f8fcfd] opacity-50 flex items-center justify-center">
                                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                                <defs>
                                                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#255D74" strokeWidth="0.5" opacity="0.1" />
                                                    </pattern>
                                                </defs>
                                                <rect width="100%" height="100%" fill="url(#grid)" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-primary font-bold text-lg md:text-xl group-hover:text-secondary transition-colors">
                                    {project.title}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default StudentProjects;
