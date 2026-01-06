"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LikeButton from "@/components/LikeButton";
import BackToTop from "@/components/BackToTop";
import { notFound } from "next/navigation";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const project = projects.find((p) => p.id === id);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={project.image}
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
                                    src={project.image}
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
                                    {project.category}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight leading-tight">
                                    {project.title}
                                </h1>
                                <p className="text-primary/60 text-lg leading-relaxed">
                                    {project.shortDescription}
                                </p>
                            </div>

                            <div className="flex items-center gap-6 pt-4">
                                <LikeButton initialLikes={project.likes} projectId={project.id} size="lg" />
                                <div className="h-10 w-px bg-gray-100" />
                                <div className="text-center">
                                    <p className="text-xs font-bold text-primary/30 uppercase tracking-widest">Year</p>
                                    <p className="text-lg font-bold text-primary">{project.year}</p>
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
                                    <p>
                                        In this development phase, our team focused on creating a scalable architecture that allows for rapid integration of new features while maintaining high performance. The core technology stack includes React for the frontend and a robust AI processing layer on the backend.
                                    </p>
                                    <p>
                                        Future goals involve expanding the system to support real-time collaboration and enhancing the predictive modeling capabilities to provide even more accurate insights for our users.
                                    </p>
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
                                    Project Team
                                </h3>
                                <ul className="space-y-4">
                                    {project.team.map((member, index) => (
                                        <li key={index} className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs group-hover:bg-secondary group-hover:text-white transition-colors">
                                                {member.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-primary/70 font-medium">{member}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* CTA Card */}
                            <div className="bg-primary p-10 rounded-[3rem] shadow-xl text-white space-y-6 overflow-hidden relative group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                <h3 className="text-xl font-bold relative z-10">Inspired by this project?</h3>
                                <p className="text-white/70 text-sm relative z-10">Start your own journey in AI and Robotics today with our specialized courses.</p>
                                <Link 
                                    href="/programs" 
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
