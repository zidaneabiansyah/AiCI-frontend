"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LikeButton from "@/components/LikeButton";
import BackToTop from "@/components/BackToTop";
import { notFound } from "next/navigation";
import { api, BackendProject } from "@/lib/api";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<BackendProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProject = async () => {
            try {
                const data = await api.projects.get(id);
                setProject(data);
            } catch (error) {
                console.error("Failed to fetch project:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProject();
    }, [id]);

    if (!isLoading && !project) {
        notFound();
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!project) return null;

    const projectImage = project.thumbnail || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1470&auto=format&fit=crop";
    const projectYear = new Date(project.created_at).getFullYear();
    const initials = (name: string) => name.split(' ').map(n => n[0]).join('');
    const studentName = project.student.full_name;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={projectImage}
                        alt={project.title}
                        fill
                        className="object-cover blur-[100px] opacity-20"
                        priority
                    />
                </div>
                
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        {/* Image Container */}
                        <div className="w-full lg:w-3/5">
                            <div className="relative aspect-16/10 rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white/50 backdrop-blur-sm">
                                <Image
                                    src={projectImage}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="w-full lg:w-2/5 space-y-8">
                            <div className="space-y-4">
                                <span className="inline-block bg-secondary/10 text-secondary text-sm font-bold px-5 py-2 rounded-full uppercase tracking-wider">
                                    {project.category_name}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight leading-tight">
                                    {project.title}
                                </h1>
                                <p className="text-primary/60 text-lg leading-relaxed">
                                    {project.description.substring(0, 150)}...
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <LikeButton initialLikes={project.likes_count} projectId={project.id} size="lg" />
                                <div className="h-10 w-px bg-gray-100" />
                                <div className="text-center">
                                    <p className="text-xs font-bold text-primary/30 uppercase tracking-widest">Year</p>
                                    <p className="text-lg font-bold text-primary">{projectYear}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-gray-100">
                                <h2 className="text-3xl font-bold text-primary mb-8 border-b border-gray-50 pb-6 uppercase tracking-tight">
                                    Project Description
                                </h2>
                                <div className="prose prose-lg max-w-none text-primary/70 leading-relaxed space-y-6">
                                    <p>{project.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Team Card */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
                                <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    Project Creator
                                </h3>
                                <div className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-sm group-hover:bg-secondary group-hover:text-white transition-colors">
                                        {initials(studentName)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-primary font-bold">{studentName}</span>
                                        <span className="text-primary/40 text-xs">Student Researcher</span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Card */}
                            <div className="bg-primary p-10 rounded-[3rem] shadow-xl text-white space-y-6 overflow-hidden relative group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <h3 className="text-xl font-bold relative z-10">Inspired by this project?</h3>
                                <p className="text-white/70 text-sm relative z-10">Start your own journey in AI and Robotics today with our specialized courses.</p>
                                <Link 
                                    href="https://aici-umg.com/" 
                                    className="block w-full bg-white text-primary font-bold py-4 rounded-full text-center hover:bg-secondary hover:text-white transition-all relative z-10"
                                >
                                    Join Our Program
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back Link */}
            <div className="py-12 text-center bg-gray-50/50">
                <Link href="/projects" className="inline-flex items-center gap-2 text-primary/40 font-bold hover:text-secondary transition-colors uppercase tracking-widest text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to all projects
                </Link>
            </div>

            <Footer />
            <BackToTop />
        </main>
    );
}
